/**
 * `flx pack` — FLX Pack build and diagnostic command
 */
import { showBanner, log } from './shared.js';
import pc from 'picocolors';

export async function packCommand(args: string[]) {
  showBanner();
  log.info('Running FLX Pack build engine...');

  const isAnalyze = args.includes('--analyze');
  const isDebug = args.includes('--debug');
  const isProfile = args.includes('--profile');

  try {
    let PackModule: any;
    try {
      PackModule = await import('@florynx-labs/flx-pack');
    } catch {
      PackModule = await import('@teamvelix/velix-pack');
    }
    const PackClass = PackModule.FlxPack || PackModule.VelixPack;
    const formatStats = PackModule.formatBuildStats;

    const pack = new PackClass({
      projectRoot: process.cwd(),
      mode: 'production',
    });

    const stats = await pack.build();

    if (isAnalyze || isProfile || isDebug) {
      console.log('\n' + formatStats(stats) + '\n');
    } else {
      log.success(`FLX Pack build finished in ${(stats.duration / 1000).toFixed(2)}s`);
      console.log(pc.dim(`Modules: ${stats.modulesCount} | Chunks: ${stats.chunksCount} | Cache hits: ${stats.cacheHits}`));
    }
  } catch (err: any) {
    log.error(`FLX Pack failed: ${err?.stack || err?.message || String(err)}`);
    process.exit(1);
  }
}
