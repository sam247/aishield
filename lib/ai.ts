import { NucleiFinding } from "./types";

export async function summariseFindings(
  url: string,
  findings: NucleiFinding[]
): Promise<string> {
  if (!findings.length) {
    return `No issues were detected for ${url} in this mock scan.`;
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

  parts.push(
    `This is a mocked summary. A future version will use an AI model (DeepSeek) to generate detailed explanations and fix steps.`
  );

  return parts.join("\n");
}
