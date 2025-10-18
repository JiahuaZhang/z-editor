CREATE TABLE editor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content JSONB NOT NULL,
    created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tag TEXT[],
    alert JSONB[],
    comment JSONB[],
    user_id UUID NOT NULL,
    is_public BOOLEAN DEFAULT FALSE
);

CREATE FUNCTION update_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_timestamp
BEFORE UPDATE ON editor_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_column();

ALTER TABLE editor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own or public documents"
ON editor_documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own documents"
ON editor_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON editor_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON editor_documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- CREATE OR REPLACE FUNCTION get_lexical_text_content(data JSONB)
-- RETURNS TEXT AS $$
-- DECLARE
--     result_text TEXT := '';
--     node JSONB;
--     child_node JSONB;
--     grandchild_node JSONB;
--     text_node JSONB;
--     excalidraw_data JSONB;
--     excalidraw_element JSONB;
-- BEGIN
--     IF data IS NULL OR data->'root' IS NULL OR data->'root'->'children' IS NULL THEN
--         RETURN '';
--     END IF;

--     FOR node IN SELECT * FROM jsonb_array_elements(data->'root'->'children')
--     LOOP
--         IF node->>'type' = 'paragraph' OR node->>'type' = 'heading' OR node->>'type' = 'listitem' OR node->>'type' = 'quote' THEN
--             IF node->'children' IS NOT NULL AND jsonb_typeof(node->'children') = 'array' THEN
--                 FOR child_node IN SELECT * FROM jsonb_array_elements(node->'children')
--                 LOOP
--                     IF child_node->>'type' = 'text' THEN
--                         result_text := result_text || ' ' || child_node->>'text';
--                     ELSIF child_node->>'type' = 'hashtag' THEN
--                         result_text := result_text || ' ' || child_node->>'text';
--                     ELSIF child_node->>'type' = 'link' THEN
--                         IF child_node->'children' IS NOT NULL AND jsonb_typeof(child_node->'children') = 'array' THEN
--                             FOR grandchild_node IN SELECT * FROM jsonb_array_elements(child_node->'children')
--                             LOOP
--                                 IF grandchild_node->>'type' = 'text' THEN
--                                     result_text := result_text || ' ' || grandchild_node->>'text';
--                                 END IF;
--                             END LOOP;
--                         END IF;
--                     ELSIF child_node->>'type' = 'equation' THEN
--                         result_text := result_text || ' ' || child_node->>'equation';
--                     END IF;
--                 END LOOP;
--             END IF;
--         ELSIF node->>'type' = 'collapsible-container' THEN
--             IF node->'children' IS NOT NULL AND jsonb_typeof(node->'children') = 'array' THEN
--                 FOR child_node IN SELECT * FROM jsonb_array_elements(node->'children')
--                 LOOP
--                     IF child_node->>'type' = 'collapsible-title' OR child_node->>'type' = 'collapsible-content' THEN
--                         IF child_node->'children' IS NOT NULL AND jsonb_typeof(child_node->'children') = 'array' THEN
--                             FOR grandchild_node IN SELECT * FROM jsonb_array_elements(child_node->'children')
--                             LOOP
--                                 IF grandchild_node->>'type' = 'paragraph' AND grandchild_node->'children' IS NOT NULL AND jsonb_typeof(grandchild_node->'children') = 'array' THEN
--                                     FOR text_node IN SELECT * FROM jsonb_array_elements(grandchild_node->'children')
--                                     LOOP
--                                         IF text_node->>'type' = 'text' THEN
--                                             result_text := result_text || ' ' || text_node->>'text';
--                                         END IF;
--                                     END LOOP;
--                                 END IF;
--                             END LOOP;
--                         END IF;
--                     END IF;
--                 END LOOP;
--             END IF;
--         ELSIF node->>'type' = 'excalidraw' THEN
--             IF node->'data' IS NOT NULL THEN
--                 BEGIN
--                     excalidraw_data := node->'data';
--                     IF excalidraw_data->'elements' IS NOT NULL AND jsonb_typeof(excalidraw_data->'elements') = 'array' THEN
--                         FOR excalidraw_element IN SELECT * FROM jsonb_array_elements(excalidraw_data->'elements')
--                         LOOP
--                             IF excalidraw_element->>'type' = 'text' AND excalidraw_element->>'text' IS NOT NULL THEN
--                                 result_text := result_text || ' ' || excalidraw_element->>'text';
--                             END IF;
--                         END LOOP;
--                     END IF;
--                 EXCEPTION WHEN OTHERS THEN
--                     RAISE NOTICE 'Error parsing excalidraw data: %', SQLERRM;
--                 END;
--             END IF;
--         END IF;
--     END LOOP;

--     RETURN trim(result_text);
-- END;
-- $$ LANGUAGE plpgsql IMMUTABLE;

CREATE EXTENSION IF NOT EXISTS pgroonga;

-- CREATE OR REPLACE FUNCTION update_search_content_from_jsonb()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.search_content = LOWER(get_lexical_text_content(NEW.content));
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER update_search_content_trigger
-- BEFORE INSERT OR UPDATE OF content ON editor_documents
-- FOR EACH ROW EXECUTE FUNCTION update_search_content_from_jsonb();

-- CREATE INDEX pgroonga_editor_documents_search_content_index
-- ON editor_documents USING PGroonga (search_content);

CREATE INDEX pgroonga_editor_documents_content_index
ON editor_documents USING PGroonga (content pgroonga_jsonb_full_text_search_ops_v2);
CREATE INDEX idx_editor_documents_tag_gin ON editor_documents USING GIN (tag);
CREATE INDEX idx_editor_documents_alert_gin ON editor_documents USING GIN (alert);

CREATE OR REPLACE FUNCTION search_documents_combined(
    tags TEXT[] DEFAULT NULL,
    words TEXT[] DEFAULT NULL,
    phrases TEXT[] DEFAULT NULL
)
RETURNS SETOF editor_documents
LANGUAGE plpgsql
AS $$
DECLARE
    pgroonga_query_string TEXT := '';
    where_clauses TEXT[] := ARRAY[]::TEXT[];
    final_query TEXT;
    keyword TEXT;
    phrase TEXT;
BEGIN
    IF tags IS NOT NULL AND array_length(tags, 1) > 0 THEN
        where_clauses := array_append(where_clauses, FORMAT('tag @> %L', tags));
        -- && 其中重叠
        -- @> 全部包含
    END IF;

    IF words IS NOT NULL AND array_length(words, 1) > 0 THEN
        FOREACH keyword IN ARRAY words
        LOOP
            pgroonga_query_string := pgroonga_query_string || ' ' || keyword || '*';
        END LOOP;
    END IF;

    IF phrases IS NOT NULL AND array_length(phrases, 1) > 0 THEN
        FOREACH phrase IN ARRAY phrases
        LOOP
            pgroonga_query_string := pgroonga_query_string || ' "' || phrase || '"';
        END LOOP;
    END IF;

    IF TRIM(pgroonga_query_string) != '' THEN
        where_clauses := array_append(where_clauses, FORMAT('content &@~ %L', TRIM(pgroonga_query_string)));
    END IF;

    IF array_length(where_clauses, 1) > 0 THEN
        final_query := 'SELECT * FROM editor_documents WHERE ' || array_to_string(where_clauses, ' AND ') || ' ORDER BY created DESC;';
    ELSE
        final_query := 'SELECT * FROM editor_documents WHERE FALSE;';
    END IF;

    RAISE NOTICE 'Executing query: %', final_query;

    RETURN QUERY EXECUTE final_query;
END;
$$;

CREATE OR REPLACE FUNCTION get_tag_statistics()
RETURNS TABLE(tag_name text, document_count bigint) AS $$
BEGIN
  RETURN QUERY
  WITH tag_expanded AS (
    SELECT 
      trim(unnest(ed.tag)) as tag_name
    FROM editor_documents ed
    WHERE ed.tag IS NOT NULL 
      AND array_length(ed.tag, 1) > 0
  )
  SELECT 
    te.tag_name,
    COUNT(*) as document_count
  FROM tag_expanded te
  WHERE te.tag_name != ''
  GROUP BY te.tag_name
  ORDER BY document_count DESC, te.tag_name ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_tag_statistics(selected_tags text[])
RETURNS TABLE(tag_name text, document_count bigint) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_documents AS (
    SELECT ed.*
    FROM editor_documents ed
    WHERE ed.tag IS NOT NULL 
      AND array_length(ed.tag, 1) > 0
      AND selected_tags <@ ed.tag
  ),
  tag_expanded AS (
    SELECT unnest(fd.tag) as tag_name
    FROM filtered_documents fd
  )
  SELECT 
    te.tag_name,
    COUNT(*) as document_count
  FROM tag_expanded te
  WHERE NOT (te.tag_name = ANY(selected_tags))  -- Exclude already selected tags
  GROUP BY te.tag_name
  ORDER BY document_count DESC, te.tag_name ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_documents_advanced(
    word_array TEXT[] DEFAULT NULL,
    phrase_array TEXT[] DEFAULT NULL,
    tag_array TEXT[] DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_before TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_after TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_before TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_after TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    updated_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    alert_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    alert_before TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    alert_after TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    alert_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    alert_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS SETOF editor_documents
LANGUAGE plpgsql
AS $$
DECLARE
    pgroonga_query_string TEXT := '';
    where_clauses TEXT[] := ARRAY[]::TEXT[];
    final_query TEXT;
    keyword TEXT;
    phrase TEXT;
BEGIN
    IF tag_array IS NOT NULL AND array_length(tag_array, 1) > 0 THEN
        where_clauses := array_append(where_clauses, FORMAT('tag @> %L', tag_array));
    END IF;

    IF word_array IS NOT NULL AND array_length(word_array, 1) > 0 THEN
        FOREACH keyword IN ARRAY word_array
        LOOP
            pgroonga_query_string := pgroonga_query_string || ' ' || keyword || '*';
        END LOOP;
    END IF;

    IF phrase_array IS NOT NULL AND array_length(phrase_array, 1) > 0 THEN
        FOREACH phrase IN ARRAY phrase_array
        LOOP
            pgroonga_query_string := pgroonga_query_string || ' "' || phrase || '"';
        END LOOP;
    END IF;

    IF TRIM(pgroonga_query_string) != '' THEN
        where_clauses := array_append(where_clauses, FORMAT('content &@~ %L', TRIM(pgroonga_query_string)));
    END IF;

    IF created_at IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('DATE(created) = DATE(%L)', created_at));
    ELSIF created_before IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('created <= %L', created_before));
    ELSIF created_after IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('created >= %L', created_after));
    ELSIF created_from IS NOT NULL AND created_to IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('created >= %L AND created <= %L', created_from, created_to));
    END IF;

    IF updated_at IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('DATE(updated) = DATE(%L)', updated_at));
    ELSIF updated_before IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('updated <= %L', updated_before));
    ELSIF updated_after IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('updated >= %L', updated_after));
    ELSIF updated_from IS NOT NULL AND updated_to IS NOT NULL THEN
        where_clauses := array_append(where_clauses, FORMAT('updated >= %L AND updated <= %L', updated_from, updated_to));
    END IF;

    IF alert_at IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 
            FORMAT('EXISTS (
                SELECT 1 FROM unnest(alert) AS alert_item
                WHERE DATE((alert_item->>''date'')::timestamp) = DATE(%L)
            )', alert_at, alert_at));
    ELSIF alert_before IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 
            FORMAT('EXISTS (
                SELECT 1 FROM unnest(alert) AS alert_item
                WHERE (alert_item->>''date'')::timestamp <= %L
            )', alert_before, alert_before));
    ELSIF alert_after IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 
            FORMAT('EXISTS (
                SELECT 1 FROM unnest(alert) AS alert_item
                WHERE (alert_item->>''date'')::timestamp >= %L
            )', alert_after, alert_after));
    ELSIF alert_from IS NOT NULL AND alert_to IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 
            FORMAT('EXISTS (
                SELECT 1 FROM unnest(alert) AS alert_item
                WHERE ((alert_item->>''date'')::timestamp >= %L AND (alert_item->>''date'')::timestamp <= %L)
            )', alert_from, alert_to, alert_from, alert_to));
    END IF;

    IF array_length(where_clauses, 1) > 0 THEN
        final_query := FORMAT('SELECT * FROM editor_documents WHERE %s ORDER BY created DESC LIMIT %s OFFSET %s', 
                             array_to_string(where_clauses, ' AND '), 
                             limit_count, 
                             offset_count);
    ELSE
        final_query := FORMAT('SELECT * FROM editor_documents ORDER BY created DESC LIMIT %s OFFSET %s', 
                             limit_count, 
                             offset_count);
    END IF;

    RAISE NOTICE 'Executing advanced search query: %', final_query;

    RETURN QUERY EXECUTE final_query;
END;
$$;
