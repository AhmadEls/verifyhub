import { PrismaClient, UserRole, WatchlistType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WATCHLIST_NAMES = [
  // Sanctions
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

  // PEPs
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

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate
  await prisma.auditEntry.deleteMany();
  await prisma.check.deleteMany();
  await prisma.document.deleteMany();
  await prisma.verificationSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.watchlistEntry.deleteMany();

  // Organization
  const org = await prisma.organization.create({
    data: { name: "VerifyHub Demo Org" },
  });
  console.log(`✓ Created org: ${org.name}`);

  // Users
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
  console.log(`✓ Created admin: ${admin.email}`);

  const reviewer = await prisma.user.create({
    data: {
      email: "reviewer@verifyhub.test",
      name: "Reviewer User",
      hashedPassword,
      role: UserRole.REVIEWER,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created reviewer: ${reviewer.email}`);

  // Watchlist
  await prisma.watchlistEntry.createMany({ data: WATCHLIST_NAMES });
  console.log(`✓ Created ${WATCHLIST_NAMES.length} watchlist entries`);

  console.log("\n🎉 Done. Login with:");
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