import { NextRequest, NextResponse } from "next/server"
import { getReport } from "@/lib/store"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: "slug is required" },
        { status: 400 }
      )
    }

    const report = getReport(slug)

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(report)

  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch report",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
