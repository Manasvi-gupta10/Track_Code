import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { auth } from '../../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function LeetCodeProfile() {
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
                    if (profile && profile.leetcode) {
                        fetchUserData(profile.leetcode);
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
        // Handle full URL cases like https://leetcode.com/u/username/ or https://leetcode.com/username
        const match = input.match(/(?:leetcode\.com\/(?:u\/)?)([^/?\s]+)/)
        return match ? match[1] : input.trim()
    }

    const fetchUserData = async (inputHandle) => {
        const userHandle = extractHandle(inputHandle)

        if (!userHandle) {
            setError('Please enter a LeetCode username')
            return
        }

        setLoading(true)
        setError('')
        setHandle(userHandle)

        try {
            // Use local backend proxy
            const response = await fetch(`${API_BASE_URL}/api/leetcode/${userHandle}`)

            if (!response.ok) {
                throw new Error('User not found or API error')
            }

            const data = await response.json()

            if (!data.matchedUser) {
                throw new Error('User not found')
            }

            setUserData(data)
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.message || 'Failed to fetch user data')
            setUserData(null)
        } finally {
            setLoading(false)
        }
    }

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A'
        try {
            const date = new Date(parseInt(timestamp) * 1000)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch {
            return 'N/A'
        }
    }

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-emerald-400'
            case 'medium': return 'text-amber-400'
            case 'hard': return 'text-rose-400'
            default: return 'text-slate-400'
        }
    }

    const getStatusColor = (status) => {
        return status === 'Accepted'
            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            : 'text-red-400 bg-red-400/10 border-red-400/20'
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Animated Background */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl animate-pulse-slow" />
                <div className="absolute top-64 right-[-12rem] h-80 w-80 rounded-full bg-slate-400/10 blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-8rem] left-[-10rem] h-80 w-80 rounded-full bg-orange-400/10 blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                                    <span className="font-bold text-slate-950 text-sm">LC</span>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-sm font-semibold">LeetCode Profile</div>
                                    <div className="text-xs text-slate-400">View detailed statistics</div>
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
                        <h2 className="mb-4 text-xl font-semibold text-white">Search LeetCode User</h2>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUserData(handle)}
                                    placeholder="Enter LeetCode username"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-amber-400/30 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </div>
                            </div>
                            <button
                                onClick={() => fetchUserData(handle)}
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-50 transition-all hover:scale-105"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                                        Loading...
                                    </span>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-200">
                                {error}
                            </div>
                        )}
                    </div>

                    {userData && (
                        <>
                            {/* Profile Card */}
                            <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 p-1 flex-shrink-0">
                                            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                                                <img
                                                    src={userData.matchedUser.profile.userAvatar}
                                                    alt={userData.matchedUser.username}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-1">
                                                {userData.matchedUser.profile.realName || userData.matchedUser.username}
                                            </h1>
                                            <p className="text-lg text-slate-300 mb-2">@{userData.matchedUser.username}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                {userData.matchedUser.profile.countryName && (
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <span>📍</span> {userData.matchedUser.profile.countryName}
                                                    </span>
                                                )}
                                                {userData.matchedUser.profile.ranking && (
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <span>🏆</span> Rank: {userData.matchedUser.profile.ranking.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contest Rating */}
                                    {userData.userContestRanking && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px]">
                                            <div className="text-sm text-slate-400 mb-1">Contest Rating</div>
                                            <div className="text-3xl font-bold text-amber-400">
                                                {Math.round(userData.userContestRanking.rating)}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Top {userData.userContestRanking.topPercentage}%
                                                <span className="mx-1">•</span>
                                                Attended: {userData.userContestRanking.attendedContestsCount}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Badges */}
                                {userData.matchedUser.badges.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-semibold text-slate-300 mb-3">Badges</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {userData.matchedUser.badges.map(badge => (
                                                <div key={badge.id} className="group relative">
                                                    <img
                                                        src={badge.icon.startsWith('http') ? badge.icon : `https://leetcode.com${badge.icon}`}
                                                        alt={badge.displayName}
                                                        className="w-12 h-12 object-contain"
                                                    />
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 border border-white/10">
                                                        {badge.displayName}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Statistics Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                                {/* Total Solved */}
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6">
                                    <div className="text-sm text-slate-400 mb-2">Total Solved</div>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {userData.matchedUser.submitStats.acSubmissionNum[0].count}
                                        <span className="text-sm text-slate-500 font-normal ml-2">/ {userData.matchedUser.submitStats.totalSubmissionNum[0].count}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
                                            style={{ width: `${(userData.matchedUser.submitStats.acSubmissionNum[0].count / userData.matchedUser.submitStats.totalSubmissionNum[0].count) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Difficulty Stats */}
                                {userData.matchedUser.submitStats.acSubmissionNum.slice(1).map((stat) => (
                                    <div key={stat.difficulty} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                        <div className={`text-sm font-medium mb-2 ${getDifficultyColor(stat.difficulty)}`}>
                                            {stat.difficulty}
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {stat.count}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {userData.matchedUser.submitStats.totalSubmissionNum.find(s => s.difficulty === stat.difficulty)?.count} submissions
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span>🕐</span> Recent Submissions
                                </h3>
                                <div className="space-y-3">
                                    {userData.recentSubmissionList.map((submission, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white mb-1 hover:text-amber-400 transition-colors">
                                                        {submission.title}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                                            {submission.lang}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatTimestamp(submission.timestamp)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`inline-block rounded-lg px-3 py-1 text-xs font-medium border mb-1 ${getStatusColor(submission.statusDisplay)}`}>
                                                        {submission.statusDisplay}
                                                    </div>
                                                    {submission.runtime !== 'N/A' && (
                                                        <div className="text-xs text-slate-500">
                                                            {submission.runtime} • {submission.memory}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!userData && !loading && (
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-12 text-center backdrop-blur-sm">
                            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-400/20 flex items-center justify-center">
                                <span className="text-4xl">💻</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Profile Loaded</h3>
                            <p className="text-slate-400">
                                Enter a LeetCode username above to view detailed statistics
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
