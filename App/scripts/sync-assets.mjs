import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Unity's source assets remain the single source of truth. Vite runs this
// before serving or building, and includes the copied assets in dist/.
export function syncAssets() {
  const appRoot = fileURLToPath(new URL('../', import.meta.url));
  const resources = path.resolve(appRoot, '../Assets/Resources');
  for (const [source, target, extensions] of [
    ['Audio', 'audio', ['.wav', '.mp3']],
    ['Fonts', 'fonts', ['.ttf']],
  ]) {
    const destination = path.join(appRoot, 'public/assets', target);
    mkdirSync(destination, { recursive: true });
    for (const file of readdirSync(path.join(resources, source))) {
      if (extensions.includes(path.extname(file))) {
        copyFileSync(path.join(resources, source, file), path.join(destination, file));
      }
    }
  }
}
