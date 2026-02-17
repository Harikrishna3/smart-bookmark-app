'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/types/database.types'
import { RealtimeChannel } from '@supabase/supabase-js'

interface BookmarkListProps {
    initialBookmarks: Bookmark[]
    userId: string
}

export default function BookmarkList({
    initialBookmarks,
    userId,
}: BookmarkListProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Real-time subscription
    useEffect(() => {
        let channel: RealtimeChannel

        const setupRealtimeSubscription = async () => {
            
            // Note: We don't need a server-side filter here because Supabase Realtime 
            // respects RLS. The user will only receive events they have permission to see.
            channel = supabase
                .channel('db-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'bookmarks',
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setBookmarks((current) => {
                                const newBookmark = payload.new as Bookmark
                                if (current.some(b => b.id === newBookmark.id)) return current
                                return [newBookmark, ...current]
                            })
                        } else if (payload.eventType === 'DELETE') {
                            setBookmarks((current) =>
                                current.filter((bookmark) => bookmark.id !== payload.old.id)
                            )
                        } else if (payload.eventType === 'UPDATE') {
                            setBookmarks((current) =>
                                current.map((b) => b.id === payload.new.id ? (payload.new as Bookmark) : b)
                            )
                        }
                    }
                )           
        }

        setupRealtimeSubscription()

        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            // Validate URL
            new URL(url)

            const { data, error } = await supabase
                .from('bookmarks')
                .insert({
                    title: title.trim(),
                    url: url.trim(),
                    user_id: userId,
                })
                .select()
                .single()

            if (error) throw error

            // Optimistic / Immediate update for better UX
            if (data) {
                const newBookmark = data as Bookmark
                setBookmarks((current) => {
                    if (current.some(b => b.id === newBookmark.id)) return current
                    return [newBookmark, ...current]
                })
            }

            // Clear form
            setTitle('')
            setUrl('')
        } catch (err) {
            if (err instanceof TypeError) {
                setError('Please enter a valid URL')
            } else {
                setError('Failed to add bookmark. Please try again.')
            }
            console.error('Error adding bookmark:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bookmark?')) {
            return
        }

        const { error } = await supabase.from('bookmarks').delete().eq('id', id)

        if (error) {
            console.error('Error deleting bookmark:', error)
            alert('Failed to delete bookmark. Please try again.')
        } else {
            // Immediate update for better UX
            setBookmarks((current) => current.filter((b) => b.id !== id))
        }
    }

    return (
        <div className="space-y-8">
            {/* Real-time Status Banner */}
            <div className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between ${error ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${bookmarks.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span>Real-time Status: Monitoring table &quot;bookmarks&quot;</span>
                </div>
                <div className="text-[10px] opacity-70">
                    User: {userId.slice(0, 8)}...
                </div>
            </div>

            {/* Add Bookmark Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Add New Bookmark
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My Favorite Website"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="url"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            URL
                        </label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Adding...
                            </span>
                        ) : (
                            'Add Bookmark'
                        )}
                    </button>
                </form>
            </div>

            {/* Bookmarks List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Your Bookmarks
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({bookmarks.length})
                        </span>
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Live</span>
                    </div>
                </div>

                {bookmarks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <svg
                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No bookmarks yet
                        </h3>
                        <p className="text-gray-600">
                            Add your first bookmark using the form above
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {bookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden group"
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                                            {bookmark.title}
                                        </h3>
                                        <button
                                            onClick={() => handleDelete(bookmark.id)}
                                            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete bookmark"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <a
                                        href={bookmark.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 text-sm break-all line-clamp-1 group-hover:underline"
                                    >
                                        {bookmark.url}
                                    </a>

                                    <p className="text-xs text-gray-500 mt-3">
                                        {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div className="px-5 pb-4">
                                    <a
                                        href={bookmark.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                                    >
                                        Visit Site →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
