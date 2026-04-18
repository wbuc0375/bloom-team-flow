-- Add encryption key column to groups (base64-encoded AES-GCM 256 key)
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS encryption_key TEXT;

-- Add IV column to chat_messages (base64-encoded 12-byte IV)
-- The existing 'text' column will now hold the base64 ciphertext.
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS iv TEXT;