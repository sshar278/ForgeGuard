import { BackendMetadata, Finding, Summary } from "./types"

// Generate a unique ID for findings
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Run all deterministic checks on metadata
export function runChecks(metadata: BackendMetadata): { findings: Finding[]; score: number; summary: Summary } {
  const findings: Finding[] = []

  // SCHEMA CHECKS
  if (metadata.tables && Array.isArray(metadata.tables)) {
    findings.push(...checkSchema(metadata))
  }

  // AUTH CHECKS
  if (metadata.authRules && Array.isArray(metadata.authRules)) {
    findings.push(...checkAuth(metadata))
  }

  // DEPLOY CHECKS
  if (metadata.functions && Array.isArray(metadata.functions)) {
    findings.push(...checkDeploy(metadata))
  }

  // Calculate score: start at 100 and compute a weighted deduction based on findings.
  // Use a capped deduction to avoid scores collapsing to 0 for large numbers of findings
  // (keeps scores more informative). We keep the original weights but cap the
  // maximum deduction to 80 points.
  let rawDeduction = 0
  findings.forEach(finding => {
    switch (finding.severity) {
      case "HIGH":
        rawDeduction += 20
        break
      case "MEDIUM":
        rawDeduction += 10
        break
      case "LOW":
        rawDeduction += 5
        break
    }
  })

  const maxDeduction = 80 // don't deduct more than 80 points
  const deduction = Math.min(rawDeduction, maxDeduction)
  let score = 100 - deduction
  // Clamp final score between 0 and 100 just in case
  score = Math.max(0, Math.min(100, score))

  // Calculate summary
  const summary: Summary = {
    high: findings.filter(f => f.severity === "HIGH").length,
    medium: findings.filter(f => f.severity === "MEDIUM").length,
    low: findings.filter(f => f.severity === "LOW").length,
  }

  return { findings, score, summary }
}

// SCHEMA CHECKS
function checkSchema(metadata: BackendMetadata): Finding[] {
  const findings: Finding[] = []

  // Collect all table names for foreign key validation
  const tableNames = new Set(metadata.tables.map(t => t.name))

  for (const table of metadata.tables) {
    const columnNames = new Set(table.columns.map(c => c.name))

    // Check: Table without primary key => HIGH
    const hasPrimaryKey = table.columns.some(c => c.primaryKey === true)
    if (!hasPrimaryKey) {
      findings.push({
        id: generateId(),
        severity: "HIGH",
        category: "SCHEMA",
        title: `Table "${table.name}" has no primary key`,
        evidence: `Table ${table.name} has ${table.columns.length} columns but no primary key defined.`,
        recommendation: `Add a primary key column (e.g., "id" with integer type and primaryKey: true) to table "${table.name}".`,
      })
    }

    for (const column of table.columns) {
      // Check: Column named email/title nullable => MEDIUM
      if ((column.name === "email" || column.name === "title") && column.nullable === true) {
        findings.push({
          id: generateId(),
          severity: "MEDIUM",
          category: "SCHEMA",
          title: `Column "${column.name}" in table "${table.name}" is nullable`,
          evidence: `Column "${column.name}" in table "${table.name}" has nullable: true. This may cause data integrity issues.`,
          recommendation: `Set nullable: false for column "${column.name}" in table "${table.name}" to ensure data integrity.`,
        })
      }

      // Check: Column named *_id without foreignKey => HIGH
      if (column.name.endsWith("_id") && !column.foreignKey) {
        findings.push({
          id: generateId(),
          severity: "HIGH",
          category: "SCHEMA",
          title: `Column "${column.name}" in table "${table.name}" lacks foreign key`,
          evidence: `Column "${column.name}" in table "${table.name}" ends with "_id" but has no foreignKey relationship defined.`,
          recommendation: `Add a foreignKey relationship to column "${column.name}" pointing to the referenced table and column.`,
        })
      }

      // Check: foreignKey points to missing table/column => HIGH
      if (column.foreignKey) {
        if (!tableNames.has(column.foreignKey.table)) {
          findings.push({
            id: generateId(),
            severity: "HIGH",
            category: "SCHEMA",
            title: `Foreign key in "${table.name}.${column.name}" points to non-existent table`,
            evidence: `Column "${column.name}" references table "${column.foreignKey.table}" which does not exist in the schema.`,
            recommendation: `Either create the missing table "${column.foreignKey.table}" or fix the foreignKey reference.`,
          })
        }
      }
    }
  }

  return findings
}

// AUTH CHECKS
function checkAuth(metadata: BackendMetadata): Finding[] {
  const findings: Finding[] = []
  const writeMethods = ["POST", "PUT", "PATCH", "DELETE"]

  for (const rule of metadata.authRules) {
    // Check: Write method with requiresAuth=false => HIGH
    if (writeMethods.includes(rule.method.toUpperCase()) && rule.requiresAuth === false) {
      findings.push({
        id: generateId(),
        severity: "HIGH",
        category: "AUTH",
        title: `Write endpoint "${rule.method} ${rule.endpoint}" has no authentication`,
        evidence: `Endpoint ${rule.method} ${rule.endpoint} allows write operations without authentication (requiresAuth: false).`,
        recommendation: `Set requiresAuth: true for endpoint ${rule.method} ${rule.endpoint} to prevent unauthorized data modification.`,
      })
    }

    // Check: requiresAuth=true but rolesAllowed empty => HIGH
    if (rule.requiresAuth === true && (!rule.rolesAllowed || rule.rolesAllowed.length === 0)) {
      findings.push({
        id: generateId(),
        severity: "HIGH",
        category: "AUTH",
        title: `Endpoint "${rule.method} ${rule.endpoint}" requires auth but has no allowed roles`,
        evidence: `Endpoint ${rule.method} ${rule.endpoint} has requiresAuth: true but rolesAllowed is empty. No users can access this endpoint.`,
        recommendation: `Add appropriate roles to rolesAllowed (e.g., ["user", "admin"]) for endpoint ${rule.method} ${rule.endpoint}.`,
      })
    }

    // Check: DELETE endpoint allowed role "user" => MEDIUM
    if (rule.method.toUpperCase() === "DELETE" && rule.rolesAllowed && rule.rolesAllowed.includes("user")) {
      findings.push({
        id: generateId(),
        severity: "MEDIUM",
        category: "AUTH",
        title: `DELETE endpoint "${rule.endpoint}" allows "user" role`,
        evidence: `Endpoint DELETE ${rule.endpoint} allows users with "user" role to delete resources. This may be overly permissive.`,
        recommendation: `Consider restricting DELETE operations on "${rule.endpoint}" to "admin" role only.`,
      })
    }
  }

  return findings
}

// DEPLOY CHECKS
function checkDeploy(metadata: BackendMetadata): Finding[] {
  const findings: Finding[] = []

  // Check if any auth rules mention admin role
  const hasAdminAuthRule = Array.isArray(metadata.authRules) && metadata.authRules.some(rule =>
    rule.rolesAllowed && rule.rolesAllowed.includes("admin")
  )

  // Check: Destructive function without admin auth rule => MEDIUM
  for (const func of metadata.functions) {
    if (func.isDestructive === true && !hasAdminAuthRule) {
      findings.push({
        id: generateId(),
        severity: "MEDIUM",
        category: "DEPLOY",
        title: `Destructive function "${func.name}" lacks admin protection`,
        evidence: `Function "${func.name}" has isDestructive: true but no auth rules mention "admin" role.`,
        recommendation: `Add auth rules that require "admin" role before executing destructive function "${func.name}".`,
      })
    }
  }

  return findings
}
