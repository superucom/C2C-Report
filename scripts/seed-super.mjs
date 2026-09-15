import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";

function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

const username = (process.env.INITIAL_SUPER_USERNAME || "Superucom").trim();
const password = process.env.INITIAL_SUPER_PASSWORD;

if (!password) throw new Error("INITIAL_SUPER_PASSWORD is required");
if (username.length < 3 || username.length > 50 || /\s/.test(username)) {
  throw new Error("INITIAL_SUPER_USERNAME must be 3-50 characters without whitespace");
}

const prisma = new PrismaClient();

try {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    if (existing.role !== "SUPER") throw new Error(`User ${username} already exists but is not SUPER`);
    console.log(`SUPER user ${username} already exists; no password was changed.`);
  } else {
    await prisma.user.create({
      data: { username, passwordHash: hashPassword(password), role: "SUPER" },
    });
    console.log(`Created SUPER user ${username}.`);
  }
} finally {
  await prisma.$disconnect();
}
