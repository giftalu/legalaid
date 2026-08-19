import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-sm border">
        <p className="text-sm font-semibold text-blue-600">PoC</p>
        <h1 className="mt-2 text-4xl font-bold">Legal Aid Case Registration System</h1>
        <p className="mt-4 text-gray-600 max-w-2xl">A simple demonstration of online case registration, officer review, and case status tracking.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/login" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white">Login</Link>
          <Link href="/register" className="rounded-lg border px-5 py-3 font-semibold">Create client account</Link>
        </div>
        <div className="mt-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          Demo officer: <b>officer@legalaid.test</b> / <b>Password123!</b>
        </div>
      </div>
    </main>
  );
}
