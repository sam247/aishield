import { Scan } from "./types";

/**
 * In-memory storage for scan data.
 * 
 * PRIVACY & DATA HANDLING:
 * - All data is stored in-memory only (ephemeral)
 * - Data is automatically destroyed when:
 *   - Server restarts
 *   - Process terminates
 *   - Serverless function completes
 * - No persistent storage (no database, no files, no logs)
 * - No data is retained beyond the scan session
 * 
 * See DATA_HANDLING.md and RETENTION_POLICY.md for details.
 */
const scans = new Map<string, Scan>();

export function createScan(url: string): Scan {
  const now = new Date().toISOString();
  const scan: Scan = {
    id: crypto.randomUUID(),
    url,
    status: "pending",
    findings: [],
    createdAt: now,
    updatedAt: now,
  };

  scans.set(scan.id, scan);
  return scan;
}

export function updateScan(scan: Scan): void {
  scan.updatedAt = new Date().toISOString();
  scans.set(scan.id, scan);
}

export function getScan(id: string): Scan | undefined {
  return scans.get(id);
}
