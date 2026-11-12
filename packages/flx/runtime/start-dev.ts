/**
 * FLX v1.0.0 — Development Server
 * Start the dev server with hot reload
 */

import { createServer } from '../server/index.js';
import chokidar from 'chokidar';
import path from 'path';
import logger from '../logger.js';

async function startDev() {
  const projectRoot = process.cwd();
  const mode = 'development';

  process.env.NODE_ENV = 'development';

  const { server, config } = await createServer({ projectRoot, mode });

  const isPack = process.argv.includes('--pack');
  let packInstance: any = null;

  if (isPack) {
    try {
      let PackModule: any;
      try {
        PackModule = await import('@florynx-labs/flx-pack');
      } catch {
        PackModule = await import('@teamvelix/velix-pack');
      }
      const PackClass = PackModule.FlxPack || PackModule.VelixPack;
      packInstance = new PackClass({ projectRoot, mode: 'development' });
      const stats = await packInstance.build();
      logger.success(`FLX Pack initialized (${stats.modulesCount} modules, ${stats.chunksCount} chunks, ${(stats.duration / 1000).toFixed(2)}s)`);
      packInstance.watch((affected: string[]) => {
        logger.info(`FLX Pack incremental rebuild: ${affected.length} modules affected`);
        if ((server as unknown as { broadcastHMR?: (msg: any) => void }).broadcastHMR) {
          (server as unknown as { broadcastHMR: (msg: any) => void }).broadcastHMR({ type: 'full-reload', affected });
        }
      });
    } catch (e: any) {
      logger.warn(`FLX Pack initialization fallback: ${e.message}`);
    }
  }

  let watcher: any = null;
  if (!packInstance) {
    // Watch for file changes using standalone chokidar when FLX Pack is not active
    const appDir = path.join(projectRoot, 'app');
    const serverDir = path.join(projectRoot, 'server');

    watcher = chokidar.watch([appDir, serverDir], {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', (filePath: string) => {
      const relative = path.relative(projectRoot, filePath);
      logger.hmr(relative);
      if ((server as unknown as { broadcastHMR?: (msg: any) => void }).broadcastHMR) {
        (server as unknown as { broadcastHMR: (msg: any) => void }).broadcastHMR({ type: 'full-reload' });
      }
    });

    watcher.on('add', (filePath: string) => {
      const relative = path.relative(projectRoot, filePath);
      logger.info(`New file: ${relative}`);
    });

    watcher.on('unlink', (filePath: string) => {
      const relative = path.relative(projectRoot, filePath);
      logger.warn(`Removed: ${relative}`);
    });
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.blank();
    logger.info('Shutting down...');
    if (watcher) watcher.close();
    server.close();
    process.exit(0);
  });
}

startDev().catch(err => {
  logger.error('Failed to start dev server', err);
  process.exit(1);
});
