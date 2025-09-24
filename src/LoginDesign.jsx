import React, { useEffect, useState } from 'react';
import "./LoginDesign.css";
import { ToastContainer, toast } from 'react-toastify';
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import doctor from "./assets/Doctor.png";
import logo from "./assets/LOGO.png";
import { FaUser, FaUserMd, FaLock, FaEnvelope, FaIdCard, FaStethoscope } from 'react-icons/fa';

function LoginDesign() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('patient'); 
  const [isSignIn, setIsSignIn] = useState(true);

  const texts = [
    "Your medical needs are now just a click away!",
    "Find the best doctors near you!",
    "Book appointments in seconds!",
    "Your health, our priority!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % texts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [texts.length]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [medicalno, setMedicalno] = useState("");
  const [specialization, setSpecialization] = useState("");

  const handlelogin = async (e) => {
    e.preventDefault();
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "Users", user.uid));
      const profile = snap.data();

      if (profile?.type !== activeTab) {
        toast.error(`This is a ${profile?.type} account. Please use the correct tab.`);
        await auth.signOut();
        return;
      }

      toast.success("Login successful!");
      navigate("/testing", { state: { name: profile.firstname } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlelogindoctors = async (e) => {
    e.preventDefault();
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "Doctors", user.uid));
      const profile = snap.data();

      if (profile?.type !== activeTab) {
        toast.error(`This is a ${profile?.type} account. Please use the correct tab.`);
        await auth.signOut();
        return;
      }

      toast.success("Login successful!");
      navigate("/doctors", { state: { name: profile.firstname } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleregister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstname: fname,
          type: activeTab
        });
        toast.success("Sign up successful!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleregisterdoctors = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        await setDoc(doc(db, "Doctors", user.uid), {
          email: user.email,
          firstname: fname,
          medical_license: medicalno,
          type: activeTab,
          specialization: specialization
        });
        toast.success("Sign up successful!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-sidebar">
        <div className="sidebar-logo-container">
          <img src={logo} className='sidebar-logo' alt="CureConnect Logo"/>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-item">
            <h3>Seamless</h3>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item">
            <h3>Connect</h3>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item">
            <h3>Manage</h3>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-item">
            <h3>Schedule</h3>
          </div>
        </div>
      </div>

      <div className="login-main-content">
        <div className="login-image-container">
          <img src={doctor} alt="Doctor" className="login-doctor-image"/>
          <div className="login-image-overlay">
            <div className="overlay-text">{texts[currentIdx]}</div>
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-form-card">
            <div className="form-tab-selector">
              <button 
                className={`tab-button ${activeTab === 'patient' ? 'active-tab' : ''}`} 
                onClick={() => setActiveTab('patient')}
              >
                <FaUser className="tab-icon" />
                Patient
              </button>
              <button 
                className={`tab-button ${activeTab === 'doctor' ? 'active-tab' : ''}`} 
                onClick={() => setActiveTab('doctor')}
              >
                <FaUserMd className="tab-icon" />
                Doctor
              </button>
            </div>

            <div className="form-auth-toggle">
              <button 
                className={`auth-toggle-button ${isSignIn ? 'active-toggle' : ''}`} 
                onClick={() => setIsSignIn(true)}
              >
                Login
              </button>
              <button 
                className={`auth-toggle-button ${!isSignIn ? 'active-toggle' : ''}`} 
                onClick={() => setIsSignIn(false)}
              >
                Sign Up
              </button>
            </div>

            {isSignIn ? (
              <form onSubmit={activeTab === "patient" ? handlelogin : handlelogindoctors} className="login-form">
                <h2 className="form-title">
                  {activeTab === "patient" ? 'Patient Login' : 'Doctor Login'}
                </h2>
                
                <div className="form-input-group">
                  <div className="input-icon">
                    <FaEnvelope />
                  </div>
                  <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    className='form-input' 
                    type='email' 
                    placeholder='Email Address' 
                    required
                  />
                </div>
                
                <div className="form-input-group">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    className='form-input' 
                    type='password' 
                    placeholder='Password' 
                    required
                  />
                </div>
                
                <button type="submit" className="form-submit-button">
                  {activeTab === "patient" ? 'Patient Login' : 'Doctor Login'}
                </button>
                
                <div className="form-footer-links">
                  <a href="#" className="forgot-password">Forgot password?</a>
                  <p className="auth-switch-text">
                    Don't have an account? 
                    <span onClick={() => setIsSignIn(false)} className="auth-switch-link"> Sign up</span>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={activeTab === 'patient' ? handleregister : handleregisterdoctors} className="login-form">
                <h2 className="form-title">
                  {activeTab === 'patient' ? 'Patient Registration' : 'Doctor Registration'}
                </h2>
                
                <div className="form-input-group">
                  <div className="input-icon">
                    <FaUser />
                  </div>
                  <input 
                    onChange={(e) => setFname(e.target.value)} 
                    className='form-input' 
                    type='text' 
                    placeholder='Full Name' 
                    required
                  />
                </div>
                
                <div className="form-input-group">
                  <div className="input-icon">
                    <FaEnvelope />
                  </div>
                  <input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    className='form-input' 
                    type='email' 
                    placeholder='Email Address'
                    required
                  />
                </div>
                
                <div className="form-input-group">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <input 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className='form-input' 
                    type='password' 
                    placeholder='Password'
                    required
                  />
                </div>
                
                {activeTab === 'doctor' && (
                  <>
                    <div className="form-input-group">
                      <div className="input-icon">
                        <FaIdCard />
                      </div>
                      <input
                        className='form-input'
                        type='text'
                        placeholder='Medical License Number'
                        onChange={(e) => setMedicalno(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-input-group">
                      <div className="input-icon">
                        <FaStethoscope />
                      </div>
                      <input
                        className='form-input'
                        type='text'
                        placeholder='Specialization'
                        onChange={(e) => setSpecialization(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                <button type="submit" className="form-submit-button">
                  {activeTab === 'patient' ? 'Register as Patient' : 'Register as Doctor'}
                </button>
                
                <div className="form-footer-links">
                  <p className="auth-switch-text">
                    Already have an account? 
                    <span onClick={() => setIsSignIn(true)} className="auth-switch-link"> Login</span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="login-footer">
        <p>© CureConnect - All rights reserved 2025</p>
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