# ForgeGuard

ForgeGuard is a small Next.js app for performing deterministic backend audits and safety checks for InsForge backends. It analyzes backend metadata (tables, auth rules, functions) and produces a readiness report with findings and a score.

This repository contains the frontend UI (Next.js + React) and a few server routes that accept metadata (either fetched from an InsForge instance or pasted JSON) and run deterministic checks implemented in `src/lib/checks.ts`.

## Features

- Connect to an InsForge backend and fetch metadata for analysis
- Paste or upload metadata JSON manually
- Deterministic checks for schema, auth, and deploy best-practices
- Save and view generated reports

## Quick start (development)

Prerequisites: Node 18+ (or compatible), npm/yarn/pnpm.

Install dependencies:

```bash
cd /path/to/ForgeGuard-main
npm install
```

Run the dev server:

```bash
npm run dev
```

Open your browser to http://localhost:3000.

If you're using a different package manager, replace the npm commands accordingly.

## How to use the app

- On the homepage, choose between "Connect InsForge" (fetch metadata from a running InsForge instance) or "Paste JSON" (manually paste metadata).
- Fill the required fields (project label, InsForge URL + API key, or metadata JSON) and click "Run Audit".
- The app will redirect to the generated report page on success.

## Important developer notes

- The deterministic checks live in `src/lib/checks.ts`. They expect a `BackendMetadata` shape defined in `src/lib/types.ts`.
- A recent runtime crash was caused by `checkDeploy` calling `.some()` on `metadata.authRules` when `authRules` was undefined. That is now guarded with `Array.isArray(metadata.authRules) && ...` to avoid a TypeError. If you see `Cannot read properties of undefined (reading 'some')` in logs, ensure the code is up-to-date and that the incoming metadata is valid.

## Troubleshooting

- Stale compiled files / dev server lock:

  If you edit server-side files and your UI becomes unresponsive (buttons not clickable, tabs not switching), the dev server may be running an old build or a second dev instance may have left a lock file. Common symptom:

  ```
  ⨯ Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
  ```

  If that happens:

  1. Check for running `next`/dev processes:

  ```bash
  ps aux | grep -i next | grep -v grep
  ```

  2. If a stale process is running, stop it (use `kill <pid>`). If you can't find a process but `.next/dev/lock` exists, remove the lock file:

  ```bash
  rm -f .next/dev/lock
  ```

  3. Restart the dev server:

  ```bash
  npm run dev
  ```

  Note: Always try to stop an existing `next dev` instance gracefully first. Removing the lock file while a real dev server is running can cause build issues.

- Unclickable UI

  - Ensure your browser console doesn't show runtime JS errors. A runtime exception during hydration can cause UI controls to become unresponsive.
  - Restart the Next dev server to ensure compiled code reflects the latest edits.

## Testing & validation

- TypeScript typecheck:

```bash
npx tsc --noEmit
```

- Linting (if available in repo):

```bash
# npm run lint
```

## Files of interest

- `src/app/page.tsx` — main UI for creating audits
- `src/lib/checks.ts` — deterministic checks (schema, auth, deploy)
- `src/lib/types.ts` — metadata and finding types
- `src/app/api/analyze/route.ts` — API route that accepts metadata and runs checks

## Contributing

1. Fork the repo and create a feature branch
2. Run and test locally
3. Open a PR with a clear description and tests where applicable

## License

This project does not include a license file in the repo root. Add a `LICENSE` file if you intend to open-source under a specific license.

---
