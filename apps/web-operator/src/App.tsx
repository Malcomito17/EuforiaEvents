import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { EventListPage, EventFormPage, EventDetailPage, EventQRPage } from '@/pages/Events'
import { VenueListPage, VenueFormPage } from '@/pages/Venues'
import { ClientListPage, ClientFormPage } from '@/pages/Clients'

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } 
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Events */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Layout>
              <EventListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/new"
        element={
          <ProtectedRoute>
            <Layout>
              <EventFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EventDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EventFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/qr"
        element={
          <ProtectedRoute>
            <Layout>
              <EventQRPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Venues */}
      <Route
        path="/venues"
        element={
          <ProtectedRoute>
            <Layout>
              <VenueListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/venues/new"
        element={
          <ProtectedRoute>
            <Layout>
              <VenueFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/venues/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <VenueFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Clients */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/new"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
