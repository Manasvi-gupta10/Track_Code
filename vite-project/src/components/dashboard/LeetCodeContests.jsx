import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Calendar,
    Clock,
    ExternalLink,
    Loader2,
    AlertCircle,
    Info,
    Timer
} from 'lucide-react';

const ContestCard = ({ contest }) => {
    // API returns startTime in seconds
    const startTime = new Date(contest.startTime * 1000);
    const durationSeconds = contest.duration;
    const endTime = new Date((contest.startTime + durationSeconds) * 1000);
    const now = new Date();

    let status = 'UPCOMING';
    if (now >= startTime && now <= endTime) {
        status = 'ONGOING';
    } else if (now > endTime) {
        status = 'PAST';
    }

    const isUpcoming = status === 'UPCOMING';
    const isOngoing = status === 'ONGOING';

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group relative overflow-hidden flex flex-col h-full">
            {isOngoing && (
                <div className="absolute top-0 right-0">
                    <div className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                        LIVE NOW
                    </div>
                </div>
            )}

            <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                        {contest.cardImg ? (
                            <img src={contest.cardImg} alt="Contest Logo" className="w-6 h-6 object-contain opacity-80" />
                        ) : (
                            <Trophy size={20} className="text-amber-400" />
                        )}
                    </div>
                </div>

                <h3 className="text-white font-semibold mb-2 group-hover:text-amber-400 transition-colors text-lg leading-tight">
                    {contest.title}
                </h3>

                <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={14} className="text-slate-500" />
                        {startTime.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} className="text-slate-500" />
                        {startTime.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        <span className="text-slate-600">
                            ({(durationSeconds / 3600).toFixed(1)}h)
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-2">
                <a
                    href={`https://leetcode.com/contest/${contest.titleSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                >
                    Details
                    <ExternalLink size={14} />
                </a>
                {isUpcoming && (
                    <a
                        href={`https://leetcode.com/contest/${contest.titleSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex items-center"
                    >
                        Register
                    </a>
                )}
                {isOngoing && (
                    <a
                        href={`https://leetcode.com/contest/${contest.titleSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center"
                    >
                        Enter
                    </a>
                )}
            </div>
        </div>
    );
};

const LeetCodeContests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                // Using the requested API
                const response = await fetch('https://competeapi.vercel.app/contests/leetcode/');
                const data = await response.json();

                if (data && data.data && data.data.topTwoContests) {
                    setContests(data.data.topTwoContests);
                } else {
                    throw new Error('Invalid data format received from API');
                }
            } catch (err) {
                console.error("Error fetching LeetCode contests:", err);
                setError(err.message || "Failed to fetch contests");
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Fetching LeetCode contests...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
                <p className="text-slate-400 max-w-md mb-8">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <Info size={14} />
                        LeetCode Platform
                    </div>
                    <h1 className="text-3xl font-bold text-white">Contest Schedule</h1>
                    <p className="text-slate-400 text-sm mt-1">Upcoming Weekly and Biweekly contests.</p>
                </div>
            </div>

            {/* Note/Tip */}
            <div className="bg-gradient-to-r from-amber-600/10 to-transparent border-l-4 border-amber-500 p-4 rounded-r-2xl mb-10">
                <div className="flex items-start gap-3">
                    <div className="text-amber-400 mt-1"><Timer size={18} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Regular Schedule</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Weekly Contests are usually every Sunday at 8:00 AM IST. Biweekly Contests are every other Saturday at 8:00 PM IST.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contests Grid */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                        <Calendar size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Upcoming & Recent</h2>
                </div>

                {contests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {contests.map((contest, index) => (
                            <ContestCard key={index} contest={contest} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                        <p className="text-slate-500 text-sm italic">No contests information available at the moment.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default LeetCodeContests;
