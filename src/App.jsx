import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Setting from './pages/Setting'
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path='/' element={<div>
        {/* <Navbar/> */}
        <Dashboard />
      </div>} />
      <Route path="/dashboard" element={<div>
        {/* <Navbar/> */}
        <Dashboard />
      </div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path='/transactions' element={<div>
        {/* <Navbar/> */}
        <Transactions />
      </div>} />
      <Route path='/budget' element={<div>
        {/* <Navbar/> */}
        <Budget />
      </div>} />
      <Route path='/setting' element={<div>
        {/* <Navbar/> */}
        <Setting />
      </div>} />
    </Routes>
  )
}

export default App
