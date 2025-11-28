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
          <header className="bg-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-black/80">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-xl font-semibold text-white flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-2xl">🛡️</span>
                <span>aishield</span>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Product</Link>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Resources</Link>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <button className="text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </button>
              </nav>
              <button className="md:hidden text-white p-2 hover:bg-gray-900 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>
          <main className="bg-black">{children}</main>
          <footer className="bg-black border-t border-gray-800">
            <div className="mx-auto max-w-7xl px-6 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Overview</Link></li>
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Community</Link></li>
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                    <li><a href="/DATA_HANDLING.md" className="text-sm text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Privacy & Data Handling</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-4 md:mb-0">© 2024 AIShield. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
