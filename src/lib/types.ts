// Backend Metadata Types
export interface Column {
  name: string
  type?: string
  nullable?: boolean
  primaryKey?: boolean
  foreignKey?: {
    table: string
    column: string
  }
}

export interface Table {
  name: string
  columns: Column[]
}

export interface AuthRule {
  endpoint: string
  method: string
  requiresAuth: boolean
  rolesAllowed: string[]
}

export interface FunctionMeta {
  name: string
  trigger?: string
  touchesTables?: string[]
  isDestructive?: boolean
}

export interface BackendMetadata {
  tables: Table[]
  authRules: AuthRule[]
  functions: FunctionMeta[]
}

// Finding Types
export type Severity = "HIGH" | "MEDIUM" | "LOW"
export type Category = "SCHEMA" | "AUTH" | "DEPLOY"

export interface Finding {
  id: string
  severity: Severity
  category: Category
  title: string
  evidence: string
  recommendation: string
}

export interface Summary {
  high: number
  medium: number
  low: number
}

// Report Types
export interface Report {
  slug: string
  projectLabel: string
  sourceMode: "insforge" | "manual"
  createdAt: string
  readinessScore: number
  summary: Summary
  findings: Finding[]
  rawMetadata?: BackendMetadata
}
