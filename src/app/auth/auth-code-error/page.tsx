'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const description = searchParams.get('description')

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <div className="max-w-md w-full space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-border rounded-2xl shadow-sm mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-light tracking-tight text-foreground">
                        Authentication <span className="font-semibold text-red-500">Error</span>
                    </h1>
                    <p className="text-foreground/60 font-medium">
                        Something went wrong while signing you in.
                    </p>
                </div>

                {/* Error Card */}
                <div className="bg-card border border-border rounded-premium p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-[10px] font-bold text-red-500 tracking-[0.2em] uppercase opacity-60">Status Code</h2>
                            <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                                <p className="text-sm font-semibold text-red-800 uppercase tracking-wide">
                                    {error?.replace(/_/g, ' ') || 'Process Failed'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-[10px] font-bold text-foreground/40 tracking-[0.2em] uppercase">Details</h2>
                            <p className="text-sm text-foreground/60 leading-relaxed italic">
                                &quot;{description || 'Failed to complete the authentication process. Please try again.'}&quot;
                            </p>
                        </div>

                        <div className="pt-4 space-y-4">
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center px-6 py-4 bg-foreground text-background font-bold rounded-xl hover:bg-accent transition-smooth shadow-lg shadow-foreground/10 active:scale-[0.98]"
                            >
                                Try Again
                            </Link>
                            <Link
                                href="/"
                                className="w-full flex items-center justify-center px-6 py-4 text-foreground/40 hover:text-foreground text-sm font-bold uppercase tracking-widest transition-smooth"
                            >
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ErrorContent />
        </Suspense>
    )
}
