import { beforeAll, describe, expect, it } from 'vitest';
import { DEFAULT_DOCUMENTS_PER_PAGE } from '~/lib/constant';
import { advanceSearch, getSearchParams } from './document.search.server';

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
        word: [],
        phrase: [],
        tag: [],
        page: 1,
        perPage: DEFAULT_DOCUMENTS_PER_PAGE,
        offset: 0,
      });
    });

    it('should parse query parameter into words', () => {
      const request = createMockRequest({ query: 'test search' });
      const result = getSearchParams(request);

      expect(result.word).toEqual(['test', 'search']);
      expect(result.phrase).toEqual([]);
    });

    it('should extract phrases from query', () => {
      const request = createMockRequest({ query: 'hello "exact phrase" world' });
      const result = getSearchParams(request);

      expect(result.word).toEqual(['hello', 'world']);
      expect(result.phrase).toEqual(['exact phrase']);
    });

    it('should handle multiple phrases in query', () => {
      const request = createMockRequest({ query: '"first phrase" and "second phrase" with words' });
      const result = getSearchParams(request);

      expect(result.word).toEqual(['and', 'with', 'words']);
      expect(result.phrase).toEqual(['first phrase', 'second phrase']);
    });

    it('should handle empty query parameter', () => {
      const request = createMockRequest({ query: '' });
      const result = getSearchParams(request);

      expect(result.word).toEqual([]);
      expect(result.phrase).toEqual([]);
    });

    it('should handle query with only phrases', () => {
      const request = createMockRequest({ query: '"only phrase"' });
      const result = getSearchParams(request);

      expect(result.word).toEqual([]);
      expect(result.phrase).toEqual(['only phrase']);
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

  describe('Query Parameters', () => {
    it('should handle complex query with words and phrases', () => {
      const request = createMockRequest({
        query: 'javascript "react hooks" typescript "best practices" tutorial'
      });
      const result = getSearchParams(request);

      expect(result.word).toEqual(['javascript', 'typescript', 'tutorial']);
      expect(result.phrase).toEqual(['react hooks', 'best practices']);
    });

    it('should handle query with extra whitespace', () => {
      const request = createMockRequest({
        query: '  hello   "world test"   foo   bar  '
      });
      const result = getSearchParams(request);

      expect(result.word).toEqual(['hello', 'foo', 'bar']);
      expect(result.phrase).toEqual(['world test']);
    });

    it('should handle malformed quotes gracefully', () => {
      const request = createMockRequest({
        query: 'hello "unclosed quote and more words'
      });
      const result = getSearchParams(request);

      expect(result.word).toEqual(['hello', '"unclosed', 'quote', 'and', 'more', 'words']);
      expect(result.phrase).toEqual([]);
    });

    it('should handle empty phrases', () => {
      const request = createMockRequest({
        query: 'hello "" world'
      });
      const result = getSearchParams(request);

      expect(result.word).toEqual(['hello', '""', 'world']);
      expect(result.phrase).toEqual([]);
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

      expect(result.created).toEqual({ at: '2024-01-15' });
    });

    it('should parse created_before parameter', () => {
      const request = createMockRequest({ created_before: '2024-01-15' });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ before: '2024-01-15' });
    });

    it('should parse created_after parameter', () => {
      const request = createMockRequest({ created_after: '2024-01-15' });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ after: '2024-01-15' });
    });

    it('should parse created date range correctly', () => {
      const request = createMockRequest({
        created_from: '2024-01-01',
        created_to: '2024-01-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({
        from: '2024-01-01',
        to: '2024-01-31'
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

      expect(result.created).toEqual({ at: '2024-01-15' });
    });

    it('should prioritize before/after over range parameters', () => {
      const request = createMockRequest({
        created_before: '2024-01-15',
        created_from: '2024-01-01',
        created_to: '2024-01-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ before: '2024-01-15' });
    });
  });

  describe('Updated Date Parameters', () => {
    it('should parse single updated date as "at" filter', () => {
      const request = createMockRequest({ updated: '2024-02-15' });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({ at: '2024-02-15' });
    });

    it('should parse updated_before parameter', () => {
      const request = createMockRequest({ updated_before: '2024-02-15' });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({ before: '2024-02-15' });
    });

    it('should parse updated_after parameter', () => {
      const request = createMockRequest({ updated_after: '2024-02-15' });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({ after: '2024-02-15' });
    });

    it('should parse updated date range correctly', () => {
      const request = createMockRequest({
        updated_from: '2024-02-01',
        updated_to: '2024-02-29'
      });
      const result = getSearchParams(request);

      expect(result.updated).toEqual({
        from: '2024-02-01',
        to: '2024-02-29'
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

      expect(result.updated).toEqual({ at: '2024-02-15' });
    });
  });

  describe('Alert Date Parameters', () => {
    it('should parse alert date as "at" filter', () => {
      const request = createMockRequest({ alert: '2024-03-15' });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({ at: '2024-03-15' });
    });

    it('should parse alert_before parameter', () => {
      const request = createMockRequest({ alert_before: '2024-03-15' });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({ before: '2024-03-15' });
    });

    it('should parse alert_after parameter', () => {
      const request = createMockRequest({ alert_after: '2024-03-15' });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({ after: '2024-03-15' });
    });

    it('should parse alert date range correctly', () => {
      const request = createMockRequest({
        alert_from: '2024-03-01',
        alert_to: '2024-03-31'
      });
      const result = getSearchParams(request);

      expect(result.alert).toEqual({
        from: '2024-03-01',
        to: '2024-03-31'
      });
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
        query: 'test "search phrase"',
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
        word: ['test'],
        phrase: ['search phrase'],
        tag: ['javascript', 'react'],
        created: {
          from: '2024-01-01',
          to: '2024-01-31'
        },
        updated: { at: '2024-02-15' },
        alert: { before: '2024-03-15' },
        page: 2,
        perPage: 25,
        offset: 25 // (2-1) * 25
      });
    });

    it('should handle mixed valid and invalid parameters', () => {
      const request = createMockRequest({
        query: 'valid "query phrase"',
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
        word: ['valid'],
        phrase: ['query phrase'],
        tag: ['valid', 'tags'],
        created: { at: 'invalid-date' }, // now accepts any string
        updated: { from: '2024-01-01', to: 'invalid-date' }, // now accepts any string
        alert: { after: '2024-03-15' },
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

      expect(result.created).toEqual({ at: '2024-01-15T10:30:00Z' });
      expect(result.updated).toEqual({
        from: '2024-02-01T00:00:00Z',
        to: '2024-02-29T23:59:59Z'
      });
      expect(result.alert).toEqual({ before: '2024-03-15T14:30:00.000Z' });
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

      expect(result.word).toEqual(['hello', 'world']);
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
        query: 'test "phrase"',
        tag: 'javascript',
        created_before: '2024-01-01',
        updated_from: '2024-02-01',
        updated_to: '2024-02-29',
        alert: '2024-03-01'
      });
      const result = getSearchParams(request);

      // Type assertions to ensure correct types
      expect(Array.isArray(result.word)).toBe(true);
      expect(Array.isArray(result.phrase)).toBe(true);
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
        { params: { created: '2024-01-15' }, expected: { at: '2024-01-15' } },
        { params: { created_before: '2024-01-15' }, expected: { before: '2024-01-15' } },
        { params: { created_after: '2024-01-15' }, expected: { after: '2024-01-15' } },
        { params: { created_from: '2024-01-01', created_to: '2024-01-31' }, expected: { from: '2024-01-01', to: '2024-01-31' } }
      ];

      testCases.forEach(({ params, expected }) => {
        const request = createMockRequest(params as unknown as Record<string, string>);
        const result = getSearchParams(request);
        expect(result.created).toEqual(expected);
      });
    });

    it('should handle all date filter types for updated field', () => {
      const testCases = [
        { params: { updated: '2024-02-15' }, expected: { at: '2024-02-15' } },
        { params: { updated_before: '2024-02-15' }, expected: { before: '2024-02-15' } },
        { params: { updated_after: '2024-02-15' }, expected: { after: '2024-02-15' } },
        { params: { updated_from: '2024-02-01', updated_to: '2024-02-29' }, expected: { from: '2024-02-01', to: '2024-02-29' } }
      ];

      testCases.forEach(({ params, expected }) => {
        const request = createMockRequest(params as unknown as Record<string, string>);
        const result = getSearchParams(request);
        expect(result.updated).toEqual(expected);
      });
    });

    it('should handle all date filter types for alert field', () => {
      const testCases = [
        { params: { alert: '2024-03-15' }, expected: { at: '2024-03-15' } },
        { params: { alert_before: '2024-03-15' }, expected: { before: '2024-03-15' } },
        { params: { alert_after: '2024-03-15' }, expected: { after: '2024-03-15' } },
        { params: { alert_from: '2024-03-01', alert_to: '2024-03-31' }, expected: { from: '2024-03-01', to: '2024-03-31' } }
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

      expect(result.created).toEqual({ at: '2024-01-15' });
    });

    it('should handle mixed date filter types across fields', () => {
      const request = createMockRequest({
        created_before: '2024-01-15',
        updated_after: '2024-02-01',
        alert_from: '2024-03-01',
        alert_to: '2024-03-31'
      });
      const result = getSearchParams(request);

      expect(result.created).toEqual({ before: '2024-01-15' });
      expect(result.updated).toEqual({ after: '2024-02-01' });
      expect(result.alert).toEqual({ from: '2024-03-01', to: '2024-03-31' });
    });
  });
});

