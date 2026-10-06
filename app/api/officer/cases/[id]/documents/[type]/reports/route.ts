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

    const where: any = {};

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
      where.createdAt = {};

      if (from) {
        where.createdAt.gte = new Date(`${from}T00:00:00`);
      }

      if (to) {
        where.createdAt.lte = new Date(`${to}T23:59:59.999`);
      }
    }

    const cases = await db.case.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        payments: true,

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

    const totalCases = cases.length;

    const pendingCases = cases.filter(
      (c) => c.status === "PENDING"
    ).length;

    const approvedCases = cases.filter(
      (c) => c.status === "APPROVED"
    ).length;

    const rejectedCases = cases.filter(
      (c) => c.status === "REJECTED"
    ).length;

    const inReviewCases = cases.filter(
      (c) => c.status === "IN_REVIEW"
    ).length;

    const assignedCases = cases.filter(
      (c) => c.status === "ASSIGNED"
    ).length;

    const inProgressCases = cases.filter(
      (c) => c.status === "IN_PROGRESS"
    ).length;

    const resolvedCases = cases.filter(
      (c) => c.status === "RESOLVED"
    ).length;

    const closedCases = cases.filter(
      (c) => c.status === "CLOSED"
    ).length;

    let totalPayments = 0;
    let paidPayments = 0;
    let pendingPayments = 0;
    let failedPayments = 0;

    const caseRows = cases.map((c) => {
      const paid = c.payments
        .filter((p) => p.status === "PAID")
        .reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );

      const pending = c.payments
        .filter(
          (p) =>
            p.status === "PENDING" ||
            p.status === "PROCESSING"
        )
        .reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );

      const failed = c.payments
        .filter(
          (p) =>
            p.status === "FAILED" ||
            p.status === "CANCELLED"
        )
        .reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );

      const total = c.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      totalPayments += total;
      paidPayments += paid;
      pendingPayments += pending;
      failedPayments += failed;

      return {
        id: c.id,
        caseNumber: c.caseNumber,

        applicant: c.applicantFullName,
        respondent: c.respondentName,

        caseType: c.caseType,
        district: c.applicantDistrict || "",

        status: c.status,

        createdAt: c.createdAt,

        officer:
          c.reviewedBy?.name || "",

        totalPayment: total,
        paidPayment: paid,
        outstandingPayment: pending,

        userEmail: c.user.email,
      };
    });

    const byCaseType: Record<
      string,
      number
    > = {};

    const byDistrict: Record<
      string,
      number
    > = {};

    for (const c of cases) {
      byCaseType[c.caseType] =
        (byCaseType[c.caseType] || 0) + 1;

      const d =
        c.applicantDistrict || "Not specified";

      byDistrict[d] =
        (byDistrict[d] || 0) + 1;
    }

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

      const csvRows = caseRows.map((row) =>
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
          row.userEmail,
        ]
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
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

    return NextResponse.json({
      filters: {
        from,
        to,
        status,
        caseType,
        district,
      },

      summary: {
        totalCases,

        pendingCases,
        approvedCases,
        rejectedCases,

        inReviewCases,
        assignedCases,
        inProgressCases,

        resolvedCases,
        closedCases,

        totalPayments,
        paidPayments,
        pendingPayments,
        failedPayments,
      },

      byCaseType,
      byDistrict,

      cases: caseRows,
    });
  } catch (error) {
    console.error("REPORT GENERATION ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to generate report",
      },
      {
        status: 500,
      }
    );
  }
}