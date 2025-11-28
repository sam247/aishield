# Privacy Mode Testing Instructions

This document provides manual testing instructions to verify AIShield's privacy-first data handling model.

## Test 1: Verify No File Creation

**Objective:** Confirm that no files are created on disk during scan operations.

**Steps:**
1. Start with a clean state (no existing scan data)
2. Run the application: `npm run dev`
3. Before starting a scan, check the project directory:
   ```bash
   # List all files (excluding node_modules and .next)
   find . -type f -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" | sort
   ```
4. Start a scan (mock mode is fine): Submit a URL via the web interface
5. Wait for scan to complete
6. Check the directory again:
   ```bash
   find . -type f -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" | sort
   ```
7. **Expected Result:** No new files should be created (only temporary Next.js build files in `.next`)

## Test 2: Verify In-Memory Storage Only

**Objective:** Confirm that scan data exists only in memory.

**Steps:**
1. Start the application: `npm run dev`
2. Start a scan and note the scan ID from the URL (e.g., `/scan/abc-123`)
3. While the scan is running or after completion, check for any database files:
   ```bash
   # Check for common database files
   ls -la *.db *.sqlite *.sqlite3 2>/dev/null || echo "No database files found"
   ```
4. Check for any JSON files containing scan data:
   ```bash
   # Check for scan data files (excluding sample data)
   find . -name "*scan*.json" -not -path "./node_modules/*" -not -path "./data/sample-scan.json"
   ```
5. **Expected Result:** No database files or scan data files should exist

## Test 3: Verify Data Disposal on Restart

**Objective:** Confirm that scan data is destroyed when the server restarts.

**Steps:**
1. Start the application: `npm run dev`
2. Start a scan and wait for it to complete
3. Note the scan ID from the URL
4. Stop the server (Ctrl+C)
5. Restart the server: `npm run dev`
6. Try to access the previous scan: Navigate to `/scan/{previous-scan-id}`
7. **Expected Result:** The scan should not be found (404 error), confirming data was destroyed

## Test 4: Verify No Sensitive Data in Logs

**Objective:** Confirm that sensitive data (URLs, findings) is not logged to persistent storage.

**Steps:**
1. Start the application: `npm run dev`
2. Start a scan with a test URL
3. Check console output for any logged URLs or sensitive data
4. Check for log files:
   ```bash
   # Check for log files
   find . -name "*.log" -not -path "./node_modules/*" 2>/dev/null || echo "No log files found"
   ```
5. **Expected Result:** 
   - Console logs should be minimal (status messages only)
   - No log files should be created
   - URLs should not be logged (or logged in a non-persistent way)

## Test 5: Verify No Environment Variable Exposure

**Objective:** Confirm that scan results are not exposed via environment variables.

**Steps:**
1. Start the application: `npm run dev`
2. Start a scan and wait for completion
3. Check environment variables:
   ```bash
   # List all environment variables (filter for scan-related)
   env | grep -i scan || echo "No scan-related environment variables"
   ```
4. **Expected Result:** No scan data should be present in environment variables

## Test 6: Verify Export Functionality (If Implemented)

**Objective:** If export functionality exists, verify it's explicit and doesn't store data.

**Steps:**
1. Start the application: `npm run dev`
2. Complete a scan
3. Look for any "Save" or "Export" buttons
4. If export exists:
   - Click the export button
   - Verify the file is downloaded client-side
   - Check that no new files are created on the server
5. **Expected Result:** 
   - Export should be explicit (user-initiated)
   - No automatic saving should occur
   - Exported files should be client-side only

## Test 7: Verify Serverless Behavior (Vercel)

**Objective:** Confirm that data is ephemeral on serverless platforms.

**Steps:**
1. Deploy to Vercel (or similar serverless platform)
2. Start a scan and note the scan ID
3. Wait for the scan to complete
4. Wait 60+ seconds (typical serverless function timeout)
5. Try to access the scan again: Navigate to `/scan/{scan-id}`
6. **Expected Result:** The scan should not be found (404), confirming data was destroyed when the function completed

## Test 8: Verify Mock Mode Safety

**Objective:** Confirm that mock mode doesn't store any data.

**Steps:**
1. Set `USE_REAL_NUCLEI=false` in `.env`
2. Start the application: `npm run dev`
3. Run multiple scans in mock mode
4. Verify no files are created
5. Restart the server and verify previous scans are gone
6. **Expected Result:** Mock mode should behave identically to real mode regarding data storage (none)

## Automated Test Script (Optional)

You can create a simple test script to automate some checks:

```bash
#!/bin/bash
# privacy_test.sh

echo "=== Privacy Mode Test ==="

# Test 1: Check for database files
echo "Checking for database files..."
if [ -f *.db ] || [ -f *.sqlite ] || [ -f *.sqlite3 ]; then
  echo "❌ FAIL: Database files found"
else
  echo "✓ PASS: No database files"
fi

# Test 2: Check for scan data files
echo "Checking for scan data files..."
if find . -name "*scan*.json" -not -path "./node_modules/*" -not -path "./data/sample-scan.json" | grep -q .; then
  echo "❌ FAIL: Scan data files found"
else
  echo "✓ PASS: No scan data files"
fi

# Test 3: Check for log files
echo "Checking for log files..."
if find . -name "*.log" -not -path "./node_modules/*" | grep -q .; then
  echo "❌ FAIL: Log files found"
else
  echo "✓ PASS: No log files"
fi

echo "=== Test Complete ==="
```

## Expected Test Results Summary

All tests should confirm:
- ✅ No files created on disk
- ✅ No database storage
- ✅ No persistent logs
- ✅ Data destroyed on restart
- ✅ No environment variable exposure
- ✅ Explicit export only (if implemented)
- ✅ Ephemeral behavior on serverless

## Reporting Issues

If any test fails, please:
1. Document the exact steps that caused the failure
2. Note what data was stored and where
3. Report to the project maintainers

---

**Last Updated:** November 2024

