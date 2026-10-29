-- AlterTable
ALTER TABLE "services" ADD COLUMN     "needs_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "target_keyword" TEXT;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "needs_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sections" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "target_keyword" TEXT;

-- CreateTable
CREATE TABLE "case_studies" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "featured_image_url" TEXT,
    "featured_image_alt" TEXT,
    "primary_concern" TEXT,
    "patient_goal" TEXT,
    "care_approach" TEXT,
    "outcome_summary" TEXT,
    "challenge" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "show_approach" BOOLEAN NOT NULL DEFAULT true,
    "progress" TEXT,
    "outcome" TEXT,
    "takeaways" TEXT,
    "clinician" TEXT,
    "related_service_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "related_condition_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "needs_review" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "meta_description" TEXT,
    "canonical_url" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");

-- CreateIndex
CREATE INDEX "case_studies_status_idx" ON "case_studies"("status");

-- CreateIndex
CREATE INDEX "case_studies_deleted_at_idx" ON "case_studies"("deleted_at");

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

