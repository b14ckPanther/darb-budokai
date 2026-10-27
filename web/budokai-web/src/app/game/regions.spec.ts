import { regionAt, validateMap } from './regions';

const regions = [
  {
    id: 'springs',
    stat: 'vigor',
    centre: [-10, 7] as [number, number],
    radius: 7.5,
    tint: 'map-tint-springs',
  },
  {
    id: 'wilds',
    stat: null,
    centre: [0, 0] as [number, number],
    radius: 4.5,
    tint: 'map-tint-wilds',
    locked: true,
  },
];

describe('regions', () => {
  it('finds the region under a world coordinate', () => {
    expect(regionAt(-10, 7, regions)?.id).toBe('springs');
    expect(regionAt(1, 1, regions)?.id).toBe('wilds');
    expect(regionAt(20, 20, regions)).toBeNull();
  });

  it('validates the map config against known tints and regions', () => {
    const markers = [
      { id: 'm1', kind: 'portal', region: 'wilds', at: [0, 1] as [number, number], ref: 'x' },
    ];
    expect(validateMap({ regions, markers }, ['map-tint-springs', 'map-tint-wilds'])).toEqual([]);
    expect(
      validateMap({ regions, markers: [{ ...markers[0], region: 'moon' }] }, ['map-tint-springs']),
    ).toEqual(['region wilds: unknown tint map-tint-wilds', 'marker m1: unknown region moon']);
  });
});
