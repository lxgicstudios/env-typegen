# @lxgicstudios/env-typegen

Generate TypeScript types from your .env files with smart type inference.

No more `process.env.PORT as unknown as number`. Get proper types automatically.

## Installation

```bash
# Use directly with npx (recommended)
npx @lxgicstudios/env-typegen

# Or install globally
npm install -g @lxgicstudios/env-typegen
```

## Usage

```bash
# Generate types from .env in current directory
npx @lxgicstudios/env-typegen

# Generate from specific file
npx @lxgicstudios/env-typegen .env.local

# Output to custom path
npx @lxgicstudios/env-typegen -o src/types/env.d.ts

# Also generate Zod schema for runtime validation
npx @lxgicstudios/env-typegen --zod
```

## Example

Given this `.env`:

```env
# Database configuration
DATABASE_URL=postgresql://localhost:5432/mydb
DB_POOL_SIZE=10

# Server settings
PORT=3000
DEBUG=true

# External services
API_KEY=sk_live_abc123
ADMIN_EMAIL=admin@example.com
```

Running `npx @lxgicstudios/env-typegen` generates:

```typescript
export interface Env {
  /** Database configuration */
  DATABASE_URL: string;
  DB_POOL_SIZE: number;
  /** Server settings */
  PORT: number;
  DEBUG: boolean;
  /** External services */
  API_KEY: string;
  ADMIN_EMAIL: string;
}

export function getEnv(): Env {
  return {
    DATABASE_URL: process.env.DATABASE_URL || '',
    DB_POOL_SIZE: Number(process.env.DB_POOL_SIZE),
    PORT: Number(process.env.PORT),
    DEBUG: ['true', '1', 'yes'].includes((process.env.DEBUG || '').toLowerCase()),
    API_KEY: process.env.API_KEY || '',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  } as Env;
}

// Augment NodeJS namespace
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      DB_POOL_SIZE: string;
      PORT: string;
      DEBUG: string;
      API_KEY: string;
      ADMIN_EMAIL: string;
    }
  }
}
```

## Type Inference

| Pattern | Inferred Type |
|---------|---------------|
| `PORT=3000` | `number` |
| `DEBUG=true` | `boolean` |
| `API_URL=https://...` | `string` (URL) |
| `EMAIL=a@b.com` | `string` (email) |
| Everything else | `string` |

## Options

| Option | Description |
|--------|-------------|
| `-i, --input <file>` | Input .env file (default: .env) |
| `-o, --output <file>` | Output file (default: env.d.ts) |
| `--zod` | Also generate Zod schema |
| `--name <name>` | Interface name (default: Env) |
| `-h, --help` | Show help |

## Programmatic API

```typescript
import { 
  parseEnvFile, 
  generateTypeScript, 
  generateZodSchema 
} from '@lxgicstudios/env-typegen';

// Parse .env file
const variables = parseEnvFile('.env');

// Generate TypeScript
const ts = generateTypeScript(variables, 'MyEnv');

// Generate Zod schema
const zod = generateZodSchema(variables);
```

---

**Built by [LXGIC Studios](https://lxgicstudios.com)**

🔗 [GitHub](https://github.com/lxgicstudios/env-typegen) · [Twitter](https://x.com/lxgicstudios)
