# Smart Bookmark App 🔖

A modern, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Save, organize, and access your favorite links across all devices with instant synchronization.

## 🌟 Features

- **Google OAuth Authentication**: Secure sign-in with Google (no password required)
- **Real-time Sync**: Bookmarks update instantly across all tabs and devices using Supabase Realtime
- **Private & Secure**: Row Level Security (RLS) ensures your bookmarks are completely private
- **Responsive Design**: Beautiful UI that works seamlessly on desktop and mobile
- **Fast & Reliable**: Built on Next.js App Router with server-side rendering

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime)
- **Deployment**: Vercel

## 🚀 Live Demo

**Live URL**: [Will be added after deployment]

**GitHub Repository**: [Will be added after deployment]

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Google Cloud Project for OAuth credentials

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-bookmark
npm install
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: smart-bookmark (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
4. Wait for the project to finish setting up (~2 minutes)

### 3. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Paste the following SQL and click **"Run"**:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### 4. Configure Google OAuth

#### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Smart Bookmark
   - User support email: Your email
   - Developer contact: Your email
6. For Application type, select **"Web application"**
7. Add **Authorized redirect URIs**:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - (Get your project ref from Supabase dashboard URL)
8. Click **"Create"** and copy your:
   - **Client ID**
   - **Client Secret**

#### Enable Google Provider in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable the Google provider
4. Paste your **Client ID** and **Client Secret**
5. Click **"Save"**

### 5. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Add Redirect URL for Local Development

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add `http://localhost:3000/auth/callback` to **Redirect URLs**
3. Click **"Save"**

Now you can test Google OAuth login locally!

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click **"Deploy"**

### 3. Update OAuth Redirect URLs

After deployment, get your Vercel URL (e.g., `https://your-app.vercel.app`)

**In Google Cloud Console**:
1. Go to your OAuth client credentials
2. Add to **Authorized redirect URIs**:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`

**In Supabase**:
1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
3. Add to **Site URL**:
   - `https://your-app.vercel.app`

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign in with Google from `/login`
- [ ] Add a new bookmark (title + URL)
- [ ] Verify bookmark appears in the list
- [ ] Open dashboard in two tabs, add bookmark in one tab
- [ ] Verify bookmark appears in the other tab without refresh
- [ ] Delete a bookmark
- [ ] Verify deletion syncs across tabs
- [ ] Sign out and sign in with a different Google account
- [ ] Verify new user doesn't see previous user's bookmarks

## 📝 Problems Encountered & Solutions

### Problem 1: Supabase SSR Cookie Management

**Issue**: Initial implementation used the standard `createClient` which doesn't properly handle cookies in Next.js App Router, causing auth session to not persist.

**Solution**: Implemented separate Supabase clients for browser and server using `@supabase/ssr`:
- Created `client.ts` with `createBrowserClient` for client components
- Created `server.ts` with `createServerClient` integrated with Next.js cookies API
- Created `middleware.ts` helper for auth session refresh in middleware
- This ensures proper cookie handling and session persistence across server/client boundaries

### Problem 2: Real-time Updates Not Filtering by User

**Issue**: When setting up Realtime subscriptions, all users would receive updates for all bookmarks in the database, not just their own.

**Solution**: Applied user-specific filtering in the Realtime subscription:
```typescript
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'bookmarks',
  filter: `user_id=eq.${userId}`,
}, ...)
```
This, combined with RLS policies on the database, ensures users only receive real-time updates for their own bookmarks.

### Problem 3: OAuth Redirect Loop in Production

**Issue**: After deploying to Vercel, Google OAuth would redirect back but fail to complete authentication, creating a redirect loop.

**Solution**: 
- Added proper environment detection in the OAuth callback handler
- Configured both local and production redirect URLs in Supabase and Google Cloud Console
- Used `x-forwarded-host` header for proper redirect URL construction in production
- Ensured all redirect URLs match exactly (with/without trailing slashes)

### Problem 4: Middleware Matching Too Many Routes

**Issue**: Initial middleware configuration was running on every request including static assets, causing unnecessary overhead and potential auth checks on public files.

**Solution**: Added specific matcher config to exclude static files:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Problem 5: Bookmark URL Validation

**Issue**: Users could submit invalid URLs, causing errors when trying to visit bookmarks later.

**Solution**: Implemented client-side URL validation using JavaScript's native `URL` constructor:
```typescript
try {
  new URL(url)  // Throws TypeError if invalid
  // Proceed with submission
} catch (err) {
  setError('Please enter a valid URL')
}
```
Added HTML5 `type="url"` attribute for additional browser-level validation.

## 📁 Project Structure

```
smart-bookmark/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth callback handler
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard (protected)
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   └── BookmarkList.tsx          # Bookmark list with real-time updates
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       ├── server.ts             # Server Supabase client
│   │       └── middleware.ts         # Middleware helper
│   └── types/
│       └── database.types.ts         # TypeScript types
├── middleware.ts                     # Next.js middleware
├── .env.local                        # Environment variables (git-ignored)
├── .env.example                      # Example env file
└── package.json
```

## 🔐 Security Features

- **Row Level Security**: Database policies ensure users can only access their own data
- **Google OAuth**: No password storage, leveraging Google's secure authentication
- **Environment Variables**: Sensitive credentials stored securely
- **HTTPS Only**: All production traffic encrypted
- **CSRF Protection**: Built-in with Supabase Auth

## 🎨 UI/UX Highlights

- Modern gradient backgrounds with glassmorphism effects
- Responsive grid layout for bookmarks
- Smooth animations and transitions
- Loading states and error handling
- Real-time "Live" indicator
- Confirmation dialogs for destructive actions
- Optimistic UI updates for better perceived performance

## 📄 License

MIT

## 👥 Contributors

[Your Name]

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**
