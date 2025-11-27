"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Scan } from "../../../lib/types";

const statusStyles: Record<Scan["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  running: "bg-blue-100 text-blue-800",
  complete: "bg-emerald-100 text-emerald-800",
  error: "bg-red-100 text-red-800",
};

export default function ScanPage() {
  const params = useParams();
  const id = params?.id as string;
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchScan() {
      try {
        const res = await fetch(`/api/scan/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load scan");
        }
        const data = (await res.json()) as Scan;
        setScan(data);
        setLoading(false);

        if (data.status === "pending" || data.status === "running") {
          interval = setTimeout(fetchScan, 2500);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unexpected error");
        setLoading(false);
      }
    }

    fetchScan();

    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [id]);

  if (loading) {
    return <p className="text-slate-600">Loading scan...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!scan) {
    return <p className="text-slate-600">Scan not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Target URL</p>
            <p className="text-lg font-semibold text-slate-900">{scan.url}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyles[scan.status]}`}>
            {scan.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Created {new Date(scan.createdAt).toLocaleString()} • Updated {new Date(scan.updatedAt).toLocaleString()}
        </p>
      </div>

      {scan.status === "pending" || scan.status === "running" ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700">
          <p className="font-medium">Scan in progress...</p>
          <p className="text-sm text-slate-600">We&#39;re running the mocked scan and generating an AI summary. This can take a few seconds.</p>
        </div>
      ) : scan.status === "error" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-semibold">Scan failed</p>
          <p className="text-sm">{scan.errorMessage || "An unknown error occurred."}</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">AI summary</h2>
            <p className="mt-3 whitespace-pre-line text-slate-700">
              {scan.aiSummary || "No summary available."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Findings</h2>
              <span className="text-sm text-slate-500">{scan.findings.length} issues</span>
            </div>
            <div className="mt-4 space-y-4">
              {scan.findings.map((finding) => (
                <div
                  key={finding.id}
                  className="rounded-lg border border-slate-200 p-4 hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-900">{finding.name}</p>
                      <p className="text-sm text-slate-600">Matched at {finding.matchedAt}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase text-white ${severityColor(
                        finding.severity
                      )}`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  {finding.description && (
                    <p className="mt-2 text-sm text-slate-700">{finding.description}</p>
                  )}
                  {finding.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {finding.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function severityColor(severity: Scan["findings"][number]["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-red-600";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-sky-500";
    default:
      return "bg-slate-500";
  }
}
