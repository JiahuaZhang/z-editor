import { expect, test } from 'vitest';
import { extractHashtags } from './supabase.server';

// handle search query
test('extract hashtags', async () => {
  // Test direct queries
  expect(extractHashtags('')).toEqual([]);
  expect(extractHashtags('#hashtag')).toEqual(['#hashtag']);
  expect(extractHashtags('#hashtag1 #hashtag2')).toEqual(['#hashtag1', '#hashtag2']);
  expect(extractHashtags('#hashtag1 #hashtag2 #hashtag3')).toEqual(['#hashtag1', '#hashtag2', '#hashtag3']);
  expect(extractHashtags('#foo-bar')).toEqual(['#foo-bar']);
  expect(extractHashtags('##apple')).toEqual([]);
  expect(extractHashtags('#中文')).toEqual(['#中文']);
  expect(extractHashtags('#中英-english')).toEqual(['#中英-english']);

  // Test queries with padding
  expect(extractHashtags(' #hashtag  ')).toEqual(['#hashtag']);
  expect(extractHashtags(' #hashtag1 #hashtag2  ')).toEqual(['#hashtag1', '#hashtag2']);

  // Test negative cases
  expect(extractHashtags('-#hashtag')).toEqual([]);
  expect(extractHashtags(' -#hashtag')).toEqual([]);
  expect(extractHashtags('foo #hashtag bar')).toEqual(['#hashtag']);
  expect(extractHashtags('foo ##apple bar')).toEqual([]);
});