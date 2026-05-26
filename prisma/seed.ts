import { PrismaClient, UserRole, WatchlistType, SessionStatus, DocumentType, CheckType, CheckStatus, AuditAction } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Watchlist (50 entries — kept from original)
// ─────────────────────────────────────────────────────────────
const WATCHLIST_NAMES = [
  { name: "Viktor Petrov", type: WatchlistType.SANCTIONS, country: "RU", source: "OFAC" },
  { name: "Ahmed Al-Rashid", type: WatchlistType.SANCTIONS, country: "SY", source: "OFAC" },
  { name: "Kim Jong-Su", type: WatchlistType.SANCTIONS, country: "KP", source: "UN" },
  { name: "Mohammed Hassan", type: WatchlistType.SANCTIONS, country: "IR", source: "OFAC" },
  { name: "Boris Volkov", type: WatchlistType.SANCTIONS, country: "RU", source: "EU_SANCTIONS" },
  { name: "Carlos Mendoza", type: WatchlistType.SANCTIONS, country: "VE", source: "OFAC" },
  { name: "Aleksandr Ivanov", type: WatchlistType.SANCTIONS, country: "RU", source: "OFAC" },
  { name: "Hassan Nasrallah", type: WatchlistType.SANCTIONS, country: "LB", source: "OFAC" },
  { name: "Pavel Sokolov", type: WatchlistType.SANCTIONS, country: "BY", source: "EU_SANCTIONS" },
  { name: "Ibrahim Khalil", type: WatchlistType.SANCTIONS, country: "SY", source: "UN" },
  { name: "Dmitri Kozlov", type: WatchlistType.SANCTIONS, country: "RU", source: "EU_SANCTIONS" },
  { name: "Reza Ahmadi", type: WatchlistType.SANCTIONS, country: "IR", source: "OFAC" },
  { name: "Sergei Morozov", type: WatchlistType.SANCTIONS, country: "RU", source: "OFAC" },
  { name: "Yuri Lebedev", type: WatchlistType.SANCTIONS, country: "RU", source: "UN" },
  { name: "Omar Suleiman", type: WatchlistType.SANCTIONS, country: "SD", source: "OFAC" },
  { name: "Nikolai Smirnov", type: WatchlistType.SANCTIONS, country: "RU", source: "EU_SANCTIONS" },
  { name: "Bashar Al-Assad", type: WatchlistType.SANCTIONS, country: "SY", source: "OFAC" },
  { name: "Andrei Popov", type: WatchlistType.SANCTIONS, country: "RU", source: "OFAC" },
  { name: "Tariq Mahmoud", type: WatchlistType.SANCTIONS, country: "IQ", source: "UN" },
  { name: "Vladimir Orlov", type: WatchlistType.SANCTIONS, country: "RU", source: "EU_SANCTIONS" },
  { name: "Mikhail Belov", type: WatchlistType.SANCTIONS, country: "RU", source: "OFAC" },
  { name: "Saif Al-Islam", type: WatchlistType.SANCTIONS, country: "LY", source: "UN" },
  { name: "Anatoly Fedorov", type: WatchlistType.SANCTIONS, country: "RU", source: "OFAC" },
  { name: "Hamid Reza", type: WatchlistType.SANCTIONS, country: "IR", source: "OFAC" },
  { name: "Igor Komarov", type: WatchlistType.SANCTIONS, country: "RU", source: "EU_SANCTIONS" },
  { name: "Elena Vasquez", type: WatchlistType.PEP, country: "MX", source: "PEP_GLOBAL" },
  { name: "James Thornton", type: WatchlistType.PEP, country: "GB", source: "PEP_GLOBAL" },
  { name: "Maria Silva", type: WatchlistType.PEP, country: "BR", source: "PEP_GLOBAL" },
  { name: "Chen Wei", type: WatchlistType.PEP, country: "CN", source: "PEP_GLOBAL" },
  { name: "Olusegun Adeyemi", type: WatchlistType.PEP, country: "NG", source: "PEP_GLOBAL" },
  { name: "Hiroshi Tanaka", type: WatchlistType.PEP, country: "JP", source: "PEP_GLOBAL" },
  { name: "Pierre Dubois", type: WatchlistType.PEP, country: "FR", source: "PEP_GLOBAL" },
  { name: "Anna Schmidt", type: WatchlistType.PEP, country: "DE", source: "PEP_GLOBAL" },
  { name: "Rajesh Kumar", type: WatchlistType.PEP, country: "IN", source: "PEP_GLOBAL" },
  { name: "Fernando Lopez", type: WatchlistType.PEP, country: "AR", source: "PEP_GLOBAL" },
  { name: "Sofia Rossi", type: WatchlistType.PEP, country: "IT", source: "PEP_GLOBAL" },
  { name: "Mehmet Yilmaz", type: WatchlistType.PEP, country: "TR", source: "PEP_GLOBAL" },
  { name: "Lars Andersen", type: WatchlistType.PEP, country: "DK", source: "PEP_GLOBAL" },
  { name: "Priya Sharma", type: WatchlistType.PEP, country: "IN", source: "PEP_GLOBAL" },
  { name: "David Cohen", type: WatchlistType.PEP, country: "IL", source: "PEP_GLOBAL" },
  { name: "Isabella Martinez", type: WatchlistType.PEP, country: "ES", source: "PEP_GLOBAL" },
  { name: "Kwame Mensah", type: WatchlistType.PEP, country: "GH", source: "PEP_GLOBAL" },
  { name: "Natasha Volkova", type: WatchlistType.PEP, country: "UA", source: "PEP_GLOBAL" },
  { name: "Liam O'Brien", type: WatchlistType.PEP, country: "IE", source: "PEP_GLOBAL" },
  { name: "Aisha Mohammed", type: WatchlistType.PEP, country: "EG", source: "PEP_GLOBAL" },
  { name: "Jakub Nowak", type: WatchlistType.PEP, country: "PL", source: "PEP_GLOBAL" },
  { name: "Camila Santos", type: WatchlistType.PEP, country: "BR", source: "PEP_GLOBAL" },
  { name: "Henrik Johansson", type: WatchlistType.PEP, country: "SE", source: "PEP_GLOBAL" },
  { name: "Fatima Khan", type: WatchlistType.PEP, country: "PK", source: "PEP_GLOBAL" },
  { name: "Diego Hernandez", type: WatchlistType.PEP, country: "CO", source: "PEP_GLOBAL" },
];

