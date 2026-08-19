"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function updateCaseStatus(formData: FormData) {
  const officer = await requireUser("OFFICER");
  if (!officer) redirect("/login");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  const comment = String(formData.get("comment") || "").trim();
  if (!id || !["APPROVED", "REJECTED"].includes(status)) redirect("/officer/dashboard");
  await db.case.update({ where: { id }, data: { status: status as "APPROVED" | "REJECTED", officerComment: comment || null, reviewedById: officer.id } });
  redirect("/officer/dashboard");
}
