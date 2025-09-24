import React, { useState } from 'react';
import { Search, MapPin, Clock, Award, PhoneCall } from 'lucide-react';
import './HospitalFinder.css';

const hospitals = [
  {
    name: 'Green Cross Hospital',
    location: 'delhi',
    specialties: ['Cardiology', 'Neurology'],
    open: '08:00',
    close: '22:00',
    rating: 4.7,
    contact:"900208841"
  },
  {
    name: 'City Care Clinic',
    location: 'delhi',
    specialties: ['Pediatrics', 'Orthopedics'],
    open: '09:00',
    close: '20:00',
    rating: 4.2,
    contact:"900208841"
  },
  {
    name: 'Sunrise Hospital',
    location: 'noida',
    specialties: ['ENT', 'Cardiology'],
    open: '07:00',
    close: '21:00',
    rating: 4.5,
    distance: '1.8 km'
  }
];

function HospitalFinder() {
  const [searchText, setSearchText] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    setIsSearched(true);
    if (searchText.trim() === '') {
      setFilteredHospitals([]);
      return;
    }
    
    const result = hospitals.filter(hospital =>
      hospital.location.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredHospitals(result);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="app-container-locator">
      <div className="container-locator">
        {/* Header Section */}
        <div className="header-locator">
          <h1>Hospital-Locator</h1>
          <p className="tagline-locator">Finding care when it matters most, just a search away.</p>
        </div>

        {/* Search Section */}
        <div className="search-container-locator">
          <div className="search-wrapper-locator">
            <div className="input-wrapper-locator">
              <div className="icon-wrapper-locator">
                <MapPin className="icon-locator" />
              </div>
              <input
                type="text"
                placeholder="Enter location (e.g., delhi, noida)"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input-locator"
              />
            </div>
            <button
              onClick={handleSearch}
              className="search-button-locator"
            >
              <Search className="icon-locator" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-container-locator">
          {isSearched && (
            <h2 className="results-heading-locator">
              {filteredHospitals.length > 0 
                ? `Found ${filteredHospitals.length} hospitals in ${searchText}`
                : 'No hospitals found for this location'}
            </h2>
          )}

          {filteredHospitals.length > 0 && (
            <div className="hospital-grid-locator">
              {filteredHospitals.map((hospital, index) => (
                <div 
                  key={index} 
                  className="hospital-card-locator"
                >
                  <div className="hospital-header-locator">
                    <h3 className="hospital-name-locator">{hospital.name}</h3>
                    <div className="hospital-location-locator">
                      <MapPin className="location-icon-locator" />
                      <span className="location-text-locator">{hospital.location}</span>
                      <span className="dot-locator">•</span>
                      <span className="distance-locator">{hospital.distance}</span>
                    </div>
                  </div>
                  
                  <div className="hospital-details-locator">
                    <div className="detail-item-locator">
                      <Award className="detail-icon-locator" />
                      <div>
                        <div className="detail-label">Specialties</div>
                        <div className="detail-value">{hospital.specialties.join(', ')}</div>
                      </div>
                    </div>
                    
                    <div className="detail-item-locator">
                      <Clock className="detail-icon-locator" />
                      <div>
                        <div className="detail-label-locator">Working Hours</div>
                        <div className="detail-value-locator">{hospital.open} - {hospital.close}</div>
                      </div>
                      
                      
                    </div>
       
                    <div className="contact-number-locator">
                      <PhoneCall className='phone-icon'/>
                    <div className="contact-details">
                        <div className="contact-label">Contact</div>
                        <div className="contact-value-locator">{hospital.contact}</div>
                    </div>
                    </div>
                    
                    
                      
                            
                            
                              
                            
                          
              </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalFinder;