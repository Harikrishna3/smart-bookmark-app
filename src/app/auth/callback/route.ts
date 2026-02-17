import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
        return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || 'Authentication failed')}`
        )
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
        
        // Handle session exchange error
        return NextResponse.redirect(
            `${origin}/auth/auth-code-error?error=exchange_error&description=${encodeURIComponent(error.message)}`
        )
    }

    // Return the user to an error page if no code or error param (unexpected state)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_code&description=No+authentication+code+received`)
}
