# aishield

An AI-assisted security scanner for web apps powered by Nuclei CLI and DeepSeek API. Scans target URLs for security vulnerabilities and generates AI-powered summaries with actionable recommendations.

## What it does
- Accepts a target URL and runs a real Nuclei security scan (or mock scan for development)
- Returns security findings with severity levels and descriptions
- Generates AI-powered summaries via DeepSeek API (with fallback to manual summaries)
- Stores data in memory only; no auth, billing, or persistence

## Getting started

### Prerequisites
- Node.js 18+ and npm
- (Optional) Nuclei CLI installed if you want to use real scans
- (Optional) DeepSeek API key if you want AI-powered summaries

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   - `DEEPSEEK_API_KEY`: Your DeepSeek API key (get from https://platform.deepseek.com/)
   - `NUCLEI_PATH`: Path to nuclei executable (default: "nuclei")
   - `USE_REAL_NUCLEI`: Leave empty or set to "true" to try real Nuclei first (default: empty, tries real first)

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 and start a scan.

## Configuration

### Scanner Mode (Real-First Default)
By default, the app tries to use real Nuclei CLI first:
- If `USE_REAL_NUCLEI` is empty or `"true"` AND Nuclei is available → uses real scans
- If `USE_REAL_NUCLEI` is `"false"` OR Nuclei is unavailable → falls back to mock scanner
- Mock mode uses sample findings from `data/sample-scan.json`
- The scanner gracefully falls back to mock if real scans fail (never crashes)

**Local Development:**
- If you have Nuclei installed, it will be used automatically
- If Nuclei is not installed, the app automatically falls back to mock mode
- Set `USE_REAL_NUCLEI=false` to force mock mode

**Vercel Deployment:**
- On Vercel, scans run in mock mode unless you deploy a Node environment with Nuclei installed
- The app is designed to work perfectly in mock mode on Vercel (no crashes)
- For real scans on Vercel, you'd need a self-hosted or custom server with Nuclei installed

### AI Summaries
Set `DEEPSEEK_API_KEY` in your `.env` to enable AI-powered summaries:
- Uses DeepSeek API to generate structured summaries with:
  - High-level summary (2-4 bullet points)
  - Risk assessment (overall rating + justification)
  - Fix this first (3-6 prioritized action items)
  - Okay to ship? (deployment readiness recommendation)
- Falls back to manual summaries if API call fails or key is not set
- Works with both mock and real scans

## Deployment

### Vercel
The app is ready for Vercel deployment:
- API routes explicitly use Node.js runtime (required for `child_process`)
- Gracefully falls back to mock scanner if Nuclei is unavailable
- No crashes or errors if Nuclei is not installed
- Set `DEEPSEEK_API_KEY` in Vercel environment variables for AI summaries

**Note:** Real Nuclei scans require Nuclei CLI to be installed on the server. On standard Vercel deployments, this is not available, so scans will automatically use mock mode.

## Notes
- All scan data is ephemeral and stored in memory (lost on server restart)
- No authentication or billing - suitable for local development and demos
- Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS
- Scanner and AI logic are server-side only (no client-side imports)
