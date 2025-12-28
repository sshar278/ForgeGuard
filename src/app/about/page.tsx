import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Server, FileCheck, Share2, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">About ForgeGuard</h1>
        <p className="text-muted-foreground text-lg">
          Ensuring agent-generated backends are production-ready
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              What ForgeGuard Does
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              ForgeGuard is a backend audit and safety tool that analyzes your InsForge project metadata
              to determine if it&apos;s ready for production deployment.
            </p>
            <p>
              Using deterministic checks (no LLM runtime), it evaluates your database schema,
              authentication rules, and deployment configurations to generate a readiness score and findings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Why It Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Agent-generated backends are powerful but can introduce subtle issues:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Tables without primary keys</li>
              <li>Missing foreign key relationships</li>
              <li>Insecure authentication rules</li>
              <li>Destructive operations without proper safeguards</li>
            </ul>
            <p className="text-foreground font-medium">
              ForgeGuard catches these issues before you deploy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li className="pl-2">
                <strong>Connect to InsForge:</strong> Provide your project URL and API key, or paste metadata JSON
              </li>
              <li className="pl-2">
                <strong>Deterministic Analysis:</strong> ForgeGuard runs a series of checks on schema, auth, and deploy configurations
              </li>
              <li className="pl-2">
                <strong>Get Results:</strong> Receive a readiness score (0–100) with detailed findings
              </li>
              <li className="pl-2">
                <strong>Share:</strong> Share a link to your report with your team
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Shareable Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Every audit generates a unique shareable link at <code className="bg-muted px-2 py-1 rounded text-sm font-mono">/r/[slug]</code>.
              Share reports with your team to review findings before deployment.
            </p>
          </CardContent>
        </Card>

        {/* CTA Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Ready to audit your backend?</h3>
              <p className="text-muted-foreground text-sm">
                Run a comprehensive safety check in seconds.
              </p>
            </div>
            <Link href="/">
              <Button>
                Start Audit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
