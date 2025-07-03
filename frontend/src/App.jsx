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
import TransmissionList from './transmissions/transmissionList';
import DerangementList from './derangement/derangementList';
import TicketList from './tickets/ticketList';
import UserList from './user/userList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route element={<Layout />}>
        <Route path='/user-list' element={
            <ProtectedRoute>
              <UserList/>
            </ProtectedRoute>
          } />
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
          <Route path='/transmission-list' element={
            <ProtectedRoute>
              <TransmissionList/>
            </ProtectedRoute>
          } />
          <Route path='/derangement-list' element={
            <ProtectedRoute>
              <DerangementList/>
            </ProtectedRoute>
          } />
          <Route path='/ticket-list' element={
            <ProtectedRoute>
              <TicketList/>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;