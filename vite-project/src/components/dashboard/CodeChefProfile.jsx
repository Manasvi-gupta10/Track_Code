import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { auth } from '../../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function CodeChefProfile() {
    const [handle, setHandle] = useState('')
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/profile/${currentUser.uid}`);
                if (res.ok) {
                    const profile = await res.json();
                    if (profile && profile.codechef) {
                        fetchUserData(profile.codechef);
                    }
                }
            } catch (err) {
                console.error('Error loading saved profile:', err);
            }
        });
        return () => unsubscribe();
    }, []);

    const extractHandle = (input) => {
        if (!input) return ''
        const match = input.match(/(?:codechef\.com\/users\/)([^/?\s]+)/)
        return match ? match[1] : input.trim()
    }

    const fetchUserData = async (inputHandle) => {
        const userHandle = extractHandle(inputHandle)

        if (!userHandle) {
            setError('Please enter a CodeChef username')
            return
        }

        setLoading(true)
        setError('')
        setHandle(userHandle)

        try {
            const response = await fetch(`${API_BASE_URL}/api/codechef/${userHandle}`)

            if (!response.ok) {
                throw new Error('User not found or API error')
            }

            const data = await response.json()
            setUserData(data)
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.message || 'Failed to fetch user data')
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }

    const getStarRating = (stars) => {
        if (!stars) return '0★';
        return stars;
    }

    const getStarColor = (stars) => {
        const count = parseInt(stars) || 0;
        if (count >= 7) return 'text-red-500';
        if (count >= 6) return 'text-orange-500';
        if (count >= 5) return 'text-yellow-500';
        if (count >= 4) return 'text-purple-500';
        if (count >= 3) return 'text-blue-500';
        if (count >= 2) return 'text-green-500';
        return 'text-slate-400';
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Animated Background */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-rose-600/20 blur-3xl animate-pulse-slow" />
                <div className="absolute top-64 right-[-12rem] h-80 w-80 rounded-full bg-slate-400/10 blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-8rem] left-[-10rem] h-80 w-80 rounded-full bg-red-500/10 blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center">
                                    <span className="font-bold text-white text-sm">CC</span>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-sm font-semibold">CodeChef Profile</div>
                                    <div className="text-xs text-slate-400">Track your performance</div>
                                </div>
                            </div>

                            <Link
                                to="/dashboard"
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-4 py-8">
                    {/* Search Section */}
                    <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                        <h2 className="mb-4 text-xl font-semibold text-white text-center">Enter your CodeChef Handle</h2>
                        <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUserData(handle)}
                                    placeholder="Username or profile URL"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-rose-500/30 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </div>
                            </div>
                            <button
                                onClick={() => fetchUserData(handle)}
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-8 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/20"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Connecting...
                                    </span>
                                ) : (
                                    'Fetch Profile'
                                )}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-4 max-w-2xl mx-auto rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-200">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>

                    {userData && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Profile Card */}
                            <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-md">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-8">
                                        <div className="relative">
                                            <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-rose-600 to-red-500 p-1 flex-shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                                <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-slate-900 overflow-hidden">
                                                    <img
                                                        src={userData.profile || `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`}
                                                        alt={handle}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-lg bg-slate-950 border border-white/10 font-bold shadow-xl ${getStarColor(userData.stars)}`}>
                                                {getStarRating(userData.stars)}
                                            </div>
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                                                {userData.name || handle}
                                            </h1>
                                            <p className="text-xl text-slate-400 font-mono mb-4">@{handle}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-slate-300">
                                                    <span className="text-rose-500 font-bold italic">Current Rating</span>
                                                    <span className="text-white font-black text-lg">{userData.currentRating || 'N/A'}</span>
                                                </span>
                                                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-slate-300">
                                                    <span className="text-emerald-500 font-bold italic">Highest</span>
                                                    <span className="text-white font-bold">{userData.highestRating || 'N/A'}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ranking Stats */}
                                    <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                                        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 text-center">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Global Rank</div>
                                            <div className="text-2xl font-bold text-white">#{userData.globalRank || 'N/A'}</div>
                                        </div>
                                        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 text-center">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Country Rank</div>
                                            <div className="text-2xl font-bold text-white">#{userData.countryRank || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Stats Grid */}
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm group hover:border-rose-500/30 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contests Participated</span>
                                        <span className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">🏆</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">
                                        {userData.contestsParticipated || '0'}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400">Total verified contests</p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm group hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Profile URL</span>
                                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">🔗</span>
                                    </div>
                                    <a 
                                        href={`https://www.codechef.com/users/${handle}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-lg font-bold text-blue-400 hover:underline truncate block"
                                    >
                                        codechef.com/{handle}
                                    </a>
                                    <p className="mt-2 text-xs text-slate-400">View official profile</p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm group hover:border-emerald-500/30 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Session Status</span>
                                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">✅</span>
                                    </div>
                                    <div className="text-lg font-bold text-emerald-400">
                                        Synced
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400">Real-time data enabled</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!userData && !loading && (
                        <div className="rounded-3xl border border-white/5 bg-slate-900/30 p-16 text-center backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                            <div className="relative z-10">
                                <div className="mx-auto mb-6 h-24 w-24 rounded-3xl bg-gradient-to-br from-rose-600/10 to-red-500/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-5xl">👨‍🍳</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Chef's Table is Empty</h3>
                                <p className="text-slate-400 max-w-md mx-auto">
                                    Connect your CodeChef account to visualize your ratings, global ranking, and contest progress.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
