# Team Learning Academy — LMS

A full-featured Learning Management System built with Next.js 14 App Router, Supabase, Tailwind CSS, and shadcn/ui.

---

## Features

- **Role-based access**: Admin, Manager, Instructor, Learner
- **Course authoring**: Modules + Lessons (video, text, quiz, file)
- **Progress tracking**: Per-lesson completion, course progress percentage
- **PDF Certificates**: Auto-issued on 100% course completion, downloadable
- **Learning Paths**: Admins create paths targeted at specific roles
- **Team Progress**: Managers see their team's enrollment and completion stats

---

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Project Settings → API** and copy your URL and keys

### 2. Run the Database Migration

In your Supabase dashboard, go to **SQL Editor** and run the contents of:

```
supabase/migrations/001_schema.sql
```

This creates all tables and RLS policies.

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_LMS_NAME=Team Learning Academy
NEXT_PUBLIC_ISSUER_NAME=Training Department
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

---

## Role Walkthrough

### Admin
- View dashboard stats (users, courses, paths, certificates)
- Manage all users and their roles
- Create and manage learning paths (assign target roles)
- Browse all courses

### Manager
- View all team members (users where `manager_id = manager.id`)
- See each team member's enrollment status and progress per course
- Drill into individual team member detail pages

### Instructor
- Create courses (title, description, thumbnail)
- Build course content: Modules → Lessons
- Lesson types: **Video** (URL/YouTube embed), **Text** (HTML), **Quiz** (multiple choice), **File** (download link)
- Publish/unpublish courses

### Learner
- Browse available published courses
- Enroll in courses
- Take lessons:
  - Video: watch embedded or direct video
  - Text: read HTML content
  - Quiz: answer questions, need 70%+ to pass
  - File: download file resource
- Track progress per course
- Earn certificates on 100% completion
- Download PDF certificates

---

## Certificate Download URL

```
GET /api/certificates/:certId
```

Returns a PDF with `Content-Disposition: attachment`. The cert ID is a UUID from the `certificates` table.

Example from the UI:
```
/api/certificates/550e8400-e29b-41d4-a716-446655440000
```

---

## Deploying to Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy

Vercel auto-detects Next.js. No additional configuration needed.

> **Note**: `@react-pdf/renderer` requires Node.js runtime for the certificate API route. Ensure you're not using Edge runtime for that route (the default Node.js runtime is used automatically).

---

## Project Structure

```
lms/
├── app/
│   ├── (auth)/login        # Login page
│   ├── (auth)/signup       # Signup page  
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── layout.tsx      # Sidebar with role-based nav
│   │   ├── admin/          # Admin pages
│   │   ├── instructor/     # Course authoring
│   │   ├── learner/        # Course taking + certificates
│   │   └── manager/        # Team progress
│   └── api/certificates/   # PDF generation endpoint
├── actions/                # Next.js Server Actions
├── components/ui/          # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   ├── certificate.tsx     # @react-pdf/renderer PDF template
│   └── progress.ts         # Course progress calculation
├── middleware.ts            # Auth protection + redirects
└── supabase/migrations/    # Database schema + RLS
```
