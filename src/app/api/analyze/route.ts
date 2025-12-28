import { NextRequest, NextResponse } from "next/server"
import { runChecks } from "@/lib/checks"
import { saveReport } from "@/lib/store"
import { BackendMetadata } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectLabel, sourceMode, baseUrl, apiKey, metadataJson } = body

    // Validate required fields
    if (!projectLabel || typeof projectLabel !== "string") {
      return NextResponse.json(
        { error: "projectLabel is required" },
        { status: 400 }
      )
    }

    if (!sourceMode || !["insforge", "manual"].includes(sourceMode)) {
      return NextResponse.json(
        { error: "sourceMode must be 'insforge' or 'manual'" },
        { status: 400 }
      )
    }

    let metadata: BackendMetadata

    // Fetch or parse metadata based on sourceMode
    if (sourceMode === "insforge") {
      if (!baseUrl || !apiKey) {
        return NextResponse.json(
          { error: "baseUrl and apiKey are required for insforge mode" },
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
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch metadata: ${response.statusText}` },
          { status: 400 }
        )
      }

      metadata = await response.json()

    } else {
      // manual mode
      if (!metadataJson) {
        return NextResponse.json(
          { error: "metadataJson is required for manual mode" },
          { status: 400 }
        )
      }

      try {
        metadata = JSON.parse(metadataJson)
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid JSON in metadataJson" },
          { status: 400 }
        )
      }
    }

    // Run deterministic checks
    const { findings, score, summary } = runChecks(metadata)

    // Save report
    const slug = saveReport({
      projectLabel,
      sourceMode,
      readinessScore: score,
      summary,
      findings,
      rawMetadata: sourceMode === "manual" ? metadata : undefined, // Don't store large metadata for insforge
    })

    return NextResponse.json({
      success: true,
      slug,
      score,
      summary,
    })

  } catch (error) {
    console.error("Error analyzing metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze metadata",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
