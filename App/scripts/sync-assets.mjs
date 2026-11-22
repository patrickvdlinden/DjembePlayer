import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Vite copies the original recordings and App sound sets before serving or
// building, and includes them in dist/. Unity's source assets stay unchanged.
export function syncAssets() {
  const appRoot = fileURLToPath(new URL('../', import.meta.url));
  for (const [source, target, extensions] of [
    ['../Assets/Resources/Audio', 'audio', ['.wav', '.mp3']],
    ['../Assets/Resources/Fonts', 'fonts', ['.ttf']],
    ['soundsets/ballet-djembe', 'audio', ['.wav']],
  ]) {
    const destination = path.join(appRoot, 'public/assets', target);
    mkdirSync(destination, { recursive: true });
    for (const file of readdirSync(path.resolve(appRoot, source))) {
      if (extensions.includes(path.extname(file))) {
        copyFileSync(path.resolve(appRoot, source, file), path.join(destination, file));
      }
    }
  }
}
