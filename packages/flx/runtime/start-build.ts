/**
 * FLX v1.0.0 — Build Script
 * Build the application for production
 */

import { build } from '../build/index.js';
import logger from '../logger.js';

async function runBuild() {
  const isPack = process.argv.includes('--pack');
  if (isPack) {
    try {
      let PackModule: any;
      try {
        PackModule = await import('@florynx-labs/flx-pack');
      } catch {
        PackModule = await import('@teamvelix/velix-pack');
      }
      const PackClass = PackModule.FlxPack || PackModule.VelixPack;
      const formatStats = PackModule.formatBuildStats;
      const pack = new PackClass({ projectRoot: process.cwd(), mode: 'production', minify: true });
      const stats = await pack.build();
      console.log('\n' + formatStats(stats) + '\n');
      return;
    } catch (err: any) {
      logger.warn(`FLX Pack build failed, falling back to standard build: ${err.message}`);
    }
  }

  await build();
}

runBuild().catch(err => {
  logger.error('Build failed', err);
  process.exit(1);
});
