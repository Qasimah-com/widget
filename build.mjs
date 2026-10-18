import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const versionSource = readFileSync(join(root, 'src/version.ts'), 'utf8');

if (!versionSource.includes(`'${pkg.version}'`)) {
  console.error(`src/version.ts does not match package.json version ${pkg.version}`);
  process.exit(1);
}

const outfile = join(root, 'dist/qasimha-widget.js');
mkdirSync(join(root, 'dist'), { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: ['src/index.ts'],
  outfile,
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2019',
  platform: 'browser',
  legalComments: 'none',
  sourcemap: false,
  banner: { js: `/*! ${pkg.name} ${pkg.version} | MIT */` },
});

// The licensed brand fonts are never in the repository; copied only when present locally.
if (existsSync(join(root, 'fonts'))) cpSync(join(root, 'fonts'), join(root, 'dist/fonts'), { recursive: true });

const bytes = readFileSync(outfile);
const sri = 'sha384-' + createHash('sha384').update(bytes).digest('base64');
writeFileSync(outfile + '.sri', sri + '\n');

console.log(`dist/qasimha-widget.js ${bytes.length} bytes (${gzipSync(bytes).length} gzip)`);
console.log(sri);
