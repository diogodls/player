import {createRoot} from 'react-dom/client'
import {lazy, Suspense} from 'react'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import Home from "./pages/Home/Home.tsx";
import App from "./App.tsx";
import CoachDashboard from "./pages/CoachDashboard/CoachDashboard.tsx";
import IndividualAnalysis from "./pages/Analysis/IndividualAnalysis/IndividualAnalysis.tsx";
import {ToastProvider} from "./contexts/ToastContext/ToastContext.tsx";
import {CookiesProvider} from "react-cookie";
import {ActionsProvider} from "./contexts/ActionsContext/ActionsContext.tsx";
import Sessions from "./pages/Sessions/Sessions.tsx";
import PlayerView from "./pages/PlayerView/PlayerView.tsx";
import SessionView from "./pages/SessionView/SessionView.tsx";
import TeamAnalysis from "./pages/Analysis/TeamAnalysis/TeamAnalysis.tsx";
import AthleteRegistrationScreen from "./pages/AthleteRegistrationScreen/AthleteRegistrationScreen.tsx";
import Rankings from "./pages/Rankings/Rankings.tsx";

const SessionComparison = lazy(
  () => import("./pages/SessionComparison/SessionComparison.tsx"),
);

createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <ActionsProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App/>}>
              <Route path={"/"} element={<Home/>}/>
              <Route path={"/coach-dashboard"} element={<CoachDashboard/>}/>
              <Route path={"/player/:id"} element={<PlayerView/>}/>
              <Route path="/rankings" element={<Rankings/>}/>
              <Route path={"/sessions"} element={<Sessions />}/>
              <Route
                path="/sessions/comparison"
                element={
                  <Suspense fallback={<div role="status">Carregando comparação...</div>}>
                    <SessionComparison />
                  </Suspense>
                }
              />
              <Route path="/sessions/:id" element={<SessionView />} />
              <Route path="/sessions/:id/analysis/individual" element={<IndividualAnalysis />} />
              <Route path="/sessions/:id/analysis/team" element={<TeamAnalysis />} />
              <Route path={"/athlete-registration"} element={<AthleteRegistrationScreen />}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ActionsProvider>
  </CookiesProvider>
)
