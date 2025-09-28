// AppointmentScheduler.jsx
import React, { useState, useEffect } from 'react';
import AppointmentForm from './AppointmentForm';
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from "./firebase";

const AppointmentScheduler = ({ userRole, onClose }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('upcoming');

  // Fetch doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);
        const doctorsList = [];
        querySnapshot.forEach((doc) => {
          doctorsList.push({ id: doc.id, ...doc.data() });
        });
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch appointments based on user role
  useEffect(() => {
    if (!auth.currentUser) return;

    let q;
    if (userRole === 'doctor') {
      q = query(collection(db, "appointments"), where("doctorId", "==", auth.currentUser.uid));
    } else {
      q = query(collection(db, "appointments"), where("patientId", "==", auth.currentUser.uid));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() });
      });
      setAppointments(appointmentsData);
    });

    return () => unsubscribe();
  }, [userRole]);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  const handleBookAppointment = async (date, time, reason) => {
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: auth.currentUser.uid,
        patientName: auth.currentUser.displayName || "Patient",
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date,
        time,
        reason,
        status: 'pending',
        createdAt: new Date()
      });
      handleBookingSuccess();
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  // Filter appointments based on status
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

  return (
    <div className="appointment-flow-overlay">
      <div className="appointment-flow">
        <button className="close-flow" onClick={onClose}>×</button>
        
        {bookingSuccess && (
          <div className="booking-success">
            <p>Appointment requested successfully! The doctor will confirm shortly.</p>
          </div>
        )}
        
        {/* Appointment Management Section (for doctors) */}
        {userRole === 'doctor' && (
          <div className="ad-appointment-management">
            <h3>Appointment Management</h3>
            <div className="appointment-filters">
              <button 
                className={appointmentFilter === 'pending' ? 'active' : ''} 
                onClick={() => setAppointmentFilter('pending')}
              >
                Pending Requests
              </button>
              <button 
                className={appointmentFilter === 'upcoming' ? 'active' : ''} 
                onClick={() => setAppointmentFilter('upcoming')}
              >
                Upcoming Appointments
              </button>
              <button 
                className={appointmentFilter === 'history' ? 'active' : ''} 
                onClick={() => setAppointmentFilter('history')}
              >
                History
              </button>
            </div>
            
            <div className="appointments-list">
              {displayedAppointments.length === 0 ? (
                <p>No appointments found</p>
              ) : (
                displayedAppointments.map(app => (
                  <div key={app.id} className={`appointment-card ${app.status}`}>
                    <div className="appointment-info">
                      <h4>Patient: {app.patientName}</h4>
                      <p>Date: {app.date} at {app.time}</p>
                      <p>Reason: {app.reason}</p>
                      <p>Status: <span className={`status-badge ${app.status}`}>{app.status}</span></p>
                    </div>
                    
                    {app.status === 'pending' && (
                      <div className="appointment-actions">
                        <button 
                          onClick={() => updateAppointmentStatus(app.id, 'approved')}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                          className="btn-cancel"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Patient view - doctor selection and booking */}
        {userRole !== 'doctor' && !showBookingForm && (
          <>
            <h3>Select a Practitioner</h3>
            <div className="doctor-list">
              {doctors.map(doctor => (
                <div key={doctor.id} className="doctor-card" onClick={() => handleDoctorSelect(doctor)}>
                  <div className="doctor-avatar">👨‍⚕️</div>
                  <div className="doctor-info">
                    <h4>{doctor.name}</h4>
                    <p>{doctor.specialization}</p>
                    <p className="doctor-exp">License: {doctor.license}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {userRole !== 'doctor' && showBookingForm && (
          <AppointmentForm
            doctor={selectedDoctor}
            onCancel={() => setShowBookingForm(false)}
            onBook={handleBookAppointment}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentScheduler;