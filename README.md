# TaskSchedule

TaskSchedule is a Team Task Manager where users can create projects, assign tasks, and track progress with role-based access.

## Supabase Setup Instructions

1. Go to your Supabase project dashboard (Project ID: `dgqxoguogzakauhxlgci`)
2. Go to the **SQL Editor** in the left sidebar.
3. Open the `supabase-setup.sql` file from this codebase.
4. Copy its contents, paste them into the SQL Editor, and hit **Run**.
5. Your database tables, RLS policies, and triggers are now fully set up.

## Features Built
- **Admin**: Can create projects and assign tasks to members.
- **Member**: Can view projects and update statuses of assigned tasks.
- **Role-Based Auth**: Stored properly via Supabase.
- **Dashboard Metrics**: Task completion, pending tasks, overdue tasks.

## Tech Stack
- React/Vite (TypeScript)
- Tailwind CSS
- Supabase SDK (Auth & PostgreSQL)
