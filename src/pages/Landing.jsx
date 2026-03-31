import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const features = [
  {
    icon: '💸',
    title: 'Instant P2P Payments',
    desc: 'Send money to anyone in Trinidad & Tobago in seconds — no bank required.',
  },
  {
    icon: '📱',
    title: 'QR Code Payments',
    desc: 'Generate your PayMo QR or scan a merchant code to pay in one tap.',
  },
  {
    icon: '🧾',
    title: 'Pay Your Bills',
    desc: 'TSTT, Digicel, WASA, T&TEC and more — all in one place.',
  },
  {
    icon: '🔒',
    title: 'Bank-Grade Security',
    desc: 'Biometric auth, TLS encryption, and real-time fraud monitoring keep you safe.',
  },
]

const steps = [
  { step: '01', title: 'Create your account', desc: 'Sign up with your email, phone number, and a secure password in under 2 minutes.' },
  { step: '02', title: 'Add your funds', desc: 'Top up your PayMo Wallet via bank transfer, cash-in at a PayMo ATM Station, or use your debit card.' },
  { step: '03', title: 'Pay & get paid', desc: 'Send money, pay bills, and receive payments instantly — anywhere in the Caribbean.' },
]

export default function Landing() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errMsg, setErrMsg] = useState('')

  async function handleWaitlist(e) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrMsg('')

    const { error } = await supabase.from('waitlist').insert({ email, name })

    if (error) {
      if (error.code === '23505') {
        setErrMsg('You\'re already on the waitlist! We\'ll be in touch soon.')
      } else {
        setErrMsg('Something went wrong. Please try again.')
      }
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-paymo-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-paymo-blue text-xl">PayMo</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-paymo-blue transition-colors">
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-paymo-blue text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-paymo-dark transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-paymo-blue via-[#1040c8] to-paymo-dark text-white">
        <div className="max-w-5xl mx-auto px-5 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-paymo-sky rounded-full animate-pulse" />
            <span className="text-sm text-paymo-sky font-medium">Now in pilot — join the waitlist</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
            Pay Anyone,<br />
            <span className="text-paymo-sky">Anywhere in the Caribbean</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-xl mx-auto mb-10">
            PayMo is a mobile-first digital wallet built for Trinidad & Tobago. Send money, pay bills, and accept payments — all from your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/signup"
              className="bg-paymo-sky text-paymo-blue font-bold px-8 py-4 rounded-2xl hover:bg-white transition-colors text-lg"
            >
              Create free account →
            </Link>
            <a
              href="#waitlist"
              className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors text-lg"
            >
              Join the waitlist
            </a>
          </div>

          {/* Mock Phone UI */}
          <div className="mt-16 flex justify-center">
            <div className="w-64 bg-white/10 border border-white/20 rounded-[2.5rem] p-4 backdrop-blur-sm">
              <div className="bg-paymo-blue rounded-[2rem] overflow-hidden">
                {/* Status bar */}
                <div className="flex justify-between items-center px-4 pt-3 pb-1">
                  <span className="text-white text-xs font-medium">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full border border-white/50" />
                    <div className="w-3 h-3 rounded-full border border-white/50 bg-white/50" />
                  </div>
                </div>
                {/* Balance card */}
                <div className="mx-3 my-2 bg-gradient-to-br from-paymo-sky to-blue-300 rounded-2xl p-4">
                  <p className="text-paymo-blue text-xs font-medium opacity-80">Wallet Balance</p>
                  <p className="text-paymo-blue text-2xl font-extrabold">$2,450.00</p>
                  <p className="text-paymo-blue text-xs mt-1 opacity-60">TTD</p>
                </div>
                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-1 px-3 pb-3 mt-1">
                  {['Send', 'QR Pay', 'Bills', 'More'].map((a) => (
                    <div key={a} className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center" />
                      <span className="text-white text-[8px] font-medium">{a}</span>
                    </div>
                  ))}
                </div>
                {/* Transactions */}
                <div className="bg-white mx-2 mb-2 rounded-2xl p-3">
                  {[
                    { name: 'Marcus B.', amt: '-$120', color: 'text-red-500' },
                    { name: 'T&TEC Bill', amt: '-$85', color: 'text-red-500' },
                    { name: 'Sarah A.', amt: '+$500', color: 'text-green-500' },
                  ].map((t) => (
                    <div key={t.name} className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200" />
                        <span className="text-paymo-blue text-[9px] font-medium">{t.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold ${t.color}`}>{t.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Everything you need to go cashless</h2>
          <p className="text-gray-500 text-lg">Built for the Caribbean. Designed for everyday life.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-paymo-light py-20">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">How PayMo works</h2>
            <p className="text-gray-500 text-lg">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-paymo-blue text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="max-w-5xl mx-auto px-5 py-20">
        <div className="bg-gradient-to-br from-paymo-blue to-paymo-dark rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Be first in line</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto">
            Join our pilot waitlist and get early access to PayMo before we launch to the public.
          </p>

          {status === 'success' ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-sm mx-auto">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-white font-bold text-lg">You're on the list!</p>
              <p className="text-blue-100 text-sm mt-1">We'll reach out with early access details soon.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="max-w-sm mx-auto space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-paymo-sky"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-paymo-sky"
              />
              {status === 'error' && (
                <p className="text-paymo-sky text-sm">{errMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-paymo-sky text-paymo-blue font-bold py-3.5 rounded-2xl hover:bg-white transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining...' : 'Join the waitlist →'}
              </button>
              <p className="text-blue-200 text-xs">No spam. We'll only contact you about PayMo access.</p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-paymo-blue flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-bold text-paymo-blue">PayMo</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 PayMo. Powering cashless payments in the Caribbean.</p>
          <div className="flex gap-5">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Terms</a>
            <a href="mailto:hello@paymo.io" className="text-gray-400 hover:text-gray-600 text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
