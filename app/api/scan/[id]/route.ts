import { NextResponse } from "next/server";
import { getScan } from "../../../../lib/store";

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
