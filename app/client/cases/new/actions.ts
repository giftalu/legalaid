"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function submitCase(formData: FormData) {
  const user = await requireUser("CLIENT");
  if (!user) redirect("/login");
  const caseType = String(formData.get("caseType") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!caseType || description.length < 20) redirect("/client/cases/new?error=invalid");
  const caseNumber = `LAB-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  await db.case.create({ data: { caseNumber, userId: user.id, caseType, description } });
  redirect("/client/dashboard");
}
