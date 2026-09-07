import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'


export default function Profile({ onBack }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Profile form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    college: '',
    graduationYear: '',
    skills: '',
    github: '',
    linkedin: '',
    codeforces: '',
    leetcode: '',
    codechef: '',
    atcoder: '',
    profileImage: '',
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // Calculate profile completion
  useEffect(() => {
    const filledFields = Object.values(formData).filter(field => typeof field === 'string' && field.trim() !== '').length
    const totalFields = Object.keys(formData).length
    setProgress(Math.round((filledFields / totalFields) * 100))
  }, [formData])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsub
  }, [])

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (limit to 1MB for base64)
      if (file.size > 1024 * 1024) {
        setMessage('Image size should be less than 1MB')
        setTimeout(() => setMessage(''), 3000)
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        console.log('Image converted to base64, length:', result.length)
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Fetch profile data when user is authenticated
  useEffect(() => {
    if (user?.uid) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/profile/${user.uid}`)
          if (res.ok) {
            const data = await res.json()
            if (data) {
              // Merge existing formData with fetched data, excluding specific fields if needed
              setFormData(prev => ({
                ...prev,
                fullName: data.fullName || '',
                username: data.username || '',
                bio: data.bio || '',
                college: data.college || '',
                graduationYear: data.graduationYear || '',
                skills: data.skills || '',
                github: data.github || '',
                linkedin: data.linkedin || '',
                codeforces: data.codeforces || '',
                leetcode: data.leetcode || '',
                codechef: data.codechef || '',
                atcoder: data.atcoder || '',
                profileImage: data.profileImage || '',
              }))
              setImagePreview(data.profileImage || '')
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      }
      fetchProfile()
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      // For now, just save the profile without image upload
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profileImage: imagePreview || '', // Use preview as image URL for now
          firebaseUid: user.uid,
          email: user.email,
        }),
      })

      console.log('Sent profile data:', {
        ...formData,
        profileImage: imagePreview || '',
        firebaseUid: user.uid,
        email: user.email,
      });

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to save profile: ${errorText}`)
      }

      const data = await response.json()
      console.log('Profile explicitly saved:', data)
      setMessage('Profile saved successfully!')
      setSelectedImage(null)

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setMessage(`Error saving profile: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400"></div>
          <p className="mt-4 text-slate-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-4">Please Sign In</h1>
          <p className="text-slate-300 mb-6">You need to be signed in to view your profile</p>
          <button
            onClick={onBack}
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    )
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
                <a href="#features" className="text-sm text-slate-300 hover:text-white">
                  Platforms
                </a>
                <a href="#analytics" className="text-sm text-slate-300 hover:text-white">
                  Analytics
                </a>
                <a href="#pricing" className="text-sm text-slate-300 hover:text-white">
                  Pricing
                </a>
              </nav>

              <div className="hidden items-center gap-3 md:flex">
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
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-white/5 p-2 shadow-lg">
                          <button
                            onClick={() => {
                              setProfileDropdown(false)
                              // Already on profile page, so no action needed
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
                              onBack() // Go back to main page after sign out
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
                  <>
                    <button
                      onClick={() => {
                        // Go back and show auth modal
                        onBack()
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 md:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="border-t border-white/5 bg-slate-950/70 backdrop-blur">
              <div className="mx-auto max-w-6xl px-4 py-4 space-y-4">
                <Link to="/" className="block text-sm text-slate-300 hover:text-white">
                  Home
                </Link>
                <a href="#features" className="block text-sm text-slate-300 hover:text-white">
                  Platforms
                </a>
                <a href="#analytics" className="block text-sm text-slate-300 hover:text-white">
                  Analytics
                </a>
                <a href="#pricing" className="block text-sm text-slate-300 hover:text-white">
                  Pricing
                </a>
                {user ? (
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        // Already on profile page
                      }}
                      className="block w-full text-left text-sm text-slate-300 hover:text-white"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        navigate('/dashboard')
                      }}
                      className="block w-full text-left text-sm text-slate-300 hover:text-white"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={async () => {
                        setMobileOpen(false)
                        const { signOut } = await import('firebase/auth')
                        await signOut(auth)
                        onBack()
                      }}
                      className="block w-full text-left text-sm text-slate-300 hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      onBack()
                    }}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 text-center"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-4 py-8">
          {message && (
            <div className={`mb-6 rounded-xl border px-4 py-3 text-sm animate-fade-in ${message.includes('success')
              ? 'border-green-400/30 bg-green-400/10 text-green-200'
              : 'border-red-400/30 bg-red-400/10 text-red-200'
              }`}>
              {message}
            </div>
          )}

          {/* User Card */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {user.displayName || user.email?.split('@')[0] || user.uid?.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-slate-400">
                    @{user.email?.split('@')[0] || user.uid?.slice(0, 8)}
                  </p>
                  <p className="text-xs text-slate-500">Member since {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Profile Completion</div>
                  <div className="text-sm font-semibold text-cyan-400">{progress}%</div>
                </div>
                <div className="h-8 w-8 rounded-full border-2 border-cyan-400/20">
                  <div
                    className="h-full w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all duration-500"
                    style={{
                      background: `conic-gradient(from 0deg, rgb(248 113 113) 0deg, rgb(34 211 238) ${progress * 3.6}deg, rgb(51 65 85) ${progress * 3.6}deg)`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                  <p className="text-sm text-slate-400">Tell us about yourself</p>
                </div>
              </div>

              {/* Profile Image Upload */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-slate-300">Profile Image</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-2 border-white/10 bg-white/5 overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('profileImageInput').click()}
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 p-0.5 hover:opacity-90 transition-opacity"
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </button>
                  </div>
                  <div className="flex-1">
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-sm text-slate-300 mb-2">Upload your profile picture</p>
                    <p className="text-xs text-slate-400">Recommended: Square image, at least 200x200px. Max size: 1MB.</p>
                    {selectedImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-cyan-300">Selected: {selectedImage.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null)
                            setImagePreview(formData.profileImage || '')
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="group">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="John Doe"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="johndoe"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      @
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </section>

            {/* Education */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20">
                  <span className="text-lg">🎓</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Education</h2>
                  <p className="text-sm text-slate-400">Your academic background</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="group">
                  <label className="mb-2 block text-sm font-medium text-slate-300">College/University</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="Your college name"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      🏫
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="mb-2 block text-sm font-medium text-slate-300">Graduation Year</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      placeholder="2025"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      📅
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Skills</h2>
                  <p className="text-sm text-slate-400">Your technical expertise</p>
                </div>
              </div>

              <div className="group">
                <label className="mb-2 block text-sm font-medium text-slate-300">Technical Skills</label>
                <div className="relative">
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    placeholder="JavaScript, React, Python, C++, etc."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ⚡
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">Separate skills with commas</p>
              </div>
            </section>

            {/* Social Links */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20">
                  <span className="text-lg">💻</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Coding Profiles</h2>
                  <p className="text-sm text-slate-400">Connect your coding platforms</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: 'github', icon: '🐙', placeholder: 'https://github.com/username', prefix: 'https://github.com/' },
                  { name: 'linkedin', icon: '💼', placeholder: 'https://linkedin.com/in/username', prefix: 'https://linkedin.com/in/' },
                  { name: 'codeforces', icon: '🏆', placeholder: 'https://codeforces.com/profile/handle', prefix: 'https://codeforces.com/profile/' },
                  { name: 'leetcode', icon: '🧮', placeholder: 'https://leetcode.com/username', prefix: 'https://leetcode.com/' },
                  { name: 'codechef', icon: '👨‍🍳', placeholder: 'https://codechef.com/users/username', prefix: 'https://codechef.com/users/' },
                  { name: 'atcoder', icon: '🎯', placeholder: 'https://atcoder.jp/users/username', prefix: 'https://atcoder.jp/users/' },
                ].map((platform) => (
                  <div key={platform.name} className="group">
                    <label className="mb-2 block text-sm font-medium text-slate-300 capitalize">
                      {platform.name} {platform.icon}
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name={platform.name}
                        value={formData[platform.name]}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
                        placeholder={platform.placeholder}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {platform.icon}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Enter full profile URL</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="group relative rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-50 transition-all hover:scale-105"
              >
                <span className="relative z-10">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save Profile'
                  )}
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
