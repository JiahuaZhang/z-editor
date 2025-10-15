import { describe, expect, it } from 'vitest';
import { DEFAULT_DOCUMENTS_PER_PAGE } from '~/lib/constant';
import { getSearchParams } from './document.search.server';

const createMockRequest = (searchParams: Record<string, string> = {}): Request => {
  const url = new URL('https://example.com/search');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return new Request(url.toString());
};

describe('getSearchParams', () => {
  describe('Basic Parameters', () => {
    it('should return default values when no parameters are provided', () => {
      const request = createMockRequest();
      const result = getSearchParams(request);

      expect(result).toEqual({
        query: '',
        tag: [],
        page: 1,
        perPage: DEFAULT_DOCUMENTS_PER_PAGE,
        offset: 0,
      });
    });

    it('should parse query parameter correctly', () => {
      const request = createMockRequest({ query: 'test search' });
      const result = getSearchParams(request);

      expect(result.query).toBe('test search');
    });

    it('should parse page and perPage parameters correctly', () => {
      const request = createMockRequest({
        page: '3',
        perPage: '20'
      });
      const result = getSearchParams(request);

      expect(result.page).toBe(3);
      expect(result.perPage).toBe(20);
      expect(result.offset).toBe(40); // (3-1) * 20
    });

    it('should handle invalid page numbers as-is', () => {
      const request = createMockRequest({
        page: '0',
        perPage: '-5'
      });
      const result = getSearchParams(request);

      expect(result.page).toBe(0);
      expect(result.perPage).toBe(-5);
      expect(result.offset).toBe(5); // (0-1) * -5
    });

    it('should handle non-numeric page parameters as NaN', () => {
      const request = createMockRequest({
        page: 'invalid',
        perPage: 'also-invalid'
      });
      const result = getSearchParams(request);

      expect(result.page).toBeNaN();
      expect(result.perPage).toBeNaN();
      expect(result.offset).toBeNaN();
    });
  });

  describe('Tag Parameters', () => {
    it('should parse single tag correctly', () => {
      const request = createMockRequest({ tag: 'javascript' });
      const result = getSearchParams(request);

      expect(result.tag).toEqual(['javascript']);
    });

    it('should parse multiple comma-separated tags correctly', () => {
      const request = createMockRequest({ tag: 'javascript,react,typescript' });
      const result = getSearchParams(request);

      expect(result.tag).toEqual(['javascript', 'react', 'typescript']);
    });

    it('should handle tags with spaces without trimming', () => {
      const request = createMockRequest({ tag: ' javascript , react , typescript ' });
      const result = getSearchParams(request);

      expect(result.tag).toEqual([' javascript ', ' react ', ' typescript ']);
    });

    it('should include empty tags without filtering', () => {
      const request = createMockRequest({ tag: 'javascript,,react,' });
      const result = getSearchParams(request);

      expect(result.tag).toEqual(['javascript', 'react']);
    });

    it('should return empty array when tag parameter is empty', () => {
      const request = createMockRequest({ tag: '' });
      const result = getSearchParams(request);

      expect(result.tag).toEqual([]);
    });
  });

  describe('Created Date Parameters', () => {
    it('should parse single created date as "at" filter', () => {
      const request = createMockRequest({ created: '2024-01-15' });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ at: new Date('2024-01-15') });
    });

    it('should parse created_before parameter', () => {
      const request = createMockRequest({ created_before: '2024-01-15' });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ before: new Date('2024-01-15') });
    });

    it('should parse created_after parameter', () => {
      const request = createMockRequest({ created_after: '2024-01-15' });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ after: new Date('2024-01-15') });
    });

    it('should parse created date range correctly', () => {
      const request = createMockRequest({
        created_from: '2024-01-01',
        created_to: '2024-01-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31')
      });
    });

    it('should ignore single created_from parameter', () => {
      const request = createMockRequest({ created_from: '2024-01-01' });
      const result = getSearchParams(request);

      expect(result.created).toBeUndefined();
    });

    it('should ignore single created_to parameter', () => {
      const request = createMockRequest({ created_to: '2024-01-31' });
      const result = getSearchParams(request);

      expect(result.created).toBeUndefined();
    });

    it('should prioritize created over other created parameters', () => {
      const request = createMockRequest({
        created: '2024-01-15',
        created_before: '2024-01-10',
        created_after: '2024-01-20',
        created_from: '2024-01-01',
        created_to: '2024-01-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ at: new Date('2024-01-15') });
    });

    it('should prioritize before/after over range parameters', () => {
      const request = createMockRequest({
        created_before: '2024-01-15',
        created_from: '2024-01-01',
        created_to: '2024-01-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ before: new Date('2024-01-15') });
    });

    it('should handle invalid created dates gracefully', () => {
      const request = createMockRequest({ created: 'invalid-date' });
      const result = getSearchParams(request);

      expect(result.created).toBeUndefined();
    });

    it('should handle invalid created range gracefully', () => {
      const request = createMockRequest({
        created_from: 'invalid',
        created_to: 'also-invalid'
      });
      const result = getSearchParams(request);

      expect(result.created).toBeUndefined();
    });
  });

  describe('Updated Date Parameters', () => {
    it('should parse single updated date as "at" filter', () => {
      const request = createMockRequest({ updated: '2024-02-15' });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({ at: new Date('2024-02-15') });
    });

    it('should parse updated_before parameter', () => {
      const request = createMockRequest({ updated_before: '2024-02-15' });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({ before: new Date('2024-02-15') });
    });

    it('should parse updated_after parameter', () => {
      const request = createMockRequest({ updated_after: '2024-02-15' });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({ after: new Date('2024-02-15') });
    });

    it('should parse updated date range correctly', () => {
      const request = createMockRequest({
        updated_from: '2024-02-01',
        updated_to: '2024-02-29'
      });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({
        from: new Date('2024-02-01'),
        to: new Date('2024-02-29')
      });
    });

    it('should ignore single updated_from parameter', () => {
      const request = createMockRequest({ updated_from: '2024-02-01' });
      const result = getSearchParams(request);

      expect(result.updated).toBeUndefined();
    });

    it('should ignore single updated_to parameter', () => {
      const request = createMockRequest({ updated_to: '2024-02-29' });
      const result = getSearchParams(request);

      expect(result.updated).toBeUndefined();
    });

    it('should prioritize updated over other updated parameters', () => {
      const request = createMockRequest({
        updated: '2024-02-15',
        updated_before: '2024-02-10',
        updated_after: '2024-02-20',
        updated_from: '2024-02-01',
        updated_to: '2024-02-29'
      });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({ at: new Date('2024-02-15') });
    });

    it('should handle invalid updated dates gracefully', () => {
      const request = createMockRequest({ updated: 'not-a-date' });
      const result = getSearchParams(request);

      expect(result.updated).toBeUndefined();
    });
  });

  describe('Alert Date Parameters', () => {
    it('should parse alert date as "at" filter', () => {
      const request = createMockRequest({ alert: '2024-03-15' });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({ at: new Date('2024-03-15') });
    });

    it('should parse alert_before parameter', () => {
      const request = createMockRequest({ alert_before: '2024-03-15' });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({ before: new Date('2024-03-15') });
    });

    it('should parse alert_after parameter', () => {
      const request = createMockRequest({ alert_after: '2024-03-15' });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({ after: new Date('2024-03-15') });
    });

    it('should parse alert date range correctly', () => {
      const request = createMockRequest({
        alert_from: '2024-03-01',
        alert_to: '2024-03-31'
      });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({
        from: new Date('2024-03-01'),
        to: new Date('2024-03-31')
      });
    });

    it('should handle invalid alert date gracefully', () => {
      const request = createMockRequest({ alert: 'invalid-alert-date' });
      const result = getSearchParams(request);

      expect(result.alert).toBeUndefined();
    });

    it('should handle empty alert parameter', () => {
      const request = createMockRequest({ alert: '' });
      const result = getSearchParams(request);

      expect(result.alert).toBeUndefined();
    });
  });

  describe('Composite Cases', () => {
    it('should handle all parameters together', () => {
      const request = createMockRequest({
        query: 'test search',
        tag: 'javascript,react',
        created_from: '2024-01-01',
        created_to: '2024-01-31',
        updated: '2024-02-15',
        alert_before: '2024-03-15',
        page: '2',
        perPage: '25'
      });
      const result = getSearchParams(request);

      expect(result).toEqual({
        query: 'test search',
        tag: ['javascript', 'react'],
        created: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31')
        },
        updated: { at: new Date('2024-02-15') },
        alert: { before: new Date('2024-03-15') },
        page: 2,
        perPage: 25,
        offset: 25 // (2-1) * 25
      });
    });

    it('should handle mixed valid and invalid parameters', () => {
      const request = createMockRequest({
        query: 'valid query',
        tag: 'valid,tags',
        created: 'invalid-date',
        updated_from: '2024-01-01',
        updated_to: 'invalid-date',
        alert_after: '2024-03-15',
        page: 'invalid',
        perPage: '20'
      });
      const result = getSearchParams(request);

      expect(result).toEqual({
        query: 'valid query',
        tag: ['valid', 'tags'],
        created: undefined, // invalid date ignored
        updated: undefined, // invalid range ignored
        alert: { after: new Date('2024-03-15') },
        page: NaN, // invalid page becomes NaN
        perPage: 20,
        offset: NaN
      });
    });

    it('should handle complex tag combinations with special characters', () => {
      const request = createMockRequest({
        tag: 'javascript,react-native,vue.js,@angular,#hashtag'
      });
      const result = getSearchParams(request);

      expect(result.tag).toEqual(['javascript', 'react-native', 'vue.js', '@angular', '#hashtag']);
    });

    it('should handle ISO datetime strings correctly', () => {
      const request = createMockRequest({
        created: '2024-01-15T10:30:00Z',
        updated_from: '2024-02-01T00:00:00Z',
        updated_to: '2024-02-29T23:59:59Z',
        alert_before: '2024-03-15T14:30:00.000Z'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ at: new Date('2024-01-15T10:30:00Z') });
      expect(result.updated).toEqual({
        from: new Date('2024-02-01T00:00:00Z'),
        to: new Date('2024-02-29T23:59:59Z')
      });
      expect(result.alert).toEqual({ before: new Date('2024-03-15T14:30:00.000Z') });
    });

    it('should handle edge case with very large page numbers', () => {
      const request = createMockRequest({
        page: '999999',
        perPage: '1000'
      });
      const result = getSearchParams(request);

      expect(result.page).toBe(999999);
      expect(result.perPage).toBe(1000);
      expect(result.offset).toBe(999998000); // (999999-1) * 1000
    });
  });

  describe('URL Encoding Cases', () => {
    it('should handle URL-encoded parameters correctly', () => {
      const url = new URL('https://example.com/search');
      url.searchParams.set('query', 'hello world');
      url.searchParams.set('tag', 'javascript,react native');

      const request = new Request(url.toString());
      const result = getSearchParams(request);

      expect(result.query).toBe('hello world');
      expect(result.tag).toEqual(['javascript', 'react native']);
    });

    it('should handle special characters in tags', () => {
      const request = createMockRequest({
        tag: 'C++,C#,.NET,Node.js'
      });
      const result = getSearchParams(request);

      expect(result.tag).toEqual(['C++', 'C#', '.NET', 'Node.js']);
    });
  });

  describe('Type Safety', () => {
    it('should return correct TypeScript types', () => {
      const request = createMockRequest({
        query: 'test',
        tag: 'javascript',
        created_before: '2024-01-01',
        updated_from: '2024-02-01',
        updated_to: '2024-02-29',
        alert: '2024-03-01'
      });
      const result = getSearchParams(request);

      // Type assertions to ensure correct types
      expect(typeof result.query).toBe('string');
      expect(Array.isArray(result.tag)).toBe(true);
      expect(typeof result.created).toBe('object');
      expect(result.created && 'before' in result.created).toBe(true);
      expect(typeof result.updated).toBe('object');
      expect(result.updated && 'from' in result.updated).toBe(true);
      expect(result.updated && 'to' in result.updated).toBe(true);
      expect(typeof result.alert).toBe('object');
      expect(result.alert && 'at' in result.alert).toBe(true);
      expect(typeof result.page).toBe('number');
      expect(typeof result.perPage).toBe('number');
      expect(typeof result.offset).toBe('number');
    });
  });
});

