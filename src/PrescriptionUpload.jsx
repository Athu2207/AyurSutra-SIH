import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import './PrescriptionUpload.css';

const medicineInfo = {
  "Paracetamol": {
    aliases: ["Paracetmol", "Paracet", "Paracetamol 1g tds"],
    seriousness: "Low",
    allergy: "Rare liver issues",
    substitutes: ["Crocin", "Calpol", "Metacin"]
  },
  "Diclofenac": {
    aliases: ["Diclofan", "Diclofen", "Diclofenac 50mg bd"],
    seriousness: "Medium",
    allergy: "GI bleeding, rash",
    substitutes: ["Voveran", "Dynapar", "Fenceta"]
  },
  "Augmentin": {
    aliases: ["Augmentin 625mg", "Augmentn", "Augmntin", "Augmentin 625mg tds"],
    seriousness: "High",
    allergy: "Diarrhea, rash",
    substitutes: ["Clavam", "Moxikind-CV", "Megamentin"]
  }
};

const PrescriptionUpload = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [medications, setMedications] = useState([]);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-animate]');
      const windowHeight = window.innerHeight;
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        if (elementPosition < windowHeight - 100) {
          element.classList.add('animate');
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setRawText('');
      setMedications([]);
    }
  };

  const analyzeMedicines = (ocrText) => {
    const lines = ocrText
      .replace(/[^\w\s]/gi, '')
      .toLowerCase()
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const found = [];

    Object.entries(medicineInfo).forEach(([name, data]) => {
      const aliases = [name.toLowerCase(), ...(data.aliases || []).map(a => a.toLowerCase())];
      const match = lines.find(line =>
        aliases.some(alias => line.includes(alias))
      );
      if (match) {
        found.push({
          name,
          seriousness: data.seriousness,
          allergy: data.allergy,
          substitutes: data.substitutes || []
        });
      }
    });

    return found;
  };

  const handleScan = () => {
    if (!image) return;
    setLoading(true);

    Tesseract.recognize(image, 'eng', {
      logger: m => console.log(m),
      tessedit_pageseg_mode: 6,
    })
      .then(({ data: { text } }) => {
        setRawText(text);
        const meds = analyzeMedicines(text);
        setMedications(meds);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="prescription-analyzer-wrapper" data-animate>
      <h2>📷 Upload Prescription</h2>
      <p className="description-text">Scan your prescription to identify medicines and health warnings.</p>

      <div className="file-input-wrapper">
        <input 
          id="prescription-upload"
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          className="prescription-input-file" 
        />
        <label htmlFor="prescription-upload" className="file-input-label">
          📤 Choose Prescription Image
        </label>
      </div>

      <button 
        onClick={handleScan} 
        disabled={loading || !image} 
        className={`prescription-scan-button ${loading ? 'loading' : ''}`}
      >
        {loading ? (
          <>
            <span className="button-loader"></span>
            Processing...
          </>
        ) : (
          '🩺 Analyze Prescription'
        )}
      </button>

      {image && (
        <div className="prescription-image-section" data-animate>
          <img 
            src={URL.createObjectURL(image)} 
            alt="Prescription Preview" 
            className="prescription-preview-image"
          />
        </div>
      )}

      {medications.length > 0 && (
        <div className="medicine-analysis-box" data-animate>
          <h3>💊 Detected Medicines</h3>
          <div className="medicine-cards-container">
            {medications.map((med, idx) => (
              <div 
                key={idx} 
                className={`medicine-detail-card ${med.seriousness.toLowerCase()}`}
                data-animate
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="medicine-header">
                  <h4>{med.name}</h4>
                  <span className={`seriousness-badge ${med.seriousness.toLowerCase()}`}>
                    {med.seriousness}
                  </span>
                </div>
                <div className="medicine-details">
                  <p><strong>Allergy Risk:</strong> {med.allergy}</p>
                  <div className="medicine-meta">
                    <span className="meta-item">💊 Oral</span>
                    <span className="meta-item">⏱️ Daily</span>
                  </div>
                  {med.substitutes && (
                    <div className="medicine-substitutes">
                      <p><strong>Substitutes:</strong> {med.substitutes.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rawText && (
        <div className="raw-toggle-wrapper" data-animate>
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={showRaw} 
              onChange={() => setShowRaw(!showRaw)} 
              className="toggle-checkbox"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Show Raw OCR Text</span>
          </label>
          
          {showRaw && (
            <div className="raw-text-content" data-animate>
              <h3>📝 Raw OCR Output</h3>
              <div className="text-scroll-container">
                <pre>{rawText}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;
