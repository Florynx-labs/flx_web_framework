import fs from 'fs';

const VERSION = '1.0.0';

const pkgPaths = [
  'package.json',
  'packages/create-flx-app/package.json',
  'packages/flx/package.json',
  'packages/flx-cli/package.json',
  'packages/flx-core/package.json',
  'packages/flx-react/package.json',
  'packages/flx-cache-redis/package.json',
  'packages/flx-pack/package.json',
  'website/package.json'
];

pkgPaths.forEach(p => {
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.version = VERSION;

    if (data.dependencies) {
      for (const dep in data.dependencies) {
        if (dep.startsWith('@florynx-labs/') || dep.startsWith('@teamvelix/') || dep === 'flx' || dep === 'velix') {
          data.dependencies[dep] = `^${VERSION}`;
        }
      }
    }
    if (data.devDependencies) {
      for (const dep in data.devDependencies) {
        if (dep.startsWith('@florynx-labs/') || dep.startsWith('@teamvelix/') || dep === 'flx' || dep === 'velix') {
          data.devDependencies[dep] = `^${VERSION}`;
        }
      }
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${p} -> v${VERSION}`);
  }
});

const versionPaths = [
  'packages/flx/version.ts',
  'packages/flx-cli/version.ts',
  'packages/flx-core/src/version.ts'
];

versionPaths.forEach(p => {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/export const VERSION = '.*';/g, `export const VERSION = '${VERSION}';`);
    fs.writeFileSync(p, content);
    console.log(`Updated ${p} -> VERSION '${VERSION}'`);
  }
});
