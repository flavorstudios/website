/*
  Warnings:

  - A unique constraint covering the columns `[slug,type]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_type_key" ON "Category"("slug", "type");
