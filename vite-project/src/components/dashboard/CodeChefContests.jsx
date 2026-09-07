import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Calendar,
    Clock,
    ExternalLink,
    Loader2,
    AlertCircle,
    Info,
    Timer,
    Users
} from 'lucide-react';

const ContestCard = ({ contest, type }) => {
    // API dates are in ISO format e.g. "2024-02-07T20:00:00+05:30"
    const startTime = new Date(contest.contest_start_date);
    const startDate = startTime.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    const startTimeStr = startTime.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Duration comes as string in minutes usually, e.g. "120"
    const durationMinutes = parseInt(contest.contest_duration, 10) || 0;
    const durationHours = (durationMinutes / 60).toFixed(1);

    const isOngoing = type === 'present';
    const isUpcoming = type === 'future';

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
                        <img
                            src="https://cdn.iconscout.com/icon/free/png-256/free-codechef-3628701-3029926.png"
                            alt="CodeChef"
                            className="w-5 h-5 object-contain opacity-80"
                        />
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                        {contest.contest_code}
                    </div>
                </div>

                <h3 className="text-white font-semibold mb-2 group-hover:text-amber-700 transition-colors text-lg leading-tight">
                    {contest.contest_name}
                </h3>

                <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={14} className="text-slate-500" />
                        {startDate}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} className="text-slate-500" />
                        {startTimeStr}
                        <span className="text-slate-600">
                            • {durationHours}h
                        </span>
                    </div>
                    {contest.distinct_users && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Users size={14} className="text-slate-500" />
                            {contest.distinct_users.toLocaleString()} participating
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex gap-2">
                <a
                    href={contest.contest_link || `https://www.codechef.com/${contest.contest_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                >
                    Details
                    <ExternalLink size={14} />
                </a>
                {isUpcoming && (
                    <a
                        href={`https://www.codechef.com/${contest.contest_code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-600 transition-colors flex items-center"
                    >
                        Register
                    </a>
                )}
                {isOngoing && (
                    <a
                        href={`https://www.codechef.com/${contest.contest_code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center"
                    >
                        Compete
                    </a>
                )}
            </div>
        </div>
    );
};

const CodeChefContests = () => {
    const [presentContests, setPresentContests] = useState([]);
    const [futureContests, setFutureContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await fetch('https://competeapi.vercel.app/contests/codechef/');
                const data = await response.json();

                if (data.status === 'success') {
                    setPresentContests(data.present_contests || []);
                    setFutureContests(data.future_contests || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch contests');
                }
            } catch (err) {
                console.error("Error fetching CodeChef contests:", err);
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
                <Loader2 className="w-10 h-10 text-amber-700 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Fetching CodeChef contests...</p>
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
                    <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-widest mb-2">
                        <Info size={14} />
                        CodeChef Platform
                    </div>
                    <h1 className="text-3xl font-bold text-white">Contest Arena</h1>
                    <p className="text-slate-400 text-sm mt-1">Starters, Cook-offs, and Long Challenges.</p>
                </div>
            </div>

            {/* Note/Tip */}
            <div className="bg-gradient-to-r from-amber-900/10 to-transparent border-l-4 border-amber-800 p-4 rounded-r-2xl mb-10">
                <div className="flex items-start gap-3">
                    <div className="text-amber-700 mt-1"><Timer size={18} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Prepare for Wednesday!</p>
                        <p className="text-xs text-slate-400 mt-1">
                            CodeChef Starters usually happen every Wednesday at 8:00 PM IST. Don't miss out on rating boosts!
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {/* Ongoing Section */}
                {presentContests.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <h2 className="text-xl font-bold text-white">Live Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {presentContests.map((contest, index) => (
                                <ContestCard key={contest.contest_code || index} contest={contest} type="present" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-1.5 rounded-lg bg-amber-700/10 text-amber-700">
                            <Calendar size={18} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Upcoming Contests</h2>
                    </div>

                    {futureContests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {futureContests.map((contest, index) => (
                                <ContestCard key={contest.contest_code || index} contest={contest} type="future" />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                            <p className="text-slate-500 text-sm italic">No upcoming contests scheduled right now.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CodeChefContests;
