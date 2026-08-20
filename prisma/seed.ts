import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await db.user.upsert({
    where: {
      email: "officer@legalaid.test",
    },
    update: {
      passwordHash,
      role: "OFFICER",
      name: "Demo Legal Officer",
    },
    create: {
      name: "Demo Legal Officer",
      email: "officer@legalaid.test",
      passwordHash,
      role: "OFFICER",
    },
  });

  await db.user.upsert({
    where: {
      email: "client@legalaid.test",
    },
    update: {
      passwordHash,
      role: "CLIENT",
      name: "Demo Client",
    },
    create: {
      name: "John Client",
      email: "client@legalaid.test",
      passwordHash,
      role: "CLIENT",
    },
  });

  console.log("Demo users created/updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });