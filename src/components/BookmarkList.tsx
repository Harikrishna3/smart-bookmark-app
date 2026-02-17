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

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editUrl, setEditUrl] = useState('')

    // Search & Sort state
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'domain'>('date-desc')

    const supabase = createClient()

    // Real-time subscription
    useEffect(() => {
        let channel: RealtimeChannel

        const setupRealtimeSubscription = async () => {
            console.log('Setting up real-time subscription for user:', userId)

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
                        console.log('Real-time event received:', payload.eventType, payload)

                        if (payload.eventType === 'INSERT') {
                            const newBookmark = payload.new as Bookmark
                            setBookmarks((current) => {
                                // 1. Check for exact ID match (real ID already in list)
                                if (current.some(b => b.id === newBookmark.id)) {
                                    console.log('Duplicate bookmark ignored:', newBookmark.id)
                                    return current
                                }

                                // 2. Check for optimistic match (temp ID with same content)
                                const optimisticIndex = current.findIndex(b =>
                                    b.id.startsWith('temp-') &&
                                    b.url === newBookmark.url &&
                                    b.title === newBookmark.title
                                )

                                if (optimisticIndex !== -1) {
                                    console.log('Optimistic match found, replacing temp ID with real ID')
                                    const updated = [...current]
                                    updated[optimisticIndex] = newBookmark
                                    return updated
                                }

                                console.log('Adding new bookmark to list:', newBookmark.title)
                                return [newBookmark, ...current]
                            })
                        } else if (payload.eventType === 'DELETE') {
                            const deletedId = payload.old.id
                            console.log('Removing bookmark from list:', deletedId)
                            setBookmarks((current) =>
                                current.filter((bookmark) => bookmark.id !== deletedId)
                            )
                        } else if (payload.eventType === 'UPDATE') {
                            const updatedBookmark = payload.new as Bookmark
                            console.log('Updating bookmark in list:', updatedBookmark.title)
                            setBookmarks((current) =>
                                current.map((b) => b.id === updatedBookmark.id ? updatedBookmark : b)
                            )
                        }
                    }
                ).subscribe((status) => {
                    console.log('Subscription status:', status)
                })
        }

        setupRealtimeSubscription()

        return () => {
            if (channel) {
                console.log('Cleaning up real-time subscription')
                supabase.removeChannel(channel)
            }
        }
    }, [supabase, userId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        // Auto-prepend https:// if no protocol is specified
        let processedUrl = url.trim()
        if (!processedUrl.match(/^https?:\/\//i)) {
            processedUrl = `https://${processedUrl}`
        }

        // Check for duplicate URL
        const isDuplicate = bookmarks.some(b => b.url === processedUrl)
        if (isDuplicate) {
            setError('This URL is already in your library!')
            setIsSubmitting(false)
            return
        }

        const tempId = `temp-${Date.now()}`
        const optimisticBookmark: Bookmark = {
            id: tempId,
            title: title.trim(),
            url: processedUrl,
            user_id: userId,
            created_at: new Date().toISOString()
        }

        // 1. True Optimistic Update - Add to UI immediately
        setBookmarks(current => [optimisticBookmark, ...current])
        const savedTitle = title
        const savedUrl = processedUrl
        setTitle('')
        setUrl('')

        try {
            new URL(savedUrl)
            console.log('Inserting bookmark for user:', userId)

            const { data, error: insertError } = await supabase
                .from('bookmarks')
                .insert({
                    title: savedTitle.trim(),
                    url: savedUrl.trim(),
                    user_id: userId,
                })
                .select()

            if (insertError) throw insertError

            if (data && data.length > 0) {
                const realBookmark = data[0] as Bookmark
                // Replace temp bookmark with the real one from DB
                setBookmarks(current =>
                    current.map(b => b.id === tempId ? realBookmark : b)
                )
                console.log('Insert successful, replaced temp bookmark.')
            } else {
                console.warn('Insert successful but no data returned (RLS check). Keeping temp bookmark.')
            }
        } catch (err) {
            console.error('Error adding bookmark, rolling back:', err)
            // Rollback optimistic update
            setBookmarks(current => current.filter(b => b.id !== tempId))
            setTitle(savedTitle)
            setUrl(savedUrl)
            setError(err instanceof TypeError ? 'Please enter a valid URL' : 'Failed to save bookmark. Check your connection.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (bookmark: Bookmark) => {
        if (bookmark.id.startsWith('temp-')) return
        setEditingId(bookmark.id)
        setEditTitle(bookmark.title)
        setEditUrl(bookmark.url)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditTitle('')
        setEditUrl('')
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingId) return
        setError(null)

        const originalBookmark = bookmarks.find(b => b.id === editingId)
        if (!originalBookmark) return

        // Auto-prepend https:// if no protocol is specified
        let processedUrl = editUrl.trim()
        if (!processedUrl.match(/^https?:\/\//i)) {
            processedUrl = `https://${processedUrl}`
        }

        const updatedBookmark: Bookmark = {
            ...originalBookmark,
            title: editTitle.trim(),
            url: processedUrl
        }

        // 1. True Optimistic Update
        setBookmarks(current =>
            current.map(b => b.id === editingId ? updatedBookmark : b)
        )
        const savedId = editingId
        setEditingId(null)

        try {
            new URL(updatedBookmark.url)
            console.log('Updating bookmark:', savedId)

            const { data, error: updateError } = await supabase
                .from('bookmarks')
                .update({
                    title: updatedBookmark.title,
                    url: updatedBookmark.url,
                })
                .eq('id', savedId)
                .select()

            if (updateError) throw updateError

            if (data && data.length > 0) {
                const realUpdated = data[0] as Bookmark
                setBookmarks(current =>
                    current.map(b => b.id === savedId ? realUpdated : b)
                )
                console.log('Update successful.')
            } else {
                // This happens if the row was not found (e.g. ID mismatch) or RLS blocked it
                console.warn('Update successful but 0 rows returned. Rollback might be needed if not reflected in DB.')
                setBookmarks(current =>
                    current.map(b => b.id === savedId ? originalBookmark : b)
                )
                alert('Database update failed (0 rows affected). Your changes were rolled back. Please ensure you are not editing a syncing item.')
            }
        } catch (err) {
            console.error('Error updating bookmark, rolling back:', err)
            // Rollback optimistic update
            setBookmarks(current =>
                current.map(b => b.id === savedId ? originalBookmark : b)
            )
            alert('Failed to update bookmark. Changes rolled back.')
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
            setBookmarks((current) => current.filter((b) => b.id !== id))
        }
    }

    // Filter and Sort bookmarks
    const filteredAndSortedBookmarks = bookmarks
        .filter(bookmark => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase()
            const matchesTitle = bookmark.title.toLowerCase().includes(query)
            const matchesUrl = bookmark.url.toLowerCase().includes(query)
            const matchesDomain = new URL(bookmark.url).hostname.toLowerCase().includes(query)
            return matchesTitle || matchesUrl || matchesDomain
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                case 'date-asc':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                case 'title-asc':
                    return a.title.localeCompare(b.title)
                case 'title-desc':
                    return b.title.localeCompare(a.title)
                case 'domain':
                    return new URL(a.url).hostname.localeCompare(new URL(b.url).hostname)
                default:
                    return 0
            }
        })

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Add Bookmark Section - Compact & Efficient */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-premium p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            Add <span className="text-slate-600 dark:text-slate-400">Bookmark</span>
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Quickly save a new reference to your library.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                        <div className="space-y-1">
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Title (e.g. Design Inspiration)"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition-smooth text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-1">
                            <input
                                type="text"
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="URL (e.g., youtube.com or https://...)"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition-smooth text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-slate-700 dark:hover:bg-blue-700 transition-smooth active:scale-[0.98] disabled:opacity-50 text-sm shadow-sm"
                        >
                            {isSubmitting ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Save</span>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
                {error && (
                    <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-lg text-red-700 text-[11px] font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                    </div>
                )}
            </div>

            {/* Bookmarks List Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between border-b border-gray-200 dark:border-slate-700 pb-4">
                    <div className="space-y-0.5">
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            Library
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>{filteredAndSortedBookmarks.length} {searchQuery ? 'Results' : 'Curated Items'}</span>
                            {(() => {
                                if (bookmarks.length === 0) return null
                                const latest = new Date(Math.max(...bookmarks.map(b => new Date(b.created_at).getTime())))
                                const now = new Date()
                                const diff = now.getTime() - latest.getTime()
                                const hours = diff / (1000 * 60 * 60)

                                if (hours < 24) {
                                    return (
                                        <>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-slate-500">{hours < 1 ? 'Just Updated' : 'Updated Today'}</span>
                                        </>
                                    )
                                }
                                return null
                            })()}
                        </div>
                    </div>

                    {/* Search and Sort Controls */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:min-w-[240px]">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search bookmarks..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition-smooth text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                                >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition-smooth text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="title-asc">Title (A-Z)</option>
                            <option value="title-desc">Title (Z-A)</option>
                            <option value="domain">By Domain</option>
                        </select>
                    </div>
                </div>

                {filteredAndSortedBookmarks.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-600 rounded-premium p-16 text-center space-y-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-600">
                            {searchQuery ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-slate-200">
                            {searchQuery ? 'No results found' : 'No items found'}
                        </h3>
                        <p className="text-gray-600 dark:text-slate-400 max-w-xs mx-auto text-xs leading-relaxed">
                            {searchQuery
                                ? `No bookmarks match "${searchQuery}". Try a different search term.`
                                : 'Your library is waiting. Add your first digital discovery above.'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 px-4 py-2 bg-slate-800 dark:bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 dark:hover:bg-blue-700 transition-smooth"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredAndSortedBookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className={`group bg-white dark:bg-slate-800 border transition-smooth relative flex flex-col h-full ${editingId === bookmark.id ? 'border-slate-400 dark:border-slate-500 ring-1 ring-slate-400 dark:ring-slate-500 rounded-lg p-4' : 'border-gray-200 dark:border-slate-700 rounded-premium p-5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                {editingId === bookmark.id ? (
                                    <form onSubmit={handleUpdate} className="flex-1 flex flex-col gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 text-gray-900 dark:text-white"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL</label>
                                            <input
                                                type="url"
                                                value={editUrl}
                                                onChange={(e) => setEditUrl(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="mt-auto pt-4 flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-smooth disabled:opacity-50"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="px-3 py-2 border border-gray-300 dark:border-slate-600 text-xs font-bold rounded hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-smooth"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {/* Favicon */}
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=16`}
                                                        alt=""
                                                        className="w-4 h-4 rounded-sm"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                        }}
                                                    />
                                                    <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase truncate max-w-[120px]">
                                                        {new URL(bookmark.url).hostname}
                                                    </div>
                                                    {bookmark.id.startsWith('temp-') && (
                                                        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 animate-pulse">
                                                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                            <span>Syncing</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                                                    <button
                                                        onClick={() => handleEdit(bookmark)}
                                                        disabled={bookmark.id.startsWith('temp-')}
                                                        className="p-1.5 text-foreground/10 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-smooth disabled:opacity-30 disabled:hover:bg-transparent"
                                                        title={bookmark.id.startsWith('temp-') ? "Wait for sync" : "Edit"}
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bookmark.id)}
                                                        className="p-1.5 text-foreground/10 hover:text-red-500 hover:bg-red-50 rounded-md transition-smooth"
                                                        title="Remove"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-slate-600 transition-smooth">
                                                {bookmark.title}
                                            </h3>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric',
                                                })}
                                            </div>
                                            <a
                                                href={bookmark.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold text-slate-800 hover:text-slate-950 uppercase tracking-widest flex items-center gap-1 group/link"
                                            >
                                                Open
                                                <svg className="w-3 h-3 transition-smooth group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