// ─────────────────────────────────────────────────────────────
// 20 realistic sessions
// ─────────────────────────────────────────────────────────────
type SeedSession = {
  fullName: string;
  dateOfBirth: Date;
  addressLine: string;
  city: string;
  country: string;
  status: SessionStatus;
  riskScore: number | null;
  daysAgo: number;
  reviewerNotes?: string;
};

const SAMPLE_SESSIONS: SeedSession[] = [
  // Approved (5) — low risk, clean profiles
  { fullName: "Emma Schneider", dateOfBirth: new Date("1990-03-15"), addressLine: "Friedrichstrasse 88", city: "Berlin", country: "DE", status: "APPROVED", riskScore: 18, daysAgo: 2, reviewerNotes: "All checks passed cleanly. Identity verified." },
  { fullName: "Daniel Weber", dateOfBirth: new Date("1985-07-22"), addressLine: "Maximilianstrasse 14", city: "Munich", country: "DE", status: "APPROVED", riskScore: 22, daysAgo: 4, reviewerNotes: "Standard approval. No flags." },
  { fullName: "Sophie Laurent", dateOfBirth: new Date("1992-11-08"), addressLine: "Avenue des Champs 42", city: "Paris", country: "FR", status: "APPROVED", riskScore: 15, daysAgo: 6 },
  { fullName: "Yuki Tanaka", dateOfBirth: new Date("1988-04-30"), addressLine: "Shibuya 2-21-1", city: "Tokyo", country: "JP", status: "APPROVED", riskScore: 12, daysAgo: 9, reviewerNotes: "Clean profile. Approved." },
  { fullName: "Liam Murphy", dateOfBirth: new Date("1995-09-17"), addressLine: "Grafton Street 14", city: "Dublin", country: "IE", status: "APPROVED", riskScore: 28, daysAgo: 12 },

  // Rejected (4) — high risk, watchlist hits, suspicious
  { fullName: "Reza Ahmadi", dateOfBirth: new Date("1978-02-11"), addressLine: "Valiasr Street 1100", city: "Tehran", country: "IR", status: "REJECTED", riskScore: 92, daysAgo: 3, reviewerNotes: "Sanctions match (OFAC). Rejected per AML policy." },
  { fullName: "Boris Volkov", dateOfBirth: new Date("1972-06-05"), addressLine: "Tverskaya 12", city: "Moscow", country: "RU", status: "REJECTED", riskScore: 88, daysAgo: 7, reviewerNotes: "EU sanctions match. Auto-flagged for rejection." },
  { fullName: "Maxim Petrov", dateOfBirth: new Date("1980-12-19"), addressLine: "Nevsky Prospect 24", city: "St. Petersburg", country: "RU", status: "REJECTED", riskScore: 76, daysAgo: 10, reviewerNotes: "High-risk jurisdiction. Document mismatch on second review." },
  { fullName: "Karim Bouzid", dateOfBirth: new Date("1991-08-03"), addressLine: "Rue de la Liberté 8", city: "Algiers", country: "DZ", status: "REJECTED", riskScore: 71, daysAgo: 14, reviewerNotes: "Failed liveness check twice. Cannot verify identity." },

  // In Review (3) — mixed risk, awaiting reviewer action
  { fullName: "Olusegun Adeyemi", dateOfBirth: new Date("1983-05-25"), addressLine: "Victoria Island", city: "Lagos", country: "NG", status: "IN_REVIEW", riskScore: 64, daysAgo: 1, reviewerNotes: "PEP screening triggered partial match. Manual review needed." },
  { fullName: "Anna Schmidt", dateOfBirth: new Date("1987-10-12"), addressLine: "Unter den Linden 5", city: "Berlin", country: "DE", status: "IN_REVIEW", riskScore: 58, daysAgo: 2 },
  { fullName: "Hiroshi Tanaka", dateOfBirth: new Date("1976-01-28"), addressLine: "Ginza 4-6-16", city: "Tokyo", country: "JP", status: "IN_REVIEW", riskScore: 52, daysAgo: 5 },

  // Submitted (4) — recently submitted, no checks yet or just completed
  { fullName: "Carlos Ruiz", dateOfBirth: new Date("1989-07-14"), addressLine: "Paseo de la Reforma 250", city: "Mexico City", country: "MX", status: "SUBMITTED", riskScore: 35, daysAgo: 0 },
  { fullName: "Priya Sharma", dateOfBirth: new Date("1993-03-08"), addressLine: "MG Road 45", city: "Bangalore", country: "IN", status: "SUBMITTED", riskScore: 29, daysAgo: 0 },
  { fullName: "Lucas Oliveira", dateOfBirth: new Date("1991-11-22"), addressLine: "Av. Paulista 1500", city: "São Paulo", country: "BR", status: "SUBMITTED", riskScore: 41, daysAgo: 1 },
  { fullName: "Ahmed Al-Mansoori", dateOfBirth: new Date("1986-04-17"), addressLine: "Sheikh Zayed Road", city: "Dubai", country: "AE", status: "SUBMITTED", riskScore: 38, daysAgo: 1 },

  // Needs More Info (2)
  { fullName: "Isabella Martinez", dateOfBirth: new Date("1994-08-19"), addressLine: "Gran Via 28", city: "Madrid", country: "ES", status: "NEEDS_MORE_INFO", riskScore: 48, daysAgo: 4, reviewerNotes: "ID image blurred. Requested re-upload." },
  { fullName: "James Thornton", dateOfBirth: new Date("1982-12-03"), addressLine: "Baker Street 221B", city: "London", country: "GB", status: "NEEDS_MORE_INFO", riskScore: 55, daysAgo: 6, reviewerNotes: "Address proof required. Awaiting submission." },

  // Pending (2) — link sent, user hasn't submitted yet
  { fullName: "", dateOfBirth: null as unknown as Date, addressLine: "", city: "", country: "", status: "PENDING", riskScore: null, daysAgo: 0 },
  { fullName: "", dateOfBirth: null as unknown as Date, addressLine: "", city: "", country: "", status: "PENDING", riskScore: null, daysAgo: 1 },
];

