import { useState } from 'react'
import { Routes, BrowserRouter, Route, Navigate, useLocation } from "react-router-dom";
import Layout from './partials/Layout';
import Dashboard from './partials/Dashboard';
import Login from './user/login';
import Signup from './user/signup';


function App() {

  return (
    <>
    <BrowserRouter>
        <Routes>
          
          <Route path='/' element={<Login/>}></Route>
          <Route path='/signup' element={<Signup/>}></Route>
          <Route element={<Layout />}>
            <Route path='/dashboard' element={<Dashboard/>}></Route>
          </Route>
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;
