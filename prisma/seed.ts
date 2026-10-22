import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("Lincoz@Tech-2", 10);

  // 1. Super Admin
  await prisma.user.upsert({
    where: { email: "lincoztech@gmail.com" },
    update: {},
    create: {
      email: "lincoztech@gmail.com",
      name: "Lincoz Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  // 2. Marquee Admin
  const marqueeAdmin = await prisma.user.upsert({
    where: { email: "owner@grandpalace.com" },
    update: {},
    create: {
      email: "owner@grandpalace.com",
      name: "Arsalan Khan",
      password: hashedPassword,
      role: "MARQUEE_ADMIN",
    },
  });

  // 3. Marquee
  const marquee = await prisma.marquee.upsert({
    where: { slug: "grand-palace-marquee" },
    update: {},
    create: {
      name: "Grand Palace Marquee",
      slug: "grand-palace-marquee",
      ownerId: marqueeAdmin.id,
      primaryColor: "#2563eb",
      subscription: {
        create: {
          planType: "MONTHLY",
          status: "ACTIVE",
          endDate: new Date("2027-01-01"),
        },
      },
    },
  });

  // 4. Halls
  const hallA = await prisma.hall.create({
    data: {
      marqueeId: marquee.id,
      name: "Royal Ballroom",
      capacity: 800,
      pricePerSlot: 0,
      pricePerHead: 1500,
      status: "AVAILABLE",
      features: ["AC", "Stage", "Bridal Room"],
    },
  });

  // 5. Client
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "Hamza Sheikh",
      password: hashedPassword,
      role: "CLIENT",
    },
  });

  // 6. Bookings
  await prisma.booking.create({
    data: {
      hallId: hallA.id,
      clientId: client.id,
      eventDate: new Date("2026-06-15"),
      startTime: "06:00 PM",
      endTime: "11:00 PM",
      guestCount: 500,
      pricePerHead: 1500,
      totalAmount: 750000,
      paidAmount: 100000,
      status: "CONFIRMED",
    },
  });

  // 7. Finance
  await prisma.financialRecord.create({
    data: {
      marqueeId: marquee.id,
      type: "INCOME",
      amount: 1000,
      category: "Booking Advance",
      description: "Advance for Hamza Sheikh wedding",
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
