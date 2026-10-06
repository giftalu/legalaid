import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const officer = await requireUser("OFFICER");

    if (!officer) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status");
    const caseType = searchParams.get("caseType");
    const district = searchParams.get("district");
    const format = searchParams.get("format");

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (caseType && caseType !== "ALL") {
      where.caseType = caseType;
    }

    if (district && district !== "ALL") {
      where.applicantDistrict = district;
    }

    if (from || to) {
      const createdAt: Record<string, Date> = {};

      if (from) {
        createdAt.gte = new Date(`${from}T00:00:00`);
      }

      if (to) {
        createdAt.lte = new Date(`${to}T23:59:59.999`);
      }

      where.createdAt = createdAt;
    }

    // --------------------------------------------------
    // GET CASES
    // --------------------------------------------------

    const cases = await db.case.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // --------------------------------------------------
    // GET PAYMENTS SEPARATELY
    // --------------------------------------------------

    const caseIds = cases.map((item) => item.id);

    const payments =
      caseIds.length > 0
        ? await db.payment.findMany({
            where: {
              caseId: {
                in: caseIds,
              },
            },
            select: {
              id: true,
              caseId: true,
              amount: true,
              status: true,
            },
          })
        : [];

    // --------------------------------------------------
    // GROUP PAYMENTS BY CASE
    // --------------------------------------------------

    const paymentsByCase = new Map<
      number,
      typeof payments
    >();

    for (const payment of payments) {
      const existing =
        paymentsByCase.get(payment.caseId) || [];

      existing.push(payment);

      paymentsByCase.set(
        payment.caseId,
        existing
      );
    }

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    const summary = {
      total: cases.length,

      pending: 0,
      approved: 0,
      rejected: 0,
      inReview: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,

      totalPayments: 0,
      paidPayments: 0,
      outstandingPayments: 0,
    };

    const byCaseType: Record<string, number> = {};
    const byDistrict: Record<string, number> = {};

    // --------------------------------------------------
    // BUILD REPORT ROWS
    // --------------------------------------------------

    const rows = cases.map((item) => {
      // Status counts

      if (item.status === "PENDING") {
        summary.pending++;
      }

      if (item.status === "APPROVED") {
        summary.approved++;
      }

      if (item.status === "REJECTED") {
        summary.rejected++;
      }

      if (item.status === "IN_REVIEW") {
        summary.inReview++;
      }

      if (item.status === "ASSIGNED") {
        summary.assigned++;
      }

      if (item.status === "IN_PROGRESS") {
        summary.inProgress++;
      }

      if (item.status === "RESOLVED") {
        summary.resolved++;
      }

      if (item.status === "CLOSED") {
        summary.closed++;
      }

      // Case type

      byCaseType[item.caseType] =
        (byCaseType[item.caseType] || 0) + 1;

      // District

      const districtName =
        item.applicantDistrict || "Not specified";

      byDistrict[districtName] =
        (byDistrict[districtName] || 0) + 1;

      // Payments belonging to this case

      const casePayments =
        paymentsByCase.get(item.id) || [];

      let totalPayment = 0;
      let paidPayment = 0;
      let outstandingPayment = 0;

      for (const payment of casePayments) {
        const amount = Number(payment.amount);

        totalPayment += amount;

        if (payment.status === "PAID") {
          paidPayment += amount;
        }

        if (
          payment.status === "PENDING" ||
          payment.status === "PROCESSING"
        ) {
          outstandingPayment += amount;
        }
      }

      summary.totalPayments += totalPayment;
      summary.paidPayments += paidPayment;
      summary.outstandingPayments +=
        outstandingPayment;

      return {
        id: item.id,

        caseNumber: item.caseNumber,

        applicant: item.applicantFullName,

        respondent: item.respondentName,

        caseType: item.caseType,

        district: districtName,

        status: item.status,

        createdAt: item.createdAt,

        officer:
          item.reviewedBy?.name ||
          "Not assigned",

        totalPayment,

        paidPayment,

        outstandingPayment,

        email: item.user.email,
      };
    });

    // --------------------------------------------------
    // CSV EXPORT
    // --------------------------------------------------

    if (format === "csv") {
      const headers = [
        "Case Number",
        "Applicant",
        "Respondent",
        "Case Type",
        "District",
        "Status",
        "Created At",
        "Officer",
        "Total Payment",
        "Paid Payment",
        "Outstanding Payment",
        "Client Email",
      ];

      const csvRows = rows.map((row) =>
        [
          row.caseNumber,
          row.applicant,
          row.respondent,
          row.caseType,
          row.district,
          row.status,
          row.createdAt.toISOString(),
          row.officer,
          row.totalPayment.toFixed(2),
          row.paidPayment.toFixed(2),
          row.outstandingPayment.toFixed(2),
          row.email,
        ]
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      );

      const csv = [
        headers.join(","),
        ...csvRows,
      ].join("\n");

      return new NextResponse(csv, {
        status: 200,

        headers: {
          "Content-Type":
            "text/csv; charset=utf-8",

          "Content-Disposition":
            `attachment; filename="legal-aid-report-${new Date()
              .toISOString()
              .slice(0, 10)}.csv"`,
        },
      });
    }

    // --------------------------------------------------
    // JSON REPORT
    // --------------------------------------------------

    return NextResponse.json({
      filters: {
        from,
        to,
        status,
        caseType,
        district,
      },

      summary,

      byCaseType,

      byDistrict,

      cases: rows,
    });
  } catch (error) {
    console.error(
      "REPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate report",
      },
      {
        status: 500,
      }
    );
  }
}