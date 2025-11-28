# Data Retention & Disposal Policy

## Purpose

This document provides a detailed data retention and disposal policy for AIShield, suitable for compliance audits and stakeholder review.

## Data Categories

### 1. Scan Metadata

**Category:** Non-PII, Operational Data

**Data Elements:**
- Scan ID (UUID, randomly generated)
- Target URL (user-provided)
- Scan status (pending, running, complete, error)
- Timestamps (createdAt, updatedAt)

**Classification:** Non-sensitive operational metadata

### 2. Security Findings

**Category:** Security Assessment Results

**Data Elements:**
- Vulnerability name
- Severity level (critical, high, medium, low, info)
- Description
- Matched location (URL/path)
- Tags (optional)

**Classification:** Non-PII, security assessment data

### 3. AI-Generated Summaries

**Category:** Processed Analysis

**Data Elements:**
- AI-generated summary text (if DeepSeek API is enabled)
- Risk assessment
- Fix recommendations

**Classification:** Non-PII, processed analysis

## Retention Periods

### Default Retention: Ephemeral (Session-Based)

| Data Category | Retention Period | Disposal Method |
|--------------|------------------|-----------------|
| Scan Metadata | Until scan completion or server restart | Automatic in-memory flush |
| Security Findings | Until scan completion or server restart | Automatic in-memory flush |
| AI Summaries | Until scan completion or server restart | Automatic in-memory flush |
| Error Messages | Until scan completion or server restart | Automatic in-memory flush |

### Maximum Retention

**Maximum retention period:** 60 seconds (typical serverless function timeout)

- On serverless platforms (e.g., Vercel), data is automatically destroyed when the function execution completes
- On persistent servers, data is destroyed on server restart or process termination
- **No data persists beyond a single scan session**

## Disposal Methods

### Primary Method: In-Memory Flush

1. **Automatic Disposal:**
   - Data stored in in-memory `Map` data structure
   - Automatically cleared when:
     - Node.js process terminates
     - Server restarts
     - Serverless function execution ends

2. **No Manual Disposal Required:**
   - No database cleanup scripts needed
   - No file deletion procedures required
   - No manual intervention necessary

### Secondary Method: Process Termination

- Operating system automatically reclaims memory when process ends
- No residual data remains in memory after process termination
- No disk-based storage to clean up

## Data Classification

### Non-PII Data

All data handled by AIShield is classified as **Non-Personally Identifiable Information (Non-PII)**:

- No names, email addresses, or personal identifiers
- No user account information
- No authentication credentials
- No personal preferences or profiles

### No Raw Request Data

AIShield does **not** store:
- HTTP request bodies
- HTTP response bodies
- Request headers
- Response headers
- Network packet data
- Raw API responses

### Security Assessment Data Only

Data stored is limited to:
- Security vulnerability findings
- Assessment metadata
- Processed summaries

## Storage Locations

### Primary Storage: In-Memory (RAM)

- **Location:** Node.js process memory (RAM)
- **Type:** In-memory `Map<string, Scan>` data structure
- **Persistence:** None (ephemeral)
- **Access:** Server-side only, not accessible from client

### No Secondary Storage

- ❌ No database storage
- ❌ No file system storage
- ❌ No cloud storage
- ❌ No external data stores

## Audit Trail

### What Is Logged

**Minimal operational logging only:**
- Scan start/complete status (console.log, non-persistent)
- Error messages (console.error, non-persistent)
- Scanner mode selection (console.log, non-persistent)

### What Is NOT Logged

- ❌ Target URLs (not logged to persistent storage)
- ❌ Scan results (not logged)
- ❌ User actions (not logged)
- ❌ Request/response data (not logged)

### Log Retention

- Console logs are **non-persistent**
- Logs exist only during process execution
- No log files are created
- No log aggregation or retention

## Compliance Considerations

### ISO 27001 Alignment

- **Annex A.8.3.1** (Management of removable media): Not applicable (no persistent storage)
- **Annex A.12.3.1** (Information backup): Not applicable (ephemeral data)
- **Annex A.12.4.1** (Event logging): Minimal, non-persistent logging only

### GDPR Alignment

- **Article 5(1)(e)** (Storage limitation): Data not retained beyond necessary period
- **Article 25** (Data protection by design): Ephemeral storage by default
- **Article 32** (Security of processing): In-memory only, automatic disposal

### Data Minimization

- Only essential data collected
- No unnecessary metadata
- No personal information
- No raw request/response data

## User Data Export

### Export Functionality

If users export scan results:
- Export is **user-initiated** (explicit action required)
- Export files are generated **on-demand**
- Export files are **not stored** on the server
- Users manage exported files independently

### Export Data Scope

Exported data may include:
- Scan metadata (ID, URL, timestamps)
- Security findings
- AI-generated summary

**Note:** Export functionality is optional and user-controlled.

## Third-Party Services

### DeepSeek API (Optional)

If `DEEPSEEK_API_KEY` is configured:
- Scan findings are sent to DeepSeek API for summary generation
- **No scan data is stored by DeepSeek** (API call only)
- DeepSeek API usage is subject to DeepSeek's privacy policy
- Users can disable AI summaries by not setting the API key

### Nuclei CLI (Optional)

If Nuclei CLI is used:
- Nuclei runs locally or on the server
- **No data is sent to external Nuclei services**
- Nuclei output is processed and stored in-memory only
- No persistent Nuclei logs are created

## Data Breach Response

### Breach Scenario

In the unlikely event of a security breach:
- **Impact:** Minimal (ephemeral data only)
- **Exposure Window:** Limited to active scan sessions
- **Data at Risk:** Only scans in progress at time of breach
- **Recovery:** Automatic (data destroyed on process termination)

### Notification

- No persistent user data to notify about
- No user accounts or contact information stored
- Breach impact limited to active scan sessions

## Policy Review

This retention policy is reviewed and updated as needed to reflect:
- Changes in application architecture
- Changes in data handling practices
- Compliance requirement updates

**Last Review:** November 2024

---

**Document Version:** 1.0  
**Effective Date:** November 2024

