// import "dotenv/config";

// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "@/generated/prisma/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma?: PrismaClient;
// };

// if (!process.env.DATABASE_URL) {
//   throw new Error("Missing required environment variable: DATABASE_URL");
// }

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = db;
// }

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}