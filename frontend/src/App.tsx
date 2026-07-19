import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { PortalLayout } from './components/PortalLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import ProjectsKanban from './pages/ProjectsKanban'
import ProjectDetail from './pages/ProjectDetail'
import Factures from './pages/Factures'
import Notes from './pages/Notes'
import Messages from './pages/Messages'
import PortalMessages from './pages/portal/PortalMessages'
import { ActivityTimelinePage } from './pages/ActivityTimelinePage'
import { CalendarPage } from './pages/CalendarPage'
import { VideoRoomPage } from './pages/VideoRoomPage'
import { VideoRoomsPage } from './pages/VideoRoomsPage'
import PortalProjects from './pages/portal/PortalProjects'
import PortalInvoices from './pages/portal/PortalInvoices'
import { PortalInvoicePayment } from './pages/portal/PortalInvoicePayment'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                background: 'var(--surface)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Espace admin (toi) : gestion complète de l'activité. */}
          <Route
            path="/"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/kanban"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <ProjectsKanban />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/:id"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <ProjectDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/factures"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <Factures />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <Notes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <Messages />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-timeline"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <ActivityTimelinePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <CalendarPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/video-rooms"
            element={
              <ProtectedRoute role="ADMIN">
                <Layout>
                  <VideoRoomsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:roomId"
            element={
              <ProtectedRoute role="ADMIN">
                <VideoRoomPage />
              </ProtectedRoute>
            }
          />

          {/* Portail client : accès restreint en lecture seule. */}
          <Route
            path="/portail"
            element={
              <ProtectedRoute role="CLIENT">
                <PortalLayout>
                  <PortalProjects />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portail/factures"
            element={
              <ProtectedRoute role="CLIENT">
                <PortalLayout>
                  <PortalInvoices />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portail/messages"
            element={
              <ProtectedRoute role="CLIENT">
                <PortalLayout>
                  <PortalMessages />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portail/factures/:invoiceId/paiement"
            element={
              <ProtectedRoute role="CLIENT">
                <PortalLayout>
                  <PortalInvoicePayment />
                </PortalLayout>
              </ProtectedRoute>
            }
          />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
