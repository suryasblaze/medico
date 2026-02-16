# MediCore - Doctor-Patient Form Management SaaS

A modern, serverless SaaS platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Doctor authentication with Supabase Auth
- 👥 Patient management (CRUD operations)
- 📝 Dynamic form builder with 10+ field types
- 🌐 Public form submission (no login required)
- 📁 Secure file upload with Supabase Storage
- 📊 Analytics dashboard with charts
- 📤 Data export (CSV/Excel)
- 💳 Billing page structure (Stripe-ready)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local` with your credentials
   - Run database migrations from `/supabase/migrations`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
medicore/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard
│   └── forms/             # Public form submission
├── components/            # React components
│   ├── auth/
│   ├── dashboard/
│   ├── patients/
│   ├── forms/
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase clients
│   ├── validations/      # Zod schemas
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
├── types/                 # TypeScript types
└── supabase/
    └── migrations/        # Database migrations
```

## Database Setup

Run the SQL migrations in order from `/supabase/migrations`:

1. `001_create_doctors.sql` - Doctor profiles
2. `002_create_patients.sql` - Patient records
3. `003_create_forms.sql` - Forms table
4. `004_create_form_fields.sql` - Form fields
5. `005_create_submissions.sql` - Submissions
6. `006_create_subscriptions.sql` - Billing
7. `007_enable_rls.sql` - Row Level Security policies
8. `008_create_storage_buckets.sql` - Storage buckets
9. `009_create_indexes.sql` - Performance indexes

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MediCore
```

## Deployment

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/medicore)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy!

## License

MIT

## Author

Built with Claude Code
