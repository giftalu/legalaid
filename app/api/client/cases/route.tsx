import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

function generateCaseNumber() {
  const year = new Date().getFullYear();

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `LAB-${year}-${random}`;
}

function optionalString(value: unknown) {
  const result = String(value ?? "").trim();
  return result || null;
}

function optionalNumber(value: unknown) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

export async function POST(request: NextRequest) {
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
    // REQUIRED FIELDS
    // ============================================

    const caseType = String(
      body.caseType ?? ""
    ).trim();

    const description = String(
      body.description ?? ""
    ).trim();

    const applicantFullName = String(
      body.applicantFullName ?? ""
    ).trim();

    const respondentName = String(
      body.respondentName ?? ""
    ).trim();

    if (!caseType) {
      return NextResponse.json(
        { error: "Case type is required." },
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

    if (!applicantFullName) {
      return NextResponse.json(
        {
          error:
            "Applicant name is required.",
        },
        { status: 400 }
      );
    }

    if (!respondentName) {
      return NextResponse.json(
        {
          error:
            "Respondent name is required.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // CASE NUMBER
    // ============================================

    let caseNumber = generateCaseNumber();

    while (
      await db.case.findUnique({
        where: { caseNumber },
        select: { id: true },
      })
    ) {
      caseNumber = generateCaseNumber();
    }

    // ============================================
    // CREATE CASE
    // ============================================

    const newCase = await db.case.create({
      data: {
        caseNumber,

        userId: user.id,

        // Applicant
        applicantFullName,
        applicantNationalId:
          optionalString(
            body.applicantNationalId
          ),
        applicantPhone:
          optionalString(
            body.applicantPhone
          ),
        applicantEmail:
          optionalString(
            body.applicantEmail
          ),
        applicantAddress:
          optionalString(
            body.applicantAddress
          ),
        applicantDistrict:
          optionalString(
            body.applicantDistrict
          ),
        applicantTraditionalAuthority:
          optionalString(
            body.applicantTraditionalAuthority
          ),
        applicantVillage:
          optionalString(
            body.applicantVillage
          ),
        applicantOccupation:
          optionalString(
            body.applicantOccupation
          ),

        // Respondent
        respondentName,
        respondentPhone:
          optionalString(
            body.respondentPhone
          ),
        respondentAddress:
          optionalString(
            body.respondentAddress
          ),
        respondentRelationship:
          optionalString(
            body.respondentRelationship
          ),

        // Complaint
        caseType,
        description,
        incidentLocation:
          optionalString(
            body.incidentLocation
          ),

        complaintDate: body.complaintDate
          ? new Date(body.complaintDate)
          : null,

        // Legal aid
        legalAidReason:
          optionalString(
            body.legalAidReason
          ),

        previousLegalAssistance:
          Boolean(
            body.previousLegalAssistance
          ),

        previousLegalAssistanceDetails:
          optionalString(
            body.previousLegalAssistanceDetails
          ),

        // Financial
        employmentStatus:
          optionalString(
            body.employmentStatus
          ),

        occupation:
          optionalString(
            body.occupation
          ),

        monthlyIncome:
          optionalNumber(
            body.monthlyIncome
          ),

        otherIncome:
          optionalNumber(
            body.otherIncome
          ),

        numberOfDependants:
          body.numberOfDependants !== ""
            ? Number(
                body.numberOfDependants
              )
            : null,

        financialCircumstances:
          optionalString(
            body.financialCircumstances
          ),

        // Documents
        nationalIdUrl:
          optionalString(
            body.nationalIdUrl
          ),

        nationalIdFileName:
          optionalString(
            body.nationalIdFileName
          ),

        recommendationUrl:
          optionalString(
            body.recommendationUrl
          ),

        recommendationFileName:
          optionalString(
            body.recommendationFileName
          ),
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
          "Failed to create case. Please try again.",
      },
      { status: 500 }
    );
  }
}