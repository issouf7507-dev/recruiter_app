import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offerId = searchParams.get("offerId");

  if (!offerId) {
    return NextResponse.json(
      { error: "Offer ID is required" },
      { status: 400 }
    );
  }
}
