"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Scan } from "../../../lib/types";

const statusStyles: Record<Scan["status"], string> = {
  pending: "bg-amber-900/30 text-amber-400 border border-amber-800/50",
  running: "bg-blue-900/30 text-blue-400 border border-blue-800/50",
  complete: "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50",
  error: "bg-red-900/30 text-red-400 border border-red-800/50",
};

export default function ScanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scanStatusRef = useRef<Scan["status"] | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    async function fetchScan() {
      if (!isMounted) return;
      
      // Don't poll if scan is already complete or error
      if (scanStatusRef.current === "complete" || scanStatusRef.current === "error") {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }
      
      try {
        const res = await fetch(`/api/scan/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store", // Prevent Safari caching issues
        });
        if (!res.ok) {
          // Handle 404 gracefully (scan might have expired on serverless)
          if (res.status === 404) {
            if (isMounted) {
              setError("Scan not found. It may have expired. Please start a new scan.");
              setLoading(false);
            }
            // Stop polling on 404
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load scan");
        }
        const data = (await res.json()) as Scan;
        
        if (!isMounted) return;
        
        scanStatusRef.current = data.status;
        setScan(data);
        setLoading(false);

        // Stop polling if scan is complete or error
        if (data.status === "complete" || data.status === "error") {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (err) {
        if (!isMounted) return;
        // Don't set error on network failures during polling - just log
        if (scanStatusRef.current === "pending" || scanStatusRef.current === "running") {
          // Only log, don't show error to user during active polling
          console.warn("Polling error:", err);
        } else {
          setError(err instanceof Error ? err.message : "Unexpected error");
          setLoading(false);
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      }
    }

    // Initial fetch
    fetchScan();

    // Set up polling interval
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchScan();
      }
    }, 2000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [id]); // Only depend on id

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading scan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Scan not found.</p>
      </div>
    );
  }

  // Calculate overall risk from findings
  const getOverallRisk = (findings: Scan["findings"]): { level: "Critical" | "High" | "Medium" | "Low" | "None"; color: string } => {
    if (findings.length === 0) {
      return { level: "None", color: "bg-gray-700" };
    }
    const hasCritical = findings.some(f => f.severity === "critical");
    const hasHigh = findings.some(f => f.severity === "high");
    const hasMedium = findings.some(f => f.severity === "medium");
    const hasLow = findings.some(f => f.severity === "low");
    
    if (hasCritical) return { level: "Critical", color: "bg-red-600" };
    if (hasHigh) return { level: "High", color: "bg-orange-500" };
    if (hasMedium) return { level: "Medium", color: "bg-amber-500" };
    if (hasLow) return { level: "Low", color: "bg-blue-500" };
    return { level: "None", color: "bg-gray-700" };
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
          <h3 key={i} className="text-lg font-semibold text-white mt-4 mb-2 first:mt-0">
            {headingText}
          </h3>
        );
      } else {
        // Regular text - preserve line breaks
        const lines = part.split("\n").filter(line => line.trim());
        elements.push(
          <div key={i} className="text-gray-300 leading-relaxed space-y-1">
            {lines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        );
      }
    }
    
    return elements.length > 0 ? elements : <p className="text-gray-300 leading-relaxed">{summary}</p>;
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
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-wide text-gray-500">Target URL</p>
              <p className="text-lg font-semibold text-white break-all">{scan.url}</p>
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
          <p className="mt-3 text-sm text-gray-500">
            Created {new Date(scan.createdAt).toLocaleString()} • Updated {new Date(scan.updatedAt).toLocaleString()}
          </p>
        </div>

      {scan.status === "pending" || scan.status === "running" ? (
        <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900 p-6 text-gray-300">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-white"></div>
            <div>
              <p className="font-medium text-white">Scan in progress...</p>
              <p className="text-sm text-gray-400 mt-1">
                Running scan… this usually takes 10–60 seconds.
              </p>
            </div>
          </div>
        </div>
      ) : scan.status === "error" ? (
        <>
          <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-6 text-red-400">
            <p className="font-semibold mb-2 text-white">Scan failed</p>
            <p className="text-sm mb-4">{scan.errorMessage || "An unknown error occurred."}</p>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Try again
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {isAISummary ? "AI Security Summary" : "Summary (non-AI)"}
            </h2>
            <div className="rounded-lg bg-black p-5 border border-gray-800">
              {scan.aiSummary ? (
                <div className="space-y-3">
                  {formatAISummary(scan.aiSummary)}
                </div>
              ) : (
                <p className="text-gray-300 leading-relaxed">No summary available.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Findings</h2>
              <span className="text-sm text-gray-400">{scan.findings.length} {scan.findings.length === 1 ? "issue" : "issues"}</span>
            </div>
            {scan.findings.length === 0 ? (
              <div className="mt-4 rounded-lg border border-gray-800 bg-black p-6 text-center text-gray-400">
                <p className="font-medium text-white">No security issues detected</p>
                <p className="text-sm mt-1">The scan completed successfully with no findings.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {findingsGroups && severityOrder.map((severity) => {
                  const findings = findingsGroups[severity];
                  if (findings.length === 0) return null;
                  
                  return (
                    <div key={severity} className="space-y-3">
                      <h3 className="text-base font-semibold text-white">
                        {severityLabels[severity]} ({findings.length})
                      </h3>
                      <div className="space-y-3">
                        {findings.map((finding) => (
                          <div
                            key={finding.id}
                            className="rounded-lg border border-gray-800 bg-black p-4 hover:border-gray-700 transition-colors"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex-1 space-y-1 min-w-0">
                                <p className="text-base font-semibold text-white">{finding.name}</p>
                                <p className="text-xs text-gray-500 font-mono break-all">{finding.matchedAt}</p>
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
                              <p className="mt-3 text-sm text-gray-300 leading-relaxed">{finding.description}</p>
                            )}
                            {finding.tags?.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {finding.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300 border border-gray-700"
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
      return "bg-blue-500";
    default:
      return "bg-gray-600";
  }
}
