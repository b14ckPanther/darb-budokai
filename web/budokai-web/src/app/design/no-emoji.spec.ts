import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const repo = join(__dirname, '../../../../..');
const roots = ['web/budokai-web/src', 'config/copy', 'config/seed', 'config/design'];
// Pictographs and emoji presentation selectors. Text symbols such as the copyright sign are allowed.
const EMOJI = /(?![©®™])[\p{Extended_Pictographic}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|html|scss|css|ya?ml|json|svg|md)$/.test(name)) out.push(p);
  }
  return out;
}

describe('no emoji anywhere (CLAUDE.md 1.9)', () => {
  it('the detector catches an emoji and passes plain text, Japanese and Arabic', () => {
    expect(EMOJI.test(`Quest done ${String.fromCodePoint(0x1f525)}`)).toBe(true);
    expect(EMOJI.test(String.fromCodePoint(0x2764, 0xfe0f))).toBe(true);
    expect(EMOJI.test('Stamina restored by 6')).toBe(false);
    expect(EMOJI.test('武 天下一武道会')).toBe(false);
    expect(EMOJI.test('درب')).toBe(false);
  });

  it.each(roots)('%s has no emoji', (root) => {
    const hits = files(join(repo, root))
      .map((p) => ({ p, lines: readFileSync(p, 'utf8').split('\n') }))
      .flatMap(({ p, lines }) =>
        lines.flatMap((l, i) => (EMOJI.test(l) ? [`${relative(repo, p)}:${i + 1}`] : [])),
      );
    expect(hits).toEqual([]);
  });
});