describe('Simplified Implementation Behavior', () => {
  it('should handle partial date ranges without defensive programming', () => {
    const request = createMockRequest({
      created_from: '2024-01-01'
      // missing created_to
    });
    const result = getSearchParams(request);

    // Should be undefined since both from/to are required
    expect(result.created).toBeUndefined();
  });

  it('should return undefined for invalid date ranges', () => {
    const request = createMockRequest({
      updated_from: 'invalid-date',
      updated_to: 'also-invalid'
    });
    const result = getSearchParams(request);

    // Should return undefined for invalid dates
    expect(result.updated).toBeUndefined();
  });

  it('should preserve raw tag splitting behavior', () => {
    const request = createMockRequest({
      tag: 'a,,b,  ,c'
    });
    const result = getSearchParams(request);

    expect(result.tag).toEqual(['a', 'b', '  ', 'c']);
  });

  it('should allow negative and zero page numbers', () => {
    const request = createMockRequest({
      page: '-5',
      perPage: '0'
    });
    const result = getSearchParams(request);

    expect(result.page).toBe(-5);
    expect(result.perPage).toBe(0);
    expect(result.offset).toBe(-0); // (-5-1) * 0 = -0
  });

  it('should handle edge case with very large numbers', () => {
    const request = createMockRequest({
      page: '999999999999999',
      perPage: '1000000'
    });
    const result = getSearchParams(request);

    expect(result.page).toBe(999999999999999);
    expect(result.perPage).toBe(1000000);
    expect(result.offset).toBe(999999999999998000000); // (999999999999999-1) * 1000000
  });

  describe('DateFilter Behavior', () => {
    it('should handle all date filter types for created field', () => {
      const testCases = [
        { params: { created: '2024-01-15' }, expected: { at: new Date('2024-01-15') } },
        { params: { created_before: '2024-01-15' }, expected: { before: new Date('2024-01-15') } },
        { params: { created_after: '2024-01-15' }, expected: { after: new Date('2024-01-15') } },
        { params: { created_from: '2024-01-01', created_to: '2024-01-31' }, expected: { from: new Date('2024-01-01'), to: new Date('2024-01-31') } }
      ];

      testCases.forEach(({ params, expected }) => {
        const request = createMockRequest(params as unknown as Record<string, string>);
        const result = getSearchParams(request);
        expect(result.created).toEqual(expected);
      });
    });

    it('should handle all date filter types for updated field', () => {
      const testCases = [
        { params: { updated: '2024-02-15' }, expected: { at: new Date('2024-02-15') } },
        { params: { updated_before: '2024-02-15' }, expected: { before: new Date('2024-02-15') } },
        { params: { updated_after: '2024-02-15' }, expected: { after: new Date('2024-02-15') } },
        { params: { updated_from: '2024-02-01', updated_to: '2024-02-29' }, expected: { from: new Date('2024-02-01'), to: new Date('2024-02-29') } }
      ];

      testCases.forEach(({ params, expected }) => {
        const request = createMockRequest(params as unknown as Record<string, string>);
        const result = getSearchParams(request);
        expect(result.updated).toEqual(expected);
      });
    });

    it('should handle all date filter types for alert field', () => {
      const testCases = [
        { params: { alert: '2024-03-15' }, expected: { at: new Date('2024-03-15') } },
        { params: { alert_before: '2024-03-15' }, expected: { before: new Date('2024-03-15') } },
        { params: { alert_after: '2024-03-15' }, expected: { after: new Date('2024-03-15') } },
        { params: { alert_from: '2024-03-01', alert_to: '2024-03-31' }, expected: { from: new Date('2024-03-01'), to: new Date('2024-03-31') } }
      ] as const;

      testCases.forEach(({ params, expected }) => {
        const request = createMockRequest(params);
        const result = getSearchParams(request);
        expect(result.alert).toEqual(expected);
      });
    });

    it('should respect parameter priority: at > before/after > from/to', () => {
      const request = createMockRequest({
        created: '2024-01-15',
        created_before: '2024-01-10',
        created_after: '2024-01-20',
        created_from: '2024-01-01',
        created_to: '2024-01-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ at: new Date('2024-01-15') });
    });

    it('should handle mixed date filter types across fields', () => {
      const request = createMockRequest({
        created_before: '2024-01-15',
        updated_after: '2024-02-01',
        alert_from: '2024-03-01',
        alert_to: '2024-03-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ before: new Date('2024-01-15') });
      expect(result.updated).toEqual({ after: new Date('2024-02-01') });
      expect(result.alert).toEqual({ from: new Date('2024-03-01'), to: new Date('2024-03-31') });
    });
  });
});
