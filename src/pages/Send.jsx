import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const STEPS = { SEARCH: 'search', AMOUNT: 'amount', CONFIRM: 'confirm', SUCCESS: 'success' }

export default function Send() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(STEPS.SEARCH)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [recipient, setRecipient] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    setError('')

    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .or(`phone.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .neq('id', user.id)
      .limit(5)

    if (err) {
      setError('Search failed. Please try again.')
    } else {
      setSearchResults(data || [])
      if ((data || []).length === 0) setError('No users found. Try a different name or phone number.')
    }
    setSearching(false)
  }

  function selectRecipient(person) {
    setRecipient(person)
    setStep(STEPS.AMOUNT)
    setError('')
  }

  function appendDigit(d) {
    if (d === '.' && amount.includes('.')) return
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return
    setAmount((prev) => (prev === '0' ? d : prev + d))
  }

  function deleteDigit() {
    setAmount((prev) => (prev.length <= 1 ? '' : prev.slice(0, -1)))
  }

  async function handleSend() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (amt > (profile?.balance || 0)) {
      setError('Insufficient balance.')
      return
    }
    setStep(STEPS.CONFIRM)
    setError('')
  }

  async function confirmSend() {
    setSending(true)
    setError('')
    const amt = parseFloat(amount)

    // Deduct from sender
    const { error: senderErr } = await supabase
      .from('profiles')
      .update({ balance: (profile.balance - amt) })
      .eq('id', user.id)

    if (senderErr) {
      setError('Transfer failed. Please try again.')
      setSending(false)
      return
    }

    // Add to recipient
    const { data: recipientData } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', recipient.id)
      .single()

    await supabase
      .from('profiles')
      .update({ balance: (recipientData.balance + amt) })
      .eq('id', recipient.id)

    // Log transaction
    await supabase.from('transactions').insert({
      from_user: user.id,
      to_user: recipient.id,
      amount: amt,
      description: note || `Payment to ${recipient.full_name}`,
      type: 'p2p',
      status: 'completed',
    })

    await refreshProfile()
    setStep(STEPS.SUCCESS)
    setSending(false)
  }

  const digits = [['1','2','3'],['4','5','6'],['7','8','9'],['.','0','⌫']]

  if (step === STEPS.SUCCESS) {
    return (
      <div className="app-shell min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-9 h-9 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Money Sent!</h2>
        <p className="text-gray-500 mb-1">
          <span className="font-bold text-paymo-blue">${parseFloat(amount).toFixed(2)} TTD</span> sent to
        </p>
        <p className="text-gray-800 font-semibold text-lg mb-8">{recipient?.full_name}</p>
        <button onClick={() => navigate('/app')} className="btn-primary max-w-xs">
          Back to Home
        </button>
        <button
          onClick={() => { setStep(STEPS.SEARCH); setAmount(''); setNote(''); setRecipient(null); setSearchResults([]); setSearchQuery('') }}
          className="btn-secondary max-w-xs mt-3"
        >
          Send Again
        </button>
      </div>
    )
  }

  return (
    <div className="app-shell min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => step === STEPS.SEARCH ? navigate('/app') : setStep(STEPS.SEARCH)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="font-extrabold text-xl text-gray-900">Send Money</h1>
        </div>
        {profile && (
          <p className="text-gray-400 text-sm ml-12">Balance: <span className="font-semibold text-gray-700">${Number(profile.balance).toFixed(2)} TTD</span></p>
        )}
      </div>

      {/* Step: Search */}
      {step === STEPS.SEARCH && (
        <div className="px-5 pt-6">
          <p className="text-gray-500 text-sm mb-4">Search by name or phone number</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Name or phone number..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchResults([]); setError('') }}
              className="input-field"
            />
            <button type="submit" disabled={searching} className="bg-paymo-blue text-white px-4 rounded-2xl font-semibold flex-shrink-0 disabled:opacity-50">
              {searching ? '...' : 'Find'}
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Results</p>
              {searchResults.map((person) => (
                <button
                  key={person.id}
                  onClick={() => selectRecipient(person)}
                  className="card w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-full bg-paymo-blue flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{person.full_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{person.full_name}</p>
                    <p className="text-gray-400 text-sm">{person.phone}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300 ml-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Amount */}
      {step === STEPS.AMOUNT && recipient && (
        <div className="px-5 pt-6 flex flex-col">
          {/* Recipient */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-paymo-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">{recipient.full_name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{recipient.full_name}</p>
              <p className="text-gray-400 text-sm">{recipient.phone}</p>
            </div>
          </div>

          {/* Amount display */}
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm mb-1">Enter amount (TTD)</p>
            <p className="text-5xl font-extrabold text-paymo-blue">
              {amount ? `$${amount}` : <span className="text-gray-200">$0</span>}
            </p>
          </div>

          {/* Note */}
          <input
            type="text"
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field mb-4 text-center"
          />

          {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {digits.flat().map((d) => (
              <button
                key={d}
                onClick={() => d === '⌫' ? deleteDigit() : appendDigit(d)}
                className="h-14 rounded-2xl bg-white border border-gray-100 font-semibold text-xl text-gray-800 active:bg-gray-50 transition-colors shadow-sm"
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleSend}
            disabled={!amount || parseFloat(amount) <= 0}
            className="btn-primary"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step: Confirm */}
      {step === STEPS.CONFIRM && recipient && (
        <div className="px-5 pt-6">
          <div className="card mb-5">
            <div className="text-center pb-4 border-b border-gray-100 mb-4">
              <div className="w-14 h-14 rounded-full bg-paymo-blue flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xl">{recipient.full_name?.charAt(0)}</span>
              </div>
              <p className="text-gray-500 text-sm">Sending to</p>
              <p className="font-bold text-gray-900 text-lg">{recipient.full_name}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-paymo-blue text-lg">${parseFloat(amount).toFixed(2)} TTD</span>
              </div>
              {note && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Note</span>
                  <span className="font-medium text-gray-700">{note}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button onClick={confirmSend} disabled={sending} className="btn-primary mb-3">
            {sending ? 'Sending...' : `Confirm & Send $${parseFloat(amount).toFixed(2)}`}
          </button>
          <button onClick={() => setStep(STEPS.AMOUNT)} className="btn-secondary">
            Go Back
          </button>
        </div>
      )}
    </div>
  )
}
