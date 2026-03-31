import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const quickActions = [
  { to: '/app/send', icon: '↗', label: 'Send', color: 'bg-blue-50 text-paymo-blue' },
  { to: '/app/qr', icon: '⬛', label: 'QR Pay', color: 'bg-sky-50 text-paymo-sky' },
  { to: '/app/bills', icon: '📄', label: 'Bills', color: 'bg-purple-50 text-purple-600' },
  { to: '/app/send', icon: '↙', label: 'Request', color: 'bg-green-50 text-green-600' },
]

function TxIcon({ type, status }) {
  if (type === 'bill') return <span className="text-lg">🧾</span>
  if (type === 'topup') return <span className="text-lg">💰</span>
  return <span className="text-lg">{status === 'received' ? '↙' : '↗'}</span>
}

export default function Dashboard() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchTransactions()
  }, [user])

  async function fetchTransactions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        from_profile:profiles!transactions_from_user_fkey(full_name),
        to_profile:profiles!transactions_to_user_fkey(full_name)
      `)
      .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) setTxns(data)
    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const balance = profile?.balance ?? 0

  function formatAmount(txn) {
    const isCredit = txn.to_user === user?.id
    const sign = isCredit ? '+' : '-'
    const color = isCredit ? 'text-green-500' : 'text-gray-700'
    return { sign, color, amount: `$${Number(txn.amount).toFixed(2)}` }
  }

  function txnDescription(txn) {
    if (txn.type === 'bill') return txn.description || 'Bill payment'
    if (txn.type === 'topup') return 'Wallet top-up'
    const isCredit = txn.to_user === user?.id
    if (isCredit) return `From ${txn.from_profile?.full_name || 'Someone'}`
    return `To ${txn.to_profile?.full_name || 'Someone'}`
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr)
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(dateStr).toLocaleDateString('en-TT', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="pb-24 overflow-y-auto">
      {/* Header */}
      <div className="bg-paymo-blue px-5 pt-12 pb-28">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-200 text-sm">Good day,</p>
            <h1 className="text-white font-extrabold text-2xl">{firstName} 👋</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>

      {/* Balance Card — overlaps header */}
      <div className="px-4 -mt-20">
        <div className="bg-gradient-to-br from-paymo-sky to-blue-400 rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-paymo-blue font-medium text-sm opacity-80">Wallet Balance</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-paymo-blue font-extrabold text-3xl">
                  {showBalance ? `$${Number(balance).toFixed(2)}` : '••••••'}
                </p>
                <span className="text-paymo-blue text-sm font-medium opacity-60">TTD</span>
              </div>
            </div>
            <button
              onClick={() => setShowBalance((v) => !v)}
              className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-paymo-blue">
                {showBalance
                  ? <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                }
              </svg>
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            <Link to="/app/send" className="flex-1 bg-paymo-blue text-white text-sm font-semibold py-2.5 rounded-2xl text-center hover:bg-paymo-dark transition-colors">
              Send Money
            </Link>
            <button className="flex-1 bg-white/30 text-paymo-blue text-sm font-semibold py-2.5 rounded-2xl hover:bg-white/40 transition-colors">
              Add Money
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-6">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} to={a.to} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-2xl ${a.color} flex items-center justify-center text-xl shadow-sm`}>
                {a.icon}
              </div>
              <span className="text-gray-600 text-xs font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 mt-7">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900 text-base">Recent activity</h2>
          <button onClick={fetchTransactions} className="text-paymo-blue text-sm font-medium">Refresh</button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-300 text-4xl mb-2">💳</p>
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">Send your first payment to get started</p>
            <Link to="/app/send" className="inline-block mt-4 bg-paymo-blue text-white text-sm font-semibold px-5 py-2.5 rounded-2xl">
              Send Money →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {txns.map((txn) => {
              const { sign, color, amount } = formatAmount(txn)
              return (
                <div key={txn.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-paymo-light flex items-center justify-center flex-shrink-0">
                    <TxIcon type={txn.type} status={txn.to_user === user?.id ? 'received' : 'sent'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{txnDescription(txn)}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{timeAgo(txn.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${color}`}>{sign}{amount}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      txn.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
