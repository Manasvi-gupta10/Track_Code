import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Trophy,
    Target,
    TrendingUp,
    Award,
    Code,
    BookOpen,
    Zap,
    Star,
    Calendar,
    Flame,
    ExternalLink,
    Loader2,
    AlertCircle
} from 'lucide-react';

export default function GFGProfile() {
    const [username, setUsername] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const extractUsername = (input) => {
        if (!input) return '';
        // Handle full URL cases like:
        // https://www.geeksforgeeks.org/profile/username
        // https://auth.geeksforgeeks.org/user/username
        const match = input.match(/(?:geeksforgeeks\.org\/(?:user|profile)\/)([^/?\s]+)/);
        return match ? match[1].trim() : input.trim();
    };

    const fetchUserData = async (inputUsername) => {
        const gfgUsername = extractUsername(inputUsername);

        if (!gfgUsername) {
            setError('Please enter a GeeksforGeeks username');
            return;
        }

        setLoading(true);
        setError('');
        setUsername(gfgUsername);

        try {
            const response = await fetch(
                `https://geeks-for-geeks-stats-api.vercel.app/?raw=y&userName=${gfgUsername}`
            );

            if (!response.ok) {
                throw new Error('User not found or API error');
            }

            const data = await response.json();

            if (!data || !data.userName) {
                throw new Error('User not found');
            }

            setUserData(data);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.message || 'Failed to fetch user data');
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'school':
                return 'from-blue-500 to-blue-600';
            case 'basic':
                return 'from-green-500 to-green-600';
            case 'easy':
                return 'from-emerald-500 to-emerald-600';
            case 'medium':
                return 'from-amber-500 to-amber-600';
            case 'hard':
                return 'from-rose-500 to-rose-600';
            default:
                return 'from-slate-500 to-slate-600';
        }
    };

    const getDifficultyTextColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'school':
                return 'text-blue-400';
            case 'basic':
                return 'text-green-400';
            case 'easy':
                return 'text-emerald-400';
            case 'medium':
                return 'text-amber-400';
            case 'hard':
                return 'text-rose-400';
            default:
                return 'text-slate-400';
        }
    };

    const calculateProgress = (solved, total = 1000) => {
        return Math.min((solved / total) * 100, 100);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Animated Background */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-green-500/20 blur-3xl animate-pulse-slow" />
                <div className="absolute top-64 right-[-12rem] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-[-8rem] left-[-10rem] h-80 w-80 rounded-full bg-teal-400/10 blur-3xl animate-pulse-slow" />
            </div>

            <div className="relative">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                                    <span className="font-bold text-slate-950 text-sm">GFG</span>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-sm font-semibold">GeeksforGeeks Profile</div>
                                    <div className="text-xs text-slate-400">Track your coding journey</div>
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
                        <h2 className="mb-4 text-xl font-semibold text-white">Search GeeksforGeeks User</h2>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUserData(username)}
                                    placeholder="Enter GFG username or profile URL"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-green-400/30 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </div>
                            </div>
                            <button
                                onClick={() => fetchUserData(username)}
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-50 transition-all hover:scale-105"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading...
                                    </span>
                                ) : (
                                    'Search'
                                )}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-200 flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    {userData && (
                        <>
                            {/* Profile Header Card */}
                            <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 p-1 flex-shrink-0">
                                            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                                                <span className="text-4xl font-bold text-green-400">
                                                    {userData.userName?.charAt(0).toUpperCase() || 'G'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-1">
                                                {userData.userName}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                {userData.instituteRank && (
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Trophy size={16} className="text-green-400" />
                                                        Institute Rank: {userData.instituteRank}
                                                    </span>
                                                )}
                                                {userData.currentStreak !== undefined && (
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Flame size={16} className="text-orange-400" />
                                                        {userData.currentStreak} day streak
                                                    </span>
                                                )}
                                            </div>
                                            <a
                                                href={`https://auth.geeksforgeeks.org/user/${userData.userName}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 mt-2 text-xs text-green-400 hover:text-green-300 transition-colors"
                                            >
                                                View on GeeksforGeeks <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>

                                    {/* Key Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="text-sm text-slate-400 mb-1">Coding Score</div>
                                            <div className="text-2xl font-bold text-green-400">
                                                {userData.codingScore || 0}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="text-sm text-slate-400 mb-1">Total Solved</div>
                                            <div className="text-2xl font-bold text-emerald-400">
                                                {userData.totalProblemsSolved || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics Grid */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                                {/* Overall Progress */}
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Target className="text-green-400" size={20} />
                                        <div className="text-sm text-slate-400">Overall Progress</div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {userData.totalProblemsSolved || 0}
                                        <span className="text-sm text-slate-500 font-normal ml-2">problems</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                            style={{ width: `${calculateProgress(userData.totalProblemsSolved)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {calculateProgress(userData.totalProblemsSolved).toFixed(1)}% of 1000 problems
                                    </div>
                                </div>

                                {/* Coding Score */}
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Star className="text-blue-400" size={20} />
                                        <div className="text-sm text-slate-400">Coding Score</div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-400 mb-2">
                                        {userData.codingScore || 0}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Keep solving to increase your score
                                    </div>
                                </div>

                                {/* Streak */}
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Flame className="text-orange-400" size={20} />
                                        <div className="text-sm text-slate-400">Current Streak</div>
                                    </div>
                                    <div className="text-3xl font-bold text-orange-400 mb-2">
                                        {userData.currentStreak || 0}
                                        <span className="text-sm text-slate-500 font-normal ml-2">days</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Max: {userData.maxStreak || 0} days
                                    </div>
                                </div>
                            </div>

                            {/* Difficulty Breakdown */}
                            <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <Trophy className="text-green-400" size={20} />
                                    Problems by Difficulty
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                    {['School', 'Basic', 'Easy', 'Medium', 'Hard'].map((difficulty) => {
                                        const count = userData[difficulty.toLowerCase()] || 0;
                                        return (
                                            <div
                                                key={difficulty}
                                                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all hover:scale-105"
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(difficulty)} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                                <div className="relative">
                                                    <div className={`text-sm font-medium mb-2 ${getDifficultyTextColor(difficulty)}`}>
                                                        {difficulty}
                                                    </div>
                                                    <div className="text-3xl font-bold text-white mb-1">
                                                        {count}
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${getDifficultyColor(difficulty)} transition-all duration-500`}
                                                            style={{ width: `${Math.min((count / 100) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Additional Stats */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {/* Monthly Submissions */}
                                {userData.monthlySolved !== undefined && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="text-cyan-400" size={18} />
                                            <div className="text-sm text-slate-400">This Month</div>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {userData.monthlySolved}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">problems solved</div>
                                    </div>
                                )}

                                {/* Institute Rank */}
                                {userData.instituteRank && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Award className="text-purple-400" size={18} />
                                            <div className="text-sm text-slate-400">Institute Rank</div>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            #{userData.instituteRank}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">in your college</div>
                                    </div>
                                )}

                                {/* Languages Used */}
                                {userData.languagesUsed !== undefined && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Code className="text-pink-400" size={18} />
                                            <div className="text-sm text-slate-400">Languages</div>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {userData.languagesUsed}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">languages mastered</div>
                                    </div>
                                )}

                                {/* Practice Points */}
                                {userData.practicePoints !== undefined && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="text-yellow-400" size={18} />
                                            <div className="text-sm text-slate-400">Practice Points</div>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {userData.practicePoints}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">total points earned</div>
                                    </div>
                                )}
                            </div>

                            {/* Performance Insights */}
                            <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-green-400" size={20} />
                                    Performance Insights
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-green-500/10">
                                                <BookOpen className="text-green-400" size={18} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white mb-1">Strong Foundation</div>
                                                <div className="text-sm text-slate-400">
                                                    You've solved {(userData.school || 0) + (userData.basic || 0)} foundational problems
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-amber-500/10">
                                                <Target className="text-amber-400" size={18} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white mb-1">Challenge Accepted</div>
                                                <div className="text-sm text-slate-400">
                                                    {(userData.medium || 0) + (userData.hard || 0)} advanced problems conquered
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!userData && !loading && (
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-12 text-center backdrop-blur-sm">
                            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-400/20 flex items-center justify-center">
                                <span className="text-4xl">💻</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Profile Loaded</h3>
                            <p className="text-slate-400">
                                Enter a GeeksforGeeks username above to view detailed statistics
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
