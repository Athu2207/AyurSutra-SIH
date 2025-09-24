import React from 'react'
import LoginDesign from './LoginDesign.jsx'
import { ToastContainer } from 'react-toastify'
import { Route, Router, Routes } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import HospitalFinder from './HospitalFinder.jsx'
import BMI from './BMI.jsx'
import PrescriptionUpload from './PrescriptionUpload.jsx'
import Reports from './Reports.jsx'
import CureVeda from './CureVeda.jsx'
import AyurDashboard from './Ayursutra.jsx'




function App() {
  return (

    <div>
      <Routes>
        <Route path='/' element={<LoginDesign/>}/>
        <Route path="/testing" element={<Dashboard/>}/>
        <Route path="/map" element={<HospitalFinder/>}/>
        <Route path="/bmi" element={<BMI/>}/>
        <Route path='/prescription' element={<PrescriptionUpload/>}/>
        <Route path='/reports' element={<Reports/>}/>
        <Route path='/ayursutra' element={<CureVeda/>}/>
        <Route path='/ayursutra-home' element={<AyurDashboard/>}/>
      </Routes>
      <ToastContainer/>
    </div>

  )
}

export default App