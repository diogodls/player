import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App.tsx';
import { ToastProvider } from './contexts/ToastContext/ToastContext.tsx';
import { CookiesProvider } from 'react-cookie';
import { ActionsProvider } from './contexts/ActionsContext/ActionsContext.tsx';
import { AuthProvider } from './contexts/AuthContext/AuthContext.tsx';
import ProtectedRoute from './components/layout/ProtectedRoute/ProtectedRoute.tsx';
import AdminRoute from './components/layout/AdminRoute/AdminRoute.tsx';

const AdminUsers = lazy(() => import('./pages/AdminUsers/AdminUsers.tsx'));

const Home = lazy(() => import('./pages/Home/Home.tsx'));
const CoachDashboard = lazy(
  () => import('./pages/CoachDashboard/CoachDashboard.tsx'),
);
const IndividualAnalysis = lazy(
  () => import('./pages/Analysis/IndividualAnalysis/IndividualAnalysis.tsx'),
);
const Sessions = lazy(() => import('./pages/Sessions/Sessions.tsx'));
const PlayerView = lazy(() => import('./pages/PlayerView/PlayerView.tsx'));
const SessionView = lazy(() => import('./pages/SessionView/SessionView.tsx'));
const TeamAnalysis = lazy(
  () => import('./pages/Analysis/TeamAnalysis/TeamAnalysis.tsx'),
);
const AthleteRegistrationScreen = lazy(
  () =>
    import('./pages/AthleteRegistrationScreen/AthleteRegistrationScreen.tsx'),
);
const Rankings = lazy(() => import('./pages/Rankings/Rankings.tsx'));
const Login = lazy(() => import('./pages/Login/Login.tsx'));
const SessionMinutes = lazy(
  () => import('./pages/SessionMinutes/SessionMinutes.tsx'),
);

const SessionComparison = lazy(
  () => import('./pages/SessionComparison/SessionComparison.tsx'),
);

createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <ActionsProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<div role="status">Carregando...</div>}>
              <Routes>
                {/* Rota pública — sem Navbar/Footer */}
                <Route path="/login" element={<Login />} />

                {/* Rotas protegidas — requerem autenticação */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<App />}>
                    <Route element={<AdminRoute />}>
                      <Route path="/admin/users" element={<AdminUsers />} />
                    </Route>
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/coach-dashboard"
                      element={<CoachDashboard />}
                    />
                    <Route path="/player/:id" element={<PlayerView />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/sessions" element={<Sessions />} />
                    <Route
                      path="/sessions/comparison"
                      element={<SessionComparison />}
                    />
                    <Route path="/sessions/:id" element={<SessionView />} />
                    <Route
                      path="/sessions/:id/analysis/individual"
                      element={<IndividualAnalysis />}
                    />
                    <Route
                      path="/sessions/:id/analysis/team"
                      element={<TeamAnalysis />}
                    />
                    <Route
                      path="/sessions/:id/minutes"
                      element={<SessionMinutes />}
                    />
                    <Route
                      path="/athlete-registration"
                      element={<AthleteRegistrationScreen />}
                    />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ActionsProvider>
  </CookiesProvider>
);

