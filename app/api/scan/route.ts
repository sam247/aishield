import { NextResponse } from "next/server";
import { createScan, updateScan } from "../../../lib/store";
import { runScan } from "../../../lib/scanner";
import { summariseFindings } from "../../../lib/ai";

// Explicitly use Node.js runtime (required for child_process in Vercel)
// On Vercel, this ensures the route runs in Node.js runtime where child_process is available
// If Nuclei is not installed on Vercel, the scanner will gracefully fall back to mock mode
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return NextResponse.json({ error: "URL must use http:// or https://" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const scan = createScan(url);

    // Start async scan job (fire and forget)
    // Note: Scan data is stored in-memory only (ephemeral)
    // See DATA_HANDLING.md for privacy and retention details
    (async () => {
      try {
        scan.status = "running";
        updateScan(scan);

        const findings = await runScan(url);
        const aiSummary = await summariseFindings(url, findings);

        scan.status = "complete";
        scan.findings = findings;
        scan.aiSummary = aiSummary;
        updateScan(scan);
      } catch (err) {
        scan.status = "error";
        scan.errorMessage = err instanceof Error ? err.message : "Unexpected error";
        updateScan(scan);
      }
    })();

    return NextResponse.json({ id: scan.id }, { status: 201 });
  } catch (err) {
    console.error("[api/scan] POST error:", err);
    return NextResponse.json({ error: "Failed to start scan" }, { status: 500 });
  }
}
