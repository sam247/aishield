# vibescan

A minimal mocked MVP of an AI-assisted security scanner for web apps. The prototype simulates a Nuclei-style scan and generates a basic AI summary (DeepSeek stub) with no real integrations yet.

## What it does
- Accepts a target URL and triggers a mocked scan.
- Returns sample findings from static JSON.
- Generates a local summary to mimic a future DeepSeek call.
- Stores data in memory only; no auth or persistence.

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 and start a scan.

## Notes
- Nuclei and DeepSeek are **not** wired up. The scanner uses `data/sample-scan.json`, and the summary is generated in `lib/ai.ts`.
- All scan data is ephemeral and stored in memory.
- Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS for easy future extension.
