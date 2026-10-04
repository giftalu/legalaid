-- Add applicant details
ALTER TABLE "Case"
ADD COLUMN "applicantFullName" TEXT,
ADD COLUMN "applicantNationalId" TEXT,
ADD COLUMN "applicantPhone" TEXT,
ADD COLUMN "applicantEmail" TEXT,
ADD COLUMN "applicantAddress" TEXT,
ADD COLUMN "applicantDistrict" TEXT,
ADD COLUMN "applicantTraditionalAuthority" TEXT,
ADD COLUMN "applicantVillage" TEXT,
ADD COLUMN "applicantOccupation" TEXT;

-- Add respondent details
ALTER TABLE "Case"
ADD COLUMN "respondentName" TEXT,
ADD COLUMN "respondentPhone" TEXT,
ADD COLUMN "respondentAddress" TEXT,
ADD COLUMN "respondentRelationship" TEXT;

-- Add complaint details
ALTER TABLE "Case"
ADD COLUMN "complaintDate" TIMESTAMP(3),
ADD COLUMN "incidentLocation" TEXT;

-- Add legal aid details
ALTER TABLE "Case"
ADD COLUMN "legalAidReason" TEXT,
ADD COLUMN "previousLegalAssistance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "previousLegalAssistanceDetails" TEXT;

-- Add financial information
ALTER TABLE "Case"
ADD COLUMN "employmentStatus" TEXT,
ADD COLUMN "occupation" TEXT,
ADD COLUMN "monthlyIncome" DECIMAL(12,2),
ADD COLUMN "otherIncome" DECIMAL(12,2),
ADD COLUMN "numberOfDependants" INTEGER,
ADD COLUMN "financialCircumstances" TEXT;
