"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { sampleMetadata } from "@/lib/sampleMetadata"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Server, FileJson } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("insforge")

  // InsForge mode state
  const [insforgeProjectLabel, setInsforgeProjectLabel] = useState("")
  const [insforgeUrl, setInsforgeUrl] = useState("")
  const [insforgeApiKey, setInsforgeApiKey] = useState("")

  // Manual JSON mode state
  const [manualProjectLabel, setManualProjectLabel] = useState("")
  const [manualJson, setManualJson] = useState("")
  const [jsonError, setJsonError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Validate JSON
  const validateJson = (value: string) => {
    if (!value.trim()) {
      setJsonError("")
      return true
    }
    try {
      JSON.parse(value)
      setJsonError("")
      return true
    } catch (e) {
      setJsonError("Invalid JSON format")
      return false
    }
  }

  const handleJsonChange = (value: string) => {
    setManualJson(value)
    validateJson(value)
  }

  const loadSampleJson = () => {
    setManualJson(JSON.stringify(sampleMetadata, null, 2))
    setJsonError("")
    toast.success("Sample JSON Loaded", {
      description: "Pre-filled with sample metadata that triggers multiple findings.",
    })
  }

  const handleRunAudit = async (sourceMode: "insforge" | "manual") => {
    setIsLoading(true)

    try {
      const requestBody: any = {
        projectLabel: sourceMode === "insforge" ? insforgeProjectLabel : manualProjectLabel,
        sourceMode,
      }

      if (sourceMode === "insforge") {
        requestBody.baseUrl = insforgeUrl.trim()
        requestBody.apiKey = insforgeApiKey.trim()
      } else {
        requestBody.metadataJson = manualJson
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Audit Complete", {
          description: `Score: ${result.score} - Redirecting to report...`,
        })
        // Redirect to report page
        router.push(`/r/${result.slug}`)
      } else {
        toast.error("Audit Failed", {
          description: result.error || "Failed to analyze metadata",
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      toast.error("Audit Failed", {
        description: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canRunInsforgeAudit = Boolean(insforgeProjectLabel.trim()) && Boolean(insforgeUrl.trim()) && Boolean(insforgeApiKey.trim())
  const canRunManualAudit = Boolean(manualProjectLabel.trim()) && Boolean(manualJson.trim()) && !jsonError

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Backend Audit & Safety Check</h1>
        <p className="text-muted-foreground text-lg">
          Verify your InsForge backend deploy readiness with deterministic analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Audit</CardTitle>
          <CardDescription>
            Connect to an InsForge project or paste metadata JSON to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="insforge" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Connect InsForge
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Paste JSON
              </TabsTrigger>
            </TabsList>

            {/* Tab A: Connect InsForge */}
            <TabsContent value="insforge" className="space-y-4 mt-6">
              <div className="space-y-2">
                <label htmlFor="insforge-label" className="text-sm font-medium">
                  Project Label <span className="text-destructive">*</span>
                </label>
                <Input
                  id="insforge-label"
                  placeholder="e.g., My E-commerce Backend"
                  value={insforgeProjectLabel}
                  onChange={(e) => setInsforgeProjectLabel(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="insforge-url" className="text-sm font-medium">
                  InsForge Project URL <span className="text-destructive">*</span>
                </label>
                <Input
                  id="insforge-url"
                  placeholder="https://your-project.us-west.insforge.app"
                  value={insforgeUrl}
                  onChange={(e) => setInsforgeUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="insforge-api-key" className="text-sm font-medium">
                  InsForge API Key <span className="text-destructive">*</span>
                </label>
                <Input
                  id="insforge-api-key"
                  type="password"
                  placeholder="Your API key"
                  value={insforgeApiKey}
                  onChange={(e) => setInsforgeApiKey(e.target.value)}
                />
              </div>

              {!canRunInsforgeAudit && (
                <p className="text-xs text-muted-foreground">
                  Please fill in all fields above to enable the audit
                </p>
              )}
              <Button
                type="button"
                onClick={() => handleRunAudit("insforge")}
                disabled={!canRunInsforgeAudit || isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Run Audit
              </Button>
            </TabsContent>

            {/* Tab B: Paste JSON */}
            <TabsContent value="manual" className="space-y-4 mt-6">
              <div className="space-y-2">
                <label htmlFor="manual-label" className="text-sm font-medium">
                  Project Label <span className="text-destructive">*</span>
                </label>
                <Input
                  id="manual-label"
                  placeholder="e.g., My E-commerce Backend"
                  value={manualProjectLabel}
                  onChange={(e) => setManualProjectLabel(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="manual-json" className="text-sm font-medium">
                    Metadata JSON <span className="text-destructive">*</span>
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={loadSampleJson}
                    className="h-7 text-xs"
                  >
                    Load Sample JSON
                  </Button>
                </div>
                <Textarea
                  id="manual-json"
                  placeholder='{"tables": [...], "authRules": [...], "functions": [...]}'
                  className="min-h-[200px] font-mono text-sm"
                  value={manualJson}
                  onChange={(e) => handleJsonChange(e.target.value)}
                />
                {jsonError && (
                  <p className="text-sm text-destructive">{jsonError}</p>
                )}
              </div>

              {!canRunManualAudit && (
                <p className="text-xs text-muted-foreground">
                  {!manualProjectLabel.trim() ? "Project label is required" : !manualJson.trim() ? "JSON is required" : "Please fix the JSON error above"}
                </p>
              )}
              <Button
                type="button"
                onClick={() => handleRunAudit("manual")}
                disabled={!canRunManualAudit || isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Run Audit
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
