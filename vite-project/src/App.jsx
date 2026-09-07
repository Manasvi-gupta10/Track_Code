import { useMemo, useState, useEffect } from 'react'
import API_BASE_URL from './config'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Profile from './components/Profile'
import DashboardLayout from './components/dashboard/DashboardLayout'
import Dashboard from './components/dashboard/Dashboard'
import CodeforcesContests from './components/dashboard/CodeforcesContests'
import CodeforcesProfile from './components/dashboard/CodeforcesProfile'
import LeetCodeContests from './components/dashboard/LeetCodeContests'
import CodeChefContests from './components/dashboard/CodeChefContests'
import AtCoderContests from './components/dashboard/AtCoderContests'

import CodeChefProfile from './components/dashboard/CodeChefProfile'
import LeetCodeProfile from './components/dashboard/LeetCodeProfile'
import AtCoderProfile from './components/dashboard/AtCoderProfile'
import Resources from './components/dashboard/Resources'
import StressInterview from './components/dashboard/StressInterview'
import InterviewFeedback from './components/dashboard/InterviewFeedback'
import RapidFire from './components/dashboard/RapidFire'
import LiveInterview from './components/dashboard/LiveInterview'
import AptitudeQuiz from './components/dashboard/AptitudeQuiz'

import Notifications from './components/dashboard/Notifications'
import ResumeAnalytics from './components/dashboard/ResumeAnalytics'
import Roadmap from './components/dashboard/Roadmap'
import Help from './components/dashboard/Help'

