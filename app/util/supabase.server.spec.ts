import { describe, expect, it } from 'vitest';
import { extractQueryPattern } from './supabase.server';

describe('extractQueryPattern', () => {

  // Test case 1: Query with only plain text words
  it('should extract only words from a plain text query', () => {
    const query = 'hello world this is a test';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: [],
      words: ['hello', 'world', 'this', 'is', 'a', 'test'],
      phrases: []
    });
  });

  // Test case 2: Query with a single hashtag
  it('should extract a single tag from a query starting with #', () => {
    const query = '#newfeature';
    const result = extractQueryPattern(query);
    // IMPORTANT: Your regex /(#\S+)/g with match[1] extracts the part AFTER the #
    // If you want to keep the #, you need to push match[0] in your function.
    // Assuming match[1] is intended (tag without #) based on your previous code.
    expect(result).toEqual({
      tags: ['#newfeature'],
      words: [],
      phrases: []
    });
  });

  // Test case 3: Query with multiple hashtags
  it('should extract multiple tags from a query with several #hashtags', () => {
    const query = '#bugfix #urgent #v2.0';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: ['#bugfix', '#urgent', '#v2.0'],
      words: [],
      phrases: []
    });
  });

  // Test case 4: Query with a single phrase
  it('should extract a single phrase from a query with double quotes', () => {
    const query = '"exact match phrase"';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: [],
      words: [],
      phrases: ['exact match phrase']
    });
  });

  // Test case 5: Query with multiple phrases
  it('should extract multiple phrases from a query with several double-quoted phrases', () => {
    const query = '"first phrase" "another one"';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: [],
      words: [],
      phrases: ['first phrase', 'another one']
    });
  });

  // Test case 6: Mixed query with words, tags, and phrases
  it('should extract words, tags, and phrases from a mixed query', () => {
    const query = 'important document #urgent "project alpha" review #bugfix';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: ['#urgent', '#bugfix'],
      words: ['important', 'document', 'review'],
      phrases: ['project alpha']
    });
  });

  // Test case 7: Query with leading/trailing/multiple spaces
  it('should handle leading/trailing/multiple spaces correctly', () => {
    const query = '  leading and trailing spaces   #taggy  "phrase with spaces"  ';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: ['#taggy'],
      words: ['leading', 'and', 'trailing', 'spaces'],
      phrases: ['phrase with spaces']
    });
  });

  // Test case 8: Empty query string
  it('should return empty arrays for an empty query string', () => {
    const query = '';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: [],
      words: [],
      phrases: []
    });
  });

  // Test case 9: Query with only spaces
  it('should return empty arrays for a query string with only spaces', () => {
    const query = '   ';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: [],
      words: [],
      phrases: []
    });
  });

  // Test case 10: Tags with special characters (Chinese, emoji, hyphens)
  it('should correctly extract tags with Chinese, emojis, and hyphens', () => {
    const query = '文档 #中文标签 #📕-重要 #emoji👍';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: ['#中文标签', '#📕-重要', '#emoji👍'],
      words: ['文档'],
      phrases: []
    });
  });

  // Test case 11: Phrases with special characters
  it('should correctly extract phrases with Chinese, emojis, and special characters', () => {
    const query = '"中文短语测试" "emoji😊 phrase!"';
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: [],
      words: [],
      phrases: ['中文短语测试', 'emoji😊 phrase!']
    });
  });

  // Test case 12: Query where a word might look like a tag or phrase but isn't
  it('should not misinterpret words as tags or phrases without correct syntax', () => {
    const query = 'this is#notatag "this is not a phrase'; // Missing closing quote
    const result = extractQueryPattern(query);
    expect(result).toEqual({
      tags: ["#notatag"],
      words: ['this', 'is', '"this', 'is', 'not', 'a', 'phrase'], // The unclosed phrase becomes regular words
      phrases: []
    });
  });

});
