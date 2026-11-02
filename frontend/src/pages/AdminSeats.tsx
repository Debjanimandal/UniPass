import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { screensApi, seatsApi } from '../services/api.client';
import './AdminSeats.css';

interface ScreenData {
  screenId: number;
  screenName: string;
  _count?: { seats: number };
}

interface SeatData {
  seatId: number;
  screenId: number;
  rowNo: number;
  seatNo: number;
  seatCode: string;
  seatType: 'REGULAR' | 'PREMIUM' | 'VIP';
  isActive: boolean;
}

export default function AdminSeats() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);

  // Pending seat type — holds the dropdown selection until the user clicks Save
  const [pendingSeatType, setPendingSeatType] = useState<SeatData['seatType']>('REGULAR');
  const [isSavingType, setIsSavingType] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // How many seats to show in the table before "Show More"
  const SEATS_PREVIEW_COUNT = 10;
  const [showAllSeats, setShowAllSeats] = useState(false);

  // Bulk generator state
  const [genRows, setGenRows] = useState(10);
  const [genSeats, setGenSeats] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadScreens();
  }, []);

  useEffect(() => {
    if (selectedScreenId) {
      loadSeats(selectedScreenId);
    } else {
      setSeats([]);
      setSelectedSeat(null);
    }
    setShowAllSeats(false); // collapse the table back to preview on screen change
  }, [selectedScreenId]);

  // Keep the pending type dropdown in sync with whichever seat is selected
  useEffect(() => {
    setPendingSeatType(selectedSeat ? selectedSeat.seatType : 'REGULAR');
  }, [selectedSeat]);

  const loadScreens = async () => {
    try {
      const res = await screensApi.getAll();
      if (res.data?.data) {
        setScreens(res.data.data);
        setSelectedScreenId(prev => prev || (res.data.data.length > 0 ? String(res.data.data[0].screenId) : ''));
      }
    } catch (err) {
      console.error('Failed to load screens', err);
    }
  };

  const loadSeats = async (screenId: string, keepSelectedId?: number) => {
    try {
      const res = await seatsApi.getByScreen(screenId);
      if (res.data?.data) {
        const freshSeats: SeatData[] = res.data.data;
        setSeats(freshSeats);
        // Re-sync the selected seat with its fresh DB values (or clear it)
        setSelectedSeat(
          keepSelectedId != null
            ? freshSeats.find(s => s.seatId === keepSelectedId) ?? null
            : null
        );
        // Sync the generator inputs to the screen's actual layout
        if (freshSeats.length > 0) {
          const rowCount = new Set(freshSeats.map(s => s.rowNo)).size;
          const colCount = Math.max(...freshSeats.map(s => s.seatNo));
          setGenRows(rowCount);
          setGenSeats(colCount);
        }
      }
    } catch (err) {
      console.error('Failed to load seats', err);
    }
  };

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  const handleGenerateLayout = async () => {
    if (!selectedScreenId) return;
    if (!window.confirm('WARNING: This will delete all existing seats in this screen and generate a new layout. Are you sure?')) return;
    
    setIsGenerating(true);
    try {
      await seatsApi.bulkCreate({
        screenId: parseInt(selectedScreenId, 10),
        rows: genRows,
        seatsPerRow: genSeats
      });
      await loadSeats(selectedScreenId);
      // We also should reload screens to get updated total capacity
      await loadScreens();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to generate layout.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSeat = async (updates: { isActive?: boolean; seatType?: 'REGULAR' | 'PREMIUM' | 'VIP' }) => {
    if (!selectedSeat) return;
    const seatId = selectedSeat.seatId;

    // 1. Persist the change — surface the real backend error if this step fails
    try {
      await seatsApi.update(seatId, updates);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.error?.message;
      console.error('Failed to update seat', err);

      if (status === 403) {
        // Token's role is stale (account promoted after the token was issued),
        // or this account is not an admin. A fresh login fixes the former.
        if (window.confirm(
          'Your session does not have permission to edit seats. ' +
          'This usually happens when your account role changed after you logged in.\n\n' +
          'Log out and sign back in to refresh your session?'
        )) {
          logout();
          navigate('/login');
        }
        return;
      }

      if (status === 401) {
        alert('Your session has expired. Please log in again.');
        return;
      }

      alert(message || 'Failed to update seat. Please try again.');
      return;
    }

    // 2. Reload from the DB so the change is reflected. A failure here does NOT
    //    mean the save failed, so report it separately.
    try {
      await loadSeats(selectedScreenId, seatId);
      await loadScreens();
    } catch (err) {
      console.error('Seat saved, but failed to refresh the list', err);
    }
  };

  const handleSaveSeatType = async () => {
    if (!selectedSeat || pendingSeatType === selectedSeat.seatType) return;
    setIsSavingType(true);
    try {
      await handleUpdateSeat({ seatType: pendingSeatType });
    } finally {
      setIsSavingType(false);
    }
  };

  const handleDeleteSeat = async (seatId: number) => {
    if (!window.confirm('Are you sure you want to delete this seat?')) return;
    try {
      await seatsApi.delete(seatId);
      await loadSeats(selectedScreenId);
      await loadScreens();
      if (selectedSeat?.seatId === seatId) {
        setSelectedSeat(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete seat. It might be booked.');
    }
  };

  // Group seats by rowNo for rendering
  const rowNumbers = Array.from(new Set(seats.map(s => s.rowNo))).sort((a, b) => a - b);
  const maxSeatNo = Math.max(...seats.map(s => s.seatNo), 1);
  
  const activeSeatsCount = seats.filter(s => s.isActive).length;
  const inactiveSeatsCount = seats.length - activeSeatsCount;
  const selectedScreen = screens.find(s => String(s.screenId) === selectedScreenId);

  type SeatVisualStatus = 'available' | 'selected' | 'inactive' | 'premium' | 'vip';

  const getSeatStatus = (seat: SeatData): SeatVisualStatus => {
    if (!seat.isActive) return 'inactive';
    if (seat.seatType === 'VIP') return 'vip';
    if (seat.seatType === 'PREMIUM') return 'premium';
    return 'available';
  };

  const SeatIcon = ({ status }: { status: SeatVisualStatus }) => {
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
      innerFillColor = '#f3e4c8';
    } else if (status === 'vip') {
      strokeColor = '#9333ea'; // purple for VIP
      fillColor = '#f6edfd';
      innerFillColor = '#e4ccf8';
    }

    return (
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        <rect x="5" y="5" width="14" height="13" rx="2" fill={innerFillColor} stroke={strokeColor} strokeWidth="1" />
        <rect x="3.5" y="18" width="17" height="11" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        <rect x="1.5" y="14" width="4.5" height="12" rx="1.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        <rect x="18" y="14" width="4.5" height="12" rx="1.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
      </svg>
    );
  };

  const filteredSeatsTable = seats.filter(s => 
    searchQuery === '' || s.seatCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <select value={selectedScreenId} onChange={(e) => setSelectedScreenId(e.target.value)}>
              {screens.map(sc => (
                <option key={sc.screenId} value={sc.screenId}>
                  {sc.screenName}
                </option>
              ))}
            </select>
            <span className="screen-subtitle">
              {selectedScreen?.screenName} - {seats.length} total seats configured
            </span>
          </div>
          
          <div className="layout-generator">
            <input type="number" min="1" max="26" value={genRows} onChange={e => setGenRows(parseInt(e.target.value)||1)} placeholder="Rows" title="Rows" />
            <span>&times;</span>
            <input type="number" min="1" max="50" value={genSeats} onChange={e => setGenSeats(parseInt(e.target.value)||1)} placeholder="Seats" title="Seats per row" />
            <button className="btn-generate" onClick={handleGenerateLayout} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Grid'}
            </button>
          </div>
        </div>

        {/* ─── Main 3-Column Layout ─────────────────────────────── */}
        <div className="seats-main-layout">
          
          {/* Left: Stats */}
          <div className="seats-stats-panel">
            <h3>{selectedScreen?.screenName || 'Screen'}</h3>
            <div className="stat-row">
              <span className="label">Total Seats:</span>
              <span className="value">{seats.length}</span>
            </div>
            <div className="stat-row">
              <span className="label">Active Seats:</span>
              <span className="value">{activeSeatsCount}</span>
            </div>
            <div className="stat-row">
              <span className="label">Inactive Seats:</span>
              <span className="value">{inactiveSeatsCount}</span>
            </div>
          </div>

          {/* Center: Seat Map */}
          <div className="seats-map-panel">
            <div className="map-header">Seat Layout - {selectedScreen?.screenName}</div>
            
            <div className="map-container">
              <div className="screen-bar">SCREEN</div>
              
              {seats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No seats configured for this screen. <br/>Use the generator above to create a layout.
                </div>
              ) : (
                <div className="seat-grid">
                  {rowNumbers.map(rowNo => {
                    const rowSeats = seats.filter(s => s.rowNo === rowNo);
                    const rowLabel = rowSeats.length > 0 ? rowSeats[0].seatCode.replace(/[0-9]/g, '') : '';
                    return (
                      <div key={rowNo} className="seat-row">
                        <span className="row-label">{rowLabel}</span>
                        <div className="row-seats" style={{ display: 'grid', gridTemplateColumns: `repeat(${maxSeatNo}, minmax(28px, 1fr))`, gap: '8px' }}>
                          {rowSeats.map(seat => {
                            const status = getSeatStatus(seat);
                            const isSelected = selectedSeat?.seatId === seat.seatId;
                            return (
                              <div 
                                key={seat.seatId} 
                                className={`seat-item ${status} ${isSelected ? 'active-selection' : ''}`}
                                onClick={() => setSelectedSeat(seat)}
                                style={{ gridColumnStart: seat.seatNo }}
                                title={`${seat.seatCode} — ${seat.seatType}${seat.isActive ? '' : ' (Inactive)'}`}
                              >
                                <SeatIcon status={isSelected ? 'selected' : status} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="seat-legend">
                <div className="legend-item">
                  <SeatIcon status="available" /> Regular
                </div>
                <div className="legend-item">
                  <SeatIcon status="premium" /> Premium
                </div>
                <div className="legend-item">
                  <SeatIcon status="vip" /> VIP
                </div>
                <div className="legend-item">
                  <SeatIcon status="selected" /> Selected
                </div>
                <div className="legend-item">
                  <SeatIcon status="inactive" /> Inactive
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
                  <span className="value fw-600">{selectedSeat.seatCode}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Row No.</span>
                  <span className="value">{selectedSeat.rowNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Seat No.</span>
                  <span className="value">{selectedSeat.seatNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Type</span>
                  <span className="value">
                    <select 
                      value={pendingSeatType} 
                      onChange={e => setPendingSeatType(e.target.value as SeatData['seatType'])}
                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="REGULAR">Regular</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </span>
                </div>

                {pendingSeatType !== selectedSeat.seatType && (
                  <div className="detail-row type-save-row">
                    <button
                      className="btn-save-type"
                      onClick={handleSaveSeatType}
                      disabled={isSavingType}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      {isSavingType ? 'Saving...' : 'Save Type'}
                    </button>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Status</span>
                  <span className={`value status-${selectedSeat.isActive ? 'active' : 'inactive'}`}>
                    {selectedSeat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="details-actions">
                  <button 
                    className="btn-deactivate"
                    onClick={() => handleUpdateSeat({ isActive: !selectedSeat.isActive })}
                    style={{ backgroundColor: selectedSeat.isActive ? '#fff3f3' : '#e6f4ea', color: selectedSeat.isActive ? '#d93025' : '#1e8e3e', borderColor: selectedSeat.isActive ? '#fce8e6' : '#ceead6' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    {selectedSeat.isActive ? 'Mark Inactive' : 'Mark Active'}
                  </button>
                  <button 
                    className="btn-deactivate"
                    onClick={() => handleDeleteSeat(selectedSeat.seatId)}
                    style={{ backgroundColor: '#fff', color: '#d93025', border: '1px solid #d93025' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Delete Seat
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
                <input 
                  type="text" 
                  placeholder="Search seat code..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <table className="seats-table">
            <thead>
              <tr>
                <th>Seat Code</th>
                <th>Row No.</th>
                <th>Seat No.</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(showAllSeats ? filteredSeatsTable : filteredSeatsTable.slice(0, SEATS_PREVIEW_COUNT)).map(seat => (
                <tr key={seat.seatId} className={selectedSeat?.seatId === seat.seatId ? 'table-row-selected' : ''} onClick={() => setSelectedSeat(seat)} style={{ cursor: 'pointer' }}>
                  <td className="fw-600">{seat.seatCode}</td>
                  <td>{seat.rowNo}</td>
                  <td>{seat.seatNo}</td>
                  <td>
                    <span className={`type-badge type-${seat.seatType.toLowerCase()}`}>
                      {seat.seatType}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${!seat.isActive ? 'inactive' : 'active'}`}>
                      {!seat.isActive ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteSeat(seat.seatId); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSeatsTable.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No seats found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredSeatsTable.length > SEATS_PREVIEW_COUNT && (
            <div className="seats-table-footer">
              <span className="seats-count-text">
                Showing {showAllSeats ? filteredSeatsTable.length : SEATS_PREVIEW_COUNT} of {filteredSeatsTable.length} seats.
              </span>
              <button
                type="button"
                className="btn-show-more"
                onClick={() => setShowAllSeats(prev => !prev)}
              >
                {showAllSeats ? 'Show Less' : `Show More (${filteredSeatsTable.length - SEATS_PREVIEW_COUNT} more)`}
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  style={{ transform: showAllSeats ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          )}
          {filteredSeatsTable.length > 0 && filteredSeatsTable.length <= SEATS_PREVIEW_COUNT && (
            <div className="seats-table-footer">
              <span className="seats-count-text">
                Showing all {filteredSeatsTable.length} seat{filteredSeatsTable.length === 1 ? '' : 's'}.
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
