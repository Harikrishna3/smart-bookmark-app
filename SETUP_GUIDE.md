# Quick Setup Guide for Smart Bookmark App 🚀

Follow these steps to get your Smart Bookmark App running locally and deployed.

## Step 1: Supabase Project Setup (5 minutes)

### Create Project
1. Visit [https://supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Enter:
   - Name: `smart-bookmark`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Wait ~2 minutes for setup to complete

### Run Database Setup
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of `supabase-setup.sql` from this project
4. Paste and click **"Run"**
5. You should see: "Success. No rows returned"

### Get API Credentials
1. Go to **Settings** → **API**
2. Copy these two values:
   - `Project URL`
   - `anon` `public` key

## Step 2: Google OAuth Setup (5 minutes)

### Create OAuth Credentials
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure consent screen (if needed):
   - App name: Smart Bookmark
   - Your email for support and developer contact
6. Create OAuth client:
   - Type: Web application
   - Authorized redirect URIs: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
     - Get the project ref from your Supabase dashboard URL
7. Copy your **Client ID** and **Client Secret**

### Enable in Supabase
1. In Supabase dashboard: **Authentication** → **Providers**
2. Find and expand **Google**
3. Toggle **Enable**
4. Paste Client ID and Client Secret
5. Click **"Save"**

## Step 3: Local Development (2 minutes)

### Configure Environment
1. In project root, update `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Add Local Redirect URL
1. In Supabase: **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**: `http://localhost:3000/auth/callback`
3. Save

### Run the App
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and test:
- ✅ Click "Get Started with Google"
- ✅ Sign in with Google
- ✅ Add a bookmark
- ✅ Open in 2 tabs, add bookmark in one, see it appear in other
- ✅ Delete a bookmark

## Step 4: Deploy to Vercel (5 minutes)

### Push to GitHub
```bash
# Create a new repo on GitHub first, then:
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Deploy
1. Go to [https://vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: <your-supabase-url>
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: <your-anon-key>
5. Click **"Deploy"**
6. Wait for deployment to complete (~2 minutes)

### Update OAuth URLs
After deployment, you'll get a Vercel URL (e.g., `https://smart-bookmark-xyz.vercel.app`)

**In Supabase** (**Authentication** → **URL Configuration**):
- Add to **Redirect URLs**: `https://your-vercel-url.vercel.app/auth/callback`
- Set **Site URL**: `https://your-vercel-url.vercel.app`

**In Google Cloud Console** (OAuth client credentials):
- Keep existing: `https://<supabase-ref>.supabase.co/auth/v1/callback`
- The Supabase redirect handles both local and production

### Test Production
Visit your Vercel URL and verify:
- ✅ Google OAuth works
- ✅ Can add/delete bookmarks
- ✅ Real-time sync in multiple tabs

## Troubleshooting

### "Invalid redirect URI" error
- Verify redirect URLs in both Supabase and Google Cloud Console match exactly
- Check for trailing slashes - they must match

### OAuth works locally but not in production
- Double-check environment variables in Vercel dashboard
- Ensure Vercel URL is added to Supabase redirect URLs
- Redeploy after changing environment variables

### Bookmarks not syncing in real-time
- Check browser console for errors
- Verify Realtime is enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;`
- Make sure both tabs are signed in as the same user

### "Failed to add bookmark" error
- Ensure URL starts with `http://` or `https://`
- Check database policies are created correctly
- Verify user is authenticated

## Git Commit Timeline 📝

The project includes a professional Git commit history:

```
* feat: add database setup SQL script
* docs: add comprehensive README with setup guide and problem solutions
* feat: implement bookmark dashboard with real-time updates
* feat: add Supabase configuration and authentication infrastructure
* Initial commit from Create Next App
```

Each commit is:
- **Descriptive**: Clear message about what was changed
- **Focused**: Single logical change per commit
- **Professional**: Follows conventional commit format

## Next Steps

1. **Customize**: Update app name, colors, or add features
2. **Monitor**: Check Supabase dashboard for usage
3. **Share**: Get the live URL and share with others
4. **Submit**: Provide live URL and GitHub repo as required

## Need Help?

- Review the comprehensive [README.md](./README.md)
- Check Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Verify all credentials are correct
- Check browser console for error messages

---

**Total setup time: ~15-20 minutes** ⚡