const AuthModal = ({ authMode, setAuthMode, setShowAuthModal, authError, setAuthError }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (authMode === 'signup' && password !== confirmPassword) {
      setAuthError('Passwords do not match!')
      return
    }

    setLoading(true)

    try {
      if (authMode === 'signup') {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        // Update profile with name
        await updateProfile(userCredential.user, { displayName: name })

        // Create basic profile in MongoDB
        try {
          await fetch(`${API_BASE_URL}/api/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebaseUid: userCredential.user.uid,
              email: email,
              fullName: name,
              username: email.split('@')[0],
            }),
          })
        } catch (profileErr) {
          console.error('Failed to create initial profile:', profileErr)
        }

        // Send welcome email via backend
        try {
          await fetch(`${API_BASE_URL}/api/auth/welcome-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, name }),
          })
        } catch (emailErr) {
          console.error('Failed to send welcome email:', emailErr)
        }
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        await signInWithEmailAndPassword(auth, email, password)
      }
      setShowAuthModal(false)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setName('')
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            {authMode === 'signin' ? 'Sign in' : 'Sign up'}
          </h2>
          <button
            onClick={() => setShowAuthModal(false)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {authError && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs text-red-200">
            {authError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {authMode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none"
              placeholder="Min 6 characters"
            />
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none"
                placeholder="Confirm password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Loading…' : authMode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-300">
          {authMode === 'signin' ? (
            <>
              New here? {' '}
              <button
                onClick={() => setAuthMode('signup')}
                className="font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account? {' '}
              <button
                onClick={() => setAuthMode('signin')}
                className="font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('signin') // 'signin' | 'signup'
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [userProfile, setUserProfile] = useState({})

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  // Fetch user profile data when authenticated
  useEffect(() => {
    if (user?.uid) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/profile/${user.uid}`)
          if (res.ok) {
            const data = await res.json()
            setUserProfile(data || {})
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      }
      fetchProfile()
    }
  }, [user])

  // Refetch profile data when navigating back to home page
  useEffect(() => {
    const handleFocus = () => {
      if (user?.uid) {
        const fetchProfile = async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/profile/${user.uid}`)
            if (res.ok) {
              const data = await res.json()
              setUserProfile(data || {})
            }
          } catch (error) {
            console.error("Error refetching profile:", error)
          }
        }
        fetchProfile()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdown && !e.target.closest('.profile-dropdown')) {
        setProfileDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileDropdown])

  const [solvedCount, setSolvedCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [contestCount, setContestCount] = useState(0)
  const [acceptanceRate, setAcceptanceRate] = useState(0)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [difficultySplit, setDifficultySplit] = useState({ easy: 42, medium: 46, hard: 12 })
  const [solvesThisWeek, setSolvesThisWeek] = useState(18)
  const [upcomingContests, setUpcomingContests] = useState([])
  const [loadingContests, setLoadingContests] = useState(false)

  useEffect(() => {
    const fetchUpcomingContests = async () => {
      try {
        setLoadingContests(true)
        const res = await fetch(`${API_BASE_URL}/api/contests/upcoming-summary`)
        if (res.ok) {
          const data = await res.json()
          setUpcomingContests(data.topContests || [])
        }
      } catch (error) {
        console.error("Error fetching landing contests:", error)
      } finally {
        setLoadingContests(false)
      }
    }
    fetchUpcomingContests()
  }, [])

  const extractHandle = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    const cleanParts = parts.filter(p => p !== '');
    return cleanParts[cleanParts.length - 1];
  };

  useEffect(() => {
    if (!user || !userProfile || Object.keys(userProfile).length === 0) {
      setSolvedCount(0)
      setStreakDays(0)
      setContestCount(0)
      setAcceptanceRate(0)
      return
    }

    const fetchRealtimeMetrics = async () => {
      setLoadingMetrics(true)
      let totalSolved = 0
      let totalAttendedContests = 0
      let leetcodeAc = 0
      let leetcodeTotal = 0
      let activeStreak = 0
      let submissionTimestamps = []

      const promises = []

      // 1. Fetch LeetCode
      if (userProfile.leetcode) {
        const handle = userProfile.leetcode.includes('leetcode.com') ? extractHandle(userProfile.leetcode) : userProfile.leetcode;
        promises.push(
          fetch(`${API_BASE_URL}/api/leetcode/${handle}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.matchedUser) {
                const ac = data.matchedUser.submitStats?.acSubmissionNum[0]?.count || 0
                const tot = data.matchedUser.submitStats?.totalSubmissionNum[0]?.count || 1
                leetcodeAc = ac
                leetcodeTotal = tot
                totalSolved += ac
                totalAttendedContests += data.userContestRanking?.attendedContestsCount || 0

                if (data.recentSubmissionList) {
                  data.recentSubmissionList.forEach(s => {
                    if (s.statusDisplay === 'Accepted') {
                      submissionTimestamps.push(parseInt(s.timestamp) * 1000)
                    }
                  })
                }
              }
            })
            .catch(e => console.error("Error fetching landing LC metrics:", e))
        )
      }

      // 2. Fetch Codeforces
      if (userProfile.codeforces) {
        const handle = userProfile.codeforces.includes('codeforces.com') ? extractHandle(userProfile.codeforces) : userProfile.codeforces;
        // Submissions for solved count and streak
        promises.push(
          fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.status === 'OK') {
                const uniqueSolved = new Set(
                  data.result
                    .filter(s => s.verdict === 'OK')
                    .map(s => `${s.problem.contestId}${s.problem.index}`)
                ).size;
                totalSolved += uniqueSolved

                data.result.forEach(s => {
                  if (s.verdict === 'OK') {
                    submissionTimestamps.push(s.creationTimeSeconds * 1000)
                  }
                })
              }
            })
            .catch(e => console.error("Error fetching landing CF metrics:", e))
        )

        // Rating history for contest count
        promises.push(
          fetch(`https://codeforces.com/api/user.rating?handle=${handle}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.status === 'OK') {
                totalAttendedContests += data.result.length
              }
            })
            .catch(e => console.error("Error fetching landing CF rating history:", e))
        )
      }

      // 3. Fetch AtCoder
      if (userProfile.atcoder) {
        const handle = userProfile.atcoder.includes('atcoder.jp') ? extractHandle(userProfile.atcoder) : userProfile.atcoder;
        promises.push(
          fetch(`${API_BASE_URL}/api/atcoder/submissions/${handle}`)
            .then(res => res.json())
            .then(data => {
              if (data && Array.isArray(data)) {
                const uniqueSolved = new Set(
                  data.filter(s => s.result === 'AC').map(s => s.problem_id)
                ).size;
                totalSolved += uniqueSolved

                data.forEach(s => {
                  if (s.result === 'AC') {
                    submissionTimestamps.push(s.epoch_second * 1000)
                  }
                })
              }
            })
            .catch(e => console.error("Error fetching landing AtCoder metrics:", e))
        )
      }

      // Wait for all platform fetches to complete
      await Promise.all(promises)

      // Calculate Streak based on active days of submissions
      if (submissionTimestamps.length > 0) {
        const uniqueDates = Array.from(new Set(
          submissionTimestamps.map(ts => new Date(ts).toDateString())
        )).map(dStr => new Date(dStr));
        
        uniqueDates.sort((a, b) => b - a);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const latestSolve = uniqueDates[0];
        if (latestSolve) {
          latestSolve.setHours(0, 0, 0, 0);
          if (latestSolve.getTime() === today.getTime() || latestSolve.getTime() === yesterday.getTime()) {
            activeStreak = 1;
            let currentCheck = latestSolve;
            for (let i = 1; i < uniqueDates.length; i++) {
              const nextSolve = uniqueDates[i];
              nextSolve.setHours(0, 0, 0, 0);
              const diffTime = Math.abs(currentCheck.getTime() - nextSolve.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 1) {
                activeStreak++;
                currentCheck = nextSolve;
              } else if (diffDays > 1) {
                break;
              }
            }
          }
        }
      }

      // Calculate overall acceptance rate
      let acceptance = 0
      if (leetcodeTotal > 0) {
        acceptance = Math.round((leetcodeAc / leetcodeTotal) * 100)
      } else if (totalSolved > 0) {
        acceptance = 68 
      }

      // Solves in the last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklySolves = submissionTimestamps.filter(ts => ts >= sevenDaysAgo).length;
      setSolvesThisWeek(weeklySolves || (totalSolved > 0 ? Math.min(totalSolved, 12) : 0));

      setSolvedCount(totalSolved)
      setStreakDays(activeStreak)
      setContestCount(totalAttendedContests)
      setAcceptanceRate(acceptance)
      setLoadingMetrics(false)
    }

    fetchRealtimeMetrics()
  }, [user, userProfile])

  const metrics = useMemo(
    () => [
      { 
        label: 'Problems Solved', 
        value: loadingMetrics ? '...' : String(solvedCount), 
        delta: solvedCount > 0 ? `+${solvedCount} solves` : 'No activity yet' 
      },
      { 
        label: 'Active Streak', 
        value: loadingMetrics ? '...' : `${streakDays} days`, 
        delta: streakDays > 0 ? 'Keep it up!' : 'Start solving' 
      },
      { 
        label: 'Contests', 
        value: loadingMetrics ? '...' : String(contestCount), 
        delta: contestCount > 0 ? `${contestCount} attended` : 'No contests yet' 
      },
      { 
        label: 'Acceptance', 
        value: loadingMetrics ? '...' : `${acceptanceRate}%`, 
        delta: acceptanceRate > 0 ? 'Keep practicing' : 'Start practicing' 
      },
    ],
    [solvedCount, streakDays, contestCount, acceptanceRate, loadingMetrics],
  )

  const platforms = useMemo(
    () => [
      {
        name: 'LeetCode',
        href: 'https://leetcode.com/',
        icon: 'https://leetcode.com/favicon.ico',
        status: userProfile.leetcode ? 'Connected' : 'Connect',
        meta: userProfile.leetcode ? 'Profile connected' : 'Sync in 1 click',
        accent: 'from-amber-400/20 to-orange-500/10',
      },
      {
        name: 'CodeChef',
        href: 'https://www.codechef.com/',
        icon: 'https://www.codechef.com/favicon.ico',
        status: userProfile.codechef ? 'Connected' : 'Connect',
        meta: userProfile.codechef ? 'Profile connected' : 'Contest history',
        accent: 'from-rose-400/15 to-fuchsia-500/10',
      },
      {
        name: 'AtCoder',
        href: 'https://atcoder.jp/',
        icon: 'https://atcoder.jp/favicon.ico',
        status: userProfile.atcoder ? 'Connected' : 'Connect',
        meta: userProfile.atcoder ? 'Profile connected' : 'Contest history',
        accent: 'from-sky-400/15 to-cyan-500/10',
      },
      {
        name: 'Codeforces',
        href: 'https://codeforces.com/',
        icon: 'https://codeforces.com/favicon.ico',
        status: userProfile.codeforces ? 'Connected' : 'Connect',
        meta: userProfile.codeforces ? 'Profile connected' : 'Sync in 1 click',
        accent: 'from-indigo-400/15 to-violet-500/10',
      },
    ],
    [userProfile],
  )

  // AuthModal moved outside App

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} userProfile={userProfile} showAuthModal={showAuthModal} setShowAuthModal={setShowAuthModal} authMode={authMode} setAuthMode={setAuthMode} authError={authError} setAuthError={setAuthError} profileDropdown={profileDropdown} setProfileDropdown={setProfileDropdown} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} metrics={metrics} platforms={platforms} solvedCount={solvedCount} streakDays={streakDays} difficultySplit={difficultySplit} solvesThisWeek={solvesThisWeek} upcomingContests={upcomingContests} loadingContests={loadingContests} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="codeforces" element={<CodeforcesContests />} />
          <Route path="leetcode" element={<LeetCodeContests />} />
          <Route path="codechef" element={<CodeChefContests />} />
          <Route path="atcoder" element={<AtCoderContests />} />
          <Route path="codeforces-profile" element={<CodeforcesProfile />} />
          <Route path="leetcode-profile" element={<LeetCodeProfile />} />
          <Route path="atcoder-profile" element={<AtCoderProfile />} />
          <Route path="codechef-profile" element={<CodeChefProfile />} />
          <Route path="resources/dsa" element={<Resources category="DSA" />} />
          <Route path="resources/interview" element={<Resources category="Interview" />} />
          <Route path="resources/interview/technical" element={<LiveInterview />} />
          <Route path="resources/interview/stress" element={<StressInterview />} />
          <Route path="resources/interview/rapid-fire" element={<RapidFire />} />
          <Route path="resources/interview/stress/feedback" element={<InterviewFeedback />} />
          <Route path="resources/aptitude" element={<Resources category="Aptitude" />} />
          <Route path="resources/aptitude/:domain" element={<AptitudeQuiz />} />
          <Route path="resources/companies" element={<Resources category="Companies" />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="analytics" element={<ResumeAnalytics />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </Router>
  )
}

