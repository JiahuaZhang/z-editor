ALTER TABLE editor_documents 
ADD COLUMN search_vector TSVECTOR;

ALTER TABLE editor_documents DROP COLUMN IF EXISTS search_vector;

-- 删除旧的 search_content 列（如果它存在）
ALTER TABLE editor_documents DROP COLUMN IF EXISTS search_content;

-- 删除之前用于更新 search_content 的触发器函数（如果它存在）
DROP FUNCTION IF EXISTS update_search_content_from_jsonb;
