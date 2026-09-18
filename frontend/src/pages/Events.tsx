import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';
import './Events.css';

export default function Events() {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student Name';

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate next 5 dates for the date chips
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight
  const dateChips = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ active: 'true' });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (language) params.append('language', language);
      if (selectedDate) {
        // Format to YYYY-MM-DD
        const offset = selectedDate.getTimezoneOffset();
        const targetDate = new Date(selectedDate.getTime() - (offset*60*1000));
        const dateStr = targetDate.toISOString().split('T')[0];
        params.append('date', dateStr);
      }

      const res = await axios.get(`http://localhost:3001/api/movies?${params.toString()}`);
      if (res.data.success) {
        setMovies(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, language, selectedDate]);

  // Handle search dynamically
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500); 
    return () => clearTimeout(timer);
  }, [search]);

  const featuredMovie = movies.length > 0 ? movies[0] : null;
  const upcomingMovies = movies.length > 0 ? movies.slice(1) : [];

  return (
    <div className="events-page">
      <nav className="events-top-nav">
        <Link to="/" className="events-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="events-logo-text">UniPass</span>
        </Link>
        <div className="events-user-info">
          <span>Welcome, {fullName}!</span>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User Avatar" 
            className="events-avatar" 
          />
        </div>
      </nav>

      <nav className="events-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events" className="active">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      <div className="events-header-container">
        <div className="events-header-left">
          <h1>Campus Events & Screenings</h1>
          <p>Discover movies, screenings, and events happening across campus.</p>
        </div>
        <Link to="/student/bookings" className="btn-my-bookings">My Bookings</Link>
      </div>

      <div className="events-filters-bar">
        <div className="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search events or movies" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="filter-select">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: '#1a202c', cursor: 'pointer', outline: 'none' }}
            >
              <option value="">[ All Categories ]</option>
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
            </select>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Language</span>
          <div className="filter-select">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: '#1a202c', cursor: 'pointer', outline: 'none' }}
            >
              <option value="">[ All Languages ]</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Screen</span>
          <div className="filter-select">
            <select style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, color: '#1a202c', cursor: 'pointer', outline: 'none' }}>
              <option value="">[ All Screens ]</option>
            </select>
          </div>
        </div>

        <div className="date-chips">
          {dateChips.map((d, index) => {
            const isSelected = selectedDate?.getTime() === d.getTime();
            const dayStr = d.getDate();
            const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
            return (
              <div 
                key={index} 
                className={`date-chip ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedDate(isSelected ? null : d)}
                style={{ cursor: 'pointer' }}
              >
                <span className="day">{dayStr}</span>
                <span className="month">{monthStr}</span>
              </div>
            );
          })}
        </div>
      </div>

      <section className="events-section">
        <h2 className="section-title">Featured Screening</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</div>
        ) : featuredMovie ? (
          <div className="featured-card" style={{ display: 'flex', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <img src={featuredMovie.posterUrl} alt={featuredMovie.title} style={{ width: '200px', height: '300px', objectFit: 'cover' }} />
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px', marginTop: 0 }}>{featuredMovie.title}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>{featuredMovie.genre} &bull; {featuredMovie.language} &bull; {featuredMovie.durationMinutes} min</p>
              <p style={{ color: '#334155', lineHeight: 1.6, flex: 1 }}>{featuredMovie.description}</p>
              <Link to={`/student/films/${featuredMovie.movieId}`} className="btn-my-bookings" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>
                Book Now
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
            No featured screening at the moment. Check back soon!
          </div>
        )}
      </section>

      <section className="events-section">
        <div className="upcoming-section-header">
          <h2>Upcoming Events</h2>
          <p>Find your next experience on campus.</p>
        </div>
        
        <div className="events-grid">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', gridColumn: '1/-1' }}>Loading...</div>
          ) : upcomingMovies.length > 0 ? (
            upcomingMovies.map((movie) => (
              <div key={movie.movieId} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', padding: '16px' }}>
                <img src={movie.posterUrl} alt={movie.title} style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', color: '#0f172a' }}>{movie.title}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>{movie.genre} &bull; {movie.language}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <Link to={`/student/films/${movie.movieId}`} style={{ fontSize: '12px', fontWeight: 600, color: '#1e3a8a', textDecoration: 'none' }}>
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', gridColumn: '1/-1' }}>
              No upcoming events scheduled yet. Check back soon!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