// ─────────────────────────────────────────────────────────────
// Sample document URLs — placeholder images (Picsum)
// ─────────────────────────────────────────────────────────────
const SAMPLE_DOCS = {
  idFront: "https://picsum.photos/seed/idfront/600/400",
  idBack: "https://picsum.photos/seed/idback/600/400",
  selfie: "https://picsum.photos/seed/selfie/400/400",
};

// ─────────────────────────────────────────────────────────────
// Check generation based on risk score
// ─────────────────────────────────────────────────────────────
function generateChecks(riskScore: number, country: string) {
  const checks = [];

  // Document Validity
  checks.push({
    type: CheckType.DOCUMENT_VALIDITY,
    status: riskScore > 70 ? CheckStatus.FAIL : CheckStatus.PASS,
    score: riskScore > 70 ? 0.62 : 0.95 - riskScore / 500,
    details: { reason: riskScore > 70 ? "Image quality below threshold" : "Document verified" },
  });

  // Face Match
  checks.push({
    type: CheckType.FACE_MATCH,
    status: riskScore > 75 ? CheckStatus.FAIL : riskScore > 50 ? CheckStatus.REVIEW : CheckStatus.PASS,
    score: riskScore > 75 ? 0.51 : 0.94 - riskScore / 400,
    details: { similarity: riskScore > 75 ? 0.51 : 0.94 - riskScore / 400 },
  });

  // Liveness
  checks.push({
    type: CheckType.LIVENESS,
    status: riskScore > 70 ? CheckStatus.FAIL : CheckStatus.PASS,
    score: riskScore > 70 ? 0.58 : 0.97 - riskScore / 600,
    details: { spoofProbability: riskScore > 70 ? 0.42 : 0.03 },
  });

  // Sanctions Screen
  const highRiskCountries = ["RU", "IR", "KP", "SY", "VE", "BY"];
  const sanctionsHit = highRiskCountries.includes(country) || riskScore > 80;
  checks.push({
    type: CheckType.SANCTIONS_SCREEN,
    status: sanctionsHit ? CheckStatus.FAIL : CheckStatus.PASS,
    score: sanctionsHit ? 0.92 : 0.02,
    details: sanctionsHit
      ? { matchedName: "Partial match", source: "OFAC", similarity: 0.88 }
      : { searched: 50, matches: 0 },
  });

  // PEP Screen
  const pepHit = riskScore > 55 && riskScore < 80;
  checks.push({
    type: CheckType.PEP_SCREEN,
    status: pepHit ? CheckStatus.REVIEW : CheckStatus.PASS,
    score: pepHit ? 0.71 : 0.05,
    details: pepHit
      ? { matchedName: "Potential PEP match", source: "PEP_GLOBAL", similarity: 0.71 }
      : { searched: 25, matches: 0 },
  });

  return checks;
}

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.auditEntry.deleteMany();
  await prisma.check.deleteMany();
  await prisma.document.deleteMany();
  await prisma.verificationSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.watchlistEntry.deleteMany();

  const org = await prisma.organization.create({ data: { name: "VerifyHub Demo Org" } });
  console.log(`✓ Org: ${org.name}`);

  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@verifyhub.test",
      name: "Admin User",
      hashedPassword,
      role: UserRole.ADMIN,
      organizationId: org.id,
    },
  });
  const reviewer = await prisma.user.create({
    data: {
      email: "reviewer@verifyhub.test",
      name: "Reviewer User",
      hashedPassword,
      role: UserRole.REVIEWER,
      organizationId: org.id,
    },
  });
  console.log(`✓ Users: ${admin.email}, ${reviewer.email}`);

  await prisma.watchlistEntry.createMany({ data: WATCHLIST_NAMES });
  console.log(`✓ Watchlist: ${WATCHLIST_NAMES.length} entries`);

  // Sessions
  for (const seed of SAMPLE_SESSIONS) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - seed.daysAgo);

    const submittedAt = seed.status === "PENDING" ? null : new Date(createdAt.getTime() + 1000 * 60 * 30);
    const reviewedAt =
      seed.status === "APPROVED" || seed.status === "REJECTED" || seed.status === "NEEDS_MORE_INFO"
        ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 2)
        : null;

    const isPending = seed.status === "PENDING";

    const session = await prisma.verificationSession.create({
      data: {
        organizationId: org.id,
        status: seed.status,
        fullName: isPending ? null : seed.fullName,
        dateOfBirth: isPending ? null : seed.dateOfBirth,
        addressLine: isPending ? null : seed.addressLine,
        city: isPending ? null : seed.city,
        country: isPending ? null : seed.country,
        riskScore: seed.riskScore,
        reviewerNotes: seed.reviewerNotes ?? null,
        createdAt,
        submittedAt,
        reviewedAt,
        documents: isPending
          ? undefined
          : {
              create: [
                { type: DocumentType.ID_FRONT, url: SAMPLE_DOCS.idFront, fileKey: `seed-${seed.fullName}-front` },
                { type: DocumentType.ID_BACK, url: SAMPLE_DOCS.idBack, fileKey: `seed-${seed.fullName}-back` },
                { type: DocumentType.SELFIE, url: SAMPLE_DOCS.selfie, fileKey: `seed-${seed.fullName}-selfie` },
              ],
            },
        checks:
          isPending || seed.riskScore === null
            ? undefined
            : { create: generateChecks(seed.riskScore, seed.country) },
        auditEntries: {
          create: [
            { action: AuditAction.SESSION_CREATED, createdAt, actorId: reviewer.id },
            ...(isPending
              ? []
              : [
                  { action: AuditAction.SESSION_SUBMITTED, createdAt: submittedAt! },
                  { action: AuditAction.CHECKS_COMPLETED, createdAt: new Date(submittedAt!.getTime() + 1000 * 5) },
                ]),
            ...(reviewedAt
              ? [
                  {
                    action: AuditAction.STATUS_CHANGED,
                    createdAt: reviewedAt,
                    actorId: reviewer.id,
                    metadata: { from: "IN_REVIEW", to: seed.status, notes: seed.reviewerNotes ?? null },
                  },
                ]
              : []),
          ],
        },
      },
    });
    console.log(`  ✓ ${seed.status.padEnd(15)} ${seed.fullName || "(pending)"}`);
  }

  console.log("\n🎉 Done.");
  console.log("   admin@verifyhub.test / password123");
  console.log("   reviewer@verifyhub.test / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });