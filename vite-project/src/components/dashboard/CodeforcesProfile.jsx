import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { auth } from '../../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function CodeforcesProfile() {
    const [handle, setHandle] = useState('')
    const [userInfo, setUserInfo] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [stats, setStats] = useState({
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        solvedProblems: new Set(),
        verdictStats: {},
        languageStats: {},
        problemRatings: {},
        tagStats: {},
        ratingHistory: [],
        recentActivity: [],
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/profile/${currentUser.uid}`);
                if (res.ok) {
                    const profile = await res.json();
                    if (profile && profile.codeforces) {
                        const savedUrl = profile.codeforces;
                        fetchUserData(savedUrl);
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
        // Handle full URL cases like https://codeforces.com/profile/tourist
        const match = input.match(/(?:codeforces\.com\/profile\/)([^/?\s]+)/)
        return match ? match[1] : input.trim()
    }

    const fetchUserData = async (inputHandle) => {
        const userHandle = extractHandle(inputHandle)

        if (!userHandle) {
            setError('Please enter a Codeforces handle or profile URL')
            return
        }

        setLoading(true)
        setError('')
        setHandle(userHandle) // Update input with clean handle

        try {
            // Fetch user info
            const userInfoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${userHandle}`)
            const userInfoData = await userInfoResponse.json()

            if (userInfoData.status !== 'OK') {
                throw new Error('User not found')
            }

            setUserInfo(userInfoData.result[0])

            // Fetch user submissions
            const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${userHandle}`)
            const submissionsData = await submissionsResponse.json()

            if (submissionsData.status !== 'OK') {
                throw new Error('Failed to fetch submissions')
            }

            const userSubmissions = submissionsData.result
            setSubmissions(userSubmissions)

            // Fetch user rating history
            const ratingResponse = await fetch(`https://codeforces.com/api/user.rating?handle=${userHandle}`)
            const ratingData = await ratingResponse.json()

            let ratingHistory = []
            if (ratingData.status === 'OK') {
                ratingHistory = ratingData.result.reverse() // Show newest first
            }

            // Calculate statistics
            calculateStats(userSubmissions, ratingHistory)
        } catch (err) {
            setError(err.message || 'Failed to fetch user data')
            setUserInfo(null)
            setSubmissions([])
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (submissions, ratingHistory = []) => {
        const verdictStats = {}
        const languageStats = {}
        const problemRatings = {}
        const tagStats = {}
        const solvedProblems = new Set()
        let acceptedCount = 0

        submissions.forEach(submission => {
            // Verdict statistics
            const verdict = submission.verdict || 'UNKNOWN'
            verdictStats[verdict] = (verdictStats[verdict] || 0) + 1

            // Language statistics
            const language = submission.programmingLanguage || 'Unknown'
            languageStats[language] = (languageStats[language] || 0) + 1

            // Track solved problems (only OK verdicts)
            if (verdict === 'OK' && submission.problem) {
                const problemKey = `${submission.problem.contestId}-${submission.problem.index}`
                solvedProblems.add(problemKey)
                acceptedCount++

                if (submission.problem.rating) {
                    const rating = submission.problem.rating
                    problemRatings[rating] = (problemRatings[rating] || 0) + 1
                }

                // Tag statistics
                if (submission.problem.tags && submission.problem.tags.length > 0) {
                    submission.problem.tags.forEach(tag => {
                        tagStats[tag] = (tagStats[tag] || 0) + 1
                    })
                }
            }
        })

        // Get recent activity (last 10 submissions)
        const recentActivity = submissions.slice(0, 10)

        setStats({
            totalSubmissions: submissions.length,
            acceptedSubmissions: acceptedCount,
            solvedProblems,
            verdictStats,
            languageStats,
            problemRatings,
            tagStats,
            ratingHistory: ratingHistory.slice(0, 10), // Keep top 10 most recent contests
            recentActivity
        })
    }

    const getRankColor = (rank) => {
        const rankColors = {
            'newbie': 'text-gray-400',
            'pupil': 'text-green-400',
            'specialist': 'text-cyan-400',
            'expert': 'text-blue-400',
            'candidate master': 'text-purple-400',
            'master': 'text-orange-400',
            'international master': 'text-orange-500',
            'grandmaster': 'text-red-400',
            'international grandmaster': 'text-red-500',
            'legendary grandmaster': 'text-red-600'
        }
        return rankColors[rank?.toLowerCase()] || 'text-slate-400'
    }

    const getVerdictColor = (verdict) => {
        const verdictColors = {
            'OK': 'text-green-400 bg-green-400/10 border-green-400/30',
            'WRONG_ANSWER': 'text-red-400 bg-red-400/10 border-red-400/30',
            'TIME_LIMIT_EXCEEDED': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
            'MEMORY_LIMIT_EXCEEDED': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
            'RUNTIME_ERROR': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
            'COMPILATION_ERROR': 'text-pink-400 bg-pink-400/10 border-pink-400/30',
            'SKIPPED': 'text-gray-400 bg-gray-400/10 border-gray-400/30',
            'TESTING': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
            'CHALLENGED': 'text-red-500 bg-red-500/10 border-red-500/30'
        }
        return verdictColors[verdict] || 'text-slate-400 bg-slate-400/10 border-slate-400/30'
    }

    const formatVerdict = (verdict) => {
        return verdict.replace(/_/g, ' ')
    }

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A'
        const date = new Date(timestamp * 1000)
        if (isNaN(date.getTime())) return 'N/A'

        try {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (e) {
            return 'N/A'
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Animated Background */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl animate-pulse-slow" />
                <div className="absolute top-64 right-[-12rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-8rem] left-[-10rem] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400" />
                                <div className="leading-tight">
                                    <div className="text-sm font-semibold">Codeforces Profile</div>
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
                        <h2 className="mb-4 text-xl font-semibold text-white">Search Codeforces User</h2>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUserData(handle)}
                                    placeholder="Enter Codeforces handle or profile URL"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </div>
                            </div>
                            <button
                                onClick={() => fetchUserData(handle)}
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-50 transition-all hover:scale-105"
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

                    {/* User Info Section */}
                    {userInfo && (
                        <>
                            {/* Profile Card */}
                            <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 p-1">
                                            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                                                <img
                                                    src={userInfo.titlePhoto || `https://ui-avatars.com/api/?name=${userInfo.handle}&background=random&size=200`}
                                                    alt={userInfo.handle}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-1">
                                                {userInfo.firstName && userInfo.lastName
                                                    ? `${userInfo.firstName} ${userInfo.lastName}`
                                                    : userInfo.handle}
                                            </h1>
                                            <p className="text-lg text-slate-300 mb-2">@{userInfo.handle}</p>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-semibold ${getRankColor(userInfo.rank)}`}>
                                                    {userInfo.rank?.toUpperCase() || 'UNRATED'}
                                                </span>
                                                {userInfo.maxRank && userInfo.maxRank !== userInfo.rank && (
                                                    <span className="text-xs text-slate-400">
                                                        (max: <span className={getRankColor(userInfo.maxRank)}>{userInfo.maxRank?.toUpperCase()}</span>)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-slate-400 mb-1">Current Rating</div>
                                        <div className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                                            {userInfo.rating || 'N/A'}
                                        </div>
                                        {userInfo.maxRating && (
                                            <div className="text-xs text-slate-400 mt-1">
                                                Max: {userInfo.maxRating}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-xs text-slate-400 mb-1">Contribution</div>
                                        <div className="text-xl font-semibold text-white">{userInfo.contribution || 0}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-xs text-slate-400 mb-1">Friend Of</div>
                                        <div className="text-xl font-semibold text-white">{userInfo.friendOfCount || 0}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-xs text-slate-400 mb-1">Organization</div>
                                        <div className="text-sm font-semibold text-white truncate">{userInfo.organization || 'N/A'}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-xs text-slate-400 mb-1">Country</div>
                                        <div className="text-sm font-semibold text-white">{userInfo.country || 'N/A'}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-xs text-slate-400 mb-1">Registered</div>
                                        <div className="text-sm font-semibold text-white">
                                            {userInfo.registrationTimeSeconds ? formatTimestamp(userInfo.registrationTimeSeconds).split(',')[0] : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-xs text-slate-400 mb-1">Last Online</div>
                                        <div className="text-sm font-semibold text-white">
                                            {userInfo.lastOnlineTimeSeconds ? formatTimestamp(userInfo.lastOnlineTimeSeconds) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                                {/* Total Submissions */}
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/20">
                                            <span className="text-2xl">📊</span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Total Submissions</div>
                                            <div className="text-2xl font-bold text-white">{stats.totalSubmissions}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Accepted Submissions */}
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-green-500/5 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Accepted</div>
                                            <div className="text-2xl font-bold text-white">{stats.acceptedSubmissions}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {stats.totalSubmissions > 0
                                            ? `${((stats.acceptedSubmissions / stats.totalSubmissions) * 100).toFixed(1)}% acceptance rate`
                                            : 'No submissions yet'}
                                    </div>
                                </div>

                                {/* Solved Problems */}
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
                                            <span className="text-2xl">🎯</span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400">Unique Problems Solved</div>
                                            <div className="text-2xl font-bold text-white">{stats.solvedProblems.size}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verdict Statistics */}
                            <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span>📈</span> Verdict Distribution
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(stats.verdictStats)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 9)
                                        .map(([verdict, count]) => (
                                            <div
                                                key={verdict}
                                                className={`rounded-xl border p-4 ${getVerdictColor(verdict)}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium">{formatVerdict(verdict)}</div>
                                                    <div className="text-lg font-bold">{count}</div>
                                                </div>
                                                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                                                    <div
                                                        className="h-full bg-current opacity-50"
                                                        style={{ width: `${(count / stats.totalSubmissions) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Language Statistics */}
                            <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span>💻</span> Programming Languages
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                    {Object.entries(stats.languageStats)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 8)
                                        .map(([language, count]) => (
                                            <div
                                                key={language}
                                                className="rounded-xl border border-white/10 bg-white/5 p-4"
                                            >
                                                <div className="text-sm font-medium text-slate-300 mb-1 truncate">{language}</div>
                                                <div className="text-xl font-bold text-white">{count}</div>
                                                <div className="text-xs text-slate-400">
                                                    {((count / stats.totalSubmissions) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>



                            {/* Tag Statistics */}
                            {Object.keys(stats.tagStats).length > 0 && (
                                <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <span>🏷️</span> Problem Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(stats.tagStats)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([tag, count]) => (
                                                <div
                                                    key={tag}
                                                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-all hover:bg-white/10"
                                                >
                                                    <span className="text-sm text-slate-200">{tag}</span>
                                                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cyan-500/20 px-1.5 text-xs font-medium text-cyan-300">
                                                        {count}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Problem Ratings */}
                            {Object.keys(stats.problemRatings).length > 0 && (
                                <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <span>⭐</span> Problem Ratings Distribution
                                    </h3>
                                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                                        {Object.entries(stats.problemRatings)
                                            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                                            .map(([rating, count]) => (
                                                <div
                                                    key={rating}
                                                    className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4"
                                                >
                                                    <div className="text-sm font-medium text-purple-300 mb-1">{rating}</div>
                                                    <div className="text-xl font-bold text-white">{count}</div>
                                                    <div className="text-xs text-slate-400">problems</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Contest History */}
                            {stats.ratingHistory.length > 0 && (
                                <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <span>🏆</span> Contest History
                                    </h3>
                                    <div className="space-y-3">
                                        {stats.ratingHistory.map((contest, index) => {
                                            const ratingChange = contest.newRating - contest.oldRating
                                            const isExamplePositive = ratingChange >= 0

                                            return (
                                                <div
                                                    key={index}
                                                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-white mb-1">
                                                                {contest.contestName}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                                <span>Rank: {contest.rank}</span>
                                                                <span>•</span>
                                                                <span>{formatTimestamp(contest.ratingUpdateTimeSeconds)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center justify-end gap-2 mb-1">
                                                                <span className="text-sm font-bold text-white">
                                                                    {contest.newRating}
                                                                </span>
                                                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${isExamplePositive
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-red-500/20 text-red-400'
                                                                    }`}>
                                                                    {isExamplePositive ? '+' : ''}{ratingChange}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                Old: {contest.oldRating}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity */}
                            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span>🕐</span> Recent Activity
                                </h3>
                                <div className="space-y-3">
                                    {stats.recentActivity.map((submission, index) => (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold text-white">
                                                            {submission.problem?.name || 'Unknown Problem'}
                                                        </span>
                                                        {submission.problem?.rating && (
                                                            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                                                                {submission.problem.rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <span>Contest: {submission.contestId || 'N/A'}</span>
                                                        <span>•</span>
                                                        <span>Problem: {submission.problem?.index || 'N/A'}</span>
                                                        <span>•</span>
                                                        <span>{submission.programmingLanguage}</span>
                                                        <span>•</span>
                                                        <span>{submission.timeConsumedMillis}ms</span>
                                                        <span>•</span>
                                                        <span>{(submission.memoryConsumedBytes / 1024).toFixed(0)}KB</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`inline-block rounded-lg border px-3 py-1 text-xs font-medium mb-1 ${getVerdictColor(submission.verdict)}`}>
                                                        {formatVerdict(submission.verdict)}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {formatTimestamp(submission.creationTimeSeconds)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!userInfo && !loading && (
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-12 text-center backdrop-blur-sm">
                            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20 flex items-center justify-center">
                                <span className="text-4xl">🔍</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Profile Loaded</h3>
                            <p className="text-slate-400">
                                Enter a Codeforces handle above to view detailed statistics and activity
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
