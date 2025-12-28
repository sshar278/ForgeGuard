"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Copy, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react"

type Severity = "HIGH" | "MEDIUM" | "LOW"
type Category = "SCHEMA" | "AUTH" | "DEPLOY"

interface Finding {
  id: string
  severity: Severity
  category: Category
  title: string
  evidence: string
  recommendation: string
}

interface Summary {
  high: number
  medium: number
  low: number
}

interface Report {
  slug: string
  projectLabel: string
  sourceMode: "insforge" | "manual"
  createdAt: string
  readinessScore: number
  summary: Summary
  findings: Finding[]
}

const categoryLabels: Record<Category, string> = {
  SCHEMA: "Schema",
  AUTH: "Auth",
  DEPLOY: "Deploy",
}

const categoryBadgeVariants: Record<Category, "default" | "secondary" | "outline"> = {
  SCHEMA: "default",
  AUTH: "secondary",
  DEPLOY: "outline",
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [filterTab, setFilterTab] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchReport() {
      setIsLoading(true)
      setNotFound(false)

      try {
        const response = await fetch(`/api/report/${slug}`)
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        if (!response.ok) {
          throw new Error("Failed to fetch report")
        }
        const data = await response.json()
        setReport(data)
      } catch (error) {
        console.error("Error fetching report:", error)
        toast.error("Failed to load report")
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchReport()
    }
  }, [slug])

  const handleCopyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case "HIGH":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "MEDIUM":
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      case "LOW":
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-500" />
    }
  }

  const getSeverityBadgeVariant = (severity: Severity): "destructive" | "secondary" | "outline" => {
    switch (severity) {
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "secondary"
      case "LOW":
        return "outline"
    }
  }

  const filteredFindings = report?.findings.filter(f => {
    if (filterTab === "all") return true
    return f.severity === filterTab
  }) || []

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not found state
  if (notFound || !report) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The report you're looking for doesn't exist or may have been deleted.
            </p>
            <Button onClick={() => router.push("/")}>
              Create New Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate score color and text
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-500"
    if (score >= 50) return "text-yellow-600 dark:text-yellow-500"
    return "text-destructive"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good"
    if (score >= 50) return "Fair"
    return "Poor"
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header with back button and copy link */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Share Link
            </>
          )}
        </Button>
      </div>

      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{report.projectLabel}</span>
            <Badge variant="outline">{report.sourceMode === "insforge" ? "InsForge" : "Manual"}</Badge>
          </CardTitle>
          <CardDescription>
            Audit completed {new Date(report.createdAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-5xl font-bold ${getScoreColor(report.readinessScore)}`}>
                  {report.readinessScore}
                </span>
                <span className="text-lg text-muted-foreground mb-1">/ 100</span>
                <span className={`text-sm font-medium mb-1 ${getScoreColor(report.readinessScore)}`}>
                  {getScoreLabel(report.readinessScore)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    report.readinessScore >= 80
                      ? "bg-green-600 dark:bg-green-500"
                      : report.readinessScore >= 50
                      ? "bg-yellow-600 dark:bg-yellow-500"
                      : "bg-destructive"
                  }`}
                  style={{ width: `${report.readinessScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Severity badges */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {report.summary.high} High
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {report.summary.medium} Medium
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {report.summary.low} Low
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Findings</CardTitle>
          <CardDescription>
            {filteredFindings.length} {filterTab === "all" ? "total" : filterTab.toLowerCase()} issue{filteredFindings.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as typeof filterTab)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({report.findings.length})
              </TabsTrigger>
              <TabsTrigger value="HIGH">
                High ({report.summary.high})
              </TabsTrigger>
              <TabsTrigger value="MEDIUM">
                Medium ({report.summary.medium})
              </TabsTrigger>
              <TabsTrigger value="LOW">
                Low ({report.summary.low})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filterTab} className="mt-4">
              {filteredFindings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No findings in this category.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFindings.map((finding) => (
                    <Card key={finding.id} className="border-l-4" style={{
                      borderLeftColor: finding.severity === "HIGH"
                        ? "hsl(var(--destructive))"
                        : finding.severity === "MEDIUM"
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground))"
                    }}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(finding.severity)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getSeverityBadgeVariant(finding.severity)}>
                                {finding.severity}
                              </Badge>
                              <Badge variant={categoryBadgeVariants[finding.category]}>
                                {categoryLabels[finding.category]}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{finding.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              <strong>Evidence:</strong> {finding.evidence}
                            </p>
                            <p className="text-sm">
                              <strong>Recommendation:</strong> {finding.recommendation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CTA to run another audit */}
      <Card className="bg-muted/50">
        <CardContent className="flex items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Want to audit another project?
          </p>
          <Button size="sm" onClick={() => router.push("/")}>
            Run Another Audit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
