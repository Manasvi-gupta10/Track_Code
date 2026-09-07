import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Calendar,
    Clock,
    ExternalLink,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    AlertCircle,
    Info
} from 'lucide-react';

const ContestCard = ({ contest }) => {
    const startTime = new Date(contest.startTimeSeconds * 1000);
    const isUpcoming = contest.phase === 'BEFORE';
    const isOngoing = contest.phase === 'CODING';

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group relative overflow-hidden">
            {isOngoing && (
                <div className="absolute top-0 right-0">
                    <div className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                        LIVE NOW
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-slate-900 border border-white/5">
                    <Trophy size={20} className={isUpcoming ? "text-cyan-400" : isOngoing ? "text-emerald-400" : "text-slate-400"} />
                </div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    ID: {contest.id}
                </div>
            </div>

            <h3 className="text-white font-semibold mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[3rem]">
                {contest.name}
            </h3>

            <div className="space-y-3 pt-4 border-t border-white/5">
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
                    <span className="text-slate-600">({(contest.durationSeconds / 3600).toFixed(1)}h)</span>
                </div>
            </div>

            <div className="mt-6 flex gap-2">
                <a
                    href={`https://codeforces.com/contests/${contest.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                >
                    Details
                    <ExternalLink size={14} />
                </a>
                {isUpcoming && (
                    <button className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors">
                        Register
                    </button>
                )}
            </div>
        </div>
    );
};

const CodeforcesContests = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, UPCOMING, ONGOING, PAST

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await fetch('https://codeforces.com/api/contest.list');
                const data = await response.json();

                if (data.status === 'OK') {
                    setContests(data.result);
                } else {
                    throw new Error(data.comment || 'Failed to fetch contests');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    const filteredContests = contests.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === 'ALL' ||
            (filter === 'UPCOMING' && c.phase === 'BEFORE') ||
            (filter === 'ONGOING' && c.phase === 'CODING') ||
            (filter === 'PAST' && c.phase === 'FINISHED');
        return matchesSearch && matchesFilter;
    });

    const upcoming = filteredContests.filter(c => c.phase === 'BEFORE').sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
    const ongoing = filteredContests.filter(c => c.phase === 'CODING');
    const past = filteredContests.filter(c => c.phase === 'FINISHED').slice(0, 50);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse">Fetching Codeforces contests...</p>
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
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <Info size={14} />
                        Codeforces Platform
                    </div>
                    <h1 className="text-3xl font-bold text-white">Contest Tracker</h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time schedule and archive for Codeforces rounds.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search contests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                    </div>
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                        {['ALL', 'UPCOMING', 'PAST'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sub-navigation Warning/Tip */}
            <div className="bg-gradient-to-r from-blue-600/10 to-transparent border-l-4 border-blue-500 p-4 rounded-r-2xl mb-10">
                <div className="flex items-start gap-3">
                    <div className="text-blue-400 mt-1"><Info size={18} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Pro Tip: Strategy matters!</p>
                        <p className="text-xs text-slate-400 mt-1">Check the problem types usually featured in Div. 2 vs Div. 3 rounds to optimize your preparation.</p>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-12">
                {ongoing.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <h2 className="text-xl font-bold text-white">Ongoing Contests</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {ongoing.map(c => <ContestCard key={c.id} contest={c} />)}
                        </div>
                    </section>
                )}

                {(filter === 'ALL' || filter === 'UPCOMING') && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                                    <Calendar size={18} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Upcoming Rounds</h2>
                            </div>
                            <span className="text-xs text-slate-500">{upcoming.length} scheduled</span>
                        </div>
                        {upcoming.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {upcoming.map(c => <ContestCard key={c.id} contest={c} />)}
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center">
                                <p className="text-slate-500 text-sm italic">No upcoming contests found matching your search.</p>
                            </div>
                        )}
                    </section>
                )}

                {(filter === 'ALL' || filter === 'PAST') && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400">
                                    <Clock size={18} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Recent Past Contests</h2>
                            </div>
                            <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group">
                                View Full Archive
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {past.map(c => <ContestCard key={c.id} contest={c} />)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default CodeforcesContests;
