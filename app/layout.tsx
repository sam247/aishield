import "../styles/globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "aishield | AI-assisted security scanner",
  description: "AI-assisted security scanner powered by Nuclei and DeepSeek.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-semibold text-slate-900">
                aishield <span className="text-xs text-slate-500">(v1)</span>
              </Link>
              <span className="text-sm text-slate-500">AI-assisted security scanner</span>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
