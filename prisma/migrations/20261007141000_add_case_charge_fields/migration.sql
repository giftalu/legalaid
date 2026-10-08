ALTER TABLE "Case"
ADD COLUMN "assignedFee" DECIMAL(12,2),
ADD COLUMN "feeDescription" TEXT,
ADD COLUMN "feeAssignedAt" TIMESTAMP(3);
