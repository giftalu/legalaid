import { login } from "@/app/login/actions";
import Link from "next/link";

export default function LoginPage() {
  return <main className="min-h-screen grid place-items-center p-6"><form action={login} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border space-y-5">
    <div><h1 className="text-2xl font-bold">Login</h1><p className="text-gray-500 text-sm mt-1">Access the PoC.</p></div>
    <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border p-3" />
    <input name="password" type="password" required placeholder="Password" className="w-full rounded-lg border p-3" />
    <button className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold">Login</button>
    <p className="text-sm text-gray-500">No client account? <Link className="text-blue-600" href="/register">Register</Link></p>
  </form></main>;
}
