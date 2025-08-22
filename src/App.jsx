import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'

import Account from './pages/Account'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  

  return (
    <>
    <BrowserRouter>
      
            <Routes>
        <Route path='/' element={<Auth />} />
        <Route path='/auth' element={<Auth />} />
        
        <Route path='/home' element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path='/account' element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
