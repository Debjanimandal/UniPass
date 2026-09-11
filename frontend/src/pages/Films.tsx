import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './Films.css';

export default function Films() {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student Name';

  const regularFilms = [
    {
      id: 1,
      title: 'Interstellar',
      meta: 'Sci-Fi • 169 min',
      date: '15 September 2026',
      time: '6:00 PM - 9:00 PM',
      location: 'Screen 1, University Auditorium',
      price: 250,
      posterUrl: '/posters/interstellar.jpg'
    },
    {
      id: 2,
      title: 'The Creator',
      meta: 'Sci-Fi • 169 min',
      date: '15 September 2026',
      time: '6:00 PM - 9:00 PM',
      location: 'Screen 1, University Auditorium',
      price: 250,
      posterUrl: '/posters/creator.jpg'
    },
    {
      id: 3,
      title: 'Dune: Part Two',
      meta: 'Sci-Fi • 169 min',
      date: '15 September 2026',
      time: '6:00 PM - 9:00 PM',
      location: 'Screen 1, University Auditorium',
      price: 250,
      posterUrl: '/posters/dune2.jpg'
    },
    {
      id: 4,
      title: 'Spider-Man: Across the Spider-Verse',
      meta: 'Sci-Fi • 169 min',
      date: '15 September 2026',
      time: '6:00 PM - 9:00 PM',
      location: 'Screen 1, University Auditorium',
      price: 250,
      posterUrl: '/posters/spiderman-across.jpg'
    }
  ];

  return (
    <div className="films-page">
      {/* ─── Top White Navbar ──────────────────────────────────────── */}
      <nav className="films-top-nav">
        <Link to="/" className="films-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="films-logo-text">UniPass</span>
        </Link>
        <div className="films-user-info">
          <span>Welcome, {fullName}!</span>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User Avatar" 
            className="films-avatar" 
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ────────────────────────────────────── */}
      <nav className="films-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films" className="active">Films</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      {/* ─── Main Content Header ───────────────────────────────────── */}
      <div className="films-header-container">
        <h1>Films</h1>
        <p>Discover and book university film screenings.</p>
      </div>

      {/* ─── Content Grid ──────────────────────────────────────────── */}
      <div className="films-content-grid">
        
        {/* Left Column: Filters Sidebar */}
        <div className="filters-sidebar">
          <h2>Filters</h2>
          
          <div className="filter-section">
            <h3>Genre</h3>
            <div className="checkbox-group">
              <label className="checkbox-label"><input type="checkbox" /> Sci-Fi</label>
              <label className="checkbox-label"><input type="checkbox" /> Drama</label>
              <label className="checkbox-label"><input type="checkbox" /> Comedy</label>
              <label className="checkbox-label"><input type="checkbox" /> Documentary</label>
              <label className="checkbox-label"><input type="checkbox" /> Animation</label>
            </div>
          </div>

          <div className="filter-section">
            <h3>Screening Date</h3>
            <div className="date-input-wrapper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input type="text" placeholder="Date to pick   v" readOnly />
            </div>
            <div className="quick-dates">
              <button className="btn-quick-date">Quick date</button>
              <button className="btn-quick-date">Quick date</button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Language</h3>
            <div className="checkbox-group">
              <label className="checkbox-label"><input type="checkbox" /> English</label>
              <label className="checkbox-label"><input type="checkbox" /> Hindi</label>
              <label className="checkbox-label"><input type="checkbox" /> Regional</label>
            </div>
          </div>

          <button className="btn-apply-filters">Apply Filters</button>
        </div>

        {/* Right Column: Films List */}
        <div className="films-main-col">
          
          {/* Featured Film Card */}
          <div className="featured-film-card">
            <img 
              src="/posters/oppenheimer-bg.jpg" 
              alt="Oppenheimer Banner" 
              className="featured-film-bg" 
            />
            <div className="featured-film-overlay"></div>
            
            <div className="featured-film-content">
              <h2>Oppenheimer</h2>
              <p className="meta">Biography / Drama</p>
              
              <div className="featured-film-info-grid">
                <div className="featured-info-col">
                  <p>20 September 2026</p>
                  <p>University Auditorium</p>
                </div>
                <div className="featured-info-col">
                  <p>6:00 PM - 9:00 PM</p>
                  <p className="price">₹250 <span>/ seat</span></p>
                </div>
              </div>
              
              <Link to="/student/screenings/1/book" className="btn-book-featured">
                Book Seat
              </Link>
            </div>
          </div>

          {/* Regular Films Grid */}
          <div className="films-grid">
            {regularFilms.map(film => (
              <div key={film.id} className="film-card">
                <img src={film.posterUrl} alt={film.title} className="film-poster-small" />
                <div className="film-card-details">
                  <h3>{film.title}</h3>
                  <p className="film-card-meta">{film.meta}</p>
                  
                  <div className="film-card-info">
                    <p>{film.date}</p>
                    <p>{film.time}</p>
                    <p>{film.location}</p>
                  </div>
                  
                  <div className="film-card-footer">
                    <div className="film-price">₹{film.price} <span>/ seat</span></div>
                    <Link to={`/student/screenings/${film.id}/book`} className="btn-book-seat">
                      Book Seat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
