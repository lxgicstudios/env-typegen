---
name: Environment Type Generator CLI
description: Generate TypeScript types from .env files. Type-safe environment variables. Zod validation schemas. Free developer tool.
tags: [env, typescript, types, dotenv, validation, zod, cli]
---

# Environment Type Generator CLI

Type-safe env vars in TypeScript.

**Generate types from .env. Never typo again.**

## Quick Start

```bash
npm install -g env-typegen
```

```bash
# Generate types from .env
env-typegen

# Generate with validation
env-typegen --zod

# Watch mode
env-typegen --watch
```

## What It Generates

### TypeScript Types
```typescript
// Generated env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    API_KEY: string;
    PORT?: string;
    DEBUG?: string;
  }
}
```

### Zod Schema
```typescript
// Generated env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  PORT: z.string().optional().default('3000'),
  DEBUG: z.enum(['true', 'false']).optional(),
});
```

## Commands

```bash
# Basic generation
env-typegen

# From specific file
env-typegen --env .env.production

# Multiple files
env-typegen --env .env,.env.local

# Output location
env-typegen -o ./src/types/env.d.ts

# With Zod schema
env-typegen --zod

# Watch mode
env-typegen --watch

# Infer types from values
env-typegen --infer
```

## Example

**.env:**
```
DATABASE_URL=postgres://localhost:5432/db
API_KEY=sk-123456
PORT=3000
DEBUG=true
```

**Generated:**
```typescript
interface Env {
  DATABASE_URL: string;
  API_KEY: string;
  PORT: string;
  DEBUG: 'true' | 'false';
}
```

## Options

```bash
# Add prefix
env-typegen --prefix NEXT_PUBLIC_

# Required only
env-typegen --required

# Export as const
env-typegen --const
```

## When to Use This

- TypeScript projects
- Runtime validation
- Onboarding new devs
- Documentation
- CI/CD validation

---

**Built by [LXGIC Studios](https://lxgicstudios.com)**

🔗 [GitHub](https://github.com/lxgicstudios/env-typegen) · [Twitter](https://x.com/lxgicstudios)
