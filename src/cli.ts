#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { parseEnvFile, generateTypeScript, generateZodSchema } from './index.js';

const args = process.argv.slice(2);

const HELP = `
env-typegen - Generate TypeScript types from .env files

USAGE:
  npx @lxgicstudios/env-typegen                Generate from .env in current directory
  npx @lxgicstudios/env-typegen <file>         Generate from specific .env file
  npx @lxgicstudios/env-typegen -o <file>      Output to specific file
  npx @lxgicstudios/env-typegen --zod          Also generate Zod schema

OPTIONS:
  -i, --input <file>     Input .env file (default: .env)
  -o, --output <file>    Output TypeScript file (default: env.d.ts)
  --zod                  Generate Zod schema (outputs env.zod.ts)
  --name <name>          Interface name (default: Env)
  --watch                Watch for changes
  -h, --help             Show this help message
  -v, --version          Show version

EXAMPLES:
  npx @lxgicstudios/env-typegen
  npx @lxgicstudios/env-typegen .env.local -o src/types/env.d.ts
  npx @lxgicstudios/env-typegen --zod
  npx @lxgicstudios/env-typegen .env.production --name ProductionEnv

OUTPUT:
  Generates TypeScript interface with:
  - Typed getEnv() function
  - NodeJS.ProcessEnv augmentation
  - JSDoc comments from .env comments

TYPE INFERENCE:
  Numbers:    PORT=3000 → number
  Booleans:   DEBUG=true → boolean
  URLs:       API_URL=https://... → string (validated)
  Emails:     ADMIN_EMAIL=a@b.com → string (validated)
  Ports:      PORT=8080 → number (1-65535)
  Strings:    Everything else → string

Built by LXGIC Studios · https://github.com/lxgicstudios/env-typegen
`;

function colorize(text: string, color: string): string {
  const colors: Record<string, string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
    reset: '\x1b[0m',
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function printError(msg: string): void {
  console.error(colorize('✗ ', 'red') + msg);
}

function printSuccess(msg: string): void {
  console.log(colorize('✓ ', 'green') + msg);
}

function printInfo(msg: string): void {
  console.log(colorize('ℹ ', 'blue') + msg);
}

function getArg(flags: string[]): string | undefined {
  for (const flag of flags) {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1]) {
      return args[idx + 1];
    }
  }
  return undefined;
}

function hasFlag(flags: string[]): boolean {
  return flags.some(f => args.includes(f));
}

async function main(): Promise<void> {
  if (hasFlag(['-h', '--help'])) {
    console.log(HELP);
    process.exit(0);
  }

  if (hasFlag(['-v', '--version'])) {
    console.log('1.0.0');
    process.exit(0);
  }

  // Determine input file
  let inputFile = getArg(['-i', '--input']);
  if (!inputFile) {
    // Check for positional arg
    const positional = args.find(a => !a.startsWith('-') && a.includes('.env'));
    inputFile = positional || '.env';
  }

  const inputPath = resolve(process.cwd(), inputFile);

  if (!existsSync(inputPath)) {
    printError(`File not found: ${inputFile}`);
    printInfo('Run with --help for usage information');
    process.exit(1);
  }

  // Parse options
  const outputFile = getArg(['-o', '--output']) || 'env.d.ts';
  const interfaceName = getArg(['--name']) || 'Env';
  const generateZod = hasFlag(['--zod']);

  try {
    printInfo(`Parsing ${colorize(inputFile, 'cyan')}...`);

    const variables = parseEnvFile(inputPath);

    if (variables.length === 0) {
      printError('No environment variables found in file');
      process.exit(1);
    }

    // Generate TypeScript
    const typescript = generateTypeScript(variables, interfaceName);
    const tsOutputPath = resolve(process.cwd(), outputFile);
    writeFileSync(tsOutputPath, typescript);
    printSuccess(`Generated ${colorize(outputFile, 'cyan')} with ${variables.length} variables`);

    // Generate Zod if requested
    if (generateZod) {
      const zodSchema = generateZodSchema(variables);
      const zodOutputPath = resolve(process.cwd(), outputFile.replace(/\.d\.ts$/, '.zod.ts').replace(/\.ts$/, '.zod.ts'));
      writeFileSync(zodOutputPath, zodSchema);
      printSuccess(`Generated ${colorize(zodOutputPath.split('/').pop() || 'env.zod.ts', 'cyan')} with Zod schema`);
    }

    // Print summary
    console.log('');
    console.log(colorize('Variables:', 'dim'));
    for (const v of variables) {
      const typeColor = v.type === 'number' || v.type === 'port' ? 'yellow' :
                        v.type === 'boolean' ? 'cyan' : 'green';
      console.log(`  ${v.key}: ${colorize(v.type, typeColor)}${v.required ? '' : colorize(' (optional)', 'dim')}`);
    }

    console.log('');
    printInfo('Add to your code:');
    console.log(colorize(`  import { getEnv } from './${outputFile.replace(/\.d\.ts$/, '')}';`, 'dim'));
    console.log(colorize(`  const env = getEnv();`, 'dim'));

  } catch (err) {
    printError(err instanceof Error ? err.message : 'Unknown error');
    process.exit(1);
  }
}

main().catch(err => {
  printError(err.message || 'An unexpected error occurred');
  process.exit(1);
});
