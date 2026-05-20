# TeamTaskSchedule

TeamTaskSchedule is a TeamTaskSchedule application where users can create projects, assign tasks, and track progress with role-based access.

## Live Project Link

https://taskschedule-production.up.railway.app

## GitHub Repository

https://github.com/kaifali532/taskschedule

## Supabase Setup Instructions

1. Go to your Supabase project dashboard (Project ID: `dgqxoguogzakauhxlgci`)
2. Go to the **SQL Editor** in the left sidebar.
3. Open the `supabase-setup.sql` file from this codebase.
4. Copy its contents, paste them into the SQL Editor, and hit **Run**.
5. Your database tables, RLS policies, and triggers are now fully set up.

## Features Built

- **Admin**: Can create projects, assign tasks to members, and track all project progress.
- **Member**: Can view assigned projects and update statuses of assigned tasks.
- **Role-Based Auth**: User roles are stored properly using Supabase.
- **Dashboard Metrics**: Shows task completion, pending tasks, overdue tasks, and overall progress.
- **Project Management**: Admin can manage projects and organize team work.
- **Task Tracking**: Users can track task status like pending, in progress, completed, and overdue.
- **Secure Access**: Row Level Security policies protect user data based on roles.
- **3D UI Design**: The app includes modern 3D-style design elements to make the interface more attractive and interactive.
- **Interactive Visual Experience**: 3D design improves the user experience by giving the dashboard a premium and engaging look.
- **Modern Dashboard Layout**: The application uses clean cards, smooth spacing, shadows, rounded corners, and visual depth for a professional interface.
- **Responsive Design**: The UI is designed to work properly on different screen sizes.

## 3D Design and UI Experience

TeamTaskSchedule includes a modern 3D-style user interface to make the application visually appealing and user-friendly.

The 3D design helps the app look more professional and interactive. It improves the overall dashboard experience by using visual depth, clean layout, and modern design effects.

Main 3D/UI design highlights include:

- 3D-style dashboard cards
- Modern project and task cards
- Smooth shadow effects
- Rounded corner design
- Clean spacing and alignment
- Attractive visual hierarchy
- Interactive buttons and sections
- Modern color combination
- Premium-looking user interface
- Better user engagement through visual design

The 3D design gives the application a modern SaaS-style look and makes project tracking more interesting for users.

## Tech Stack

- React/Vite (TypeScript)
- Tailwind CSS
- Supabase SDK (Auth & PostgreSQL)
- Supabase Database
- Railway Deployment
- GitHub for Version Control
- Modern 3D UI Design

## Role-Based Access

- **Admin Role**: Admin has full access to create projects, assign tasks, and monitor progress.
- **Member Role**: Member has limited access and can only view assigned tasks and update task status.

## Database Setup

The project uses Supabase PostgreSQL database. The setup file creates all required tables, policies, and triggers.

Main database features include:

- User profiles table
- Projects table
- Tasks table
- Role-based permissions
- Row Level Security policies
- Automatic profile creation trigger

## Dashboard Metrics

The dashboard helps users understand project progress quickly.

It includes:

- Total tasks
- Completed tasks
- Pending tasks
- Overdue tasks
- Task completion percentage
- Project-wise progress
- Visually attractive metric cards
- 3D-style dashboard components

## Project Purpose

This project was built to practice full-stack development using React, TypeScript, Tailwind CSS, Supabase, and Railway.

It demonstrates:

- Authentication
- Authorization
- Role-based access
- CRUD operations
- Task assignment
- Project tracking
- Database integration
- Deployment
- Modern UI design
- 3D-style frontend design
- Responsive dashboard development

## 3D Design Purpose

The purpose of adding 3D design in this app is to make the interface more attractive, modern, and easy to use.

It helps in:

- Improving the visual appearance of the app
- Making the dashboard look more professional
- Creating a better first impression for users
- Making task and project cards more noticeable
- Improving user engagement
- Giving the app a modern product-based look

## Future Improvements

- Add email notifications for assigned tasks.
- Add task priority levels.
- Add due date reminders.
- Add task comments.
- Add file attachments.
- Add search and filter options.
- Add dark mode.
- Add activity logs.
- Improve mobile responsiveness.
- Add more 3D animations.
- Add animated dashboard charts.
- Add smooth page transitions.
- Add 3D icons for projects and tasks.
- Improve overall UI animations.

## Deployment

The project is deployed on Railway.

Live Link: https://taskschedule-production.up.railway.app

## Repository

Source Code: https://github.com/kaifali532/taskschedule
