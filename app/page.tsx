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
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            AI-assisted security scan for modern web apps.
          </h1>
          <p className="text-slate-600 text-lg">
            Paste your URL. We run focused checks and explain the issues in plain English. Built for Next.js, Vercel, Supabase and AI-built apps.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="url">
                Target URL
              </label>
              <input
                id="url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? "Starting scan..." : "Run scan"}
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-500 text-center">
            Only scan apps you own or have permission to test.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-lg">
              1
            </div>
            <p className="font-medium text-slate-900">Enter your URL</p>
            <p className="text-sm text-slate-600">Paste the URL of your web app</p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-lg">
              2
            </div>
            <p className="font-medium text-slate-900">We run automated checks</p>
            <p className="text-sm text-slate-600">Security scan completes in 10–60 seconds</p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-lg">
              3
            </div>
            <p className="font-medium text-slate-900">You get an AI summary + fix list</p>
            <p className="text-sm text-slate-600">Actionable recommendations in plain English</p>
          </div>
        </div>
      </div>
    </div>
  );
}
