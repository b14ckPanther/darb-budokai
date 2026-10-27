import { contrastRatio, mix, parseHex, toHex } from './colour';

describe('colour maths', () => {
  it('parses and prints hex', () => {
    expect(parseHex('#D9A54C')).toEqual([217, 165, 76]);
    expect(toHex([217, 165, 76])).toBe('#D9A54C');
  });

  it('rejects malformed hex', () => {
    expect(() => parseHex('gold')).toThrow(/hex/);
  });

  it('mixes in sRGB by the weight of the first colour', () => {
    expect(mix('#FFFFFF', '#000000', 0.5)).toBe('#808080');
    expect(mix('#FF0000', '#0000FF', 1)).toBe('#FF0000');
  });

  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });
});
