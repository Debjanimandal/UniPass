import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './Bookings.css';

export default function Bookings() {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student Name';
  
  const [selectedSeat, setSelectedSeat] = useState<string | null>('A5');

  // Hardcoded seat layout for exact visual match
  const rows = [
    { label: 'A', seats: [null, null, '1', '2', '3', '4', '5', '6'] }, // offset starts
    { label: 'B', seats: ['1', '2', '3', '4', '5', '6'] },
    { label: 'C', seats: ['1', '2', '3', '4', '5', '6'], isPremium: true },
    { label: 'D', seats: [null, null, '1', '2', '3', '4', '5', '6'] },
    { label: 'E', seats: ['1', '2', '3', '4', '5', '6'] }
  ];

  const occupiedSeats = ['C3', 'C4', 'C5', 'C6'];

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    setSelectedSeat(seatId);
  };

  return (
    <div className="bookings-page">
      {/* ─── Top White Navbar ──────────────────────────────────────── */}
      <nav className="bookings-top-nav">
        <Link to="/" className="bookings-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="bookings-logo-text">UniPass</span>
        </Link>
        <div className="bookings-user-info">
          <span>Welcome, {fullName}!</span>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User Avatar" 
            className="bookings-avatar" 
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ────────────────────────────────────── */}
      <nav className="bookings-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings" className="active">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      {/* ─── Main Content Header ───────────────────────────────────── */}
      <div className="bookings-header-container">
        <div className="bookings-header-left">
          <h1>Book Your Seat</h1>
          <p>Choose a screening and select your preferred seat.</p>
        </div>
        <div className="bookings-steps">
          <span>1. Screening</span> &rarr;
          <span className="active-step">2. Select Seat</span> &rarr;
          <span>3. Confirm</span>
        </div>
      </div>

      {/* ─── Content Grid ──────────────────────────────────────────── */}
      <main className="bookings-content-grid">
        
        {/* Left Column */}
        <div className="bookings-left-col">
          
          {/* Screening Info Card */}
          <div className="booking-card screening-info-card">
            <img 
              src="https://image.tmdb.org/t/p/w500/gPbM0MK8CP8A174rmUwGsADNYKD.jpg" 
              alt="Interstellar" 
              className="movie-poster-thumb" 
            />
            <div className="screening-details">
              <h2>INTERSTELLAR</h2>
              <p className="movie-meta">Sci-Fi • 169 min</p>
              
              <div className="screening-grid-info">
                <div className="info-block">
                  <p>15 September 2026</p>
                  <p>6:00 PM – 9:00 PM</p>
                </div>
                <div className="info-block">
                  <p>Screen 1</p>
                  <p>University Auditorium</p>
                </div>
              </div>
              
              <div className="ticket-price-block">
                ₹250 / seat
              </div>
            </div>
          </div>

          {/* Seat Selection Card */}
          <div className="booking-card seat-selection-card">
            <div className="seat-card-header">
              <h3>Select Your Seat</h3>
              <p>Screen 1 • Select one available seat</p>
            </div>

            <div className="screen-indicator-wrapper">
              <div className="screen-curve">
                <span className="screen-text">SCREEN</span>
              </div>
            </div>

            <div className="seats-grid-container">
              {rows.map((row, i) => (
                <div key={row.label} className={`seat-row ${row.isPremium ? 'premium-row' : ''}`}>
                  {/* For layout exact match: Row A and D are left aligned, B, C, E are right aligned in the image.
                      Wait, the image shows A and D having gaps, but actually A and D are on left, B,C,E are shifted right.
                      I will use the offset to match the visual. */}
                  {i % 2 === 0 && <span className="row-label">{row.label}</span>}
                  
                  <div className="seats-group">
                    {row.seats.map((seatNum, j) => {
                      if (seatNum === null) return <div key={j} className="seat-gap"></div>;
                      
                      const seatId = `${row.label}${seatNum}`;
                      const isOccupied = occupiedSeats.includes(seatId);
                      const isSelected = selectedSeat === seatId;
                      
                      return (
                        <button
                          key={seatId}
                          className={`seat-btn ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSeatClick(seatId)}
                          disabled={isOccupied}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  {i % 2 !== 0 && <span className="row-label">{row.label}</span>}
                </div>
              ))}
            </div>

            <div className="seat-legend">
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-box available"></div> Available
                </div>
                <div className="legend-item">
                  <div className="legend-box selected"></div> Selected
                </div>
                <div className="legend-item">
                  <div className="legend-box occupied"></div> Occupied
                </div>
                <div className="legend-item">
                  <div className="legend-box premium"></div> Premium
                </div>
              </div>
              <div className="seats-available-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                48 seats available
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Summary */}
        <div className="bookings-right-col">
          <div className="booking-card booking-summary-card">
            <h3>Booking Summary</h3>
            
            <div className="summary-row">
              <span className="label">Movie:</span>
              <span className="value">Interstellar</span>
            </div>
            <div className="summary-row">
              <span className="label">Screening:</span>
              <span className="value">15 Sep 2026 • 6:00 PM</span>
            </div>
            <div className="summary-row">
              <span className="label">Screen:</span>
              <span className="value">Screen 1</span>
            </div>
            <div className="summary-row">
              <span className="label">Selected Seat:</span>
              <span className="value">{selectedSeat || '-'}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row">
              <span className="label">Ticket Price:</span>
              <span className="value">₹250</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-total">
              <span>Total:</span>
              <span>₹{selectedSeat ? '250' : '0'}</span>
            </div>
            
            <button className="btn-confirm-booking" disabled={!selectedSeat}>
              Confirm Booking
            </button>
            <Link to="/student/dashboard" className="btn-back">Back</Link>
            
            <div className="booking-info-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink: 0, marginTop: '2px'}}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Your seat will be reserved for this screening once the booking is confirmed.</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
