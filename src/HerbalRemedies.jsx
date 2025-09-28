import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HerbalRemedies.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HerbalRemedies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [dictionaryTerm, setDictionaryTerm] = useState('');
  const [dictionaryResults, setDictionaryResults] = useState(null);
  const [language, setLanguage] = useState('english');
  const containerRef = useRef(null);
  const herbRainRef = useRef(null);

  // Common diseases for dropdown (English + Hindi)
  const commonDiseases = [
    { id: 1, en: 'Common Cold', hi: 'सामान्य सर्दी-जुकाम' },
    { id: 2, en: 'Headache', hi: 'सिरदर्द' },
    { id: 3, en: 'Indigestion', hi: 'अपच' },
    { id: 4, en: 'Insomnia', hi: 'अनिद्रा' },
    { id: 5, en: 'Stress', hi: 'तनाव' },
    { id: 6, en: 'Arthritis', hi: 'गठिया' },
    { id: 7, en: 'Diabetes', hi: 'मधुमेह' },
    { id: 8, en: 'High Blood Pressure', hi: 'उच्च रक्तचाप' },
    { id: 9, en: 'Skin Problems', hi: 'त्वचा संबंधी समस्याएं' },
    { id: 10, en: 'Allergies', hi: 'एलर्जी' },
    { id: 11, en: 'Asthma', hi: 'दमा' },
    { id: 12, en: 'Constipation', hi: 'कब्ज' },
    { id: 13, en: 'Acidity', hi: 'अम्लता' },
    { id: 14, en: 'Hair Loss', hi: 'बालों का झड़ना' },
    { id: 15, en: 'Obesity', hi: 'मोटापा' }
  ];

  // Common allergies for dropdown (English + Hindi)
  const commonAllergies = [
    { id: 1, en: 'Gluten', hi: 'ग्लूटेन' },
    { id: 2, en: 'Dairy', hi: 'डेयरी' },
    { id: 3, en: 'Nuts', hi: 'नट्स' },
    { id: 4, en: 'Shellfish', hi: 'शेलफिश' },
    { id: 5, en: 'Eggs', hi: 'अंडे' },
    { id: 6, en: 'Soy', hi: 'सोया' },
    { id: 7, en: 'Wheat', hi: 'गेहूं' },
    { id: 8, en: 'Fish', hi: 'मछली' }
  ];

  // Ayurvedic herbal database (English + Hindi)
  const herbalDatabase = {
    'Common Cold': {
      treatment: {
        en: 'A combination of ginger, tulsi (holy basil), and black pepper tea',
        hi: 'अदरक, तुलसी और काली मिर्च की चाय का संयोजन'
      },
      remedies: [
        {
          en: 'Tulsi (Holy Basil) Tea with Ginger and Honey',
          hi: 'अदरक और शहद के साथ तुलसी की चाय'
        },
        {
          en: 'Turmeric Milk with Black Pepper',
          hi: 'काली मिर्च के साथ हल्दी वाला दूध'
        },
        {
          en: 'Steam Inhalation with Eucalyptus Oil',
          hi: 'नीलगिरी तेल के साथ भाप की साँस लेना'
        }
      ],
      herbs: [
        { 
          en: 'Tulsi (Holy Basil)', 
          hi: 'तुलसी',
          benefits: {
            en: 'Boosts immunity, relieves congestion',
            hi: 'प्रतिरक्षा बढ़ाता है, कंजेशन से राहत देता है'
          }
        },
        { 
          en: 'Ginger', 
          hi: 'अदरक',
          benefits: {
            en: 'Reduces inflammation, soothes throat',
            hi: 'सूजन कम करता है, गले को शांत करता है'
          }
        },
        { 
          en: 'Turmeric', 
          hi: 'हल्दी',
          benefits: {
            en: 'Antibacterial, anti-inflammatory',
            hi: 'जीवाणुरोधी, विरोधी भड़काऊ'
          }
        }
      ],
      lifestyle: [
        {
          en: 'Get plenty of rest and sleep',
          hi: 'भरपूर आराम और नींद लें'
        },
        {
          en: 'Stay hydrated with warm fluids',
          hi: 'गर्म तरल पदार्थों से हाइड्रेटेड रहें'
        },
        {
          en: 'Avoid cold foods and drinks',
          hi: 'ठंडे खाद्य पदार्थ और पेय से बचें'
        }
      ]
    },
    'Headache': {
      treatment: {
        en: 'Application of peppermint oil on temples and forehead',
        hi: 'मंदिरों और माथे पर पुदीना तेल का अनुप्रयोग'
      },
      remedies: [
        {
          en: 'Peppermint or Eucalyptus Oil Massage',
          hi: 'पुदीना या नीलगिरी तेल की मालिश'
        },
        {
          en: 'Ginger and Lemon Tea',
          hi: 'अदरक और नींबू की चाय'
        },
        {
          en: 'Cold Compress on Forehead',
          hi: 'माथे पर ठंडी सिकाई'
        }
      ],
      herbs: [
        { 
          en: 'Peppermint', 
          hi: 'पुदीना',
          benefits: {
            en: 'Cooling effect, relieves tension',
            hi: 'ठंडा प्रभाव, तनाव से राहत देता है'
          }
        },
        { 
          en: 'Lavender', 
          hi: 'लैवेंडर',
          benefits: {
            en: 'Calming, reduces stress headaches',
            hi: 'शांत करने वाला, तनाव सिरदर्द को कम करता है'
          }
        },
        { 
          en: 'Ginger', 
          hi: 'अदरक',
          benefits: {
            en: 'Reduces inflammation, improves circulation',
            hi: 'सूजन कम करता है, रक्त परिसंचरण में सुधार करता है'
          }
        }
      ],
      lifestyle: [
        {
          en: 'Practice relaxation techniques',
          hi: 'विश्राम तकनीकों का अभ्यास करें'
        },
        {
          en: 'Maintain regular sleep patterns',
          hi: 'नियमित नींद पैटर्न बनाए रखें'
        },
        {
          en: 'Stay hydrated throughout the day',
          hi: 'दिन भर हाइड्रेटेड रहें'
        }
      ]
    },
    'Indigestion': {
      treatment: {
        en: 'A combination of ginger, fennel, and coriander tea',
        hi: 'अदरक, सौंफ और धनिया की चाय का संयोजन'
      },
      remedies: [
        {
          en: 'Ginger Tea with Lemon',
          hi: 'नींबू के साथ अदरक की चाय'
        },
        {
          en: 'Fennel Seed Infusion',
          hi: 'सौंफ के बीज का काढ़ा'
        },
        {
          en: 'Triphala Powder with Warm Water',
          hi: 'गर्म पानी के साथ त्रिफला पाउडर'
        }
      ],
      herbs: [
        { 
          en: 'Ginger', 
          hi: 'अदरक',
          benefits: {
            en: 'Aids digestion, reduces bloating',
            hi: 'पाचन में सहायता, सूजन कम करता है'
          }
        },
        { 
          en: 'Fennel', 
          hi: 'सौंफ',
          benefits: {
            en: 'Relieves gas, improves digestion',
            hi: 'गैस से राहत, पाचन में सुधार'
          }
        },
        { 
          en: 'Peppermint', 
          hi: 'पुदीना',
          benefits: {
            en: 'Soothes stomach, reduces nausea',
            hi: 'पेट को शांत करता है, मतली कम करता है'
          }
        }
      ],
      lifestyle: [
        {
          en: 'Eat smaller, more frequent meals',
          hi: 'छोटे, अधिक बार भोजन करें'
        },
        {
          en: 'Avoid spicy and fatty foods',
          hi: 'मसालेदार और चिकना भोजन से बचें'
        },
        {
          en: 'Practice mindful eating',
          hi: 'माइंडफुल ईटिंग का अभ्यास करें'
        }
      ]
    }
  };

  // Ayurvedic plant dictionary (English + Hindi)
  const plantDictionary = {
    'tulsi': {
      name: { en: 'Tulsi (Holy Basil)', hi: 'तुलसी' },
      description: {
        en: 'Tulsi is considered sacred in Ayurveda and has powerful adaptogenic properties. It helps boost immunity, reduce stress, and fight respiratory disorders.',
        hi: 'तुलसी को आयुर्वेद में पवित्र माना जाता है और इसमें शक्तिशाली adaptogenic गुण होते हैं। यह प्रतिरक्षा को बढ़ावा देने, तनाव को कम करने और श्वसन संबंधी विकारों से लड़ने में मदद करता है।'
      },
      uses: {
        en: ['Immunity boosting', 'Respiratory health', 'Stress relief', 'Fever reduction'],
        hi: ['प्रतिरक्षा बढ़ाना', 'श्वसन स्वास्थ्य', 'तनाव से राहत', 'बुखार कम करना']
      },
      image: 'https://images.pexels.com/photos/6858623/pexels-photo-6858623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    'turmeric': {
      name: { en: 'Turmeric', hi: 'हल्दी' },
      description: {
        en: 'Turmeric contains curcumin, a compound with powerful anti-inflammatory and antioxidant properties. It is used for pain relief, skin health, and digestive issues.',
        hi: 'हल्दी में करक्यूमिन होता है, एक यौगिक जिसमें शक्तिशाली विरोधी भड़काऊ और एंटीऑक्सीडेंट गुण होते हैं। इसका उपयोग दर्द से राहत, त्वचा के स्वास्थ्य और पाचन संबंधी समस्याओं के लिए किया जाता है।'
      },
      uses: {
        en: ['Anti-inflammatory', 'Antioxidant', 'Pain relief', 'Skin health'],
        hi: ['विरोधी भड़काऊ', 'एंटीऑक्सीडेंट', 'दर्द से राहत', 'त्वचा का स्वास्थ्य']
      },
      image: 'https://images.pexels.com/photos/5946738/pexels-photo-5946738.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    'ashwagandha': {
      name: { en: 'Ashwagandha', hi: 'अश्वगंधा' },
      description: {
        en: 'Ashwagandha is a powerful adaptogen that helps the body manage stress. It also boosts brain function, lowers blood sugar levels, and helps fight symptoms of anxiety and depression.',
        hi: 'अश्वगंधा एक शक्तिशाली adaptogen है जो शरीर को तनाव प्रबंधन में मदद करता है। यह मस्तिष्क की कार्यक्षमता को भी बढ़ाता है, रक्त शर्करा के स्तर को कम करता है और चिंता और अवसाद के लक्षणों से लड़ने में मदद करता है।'
      },
      uses: {
        en: ['Stress reduction', 'Brain function', 'Blood sugar control', 'Anxiety relief'],
        hi: ['तनाव में कमी', 'मस्तिष्क समारोह', 'रक्त शर्करा नियंत्रण', 'चिंता से राहत']
      },
      image: 'https://images.pexels.com/photos/7034705/pexels-photo-7034705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    'neem': {
      name: { en: 'Neem', hi: 'नीम' },
      description: {
        en: 'Neem has powerful antibacterial, antiviral, and antifungal properties. It is used for skin conditions, dental health, and as a blood purifier in Ayurvedic medicine.',
        hi: 'नीम में शक्तिशाली जीवाणुरोधी, एंटीवायरल और एंटिफंगल गुण होते हैं। इसका उपयोग आयुर्वेदिक चिकित्सा में त्वचा की स्थितियों, दंत स्वास्थ्य और रक्त शुद्धिकरण के लिए किया जाता है।'
      },
      uses: {
        en: ['Skin health', 'Dental care', 'Blood purification', 'Insect repellent'],
        hi: ['त्वचा का स्वास्थ्य', 'दंत देखभाल', 'रक्त शुद्धिकरण', 'कीट विकर्षक']
      },
      image: 'https://images.pexels.com/photos/6858609/pexels-photo-6858609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    'ginger': {
      name: { en: 'Ginger', hi: 'अदरक' },
      description: {
        en: 'Ginger is a versatile herb with anti-inflammatory and digestive properties. It helps with nausea, digestion, and reducing muscle pain and soreness.',
        hi: 'अदरक एक बहुमुखी जड़ी बूटी है जिसमें विरोधी भड़काऊ और पाचन गुण होते हैं। यह मतली, पाचन और मांसपेशियों में दर्द और खराश को कम करने में मदद करता है।'
      },
      uses: {
        en: ['Digestive aid', 'Nausea relief', 'Anti-inflammatory', 'Pain reduction'],
        hi: ['पाचन सहायता', 'मतली से राहत', 'विरोधी भड़काऊ', 'दर्द में कमी']
      },
      image: 'https://images.pexels.com/photos/6002002/pexels-photo-6002002.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  };

  // Trigger herb rain animation
  const triggerHerbRain = () => {
    const herbs = herbRainRef.current?.children;
    if (herbs) {
      gsap.set(herbs, { y: -100, opacity: 0, rotation: -15 });
      
      gsap.to(herbs, {
        y: '+=300',
        opacity: 1,
        rotation: 15,
        duration: 2,
        stagger: 0.1,
        ease: "power1.out",
        onComplete: () => {
          gsap.to(herbs, {
            opacity: 0,
            duration: 1,
          });
        }
      });
    }
  };

  // Handle search for remedies
  const handleSearch = () => {
    if (selectedDisease && herbalDatabase[selectedDisease]) {
      setShowResults(true);
      triggerHerbRain();
      
      // Animate results appearing
      setTimeout(() => {
        gsap.fromTo(".hr-result-card", 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)" }
        );
      }, 300);
    } else {
      // Show error animation if no disease selected
      gsap.fromTo(".hr-search-card", 
        { x: 0 },
        { x: 10, duration: 0.1, repeat: 3, yoyo: true, ease: "power1.inOut" }
      );
    }
  };

  // Handle dictionary search
  const handleDictionarySearch = () => {
    const term = dictionaryTerm.toLowerCase();
    if (plantDictionary[term]) {
      setDictionaryResults(plantDictionary[term]);
      triggerHerbRain();
      
      // Animate dictionary results
      gsap.fromTo(".hr-dictionary-result", 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)" }
      );
    } else {
      setDictionaryResults(null);
    }
  };

  // Initialize animations
  useEffect(() => {
    gsap.fromTo(".hr-section-title", 
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
    );
    
    gsap.fromTo(".hr-search-card", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power2.out" }
    );
    
    gsap.fromTo(".hr-feature-card", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, delay: 0.6 }
    );

    // Pulse animation for search card instead of floating
    gsap.to(".hr-search-card", {
      boxShadow: "0 5px 15px rgba(88, 129, 87, 0.3)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Set up scroll animations
    gsap.utils.toArray('.hr-animate-on-scroll').forEach(element => {
      gsap.fromTo(element, 
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }, []);

  // Get text based on current language
  const getText = (text) => {
    if (!text) return '';
    return text[language] || text.en || text;
  };

  return (
    <div className="hr-container" ref={containerRef}>
      {/* Background with herbal elements */}
      <div className="hr-background">
        <div className="hr-background-image"></div>
        <div className="hr-background-overlay"></div>

        {/* Animated background elements */}
        <div className="hr-background-element hr-bg-element-1">🌿</div>
        <div className="hr-background-element hr-bg-element-2">✨</div>
        <div className="hr-background-element hr-bg-element-3">🌸</div>
        <div className="hr-background-element hr-bg-element-4">🍃</div>

        {/* Herb rain container */}
        <div className="hr-herb-rain" ref={herbRainRef}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="hr-herb">🌿</div>
          ))}
        </div>
      </div>

      {/* Language toggle */}
      <div className="hr-language-toggle">
        <button 
          className={`hr-lang-btn ${language === 'english' ? 'active' : ''}`}
          onClick={() => setLanguage('english')}
        >
          EN
        </button>
        <button 
          className={`hr-lang-btn ${language === 'hindi' ? 'active' : ''}`}
          onClick={() => setLanguage('hindi')}
        >
          HI
        </button>
      </div>

      {/* Header */}
      <div className="hr-header">
        <h2 className="hr-section-title">
          {language === 'english' ? 'Herbal Remedies' : 'जड़ी बूटी उपचार'}
        </h2>
        <p className="hr-tagline">
          {language === 'english' 
            ? 'Discover natural Ayurvedic solutions for common health concerns' 
            : 'सामान्य स्वास्थ्य चिंताओं के लिए प्राकृतिक आयुर्वेदिक समाधान खोजें'}
        </p>
      </div>

      <div className="hr-content">
        {/* Search Section */}
        <div className="hr-search-section hr-animate-on-scroll">
          <div className="hr-search-card">
            <h3>
              {language === 'english' 
                ? 'Find Ayurvedic Remedies' 
                : 'आयुर्वेदिक उपचार खोजें'}
            </h3>
            
            <div className="hr-search-input">
              <label>
                {language === 'english' 
                  ? 'Select a health concern' 
                  : 'एक स्वास्थ्य चिंता चुनें'}
              </label>
              <select 
                value={selectedDisease} 
                onChange={(e) => setSelectedDisease(e.target.value)}
              >
                <option value="">
                  {language === 'english' 
                    ? '-- Select a condition --' 
                    : '-- एक स्थिति चुनें --'}
                </option>
                {commonDiseases.map(disease => (
                  <option key={disease.id} value={disease.en}>
                    {language === 'english' ? disease.en : disease.hi}
                  </option>
                ))}
              </select>
            </div>

            <div className="hr-search-input">
              <label>
                {language === 'english' 
                  ? 'Any allergies? (Select multiple)' 
                  : 'कोई एलर्जी? (कई चुनें)'}
              </label>
              <select 
                multiple
                value={allergies} 
                onChange={(e) => {
                  const options = [...e.target.options];
                  const selected = options
                    .filter(option => option.selected)
                    .map(option => option.value);
                  setAllergies(selected);
                }}
              >
                {commonAllergies.map(allergy => (
                  <option key={allergy.id} value={allergy.en}>
                    {language === 'english' ? allergy.en : allergy.hi}
                  </option>
                ))}
              </select>
              <small>
                {language === 'english' 
                  ? 'Hold Ctrl/Cmd to select multiple' 
                  : 'कई चयन करने के लिए Ctrl/Cmd दबाए रखें'}
              </small>
            </div>

            <button className="hr-search-btn" onClick={handleSearch}>
              {language === 'english' ? 'Find Remedies' : 'उपचार खोजें'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && herbalDatabase[selectedDisease] && (
          <div className="hr-results-section hr-animate-on-scroll">
            <h3>
              {language === 'english' 
                ? `Ayurvedic Remedies for ${selectedDisease}` 
                : `${selectedDisease} के लिए आयुर्वेदिक उपचार`}
            </h3>

            <div className="hr-results-grid">
              {/* Treatment Approach */}
              <div className="hr-result-card">
                <div className="hr-card-icon">🌿</div>
                <h4>
                  {language === 'english' 
                    ? 'Recommended Treatment' 
                    : 'अनुशंसित उपचार'}
                </h4>
                <p>{getText(herbalDatabase[selectedDisease].treatment)}</p>
              </div>

              {/* Remedies */}
              <div className="hr-result-card">
                <div className="hr-card-icon">💡</div>
                <h4>
                  {language === 'english' 
                    ? 'Specific Remedies' 
                    : 'विशिष्ट उपचार'}
                </h4>
                <ul>
                  {herbalDatabase[selectedDisease].remedies.map((remedy, index) => (
                    <li key={index}>{getText(remedy)}</li>
                  ))}
                </ul>
              </div>

              {/* Herbs */}
              <div className="hr-result-card">
                <div className="hr-card-icon">🌱</div>
                <h4>
                  {language === 'english' 
                    ? 'Beneficial Herbs' 
                    : 'लाभकारी जड़ी बूटियाँ'}
                </h4>
                <div className="hr-herbs-list">
                  {herbalDatabase[selectedDisease].herbs.map((herb, index) => (
                    <div key={index} className="hr-herb-item">
                      <span className="hr-herb-name">
                        {language === 'english' ? herb.en : herb.hi}
                      </span>
                      <span className="hr-herb-benefits">
                        {getText(herb.benefits)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Recommendations */}
              <div className="hr-result-card">
                <div className="hr-card-icon">🧘</div>
                <h4>
                  {language === 'english' 
                    ? 'Lifestyle Recommendations' 
                    : 'जीवनशैली की सिफारिशें'}
                </h4>
                <ul>
                  {herbalDatabase[selectedDisease].lifestyle.map((tip, index) => (
                    <li key={index}>{getText(tip)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Plant Dictionary Section */}
        <div className="hr-dictionary-section hr-animate-on-scroll">
          <h3>
            {language === 'english' 
              ? 'Ayurvedic Plant Dictionary' 
              : 'आयुर्वेदिक पौधा शब्दकोश'}
          </h3>
          
          <div className="hr-dictionary-card">
            <div className="hr-dictionary-search">
              <input
                type="text"
                placeholder={
                  language === 'english' 
                    ? 'Search for plants (e.g., tulsi, turmeric)' 
                    : 'पौधों की खोज करें (जैसे, तुलसी, हल्दी)'
                }
                value={dictionaryTerm}
                onChange={(e) => setDictionaryTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDictionarySearch()}
              />
              <button onClick={handleDictionarySearch}>
                {language === 'english' ? 'Search' : 'खोजें'}
              </button>
            </div>

            {dictionaryResults && (
              <div className="hr-dictionary-result">
                <div className="hr-plant-header">
                  <h4>{getText(dictionaryResults.name)}</h4>
                  <div 
                    className="hr-plant-image"
                    style={{ backgroundImage: `url(${dictionaryResults.image})` }}
                  ></div>
                </div>
                
                <div className="hr-plant-details">
                  <p>{getText(dictionaryResults.description)}</p>
                  
                  <h5>
                    {language === 'english' 
                      ? 'Common Uses:' 
                      : 'सामान्य उपयोग:'}
                  </h5>
                  <ul>
                    {dictionaryResults.uses[language]?.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="hr-feature-cards hr-animate-on-scroll">
          <div className="hr-feature-card" onClick={triggerHerbRain}>
            <div className="hr-feature-icon">📚</div>
            <h4>
              {language === 'english' 
                ? 'Ayurvedic Knowledge Base' 
                : 'आयुर्वेदिक ज्ञान आधार'}
            </h4>
            <p>
              {language === 'english' 
                ? 'Explore our extensive collection of Ayurvedic wisdom' 
                : 'आयुर्वेदिक ज्ञान के हमारे व्यापक संग्रह का अन्वेषण करें'}
            </p>
          </div>

          <div className="hr-feature-card" onClick={triggerHerbRain}>
            <div className="hr-feature-icon">🛒</div>
            <h4>
              {language === 'english' 
                ? 'Herbal Products' 
                : 'हर्बल उत्पाद'}
            </h4>
            <p>
              {language === 'english' 
                ? 'Discover authentic Ayurvedic products for your wellness' 
                : 'अपने स्वास्थ्य के लिए प्रामाणिक आयुर्वेदिक उत्पाद खोजें'}
            </p>
          </div>

          <div className="hr-feature-card" onClick={triggerHerbRain}>
            <div className="hr-feature-icon">👨‍⚕️</div>
            <h4>
              {language === 'english' 
                ? 'Consult Experts' 
                : 'विशेषज्ञों से सलाह लें'}
            </h4>
            <p>
              {language === 'english' 
                ? 'Connect with certified Ayurvedic practitioners' 
                : 'प्रमाणित आयुर्वेदिक चिकित्सकों से जुड़ें'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerbalRemedies;