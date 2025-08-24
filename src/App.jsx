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
import ContactUs from './pages/contactus'
import Chatbot from './pages/chatbot'
import SettingsPage from './pages/SettingsPage'
import StartupOrNotPage from './pages/StartupOrNotPage'


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
        <Route path='/contactus' element={<ContactUs />} />
        <Route path='/chatbot' element={<Chatbot />} />
        <Route path='/settings' element={<SettingsPage />} /> 
        <Route path='/startupornot' element={<StartupOrNotPage />} /> 
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
