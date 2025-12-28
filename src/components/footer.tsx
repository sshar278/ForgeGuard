import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            ForgeGuard — Backend Audit & Safety
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Verify your backend before deployment
        </p>
      </div>
    </footer>
  )
}
