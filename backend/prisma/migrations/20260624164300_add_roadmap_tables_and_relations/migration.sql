-- CreateEnum
CREATE TYPE "RoadmapResourceType" AS ENUM ('YOUTUBE', 'BLOG');

-- CreateTable
CREATE TABLE "roadmap_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "needsRevision" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_resources" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "RoadmapResourceType" NOT NULL DEFAULT 'YOUTUBE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roadmap_progress_userId_idx" ON "roadmap_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_progress_userId_itemId_key" ON "roadmap_progress"("userId", "itemId");

-- CreateIndex
CREATE INDEX "roadmap_notes_userId_idx" ON "roadmap_notes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_notes_userId_itemId_key" ON "roadmap_notes"("userId", "itemId");

-- CreateIndex
CREATE INDEX "roadmap_resources_itemId_idx" ON "roadmap_resources"("itemId");

-- AddForeignKey
ALTER TABLE "roadmap_progress" ADD CONSTRAINT "roadmap_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_notes" ADD CONSTRAINT "roadmap_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
