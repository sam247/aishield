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
        <div className="min-h-screen bg-black">
          <header className="bg-black border-b border-gray-800">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <span>aishield</span>
              </Link>
              <button className="text-white p-2 hover:bg-gray-900 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>
          <main className="bg-black">{children}</main>
        </div>
      </body>
    </html>
  );
}
