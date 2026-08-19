import './App.css'
import Footer from './components/layout/Footer/Footer.tsx';
import Navbar from './components/layout/Navbar/Navbar.tsx'
import {Outlet} from "react-router";
import {useAxiosInterceptor} from "./hooks/useAxiosInterceptor.ts";
import {useScrollToTop} from "./hooks/useScrollToTop.ts";

function App() {
  useAxiosInterceptor();
  useScrollToTop();

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default App
