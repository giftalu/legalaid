"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!name || !email || password.length < 8) redirect("/register?error=invalid");
  const exists = await db.user.findUnique({ where: { email } });
  if (exists) redirect("/register?error=exists");
  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10), role: "CLIENT" } });
  redirect("/login");
}
