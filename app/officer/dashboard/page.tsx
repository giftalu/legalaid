import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { updateCaseStatus } from "@/app/officer/actions";

export default async function OfficerDashboard() {
  const user = await requireUser("OFFICER");
  if (!user) redirect("/login");
  const cases = await db.case.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  return <main className="min-h-screen p-6"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-bold">Legal Officer Dashboard</h1><p className="text-gray-500">Review and update submitted cases.</p>
    <section className="mt-8 rounded-2xl bg-white border shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-4">Case</th><th className="text-left p-4">Client</th><th className="text-left p-4">Type</th><th className="text-left p-4">Status</th><th className="text-left p-4">Action</th></tr></thead><tbody>{cases.map(c => <tr key={c.id} className="border-t"><td className="p-4 font-medium">{c.caseNumber}</td><td className="p-4">{c.user.name}</td><td className="p-4">{c.caseType}</td><td className="p-4">{c.status}</td><td className="p-4"><form action={updateCaseStatus} className="flex gap-2"><input type="hidden" name="id" value={c.id} /><input name="comment" placeholder="Comment" className="rounded border p-2" /><button name="status" value="APPROVED" className="rounded bg-green-600 px-3 py-2 text-white">Approve</button><button name="status" value="REJECTED" className="rounded bg-red-600 px-3 py-2 text-white">Reject</button></form></td></tr>)}</tbody></table></div></section>
  </div></main>;
}
