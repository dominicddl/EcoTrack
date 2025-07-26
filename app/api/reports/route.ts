import { NextRequest, NextResponse } from "next/server";
import { getRecentReports, createReport } from "@/utils/db/actions";

export async function GET() {
  const reports = await getRecentReports();
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, location, wasteType, amount, imageUrl, verificationResult } =
    body;
  const report = await createReport(
    userId,
    location,
    wasteType,
    amount,
    imageUrl,
    verificationResult,
  );
  return NextResponse.json(report);
}
