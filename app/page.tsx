"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a URL to scan.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
        cache: "no-store", // Prevent Safari caching issues
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start scan");
      }

      const data = await res.json();
      router.push(`/scan/${data.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 mb-8">
            <span className="text-xs text-gray-400">Backed by</span>
            <span className="text-xs font-semibold text-white">Y Combinator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Web Apps Get Hacked.<br />
            AIShield Protects.
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AIShield is an AI-powered security scanner that finds vulnerabilities and explains them in plain English. Built for Next.js, Vercel, Supabase and modern web apps.
          </p>
          
          <button
            onClick={() => document.getElementById("scan-form")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors mb-12"
          >
            Get Started
          </button>
        </div>

        {/* Code/Demo Preview Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div>
                <span className="text-purple-400">from</span> <span className="text-blue-400">aishield</span> <span className="text-purple-400">import</span> <span className="text-yellow-400">scan</span>
              </div>
              <div>
                <span className="text-gray-500"># Scan your web app</span>
              </div>
              <div>
                <span className="text-blue-400">results</span> <span className="text-white">=</span> <span className="text-yellow-400">scan</span><span className="text-white">(</span><span className="text-green-400">"https://example.com"</span><span className="text-white">)</span>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <div className="text-gray-400">AI Summary:</div>
                <div className="text-white mt-2">✓ Found 3 critical vulnerabilities</div>
                <div className="text-white">✓ Missing security headers detected</div>
                <div className="text-white">✓ CORS misconfiguration identified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div id="scan-form" className="max-w-2xl mx-auto mb-20">
          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="url">
                  Target URL
                </label>
                <input
                  id="url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg bg-black border border-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-colors"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-white text-black px-6 py-3 font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white transition-colors"
              >
                {loading ? "Starting scan..." : "Get Started"}
              </button>
            </form>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-500 text-center">
                Only scan apps you own or have permission to test.
              </p>
              <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-3">
                <p className="text-xs text-gray-400 text-center">
                  ⚠️ <strong className="text-gray-300">Privacy-first:</strong> We do not store your data — scans are ephemeral and output is not retained. See <a href="/DATA_HANDLING.md" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">DATA_HANDLING.md</a> for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by leading AI teams</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            <div className="text-2xl font-bold text-gray-800">Vercel</div>
            <div className="text-2xl font-bold text-gray-800">Next.js</div>
            <div className="text-2xl font-bold text-gray-800">Supabase</div>
            <div className="text-2xl font-bold text-gray-800">AWS</div>
          </div>
        </div>
      </div>

      {/* Features Section - One-Line Install */}
      <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">One-Line Install</h2>
            <p className="text-xl text-gray-300">Instant Security Scanning for Your Web Apps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Automated Vulnerability Detection</h3>
              <p className="text-gray-400">AIShield automatically scans your web app for common security vulnerabilities, misconfigurations, and exposed endpoints.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Summaries</h3>
              <p className="text-gray-400">Get plain-English explanations of security issues with actionable fix recommendations powered by DeepSeek AI.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fast & Non-Intrusive</h3>
              <p className="text-gray-400">Scans complete in 10-60 seconds with conservative rate limits. No impact on your production environment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Section */}
      <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Secure by Design</h2>
            <p className="text-xl text-gray-300">Privacy-First Security Scanning</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Zero-Trust Security</h3>
              <p className="text-gray-400">All scans are performed with read-only access. No data is stored or transmitted beyond the scan results.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">☁️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Deploy Anywhere</h3>
              <p className="text-gray-400">Works on Vercel, self-hosted, or any Node.js environment. Full control over your scanning infrastructure.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Transparent Results</h3>
              <p className="text-gray-400">Every finding includes severity, description, and matched location. Full visibility into what was scanned.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Security Scanning That Adapts To Your Stack</h2>
            <p className="text-xl text-gray-600">AIShield is designed to work with modern web frameworks and deployment platforms.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Next.js & Vercel Apps</h3>
              <p className="text-gray-600">Perfect for Next.js applications deployed on Vercel. Scans API routes, middleware, and deployment configurations.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Supabase Backends</h3>
              <p className="text-gray-600">Scan Supabase projects for exposed endpoints, RLS misconfigurations, and API security issues.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Built Applications</h3>
              <p className="text-gray-600">Ideal for AI-powered apps built with modern frameworks. Detects common vulnerabilities in AI application stacks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-black py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Give your web app security superpowers.</h2>
          <p className="text-xl text-gray-400 mb-8">Start scanning your applications for vulnerabilities and get AI-powered security insights in seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById("scan-form")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </button>
            <button className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white font-semibold hover:bg-gray-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
