
CREATE TABLE public.plaintext_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password text NOT NULL,
  display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plaintext_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo: anyone can insert plaintext users"
ON public.plaintext_users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Demo: anyone can read plaintext users"
ON public.plaintext_users
FOR SELECT
TO anon, authenticated
USING (true);
