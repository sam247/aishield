import { Scan } from "./types";

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
