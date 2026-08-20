-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('NOT_SCHEDULED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CaseStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "CaseStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "CaseStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "CaseStatus" ADD VALUE 'RESOLVED';
ALTER TYPE "CaseStatus" ADD VALUE 'CLOSED';
