TeamTaskSchedule

TeamTaskSchedule is a full-stack task and project management application designed for teams to efficiently organize work, assign responsibilities, and track progress in real time. It provides a clean interface with role-based access control, making it suitable for both small teams and growing organizations.

🔗 Live App: https://taskschedule-production.up.railway.app/projects
📦 Repository: https://github.com/kaifali532/taskschedule.git

---

🚀 Overview

This project allows teams to:

- Create and manage multiple projects
- Assign tasks to team members
- Track task progress and completion status
- Monitor overall productivity using dashboard metrics

It uses Supabase as the backend for authentication and database, combined with a modern React + Vite + TypeScript frontend.

---

🎯 Key Features

👨‍💼 Admin Capabilities

- Create and manage projects
- Assign tasks to team members
- View team-wide progress
- Track overdue and pending tasks

👨‍🔧 Member Capabilities

- View assigned projects and tasks
- Update task status (e.g., pending → completed)
- Stay aligned with team progress

🔐 Authentication & Roles

- Secure login/signup using Supabase Auth
- Role-based access (Admin / Member)
- Protected routes and controlled UI rendering

📊 Dashboard & Metrics

- Total tasks overview
- Completed vs pending tasks
- Overdue task tracking
- Real-time updates

---

🛠 Tech Stack

Frontend

- React (with Vite)
- TypeScript
- Tailwind CSS

Backend & Services

- Supabase (PostgreSQL + Auth + RLS)
- RESTful interactions via Supabase SDK

Deployment

- Railway (for hosting backend/frontend)

---

⚙️ Supabase Setup Instructions

To set up the backend locally:

1. Go to your Supabase project dashboard
   Project ID: "dgqxoguogzakauhxlgci"

2. Navigate to SQL Editor

3. Open the file:
   
   supabase-setup.sql

4. Copy and paste the SQL into the editor

5. Click Run

✅ This will automatically create:

- Database tables
- Row Level Security (RLS) policies
- Required triggers

---

📁 Project Structure

taskschedule/
│── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Application pages (Dashboard, Projects, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API / Supabase logic
│   └── utils/           # Helper functions
│
│── public/              # Static assets
│── supabase-setup.sql   # Database schema & policies
│── package.json

---

🧪 How to Run Locally

# Clone the repo
git clone https://github.com/kaifali532/taskschedule.git

# Navigate into project
cd taskschedule

# Install dependencies
npm install

# Start development server
npm run dev

Make sure you configure your ".env" file with Supabase credentials.

---

🌐 Deployment

The application is deployed using Railway:

- Frontend + Backend hosted together
- Automatic builds on push
- Environment variables managed via Railway dashboard

---

📌 Future Improvements

- Task comments & activity logs
- Notifications (email / in-app)
- File attachments in tasks
- Team chat integration
- Advanced analytics dashboard

---

🤝 Contributing

Contributions are welcome! Feel free to:

- Fork the repo
- Create a feature branch
- Submit a pull request

---

📄 License

This project is open-source and available under the MIT License.

---

💡 Author Notes

This project demonstrates:

- Full-stack development with modern tools
- Secure role-based systems using Supabase
- Clean UI design with Tailwind CSS
- Scalable project architecture

---

📷 Reference (Original README Snippet)

Based on your original file:
