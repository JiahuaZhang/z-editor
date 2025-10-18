# Advanced Search Function Testing Guide

## Function Overview

The `search_documents_advanced` function supports all parameters from your `getSearchParams` function:

- **Text Search**: `word_array`, `phrase_array` (using PGroonga full-text search)
- **Tag Filtering**: `tag_array` (exact tag matching)
- **Date Filtering**: `created_*`, `updated_*`, `alert_*` (various date filter types)
- **Pagination**: `limit_count`, `offset_count`

## Testing in Supabase SQL Editor

### 1. Basic Text Search

```sql
-- Test word search
SELECT * FROM search_documents_advanced(
    word_array := ARRAY['黄金', '3600']
);

-- Test phrase search
SELECT * FROM search_documents_advanced(
    phrase_array := ARRAY['美国金融业监管局', 'surpassing 2008 financial']
);

-- Test combined word and phrase search
SELECT * FROM search_documents_advanced(
    word_array := ARRAY['javascript', 'typescript'],
    phrase_array := ARRAY['react hooks']
);
```

### 2. Tag Filtering

```sql
-- Test single tag
SELECT * FROM search_documents_advanced(
    tag_array := ARRAY['#prompt']
);

-- Test multiple tags (documents must have ALL tags)
SELECT * FROM search_documents_advanced(
    tag_array := ARRAY['#技术', '#前端']
);

-- Test combined text and tag search
SELECT * FROM search_documents_advanced(
    word_array := ARRAY['react'],
    tag_array := ARRAY['#前端']
);
```

### 3. Date Filtering - Created

```sql
-- Test created "at" specific date
SELECT * FROM search_documents_advanced(
    created_at := '2025-10-06'::timestamp
);

-- Test created "before" date
SELECT * FROM search_documents_advanced(
    created_before := '2025-10-11'::timestamp
);

-- Test created "after" date
SELECT * FROM search_documents_advanced(
    created_after := '2024-12-01'::timestamp
);

-- Test created date range
SELECT * FROM search_documents_advanced(
    created_from := '2024-12-01'::timestamp,
    created_to := '2025-09-21'::timestamp
);
```

### 4. Date Filtering - Updated

```sql
-- Test updated "at" specific date
SELECT * FROM search_documents_advanced(
    updated_at := '2025-01-15'::timestamp
);

-- Test updated "before" date
SELECT * FROM search_documents_advanced(
    updated_before := '2025-01-01'::timestamp
);

-- Test updated date range
SELECT * FROM search_documents_advanced(
    updated_from := '2024-12-01'::timestamp,
    updated_to := '2025-01-31'::timestamp
);
```

### 5. Date Filtering - Alert

```sql
-- Test alert "at" specific date
SELECT * FROM search_documents_advanced(
    alert_at := '2025-09-05'::timestamp
);

-- Test alert "before" date
SELECT * FROM search_documents_advanced(
    alert_before := '2025-12-01'::timestamp
);

-- Test alert date range
SELECT * FROM search_documents_advanced(
    alert_from := '2025-08-01'::timestamp,
    alert_to := '2025-12-31'::timestamp
);
```

### 6. Pagination

```sql
-- Test pagination (first page, 10 items)
SELECT * FROM search_documents_advanced(
    word_array := ARRAY['技术'],
    limit_count := 10,
    offset_count := 0
);

-- Test pagination (second page, 10 items)
SELECT * FROM search_documents_advanced(
    word_array := ARRAY['技术'],
    limit_count := 10,
    offset_count := 10
);
```

### 7. Complex Combined Search

```sql
-- Test comprehensive search scenario
SELECT * FROM search_documents_advanced(
    word_array := ARRAY['javascript', 'tutorial'],
    phrase_array := ARRAY['react hooks', 'best practices'],
    tag_array := ARRAY['#前端', '#技术'],
    created_after := '2024-01-01'::timestamp,
    updated_from := '2024-02-01'::timestamp,
    updated_to := '2024-02-29'::timestamp,
    alert_before := '2025-03-15'::timestamp,
    limit_count := 15,
    offset_count := 0
);
```

## Debugging Tips

### 1. Enable Query Logging

The function includes `RAISE NOTICE` statements to show the generated SQL. To see these:

```sql
-- Set client_min_messages to notice level
SET client_min_messages TO NOTICE;

-- Then run your search function
SELECT * FROM search_documents_advanced(word_array := ARRAY['test']);
```

### 2. Test Individual Components

```sql
-- Test tag filtering only
SELECT * FROM editor_documents WHERE tag @> ARRAY['#技术'];

-- Test PGroonga text search only
SELECT * FROM editor_documents WHERE content &@~ 'javascript*';

-- Test date filtering only
SELECT * FROM editor_documents WHERE created >= '2024-01-01'::timestamp;

-- Test alert date extraction
SELECT id, alert, 
       jsonb_array_elements(alert) AS alert_item
FROM editor_documents 
WHERE alert IS NOT NULL AND jsonb_array_length(alert) > 0;
```

### 3. Validate Alert Date Parsing

```sql
-- Check alert date structure in your data
SELECT id, 
       alert,
       (SELECT jsonb_agg(
           jsonb_build_object(
               'date', alert_item->>'date',
               'time', alert_item->>'time',
               'parsed_date', (alert_item->>'date')::timestamp,
               'parsed_time', (alert_item->>'time')::timestamp
           )
       ) FROM jsonb_array_elements(alert) AS alert_item) AS parsed_alerts
FROM editor_documents 
WHERE alert IS NOT NULL AND jsonb_array_length(alert) > 0
LIMIT 5;
```

### 4. Performance Testing

```sql
-- Check query execution plan
EXPLAIN ANALYZE SELECT * FROM search_documents_advanced(
    word_array := ARRAY['javascript'],
    tag_array := ARRAY['#技术']
);

-- Test with different parameter combinations to see performance
EXPLAIN ANALYZE SELECT * FROM search_documents_advanced(
    phrase_array := ARRAY['react hooks']
);
```

## Expected Results Based on Your Data

Based on your database screenshot, you should see results for:

- Tags like `#技术`, `#前端`, `#投资`, etc.
- Documents created around 2025-08-30, 2025-09-22, etc.
- Alert dates around 2025-09-05 (from your example alert JSON)

## Common Issues and Solutions

### 1. No Results for Alert Dates

If alert date filtering returns no results, check:
```sql
-- Verify alert structure
SELECT alert FROM editor_documents WHERE alert IS NOT NULL LIMIT 1;
```

### 2. PGroonga Not Working

If text search doesn't work:
```sql
-- Check if PGroonga extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pgroonga';

-- Check if indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'editor_documents';
```

### 3. Date Format Issues

If date filtering fails:
```sql
-- Test date parsing
SELECT '2025-01-15'::timestamp;
SELECT 'Sun, 31 Aug 2025 14:00:00 GMT'::timestamp;
```

## Integration with TypeScript

Once you've tested the function, you can integrate it with your TypeScript code:

```typescript
// In your supabase.server.ts
export async function searchDocumentsAdvanced(request: Request, searchParams: SearchParams) {
  const { supabase } = createSupabaseServerClient(request);
  
  const { data, error } = await supabase.rpc('search_documents_advanced', {
    word_array: searchParams.word,
    phrase_array: searchParams.phrase,
    tag_array: searchParams.tag,
    created_at: searchParams.created?.at,
    created_before: searchParams.created?.before,
    created_after: searchParams.created?.after,
    created_from: searchParams.created?.from,
    created_to: searchParams.created?.to,
    updated_at: searchParams.updated?.at,
    updated_before: searchParams.updated?.before,
    updated_after: searchParams.updated?.after,
    updated_from: searchParams.updated?.from,
    updated_to: searchParams.updated?.to,
    alert_at: searchParams.alert?.at,
    alert_before: searchParams.alert?.before,
    alert_after: searchParams.alert?.after,
    alert_from: searchParams.alert?.from,
    alert_to: searchParams.alert?.to,
    limit_count: searchParams.perPage,
    offset_count: searchParams.offset
  });

  return { data, error };
}
```
