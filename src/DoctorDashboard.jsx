import React, { useEffect } from 'react';
import { FaMapMarkedAlt, FaCalendarAlt, FaUsers, FaChartLine, FaStethoscope, FaHeartbeat, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './DoctorDashboard.css';
import doctor from "./assets/DoctorProfile.jpeg";

function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctorName = location.state?.name || 'Dr. Smith';

  useEffect(() => {
    console.log('location:', location);
  }, [location]);

  return (
    <div className="docdash-main">
      {/* Sidebar */}
      <div className="docdash-sidebar">
        <p>CURECONNECT</p>
        <div className="docdash-logo-container">
          <div className="docdash-logo">CC</div>
        </div>

        <button className="docdash-button active"><span className="icon">🏠</span><span>Dashboard</span></button>
        <button className="docdash-button" onClick={()=>navigate("/docappts", { state: { email: location.state?.email } })}><span className="icon">📅</span><span>Appointments</span></button>
        <button className="docdash-button"><span className="icon">👥</span><span>Patients</span></button>
        <button className="docdash-button"><span className="icon">📊</span><span>Analytics</span></button>
        <button className="docdash-button"><span className="icon">💼</span><span>Schedule</span></button>
        <button className="docdash-button"><span className="icon">📋</span><span>Medical Records</span></button>
        <button className="docdash-button"><span className="icon">💊</span><span>Prescriptions</span></button>
        <button className="docdash-button"><span className="icon">⚙️</span><span>Settings</span></button>
        <button className="docdash-button" onClick={() => navigate('/map')}>
          <FaMapMarkedAlt className="icon" />
          <span>Hospital Locator</span>
        </button>
      </div>

      {/* Header */}
      <div className="docdash-header">
        <img src={doctor} alt="Doctor Profile" />
        <h1>Doctor Portal - CureConnect</h1>
        <h2>Welcome, {doctorName}</h2>
        <p>Providing exceptional healthcare services</p>
      </div>

      {/* Stats */}
      <div className="docdash-cards-container">
        <div className="docdash-cards-row">
          <div className="docdash-card">
            <div className="docdash-card-content">
              <FaUsers style={{ fontSize: '2rem', color: '#1a56db' }} />
              <div style={{ marginLeft: '1rem' }}>
                <h3>24</h3>
                <p>Today's Patients</p>
              </div>
            </div>
          </div>
          <div className="docdash-card">
            <div className="docdash-card-content">
              <FaCalendarAlt style={{ fontSize: '2rem', color: '#1a56db' }} />
              <div style={{ marginLeft: '1rem' }}>
                <h3>8</h3>
                <p>Pending Appointments</p>
              </div>
            </div>
          </div>
          <div className="docdash-card">
            <div className="docdash-card-content">
              <FaChartLine style={{ fontSize: '2rem', color: '#1a56db' }} />
              <div style={{ marginLeft: '1rem' }}>
                <h3>156</h3>
                <p>This Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="docdash-title">
        <h2>Consultation Management</h2>
      </div>

      <div className="docdash-cards-row">
        <div className="docdash-card">
          <div className="docdash-card-image">
            <div className="docdash-image-overlay">In-Person</div>
            <FaStethoscope style={{ fontSize: '6rem', padding: '2rem', color: '#1a56db' }} />
          </div>
          <div className="docdash-card-content">
            <div>
              <h3>In-Clinic Consultations</h3>
              <p>Manage your in-person patient appointments and consultations at the clinic</p>
              <button className="docdash-button">Manage In-Clinic</button>
            </div>
          </div>
        </div>
        <div className="docdash-card">
          <div className="docdash-card-image">
            <div className="docdash-image-overlay">Virtual</div>
            <FaHeartbeat style={{ fontSize: '6rem', padding: '2rem', color: '#1a56db' }} />
          </div>
          <div className="docdash-card-content">
            <div>
              <h3>Virtual Consultations</h3>
              <p>Connect with patients remotely through secure video calls and online consultations</p>
              <button className="docdash-button">Start Video Call</button>
            </div>
          </div>
        </div>
      </div>

      <div className="docdash-title">
        <h2>Professional Excellence</h2>
      </div>

      <div className="docdash-cards-row">
        <div className="docdash-card">
          <div className="docdash-card-content">
            <FaPrescriptionBottleAlt style={{ fontSize: '3rem', color: '#1a56db' }} />
            <p style={{ marginLeft: '1rem' }}>Dedicated to providing exceptional patient care through advanced medical expertise and compassionate service.</p>
          </div>
        </div>
        <div className="docdash-card">
          <div className="docdash-card-content">
            <FaStethoscope style={{ fontSize: '3rem', color: '#1a56db' }} />
            <p style={{ marginLeft: '1rem' }}>Committed to continuous learning and implementing the latest medical practices for optimal patient outcomes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
