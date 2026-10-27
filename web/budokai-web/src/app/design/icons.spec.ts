import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ICONS } from './icons.generated';

const appDir = join(__dirname, '..');

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|html)$/.test(name) && !name.endsWith('.generated.ts')) out.push(p);
  }
  return out;
}

const sources = files(appDir).map((p) => ({
  path: relative(appDir, p),
  text: readFileSync(p, 'utf8'),
}));

/** Literal icon names in templates and code: name="x", icon="x", icon: 'x'. */
function literalIconRefs(text: string): string[] {
  const refs: string[] = [];
  const patterns = [/<bk-icon[^>]*?\sname="([^"]+)"/g, /\sicon="([^"]+)"/g, /\bicon:\s*'([^']+)'/g];
  for (const re of patterns) for (const m of text.matchAll(re)) refs.push(m[1]);
  return refs;
}

describe('icon registry (ADR-033)', () => {
  it('every literal icon reference is in the registry', () => {
    const unknown = sources
      .filter((s) => !s.path.endsWith('.spec.ts'))
      .flatMap((s) =>
        literalIconRefs(s.text)
          .filter((n) => !(n in ICONS))
          .map((n) => `${s.path}: ${n}`),
      );
    expect(unknown).toEqual([]);
  });

  it('uses one icon set: Solar Bold Duotone, plus original sigils', () => {
    const sources = Object.values(ICONS).map((i) => i.source);
    expect(
      sources.filter(
        (s) => !/^solar:.+-bold-duotone$/.test(s) && !s.startsWith('config/design/sigils/'),
      ),
    ).toEqual([]);
  });

  it('no component draws its own inline SVG icon or a raster icon', () => {
    // Data drawings, not icons: the stat dial arc and the spring curve plots.
    const allowed = [
      'ui/icon.component.ts',
      'ui/stat-dial.component.ts',
      'design/design-page.component.html',
      'world/flat-map.component.ts',
    ];
    const offenders = sources
      .filter((s) => !s.path.endsWith('.spec.ts') && !allowed.includes(s.path))
      .filter((s) => /<svg[\s>]/.test(s.text) || /\.(png|jpe?g|gif|webp)["')]/i.test(s.text))
      .map((s) => s.path);
    expect(offenders).toEqual([]);
  });
});
