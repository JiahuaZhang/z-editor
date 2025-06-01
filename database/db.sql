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