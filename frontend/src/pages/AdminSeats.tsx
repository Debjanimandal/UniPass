import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminSeats.css';

type SeatStatus = 'available' | 'selected' | 'inactive' | 'premium';

interface Seat {
  id: string;
  row: string;
  number: number;
  type: string;
  status: SeatStatus;
}

export default function AdminSeats() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>({
    id: 'A5',
    row: 'A',
    number: 5,
    type: 'Premium',
    status: 'premium'
  });

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  // Generate a mock grid
  const rows = ['A', 'B', 'C', 'E', 'F'];
  const cols = 12;
  
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    rows.forEach(row => {
      for (let i = 1; i <= cols; i++) {
        let status: SeatStatus = 'available';
        let type = 'Regular';
        
        if (i >= 4 && i <= 5) status = 'selected';
        else if (i >= 7 && i <= 9) status = 'inactive';
        else if (i >= 11) {
          status = 'premium';
          type = 'Premium';
        }

        seats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type,
          status
        });
      }
    });
    return seats;
  };

  const seats = generateSeats();

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'inactive') {
      setSelectedSeat(seat);
    }
  };

  const SeatIcon = ({ status }: { status: SeatStatus }) => {
    let strokeColor = '#7cb3d6'; // available (light blue outline)
    let fillColor = '#ffffff';
    let innerFillColor = '#ffffff';

    if (status === 'selected') {
      strokeColor = '#104d87'; // dark blue
      fillColor = '#1e6db2';
      innerFillColor = '#1e6db2';
    } else if (status === 'inactive') {
      strokeColor = '#b5b5b5'; // grey
      fillColor = '#e2e2e2';
      innerFillColor = '#e2e2e2';
    } else if (status === 'premium') {
      strokeColor = '#cca97c'; // gold/brown
      fillColor = '#fdf8f0';
      innerFillColor = '#fdf8f0';
    }

    return (
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Backrest Outer */}
        <rect x="2" y="2" width="20" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Backrest Inner Cushion */}
        <rect x="5" y="5" width="14" height="13" rx="2" fill={innerFillColor} stroke={strokeColor} strokeWidth="1" />
        {/* Seat Cushion */}
        <rect x="3.5" y="18" width="17" height="11" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Left Armrest */}
        <rect x="1.5" y="14" width="4.5" height="12" rx="1.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        {/* Right Armrest */}
        <rect x="18" y="14" width="4.5" height="12" rx="1.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div className="admin-seats-page">
      {/* ─── Top Navbar ─────────────────────────────────────────── */}
      <nav className="admin-top-nav">
        <Link to="/" className="admin-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="admin-logo-text">UniPass</span>
        </Link>
        <div className="admin-user-info">
          <div className="welcome-text">
            Welcome,
            <span className="name">{fullName}!</span>
          </div>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
            alt="Admin Avatar"
            className="admin-avatar"
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ───────────────────────────────────── */}
      <div className="admin-blue-nav">
        <div className="admin-nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/movies">Movies</Link>
          <Link to="/admin/screens">Screens</Link>
          <Link to="/admin/seats" className="active">Seats</Link>
          <Link to="/admin/screenings">Screenings</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/profile">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-seats-content">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="seats-header">
          <div className="seats-header-text">
            <Link to="/admin/screens" className="back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Screens
            </Link>
            <h1>Seat Management</h1>
            <p>Configure and manage the seat layout for each physical screen.</p>
          </div>
        </div>

        <div className="screen-selector-row">
          <div className="screen-selector">
            <label>Select Screen</label>
            <select>
              <option>Screen 1 - Main Auditorium</option>
              <option>Screen 2 - Innovation Hall</option>
              <option>Screen 3 - Open Air Screen</option>
            </select>
            <span className="screen-subtitle">University Auditorium - 120 seats</span>
          </div>
        </div>

        {/* ─── Main 3-Column Layout ─────────────────────────────── */}
        <div className="seats-main-layout">
          
          {/* Left: Stats */}
          <div className="seats-stats-panel">
            <h3>Screen 1</h3>
            <div className="stat-row">
              <span className="label">Total Seats:</span>
              <span className="value">120</span>
            </div>
            <div className="stat-row">
              <span className="label">Active Seats:</span>
              <span className="value">116</span>
            </div>
            <div className="stat-row">
              <span className="label">Inactive Seats:</span>
              <span className="value">4</span>
            </div>
          </div>

          {/* Center: Seat Map */}
          <div className="seats-map-panel">
            <div className="map-header">Seat Layout - Screen 1</div>
            
            <div className="map-container">
              <div className="screen-bar">SCREEN</div>
              
              <div className="seat-grid">
                {rows.map(row => (
                  <div key={row} className="seat-row">
                    <span className="row-label">{row}</span>
                    <div className="row-seats">
                      {seats.filter(s => s.row === row).map(seat => (
                        <div 
                          key={seat.id} 
                          className={`seat-item ${seat.status} ${selectedSeat?.id === seat.id ? 'active-selection' : ''}`}
                          onClick={() => handleSeatClick(seat)}
                        >
                          <SeatIcon status={seat.id === selectedSeat?.id ? 'selected' : seat.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="seat-legend">
                <div className="legend-item">
                  <SeatIcon status="available" /> Available
                </div>
                <div className="legend-item">
                  <SeatIcon status="selected" /> Selected
                </div>
                <div className="legend-item">
                  <SeatIcon status="inactive" /> Inactive
                </div>
                <div className="legend-item">
                  <SeatIcon status="premium" /> Premium
                </div>
              </div>
            </div>
          </div>

          {/* Right: Seat Details */}
          <div className="seats-details-panel">
            <div className="details-header">Seat Details</div>
            {selectedSeat ? (
              <div className="details-content">
                <div className="detail-row">
                  <span className="label">Seat Code</span>
                  <span className="value fw-600">{selectedSeat.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Row</span>
                  <span className="value">{selectedSeat.row}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Seat Number</span>
                  <span className="value">{selectedSeat.number}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Seat Type</span>
                  <span className="value">{selectedSeat.type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status</span>
                  <span className={`value status-${selectedSeat.status}`}>{selectedSeat.status === 'inactive' ? 'Inactive' : 'Active'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Screen</span>
                  <span className="value">Screen 1</span>
                </div>
                
                <div className="details-actions">
                  <button className="btn-edit-seat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    Edit Seat
                  </button>
                  <button className="btn-deactivate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    Deactivate
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-seat-selected">Select a seat to view details</div>
            )}
          </div>

        </div>

        {/* ─── Table: All Seats ───────────────────────────────────── */}
        <div className="all-seats-section">
          <div className="all-seats-header">
            <h3>All Seats</h3>
            <div className="all-seats-actions">
              <div className="table-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Search..." />
              </div>
              <button className="btn-filter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              </button>
            </div>
          </div>
          
          <table className="seats-table">
            <thead>
              <tr>
                <th>Seat Code</th>
                <th>Row</th>
                <th>Seat No.</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {seats.slice(0, 5).map(seat => (
                <tr key={seat.id}>
                  <td className="fw-600">{seat.id}</td>
                  <td>{seat.row}</td>
                  <td>{seat.number}</td>
                  <td>{seat.type}</td>
                  <td>
                    <span className={`status-badge ${seat.status === 'inactive' ? 'inactive' : 'active'}`}>
                      {seat.status === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action-icon edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                    <button className="btn-action-icon delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
