import { getFirestore } from 'firebase/firestore';
import React, { useEffect, useRef,useState } from 'react';
import { FaMapMarkedAlt, FaUserMd, FaClinicMedical, FaVideo, FaHeartbeat } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import "./Dashboard.css";
import { useNavigate, useLocation } from 'react-router-dom';
import health from "./assets/Healthy.jpeg";
import background from "./assets/Background.png";
import video from "./assets/VideoConsult.webp";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function Dashboard(){
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardRef = useRef(null);
  const cardRefs = useRef([]);
  const sidePanelRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  {/* report analyzer */}
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a PDF report.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/analyze_report/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing report");
    }
    setLoading(false);
  };

  {/* user creation/login*/}
  const username = location.state?.name;
  const userEmail = location.state?.email;
  
  useEffect(() => {
    // Side panel animation
    gsap.from(sidePanelRef.current, {
      x: 0,
      opacity: 100,
      duration: 1,
      ease: "power3.out"
    });

    // Header animation
    gsap.from(".header h1, .header h3, .header p, .header img", {
      y: 50,
      opacity: 100,
      stagger: 0.1,
      duration: 0.8,
      delay: 0.3
    });

    // Card animations with ScrollTrigger
    cardRefs.current.forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        y: 50,
        opacity: 100,
        duration: 0.8,
        delay: index * 0.1
      });
    });

    // Specialties section animation
    gsap.from(".doctors-list h1", {
      scrollTrigger: {
        trigger: ".doctors-list",
        start: "top 80%"
      },
      x: -50,
      opacity: 100,
      duration: 0.8
    });

    gsap.from(".buttons-available-cards button", {
      scrollTrigger: {
        trigger: ".buttons-available-cards",
        start: "top 80%"
      },
      y: 20,
      opacity: 100,
      stagger: 0.05,
      duration: 0.5
    });

    // About us section animation
    gsap.from(".about-us-info h1", {
      scrollTrigger: {
        trigger: ".about-us-info",
        start: "top 80%"
      },
      x: -50,
      opacity: 100,
      duration: 0.8
    });

    gsap.from(".about-us-card-1", {
      scrollTrigger: {
        trigger: ".about-us-card-1",
        start: "top 80%"
      },
      x: -80,
      opacity: 100,
      duration: 2
    });

    gsap.from(".about-us-card-2", {
      scrollTrigger: {
        trigger: ".about-us-card-2",
        start: "top 80%"
      },
      x: 50,
      opacity: 100,
      duration: 2,
      delay: 5
    });

  }, []);

  const addToCardRefs = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  const specialties = [
    "Cardiology", "Dermatology", "Neurology", "Pediatrics", 
    "Orthopedics", "Ophthalmology", "Dentistry", "Psychiatry",
    "Endocrinology", "Gastroenterology", "Urology", "Oncology",
    "Rheumatology", "Pulmonology", "ENT", "Gynecology",
    "Nephrology", "Hematology", "Allergy", "Physiotherapy"
  ];

  return(
    <div className='outer-main-form' ref={dashboardRef}>
      <div className="side" ref={sidePanelRef}>
        <p className="logo-text">CURECONNECT</p>
        <div className="logo-container">
          <div className="logo">CC</div>
        </div>

        <button className="side-buttons active">
          <i className="icon">🏠</i>
          <span>Dashboard</span>
        </button>

        <button className="side-buttons" onClick={() => navigate("/ayursutra")}>
          <i className="icon">🌿</i>
          <span>CureVeda</span>
        </button>

        <button
          className="side-buttons"
          onClick={() =>
            navigate("/appts",{
              state: {
                patientName: username,
                patientEmail: userEmail,
                doctorEmail: "doctor1@cureconnect.com"
              }
            })
          }
        >
          <i className="icon">📅</i>
          <span>Appointments</span>
        </button>

        <button className="side-buttons">
          <i className="icon"><FaUserMd /></i>
          <span>Doctors</span>
        </button>

        <button className="side-buttons" onClick={() => navigate("/bmi")}>
          <i className="icon">📋</i>
          <span>BMI Calculator</span>
        </button>

        <button className="side-buttons">
          <i className="icon">💊</i>
          <span>MediMart (soon)</span>
        </button>

        <button className="side-buttons" onClick={()=>navigate("/prescription")}>
          <i className="icon">🧾</i>
          <span>Prescripto</span>
        </button>

        <button className="side-buttons" onClick={() => navigate("/map")}>
          <FaMapMarkedAlt className="icon"/>
          <span>Hospital-Locator</span>
        </button>

        <button className="side-buttons" onClick={() => navigate("/reports")}>
          <i className="icon">📊</i>
          <span>Your Reports</span>
        </button>


      </div>
      

      <div className="main-content">
        <div className="header">
          <h1>Welcome to CureConnect</h1>
          <h3>Welcome, {username}</h3>
          <p>Your health, our priority</p>
          <div className="profile-container">
            <img src={health} alt="profile" className="profile-image"/>
            <div className="profile-overlay">
              <FaHeartbeat className="heart-icon"/>
            </div>
          </div>
          <hr className="header-divider" />
        </div>

        <div className="card-content">
      <div className="cards-container">
        <div className="section-title">
          <h2>Book Your Appointment</h2> {/* Centered */}
        </div>
            <div className="cards-row">
              <div className="card" ref={addToCardRefs}>
                <div className="card-image">
                  <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="In-Clinic Visit"/>
                  <div className="image-overlay">
                    <span><FaClinicMedical className="overlay-icon"/> In-Person Care</span>
                  </div>
                </div>
                <div className="card-body">
                  <h3>In-Clinic Consultation</h3>
                  <p>Visit our specialists for personalized care at our state-of-the-art facilities</p>
                  <button
                    className="book-button"
                    onClick={() =>
                      navigate("/appointment", {
                        state: {
                          patientName: username,
                          patientEmail: userEmail,
                          doctorEmail: "clinic@cureconnect.com"
                        }
                      })
                    }
                  >
                    Book In-Clinic Appointment
                  </button>
                </div>
              </div>

              <div className="card" ref={addToCardRefs}>
                <div className="card-image">
                  <img src={video} alt="Video Consultation" />
                  <div className="image-overlay">
                    <span><FaVideo className="overlay-icon"/> Remote Care</span>
                  </div>
                </div>
                <div className="card-body">
                  <h3>Video Consultation</h3>
                  <p>Connect with our experts from the comfort of your home through secure video calls</p>
                  <button
                    className="book-button"
                    onClick={() =>
                      navigate("/appointment", {
                        state: {
                          patientName: username,
                          patientEmail: userEmail,
                          doctorEmail: "video@cureconnect.com"
                        }
                      })
                    }
                  >
                    Book Online Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="doctors-list">
          <h1>Specialities</h1>
          <hr className="section-divider" />
          <div className="buttons-available-cards">
            {specialties.map((specialty, index) => (
              <button key={index} className="specialty-button">
                {specialty}
              </button>
            ))}
          </div>
        </div>

        <div className="about-us-info">
          <h1>Our Priorities</h1>
          <hr className="section-divider" />
        </div>

        <div className="card-to-show">
          <div className="about-us-card-1" ref={addToCardRefs}>
            <h3>Comprehensive Care</h3>
            <p>We prioritize your well-being with seamless digital checkups — bringing trusted care to your fingertips.</p>
          </div>
          <div className="about-us-card-2" ref={addToCardRefs}>
            <h3>Patient-Centered Approach</h3>
            <p>Putting your health first, with digital checkups that bring expert care closer than ever.</p>
          </div>
        </div>

        <div className="ai-features-section">
          <h1>CureConnect meets AI</h1>
          <hr className="section-divider" />
          <div className="report-analyzer-container">
              <h2>🩺 Medical Report Analyzer</h2>

              <div className="upload-section">
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload & Analyze</button>
              </div>

              {loading && <p className="loading-text">⏳ Analyzing report...</p>}

              {result && (
                <div className="analysis-card">
                  <h3>📊 Analysis Result</h3>
                  <p><b>Condition:</b> {result.condition}</p>
                  <p><b>Precautions:</b> {result.precautions}</p>
                  <p><b>Cure:</b> {result.cure}</p>

                  <h4>👨‍⚕️ Recommended Doctors:</h4>
                  <ul>
                    {result.recommended_doctors?.map((doc, idx) => (
                      <li key={idx}>
                        {doc.name} — {doc.specialty} ({doc.location})
                      </li>
                    ))}
                  </ul>

                  {result.sos_trigger && (
                    <div className="sos-alert">
                      ⚠️ <b>EMERGENCY ALERT:</b> Critical condition detected ({result.sos_issue})!
                      <br />
                      <button onClick={() => alert("🚑 Ambulance has been called!")}>
                        🚑 Call Ambulance
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;