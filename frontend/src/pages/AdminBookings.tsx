import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminBookings.css';

export default function AdminBookings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  const mockBookings = [
    {
      id: 'TKT-1024',
      student: 'Rahul Das',
      movie: 'Interstellar',
      screening: '15 Sep - 6:00 PM',
      screen: 'Screen 1',
      seat: 'A5',
      bookedAt: '14 Sep - 10:42 AM',
      status: 'VALID',
      scannedBy: '-'
    },
    {
      id: 'TKT-1023',
      student: 'Priya Sen',
      movie: 'Interstellar',
      screening: '15 Sep - 6:00 PM',
      screen: 'Screen 1',
      seat: 'A6',
      bookedAt: '14 Sep - 10:35 AM',
      status: 'SCANNED',
      scannedBy: 'Amit Roy'
    },
    {
      id: 'TKT-1022',
      student: 'Amit Paul',
      movie: 'Oppenheimer',
      screening: '15 Sep - 6:00 PM',
      screen: 'Screen 1',
      seat: 'C12',
      bookedAt: '14 Sep - 9:58 AM',
      status: 'VALID',
      scannedBy: '-'
    },
    {
      id: 'TKT-1021',
      student: 'Sneha Das',
      movie: 'Inception',
      screening: '16 Sep - 4:00 PM',
      screen: 'Screen 2',
      seat: 'B4',
      bookedAt: '14 Sep - 9:40 AM',
      status: 'CANCELLED',
      scannedBy: '-'
    },
    {
      id: 'TKT-1020',
      student: 'Priya Sen',
      movie: 'Interstellar',
      screening: '15 Sep - 6:00 PM',
      screen: 'Screen 1',
      seat: 'A6',
      bookedAt: '14 Sep - 10:35 AM',
      status: 'SCANNED',
      scannedBy: 'Amit Roy'
    },
    {
      id: 'TKT-1019',
      student: 'Amit Paul',
      movie: 'Oppenheimer',
      screening: '15 Sep - 6:00 PM',
      screen: 'Screen 1',
      seat: 'C12',
      bookedAt: '14 Sep - 9:58 AM',
      status: 'VALID',
      scannedBy: '-'
    },
    {
      id: 'TKT-1017',
      student: 'Oppenheimer', // Matching typo in screenshot
      movie: 'Interstellar',
      screening: '15 Sep - 6:00 PM',
      screen: 'Screen 1',
      seat: 'C3',
      bookedAt: '14 Sep - 10:42 AM',
      status: 'VALID',
      scannedBy: '-'
    },
    {
      id: 'TKT-1016',
      student: 'Sneha Das',
      movie: 'Inception',
      screening: '16 Sep - 4:00 PM',
      screen: 'Screen 2',
      seat: 'B4',
      bookedAt: '14 Sep - 10:40 AM',
      status: 'VALID',
      scannedBy: '-'
    }
  ];

  return (
    <div className="admin-bookings-page">
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
          <Link to="/admin/seats">Seats</Link>
          <Link to="/admin/screenings">Screenings</Link>
          <Link to="/admin/bookings" className="active">Bookings</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/profile">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-bookings-content">
        
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="bookings-header">
          <div className="bookings-header-text">
            <h1>Bookings</h1>
            <p>View and manage student ticket bookings across all screenings.</p>
          </div>
          <button className="btn-export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Bookings
          </button>
        </div>

        {/* ─── Summary Stats Bar ─────────────────────────────────── */}
        <div className="bookings-summary-bar">
          <span className="summary-item"><strong>Total Bookings:</strong> 428</span>
          <span className="summary-item"><strong>Valid:</strong> 92</span>
          <span className="summary-item"><strong>Scanned:</strong> 316</span>
          <span className="summary-item"><strong>Cancelled:</strong> 20</span>
        </div>

        {/* ─── Toolbar (Filters) ─────────────────────────────────── */}
        <div className="bookings-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search by student, ticket ID, or movie..." />
          </div>
          
          <div className="toolbar-filters">
            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select className="filter-select"><option>All Status</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Screening</span>
              <select className="filter-select"><option>All Screenings</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Screen</span>
              <select className="filter-select"><option>All Screens</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Date</span>
              <select className="filter-select"><option>Select Date</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Seat Type</span>
              <select className="filter-select"><option>All Types</option></select>
            </div>
            <button className="btn-clear-filters">Clear Filters</button>
          </div>
        </div>

        {/* ─── Table Container ───────────────────────────────────── */}
        <div className="bookings-table-container">
          <div className="table-header">
            <h2>All Bookings</h2>
            <span className="subtitle">428 bookings</span>
          </div>

          <table className="bookings-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Student</th>
                <th>Movie</th>
                <th>Screening</th>
                <th>Screen</th>
                <th>Seat</th>
                <th>Booked At</th>
                <th>Status</th>
                <th>Scanned By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking, index) => (
                <tr key={index}>
                  <td className="fw-600">{booking.id}</td>
                  <td>{booking.student}</td>
                  <td>{booking.movie}</td>
                  <td>{booking.screening}</td>
                  <td>{booking.screen}</td>
                  <td className="fw-600">{booking.seat}</td>
                  <td>{booking.bookedAt}</td>
                  <td>
                    <span className={`status-pill ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>{booking.scannedBy}</td>
                  <td className="actions-cell">
                    <button className="btn-dropdown">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ─── Pagination Footer ─────────────────────────────────── */}
          <div className="table-footer">
            <span className="showing-text">Showing 1-10 of 428</span>
            <div className="pagination">
              <button className="page-btn">Previous</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <span className="page-ellipsis">...</span>
              <button className="page-btn">43</button>
              <button className="page-btn">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
