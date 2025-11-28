# Data Handling & Privacy Policy

## Overview

AIShield is designed with privacy-first principles. This document describes what data is collected, how it's stored, and how it's disposed of.

## Data Collection

### What We Collect

AIShield collects and stores the following data **only in memory**:

- **Scan Metadata:**
  - Scan ID (UUID)
  - Target URL
  - Scan status (pending, running, complete, error)
  - Timestamps (createdAt, updatedAt)

- **Scan Results:**
  - Security findings (vulnerability name, severity, description, matched location)
  - AI-generated summary (if enabled)
  - Error messages (if scan fails)

### What We Do NOT Collect

AIShield **never** collects, stores, or logs:

- ❌ Raw HTTP request/response bodies
- ❌ Request headers or authentication tokens
- ❌ Source code or file contents
- ❌ User credentials or personal information
- ❌ Network traffic or packet data
- ❌ Persistent logs of scan activities
- ❌ Any data written to disk

## Data Storage

### Storage Method: In-Memory Only

All scan data is stored **exclusively in memory** using an in-memory `Map` data structure. This means:

- Data exists only during the application's runtime
- Data is **automatically destroyed** when:
  - The server restarts
  - The application process terminates
  - The serverless function completes (on platforms like Vercel)

### No Persistent Storage

- **No database:** AIShield does not use any database (PostgreSQL, MongoDB, etc.)
- **No file system:** No scan data is written to disk
- **No external storage:** No data is sent to cloud storage services
- **No logging:** No persistent log files are created

## Data Retention

### Ephemeral by Default

**Retention Period:** Data is retained only for the duration of the scan session.

- Scans are stored in memory until:
  1. The scan completes (status: `complete` or `error`)
  2. The server restarts
  3. The serverless function times out (typically 10-60 seconds on platforms like Vercel)

### Automatic Disposal

Data is automatically disposed of when:
- The in-memory Map is cleared (on server restart)
- The Node.js process terminates
- The serverless function execution ends

**No manual deletion required** — data is ephemeral by design.

## Data Export

### Explicit Export Only

If users want to save scan results, they must **explicitly download or export** the data:

- Export functionality (if implemented) will generate a file (PDF/JSON) on-demand
- Exported files are created **client-side** or **temporarily** for download
- No exported data is stored on the server
- Users are responsible for managing exported files

### No Automatic Saving

- ❌ No automatic saving to server
- ❌ No automatic saving to cloud storage
- ❌ No automatic email notifications with results
- ✅ Only explicit user-initiated exports

## User Responsibilities

### Authorization

**Users are responsible for:**

- Scanning **only applications they own** or have **explicit written permission** to test
- Ensuring they have legal authorization before scanning any target
- Complying with applicable laws and regulations (e.g., Computer Fraud and Abuse Act)

### Data Management

- Users are responsible for exporting and saving results if they need to retain them
- Users should not rely on AIShield for long-term storage of scan results
- Users should implement their own data retention policies for exported results

## Security & Compliance

### Data Minimization

AIShield follows the principle of **data minimization**:
- Only collects the minimum data necessary to perform security scans
- Does not collect unnecessary metadata or personal information
- Does not retain data beyond what's needed for the scan session

### Secure Disposal

Data disposal is automatic and secure:
- In-memory data is cleared when the process terminates
- No residual data remains on disk
- No data recovery is possible after process termination

### Compliance Alignment

This data-handling approach aligns with:
- **ISO 27001 Annex A.8.3.1** (Management of removable media) — no persistent storage
- **ISO 27001 Annex A.12.3.1** (Information backup) — not applicable (no persistent data)
- **GDPR Article 5(1)(e)** (Storage limitation) — data not retained beyond necessary period
- **Data minimization principles** — only essential data collected

## Privacy Guarantees

### For Users

- Your scan data is **never shared** with third parties
- Your scan data is **never used** for analytics or marketing
- Your scan data is **never stored** beyond the scan session
- Your scan data is **never logged** to persistent storage

### For Target Applications

- AIShield performs **read-only** security scans
- No data is extracted or stored from target applications
- No credentials or sensitive information is collected
- Scans are non-intrusive and use conservative rate limits

## Changes to This Policy

This data-handling policy may be updated to reflect changes in the application. Users are encouraged to review this document periodically.

## Contact

For questions about data handling, please refer to the project repository or contact the maintainers.

---

**Last Updated:** November 2024

