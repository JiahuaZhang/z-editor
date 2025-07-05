-- DROP TRIGGER IF EXISTS set_updated_timestamp ON editor_documents;
DROP FUNCTION IF EXISTS update_updated_column;

CREATE TABLE editor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content JSONB NOT NULL,
    created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tag TEXT[],
    reminder JSONB[],
    comment JSONB[],
    user_id UUID NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    -- search_content TEXT
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

CREATE OR REPLACE FUNCTION search_documents_jsonb(query_text TEXT)
RETURNS SETOF editor_documents
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT *
    FROM editor_documents
    WHERE content &@~ query_text
    ORDER BY created DESC;
END;
$$;