import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './NavBar.css';

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'GUARD') return '/guard/scan';
    return '/student/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="UniPass Logo" className="logo-img" />
          <span className="logo-text">UniPass</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/films" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Movies
          </NavLink>
          <NavLink to="/screenings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Screenings
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Contact
          </NavLink>
        </div>

        {/* Auth Actions & Search */}
        <div className="navbar-actions">
          <button className="search-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          {isAuthenticated && user ? (
            <>
              <Link to={getDashboardLink()} className="navbar-user">
                <div className="user-avatar">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="user-name">{user.firstName}</span>
              </Link>
              <button className="btn btn-login btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-login btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-get-started btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
