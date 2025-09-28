import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Dashboard.css';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import AppointmentForm from './AppointmentForm';
import AppointmentScheduler from './AppointmentScheduler';
// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const AyurDashboard = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showHerbRain, setShowHerbRain] = useState(false);
  const dashboardRef = useRef(null);
  const cometRef = useRef(null);
  const herbRainRef = useRef(null);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef(null);
  const [showAppointmentFlow, setShowAppointmentFlow] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [userRole, setUserRole] = useState('patient');
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('upcoming');
  const nav = useNavigate();

  const handleLogout = async () => {
  await signOut(auth);
  nav("/"); // redirect to login page after sign-out
};

// Fetch doctors from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);
        const doctorsList = [];
        querySnapshot.forEach((doc) => {
          doctorsList.push({ 
            id: doc.id, 
            name: doc.data().name || 'Unknown Practitioner',
            specialization: doc.data().specialization || 'Ayurvedic Practitioner',
            license: doc.data().license || 'Not specified'
          });
        });
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

   // Check user role
  useEffect(() => {
    const checkUserRole = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'patient');
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
    };

    checkUserRole();
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

  // Check and update completed appointments
  useEffect(() => {
    const now = new Date();
    appointments.forEach(async (app) => {
      if (app.status === 'approved') {
        const appointmentDate = new Date(`${app.date}T${app.time}`);
        if (appointmentDate < now) {
          await updateAppointmentStatus(app.id, 'completed');
        }
      }
    });
  }, [appointments]);


  // Function to handle PDF download
  const handleDownload = async () => {
    if (!pdfRef.current) {
      console.error("Could not find PDF element");
      return;
    }

    try {
      // Use html2canvas to capture the hidden PDF content
      const canvas = await html2canvas(pdfRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8f5f0'
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Ayurvedic_Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze_ayurveda_report/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Error analyzing report:", err);
      setAnalysis({ error: "Failed to analyze report. Try again." });
    } finally {
      setLoading(false);
    }
  };

  // Ayurvedic quiz questions
  const quizQuestions = [
    { id: 1, question: "What best describes your body frame?", options: [
      { text: "Thin, light, bony", value: "vata" },
      { text: "Medium, muscular, well-proportioned", value: "pitta" },
      { text: "Large, solid, gains weight easily", value: "kapha" }
    ]},
    { id: 2, question: "How is your appetite typically?", options: [
      { text: "Irregular, sometimes hungry, sometimes not", value: "vata" },
      { text: "Strong, get hungry if I miss a meal", value: "pitta" },
      { text: "Steady, can skip meals without issue", value: "kapha" }
    ]},
    { id: 3, question: "How do you handle cold weather?", options: [
      { text: "Dislike cold, get cold easily", value: "vata" },
      { text: "Prefer cooler temperatures, handle heat poorly", value: "pitta" },
      { text: "Tolerate cold well, dislike dampness", value: "kapha" }
    ]},
    { id: 4, question: "What describes your sleep pattern?", options: [
      { text: "Light sleeper, easily disturbed", value: "vata" },
      { text: "Moderate sleeper, wake up easily", value: "pitta" },
      { text: "Deep sleeper, hard to wake up", value: "kapha" }
    ]},
    { id: 5, question: "How is your digestion?", options: [
      { text: "Variable, sometimes constipated", value: "vata" },
      { text: "Strong, regular bowel movements", value: "pitta" },
      { text: "Slow, heavy after meals", value: "kapha" }
    ]},
    { id: 6, question: "What describes your personality?", options: [
      { text: "Creative, enthusiastic, anxious at times", value: "vata" },
      { text: "Intense, focused, easily irritated", value: "pitta" },
      { text: "Calm, steady, sometimes lethargic", value: "kapha" }
    ]},
    { id: 7, question: "How is your skin?", options: [
      { text: "Dry, thin, cool to touch", value: "vata" },
      { text: "Warm, oily, prone to rashes", value: "pitta" },
      { text: "Thick, oily, cool and pale", value: "kapha" }
    ]},
    { id: 8, question: "How do you make decisions?", options: [
      { text: "Quickly, but change my mind often", value: "vata" },
      { text: "Decisively, based on logic", value: "pitta" },
      { text: "Slowly, after careful consideration", value: "kapha" }
    ]},
    { id: 9, question: "What describes your energy levels?", options: [
      { text: "Bursts of energy, then fatigue", value: "vata" },
      { text: "Steady energy throughout the day", value: "pitta" },
      { text: "Consistent but sometimes sluggish", value: "kapha" }
    ]},
    { id: 10, question: "How is your hair?", options: [
      { text: "Dry, thin, curly", value: "vata" },
      { text: "Fine, oily, premature graying", value: "pitta" },
      { text: "Thick, oily, wavy or straight", value: "kapha" }
    ]},
    { id: 11, question: "How do you respond to stress?", options: [
      { text: "Worry, anxiety, irregular habits", value: "vata" },
      { text: "Frustration, anger, criticism", value: "pitta" },
      { text: "Avoidance, withdrawal, inaction", value: "kapha" }
    ]},
    { id: 12, question: "What describes your speech pattern?", options: [
      { text: "Fast, enthusiastic, often changing topics", value: "vata" },
      { text: "Clear, precise, persuasive", value: "pitta" },
      { text: "Slow, methodical, few words", value: "kapha" }
    ]}
  ];

  // Start the quiz
  const startQuiz = () => {
    setQuizStarted(true);
  };

  // Handle answer selection
  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz(newAnswers);
    }
  };

  // Complete the quiz and calculate results
  const completeQuiz = (answerData) => {
    setQuizCompleted(true);
    
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(answerData).forEach(answer => {
      scores[answer] += 1;
    });

    const primaryDosha = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    const profile = {
      primaryDosha,
      scores,
      recommendations: generateRecommendations(primaryDosha),
      healthScore: calculateHealthScore(scores)
    };

    setUserProfile(profile);
  };

  const generateRecommendations = (dosha) => {
    const recommendations = {
      vata: [
        "Follow a regular daily routine",
        "Favor warm, moist, and grounding foods",
        "Practice gentle yoga and meditation",
        "Get adequate rest and avoid overexertion",
        "Stay warm in cold, windy weather"
      ],
      pitta: [
        "Avoid excessive heat and steam",
        "Favor cool, refreshing foods",
        "Practice cooling breathing exercises",
        "Avoid excessive competition",
        "Engage in relaxing activities near water"
      ],
      kapha: [
        "Seek variety and new experiences",
        "Engage in regular vigorous exercise",
        "Favor light, warm, and dry foods",
        "Avoid heavy, oily foods",
        "Wake up early and avoid daytime sleep"
      ]
    };

    return recommendations[dosha] || [];
  };

  const calculateHealthScore = (scores) => {
    const total = scores.vata + scores.pitta + scores.kapha;
    const balance = 100 - (Math.max(scores.vata, scores.pitta, scores.kapha) / total * 100 - 33);
    return Math.min(Math.round(balance), 100);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setQuizCompleted(false);
    setUserProfile(null);
  };

  const createCometAnimation = () => {
    const comet = cometRef.current;
    if (!comet) return;
    
    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * window.innerHeight / 2;
    
    gsap.set(comet, { x: randomX, y: randomY, opacity: 0, scale: 0 });
    
    gsap.to(comet, {
      x: randomX + 500,
      y: randomY + 300,
      opacity: 1,
      scale: 1,
      duration: 2,
      ease: "power1.out",
      onComplete: () => {
        gsap.to(comet, {
          opacity: 0,
          scale: 0,
          duration: 1,
          onComplete: createCometAnimation
        });
      }
    });
  };

  const triggerHerbRain = () => {
    setShowHerbRain(true);
    
    const herbs = herbRainRef.current?.children;
    if (herbs) {
      gsap.set(herbs, { y: -100, opacity: 0 });
      
      gsap.to(herbs, {
        y: '+=300',
        opacity: 1,
        duration: 2,
        stagger: 0.1,
        ease: "power1.out",
        onComplete: () => {
          gsap.to(herbs, {
            opacity: 0,
            duration: 1,
            onComplete: () => setShowHerbRain(false)
          });
        }
      });
    }
  };

  useEffect(() => {
    if (quizCompleted) {
      gsap.fromTo(".ad-chart", 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)" }
      );

      gsap.fromTo(".ad-bar-fill", 
        { scaleY: 0, transformOrigin: "bottom center" },
        { scaleY: 1, duration: 1.2, stagger: 0.2, ease: "elastic.out(1, 0.7)", delay: 0.3 }
      );

      gsap.fromTo(".ad-score-circle", 
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.5)" }
      );
    }
  }, [quizCompleted]);

  useEffect(() => {
    createCometAnimation();
    
    gsap.to(".ad-background-element", {
      y: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      stagger: 0.5,
      ease: "sine.inOut"
    });

    gsap.fromTo(".ad-header h2", 
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.2 }
    );
    
    gsap.fromTo(".ad-header p", 
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.4 }
    );
    
    gsap.fromTo(".ad-quiz-card", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.6 }
    );

    gsap.to(".ad-quiz-card, .ad-question-card, .ad-chart-card, .ad-feature-card", {
      y: -10,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  const getCurrentQuestion = () => {
    if (quizQuestions && quizQuestions.length > 0 && currentQuestion < quizQuestions.length) {
      return quizQuestions[currentQuestion];
    }
    return null;
  };

  const currentQ = getCurrentQuestion();

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
    <div className="ad-container" ref={dashboardRef}>
      <button 
        style={{
          padding: "8px 16px",
          backgroundColor: "#b71c1c",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginTop: "10px"
        }}
        onClick={handleLogout}
      >
        Logout
      </button>
      {/* Background with yoga image */}
      <div className="ad-background">
        <div className="ad-background-image"></div>
        <div className="ad-background-overlay"></div>

        {/* Animated background elements */}
        <div className="ad-background-element ad-bg-element-1">🌿</div>
        <div className="ad-background-element ad-bg-element-2">✨</div>
        <div className="ad-background-element ad-bg-element-3">🌸</div>
        <div className="ad-background-element ad-bg-element-4">🍃</div>

        {/* Comet animation element */}
        <div className="ad-comet" ref={cometRef}>✨</div>

        {/* Herb rain container (hidden by default) */}
        {showHerbRain && (
          <div className="ad-herb-rain" ref={herbRainRef}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="ad-herb">🌿</div>
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="ad-header">
        <div className="ad-logo">
          <span className="ad-logo-icon">🌿</span>
          <span className="ad-logo-text">AYURSUTRA</span>
        </div>
        <h2 className="ad-title">Discover Your Ayurvedic Constitution</h2>
        <p className="ad-tagline">
          Take our comprehensive quiz to unlock personalized health insights
          based on <span>ancient wisdom</span>
        </p>
      </div>

      <div className="ad-content">
        {/* Quiz intro card (only when not started and not completed) */}
        {!quizStarted && !quizCompleted && (
          <div className="ad-quiz-intro">
            <div className="ad-quiz-card">
              <div className="ad-quiz-image">
                <div className="ad-image-placeholder">🌱</div>
              </div>
              <h3>Ayurvedic Body Type Analysis</h3>
              <p>
                This 12-question assessment will help determine your unique mind-body constitution (Dosha)
                according to Ayurvedic principles. Discover your dominant energy and receive personalized recommendations.
              </p>
              <div className="ad-features">
                <div className="ad-feature">
                  <span className="ad-feature-icon">⏱️</span>
                  <span>5-7 minute completion</span>
                </div>
                <div className="ad-feature">
                  <span className="ad-feature-icon">📊</span>
                  <span>Detailed analysis</span>
                </div>
                <div className="ad-feature">
                  <span className="ad-feature-icon">🌿</span>
                  <span>Personalized recommendations</span>
                </div>
              </div>
              <button className="ad-cta-button" onClick={startQuiz}>
                <span>Begin Analysis</span>
                <span className="ad-button-icon">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Quiz in progress - replaces the intro card */}
        {quizStarted && !quizCompleted && currentQ && (
          <div className="ad-quiz-intro">
            <div className="ad-quiz-container">
              <div className="ad-quiz-progress">
                <div className="ad-progress-bar">
                  <div
                    className="ad-progress-fill"
                    style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
                <p>Question {currentQuestion + 1} of {quizQuestions.length}</p>
              </div>

              <div className="ad-question-card">
                <h3>{currentQ.question}</h3>
                <div className="ad-options">
                  {currentQ.options.map((option, index) => (
                    <button
                      key={index}
                      className="ad-option-btn"
                      onClick={() => handleAnswer(option.value)}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion message (visible to user) */}
        {quizCompleted && userProfile && (
          <div className="ad-quiz-intro">
            <div className="ad-completion-message">
              <div className="ad-completion-card">
                <div className="ad-completion-icon">✅</div>
                <h3>Quiz Completed!</h3>
                <p>
                  Your personalized Ayurvedic profile is ready.  
                  You can download the detailed report as a PDF.
                </p>

                <div className="ad-completion-actions">
                  <button className="ad-secondary-button" onClick={resetQuiz}>
                    Retake Quiz
                  </button>
                  <button className="ad-cta-button" onClick={handleDownload}>
                    <span>Download PDF Report</span>
                    <span className="ad-button-icon">📄</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Track Your Progress Card - Add this right after the quiz completion section */}
        {/* Track Your Progress Section */}
        <div className="ad-track-progress-section">
          <div className="ad-track-progress-card">
            <div className="ad-track-progress-bg"></div>
            <div className="ad-track-progress-overlay"></div>
            <div className="ad-track-progress-content">
              <div className="ad-track-progress-icon">
                <span className="ad-progress-icon-main">📊</span>
                <span className="ad-progress-icon-accent">🌿</span>
              </div>
              <div className="ad-track-progress-text">
                <h3>Track Your Progress</h3>
                <p>Monitor your Ayurvedic wellness journey with personalized insights, health metrics, and progress tracking</p>
                <div className="ad-progress-features">
                  <span className="ad-progress-feature">
                    <span className="ad-feature-dot"></span>
                    Daily wellness tracking
                  </span>
                  <span className="ad-progress-feature">
                    <span className="ad-feature-dot"></span>
                    Dosha balance monitoring
                  </span>
                  <span className="ad-progress-feature">
                    <span className="ad-feature-dot"></span>
                    Health goal achievements
                  </span>
                </div>
              </div>
              <button className="ad-track-progress-btn" onClick={(e) => {
                e.stopPropagation();
                window.open("https://preview--ayur-flow-lab.lovable.app/");
              }}>
                <span>Start Tracking</span>
                <span className="ad-track-btn-icon">→</span>
              </button>
            </div>
            <div className="ad-progress-glow"></div>
          </div>
        </div>
        
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

        {/* Feature cards (always visible) */}
        <div className="ad-feature-cards">
          {/* New Appointment Scheduler Card */}
          <div className="ad-feature-card">
            <div className="ad-feature-card-bg ad-appointment-bg"></div>
            <div className="ad-feature-card-content">
              <h4>Book Appointment</h4>
              <p>Schedule consultations with certified Ayurvedic practitioners</p>
              <button className="ad-feature-button" onClick={(e) => {
                e.stopPropagation();
                nav("/appointments");
              }}>
                Schedule Now
              </button>
            </div>
          </div>
              
          {/* New Ayurvedic Mart Card */}
          <div className="ad-feature-card" onClick={triggerHerbRain}>
            <div className="ad-feature-card-bg ad-mart-bg"></div>
            <div className="ad-feature-card-content">
              <h4>Ayurvedic Mart</h4>
              <p>Discover authentic herbs, oils, and wellness products</p>
              <button className="ad-feature-button" onClick={(e) => {
                e.stopPropagation();
                nav("/ayurvedic-mart");
              }}>
                Shop Now
              </button>
            </div>
          </div>
            {/*reports*/}
          <div className="ad-feature-card" onClick={triggerHerbRain}>
            <div className="ad-feature-card-bg ad-report-analyzer-bg"></div>
            <div className="ad-feature-card-content">
              <h4>Report Analyzer</h4>
              <p>Upload your previous health reports for personalized Ayurvedic insights</p>
              {!showUpload && (
                <button
                  className="ad-feature-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUpload(true);
                  }}
                >
                  Analyze Reports
                </button>
              )}
              {showUpload && !analysis && (
                <div className="ad-upload-section">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  <button
                    className="ad-feature-button analyze-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyze();
                    }}
                    disabled={!file || loading}
                  >
                    {loading ? "Analyzing..." : file ? "Start Analysis" : "Select a File"}
                  </button>
                </div>
              )}

              {analysis && !analysis.error && (
                <div className="ad-analysis-result">
                  <h5>{analysis.dosha_imbalance}</h5>
                  <p><strong>Condition:</strong> {analysis.condition}</p>
                  <p><strong>Recommendations:</strong> {analysis.recommendations}</p>
                  <p><strong>Herbal Remedies:</strong> {analysis.herbal_remedies}</p>
                  <p><strong>Lifestyle Changes:</strong></p>
                  <ul>
                    {analysis.lifestyle_changes.map((tip, idx) => (
                      <li key={idx}>🌿 {tip}</li>
                    ))}
                  </ul>
                  <h5>Suggested Practitioners</h5>
                  <ul>
                    {analysis.recommended_practitioners.map((doc, idx) => (
                      <li key={idx}>
                        👨‍⚕️ {doc.name} — {doc.specialty} ({doc.location})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis?.error && (
                <p style={{ color: "red" }}>{analysis.error}</p>
              )}
            </div>
          </div>

          <div className="ad-feature-card" onClick={triggerHerbRain}>
            <div className="ad-feature-card-bg ad-diet-plan-bg"></div>
            <div className="ad-feature-card-content">
              <h4>Diet Planner</h4>
              <p>Get customized meal plans based on your dosha and seasonal changes</p>
              <button className="ad-feature-button" onClick={(e)=>nav("/diet-plan")}>Explore Plans</button>
            </div>
          </div>

          <div className="ad-feature-card" onClick={triggerHerbRain}>
            <div className="ad-feature-card-bg ad-herbal-remedies-bg"></div>
            <div className="ad-feature-card-content">
              <h4>Herbal Remedies</h4>
              <p>Discover natural Ayurvedic solutions for common health concerns</p>
              <button className="ad-feature-button" onClick={(e)=>nav("/remedies")}>Browse Remedies</button>
            </div>
          </div>
        </div>
      </div>
    
    {/* Appointments Card - Add this after the Track Your Progress section */}
<div className="ad-appointments-section">
  <div className="ad-appointments-card">
    <div className="ad-appointments-header">
      <div className="ad-appointments-icon">
        <span className="ad-appointments-icon-main">📅</span>
        <span className="ad-appointments-icon-accent">🌿</span>
      </div>
      <div className="ad-appointments-title">
        <h3>My Appointments</h3>
        <p>Manage your scheduled consultations and appointments</p>
      </div>
    </div>

    <div className="ad-appointments-filters">
      <button 
        className={`ad-appointment-filter-btn ${appointmentFilter === 'upcoming' ? 'active' : ''}`}
        onClick={() => setAppointmentFilter('upcoming')}
      >
        Upcoming
      </button>
      <button 
        className={`ad-appointment-filter-btn ${appointmentFilter === 'pending' ? 'active' : ''}`}
        onClick={() => setAppointmentFilter('pending')}
      >
        Pending
      </button>
      <button 
        className={`ad-appointment-filter-btn ${appointmentFilter === 'history' ? 'active' : ''}`}
        onClick={() => setAppointmentFilter('history')}
      >
        History
      </button>
    </div>

    <div className="ad-appointments-list">
      {displayedAppointments.length === 0 ? (
        <div className="ad-no-appointments">
          <span className="ad-no-appointments-icon">📅</span>
          <p>No {appointmentFilter} appointments found</p>
          <button 
            className="ad-book-appointment-btn"
            onClick={() => nav("/appointments")}
          >
            Book Your First Appointment
          </button>
        </div>
      ) : (
        displayedAppointments.map(appointment => (
          <div key={appointment.id} className={`ad-appointment-item ${appointment.status}`}>
            <div className="ad-appointment-main">
              <div className="ad-appointment-details">
                <h4 className="ad-appointment-doctor">
                  Dr. {appointment.doctorName}
                </h4>
                <div className="ad-appointment-meta">
                  <span className="ad-appointment-date">
                    📅 {appointment.date}
                  </span>
                  <span className="ad-appointment-time">
                    ⏰ {appointment.time}
                  </span>
                </div>
                <p className="ad-appointment-reason">
                  <strong>Reason:</strong> {appointment.reason}
                </p>
              </div>
              <div className="ad-appointment-status">
                <span className={`ad-status-badge ad-status-${appointment.status}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
            
            {appointment.status === 'pending' && (
              <div className="ad-appointment-actions">
                <button 
                  className="ad-appointment-cancel-btn"
                  onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                >
                  Cancel Request
                </button>
              </div>
            )}
            
            {appointment.status === 'approved' && (
              <div className="ad-appointment-upcoming-info">
                <span className="ad-upcoming-badge">✅ Confirmed</span>
                <p className="ad-appointment-note">
                  Your appointment is confirmed. Please arrive 10 minutes early.
                </p>
              </div>
            )}
            
            {appointment.status === 'completed' && (
              <div className="ad-appointment-completed-info">
                <span className="ad-completed-badge">✓ Completed</span>
              </div>
            )}
            
            {appointment.status === 'cancelled' && (
              <div className="ad-appointment-cancelled-info">
                <span className="ad-cancelled-badge">✗ Cancelled</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>

    <div className="ad-appointments-footer">
      <button 
        className="ad-view-all-appointments"
        onClick={() => nav("/appointments")}
      >
        View All Appointments
      </button>
    </div>
  </div>
</div>

      {/* Hidden PDF content (not visible on screen) */}
      {quizCompleted && userProfile && (
        <div className="ad-pdf-content" ref={pdfRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', height: '1123px', padding: '40px', backgroundColor: '#f8f5f0', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#2e7d32', fontSize: '32px', marginBottom: '10px' }}>AYURSUTRA</h1>
            <h2 style={{ color: '#333', fontSize: '24px' }}>Ayurvedic Constitution Report</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>Generated on {new Date().toLocaleDateString()}</p>
          </div>
          
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#2e7d32', fontSize: '20px', marginBottom: '15px' }}>Your Primary Dosha</h3>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                padding: '15px 30px',
                backgroundColor: userProfile.primaryDosha === 'vata' ? '#e3f2fd' : 
                                 userProfile.primaryDosha === 'pitta' ? '#ffebee' : '#e8f5e9',
                borderRadius: '50px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: userProfile.primaryDosha === 'vata' ? '#0d47a1' : 
                       userProfile.primaryDosha === 'pitta' ? '#b71c1c' : '#1b5e20',
                marginBottom: '15px'
              }}>
                {userProfile.primaryDosha.toUpperCase()}
              </div>
              <p style={{ color: '#666', fontSize: '16px' }}>
                Your dominant energy is {userProfile.primaryDosha}. This influences your physical characteristics, mental tendencies, and health patterns.
              </p>
            </div>
          </div>
          
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#2e7d32', fontSize: '20px', marginBottom: '15px' }}>Dosha Balance</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', marginBottom: '20px' }}>
              {Object.entries(userProfile.scores).map(([dosha, score]) => (
                <div key={dosha} style={{ textAlign: 'center', width: '30%' }}>
                  <div style={{ 
                    height: `${(score / 12) * 150}px`, 
                    backgroundColor: dosha === 'vata' ? '#bbdefb' : 
                                    dosha === 'pitta' ? '#ffcdd2' : '#c8e6c9',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      top: '-25px', 
                      fontWeight: 'bold',
                      color: dosha === 'vata' ? '#0d47a1' : 
                             dosha === 'pitta' ? '#b71c1c' : '#1b5e20'
                    }}>{score}</span>
                  </div>
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: dosha === 'vata' ? '#e3f2fd' : 
                                    dosha === 'pitta' ? '#ffebee' : '#e8f5e9',
                    borderRadius: '0 0 10px 10px',
                    fontWeight: 'bold',
                    color: dosha === 'vata' ? '#0d47a1' : 
                           dosha === 'pitta' ? '#b71c1c' : '#1b5e20'
                  }}>{dosha.toUpperCase()}</div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <h4 style={{ color: '#2e7d32', fontSize: '18px', marginBottom: '10px' }}>Balance Score</h4>
              <div style={{
                display: 'inline-block',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: userProfile.healthScore > 75 ? '#e8f5e9' : 
                                userProfile.healthScore > 50 ? '#fff8e1' : '#ffebee',
                border: `5px solid ${userProfile.healthScore > 75 ? '#4caf50' : 
                                         userProfile.healthScore > 50 ? '#ffc107' : '#f44336'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: userProfile.healthScore > 75 ? '#2e7d32' : 
                       userProfile.healthScore > 50 ? '#f57f17' : '#c62828'
              }}>
                {userProfile.healthScore}
              </div>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                {userProfile.healthScore > 75 ? 'Excellent balance' : 
                 userProfile.healthScore > 50 ? 'Moderate balance' : 'Needs improvement'}
              </p>
            </div>
          </div>
          
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#2e7d32', fontSize: '20px', marginBottom: '15px' }}>Personalized Recommendations</h3>
            <ul style={{ paddingLeft: '20px' }}>
              {userProfile.recommendations.map((rec, index) => (
                <li key={index} style={{ marginBottom: '10px', color: '#333', fontSize: '16px' }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#2e7d32', fontSize: '20px', marginBottom: '15px' }}>About Your Dosha</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              {userProfile.primaryDosha === 'vata' ? 
                'Vata is characterized by the elements of air and space. Vata types tend to be creative, energetic, and lively when in balance. When out of balance, they may experience anxiety, insomnia, and digestive issues.' :
               userProfile.primaryDosha === 'pitta' ?
                'Pitta is characterized by the elements of fire and water. Pitta types tend to be intelligent, focused, and natural leaders when in balance. When out of balance, they may become irritable, impatient, and suffer from inflammation.' :
                'Kapha is characterized by the elements of earth and water. Kapha types tend to be calm, grounded, and nurturing when in balance. When out of balance, they may become lethargic, resistant to change, and gain weight easily.'
              }
            </p>
          </div>
          
          <div style={{ marginTop: '30px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
            <p>This report is generated based on your responses to the Ayurvedic constitution quiz.</p>
            <p>For personalized guidance, consult with a qualified Ayurvedic practitioner.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AyurDashboard;
