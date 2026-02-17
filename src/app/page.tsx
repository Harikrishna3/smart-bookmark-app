import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto py-24 sm:py-32">
        {/* Navigation / Header Area */}
        <div className="flex items-center justify-between mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight">Smart Bookmarks</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href={user ? '/dashboard' : '/login'}
              className="text-sm font-bold uppercase tracking-widest text-foreground hover:text-accent transition-smooth border-b border-transparent hover:border-accent"
            >
              {user ? 'Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl space-y-10 mb-32">
          <h1 className="text-6xl sm:text-7xl font-light tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            A sanctuary for your <span className="font-semibold text-accent">digital discoveries.</span>
          </h1>
          <p className="text-xl text-foreground/50 font-medium leading-relaxed max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
            Beautifully organize the internet. Access your curated collection of links with real-time simplicity, across every device you own.
          </p>
          <div className="pt-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-4 px-10 py-5 bg-foreground text-background font-bold rounded-2xl hover:bg-accent transition-smooth hover:shadow-2xl hover:shadow-accent/20 active:scale-95"
            >
              <span>{user ? 'Continue to Library' : 'Start your collection'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Grid - Minimalist approach */}
        <div className="grid md:grid-cols-3 gap-12 border-t border-border pt-16 mt-24 mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-accent opacity-50">01. Synchronization</div>
            <h3 className="text-2xl font-semibold tracking-tight">Live Updating</h3>
            <p className="text-foreground/40 font-medium">Your library breathes with you. Add a link on one device, see it appear instantly on every other tab.</p>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-accent opacity-50">02. Privacy</div>
            <h3 className="text-2xl font-semibold tracking-tight">Private Access</h3>
            <p className="text-foreground/40 font-medium">Encrypted by default. Your bookmarks are strictly yours, visible only when you are signed in.</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-24 flex flex-col sm:flex-row items-center justify-between border-t border-border gap-8">
          <div className="text-xs font-bold uppercase tracking-widest text-foreground/20">
            &copy; {new Date().getFullYear()} Smart Bookmark App
          </div>
          <div className="flex gap-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Next.js & Supabase</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Crafted with Precision</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
