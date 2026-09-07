import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import {
    Trophy,
    Calendar,
    Clock,
    ExternalLink,
    Loader2,
    AlertCircle,
    Info,
    Timer,
    Star
} from 'lucide-react';

const ContestCard = ({ contest, isUpcoming }) => {
    // AtCoder contestTime is usually something like "2024-03-02 21:00:00 +0900" 
    // or just a parsable date string.
    const startTime = new Date(contest.contestTime);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group relative overflow-hidden flex flex-col h-full">
            <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                        <img
                            src="https://atcoder.jp/favicon.ico"
                            alt="AtCoder"
                            className="w-5 h-5 object-contain"
                        />
                    </div>
                    {contest.isRated && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Star size={10} fill="currentColor" />
                            RATED
                        </div>
                    )}
                </div>

                <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors text-lg leading-tight">
                    {contest.contestName}
                </h3>

                <div className="text-[10px] text-slate-500 font-medium mb-4">
                    ID: {contest.contestId}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5 mt-auto">
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
                            • {contest.contestDuration}h
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <a
                    href={contest.contestUrl || `https://atcoder.jp/contests/${contest.contestId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                >
                    View Contest
                    <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
};

const AtCoderContests = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadContests = async () => {
            try {
                // Fetch from our local backend proxy to avoid CORS issues
                const response = await fetch(`${API_BASE_URL}/api/contests/atcoder`);
                if (!response.ok) throw new Error('Failed to fetch from backend');
                const data = await response.json();

                setUpcoming(data.upcoming || []);
                setRecent(data.recent || []);
            } catch (err) {
                console.error("AtCoder API Error:", err);
                setError("Could not fetch AtCoder contests through the backend proxy.");
            } finally {
                setLoading(false);
            }
        };

        loadContests();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Fetching AtCoder schedule...</p>
            </div>
        );
    }

    if (error && upcoming.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Backend Connection Error</h2>
                <p className="text-slate-400 max-w-md mb-4">{error}</p>
                <div className="bg-slate-900 border border-white/10 p-4 rounded-xl text-left text-xs text-slate-400 mb-8 max-w-md">
                    <p className="font-bold text-white mb-1"><Info size={12} className="inline mr-1" /> Troubleshooting:</p>
                    1. Ensure your backend server is running on port 5001.<br />
                    2. Check if the @qatadaazzeh/atcoder-api is installed in the backend folder.<br />
                    3. Verify the /api/contests/atcoder route is correctly registered in backend/index.js.
                </div>
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
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <Info size={14} />
                        AtCoder Platform
                    </div>
                    <h1 className="text-3xl font-bold text-white">Contest Library</h1>
                    <p className="text-slate-400 text-sm mt-1">Japanese competitive programming rounds.</p>
                </div>
            </div>

            {/* Sub-navigation Warning/Tip */}
            <div className="bg-gradient-to-r from-blue-600/10 to-transparent border-l-4 border-blue-500 p-4 rounded-r-2xl mb-10">
                <div className="flex items-start gap-3">
                    <div className="text-blue-400 mt-1"><Timer size={18} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Time Zone Note</p>
                        <p className="text-xs text-slate-400 mt-1">
                            AtCoder contests are held in JST (UTC+9). We've converted them to your local time.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {/* Upcoming Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                            <Calendar size={18} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Upcoming Rounds</h2>
                    </div>
                    {upcoming.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {upcoming.map(c => <ContestCard key={c.contestId} contest={c} isUpcoming={true} />)}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                            <p className="text-slate-500 text-sm italic">No upcoming contests scheduled.</p>
                        </div>
                    )}
                </section>

                {/* Recent Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400">
                            <Trophy size={18} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Recent Past Contests</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recent.map(c => <ContestCard key={c.contestId} contest={c} isUpcoming={false} />)}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AtCoderContests;
