import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

const REPORTS_DIR = join(process.cwd(), "reports")
const REPORTS_FILE = join(REPORTS_DIR, "reports.json")

// Ensure reports directory exists
if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true })
}

// Simple in-memory + file storage for reports
interface ReportsData {
  reports: Record<string, Report>
}

interface Report {
  slug: string
  projectLabel: string
  sourceMode: "insforge" | "manual"
  createdAt: string
  readinessScore: number
  summary: {
    high: number
    medium: number
    low: number
  }
  findings: Array<{
    id: string
    severity: "HIGH" | "MEDIUM" | "LOW"
    category: "SCHEMA" | "AUTH" | "DEPLOY"
    title: string
    evidence: string
    recommendation: string
  }>
  rawMetadata?: any
}

// Load reports from file
function loadReportsData(): ReportsData {
  if (!existsSync(REPORTS_FILE)) {
    return { reports: {} }
  }
  try {
    const data = readFileSync(REPORTS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return { reports: {} }
  }
}

// Save reports to file
function saveReportsData(data: ReportsData): void {
  writeFileSync(REPORTS_FILE, JSON.stringify(data, null, 2), "utf-8")
}

// Generate a short URL-safe slug
function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let slug = ""
  for (let i = 0; i < 6; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}

// Check if slug exists, generate new one if needed
function getUniqueSlug(): string {
  const data = loadReportsData()
  let slug = generateSlug()
  while (data.reports[slug]) {
    slug = generateSlug()
  }
  return slug
}

// Save a new report
export function saveReport(report: Omit<Report, "slug" | "createdAt">): string {
  const data = loadReportsData()
  const slug = getUniqueSlug()
  const newReport: Report = {
    ...report,
    slug,
    createdAt: new Date().toISOString(),
  }
  data.reports[slug] = newReport
  saveReportsData(data)
  return slug
}

// Get a report by slug
export function getReport(slug: string): Report | null {
  const data = loadReportsData()
  return data.reports[slug] || null
}
