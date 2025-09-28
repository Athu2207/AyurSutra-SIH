import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('upcoming');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    nav("/");
  };

  // Fetch doctor profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setDoctorProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching doctor profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDoctorProfile();
  }, []);

  // Fetch appointments for this doctor
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "appointments"), 
      where("doctorId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() });
      });
      setAppointments(appointmentsData);
    });

    return () => unsubscribe();
  }, []);

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment. Please try again.");
    }
  };

  // Filter appointments based on status and date
  const now = new Date();
  
  const upcomingAppointments = appointments.filter(app => {
    const appointmentDate = new Date(`${app.date}T${app.time}`);
    return appointmentDate >= now && app.status === 'approved';
  });

  const pendingAppointments = appointments.filter(app => app.status === 'pending');
  
  const pastAppointments = appointments.filter(app => {
    const appointmentDate = new Date(`${app.date}T${app.time}`);
    return appointmentDate < now || app.status === 'completed' || app.status === 'cancelled';
  });

  const displayedAppointments = 
    appointmentFilter === 'upcoming' ? upcomingAppointments :
    appointmentFilter === 'pending' ? pendingAppointments :
    pastAppointments;

  // Stats for dashboard
  const stats = {
    total: appointments.length,
    pending: pendingAppointments.length,
    upcoming: upcomingAppointments.length,
    completed: pastAppointments.filter(app => app.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="doctor-dashboard-loading">
        <div className="loading-spinner">🌿</div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      {/* Header */}
      <div className="doctor-header">
        <div className="doctor-header-content">
          <div className="doctor-welcome">
            <h1>Welcome, Dr. {doctorProfile?.name || 'Doctor'}</h1>
            <p>Manage your appointments and help patients</p>
          </div>
          <div className="doctor-actions">
            <button className="profile-btn" onClick={() => nav('/profile')}>
              My Profile
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.upcoming}</h3>
            <p>Upcoming</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Appointment Management */}
      <div className="appointment-management">
        <div className="management-header">
          <h2>Appointment Management</h2>
          <div className="appointment-filters">
            <button 
              className={appointmentFilter === 'pending' ? 'active' : ''} 
              onClick={() => setAppointmentFilter('pending')}
            >
              ⏳ Pending ({stats.pending})
            </button>
            <button 
              className={appointmentFilter === 'upcoming' ? 'active' : ''} 
              onClick={() => setAppointmentFilter('upcoming')}
            >
              📅 Upcoming ({stats.upcoming})
            </button>
            <button 
              className={appointmentFilter === 'history' ? 'active' : ''} 
              onClick={() => setAppointmentFilter('history')}
            >
              📋 History ({pastAppointments.length})
            </button>
          </div>
        </div>

        <div className="appointments-list">
          {displayedAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No appointments found</h3>
              <p>
                {appointmentFilter === 'pending' ? 'No pending appointment requests' :
                 appointmentFilter === 'upcoming' ? 'No upcoming appointments' :
                 'No appointment history'}
              </p>
            </div>
          ) : (
            displayedAppointments.map(app => (
              <div key={app.id} className={`appointment-card ${app.status}`}>
                <div className="appointment-main-info">
                  <div className="patient-avatar">👤</div>
                  <div className="appointment-details">
                    <h4>Patient: {app.patientName}</h4>
                    <div className="appointment-meta">
                      <span className="date-time">
                        📅 {app.date} at ⏰ {app.time}
                      </span>
                      <span className={`status-badge ${app.status}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="appointment-reason">
                      <strong>Reason:</strong> {app.reason}
                    </p>
                    {app.createdAt && (
                      <p className="appointment-created">
                        Requested: {new Date(app.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons based on status */}
                <div className="appointment-actions">
                  {app.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateAppointmentStatus(app.id, 'approved')}
                        className="btn-approve"
                      >
                        ✅ Approve
                      </button>
                      <button 
                        onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                        className="btn-cancel"
                      >
                        ❌ Decline
                      </button>
                    </>
                  )}
                  
                  {app.status === 'approved' && (
                    <button 
                      onClick={() => updateAppointmentStatus(app.id, 'completed')}
                      className="btn-complete"
                    >
                      📝 Mark Complete
                    </button>
                  )}
                  
                  {(app.status === 'cancelled' || app.status === 'completed') && (
                    <span className="action-completed">
                      {app.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => nav('/schedule')}>
            📅 Set Availability
          </button>
          <button className="action-btn" onClick={() => nav('/patients')}>
            👥 My Patients
          </button>
          <button className="action-btn" onClick={() => nav('/reports')}>
            📊 Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;