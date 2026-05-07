import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home/Home.tsx";
import App from "./App.tsx";
import CoachDashboard from "./pages/CoachDashboard/CoachDashboard.tsx";
import IndividualAnalysis from "./pages/IndividualAnalysis/IndividualAnalysis.tsx";
import { ToastProvider } from "./contexts/ToastContext/ToastContext.tsx";
import { CookiesProvider } from "react-cookie";
import { ActionsProvider } from "./contexts/ActionsContext/ActionsContext.tsx";
import Sessions from "./pages/Sessions/Sessions.tsx";
import PlayerView from "./pages/PlayerView/PlayerView.tsx";
import SessionView from "./pages/SessionView/SessionView.tsx";
import Rankings from "./pages/Rankings/Rankings.tsx";

createRoot(document.getElementById("root")!).render(
  <CookiesProvider>
    <ActionsProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<Home />} />
              <Route path="/coach-dashboard" element={<CoachDashboard />} />
              <Route path="/player/:id" element={<PlayerView />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/sessions/:id" element={<SessionView />} />
              <Route
                path="/sessions/:id/analysis/individual"
                element={<IndividualAnalysis />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ActionsProvider>
  </CookiesProvider>,
);
