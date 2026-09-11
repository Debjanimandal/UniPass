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
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="currentColor" opacity="0.9"/>
              <path d="M12 2L3 7l9 5 9-5-9-5z" fill="white" opacity="0.3"/>
            </svg>
          </div>
          <span className="logo-text">UniPass</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/films" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Films
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Events
          </NavLink>
          {isAuthenticated && user?.role === 'STUDENT' && (
            <>
              <NavLink to="/student/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Bookings
              </NavLink>
              <NavLink to="/student/tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                My Tickets
              </NavLink>
            </>
          )}
        </div>

        {/* Auth Actions */}
        <div className="navbar-auth">
          {isAuthenticated && user ? (
            <>
              <Link to={getDashboardLink()} className="navbar-user">
                <div className="user-avatar">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="user-name">{user.firstName}</span>
              </Link>
              <button className="btn btn-ghost btn-sm navbar-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
