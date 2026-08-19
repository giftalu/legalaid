import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ClientDashboard() {
  const user = await requireUser("CLIENT");
  if (!user) redirect("/login");
  const cases = await db.case.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return <main className="min-h-screen p-6"><div className="mx-auto max-w-5xl">
    <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Client Dashboard</h1><p className="text-gray-500">Welcome, {user.name}</p></div><Link href="/client/cases/new" className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold">Register Case</Link></div>
    <section className="mt-8 rounded-2xl bg-white border shadow-sm overflow-hidden"><div className="p-5 border-b font-semibold">My Cases</div>{cases.length === 0 ? <p className="p-6 text-gray-500">No cases submitted yet.</p> : <div className="divide-y">{cases.map(c => <div key={c.id} className="p-5 flex justify-between"><div><div className="font-semibold">{c.caseNumber}</div><div className="text-sm text-gray-500">{c.caseType}</div></div><span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">{c.status}</span></div>)}</div>}</section>
  </div></main>;
}
