# 🔖 Smart Bookmark App

A minimalist, modern bookmark manager with real-time sync, intelligent tagging, and beautiful dark mode. Built with Next.js 15, Supabase, and Tailwind CSS.

![Smart Bookmark App](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🔐 Authentication
- **Google OAuth** - Secure sign-in with your Google account
- **Session Management** - Persistent login with automatic token refresh

### 📚 Bookmark Management
- **Quick Add** - Simple 2-field form (Title + URL)
- **Rich Editing** - Full edit mode with title, URL, description, and tags
- **Smart URL Handling** - Automatically adds `https://` if missing
- **Automatic Favicons** - Beautiful visual icons fetched for each bookmark
- **Optimistic Updates** - Instant UI feedback with automatic rollback on errors

### 🏷️ Organization
- **Tag System** - Add colorful tags to categorize bookmarks
- **Smart Filtering** - Click any tag to filter your library
- **Real-time Search** - Search across titles, URLs, descriptions, and tags
- **Multiple Sort Options** - Sort by date, title (A-Z, Z-A), or domain

### 🎨 User Experience
- **Dark Mode** - Beautiful dark theme with perfect contrast
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Sync** - Changes appear instantly across all your devices
- **Smooth Animations** - Polished transitions and hover effects
- **Minimalist UI** - Clean, focused interface without clutter

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Real-time:** Supabase Realtime
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- A Google Cloud project for OAuth ([setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the setup script:

```sql
-- Copy contents from supabase-setup.sql and run it
```

3. Enable **Google OAuth** in Authentication → Providers
4. Configure redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/*`

### 4. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from: **Supabase Dashboard → Settings → API**

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Post-Deployment

Update Supabase redirect URLs:
- `https://your-app.vercel.app/auth/callback`
- `https://your-app.vercel.app/*`

## 📖 Usage

### Adding a Bookmark

1. Enter a **Title** and **URL** in the top form
2. Click **Save** - bookmark appears instantly!

### Organizing with Tags

1. **Edit** any bookmark (click the pencil icon)
2. Scroll to **"Add tags"** input
3. Type a tag name and press **Enter**
4. Tags appear as colorful pills
5. Click **Save**

### Filtering and Search

- **Filter by Tag:** Click any tag in the filter bar
- **Search:** Type in the search box to filter bookmarks
- **Sort:** Use the dropdown to change sort order

### Dark Mode

Click the sun/moon icon in the header to toggle themes.

## �️ Project Structure

```
smart-bookmark/
├── src/
│   ├── app/
│   │   ├── auth/callback/      # OAuth callback handler
│   │   ├── dashboard/          # Main app page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── BookmarkList.tsx    # Main bookmark manager
│   │   ├── SignInButton.tsx    # Auth button
│   │   └── ThemeToggle.tsx     # Dark mode toggle
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   └── types/
│       └── database.types.ts   # TypeScript types
├── public/                     # Static assets
├── supabase-setup.sql          # Database schema
├── .env.local                  # Environment variables
└── package.json                # Dependencies
```

## �️ Database Schema

```sql
bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ
)
```

**Row Level Security (RLS)** ensures users can only access their own bookmarks.

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Server-side session validation
- ✅ Secure OAuth flow
- ✅ HTTPS-only in production
- ✅ Environment variables for secrets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Amazing React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Google Fonts](https://fonts.google.com/) - Inter typeface

## � Contact

Have questions? Feel free to reach out!

---

**Built with ❤️ using Next.js and Supabase**
