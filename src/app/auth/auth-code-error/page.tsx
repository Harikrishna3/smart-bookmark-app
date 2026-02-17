'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const description = searchParams.get('description')

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-left">
                        <p className="text-sm font-semibold text-red-800 uppercase tracking-wide">
                            {error?.replace(/_/g, ' ') || 'Error'}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            {description || 'Failed to complete the authentication process. Please try again.'}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="block w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="block w-full px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        Return Home
                    </Link>
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
