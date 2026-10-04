import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

function optionalString(value: unknown): string | null {
  const result = String(value ?? "").trim();
  return result || null;
}

function optionalDate(value: unknown): Date | null {
  const result = String(value ?? "").trim();

  if (!result) return null;

  const date = new Date(result);

  return Number.isNaN(date.getTime()) ? null : date;
}

function optionalDecimal(value: unknown): number | null {
  const result = String(value ?? "").trim();

  if (!result) return null;

  const number = Number(result);

  return Number.isFinite(number) ? number : null;
}

function optionalInt(value: unknown): number | null {
  const result = String(value ?? "").trim();

  if (!result) return null;

  const number = Number(result);

  return Number.isInteger(number) ? number : null;
}

export async function POST(request: Request) {
  try {
    const user = await requireUser("CLIENT");

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // ============================================
    // APPLICANT
    // ============================================

    const applicantFullName = String(
      body.applicantFullName ?? ""
    ).trim();

    const applicantNationalId =
      optionalString(body.applicantNationalId);

    const applicantPhone =
      optionalString(body.applicantPhone);

    const applicantEmail =
      optionalString(body.applicantEmail);

    const applicantAddress =
      optionalString(body.applicantAddress);

    const applicantDistrict =
      optionalString(body.applicantDistrict);

    const applicantTraditionalAuthority =
      optionalString(body.applicantTraditionalAuthority);

    const applicantVillage =
      optionalString(body.applicantVillage);

    const applicantOccupation =
      optionalString(body.applicantOccupation);

    // ============================================
    // RESPONDENT
    // ============================================

    const respondentName = String(
      body.respondentName ?? ""
    ).trim();

    const respondentPhone =
      optionalString(body.respondentPhone);

    const respondentAddress =
      optionalString(body.respondentAddress);

    const respondentRelationship =
      optionalString(body.respondentRelationship);

    // ============================================
    // COMPLAINT
    // ============================================

    const caseType = String(
      body.caseType ?? ""
    ).trim();

    const complaintDate =
      optionalDate(body.complaintDate);

    const incidentLocation =
      optionalString(body.incidentLocation);

    const description = String(
      body.description ?? ""
    ).trim();

    // ============================================
    // LEGAL AID
    // ============================================

    const legalAidReason =
      optionalString(body.legalAidReason);

    const previousLegalAssistance =
      Boolean(body.previousLegalAssistance);

    const previousLegalAssistanceDetails =
      optionalString(
        body.previousLegalAssistanceDetails
      );

    // ============================================
    // FINANCIAL
    // ============================================

    const employmentStatus =
      optionalString(body.employmentStatus);

    const occupation =
      optionalString(body.occupation);

    const monthlyIncome =
      optionalDecimal(body.monthlyIncome);

    const otherIncome =
      optionalDecimal(body.otherIncome);

    const numberOfDependants =
      optionalInt(body.numberOfDependants);

    const financialCircumstances =
      optionalString(body.financialCircumstances);

    // ============================================
    // DOCUMENTS
    // ============================================

    const nationalIdUrl = String(
      body.nationalIdUrl ?? ""
    ).trim();

    const nationalIdFileName =
      optionalString(body.nationalIdFileName);

    const recommendationUrl = String(
      body.recommendationUrl ?? ""
    ).trim();

    const recommendationFileName =
      optionalString(body.recommendationFileName);

    // ============================================
    // VALIDATION
    // ============================================

    if (!applicantFullName) {
      return NextResponse.json(
        {
          error:
            "Applicant full name is required.",
        },
        { status: 400 }
      );
    }

    if (!respondentName) {
      return NextResponse.json(
        {
          error: "Respondent name is required.",
        },
        { status: 400 }
      );
    }

    if (!caseType) {
      return NextResponse.json(
        {
          error: "Case type is required.",
        },
        { status: 400 }
      );
    }

    if (description.length < 20) {
      return NextResponse.json(
        {
          error:
            "Case description must be at least 20 characters.",
        },
        { status: 400 }
      );
    }

    if (!nationalIdUrl) {
      return NextResponse.json(
        {
          error: "National ID is required.",
        },
        { status: 400 }
      );
    }

    if (!recommendationUrl) {
      return NextResponse.json(
        {
          error:
            "Recommendation letter is required.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // CASE NUMBER
    // ============================================

    const caseNumber = `LAB-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-6)}`;

    // ============================================
    // CREATE CASE
    // ============================================

    const newCase = await db.case.create({
      data: {
        caseNumber,
        userId: user.id,

        // Applicant
        applicantFullName,
        applicantNationalId,
        applicantPhone,
        applicantEmail,
        applicantAddress,
        applicantDistrict,
        applicantTraditionalAuthority,
        applicantVillage,
        applicantOccupation,

        // Respondent
        respondentName,
        respondentPhone,
        respondentAddress,
        respondentRelationship,

        // Complaint
        caseType,
        complaintDate,
        incidentLocation,
        description,

        // Legal aid
        legalAidReason,
        previousLegalAssistance,
        previousLegalAssistanceDetails,

        // Financial
        employmentStatus,
        occupation,
        monthlyIncome,
        otherIncome,
        numberOfDependants,
        financialCircumstances,

        // Documents
        nationalIdUrl,
        nationalIdFileName,
        recommendationUrl,
        recommendationFileName,

        // Status
        status: "PENDING",
        consultationStatus: "NOT_SCHEDULED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        case: newCase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE CASE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create case.",
      },
      { status: 500 }
    );
  }
}
