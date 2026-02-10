import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import Home from "./pages/home/Home.tsx";
import App from "./App.tsx";
import CoachDashboard from "./pages/CoachDashboard/CoachDashboard.tsx";
import IndividualAnalysis from "./pages/IndividualAnalysis/IndividualAnalysis.tsx";
import { ToastProvider } from "./contexts/ToastContext";
import {CookiesProvider} from "react-cookie";


createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
           <Route path={"/"} element={<Home />}/>
           <Route path={"/coach-dashboard"} element={<CoachDashboard />}/>
           <Route path={"/individual-analysis"} element={<IndividualAnalysis />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </CookiesProvider>
)
