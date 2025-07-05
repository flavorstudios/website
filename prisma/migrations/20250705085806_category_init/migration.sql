-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('BLOG', 'VIDEO');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "robots" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogUrl" TEXT,
    "ogType" TEXT,
    "ogSiteName" TEXT,
    "ogImages" JSONB,
    "twitterCard" TEXT,
    "twitterSite" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImages" JSONB,
    "tooltip" TEXT,
    "accessibleLabel" TEXT,
    "schema" JSONB,
    "postCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
