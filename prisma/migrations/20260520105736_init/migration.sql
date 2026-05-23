-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'REVIEWER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_MORE_INFO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_FRONT', 'ID_BACK', 'SELFIE');

-- CreateEnum
CREATE TYPE "CheckType" AS ENUM ('DOCUMENT_VALIDITY', 'FACE_MATCH', 'LIVENESS', 'SANCTIONS_SCREEN', 'PEP_SCREEN');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('PENDING', 'PASS', 'FAIL', 'REVIEW');

-- CreateEnum
CREATE TYPE "WatchlistType" AS ENUM ('SANCTIONS', 'PEP');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('SESSION_CREATED', 'SESSION_SUBMITTED', 'CHECKS_COMPLETED', 'STATUS_CHANGED', 'NOTE_ADDED', 'USER_LOGIN', 'USER_CREATED', 'USER_DELETED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'REVIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationSession" (
    "id" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "addressLine" TEXT,
    "city" TEXT,
    "country" TEXT,
    "riskScore" INTEGER,
    "reviewerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "VerificationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Check" (
    "id" TEXT NOT NULL,
    "type" "CheckType" NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'PENDING',
    "score" DOUBLE PRECISION,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WatchlistType" NOT NULL,
    "country" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "sessionId" TEXT,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationSession_publicToken_key" ON "VerificationSession"("publicToken");

-- CreateIndex
CREATE INDEX "VerificationSession_status_idx" ON "VerificationSession"("status");

-- CreateIndex
CREATE INDEX "VerificationSession_organizationId_status_idx" ON "VerificationSession"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Check_sessionId_idx" ON "Check"("sessionId");

-- CreateIndex
CREATE INDEX "WatchlistEntry_name_idx" ON "WatchlistEntry"("name");

-- CreateIndex
CREATE INDEX "WatchlistEntry_type_idx" ON "WatchlistEntry"("type");

-- CreateIndex
CREATE INDEX "AuditEntry_sessionId_idx" ON "AuditEntry"("sessionId");

-- CreateIndex
CREATE INDEX "AuditEntry_actorId_idx" ON "AuditEntry"("actorId");

-- CreateIndex
CREATE INDEX "AuditEntry_createdAt_idx" ON "AuditEntry"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationSession" ADD CONSTRAINT "VerificationSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "VerificationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "VerificationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "VerificationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
