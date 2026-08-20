-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "consultationAt" TIMESTAMP(3),
ADD COLUMN     "consultationStatus" "ConsultationStatus" NOT NULL DEFAULT 'NOT_SCHEDULED';
