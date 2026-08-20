import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE =
  process.env.SESSION_COOKIE || "legal_aid_session";

export async function getCurrentUser() {
  const store = await cookies();

  const cookie = store.get(COOKIE);

  console.log("AUTH COOKIE NAME:", COOKIE);
  console.log("AUTH COOKIE EXISTS:", Boolean(cookie));

  const id = Number(cookie?.value);

  if (!id) {
    console.log("AUTH: No valid user ID");
    return null;
  }

  const user = await db.user.findUnique({
    where: { id },
  });

  console.log(
    "AUTH USER:",
    user
      ? {
          id: user.id,
          role: user.role,
        }
      : null
  );

  return user;
}

export async function requireUser(
  role?: "CLIENT" | "OFFICER" | "ADMIN"
) {
  const user = await getCurrentUser();

  if (!user) {
    console.log("AUTH FAILED: No user");
    return null;
  }

  if (role && user.role !== role) {
    console.log(
      `AUTH FAILED: Expected ${role}, got ${user.role}`
    );
    return null;
  }

  return user;
}