# Supabase Setup

## 1. Create Project in Supabase
Create a project.

## 2. Run SQL
```sql
create table surveys (
 id bigint generated always as identity primary key,
 full_name text,
 position text,
 branch text,
 phase text,
 score int,
 created_at timestamptz default now()
);
```

## 3. Get Keys
Project Settings > API
- URL
- anon public key

## 4. Add in Vercel Environment Variables
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

## 5. Redeploy
After adding env vars, redeploy project.
