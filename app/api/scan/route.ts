import { NextResponse } from "next/server";
import { createScan, updateScan } from "../../../lib/store";
import { runMockScan } from "../../../lib/scanner";
import { summariseFindings } from "../../../lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const scan = createScan(url);

    (async () => {
      try {
        scan.status = "running";
        updateScan(scan);

        const findings = await runMockScan(url);
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
    return NextResponse.json({ error: "Failed to start scan" }, { status: 500 });
  }
}
