import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './partials/Layout';
import Dashboard from './partials/Dashboard';
import Login from './user/login';
import Signup from './user/signup';
import ProtectedRoute from './partials/ProtectedRoute'; // Importez le composant

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route element={<Layout />}>
          <Route path='/dashboard' element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;