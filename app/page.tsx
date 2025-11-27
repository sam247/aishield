"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [stackPreset, setStackPreset] = useState("");
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
        body: JSON.stringify({ url, stackPreset }),
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
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
          Mocked MVP
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
          Scan your web app for common security issues.
        </h1>
        <p className="text-slate-600">
          Paste a URL, we run a mock Nuclei-like scan and summarise the findings with a stubbed AI helper. No auth, no billing, all in-memory.
        </p>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Uses static sample findings to mimic Nuclei output</li>
          <li>• Summaries generated locally (DeepSeek stub)</li>
          <li>• Results live at /scan/&lt;id&gt; with polling</li>
        </ul>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="stackPreset">
              Stack preset (optional)
            </label>
            <select
              id="stackPreset"
              value={stackPreset}
              onChange={(e) => setStackPreset(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Select preset</option>
              <option value="nextjs">Next.js</option>
              <option value="rails">Rails</option>
              <option value="laravel">Laravel</option>
            </select>
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
      </div>
    </div>
  );
}