function LandingPage({
  user,
  userProfile,
  showAuthModal,
  setShowAuthModal,
  authMode,
  setAuthMode,
  authError,
  setAuthError,
  profileDropdown,
  setProfileDropdown,
  mobileOpen,
  setMobileOpen,
  metrics,
  platforms,
  solvedCount,
  streakDays,
  difficultySplit,
  solvesThisWeek,
  upcomingContests,
  loadingContests,
}) {
  const navigate = useNavigate()

  const recommendedTopics = useMemo(() => {
    if (solvedCount === 0) {
      return ['Arrays', 'Strings', 'Time Complexity', 'Basic Math'];
    } else if (solvedCount < 50) {
      return ['Binary Search', 'Sliding Window', 'Trees', 'Recursion'];
    } else {
      return ['Dynamic Programming', 'Graphs', 'Segment Trees', 'Tries'];
    }
  }, [solvedCount]);

  const topicMix = useMemo(() => {
    if (solvedCount === 0) {
      return {
        level: 'Starting Out',
        labels: 'Basic Syntax • Input/Output • Conditionals',
        widths: ['w-1/4', 'w-1/4', 'w-1/4', 'w-1/4'],
        colors: ['bg-emerald-500/60', 'bg-cyan-500/50', 'bg-fuchsia-500/50', 'bg-white/10']
      };
    } else if (solvedCount < 50) {
      return {
        level: 'Intermediate',
        labels: 'Arrays • Two Pointers • Hash Maps • Stack',
        widths: ['w-[45%]', 'w-[25%]', 'w-[20%]', 'w-[10%]'],
        colors: ['bg-emerald-400/80', 'bg-cyan-400/70', 'bg-fuchsia-500/70', 'bg-white/10']
      };
    } else {
      return {
        level: 'Advanced Mix',
        labels: 'DP • Graphs • Segment Trees • System Design',
        widths: ['w-[35%]', 'w-[30%]', 'w-[20%]', 'w-[15%]'],
        colors: ['bg-emerald-400/80', 'bg-cyan-400/70', 'bg-fuchsia-500/70', 'bg-rose-500/60']
      };
    }
  }, [solvedCount]);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-64 right-[-12rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-10rem] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400" />
              <div className="leading-tight">
                <div className="text-sm font-semibold">TrackCode</div>
                <div className="text-xs text-slate-400">Coding platform tracker</div>
              </div>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              <Link to="/" className="text-sm text-slate-300 hover:text-white">
                Home
              </Link>
              {user ? (
                <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white">
                  Platforms
                </Link>
              ) : (
                <a href="#features" className="text-sm text-slate-300 hover:text-white">
                  Platforms
                </a>
              )}
              {user ? (
                <Link to="/dashboard/analytics" className="text-sm text-slate-300 hover:text-white">
                  Resume Analytics
                </Link>
              ) : (
                <a href="#analytics" className="text-sm text-slate-300 hover:text-white">
                  Resume Analytics
                </a>
              )}
              {user ? (
                <Link to="/dashboard/leetcode" className="text-sm text-slate-300 hover:text-white">
                  Live Contests
                </Link>
              ) : (
                <a href="#pricing" className="text-sm text-slate-300 hover:text-white">
                  Live Contests
                </a>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setProfileDropdown(!profileDropdown)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>

                    {profileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-lg z-50">
                        <button
                          onClick={() => {
                            setProfileDropdown(false)
                            navigate('/profile')
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdown(false)
                            navigate('/dashboard')
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10"
                        >
                          Dashboard
                        </button>
                        <div className="my-1 border-t border-white/5"></div>
                        <button
                          onClick={async () => {
                            setProfileDropdown(false)
                            const { signOut } = await import('firebase/auth')
                            await signOut(auth)
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden items-center gap-3 md:flex">
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setAuthMode('signup')
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setAuthMode('signin')
                    }}
                    className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:opacity-95"
                  >
                    Get dashboard
                  </button>
                </div>
              )}

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 md:hidden"
                aria-label="Toggle menu"
              >
                {mobileOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="border-t border-white/5 py-4 md:hidden">
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                {user ? (
                  <Link
                    to="/dashboard"
                    className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Platforms
                  </Link>
                ) : (
                  <a
                    href="#features"
                    className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Platforms
                  </a>
                )}
                {user ? (
                  <Link
                    to="/dashboard/analytics"
                    className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Resume Analytics
                  </Link>
                ) : (
                  <a
                    href="#analytics"
                    className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Resume Analytics
                  </a>
                )}
                {user ? (
                  <Link
                    to="/dashboard/leetcode"
                    className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Live Contests
                  </Link>
                ) : (
                  <a
                    href="#pricing"
                    className="rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Live Contests
                  </a>
                )}
                <div className="border-t border-white/5 mt-2 pt-3 flex flex-col gap-2">
                  {user ? (
                    <>
                      <div className="px-2 text-xs font-semibold text-slate-400">YOUR PROFILE</div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        ⚙️ Profile Settings
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        📊 Dashboard Overview
                      </Link>
                      <button
                        onClick={async () => {
                          setMobileOpen(false)
                          const { signOut } = await import('firebase/auth')
                          await signOut(auth)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                      >
                        🚪 Sign out
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-3 mt-1">
                      <button
                        onClick={() => {
                          setShowAuthModal(true)
                          setAuthMode('signup')
                          setMobileOpen(false)
                        }}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                      >
                        Sign up
                      </button>
                      <button
                        onClick={() => {
                          setShowAuthModal(true)
                          setAuthMode('signin')
                          setMobileOpen(false)
                        }}
                        className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:opacity-95"
                      >
                        Get dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 md:pb-20 md:pt-20">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live tracking for your coding journey
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Track every solve, contest, and streak across platforms—automatically.
                </h1>
                <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-300">
                  TrackCode turns your scattered submissions into a single dark, clean dashboard. Monitor progress,
                  analyze weaknesses, and share a recruiter-ready profile.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleCTA}
                    className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:opacity-95"
                  >
                    Connect platforms
                  </button>
                  <button
                    onClick={handleCTA}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 hover:bg-white/10"
                  >
                    View sample dashboard
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="text-xs text-slate-400">{m.label}</div>
                      <div className="mt-1 text-xl font-semibold text-white">{m.value}</div>
                      <div className="mt-1 text-xs text-slate-400">{m.delta}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Overview</div>
                    <div className="text-xs text-slate-400">Last 7 days snapshot</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    Synced
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-200">Topic mix</div>
                      <div className="text-xs text-slate-400">{topicMix.level}</div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      <div className={`h-2 rounded-full ${topicMix.colors[0]}`} />
                      <div className={`h-2 rounded-full ${topicMix.colors[1]}`} />
                      <div className={`h-2 rounded-full ${topicMix.colors[2]}`} />
                      <div className={`h-2 rounded-full ${topicMix.colors[3]}`} />
                    </div>
                    <div className="mt-2 text-xs text-slate-400">{topicMix.labels}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-200">Consistency</div>
                      <div className="text-xs text-slate-400">Streak trend</div>
                    </div>
                    <div className="mt-3 grid grid-cols-12 gap-1">
                      {[2, 3, 5, 4, 7, 9, 8, 10, 7, 11, 9, 12].map((h, idx) => (
                        <div
                          key={idx}
                          className="flex items-end"
                        >
                          <div
                            className={`w-full rounded-sm ${streakDays > 0 ? 'bg-gradient-to-t from-fuchsia-500/60 to-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.2)]' : 'bg-white/10'}`}
                            style={{ height: `${8 + h * 3}px` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {streakDays > 0 ? `${streakDays} day active hot streak! 🔥` : 'Connect platforms to track consistency'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-200">Recommended next</div>
                      <div className="text-xs text-slate-400">Based on gaps</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recommendedTopics.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-semibold tracking-wide text-slate-400">PREP SUITE</div>
              <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">AI Preparation & Career Suite</h2>
              <p className="mt-2 text-sm text-slate-300">
                Unlock top-tier career preparation tools powered by advanced AI and real-time dashboard analytics.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Resume Analytics */}
            <div 
              onClick={() => user ? navigate('/dashboard/analytics') : handleCTA()}
              className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.08] transition-all hover:scale-[1.02]"
            >
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-amber-400/20 to-orange-500/10 p-5">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-slate-950/50 border border-white/10 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    📄
                  </div>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                    AI Enabled
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Resume ATS Scanner
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Scan resumes against modern ATS filters. Match keywords, calculate alignment, and discover skill gaps dynamically.
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs text-slate-400">Resume Reviewer</span>
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Start scan ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Interview Simulator */}
            <div 
              onClick={() => user ? navigate('/dashboard/resources/interview') : handleCTA()}
              className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.08] transition-all hover:scale-[1.02]"
            >
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-rose-400/15 to-fuchsia-500/10 p-5">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-slate-950/50 border border-white/10 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                    🎙️
                  </div>
                  <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2.5 py-1 text-xs font-semibold text-fuchsia-300">
                    Voice Mock
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-fuchsia-300 transition-colors">
                  Interview Simulator
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Face high-stress live mock interviews. Choose from Technical, Stress, or Rapid-Fire formats with sentiment-based AI feedback.
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs text-slate-400">Mock Engine</span>
                  <span className="text-xs font-semibold text-fuchsia-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Launch simulation ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Roadmaps */}
            <div 
              onClick={() => user ? navigate('/dashboard/roadmap') : handleCTA()}
              className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.08] transition-all hover:scale-[1.02]"
            >
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-sky-400/15 to-cyan-500/10 p-5">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-slate-950/50 border border-white/10 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    🗺️
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                    Custom Path
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Dynamic DSA Roadmaps
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Generate personal roadmap nodes mapped to your solving behaviors. Connect DSA tracks and mark lessons complete.
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs text-slate-400">Learning Tracks</span>
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View roadmap ➔
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="analytics" className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="text-xs font-semibold tracking-wide text-slate-400">RESUME ANALYTICS</div>
              <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                Know what to practice next
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Track weak topics, difficulty drift, and consistency. Make your prep measurable.
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm font-semibold text-white">Difficulty split</div>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: 'Easy', pct: difficultySplit?.easy ?? 42, color: 'bg-emerald-400/80' },
                      { label: 'Medium', pct: difficultySplit?.medium ?? 46, color: 'bg-cyan-400/70' },
                      { label: 'Hard', pct: difficultySplit?.hard ?? 12, color: 'bg-fuchsia-500/70' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>{row.label}</span>
                          <span>{row.pct}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm font-semibold text-white">Weekly goal</div>
                  <div className="mt-4">
                    <div className="text-3xl font-semibold text-white">{solvesThisWeek} / 15</div>
                    <div className="mt-1 text-xs text-slate-400">solves completed</div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-gradient-to-r from-emerald-400/80 to-cyan-400/80" style={{ width: `${Math.min((solvesThisWeek / 15) * 100, 100)}%` }} />
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    {solvesThisWeek >= 15 ? "You met your weekly goal! Excellent work. 🔥" : `Keep it up! Need ${15 - solvesThisWeek} more solves to hit weekly target.`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-xs font-semibold tracking-wide text-slate-400">LIVE SCHEDULES</div>
          <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Upcoming Competitive Contests</h2>
          <p className="mt-2 text-sm text-slate-300">
            Track registration deadlines, countdowns, and details for live competitive rounds across all major coding platforms.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loadingContests ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-6 h-48" />
              ))
            ) : upcomingContests.length > 0 ? (
              upcomingContests.map((contest, index) => (
                <div 
                  key={index}
                  className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950/80 border border-white/10 text-lg font-bold">
                        {contest.platform === 'LeetCode' && '🟡'}
                        {contest.platform === 'Codeforces' && '🔵'}
                        {contest.platform === 'CodeChef' && '🟤'}
                        {contest.platform === 'AtCoder' && '🟢'}
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">{contest.platform}</div>
                        <div className="text-sm font-semibold text-white truncate max-w-[150px]">{contest.name}</div>
                      </div>
                    </div>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                      Active
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-slate-200 font-medium">{contest.date}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Countdown:</span>
                      <span className="text-emerald-400 font-semibold">
                        {(() => {
                          const diff = contest.startTime - Date.now();
                          if (diff <= 0) return 'Started';
                          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                          return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => user ? navigate('/dashboard') : handleCTA()}
                      className="w-full rounded-xl bg-white/5 py-2 text-xs font-semibold text-slate-200 border border-white/10 hover:bg-white/10 group-hover:border-cyan-400/30 group-hover:text-cyan-300 transition-all"
                    >
                      Sync & Register
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 rounded-3xl border border-white/10 bg-white/5">
                <span className="text-3xl">🏁</span>
                <h3 className="mt-2 text-sm font-semibold text-white">No Upcoming Contests</h3>
                <p className="text-xs text-slate-400">Everything synced perfectly. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:flex md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white">Ready to track your growth?</h3>
              <p className="mt-2 text-sm text-slate-300">
                Connect your profiles and get a unified dashboard in minutes.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-0">
              <button
                onClick={handleCTA}
                className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:opacity-95"
              >
                Connect now
              </button>
              <button
                onClick={() => {
                  window.location.href = 'mailto:support@trackcode.ai'
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200 hover:bg-white/10"
              >
                Talk to us
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} TrackCode. Built for consistent practice.
            </div>
            <div className="flex gap-5 text-sm">
              <a className="text-slate-400 hover:text-white" href="#features">
                Platforms
              </a>
              <a className="text-slate-400 hover:text-white" href="#analytics">
                Resume Analytics
              </a>
              <a className="text-slate-400 hover:text-white" href="#pricing">
                Pricing
              </a>
            </div>
          </div>
        </div>
      </footer>
      {showAuthModal && (
        <AuthModal
          authMode={authMode}
          setAuthMode={setAuthMode}
          setShowAuthModal={setShowAuthModal}
          authError={authError}
          setAuthError={setAuthError}
        />
      )}
    </div>
  )
}

export default App
