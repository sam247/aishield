export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface NucleiFinding {
  id: string;
  name: string;
  description?: string;
  severity: Severity;
  matchedAt: string;
  tags?: string[];
}

export type ScanStatus = "pending" | "running" | "complete" | "error";

export interface Scan {
  id: string;
  url: string;
  status: ScanStatus;
  findings: NucleiFinding[];
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}
