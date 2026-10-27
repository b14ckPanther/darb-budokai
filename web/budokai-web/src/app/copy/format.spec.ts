import { format } from './format';

describe('format', () => {
  it('fills named variables', () => {
    expect(format('{value} of {max} XP', { value: 412, max: 660 })).toBe('412 of 660 XP');
  });

  it('fails loudly on a missing variable', () => {
    expect(() => format('Level {level}', {})).toThrow(/level/);
  });
});
