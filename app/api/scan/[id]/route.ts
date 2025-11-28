import { NextResponse } from "next/server";
import { getScan } from "../../../../lib/store";

// Explicitly use Node.js runtime for consistency with POST /api/scan
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const scan = getScan(params.id);

  if (!scan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(scan);
}
