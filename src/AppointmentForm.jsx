import React, { useState } from 'react';
import './AppointmentForm.css'; // Add this import
const AppointmentForm = ({ doctor, onCancel, onBook }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (date && time && reason) {
      onBook(date, time, reason);
    }
  };

  // Generate time slots (9 AM to 5 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour !== 17) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="appointment-form-container">
      <div className="appointment-form-header">
        <h3>Book Appointment with Dr. {doctor?.name}</h3>
        <p>{doctor?.specialization}</p>
      </div>

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-group">
          <label htmlFor="date">Preferred Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Preferred Time</label>
          <select
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="form-select"
          >
            <option value="">Select a time</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Consultation</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please describe your health concerns..."
            required
            className="form-textarea"
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="ad-secondary-button"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="ad-cta-button"
            disabled={!date || !time || !reason}
          >
            <span>Book Appointment</span>
            <span className="ad-button-icon">📅</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;