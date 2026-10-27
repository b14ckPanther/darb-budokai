import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

/** PLAN Phase 3 task 1: every demo seed file validates against its schema in contracts/. */
const repo = join(__dirname, '../../../../..');
const seedDir = join(repo, 'config/seed/demo');
const schemaDir = join(repo, 'contracts/seed/demo');
const seeds = readdirSync(seedDir).filter((f) => f.endsWith('.yaml'));

function ajv() {
  const a = new Ajv2020({ allErrors: true, strict: true });
  addFormats(a);
  a.addSchema(JSON.parse(readFileSync(join(repo, 'contracts/replay/v1.schema.json'), 'utf8')));
  return a;
}

describe('demo seed data', () => {
  it('has the files Phase 3 needs', () => {
    for (const f of [
      'persona.yaml',
      'map.yaml',
      'timeline.yaml',
      'quests.yaml',
      'decks.yaml',
      'skill-tree.yaml',
      'replays.yaml',
      'rulebook.yaml',
      'integrations.yaml',
    ]) {
      expect(seeds).toContain(f);
    }
  });

  it.each(seeds)('%s validates against its schema', (file) => {
    const schemaPath = join(schemaDir, file.replace(/\.yaml$/, '.schema.json'));
    expect(existsSync(schemaPath)).toBe(true);
    const validate = ajv().compile(JSON.parse(readFileSync(schemaPath, 'utf8')));
    const ok = validate(parse(readFileSync(join(seedDir, file), 'utf8')));
    expect(validate.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('the replay schema rejects a script with a missing source (honesty: every line has a rule)', () => {
    const v = ajv().getSchema(
      'https://github.com/b14ckPanther/darb-budokai/contracts/replay/v1.schema.json',
    )!;
    const day = parse(readFileSync(join(seedDir, 'replays.yaml'), 'utf8')).days[0];
    const broken = JSON.parse(JSON.stringify(day));
    delete broken.encounters[0].source;
    expect(v(broken)).toBe(false);
  });
});
