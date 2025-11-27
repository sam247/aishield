import sampleFindings from "../data/sample-scan.json";
import { NucleiFinding } from "./types";

export async function runMockScan(url: string): Promise<NucleiFinding[]> {
  await new Promise((r) => setTimeout(r, 2000));
  return sampleFindings as NucleiFinding[];
}
