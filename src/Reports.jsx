import React, { useEffect, useState, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { gsap } from 'gsap';
import "./Reports.css";

const Reports = () => {
  const [file, setFile] = useState(null);
  const [uploadedReports, setUploadedReports] = useState([]);
  const [previewURL, setPreviewURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  
  // Refs for GSAP animations
  const containerRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const reportsSectionRef = useRef(null);
  const reportCardsRef = useRef([]);

  const fetchUserReports = async () => {
    if (!currentUser) return;

    const q = query(collection(db, 'reports'), where('uid', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      timestamp: doc.data().timestamp || Date.now()
    }));
    
    // Sort by timestamp descending
    reports.sort((a, b) => b.timestamp - a.timestamp);
    setUploadedReports(reports);
  };

  useEffect(() => {
    fetchUserReports();
  }, [currentUser]);

  // GSAP Animations
  useEffect(() => {
  if (
    !containerRef.current ||
    !uploadSectionRef.current ||
    !reportsSectionRef.current
  ) return;

  // Ensure visibility before animation
  gsap.set([
    containerRef.current,
    uploadSectionRef.current,
    reportsSectionRef.current
  ], { opacity: 100 });

  const tl = gsap.timeline();

  tl.from(containerRef.current, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: "power3.out"
  })
    .from(uploadSectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4")
    .from(reportsSectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3");
}, []);


  // Animate report cards when they're added
 useEffect(() => {
  const validRefs = reportCardsRef.current.filter(Boolean); // filters out nulls
  if (validRefs.length > 0) {
    gsap.fromTo(validRefs,
      {
        opacity: 0,
        y: 50,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      }
    );
  }
}, [uploadedReports]);


  const handleUpload = async () => {
    if (!file || !currentUser) return alert("Select a file first and ensure user is logged in.");

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'demo_upload');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dep87nvg4/raw/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error('Upload failed: No secure URL returned');
      }

      const docRef = await addDoc(collection(db, 'reports'), {
        uid: currentUser.uid,
        url: data.secure_url,
        public_id: data.public_id,
        timestamp: Date.now(),
        fileName: file.name
      });

      const newReport = { 
        id: docRef.id, 
        url: data.secure_url, 
        public_id: data.public_id,
        timestamp: Date.now(),
        fileName: file.name
      };

      setUploadedReports((prev) => [newReport, ...prev]);
      setFile(null);
      
      // Success animation
      gsap.to(uploadSectionRef.current, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
      
      alert("Upload successful!");
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reportId, cardElement) => {
    // Animate card removal
    gsap.to(cardElement, {
      opacity: 0,
      scale: 0.8,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: async () => {
        try {
          await deleteDoc(doc(db, 'reports', reportId));
          setUploadedReports((prev) => prev.filter((r) => r.id !== reportId));
        } catch (error) {
          console.error('Failed to delete report:', error);
          alert('Delete failed.');
          // Animate back if delete failed
          gsap.to(cardElement, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      }
    });
  };

  const handlePreview = (url, cardElement) => {
    setPreviewURL(url);
    
    // Preview animation
    gsap.to(cardElement, {
      scale: 1.02,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  };

  const isPDF = (url) => url.toLowerCase().endsWith('.pdf');

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="reports-container" ref={containerRef}>
      <div className="reports-header">
        <h1 className="reports-title">📄 Report Manager</h1>
        <p className="reports-subtitle">Upload, preview, and manage your documents with ease (Please upload only .jpg, .png files)</p>
      </div>

      <div className="upload-section" ref={uploadSectionRef}>
        <h2 className="section-title">📤 Upload New Report</h2>
        <div className="upload-controls">
          <div className="file-input-wrapper">
            <input 
              type="file" 
              id="file-input"
              className="file-input"
              onChange={(e) => setFile(e.target.files[0])} 
            />
            <label 
              htmlFor="file-input" 
              className={`file-input-label ${file ? 'has-file' : ''}`}
            >
              {file ? (
                <>
                  <span>✓</span>
                  <span>{file.name}</span>
                </>
              ) : (
                <>
                  <span>📎</span>
                  <span>Choose a file to upload</span>
                </>
              )}
            </label>
          </div>
          <button 
            className="upload-btn" 
            onClick={handleUpload}
            disabled={isUploading || !file}
          >
            {isUploading ? <span className="loading"></span> : '🚀 Upload Report'}
          </button>
        </div>
      </div>

      <div className="reports-list-section" ref={reportsSectionRef}>
        <h2 className="section-title">📋 Your Uploaded Reports</h2>
        
        {uploadedReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No reports uploaded yet</div>
            <div className="empty-state-subtext">Upload your first report to get started</div>
          </div>
        ) : (
          <div className="reports-grid">
            {uploadedReports.map((report, idx) => (
              <div 
                key={report.id || idx} 
                className="report-card"
                ref={el => reportCardsRef.current[idx] = el}
              >
                <div className="report-header">
                  <div className="report-title">
                    {report.fileName || `Report #${idx + 1}`}
                  </div>
                  <div className="report-date">
                    {formatDate(report.timestamp)}
                  </div>
                </div>
                
                <div className="report-actions">
                  <button 
                    className="action-btn preview-btn" 
                    onClick={() => handlePreview(report.url, reportCardsRef.current[idx])}
                  >
                    👁️ Preview
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => handleDelete(report.id, reportCardsRef.current[idx])}
                  >
                    🗑️ Delete
                  </button>
                </div>
                
                {previewURL === report.url && (
                  <div className="preview-container">
                    <button 
                      className="action-btn close-preview-btn" 
                      onClick={() => setPreviewURL('')}
                    >
                      ✕ Close Preview
                    </button>
                    {isPDF(report.url) ? (
                      <iframe
                        src={report.url}
                        title={`report-${idx}`}
                        className="preview-iframe"
                      />
                    ) : (
                      <img
                        src={report.url}
                        alt="Uploaded report"
                        className="preview-image"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;