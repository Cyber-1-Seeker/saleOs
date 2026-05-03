import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Clients from '@/pages/Clients/Clients'
import Pipeline from '@/pages/Pipeline/Pipeline'
import Templates from '@/pages/Templates/Templates'
import Catalog from '@/pages/Catalog/Catalog'
import Reminders from '@/pages/Reminders/Reminders'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuth)
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser)
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    loadUser()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="templates" element={<Templates />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="reminders" element={<Reminders />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
