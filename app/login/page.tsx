import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 grid place-items-center p-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}