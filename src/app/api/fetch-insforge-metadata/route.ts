import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseUrl, apiKey } = body

    // Validate baseUrl format
    if (!baseUrl || typeof baseUrl !== "string") {
      return NextResponse.json(
        { error: "baseUrl is required and must be a string" },
        { status: 400 }
      )
    }

    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "baseUrl must start with http:// or https://" },
        { status: 400 }
      )
    }

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "apiKey is required and must be a string" },
        { status: 400 }
      )
    }

    // Fetch metadata from InsForge
    const metadataUrl = `${baseUrl}/api/metadata`
    const response = await fetch(metadataUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      // Next.js edge runtime doesn't support all fetch options, keep it simple
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      return NextResponse.json(
        {
          error: `InsForge API returned ${response.status}: ${response.statusText}`,
          status: response.status,
          details: errorText,
        },
        { status: 200 } // Return 200 so client can handle the error gracefully
      )
    }

    const metadata = await response.json()

    return NextResponse.json({
      success: true,
      metadata,
    })

  } catch (error) {
    console.error("Error fetching InsForge metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch metadata",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 200 } // Return 200 so client can handle the error gracefully
    )
  }
}
