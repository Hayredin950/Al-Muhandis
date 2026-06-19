---
name: zod in api-server
description: zod must be explicitly added to api-server's package.json
---

## Rule
`zod` must be added as `"zod": "catalog:"` in `artifacts/api-server/package.json` dependencies before importing it in any api-server route file.

**Why:** zod is not inherited transitively from workspace packages even though `@workspace/db` and `@workspace/api-zod` use it. The api-server package.json needs it as a direct dependency.

**How to apply:** When adding new routes to api-server that use zod validation, always check `artifacts/api-server/package.json` first.
