import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoAssets = join(webRoot, '..', 'assets');
const publicAssets = join(webRoot, 'public', 'assets');

if (existsSync(repoAssets)) {
  cpSync(repoAssets, publicAssets, { recursive: true });
  console.log('prepare-assets: copied repo assets into public/assets');
} else {
  console.log('prepare-assets: no repo level assets folder found, skipping');
}
