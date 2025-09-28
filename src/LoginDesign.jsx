// LoginDesign.jsx
import React, { useEffect, useState } from 'react';
import "./LoginDesign.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaUserMd, FaLock, FaEnvelope, FaIdCard, FaStethoscope, FaLeaf, FaSpa } from 'react-icons/fa';
import { auth, db } from "./firebase"; // ✅ adjust path if needed
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";

function LoginDesign() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('patient'); 
  const [isSignIn, setIsSignIn] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const navigate = useNavigate();

  const texts = [
    "Balance your doshas with ancient wisdom",
    "Where traditional Ayurveda meets modern care",
    "Personalized wellness journeys",
    "Harmony of mind, body and spirit"
  ];

  // Redirect if already logged in
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // No one is logged in yet, just return or navigate to login if needed
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role || "patient";
        navigate(role === "doctor" ? "/doctor-dashboard" : "/welcome");
      } else {
        navigate("/welcome");
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      navigate("/welcome");
    }
  });

  return () => unsubscribe();
}, [navigate]);
  // Typing animation effect
  useEffect(() => {
    const handleTyping = () => {
      const current = currentIdx % texts.length;
      const fullText = texts[current];
      
      setTypedText(isDeleting 
        ? fullText.substring(0, typedText.length - 1)
        : fullText.substring(0, typedText.length + 1)
      );
      
      setTypingSpeed(isDeleting ? 75 : 150);
      
      if (!isDeleting && typedText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setCurrentIdx((currentIdx + 1) % texts.length);
      }
    };
    
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, currentIdx, texts, typingSpeed]);

  // Floating elements animation
  useEffect(() => {
    const moveElements = () => {
      const elements = document.querySelectorAll('.ayurveda-floating-element');
      elements.forEach(el => {
        const amplitude = parseInt(el.getAttribute('data-amplitude'));
        const duration = parseInt(el.getAttribute('data-duration'));
        const offsetY = Math.sin(Date.now() / (duration * 1000)) * amplitude;
        el.style.transform = `translateY(${offsetY}px)`;
      });
    };
    
    const animationId = requestAnimationFrame(moveElements);
    const intervalId = setInterval(moveElements, 50);
    
    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
    };
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [medicalno, setMedicalno] = useState("");
  const [specialization, setSpecialization] = useState("");


const handlelogin = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔑 Fetch the user's role from Firestore (users collection)
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const role = userDoc.data().role || "patient";

      toast.success("Logged in successfully!");
      if (role === "doctor") {
        navigate("/doctor-dashboard");  // ✅ Doctor goes here
      } else {
        navigate("/welcome");           // ✅ Patient goes here
      }
    } else {
      // fallback if no user doc found, treat as patient
      navigate("/welcome");
    }
  } catch (error) {
    toast.error(error.message);
  }
};


 const handleregister = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: fname,
      email,
      role: "patient",
      createdAt: new Date(),
    });
    toast.success("Patient registered successfully!");
    setIsSignIn(true); // switch back to login
  } catch (error) {
    toast.error(error.message);
  }
};

 const handleregisterdoctors = async (e) => {
  e.preventDefault();
  try {
    const doctorCredential = await createUserWithEmailAndPassword(auth, email, password);

    // ✅ Save doctor in users collection with role field
    await setDoc(doc(db, "users", doctorCredential.user.uid), {
      name: fname,
      email,
      license: medicalno,
      specialization,
      role: "doctor",
      createdAt: new Date(),
    });

    toast.success("Doctor registered successfully!");
    setIsSignIn(true);
  } catch (error) {
    toast.error(error.message);
  }
};

  return (
    <div className="ayurveda-login-container">
      {/* Ayurvedic decorative elements */}
      <div className="ayurveda-decoration">
        <div className="ayurveda-floating-element" data-amplitude="5" data-duration="3">
          <FaLeaf className="ayurveda-decoration-icon ayurveda-leaf-1" />
        </div>
        <div className="ayurveda-floating-element" data-amplitude="7" data-duration="4">
          <FaLeaf className="ayurveda-decoration-icon ayurveda-leaf-2" />
        </div>
        <div className="ayurveda-floating-element" data-amplitude="6" data-duration="5">
          <FaLeaf className="ayurveda-decoration-icon ayurveda-leaf-3" />
        </div>
        <div className="ayurveda-floating-element" data-amplitude="4" data-duration="6">
          <FaSpa className="ayurveda-decoration-icon ayurveda-spice-1" />
        </div>
      </div>
      
      <div className="ayurveda-login-sidebar">
        <div className="ayurveda-sidebar-logo-container">
          <div className="ayurveda-sidebar-logo">
            <FaLeaf />
          </div>
          <h2 className="ayurveda-brand-name">AYURSUTRA</h2>
          <p className="ayurveda-brand-tagline">Ancient Wisdom, Modern Healing</p>
        </div>
        <div className="ayurveda-sidebar-content">
          <div className="ayurveda-sidebar-item">
            <FaLeaf className="ayurveda-sidebar-icon" />
            <h3>Holistic Care</h3>
          </div>
          <div className="ayurveda-sidebar-divider"></div>
          <div className="ayurveda-sidebar-item">
            <FaSpa className="ayurveda-sidebar-icon" />
            <h3>Balance Doshas</h3>
          </div>
          <div className="ayurveda-sidebar-divider"></div>
          <div className="ayurveda-sidebar-item">
            <FaStethoscope className="ayurveda-sidebar-icon" />
            <h3>Expert Guidance</h3>
          </div>
          <div className="ayurveda-sidebar-divider"></div>
          <div className="ayurveda-sidebar-item">
            <FaUserMd className="ayurveda-sidebar-icon" />
            <h3>Personalized Plans</h3>
          </div>
        </div>
      </div>

      <div className="ayurveda-login-main-content">
        <div className="ayurveda-login-image-container">
          <div className="ayurveda-pattern-overlay"></div>
          <div className="ayurveda-login-image-overlay">
            <div className="ayurveda-typing-container">
              <h2>{typedText}</h2>
              <span className="ayurveda-typing-cursor">|</span>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="ayurveda-decorative-lotus ayurveda-floating-element" data-amplitude="3" data-duration="7">
            <FaLeaf className="ayurveda-lotus-icon" />
          </div>
        </div>

        <div className="ayurveda-login-form-container">
          <div className="ayurveda-login-form-card">
            <div className="ayurveda-form-tab-selector">
              <button 
                className={`ayurveda-tab-button ${activeTab === 'patient' ? 'ayurveda-active-tab' : ''}`} 
                onClick={() => setActiveTab('patient')}
              >
                <FaUser className="ayurveda-tab-icon" />
                Patient
              </button>
              <button 
                className={`ayurveda-tab-button ${activeTab === 'doctor' ? 'ayurveda-active-tab' : ''}`} 
                onClick={() => setActiveTab('doctor')}
              >
                <FaUserMd className="ayurveda-tab-icon" />
                Doctor
              </button>
            </div>

            <div className="ayurveda-form-auth-toggle">
              <button 
                className={`ayurveda-auth-toggle-button ${isSignIn ? 'ayurveda-active-toggle' : ''}`} 
                onClick={() => setIsSignIn(true)}
              >
                Login
              </button>
              <button 
                className={`ayurveda-auth-toggle-button ${!isSignIn ? 'ayurveda-active-toggle' : ''}`} 
                onClick={() => setIsSignIn(false)}
              >
                Sign Up
              </button>
            </div>

            {isSignIn ? (
              <form onSubmit={handlelogin} className="ayurveda-login-form">
                <h2 className="ayurveda-form-title">
                  {activeTab === "patient" ? 'Patient Login' : 'Doctor Login'}
                </h2>
                
                <div className="ayurveda-form-input-group">
                  <div className="ayurveda-input-icon">
                    <FaEnvelope />
                  </div>
                  <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    className='ayurveda-form-input' 
                    type='email' 
                    placeholder='Email Address' 
                    required
                  />
                </div>
                
                <div className="ayurveda-form-input-group">
                  <div className="ayurveda-input-icon">
                    <FaLock />
                  </div>
                  <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    className='ayurveda-form-input' 
                    type='password' 
                    placeholder='Password' 
                    required
                  />
                </div>
                
                <button type="submit" className="ayurveda-form-submit-button">
                  {activeTab === "patient" ? 'Patient Login' : 'Doctor Login'}
                </button>
                
                <div className="ayurveda-form-footer-links">
                  <a href="#" className="ayurveda-forgot-password">Forgot password?</a>
                  <p className="ayurveda-auth-switch-text">
                    Don't have an account? 
                    <span onClick={() => setIsSignIn(false)} className="ayurveda-auth-switch-link"> Sign up</span>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={activeTab === 'patient' ? handleregister : handleregisterdoctors} className="ayurveda-login-form">
                <h2 className="ayurveda-form-title">
                  {activeTab === 'patient' ? 'Patient Registration' : 'Doctor Registration'}
                </h2>
                
                <div className="ayurveda-form-input-group">
                  <div className="ayurveda-input-icon">
                    <FaUser />
                  </div>
                  <input 
                    onChange={(e) => setFname(e.target.value)} 
                    className='ayurveda-form-input' 
                    type='text' 
                    placeholder='Full Name' 
                    required
                  />
                </div>
                
                <div className="ayurveda-form-input-group">
                  <div className="ayurveda-input-icon">
                    <FaEnvelope />
                  </div>
                  <input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    className='ayurveda-form-input' 
                    type='email' 
                    placeholder='Email Address'
                    required
                  />
                </div>
                
                <div className="ayurveda-form-input-group">
                  <div className="ayurveda-input-icon">
                    <FaLock />
                  </div>
                  <input 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className='ayurveda-form-input' 
                    type='password' 
                    placeholder='Password'
                    required
                  />
                </div>
                
                {activeTab === 'doctor' && (
                  <>
                    <div className="ayurveda-form-input-group">
                      <div className="ayurveda-input-icon">
                        <FaIdCard />
                      </div>
                      <input
                        className='ayurveda-form-input'
                        type='text'
                        placeholder='Medical License Number'
                        onChange={(e) => setMedicalno(e.target.value)}
                        required
                      />
                    </div>

                    <div className="ayurveda-form-input-group">
                      <div className="ayurveda-input-icon">
                        <FaStethoscope />
                      </div>
                      <input
                        className='ayurveda-form-input'
                        type='text'
                        placeholder='Specialization'
                        onChange={(e) => setSpecialization(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                <button type="submit" className="ayurveda-form-submit-button">
                  {activeTab === 'patient' ? 'Register as Patient' : 'Register as Doctor'}
                </button>
                
                <div className="ayurveda-form-footer-links">
                  <p className="ayurveda-auth-switch-text">
                    Already have an account? 
                    <span onClick={() => setIsSignIn(true)} className="ayurveda-auth-switch-link"> Login</span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="ayurveda-login-footer">
        <p>© Ayursutra - Ancient Wisdom, Modern Healing 2025</p>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default LoginDesign;