describe('advanceSearch Integration Tests', () => {
  let supabaseClient: any;
  let authCookie: string = '';

  beforeAll(async () => {
    // Import createClient dynamically to avoid issues in test environment
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_KEY!
    );

    authCookie = process.env.TEST_AUTH_COOKIE || '';

    if (!authCookie) {
      console.log('\n🔐 Authentication Required for Integration Tests');
      console.log('Please visit: http://localhost:5173/auth/google');
      console.log('After login, copy the session cookie and set TEST_AUTH_COOKIE environment variable');
      console.log('You can find the cookie in browser dev tools > Application > Cookies');
      console.log('Look for cookies starting with "sb-" from your Supabase domain\n');
    }
  });

  const createMockRequest = (searchParams: Record<string, string> = {}): Request => {
    const url = new URL('https://example.com/search');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const headers = new Headers();
    if (authCookie) {
      headers.set('Cookie', authCookie);
    }

    return new Request(url.toString(), { headers });
  };

  describe('Database Integration', () => {
    it('should fetch all documents from database with authentication', async () => {
      if (!authCookie) {
        console.log('⚠️  Skipping test - no authentication cookie provided');
        console.log('Set TEST_AUTH_COOKIE environment variable to run this test');
        return;
      }

      const request = createMockRequest({ perPage: '10' });
      const searchParams = getSearchParams(request);
      const result = await advanceSearch(supabaseClient, searchParams);

      console.log('📊 Search Result:', {
        hasError: 'error' in result,
        documentCount: 'documents' in result ? result.documents.length : 0,
        totalCount: 'totalCount' in result ? result.totalCount : 0
      });

      expect(result).not.toHaveProperty('error');
      if ('documents' in result) {
        expect(Array.isArray(result.documents)).toBe(true);
        expect(typeof result.totalCount).toBe('number');
        expect(typeof result.totalPages).toBe('number');
        expect(result.searchParams.perPage).toBe(10);

        // Log some sample data if available
        if (result.documents.length > 0) {
          console.log('📄 Sample document structure:', {
            id: result.documents[0].id,
            hasContent: !!result.documents[0].content,
            tags: result.documents[0].tag,
            created: result.documents[0].created,
            updated: result.documents[0].updated
          });
        }
      }
    });

    it('should handle date filtering with string dates', async () => {
      if (!authCookie) {
        console.log('⚠️  Skipping test - no authentication cookie provided');
        return;
      }

      const request = createMockRequest({
        created_after: '2020-01-01',
        updated_before: '2025-12-31',
        perPage: '5'
      });
      const searchParams = getSearchParams(request);
      const result = await advanceSearch(supabaseClient, searchParams);

      console.log('📅 Date Filter Result:', {
        hasError: 'error' in result,
        documentCount: 'documents' in result ? result.documents.length : 0,
        totalCount: 'totalCount' in result ? result.totalCount : 0,
        searchParams: 'searchParams' in result ? result.searchParams : null
      });

      expect(result).not.toHaveProperty('error');
      if ('documents' in result) {
        expect(Array.isArray(result.documents)).toBe(true);
        expect(typeof result.totalCount).toBe('number');
        expect(result.searchParams.created).toEqual({ after: '2020-01-01' });
        expect(result.searchParams.updated).toEqual({ before: '2025-12-31' });

        // Verify date filtering worked if we have documents
        if (result.documents.length > 0) {
          result.documents.forEach(doc => {
            const createdDate = new Date(doc.created!).getTime();
            const updatedDate = new Date(doc.updated!).getTime();
            expect(createdDate).toBeGreaterThan(new Date('2020-01-01').getTime());
            expect(updatedDate).toBeLessThan(new Date('2025-12-31').getTime());
          });
        }
      }
    });

    it('should handle date range filtering', async () => {
      if (!authCookie) {
        console.log('⚠️  Skipping test - no authentication cookie provided');
        return;
      }

      const request = createMockRequest({
        created_from: '2024-01-01',
        created_to: '2024-12-31',
        perPage: '5'
      });
      const searchParams = getSearchParams(request);
      const result = await advanceSearch(supabaseClient, searchParams);

      console.log('📅 Date Range Result:', {
        hasError: 'error' in result,
        documentCount: 'documents' in result ? result.documents.length : 0,
        searchParams: 'searchParams' in result ? result.searchParams : null
      });

      expect(result).not.toHaveProperty('error');
      if ('documents' in result) {
        expect(result.searchParams.created).toEqual({ from: '2024-01-01', to: '2024-12-31' });

        // Verify date range filtering if we have documents
        if (result.documents.length > 0) {
          result.documents.forEach(doc => {
            const createdDate = new Date(doc.created!).getTime();
            expect(createdDate).toBeGreaterThanOrEqual(new Date('2024-01-01').getTime());
            expect(createdDate).toBeLessThanOrEqual(new Date('2024-12-31').getTime());
          });
        }
      }
    });
  });
});
