import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    Trophy,
    Calendar,
    Clock,
    ExternalLink,
    Loader2,
    AlertCircle,
    Info,
    TrendingUp,
    Target,
    Award,
    Activity,
    CheckCircle,
    XCircle,
    BarChart3,
    User,
    Code,
    Zap,
    Search
} from 'lucide-react';

const AtCoderProfile = () => {
    const [username, setUsername] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/profile/${currentUser.uid}`);
                if (res.ok) {
                    const profile = await res.json();
                    if (profile && profile.atcoder) {
                        const savedUrl = profile.atcoder;
                        // Simple extraction for AtCoder username
                        const parts = savedUrl.split('/');
                        const cleanParts = parts.filter(p => p !== '');
                        const handle = cleanParts[cleanParts.length - 1];
                        setUsername(handle);
                        fetchAtCoderData(handle);
                    }
                }
            } catch (err) {
                console.error('Error loading saved profile:', err);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchAtCoderData = async (user) => {
        if (!user.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Fetch submissions from AtCoder API via proxy
            const submissionsResponse = await fetch(`${API_BASE_URL}/api/atcoder/submissions/${user}`);
            
            if (!submissionsResponse.ok) {
                throw new Error('User not found or API error');
            }
            
            const submissionsData = await submissionsResponse.json();
            
            // Process submissions data
            const processedSubmissions = submissionsData.slice(0, 100); // Limit to recent 100 submissions
            setSubmissions(processedSubmissions);
            
            // Calculate statistics
            const stats = calculateStats(processedSubmissions);
            setStats(stats);
            
            // Fetch user profile info via proxy
            const userResponse = await fetch(`${API_BASE_URL}/api/atcoder/profile/${user}`);
            if (userResponse.ok) {
                setProfileData({ username: user });
            }
            
        } catch (err) {
            console.error("AtCoder API Error:", err);
            setError(err.message === 'User not found or API error' 
                ? 'User not found. Please check the username.' 
                : 'Failed to fetch data from AtCoder API.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (submissions) => {
        const total = submissions.length;
        const accepted = submissions.filter(s => s.result === 'AC').length;
        const wrong = submissions.filter(s => s.result === 'WA').length;
        const timeLimit = submissions.filter(s => s.result === 'TLE').length;
        const memoryLimit = submissions.filter(s => s.result === 'MLE').length;
        const runtimeError = submissions.filter(s => s.result === 'RE').length;
        
        // Calculate unique problems solved
        const uniqueProblems = new Set(submissions.filter(s => s.result === 'AC').map(s => s.problem_id)).size;
        
        // Calculate contest participation
        const contests = new Set(submissions.map(s => s.contest_id)).size;
        
        // Calculate success rate
        const successRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : 0;
        
        // Recent activity (last 30 days)
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
        const recentActivity = submissions.filter(s => s.epoch_second > thirtyDaysAgo).length;
        
        return {
            total,
            accepted,
            wrong,
            timeLimit,
            memoryLimit,
            runtimeError,
            uniqueProblems,
            contests,
            successRate,
            recentActivity
        };
    };

    const getResultColor = (result) => {
        const colors = {
            'AC': 'text-green-400 bg-green-400/10 border-green-400/30',
            'WA': 'text-red-400 bg-red-400/10 border-red-400/30',
            'TLE': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
            'MLE': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
            'RE': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
            'CE': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
        };
        return colors[result] || 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    };

    const formatTime = (epoch) => {
        return new Date(epoch * 1000).toLocaleString();
    };

    const getLanguageIcon = (language) => {
        if (language.toLowerCase().includes('python')) return '🐍';
        if (language.toLowerCase().includes('java')) return '☕';
        if (language.toLowerCase().includes('c++')) return '⚡';
        if (language.toLowerCase().includes('javascript')) return '🟨';
        if (language.toLowerCase().includes('go')) return '🐹';
        if (language.toLowerCase().includes('rust')) return '🦀';
        return '💻';
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-slate-400 font-medium">{title}</div>
            {subtitle && <div className="text-[10px] text-slate-500 mt-1">{subtitle}</div>}
        </div>
    );

    const SubmissionCard = ({ submission }) => (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getLanguageIcon(submission.language)}</span>
                        <h4 className="text-sm font-medium text-white">{submission.problem_id}</h4>
                    </div>
                    <div className="text-[10px] text-slate-500 mb-2">
                        Contest: {submission.contest_id}
                    </div>
                </div>
                <div className={`text-[10px] px-2 py-1 rounded-lg font-medium border ${getResultColor(submission.result)}`}>
                    {submission.result}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={10} />
                    {submission.execution_time ? `${submission.execution_time}ms` : 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                    <BarChart3 size={10} />
                    {submission.memory ? `${Math.round(submission.memory / 1024)}MB` : 'N/A'}
                </div>
            </div>
            
            <div className="text-[10px] text-slate-500 mt-2">
                {formatTime(submission.epoch_second)}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <Info size={14} />
                        AtCoder Profile
                    </div>
                    <h1 className="text-3xl font-bold text-white">User Statistics</h1>
                    <p className="text-slate-400 text-sm mt-1">Comprehensive analysis of coding performance.</p>
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchAtCoderData(username)}
                            placeholder="Enter AtCoder username..."
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => fetchAtCoderData(username)}
                        disabled={loading || !username.trim()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Search size={16} />
                                Search
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-slate-400 animate-pulse">Fetching AtCoder data...</p>
                </div>
            )}

            {stats && !loading && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="Total Submissions" 
                            value={stats.total} 
                            icon={Activity} 
                            color="bg-blue-500/10 text-blue-400"
                            subtitle={`${stats.recentActivity} in last 30 days`}
                        />
                        <StatCard 
                            title="Problems Solved" 
                            value={stats.uniqueProblems} 
                            icon={CheckCircle} 
                            color="bg-green-500/10 text-green-400"
                            subtitle={`${stats.accepted} accepted submissions`}
                        />
                        <StatCard 
                            title="Success Rate" 
                            value={`${stats.successRate}%`} 
                            icon={TrendingUp} 
                            color="bg-emerald-500/10 text-emerald-400"
                            subtitle={`${stats.accepted}/${stats.total}`}
                        />
                        <StatCard 
                            title="Contests" 
                            value={stats.contests} 
                            icon={Trophy} 
                            color="bg-amber-500/10 text-amber-400"
                            subtitle="Unique contests participated"
                        />
                    </div>

                    {/* Result Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                                <BarChart3 size={18} />
                                Submission Results
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Accepted (AC)</span>
                                    <span className="text-sm font-bold text-green-400">{stats.accepted}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Wrong Answer (WA)</span>
                                    <span className="text-sm font-bold text-red-400">{stats.wrong}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Time Limit (TLE)</span>
                                    <span className="text-sm font-bold text-yellow-400">{stats.timeLimit}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Memory Limit (MLE)</span>
                                    <span className="text-sm font-bold text-orange-400">{stats.memoryLimit}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Runtime Error (RE)</span>
                                    <span className="text-sm font-bold text-purple-400">{stats.runtimeError}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                                <Zap size={18} />
                                Performance Metrics
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-300">Acceptance Rate</span>
                                        <span className="text-sm font-bold text-cyan-400">{stats.successRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${stats.successRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-300">Problem Solving</span>
                                        <span className="text-sm font-bold text-emerald-400">{stats.uniqueProblems} unique</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((stats.uniqueProblems / stats.total) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Code size={18} />
                                Recent Submissions
                            </h3>
                            <a
                                href={`https://atcoder.jp/users/${username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                            >
                                View on AtCoder
                                <ExternalLink size={14} />
                            </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {submissions.slice(0, 12).map((submission, index) => (
                                <SubmissionCard key={index} submission={submission} />
                            ))}
                        </div>
                        {submissions.length > 12 && (
                            <div className="text-center mt-6">
                                <button className="text-blue-400 hover:text-blue-300 text-sm">
                                    View more submissions...
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AtCoderProfile;
