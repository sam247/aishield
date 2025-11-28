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
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto">
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
            <p className="mt-6 text-xs text-gray-500 text-center">
              Only scan apps you own or have permission to test.
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 border border-gray-800 text-white font-semibold text-lg">
                1
              </div>
              <p className="font-semibold text-white text-lg">Enter your URL</p>
              <p className="text-sm text-gray-400">Paste the URL of your web app</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 border border-gray-800 text-white font-semibold text-lg">
                2
              </div>
              <p className="font-semibold text-white text-lg">We run automated checks</p>
              <p className="text-sm text-gray-400">Security scan completes in 10–60 seconds</p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 border border-gray-800 text-white font-semibold text-lg">
                3
              </div>
              <p className="font-semibold text-white text-lg">You get an AI summary + fix list</p>
              <p className="text-sm text-gray-400">Actionable recommendations in plain English</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
