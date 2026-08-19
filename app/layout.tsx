import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Aid Case Registration PoC",
  description: "Proof of concept case registration and review system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
