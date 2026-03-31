import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const BILLERS = [
  { id: 'tstt', name: 'TSTT', category: 'Phone / Internet', emoji: '📞', color: 'bg-blue-50' },
  { id: 'digicel', name: 'Digicel', category: 'Mobile', emoji: '📱', color: 'bg-red-50' },
  { id: 'flow', name: 'FLOW', category: 'Cable / Internet', emoji: '📺', color: 'bg-purple-50' },
  { id: 'wasa', name: 'WASA', category: 'Water', emoji: '💧', color: 'bg-cyan-50' },
  { id: 'tntec', name: 'T&TEC', category: 'Electricity', emoji: '⚡', color: 'bg-yellow-50' },
  { id: 'nhdc', name: 'NHDC', category: 'Housing', emoji: '🏠', color: 'bg-green-50' },
]

const STEPS = { SELECT: 'select', DETAILS: 'details', CONFIRM: 'confirm', SUCCESS: 'success' }

export default function Bills() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(STEPS.SELECT)
  const [biller, setBiller] = useState(null)
  const [accountNum, setAccountNum] = useState('')
  const [amount, setAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  function selectBiller(b) {
    setBiller(b)
    setStep(STEPS.DETAILS)
    setError('')
  }

  function handleContinue(e) {
    e.preventDefault()
    if (!accountNum || !amount || parseFloat(amount) <= 0) {
      setError('Please fill in all fields.')
      return
    }
    if (parseFloat(amount) > (profile?.balance || 0)) {
      setError('Insufficient balance.')
      return
    }
    setStep(STEPS.CONFIRM)
    setError('')
  }

  async function confirmPayment() {
    setPaying(true)
    setError('')
    const amt = parseFloat(amount)

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - amt })
      .eq('id', user.id)

    if (updateErr) {
      setError('Payment failed. Please try again.')
      setPaying(false)
      return
    }

    await supabase.from('transactions').insert({
      from_user: user.id,
      to_user: user.id, // bill payments are self-transactions logged for history
      amount: amt,
      description: `${biller.name} – Acct #${accountNum}`,
      type: 'bill',
      status: 'completed',
    })

    await refreshProfile()
    setStep(STEPS.SUCCESS)
    setPaying(false)
  }

  if (step === STEPS.SUCCESS) {
    return (
      <div className="app-shell min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-9 h-9 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Bill Paid!</h2>
        <p className="text-gray-500 mb-1">
          <span className="font-bold text-paymo-blue">${parseFloat(amount).toFixed(2)} TTD</span> paid to
        </p>
        <p className="text-gray-800 font-semibold text-lg mb-1">{biller?.name}</p>
        <p className="text-gray-400 text-sm mb-8">Account #{accountNum}</p>
        <button onClick={() => navigate('/app')} className="btn-primary max-w-xs">
          Back to Home
        </button>
        <button
          onClick={() => { setStep(STEPS.SELECT); setBiller(null); setAccountNum(''); setAmount(''); }}
          className="btn-secondary max-w-xs mt-3"
        >
          Pay Another Bill
        </button>
      </div>
    )
  }

  return (
    <div className="app-shell min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step === STEPS.SELECT ? navigate('/app') : setStep((s) => s === STEPS.CONFIRM ? STEPS.DETAILS : STEPS.SELECT)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h1 className="font-extrabold text-xl text-gray-900">Bill Payments</h1>
            {profile && (
              <p className="text-gray-400 text-xs">Balance: <span className="font-semibold text-gray-600">${Number(profile.balance).toFixed(2)} TTD</span></p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mt-4">
          {[STEPS.SELECT, STEPS.DETAILS, STEPS.CONFIRM].map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${
              [STEPS.SELECT, STEPS.DETAILS, STEPS.CONFIRM].indexOf(step) >= i ? 'bg-paymo-blue' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Step: Select Biller */}
      {step === STEPS.SELECT && (
        <div className="px-5 pt-6">
          <p className="text-gray-500 text-sm mb-4">Choose a service provider to pay</p>
          <div className="grid grid-cols-2 gap-3">
            {BILLERS.map((b) => (
              <button
                key={b.id}
                onClick={() => selectBiller(b)}
                className={`card ${b.color} text-left p-4 hover:shadow-md transition-shadow active:scale-[0.98]`}
              >
                <span className="text-3xl mb-2 block">{b.emoji}</span>
                <p className="font-bold text-gray-900">{b.name}</p>
                <p className="text-gray-500 text-xs">{b.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Details */}
      {step === STEPS.DETAILS && biller && (
        <div className="px-5 pt-6">
          {/* Selected biller chip */}
          <div className={`inline-flex items-center gap-2 ${biller.color} rounded-2xl px-4 py-2 mb-6`}>
            <span className="text-xl">{biller.emoji}</span>
            <span className="font-semibold text-gray-800">{biller.name}</span>
          </div>

          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account / Customer number</label>
              <input
                type="text"
                placeholder="e.g. 12345678"
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment amount (TTD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field pl-8"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Quick amounts</p>
              <div className="flex gap-2">
                {['50', '100', '200', '500'].map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      amount === a
                        ? 'bg-paymo-blue text-white border-paymo-blue'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="btn-primary">
              Continue →
            </button>
          </form>
        </div>
      )}

      {/* Step: Confirm */}
      {step === STEPS.CONFIRM && biller && (
        <div className="px-5 pt-6">
          <div className="card mb-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${biller.color} flex items-center justify-center text-2xl`}>
                {biller.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{biller.name}</p>
                <p className="text-gray-400 text-sm">{biller.category}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Account #</span>
                <span className="font-semibold text-gray-800">{accountNum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-paymo-blue text-lg">${parseFloat(amount).toFixed(2)} TTD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Processing fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="font-semibold text-gray-700">Total deducted</span>
                <span className="font-bold text-gray-900">${parseFloat(amount).toFixed(2)} TTD</span>
              </div>
            </div>
          </div>

          <div className="bg-paymo-light rounded-2xl px-4 py-3 mb-5">
            <p className="text-paymo-blue text-sm">
              💡 Payment will be processed instantly and applied to your {biller.name} account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button onClick={confirmPayment} disabled={paying} className="btn-primary mb-3">
            {paying ? 'Processing...' : `Pay $${parseFloat(amount).toFixed(2)} TTD`}
          </button>
          <button onClick={() => setStep(STEPS.DETAILS)} className="btn-secondary">
            Go Back
          </button>
        </div>
      )}
    </div>
  )
}
