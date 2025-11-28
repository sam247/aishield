import { NucleiFinding } from "./types";

async function generateFallbackSummary(
  url: string,
  findings: NucleiFinding[]
): Promise<string> {
  if (!findings.length) {
    return `No issues were detected for ${url} in this scan.`;
  }

  const countsBySeverity = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  const parts: string[] = [];
  parts.push(`Security scan summary for ${url}:`);

  if (countsBySeverity.critical) {
    parts.push(
      `- ${countsBySeverity.critical} critical issues detected. You should fix these before shipping.`
    );
  }
  if (countsBySeverity.high) {
    parts.push(`- ${countsBySeverity.high} high severity issues found. Prioritise these.`);
  }
  if (countsBySeverity.medium) {
    parts.push(`- ${countsBySeverity.medium} medium issues worth addressing soon.`);
  }
  if (countsBySeverity.low) {
    parts.push(`- ${countsBySeverity.low} low severity findings (hardening and best practices).`);
  }
  if (countsBySeverity.info) {
    parts.push(`- ${countsBySeverity.info} informational findings.`);
  }

  return parts.join("\n");
}

async function generateDeepSeekSummary(
  url: string,
  findings: NucleiFinding[]
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not set");
  }

  // Truncate findings if too many to avoid token limits
  const findingsToInclude = findings.slice(0, 50);
  const findingsJson = JSON.stringify(findingsToInclude, null, 2);
  const truncatedNote = findings.length > 50 ? `\n\nNote: Showing first 50 of ${findings.length} findings.` : "";

  const prompt = `You are a security expert helping a non-technical founder understand security scan results.

This is output from an automated security scan similar to Nuclei. The findings below represent potential security issues detected on the target application.

Target URL: ${url}

Security Findings (JSON):
${findingsJson}${truncatedNote}

Please provide a structured summary using markdown headings. Format your response exactly as follows:

## Summary
Provide 2-4 short bullet points giving a high-level overview of what was found. Keep this brief and non-technical.

## Risk
Provide an overall risk rating: "Low", "Medium", "High", or "Critical". Then add one line explaining why (e.g., "Critical: Multiple critical vulnerabilities detected that could lead to data breaches").

## Fix this first
List 3-6 bullet points ordered by impact. Each bullet should include:
- Issue type (e.g., "Missing security headers")
- Impact (e.g., "exposes your app to XSS attacks")
- Simple fix suggestion (e.g., "Add Content-Security-Policy header")

Focus on the most critical issues first. Be specific but keep language simple for a non-security expert.

## Okay to ship?
Provide one line recommendation: "Safe for private beta", "Safe for public beta", or "Not safe yet" - based on the severity of findings. Add a brief reason if needed.

Keep the entire response concise and actionable. Use simple language throughout.`;

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a helpful security expert who explains security issues in clear, actionable terms for non-technical founders.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary content in DeepSeek API response");
    }

    return summary.trim();
  } catch (error) {
    console.error("[ai] DeepSeek API call failed:", error);
    throw error;
  }
}

export async function summariseFindings(
  url: string,
  findings: NucleiFinding[]
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.log("[ai] Using fallback summary (DEEPSEEK_API_KEY not set)");
    return generateFallbackSummary(url, findings);
  }

  try {
    console.log("[ai] Using DeepSeek API for summary generation");
    return await generateDeepSeekSummary(url, findings);
  } catch (error) {
    console.warn("[ai] DeepSeek API failed, falling back to manual summary:", error);
    return generateFallbackSummary(url, findings);
  }
}
