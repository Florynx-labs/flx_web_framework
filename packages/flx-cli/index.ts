#!/usr/bin/env node

/**
 * FLX v1.0.0 CLI by Florynx Labs
 *
 * Commands:
 *   flx create <name>     Create a new FLX project
 *   flx dev               Start development server
 *   flx build             Build for production
 *   flx start             Start production server
 *   flx g <type> <name>   Generate (page, component, api, layout, middleware, etc.)
 *   flx doctor            Health check & diagnostics
 *   flx info              Framework & environment info
 *   flx analyze           Bundle analysis
 *   flx pack              FLX Pack incremental compiler engine
 *   flx ui                Interactive terminal interface
 */

import pc from 'picocolors';
import { VERSION } from './version.js';
import { showBanner, log } from './commands/shared.js';

// ============================================================================
// Help
// ============================================================================

function showHelp() {
  showBanner();
  console.log(`  ${pc.bold('Usage:')} flx <command> [options]`);
  console.log('');
  console.log(`  ${pc.bold('Commands:')}`);
  console.log(`    ${pc.green('create')} <name>          Create a new FLX project`);
  console.log(`    ${pc.green('dev')}                    Start development server`);
  console.log(`    ${pc.green('build')}                  Build for production`);
  console.log(`    ${pc.green('start')}                  Start production server`);
  console.log(`    ${pc.green('g')} <type> <name>        Generate component/page/api/...`);
  console.log(`    ${pc.green('ui')} add <component>     Install UI components`);
  console.log(`    ${pc.green('pack')} [options]         FLX Pack compiler diagnostics (--analyze, --debug, --profile)`);
  console.log(`    ${pc.green('doctor')}                 Health check & diagnostics`);
  console.log(`    ${pc.green('info')}                   Framework & environment info`);
  console.log(`    ${pc.green('analyze')}                Bundle analysis`);
  console.log('');
  console.log(`  ${pc.bold('Generate types:')}`);
  console.log(`    page, layout, component, hook, api, action, middleware, context, loading, error, not-found`);
  console.log('');
  console.log(`  ${pc.bold('Examples:')}`);
  console.log(`    ${pc.dim('$')} flx create my-app`);
  console.log(`    ${pc.dim('$')} flx dev`);
  console.log(`    ${pc.dim('$')} flx g page dashboard`);
  console.log(`    ${pc.dim('$')} flx g api users`);
  console.log('');
}

// ============================================================================
// Main CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log(`flx v${VERSION} by Florynx Labs`);
    return;
  }

  switch (command) {
    case 'create': {
      const { createCommand } = await import('./commands/create.js');
      await createCommand(args[1]);
      break;
    }
    case 'dev': {
      const { devCommand } = await import('./commands/dev.js');
      await devCommand();
      break;
    }
    case 'build': {
      const { buildCommand } = await import('./commands/build.js');
      await buildCommand();
      break;
    }
    case 'start': {
      const { startCommand } = await import('./commands/build.js');
      await startCommand();
      break;
    }
    case 'g':
    case 'generate': {
      const { generateCommand } = await import('./commands/generate.js');
      await generateCommand(args[1], args[2]);
      break;
    }
    case 'doctor': {
      const { doctorCommand } = await import('./commands/doctor.js');
      await doctorCommand();
      break;
    }
    case 'info': {
      const { infoCommand } = await import('./commands/doctor.js');
      await infoCommand();
      break;
    }
    case 'analyze': {
      const { analyzeCommand } = await import('./commands/analyze.js');
      await analyzeCommand();
      break;
    }
    case 'pack': {
      const { packCommand } = await import('./commands/pack.js');
      await packCommand(args.slice(1));
      break;
    }
    case 'ui': {
      const { handleUiCommand } = await import('./commands/ui.js');
      await handleUiCommand(args.slice(1));
      break;
    }
    default:
      log.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// ============================================================================
// Run
// ============================================================================

main().catch(err => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
