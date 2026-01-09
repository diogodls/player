import './App.css'
import Navbar from './components/layout/Navbar/Navbar.tsx'
import {Outlet} from "react-router";

function App() {

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default App
