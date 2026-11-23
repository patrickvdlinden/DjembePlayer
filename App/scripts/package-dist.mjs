import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync, zipSync } from 'fflate';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const distDirectory = path.join(appRoot, 'dist');
const outputDirectory = path.join(appRoot, 'deploy');
const outputFile = path.join(outputDirectory, 'jedeyafola.zip');
const temporaryFile = `${outputFile}.tmp`;
const files = Object.create(null);

function collectFiles(directory, prefix = '') {
  const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const filename = `${prefix}${entry.name}`;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(absolutePath, `${filename}/`);
    else if (entry.isFile()) files[filename] = readFileSync(absolutePath);
    else throw new Error(`Unsupported entry in the build: ${filename}`);
  }
}

collectFiles(distDirectory);
if (!Object.hasOwn(files, 'index.html')) throw new Error('The build must contain index.html at its root.');

const archive = zipSync(files, { level: 6 });
const extracted = unzipSync(archive);
const filenames = Object.keys(files);
if (Object.keys(extracted).length !== filenames.length
  || filenames.some(filename => !extracted[filename] || !files[filename].equals(extracted[filename]))) {
  throw new Error('Deployment ZIP verification failed.');
}

mkdirSync(outputDirectory, { recursive: true });
try {
  writeFileSync(temporaryFile, archive);
  renameSync(temporaryFile, outputFile);
} finally {
  rmSync(temporaryFile, { force: true });
}

console.log(`Deployment ZIP: ${path.relative(appRoot, outputFile)} (${filenames.length} files, ${(archive.length / 1024 ** 2).toFixed(2)} MiB; contents verified)`);
