'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            console.error('Error signing in:', error.message)
            setError(error.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <div className="max-w-md w-full space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-border rounded-2xl shadow-sm mb-4 animate-float">
                        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-light tracking-tight text-foreground">
                        Smart <span className="font-semibold text-accent">Bookmarks</span>
                    </h1>
                    <p className="text-foreground/60 font-medium">
                        Your digital library, beautifully organized.
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-card border border-border rounded-premium p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-smooth hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className="space-y-8">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
                            <p className="text-sm text-foreground/50">Sign in with your Google account to continue.</p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                                <p className="font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Authentication failed
                                </p>
                                <p className="opacity-80 mt-1">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-foreground text-background font-medium rounded-xl hover:bg-accent transition-smooth active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center">
                    <p className="text-sm text-foreground/40 font-medium">
                        By continuing, you agree to our terms and privacy.
                    </p>
                </div>
            </div>
        </div>
    )
}
