// Writes the generated design files from config. Run: npm run design
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  buildCopyTs,
  buildSeedTs,
  buildIconsTs,
  buildTokensCss,
  buildTokensScss,
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
writeFileSync(join(web, 'src/styles/_tokens.generated.scss'), buildTokensScss(model));

const icons = parse(read('config/design/icons.yaml'));
const solar = JSON.parse(
  readFileSync(join(web, 'node_modules/@iconify-json/solar/icons.json'), 'utf8'),
);
const sigils = Object.fromEntries(
  (icons.sigil as string[]).map((n) => [n, read(`config/design/sigils/${n}.svg`)]),
);
writeFileSync(join(web, 'src/app/design/icons.generated.ts'), buildIconsTs(icons, solar, sigils));

const yamlDir = (dir: string) =>
  Object.fromEntries(
    readdirSync(join(repo, dir))
      .filter((f) => f.endsWith('.yaml'))
      .sort()
      .map((f) => [f.replace(/\.yaml$/, ''), parse(read(`${dir}/${f}`))]),
  );
writeFileSync(join(web, 'src/app/copy/copy.generated.ts'), buildCopyTs(yamlDir('config/copy/en')));
writeFileSync(
  join(web, 'src/app/demo/seed.generated.ts'),
  buildSeedTs(yamlDir('config/seed/demo')),
);
console.log('design files written');
