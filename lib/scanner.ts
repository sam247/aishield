import { exec } from "child_process";
import { promisify } from "util";
import sampleFindings from "../data/sample-scan.json";
import { NucleiFinding } from "./types";

const execAsync = promisify(exec);

// One-time logging helper to prevent log spam
let scannerModeLogged = false;

function logScannerModeOnce(message: string): void {
  if (!scannerModeLogged) {
    console.log(`[scanner] ${message}`);
    scannerModeLogged = true;
  }
}

export async function runMockScan(url: string): Promise<NucleiFinding[]> {
  await new Promise((r) => setTimeout(r, 2000));
  return sampleFindings as NucleiFinding[];
}

export async function runRealScan(url: string): Promise<NucleiFinding[]> {
  const nucleiPath = process.env.NUCLEI_PATH || "nuclei";
  const timeout = 60000; // 60 seconds

  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // Build Nuclei command with safe, conservative options
  const command = [
    nucleiPath,
    "-u", url,
    "-json",
    "-silent",
    "-no-color",
    "-rate-limit", "10", // 10 requests per second
    "-timeout", "10", // 10 second timeout per request
    "-retries", "1",
    "-t", "cves/", // Generic CVEs templates
    "-t", "vulnerabilities/", // Generic vulnerabilities
    "-t", "exposures/", // Exposures
  ].join(" ");

  try {
    // Note: URL logging is non-persistent (console.log only, not written to disk)
    console.log(`[scanner] Running real Nuclei scan`);
    const { stdout, stderr } = await execAsync(command, {
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stderr && !stderr.includes("INF]") && !stderr.includes("WRN]")) {
      console.warn(`[scanner] Nuclei stderr: ${stderr}`);
    }

    // Parse JSON lines (Nuclei outputs one JSON object per line)
    const lines = stdout.trim().split("\n").filter((line) => line.trim());
    
    if (lines.length === 0) {
      console.log(`[scanner] No findings detected`);
      return [];
    }

    const findings: NucleiFinding[] = [];
    
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        
        // Map Nuclei JSON output to our NucleiFinding format
        // Nuclei output structure: { "template-id": "...", "info": { "name": "...", "severity": "...", ... }, "matched-at": "...", ... }
        const finding: NucleiFinding = {
          id: parsed["template-id"] || parsed.template_id || parsed.id || `finding-${findings.length}`,
          name: parsed.info?.name || parsed.name || "Unknown finding",
          description: parsed.info?.description || parsed.description || undefined,
          severity: mapNucleiSeverity(parsed.info?.severity || parsed.severity || "info"),
          matchedAt: parsed["matched-at"] || parsed.matched_at || parsed.url || url,
          tags: parsed.info?.tags || parsed.tags || undefined,
        };
        
        findings.push(finding);
      } catch (parseErr) {
        console.warn(`[scanner] Failed to parse Nuclei output line: ${line}`, parseErr);
        // Continue processing other lines
      }
    }

    console.log(`[scanner] Found ${findings.length} issues`);
    return findings;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      throw new Error(`Nuclei CLI not found at "${nucleiPath}". Please install Nuclei or set NUCLEI_PATH.`);
    }
    if (error.code === "ETIMEDOUT" || error.signal === "SIGTERM") {
      throw new Error(`Nuclei scan timed out after ${timeout / 1000} seconds`);
    }
    throw new Error(`Nuclei scan failed: ${error.message || "Unknown error"}`);
  }
}

function mapNucleiSeverity(severity: string): NucleiFinding["severity"] {
  const normalized = severity?.toLowerCase() || "info";
  if (["critical", "high", "medium", "low", "info"].includes(normalized)) {
    return normalized as NucleiFinding["severity"];
  }
  // Map common Nuclei severity values
  if (normalized.includes("critical") || normalized.includes("crt")) return "critical";
  if (normalized.includes("high")) return "high";
  if (normalized.includes("medium") || normalized.includes("med")) return "medium";
  if (normalized.includes("low")) return "low";
  return "info";
}

/**
 * Check if Nuclei binary is available and can be executed.
 * Returns true if Nuclei is available, false otherwise.
 */
async function checkNucleiAvailable(): Promise<boolean> {
  const nucleiPath = process.env.NUCLEI_PATH || "nuclei";
  
  try {
    // Quick version check - if this succeeds, Nuclei is available
    await execAsync(`${nucleiPath} -version`, {
      timeout: 5000, // 5 second timeout for version check
      maxBuffer: 1024 * 1024, // 1MB buffer
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Main scan function. Tries real Nuclei first (unless explicitly disabled),
 * falls back to mock scanner if Nuclei is unavailable or fails.
 * Never throws - always returns findings (mock or real).
 */
export async function runScan(url: string): Promise<NucleiFinding[]> {
  const useRealNucleiEnv = process.env.USE_REAL_NUCLEI;
  
  // If explicitly set to "false", use mock
  if (useRealNucleiEnv === "false") {
    logScannerModeOnce("USE_REAL_NUCLEI=false, using mock scanner");
    return runMockScan(url);
  }
  
  // Try real Nuclei if:
  // 1. USE_REAL_NUCLEI is "true" OR
  // 2. USE_REAL_NUCLEI is not set (default: try real first)
  const shouldTryReal = useRealNucleiEnv === "true" || useRealNucleiEnv === undefined || useRealNucleiEnv === "";
  
  if (shouldTryReal) {
    // Check if Nuclei is available
    const isAvailable = await checkNucleiAvailable();
    
    if (!isAvailable) {
      logScannerModeOnce("Nuclei not available or USE_REAL_NUCLEI != true, falling back to mock scanner.");
      return runMockScan(url);
    }
    
    // Try to run real scan, but catch any errors and fall back to mock
    try {
      logScannerModeOnce("Using real Nuclei CLI");
      return await runRealScan(url);
    } catch (error) {
      // Log the error but don't throw - fall back to mock
      console.warn(`[scanner] Real Nuclei scan failed, falling back to mock:`, error instanceof Error ? error.message : String(error));
      logScannerModeOnce("Nuclei not available or USE_REAL_NUCLEI != true, falling back to mock scanner.");
      return runMockScan(url);
    }
  }
  
  // Fallback to mock (shouldn't reach here, but just in case)
  logScannerModeOnce("Using mock scanner");
  return runMockScan(url);
}
