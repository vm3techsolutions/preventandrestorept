-- Treatment guide PDF (stored in S3 or private local storage; only the key is kept here)
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "pdf_key" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "pdf_storage" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "pdf_file_name" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "pdf_size" INTEGER;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "pdf_label" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "pdf_uploaded_at" TIMESTAMP(3);

-- PDF download leads
CREATE TABLE "pdf_leads" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT,
    "treatment_id" INTEGER,
    "treatment_name" TEXT NOT NULL,
    "pdf_key" TEXT,
    "pdf_file_name" TEXT,
    "downloaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pdf_leads_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pdf_leads_created_at_idx" ON "pdf_leads"("created_at");
CREATE INDEX "pdf_leads_treatment_id_idx" ON "pdf_leads"("treatment_id");
ALTER TABLE "pdf_leads" ADD CONSTRAINT "pdf_leads_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
