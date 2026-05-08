# NUVELCO Scheduled Monitoring Management System

A full-featured monitoring and task scheduling system for **Nueva Vizcaya Electric Cooperative (NUVELCO)**.

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS v4
- **Backend & Database**: Supabase (Auth, Database, Realtime)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React

## Features

### Admin
- Dashboard with task statistics and charts
- Create, edit, delete tasks
- Assign tasks to linemen
- View all tasks in table or calendar view
- Filter tasks by barangay, date, status
- Manage users (create/update/delete)

### Lineman
- View assigned tasks only
- Update task status (Pending -> In Progress -> Completed)
- Add remarks/reports to tasks
- Real-time status updates

### General
- Role-based authentication (Admin / Lineman)
- Real-time updates via Supabase Realtime
- Responsive design (desktop + mobile)
- Modern dashboard UI with sidebar navigation

---

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to the **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `supabase/schema.sql` and run it
4. This will create:
   - `users` table (id, name, role)
   - `tasks` table (id, title, description, barangay, schedule_date, priority, status, created_by)
   - `task_assignments` table (id, task_id, user_id)
   - `remarks` table (id, task_id, user_id, message, created_at)
   - RLS policies, triggers, and realtime subscriptions

### 2. Get API Credentials

1. In Supabase dashboard, go to **Project Settings > API**
2. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Creating Your First Admin User

Since the signup form requires an existing admin to create new admins, you have two options:

**Option A: Manual creation via Supabase Dashboard**
1. Go to **Authentication > Users** in Supabase
2. Click "Add User" and create an account with your admin email
3. Go to **Table Editor > users** table
4. Find the user and set their `role` to `admin`

**Option B: Use signup form**
1. Sign up with any email/password and select "Admin" role
2. The trigger will automatically create the profile with the correct role

---

## Project Structure

```
nuvelco-monitoring/
├── supabase/
│   └── schema.sql              # Database schema & setup
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.jsx       # Reusable UI components (Button, Input, Modal, etc.)
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   │   └── DashboardLayout.jsx
│   │   ├── TaskForm.jsx        # Task create/edit form
│   │   └── ProtectedRoute.jsx  # Auth route guard
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── lib/
│   │   └── supabase.js         # Supabase client
│   ├── services/
│   │   └── supabase.js         # Database service functions
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login/Signup page
│   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   ├── LinemanDashboard.jsx # Lineman dashboard
│   │   ├── SchedulePage.jsx    # Task scheduling (table + calendar)
│   │   ├── TasksPage.jsx       # Detailed task view
│   │   └── UsersPage.jsx       # User management (admin only)
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles + Tailwind
├── .env.example                # Environment variables template
├── vite.config.js
└── package.json
```

---

## Database Schema

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (references auth.users) |
| name | TEXT | Full name |
| role | TEXT | 'admin' or 'lineman' |
| created_at | TIMESTAMPTZ | Timestamp |

### `tasks`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Task title |
| description | TEXT | Task description |
| barangay | TEXT | Location |
| schedule_date | TIMESTAMPTZ | Scheduled date & time |
| priority | TEXT | Low, Medium, High |
| status | TEXT | Pending, In Progress, Completed |
| created_by | UUID | FK to users |
| created_at | TIMESTAMPTZ | Timestamp |
| updated_at | TIMESTAMPTZ | Auto-updated |

### `task_assignments`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| task_id | UUID | FK to tasks |
| user_id | UUID | FK to users |

### `remarks`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| task_id | UUID | FK to tasks |
| user_id | UUID | FK to users |
| message | TEXT | Remark/report text |
| created_at | TIMESTAMPTZ | Timestamp |

---

## Barangays Covered

Bayombong, Solano, Diadi, Aritao, Bagabag, Bambang, Dupax del Norte, Dupax del Sur, Kasibu, Kayapa, Alfonso Castaneda, Ambaguio, Santa Fe, Imugan, Poblacion, Other

---

## License

NUVELCO - Nueva Vizcaya Electric Cooperative
