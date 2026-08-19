import { register } from "@/app/register/actions";
import Link from "next/link";

export default function RegisterPage() {
  return <main className="min-h-screen grid place-items-center p-6"><form action={register} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border space-y-5">
    <div><h1 className="text-2xl font-bold">Client Registration</h1><p className="text-gray-500 text-sm mt-1">Create an account to submit a case.</p></div>
    <input name="name" required placeholder="Full name" className="w-full rounded-lg border p-3" />
    <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border p-3" />
    <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" className="w-full rounded-lg border p-3" />
    <button className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold">Create account</button>
    <p className="text-sm text-gray-500">Already registered? <Link className="text-blue-600" href="/login">Login</Link></p>
  </form></main>;
}
