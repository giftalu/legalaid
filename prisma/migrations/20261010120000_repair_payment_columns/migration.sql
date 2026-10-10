
BEGIN;

ALTER TABLE public."Payment"
    ADD COLUMN IF NOT EXISTS "transactionId" TEXT,
    ADD COLUMN IF NOT EXISTS "proofFileName" TEXT,
    ADD COLUMN IF NOT EXISTS "proofUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "paymentSubmittedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "paymentReviewedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "paymentReviewedById" INTEGER;

CREATE INDEX IF NOT EXISTS "Payment_transactionId_idx"
    ON public."Payment" ("transactionId");

CREATE INDEX IF NOT EXISTS "Payment_paymentReviewedById_idx"
    ON public."Payment" ("paymentReviewedById");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Payment_paymentReviewedById_fkey'
          AND conrelid = 'public."Payment"'::regclass
    ) THEN
        ALTER TABLE public."Payment"
            ADD CONSTRAINT "Payment_paymentReviewedById_fkey"
            FOREIGN KEY ("paymentReviewedById")
            REFERENCES public."User" ("id")
            ON DELETE SET NULL
            ON UPDATE CASCADE;
    END IF;
END
$$;

COMMIT;
