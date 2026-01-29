import './App.css'
import Footer from './components/layout/Footer/Footer.tsx';
import Navbar from './components/layout/Navbar/Navbar.tsx'
import {Outlet} from "react-router";

function App() {

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default App
