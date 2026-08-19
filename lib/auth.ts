import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = process.env.SESSION_COOKIE || "legal_aid_session";

export async function getCurrentUser() {
  const store = await cookies();
  const id = Number(store.get(COOKIE)?.value);
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}

export async function requireUser(role?: "CLIENT" | "OFFICER" | "ADMIN") {
  const user = await getCurrentUser();
  if (!user || (role && user.role !== role)) return null;
  return user;
}
