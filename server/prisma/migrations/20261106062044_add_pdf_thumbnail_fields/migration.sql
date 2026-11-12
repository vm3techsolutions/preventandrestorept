-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "pdf_thumbnail_file_name" TEXT,
ADD COLUMN     "pdf_thumbnail_key" TEXT,
ADD COLUMN     "pdf_thumbnail_storage" TEXT,
ADD COLUMN     "pdf_thumbnail_uploaded_at" TIMESTAMP(3);
