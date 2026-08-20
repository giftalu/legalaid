import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Gavel,
  HeartHandshake,
  LockKeyhole,
  MessageSquareText,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white shadow-sm">
              <Scale size={22} />
            </div>

            <div>
              <p className="text-lg font-bold leading-none text-gray-900">
                Legal Aid
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Access to Justice
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#services"
              className="text-sm font-medium text-gray-600 hover:text-blue-700"
            >
              Services
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-blue-700"
            >
              How it works
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-gray-600 hover:text-blue-700"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
              <ShieldCheck size={16} />
              Secure access to legal assistance
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Legal help should be{" "}
              <span className="text-blue-300">accessible to everyone.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Register your legal matter online, securely submit supporting
              documents, and track the progress of your case from one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-800 shadow-lg transition hover:bg-blue-50"
              >
                Get Legal Assistance
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-100">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Online registration
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Secure documents
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Case tracking
              </span>
            </div>
          </div>

          {/* Hero card */}
          <div className="lg:justify-self-end">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Your legal matter
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    Start a new case
                  </h2>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <FileText size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Choose your case type",
                  "Describe your legal matter",
                  "Upload supporting documents",
                  "Submit for review",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white">
                      {index + 1}
                    </div>

                    <span className="text-sm font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                Start Registration
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-3 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
              <LockKeyhole size={21} />
            </div>

            <div>
              <p className="font-semibold">Secure information</p>
              <p className="text-sm text-gray-500">
                Your submitted information is protected.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
              <UserRound size={21} />
            </div>

            <div>
              <p className="font-semibold">Professional review</p>
              <p className="text-sm text-gray-500">
                Cases are reviewed by legal officers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
              <MessageSquareText size={21} />
            </div>

            <div>
              <p className="font-semibold">Stay informed</p>
              <p className="text-sm text-gray-500">
                Track your case status online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
            Legal assistance
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tell us what kind of legal help you need
          </h2>

          <p className="mt-4 text-gray-600">
            Submit your matter online and provide the information needed for
            an officer to assess your case.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: HeartHandshake,
              title: "Family",
              text: "Family disputes, maintenance and related legal matters.",
            },
            {
              icon: Gavel,
              title: "Criminal",
              text: "Request legal assistance concerning criminal matters.",
            },
            {
              icon: FileText,
              title: "Civil",
              text: "Get assistance with civil disputes and claims.",
            },
            {
              icon: Scale,
              title: "Land",
              text: "Land ownership, boundary and related disputes.",
            },
          ].map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {service.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Simple process
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              From registration to review
            </h2>

            <p className="mt-4 text-gray-600">
              Everything you need to submit and follow up on your legal matter
              is available online.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create an account",
                text: "Register using your basic details and securely access your client dashboard.",
              },
              {
                number: "02",
                title: "Submit your case",
                text: "Provide your case description and upload the required supporting documents.",
              },
              {
                number: "03",
                title: "Track progress",
                text: "Follow your case status and see updates from the legal officer reviewing your matter.",
              },
            ].map((step) => (
              <div key={step.number} className="relative">
                <div className="text-5xl font-black text-blue-100">
                  {step.number}
                </div>

                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>

                <p className="mt-2 leading-7 text-gray-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-blue-900 px-6 py-12 text-center sm:px-12 lg:px-20">
          <div className="mx-auto max-w-3xl">
            <Scale className="mx-auto text-blue-300" size={38} />

            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
              Ready to request legal assistance?
            </h2>

            <p className="mt-4 text-blue-100">
              Create your client account and submit your legal matter securely
              online.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-900 transition hover:bg-blue-50"
              >
                Create Client Account
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-white/25 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-950 text-gray-400">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-700 text-white">
                  <Scale size={19} />
                </div>

                <span className="font-bold text-white">Legal Aid</span>
              </div>

              <p className="mt-3 max-w-md text-sm leading-6">
                An online platform for registering legal matters and tracking
                case progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-5 text-sm">
              <a href="#services" className="hover:text-white">
                Services
              </a>

              <a href="#how-it-works" className="hover:text-white">
                How it works
              </a>

              <Link href="/login" className="hover:text-white">
                Login
              </Link>

              <Link href="/register" className="hover:text-white">
                Register
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-6 text-xs">
            © {new Date().getFullYear()} Legal Aid. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}