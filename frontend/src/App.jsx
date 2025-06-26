import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Layout from './partials/Layout';
import Dashboard from './partials/Dashboard';
import Login from './user/login';
import Signup from './user/signup';
import ProtectedRoute from './partials/ProtectedRoute';
import StationList from './station/stationList';
import AntennesList from './antennes/antennesList';

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
          <Route path='/station-list' element={
            <ProtectedRoute>
              <StationList/>
            </ProtectedRoute>
          } />
          <Route path='/antenne-list' element={
            <ProtectedRoute>
              <AntennesList/>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;