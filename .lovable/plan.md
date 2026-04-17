
The user is asking about the current database situation and what would be used for security features.

From exploring the codebase, I can see:
- This is a pure client-side React/Vite/TypeScript prototype
- State is managed entirely in-memory via React Context (`src/contexts/BloomContext.tsx`)
- No backend, no database, no authentication
- All data (tasks, members, availability, chat) is hardcoded defaults that reset on page reload
- No Supabase client, no `.env`, no edge functions

## Current State

**No database is currently being used.** Bloom is a high-fidelity frontend prototype only. Everything lives in React state and disappears on refresh.

## Recommended Path: Lovable Cloud (Supabase)

To add real security features, we'd enable **Lovable Cloud**, which provisions a managed Supabase backend (PostgreSQL + Auth + Storage + Edge Functions) without needing an external account or API keys.

### What this unlocks for Bloom

| Security feature | How Lovable Cloud delivers it |
|---|---|
| User authentication | Built-in email/password, Google, Apple sign-in |
| Per-user data isolation | Postgres Row-Level Security (RLS) policies |
| Role-based access (e.g. group owner vs member) | Dedicated `user_roles` table + `has_role()` security-definer function |
| Group/invite-code protection | RLS policies scoped to group membership |
| Secure secrets | Managed secret storage for edge functions |
| Leaked password protection | HIBP check toggle |
| Audit trail | Postgres triggers + timestamped rows |

### Proposed schema (when you're ready to build)

```text
auth.users              ← managed by Supabase
profiles                ← display_name, avatar (1:1 with auth.users)
user_roles              ← (user_id, role)  ← roles in separate table for security
groups                  ← project_name, due_date, group_code, owner_id
group_members           ← (group_id, user_id)
tasks                   ← group_id, name, description, estimated_hours
delegated_tasks         ← task_id, assigned_to, status, reason
availability            ← user_id, day, time_slot
chat_messages           ← group_id, sender_id, text, timestamp
```

Each table gets RLS enabled with policies like "members can read their group's tasks" and "only assignee can approve their own task."

### Important security rule
Roles must live in a **separate `user_roles` table**, never on `profiles`. Storing roles on the user/profile row enables privilege-escalation attacks. We'd use a `SECURITY DEFINER` function `has_role(user_id, role)` inside RLS policies to avoid recursion.

## Implementation phases (when approved)

1. Enable Lovable Cloud (one click — no signup)
2. Create schema + RLS policies via migration
3. Add auth pages (sign up / log in / log out) and session listener
4. Replace `BloomContext` defaults with live Supabase queries
5. Add `user_roles` + `has_role()` for group-owner permissions
6. Enable HIBP leaked-password protection
7. Run security scan to verify all tables have RLS

## Answer in short
- **Currently:** no database — pure in-memory React state.
- **Recommended:** Lovable Cloud (managed Postgres via Supabase) with RLS, a separate `user_roles` table, and built-in auth. No external account needed.

Want me to proceed by enabling Lovable Cloud and scaffolding auth + the schema above?
