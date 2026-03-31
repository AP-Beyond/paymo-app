import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Send from './pages/Send'
import QRPay from './pages/QRPay'
import Bills from './pages/Bills'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      {children}
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />

      {/* Protected App Routes */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/app/send" element={
        <ProtectedRoute>
          <AppLayout><Send /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/app/qr" element={
        <ProtectedRoute>
          <AppLayout><QRPay /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/app/bills" element={
        <ProtectedRoute>
          <AppLayout><Bills /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
