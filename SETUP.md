# MediCore Setup Guide

This guide will help you set up MediCore locally for development.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works fine)

## Step 1: Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd medicore
npm install
```

This will install all dependencies defined in `package.json` including:
- Next.js 14
- Supabase client libraries
- shadcn/ui components
- Form libraries (React Hook Form, Zod)
- And more...

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in the project details:
   - **Project name**: MediCore (or any name you prefer)
   - **Database password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to you
4. Click "Create new project" and wait for it to initialize (2-3 minutes)

## Step 3: Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public** key (under "Project API keys")

Copy these values - you'll need them in the next step.

## Step 4: Configure Environment Variables

1. Open the `.env.local` file in the project root
2. Replace the placeholder values with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MediCore
```

**Important**: Make sure to use your actual Supabase URL and anon key!

## Step 5: Run Database Migrations

You need to run the SQL migrations to create the database tables. Go to your Supabase dashboard:

1. Click on **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/001_create_doctors.sql`
   - `supabase/migrations/002_create_patients.sql`
   - `supabase/migrations/003_create_forms.sql`
   - `supabase/migrations/004_create_form_fields.sql`
   - `supabase/migrations/005_create_submissions.sql`
   - `supabase/migrations/006_create_subscriptions.sql`
   - `supabase/migrations/007_create_storage_buckets.sql`

4. Run each migration by clicking "Run" (or press Ctrl/Cmd + Enter)
5. Verify there are no errors in the output

**Alternative**: You can also concatenate all migrations into a single file and run them all at once.

## Step 6: Verify Database Setup

After running migrations, verify the tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `doctors`
   - `patients`
   - `forms`
   - `form_fields`
   - `form_submissions`
   - `subscriptions`

3. Go to **Storage** in Supabase dashboard
4. You should see these buckets:
   - `form-attachments` (private)
   - `avatars` (public)

## Step 7: Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

You should see output like:

```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

## Step 8: Test the Application

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. You should see the MediCore landing page
3. Click "Get Started" or "Sign Up"
4. Create a new account:
   - **Full Name**: Dr. Test User
   - **Email**: test@example.com
   - **Clinic Name**: Test Clinic
   - **Password**: test123 (minimum 6 characters)
5. Click "Create account"
6. You should be redirected to the dashboard

## Step 9: Verify Authentication Flow

1. After signup, you should see the dashboard with:
   - Welcome message with your name
   - Stats cards (will show 0s initially)
   - Getting started guide
2. Log out (you'll need to implement logout button)
3. Try logging in again with the same credentials

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct Supabase URL and anon key
- Make sure there are no extra spaces or quotes around the values
- Restart the dev server after changing `.env.local`

### "relation does not exist" error
- You likely missed running one or more migrations
- Go back to Step 5 and ensure all migrations ran successfully
- Check for errors in the Supabase SQL Editor output

### "User not found" after signup
- The `handle_new_user()` trigger should automatically create a doctor profile
- Check if the trigger was created by running the first migration
- Go to Supabase Table Editor > doctors table and verify a row was created

### Development server won't start
- Make sure you're in the `medicore` directory
- Delete `node_modules` and `.next` folders, then run `npm install` again
- Check for port conflicts (if 3000 is in use, Next.js will use 3001)

## Next Steps

After completing the setup:

- **Phase 2**: Add professional sidebar navigation and dashboard layout
- **Phase 3**: Implement patient management (CRUD operations)
- **Phase 4**: Build the form builder
- **Phase 5**: Create public form submission pages
- And more...

## Useful Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify your Supabase dashboard for database errors
3. Review the migration files for any syntax errors
4. Check that all dependencies were installed correctly

---

**Congratulations!** You've successfully set up MediCore locally. Happy coding! 🎉
