import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Analytics from './pages/Analytics'
import Auth from './pages/Auth'

import Account from './pages/Account'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Faq from './pages/Faq'
function App() {
  

  return (
    <>
    <BrowserRouter>
      
            <Routes>
        <Route path='/' element={<Auth />} />
        <Route path='/auth' element={<Auth />} />
        
        <Route path='/analytics' element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path='/account' element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path='/faq' element={<Faq />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
