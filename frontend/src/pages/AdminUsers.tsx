import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminUsers.css';

interface UserData {
  id: string;
  initials: string;
  avatarColor: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joined: string;
  bookings: string;
  lastActivity: string;
}

export default function AdminUsers() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const mockUsers: UserData[] = [
    {
      id: '1',
      initials: 'RD',
      avatarColor: 'blue',
      name: 'Rahul Das',
      email: 'rahul@example.com',
      phone: '+91 98765 43210',
      role: 'STUDENT',
      status: 'Active',
      joined: '05 Sep 2026',
      bookings: '6 bookings',
      lastActivity: 'Today'
    },
    {
      id: '2',
      initials: 'PS',
      avatarColor: 'pink',
      name: 'Priya Sen',
      email: 'priya@example.com',
      phone: '+91 98321 45678',
      role: 'STUDENT',
      status: 'Active',
      joined: '02 Sep 2026',
      bookings: '3 bookings',
      lastActivity: 'Yesterday'
    },
    {
      id: '3',
      initials: 'AR',
      avatarColor: 'yellow',
      name: 'Amit Roy',
      email: 'amit@unipass.com',
      phone: '+91 98111 22334',
      role: 'GUARD',
      status: 'Active',
      joined: '01 Sep 2026',
      bookings: '-',
      lastActivity: 'Today'
    },
    {
      id: '4',
      initials: 'AU',
      avatarColor: 'orange',
      name: 'Admin User',
      email: 'admin@unipass.com',
      phone: '+91 98000 11223',
      role: 'ADMIN',
      status: 'Active',
      joined: '01 Sep 2026',
      bookings: '-',
      lastActivity: 'Today'
    },
    {
      id: '5',
      initials: 'SD',
      avatarColor: 'blue',
      name: 'Sneha Das',
      email: 'sneha@example.com',
      phone: '+91 98765 11111',
      role: 'STUDENT',
      status: 'Active',
      joined: '01 Sep 2026',
      bookings: '2 bookings',
      lastActivity: 'Yesterday'
    },
    {
      id: '6',
      initials: 'VK',
      avatarColor: 'pink',
      name: 'Vikram Kumar',
      email: 'vikram@example.com',
      phone: '+91 98765 22222',
      role: 'STUDENT',
      status: 'Inactive',
      joined: '28 Aug 2026',
      bookings: '1 booking',
      lastActivity: '1 Week Ago'
    },
    {
      id: '7',
      initials: 'MG',
      avatarColor: 'yellow',
      name: 'Mohit Garg',
      email: 'mohit@unipass.com',
      phone: '+91 98765 33333',
      role: 'GUARD',
      status: 'Active',
      joined: '25 Aug 2026',
      bookings: '-',
      lastActivity: 'Today'
    },
    {
      id: '8',
      initials: 'NK',
      avatarColor: 'blue',
      name: 'Neha Kapoor',
      email: 'neha@example.com',
      phone: '+91 98765 44444',
      role: 'STUDENT',
      status: 'Active',
      joined: '20 Aug 2026',
      bookings: '5 bookings',
      lastActivity: 'Today'
    },
    {
      id: '9',
      initials: 'RJ',
      avatarColor: 'pink',
      name: 'Rajesh Jain',
      email: 'rajesh@example.com',
      phone: '+91 98765 55555',
      role: 'STUDENT',
      status: 'Active',
      joined: '15 Aug 2026',
      bookings: '8 bookings',
      lastActivity: 'Yesterday'
    },
    {
      id: '10',
      initials: 'AK',
      avatarColor: 'orange',
      name: 'Anjali Khan',
      email: 'anjali@example.com',
      phone: '+91 98765 66666',
      role: 'STUDENT',
      status: 'Active',
      joined: '10 Aug 2026',
      bookings: '4 bookings',
      lastActivity: '2 Days Ago'
    }
  ];

  const [selectedUser, setSelectedUser] = useState<UserData | null>(mockUsers[0]);

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  return (
    <div className="admin-users-page">
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
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/users" className="active">Users</Link>
          <Link to="/admin/profile">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-users-content">
        
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="users-header-section">
          <div className="users-header">
            <div className="users-header-text">
              <h1>Users</h1>
              <p>Manage students, guards, and administrators across UniPass.</p>
            </div>
            <button className="admin-btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add User
            </button>
          </div>
        </div>

        {/* ─── Stats Bar ─────────────────────────────────────────── */}
        <div className="users-stats-bar">
          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">1,248</span>
            </div>
            <div className="stat-icon-wrapper light-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Students</span>
              <span className="stat-value">1,180</span>
            </div>
            <div className="stat-icon-wrapper light-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Guards</span>
              <span className="stat-value">42</span>
            </div>
            <div className="stat-icon-wrapper light-brown">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Admins</span>
              <span className="stat-value">26</span>
            </div>
            <div className="stat-icon-wrapper light-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </div>

        {/* ─── Toolbar (Search & Filters) ────────────────────────── */}
        <div className="users-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search by name or email..." />
          </div>
          
          <div className="toolbar-filters">
            <div className="filter-group">
              <span className="filter-label">Role</span>
              <select className="filter-select"><option>All Roles</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select className="filter-select"><option>All Status</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Joined</span>
              <select className="filter-select"><option>All Dates</option></select>
            </div>
            <button className="btn-clear-filters">Clear Filters</button>
          </div>
        </div>

        {/* ─── Main Content Layout ───────────────────────────────── */}
        <div className="users-main-layout">
          
          {/* Left: Table Section */}
          <div className="users-table-section">
            <div className="table-header">
              <h2>All Users</h2>
              <span className="subtitle">1,248 users</span>
            </div>
            
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Bookings</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map(user => (
                  <tr 
                    key={user.id} 
                    className={selectedUser?.id === user.id ? 'selected-row' : ''}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="user-cell">
                      <div className={`user-avatar-initials bg-${user.avatarColor}`}>
                        {user.initials}
                      </div>
                      <span className="fw-600">{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`role-pill role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="status-indicator">
                        <span className="dot green"></span>
                        {user.status}
                      </div>
                    </td>
                    <td>{user.joined}</td>
                    <td>{user.bookings}</td>
                    <td>{user.lastActivity}</td>
                    <td>
                      <button className="btn-view-outline">[View]</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="table-footer">
              <span className="showing-text">Showing 1-10 of 1,248 users</span>
              <div className="pagination">
                <button className="page-btn text">Previous</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <span className="page-ellipsis">...</span>
                <button className="page-btn">125</button>
                <button className="page-btn text">Next</button>
              </div>
            </div>
          </div>
          
          {/* Right: Details Section */}
          <div className="user-details-section">
            <div className="details-header">User Details</div>
            
            {selectedUser ? (
              <div className="details-content">
                <div className="details-profile-card">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`} alt={selectedUser.name} className="details-avatar" />
                  <div className="details-profile-info">
                    <h3>{selectedUser.name}</h3>
                    <p>{selectedUser.email}</p>
                    <p>{selectedUser.phone}</p>
                  </div>
                </div>
                
                <div className="details-stats-list">
                  <div className="details-stat-row">
                    <span className="label">Role:</span>
                    <span className={`value role-text-${selectedUser.role.toLowerCase()}`}>{selectedUser.role}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Status:</span>
                    <span className="value status-text-active">ACTIVE</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Member Since:</span>
                    <span className="value">{selectedUser.joined}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Bookings:</span>
                    <span className="value">{selectedUser.bookings !== '-' ? selectedUser.bookings.split(' ')[0] : '0'}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Upcoming Tickets:</span>
                    <span className="value">{selectedUser.role === 'STUDENT' ? '1' : '0'}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Completed Events:</span>
                    <span className="value">{selectedUser.role === 'STUDENT' ? '5' : '0'}</span>
                  </div>
                </div>
                
                <div className="details-actions">
                  <div className="actions-row">
                    <button className="btn-outline-blue">View Bookings</button>
                    <button className="btn-outline-blue">View Tickets</button>
                  </div>
                  <button className="btn-edit-user">Edit User</button>
                </div>
              </div>
            ) : (
              <div className="no-user-selected">Select a user to view details</div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
