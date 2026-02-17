import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import Home from "./pages/Home/Home.tsx";
import App from "./App.tsx";
import CoachDashboard from "./pages/CoachDashboard/CoachDashboard.tsx";
import IndividualAnalysis from "./pages/IndividualAnalysis/IndividualAnalysis.tsx";
import {ToastProvider} from "./contexts/ToastContext/ToastContext.tsx";
import {CookiesProvider} from "react-cookie";
import {ActionsProvider} from "./contexts/ActionsContext/ActionsContext.tsx";
import SessionScreen from "./pages/SessionScreen/SessionScreen.tsx";

import PlayerView from "./pages/PlayerView/PlayerView.tsx";

createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <ActionsProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App/>}>
              <Route path={"/"} element={<Home/>}/>
              <Route path={"/coach-dashboard"} element={<CoachDashboard/>}/>
              <Route path={"/individual-analysis"} element={<IndividualAnalysis/>}/>
              <Route path={"/player/:id"} element={<PlayerView/>}/>
              <Route path={"/session-screen"} element={<SessionScreen />}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ActionsProvider>
  </CookiesProvider>
)
