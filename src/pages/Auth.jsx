import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth({ mode }) {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
      } else {
        if (!form.fullName || !form.phone) {
          setError('Please fill in all fields.')
          setLoading(false)
          return
        }
        await signUp(form.email, form.password, form.fullName, form.phone)
      }
      navigate('/app')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paymo-blue flex flex-col">
      {/* Top brand area */}
      <div className="flex-shrink-0 pt-16 pb-10 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-extrabold text-2xl">P</span>
        </div>
        <h1 className="text-white font-extrabold text-2xl">PayMo</h1>
        <p className="text-blue-200 text-sm mt-1">Powering cashless payments in the Caribbean</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] px-6 pt-8 pb-10">
        <h2 className="text-gray-900 font-extrabold text-2xl mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-gray-400 text-sm mb-7">
          {mode === 'login'
            ? 'Sign in to your PayMo account'
            : 'Join thousands of people going cashless'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Baptiste"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <input
                  type="tel"
                  placeholder="e.g. 868-555-1234"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="input-field"
              minLength={mode === 'signup' ? 8 : 1}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading
              ? mode === 'login' ? 'Signing in...' : 'Creating account...'
              : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-paymo-blue font-semibold hover:underline">
                Sign up for free
              </Link>
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-paymo-blue font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link to="/" className="text-gray-400 text-xs hover:text-gray-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
