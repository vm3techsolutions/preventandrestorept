-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "created_by_id" INTEGER,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "created_by_id" INTEGER,
ADD COLUMN     "updated_by_id" INTEGER;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "created_by_id" INTEGER,
ADD COLUMN     "updated_by_id" INTEGER;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "created_by_id" INTEGER,
ADD COLUMN     "updated_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
