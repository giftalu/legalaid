import { submitCase } from "@/app/client/cases/new/actions";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewCasePage() {
  const user = await requireUser("CLIENT");
  if (!user) redirect("/login");
  return <main className="min-h-screen p-6"><form action={submitCase} className="mx-auto max-w-2xl rounded-2xl bg-white border shadow-sm p-8 space-y-5">
    <div><h1 className="text-2xl font-bold">Register a Case</h1><p className="text-gray-500">Provide the basic information for the demonstration.</p></div>
    <select name="caseType" required className="w-full rounded-lg border p-3"><option value="">Select case type</option><option>Family</option><option>Land</option><option>Criminal</option><option>Civil</option></select>
    <textarea name="description" required minLength={20} rows={7} placeholder="Describe the case" className="w-full rounded-lg border p-3" />
    <button className="rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold">Submit Case</button>
  </form></main>;
}
