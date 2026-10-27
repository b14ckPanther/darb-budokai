// Writes the generated design files from config. Run: npm run design
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  buildCopyTs,
  buildIconsTs,
  buildTokensCss,
  buildTokensTs,
  resolveTokens,
} from '../src/app/design/build/design-build';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(web, '../..');
const read = (p: string) => readFileSync(join(repo, p), 'utf8');

const model = resolveTokens(
  JSON.parse(read('brand/src/tokens.json')),
  parse(read('config/design/tokens.yaml')),
);
writeFileSync(join(web, 'src/styles/tokens.generated.css'), buildTokensCss(model));
writeFileSync(join(web, 'src/app/design/tokens.generated.ts'), buildTokensTs(model));

const icons = parse(read('config/design/icons.yaml'));
const solar = JSON.parse(
  readFileSync(join(web, 'node_modules/@iconify-json/solar/icons.json'), 'utf8'),
);
const sigils = Object.fromEntries(
  (icons.sigil as string[]).map((n) => [n, read(`config/design/sigils/${n}.svg`)]),
);
writeFileSync(join(web, 'src/app/design/icons.generated.ts'), buildIconsTs(icons, solar, sigils));

const copyDir = join(repo, 'config/copy/en');
const copy = Object.fromEntries(
  readdirSync(copyDir)
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => [f.replace(/\.yaml$/, ''), parse(readFileSync(join(copyDir, f), 'utf8'))]),
);
writeFileSync(join(web, 'src/app/copy/copy.generated.ts'), buildCopyTs(copy));
console.log('design files written');
