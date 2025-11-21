import { describe, expect, it } from 'vitest';
import { addSMA } from './YahooCandleChart';

describe('addSMA', () => {
  it('should calculate SMA correctly', () => {
    const data: any[] = [
      { close: 10 },
      { close: 20 },
      { close: 30 },
      { close: 40 },
      { close: 50 },
    ];

    const period = 3;
    const result = addSMA(data, period);

    // SMA for index 2 (3rd item): (10+20+30)/3 = 20
    expect(result[2].indicator?.sma?.[period]).toBe(20);
    // SMA for index 3 (4th item): (20+30+40)/3 = 30
    expect(result[3].indicator?.sma?.[period]).toBe(30);
    // SMA for index 4 (5th item): (30+40+50)/3 = 40
    expect(result[4].indicator?.sma?.[period]).toBe(40);
  });

  it('should handle existing indicator structure', () => {
    const data: any[] = [
      { close: 10, indicator: { other: 'value' } },
      { close: 20, indicator: { sma: { 10: 15 } } },
      { close: 30 },
    ];

    const period = 2;
    const result = addSMA(data, period);

    // SMA for index 1: (10+20)/2 = 15
    expect(result[1].indicator?.sma?.[period]).toBe(15);
    // Check if existing data is preserved
    expect(result[1].indicator?.sma?.[10]).toBe(15);
  });
});
