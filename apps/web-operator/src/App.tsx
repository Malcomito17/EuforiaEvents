import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { ChangePasswordPage } from '@/pages/ChangePassword'
import { EventListPage, EventFormPage, EventDetailPage, EventQRPage, EventSettingsPage, EventInvitadosPage } from '@/pages/Events'
import { VenueListPage, VenueFormPage } from '@/pages/Venues'
import { ClientListPage, ClientFormPage } from '@/pages/Clients'
import { MusicaDJPage } from '@/pages/MusicaDJ'
import { KaraokeyaPage } from '@/pages/Karaokeya'
import { SongListPage, SongFormPage } from '@/pages/KaraokeSongs'
import { UserListPage, UserFormPage } from '@/pages/Users'
import { ParticipantsListPage, ParticipantDetailPage } from '@/pages/Participants'
import { DJEvents, DJMusicaDJ, DJKaraokeYa } from '@/pages/DJ'

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

      {/* Change Password */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <Layout>
              <ChangePasswordPage />
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
      <Route
        path="/events/:id/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <EventSettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/invitados"
        element={
          <ProtectedRoute>
            <Layout>
              <EventInvitadosPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* MUSICADJ */}
      <Route
        path="/events/:eventId/musicadj"
        element={
          <ProtectedRoute>
            <Layout>
              <MusicaDJPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* KARAOKEYA */}
      <Route
        path="/events/:eventId/karaokeya"
        element={
          <ProtectedRoute>
            <Layout>
              <KaraokeyaPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* PARTICIPANTS - Sección global (no atada a evento específico) */}
      <Route
        path="/participants"
        element={
          <ProtectedRoute>
            <Layout>
              <ParticipantsListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/participants/:guestId"
        element={
          <ProtectedRoute>
            <Layout>
              <ParticipantDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Karaoke Songs */}
      <Route
        path="/karaoke-songs"
        element={
          <ProtectedRoute>
            <Layout>
              <SongListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/karaoke-songs/new"
        element={
          <ProtectedRoute>
            <Layout>
              <SongFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/karaoke-songs/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <SongFormPage />
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

      {/* Users */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <UserListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute>
            <Layout>
              <UserFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <UserFormPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* DJ Routes */}
      <Route
        path="/dj/events"
        element={
          <ProtectedRoute>
            <DJEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dj/events/:eventId/musicadj"
        element={
          <ProtectedRoute>
            <DJMusicaDJ />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dj/events/:eventId/karaokeya"
        element={
          <ProtectedRoute>
            <DJKaraokeYa />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
