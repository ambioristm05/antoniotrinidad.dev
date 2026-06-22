import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const assetsDirectory = path.join(process.cwd(), 'dist', 'assets');
const maximumChunkBytes = 300 * 1024;
const files = await readdir(assetsDirectory);
const chunks = [];

for (const filename of files.filter((file) => file.endsWith('.js'))) {
  const { size } = await stat(path.join(assetsDirectory, filename));
  chunks.push({ filename, size });
}

const oversized = chunks.filter(({ size }) => size > maximumChunkBytes);
const largest = [...chunks].sort((left, right) => right.size - left.size)[0];

if (largest) {
  console.log(`Largest JavaScript chunk: ${largest.filename} (${(largest.size / 1024).toFixed(1)} KB).`);
}

if (oversized.length > 0) {
  const details = oversized.map(({ filename, size }) => `${filename}: ${(size / 1024).toFixed(1)} KB`).join(', ');
  throw new Error(`JavaScript chunks must stay below 300 KB. Oversized: ${details}`);
}
