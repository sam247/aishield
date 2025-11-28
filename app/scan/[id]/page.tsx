"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Scan } from "../../../lib/types";

const statusStyles: Record<Scan["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  running: "bg-blue-100 text-blue-800",
  complete: "bg-emerald-100 text-emerald-800",
  error: "bg-red-100 text-red-800",
};

export default function ScanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

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

        // Poll every 2 seconds if scan is still in progress
        if (data.status === "pending" || data.status === "running") {
          intervalId = setInterval(fetchScan, 2000);
        } else {
          // Stop polling if complete or error
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unexpected error");
        setLoading(false);
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    }

    fetchScan();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
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

  // Calculate overall risk from findings
  const getOverallRisk = (findings: Scan["findings"]): { level: "Critical" | "High" | "Medium" | "Low" | "None"; color: string } => {
    if (findings.length === 0) {
      return { level: "None", color: "bg-slate-500" };
    }
    const hasCritical = findings.some(f => f.severity === "critical");
    const hasHigh = findings.some(f => f.severity === "high");
    const hasMedium = findings.some(f => f.severity === "medium");
    const hasLow = findings.some(f => f.severity === "low");
    
    if (hasCritical) return { level: "Critical", color: "bg-red-600" };
    if (hasHigh) return { level: "High", color: "bg-orange-500" };
    if (hasMedium) return { level: "Medium", color: "bg-amber-500" };
    if (hasLow) return { level: "Low", color: "bg-sky-500" };
    return { level: "None", color: "bg-slate-500" };
  };

  // Group findings by severity
  const groupFindingsBySeverity = (findings: Scan["findings"]) => {
    const groups: Record<string, Scan["findings"]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: [],
    };
    
    findings.forEach(finding => {
      groups[finding.severity].push(finding);
    });
    
    return groups;
  };

  // Parse markdown headings in AI summary
  const formatAISummary = (summary: string) => {
    // Split by markdown headings (##)
    const parts = summary.split(/(##\s+[^\n]+)/g);
    const elements: JSX.Element[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      
      // Check if it's a heading
      if (part.startsWith("##")) {
        const headingText = part.replace(/^##\s+/, "");
        elements.push(
          <h3 key={i} className="text-lg font-semibold text-slate-900 mt-4 mb-2 first:mt-0">
            {headingText}
          </h3>
        );
      } else {
        // Regular text - preserve line breaks
        const lines = part.split("\n").filter(line => line.trim());
        elements.push(
          <div key={i} className="text-slate-700 leading-relaxed space-y-1">
            {lines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        );
      }
    }
    
    return elements.length > 0 ? elements : <p className="text-slate-700 leading-relaxed">{summary}</p>;
  };

  const overallRisk = scan.status === "complete" ? getOverallRisk(scan.findings) : null;
  const findingsGroups = scan.status === "complete" ? groupFindingsBySeverity(scan.findings) : null;
  const severityOrder: Array<"critical" | "high" | "medium" | "low" | "info"> = ["critical", "high", "medium", "low", "info"];
  const severityLabels: Record<string, string> = {
    critical: "Critical issues",
    high: "High severity issues",
    medium: "Medium severity issues",
    low: "Low severity issues",
    info: "Informational findings",
  };

  // Check if summary is from AI (has markdown headings) or fallback
  const isAISummary = scan.aiSummary && (scan.aiSummary.includes("##") || scan.aiSummary.includes("Summary") || scan.aiSummary.includes("Risk"));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <p className="text-sm uppercase tracking-wide text-slate-500">Target URL</p>
            <p className="text-lg font-semibold text-slate-900 break-all">{scan.url}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {overallRisk && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase text-white ${overallRisk.color}`}>
                Overall risk: {overallRisk.level}
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyles[scan.status]}`}>
              {scan.status}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Created {new Date(scan.createdAt).toLocaleString()} • Updated {new Date(scan.updatedAt).toLocaleString()}
        </p>
      </div>

      {scan.status === "pending" || scan.status === "running" ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
            <div>
              <p className="font-medium">Scan in progress...</p>
              <p className="text-sm text-slate-600 mt-1">
                Running scan… this usually takes 10–60 seconds.
              </p>
            </div>
          </div>
        </div>
      ) : scan.status === "error" ? (
        <>
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-semibold mb-2">Scan failed</p>
            <p className="text-sm mb-4">{scan.errorMessage || "An unknown error occurred."}</p>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {isAISummary ? "AI Security Summary" : "Summary (non-AI)"}
            </h2>
            <div className="rounded-lg bg-slate-50 p-5 border border-slate-200">
              {scan.aiSummary ? (
                <div className="space-y-3">
                  {formatAISummary(scan.aiSummary)}
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed">No summary available.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Findings</h2>
              <span className="text-sm text-slate-500">{scan.findings.length} {scan.findings.length === 1 ? "issue" : "issues"}</span>
            </div>
            {scan.findings.length === 0 ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                <p className="font-medium">No security issues detected</p>
                <p className="text-sm mt-1">The scan completed successfully with no findings.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {findingsGroups && severityOrder.map((severity) => {
                  const findings = findingsGroups[severity];
                  if (findings.length === 0) return null;
                  
                  return (
                    <div key={severity} className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {severityLabels[severity]} ({findings.length})
                      </h3>
                      <div className="space-y-3">
                        {findings.map((finding) => (
                          <div
                            key={finding.id}
                            className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex-1 space-y-1 min-w-0">
                                <p className="text-base font-semibold text-slate-900">{finding.name}</p>
                                <p className="text-xs text-slate-500 font-mono break-all">{finding.matchedAt}</p>
                              </div>
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase text-white shrink-0 ${severityColor(
                                  finding.severity
                                )}`}
                              >
                                {finding.severity}
                              </span>
                            </div>
                            {finding.description && (
                              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{finding.description}</p>
                            )}
                            {finding.tags?.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {finding.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
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
                  );
                })}
              </div>
            )}
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
