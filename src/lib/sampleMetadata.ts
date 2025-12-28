import { BackendMetadata } from "./types"

// Sample metadata designed to trigger multiple findings for testing
export const sampleMetadata: BackendMetadata = {
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "integer", primaryKey: true },
        // MEDIUM: email nullable
        { name: "email", type: "text", nullable: true },
        // MEDIUM: name nullable
        { name: "name", type: "text", nullable: true },
      ],
    },
    {
      name: "posts",
      columns: [
        // HIGH: posts table has no primary key
        { name: "id", type: "integer" },
        // MEDIUM: title nullable
        { name: "title", type: "text", nullable: true },
        // HIGH: user_id without foreignKey
        { name: "user_id", type: "integer" },
      ],
    },
    {
      name: "comments",
      columns: [
        { name: "id", type: "integer", primaryKey: true },
        { name: "content", type: "text" },
        // HIGH: post_id with foreignKey to missing table (typo in table name)
        { name: "post_id", type: "integer", foreignKey: { table: "post", column: "id" } },
      ],
    },
  ],
  authRules: [
    // HIGH: POST without auth
    { endpoint: "/users", method: "POST", requiresAuth: false, rolesAllowed: [] },
    // HIGH: requiresAuth true but no roles
    { endpoint: "/users", method: "GET", requiresAuth: true, rolesAllowed: [] },
    // MEDIUM: DELETE allows user role
    { endpoint: "/users", method: "DELETE", requiresAuth: true, rolesAllowed: ["user"] },
    { endpoint: "/posts", method: "GET", requiresAuth: false, rolesAllowed: [] },
    { endpoint: "/posts", method: "POST", requiresAuth: true, rolesAllowed: ["user"] },
  ],
  functions: [
    // MEDIUM: Destructive function with no admin auth rule
    { name: "cleanup_old_data", isDestructive: true },
    { name: "send_notifications", isDestructive: false },
  ],
}

// Expected findings from this sample:
// HIGH: Table "posts" has no primary key
// MEDIUM: Column "email" in table "users" is nullable
// MEDIUM: Column "name" in table "users" is nullable
// MEDIUM: Column "title" in table "posts" is nullable
// HIGH: Column "user_id" in table "posts" lacks foreign key
// HIGH: Foreign key in "comments.post_id" points to non-existent table "post"
// HIGH: Write endpoint "POST /users" has no authentication
// HIGH: Endpoint "GET /users" requires auth but has no allowed roles
// MEDIUM: DELETE endpoint "/users" allows "user" role
// MEDIUM: Destructive function "cleanup_old_data" lacks admin protection
// Total: 6 HIGH, 5 MEDIUM = 120 points deducted → Score: 0 (clamped from -20)
