import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function QRPay() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('my') // 'my' | 'scan'
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [scanError, setScanError] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [amount, setAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const scannerRef = useRef(null)
  const scannerInstanceRef = useRef(null)

  // Generate QR on mount
  useEffect(() => {
    if (user && profile) generateQR()
  }, [user, profile])

  // Start/stop scanner based on tab
  useEffect(() => {
    if (tab === 'scan') {
      startScanner()
    } else {
      stopScanner()
    }
    return () => stopScanner()
  }, [tab])

  async function generateQR() {
    try {
      const QRCode = (await import('qrcode')).default
      const payload = JSON.stringify({
        type: 'paymo_payment',
        userId: user.id,
        name: profile.full_name,
        phone: profile.phone,
      })
      const url = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: '#0A2FA3', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
      setQrDataUrl(url)
    } catch (err) {
      console.error('QR generation failed:', err)
    }
  }

  async function startScanner() {
    setScanError('')
    setScanResult(null)
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      if (scannerRef.current && !scannerInstanceRef.current) {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
          false
        )
        scanner.render(handleScanSuccess, handleScanError)
        scannerInstanceRef.current = scanner
      }
    } catch (err) {
      setScanError('Camera not available. Please allow camera access.')
    }
  }

  function stopScanner() {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.clear().catch(() => {})
      scannerInstanceRef.current = null
    }
  }

  function handleScanError(err) {
    // Ignore benign scan errors
  }

  async function handleScanSuccess(decodedText) {
    stopScanner()
    try {
      const data = JSON.parse(decodedText)
      if (data.type !== 'paymo_payment') {
        setScanError('Invalid QR code. This is not a PayMo payment code.')
        return
      }
      if (data.userId === user.id) {
        setScanError('You cannot pay yourself!')
        return
      }
      setScanResult(data)
    } catch {
      setScanError('Could not read QR code. Please try again.')
    }
  }

  async function handleQRPay() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (amt > (profile?.balance || 0)) {
      setScanError('Insufficient balance.')
      return
    }
    setPaying(true)

    // Deduct from sender
    await supabase
      .from('profiles')
      .update({ balance: profile.balance - amt })
      .eq('id', user.id)

    // Credit recipient
    const { data: recipData } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', scanResult.userId)
      .single()

    await supabase
      .from('profiles')
      .update({ balance: (recipData?.balance || 0) + amt })
      .eq('id', scanResult.userId)

    // Log transaction
    await supabase.from('transactions').insert({
      from_user: user.id,
      to_user: scanResult.userId,
      amount: amt,
      description: `QR payment to ${scanResult.name}`,
      type: 'p2p',
      status: 'completed',
    })

    await refreshProfile()
    setPaySuccess(true)
    setPaying(false)
  }

  return (
    <div className="app-shell min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="font-extrabold text-xl text-gray-900">QR Pay</h1>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => setTab('my')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'my' ? 'bg-white text-paymo-blue shadow-sm' : 'text-gray-500'
            }`}
          >
            My QR Code
          </button>
          <button
            onClick={() => setTab('scan')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'scan' ? 'bg-white text-paymo-blue shadow-sm' : 'text-gray-500'
            }`}
          >
            Scan & Pay
          </button>
        </div>
      </div>

      {/* My QR Tab */}
      {tab === 'my' && (
        <div className="px-5 pt-6 flex flex-col items-center">
          <p className="text-gray-500 text-sm text-center mb-6">
            Share this code to receive payments from anyone using PayMo.
          </p>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Your PayMo QR code" className="w-56 h-56 rounded-2xl" />
            ) : (
              <div className="w-56 h-56 rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
                <span className="text-gray-400 text-sm">Generating...</span>
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="font-bold text-gray-900 text-lg">{profile?.full_name}</p>
              <p className="text-gray-400 text-sm">{profile?.phone}</p>
            </div>
          </div>

          <div className="mt-6 bg-paymo-light rounded-2xl px-5 py-4 w-full text-center">
            <p className="text-paymo-blue text-sm font-medium">
              💡 Point your QR code at any PayMo user's camera to receive payment instantly.
            </p>
          </div>

          <button
            onClick={generateQR}
            className="btn-secondary mt-4 max-w-xs"
          >
            Refresh QR Code
          </button>
        </div>
      )}

      {/* Scan Tab */}
      {tab === 'scan' && (
        <div className="px-5 pt-6">
          {paySuccess ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-9 h-9 text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Sent!</h2>
              <p className="text-gray-500 mb-6">
                <span className="font-bold text-paymo-blue">${parseFloat(amount).toFixed(2)} TTD</span> to {scanResult?.name}
              </p>
              <button onClick={() => navigate('/app')} className="btn-primary max-w-xs">
                Back to Home
              </button>
            </div>
          ) : scanResult ? (
            <div>
              <div className="card text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-paymo-blue flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-xl">{scanResult.name?.charAt(0)}</span>
                </div>
                <p className="font-bold text-gray-900 text-lg">{scanResult.name}</p>
                <p className="text-gray-400 text-sm">{scanResult.phone}</p>
              </div>

              <p className="text-gray-500 text-sm text-center mb-3">Enter amount to pay (TTD)</p>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field text-center text-2xl font-bold mb-4"
                min="0.01"
                step="0.01"
              />

              {scanError && <p className="text-red-500 text-sm text-center mb-3">{scanError}</p>}

              <button
                onClick={handleQRPay}
                disabled={!amount || paying}
                className="btn-primary mb-3"
              >
                {paying ? 'Processing...' : `Pay $${amount || '0.00'} TTD`}
              </button>
              <button
                onClick={() => { setScanResult(null); startScanner() }}
                className="btn-secondary"
              >
                Scan Again
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 text-sm text-center mb-4">
                Point your camera at a PayMo QR code to pay
              </p>
              {scanError && (
                <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
                  <p className="text-red-600 text-sm text-center">{scanError}</p>
                </div>
              )}
              <div
                id="qr-reader"
                ref={scannerRef}
                className="rounded-3xl overflow-hidden border border-gray-200"
              />
              <p className="text-gray-400 text-xs text-center mt-3">
                Allow camera access when prompted
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
