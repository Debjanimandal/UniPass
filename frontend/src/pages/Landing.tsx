import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './Landing.css';

const upcomingFilms = [
  {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    duration: '169 min',
    poster: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
    date: '15 Sept 2026',
    time: '6:00 PM',
    screen: 'Screen 1',
    price: '₹250'
  },
  {
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: '148 min',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    date: '16 Sept 2026',
    time: '4:00 PM',
    screen: 'Screen 2',
    price: '₹220'
  },
  {
    title: 'The Dark Knight',
    genre: 'Action',
    duration: '152 min',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    date: '16 Sept 2026',
    time: '6:30 PM',
    screen: 'Screen 1',
    price: '₹200'
  },
  {
    title: 'Oppenheimer',
    genre: 'Biography',
    duration: '180 min',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    date: '22 Sept 2026',
    time: '5:00 PM',
    screen: 'Screen 2',
    price: '₹250'
  },
  {
    title: 'Spider-Man: No Way Home',
    genre: 'Action',
    duration: '148 min',
    poster: 'https://upload.wikimedia.org/wikipedia/en/0/00/Spider-Man_No_Way_Home_poster.jpg',
    date: '22 Sept 2026',
    time: '6:00 PM',
    screen: 'Screen 1',
    price: '₹220'
  },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <NavBar />

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-left">
            <span className="hero-kicker">CAMPUS EVENTS, MADE SIMPLE</span>
            <h1 className="hero-title">
              Your Campus.<br />
              Your Movies.<br />
              <span className="text-blue">Your Pass.</span>
            </h1>
            <p className="hero-desc">
              Discover campus screenings and events, reserve your seat, and enter securely with a digital pass.
            </p>
            
            <div className="hero-buttons">
              <Link to="/screenings" className="btn btn-hero-primary">
                Browse Screenings &rarr;
              </Link>
              <button className="btn btn-hero-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
                </svg>
                How It Works
              </button>
            </div>

            <div className="hero-features">
              <div className="hf-item">
                <div className="hf-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <span>Reserve<br/>Your Seat</span>
              </div>
              <div className="hf-item">
                <div className="hf-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="1"></rect></svg>
                </div>
                <span>Secure<br/>QR Entry</span>
              </div>
              <div className="hf-item">
                <div className="hf-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <span>Exclusive<br/>Campus Events</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-wrapper">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Campus Building" className="hero-bg-img" />
              <div className="hero-img-overlay">
                <h2>Good<br/>Movies<br/>Better<br/>People<br/><span className="overlay-logo">UniPass</span></h2>
              </div>
            </div>

            <div className="hero-floating-ticket">
              <div className="ft-header">
                <div className="ft-logo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  UniPass
                </div>
              </div>
              <div className="ft-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=unipass-demo-ticket" alt="QR Code" />
              </div>
              <div className="ft-details">
                <h3>INTERSTELLAR</h3>
                <p>15 Sept 2026<br/>6:00 PM<br/>Screen 1 • Seat A3</p>
                <div className="ft-badge">✓ Valid</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Screenings ──────────────────────────────── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-top">
            <div>
              <span className="section-kicker">UPCOMING SCREENINGS</span>
              <h2 className="section-title">Featured Screenings</h2>
              <p className="section-desc">Catch the latest movies and special events happening on campus.</p>
            </div>
            <Link to="/screenings" className="view-all-link">
              View All Screenings &rarr;
            </Link>
          </div>

          <div className="movies-grid">
            {upcomingFilms.map((film, idx) => (
              <div key={idx} className="movie-card">
                <img src={film.poster} alt={film.title} className="mc-poster" />
                <div className="mc-body">
                  <h3 className="mc-title">{film.title}</h3>
                  <p className="mc-meta">{film.genre} • {film.duration}</p>
                  <div className="mc-schedule">
                    <div className="mc-row"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> {film.date}</div>
                    <div className="mc-row"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {film.time}</div>
                    <div className="mc-row"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg> {film.screen}</div>
                  </div>
                  <div className="mc-price">{film.price}</div>
                  <Link to="/register" className="btn btn-book-now">Book Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About Section ────────────────────────────────────── */}
      <section className="about-section">
        <div className="container about-container">
          <div className="about-left">
            <div className="cinema-screen-wrap">
              <img src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Cinema Screen" className="cinema-img" />
              <div className="cinema-screen-content">
                <h3>More<br/>Than<br/>Movies</h3>
                <span className="cinema-logo">UniPass</span>
              </div>
            </div>
          </div>
          <div className="about-right">
            <span className="section-kicker">A BETTER CAMPUS EXPERIENCE</span>
            <h2 className="section-title">Built for Students,<br/>by Students</h2>
            <p className="about-desc">
              UniPass makes it easy to discover, book, and enjoy campus screenings and events — all in one place. With secure digital tickets and a seamless entry experience, you can focus on what really matters: great movies and great company.
            </p>
            
            <div className="about-features">
              <div className="af-item">
                <div className="af-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="af-text">
                  <h4>Easy Booking</h4>
                  <p>Find your favorite movies and book in seconds.</p>
                </div>
              </div>
              <div className="af-item">
                <div className="af-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div className="af-text">
                  <h4>Secure & Reliable</h4>
                  <p>QR-based entry with advanced security.</p>
                </div>
              </div>
              <div className="af-item">
                <div className="af-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                </div>
                <div className="af-text">
                  <h4>Made for Campus</h4>
                  <p>Exclusive screenings and events, right at your university.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonial Section ──────────────────────────────── */}
      <section className="testimonial-section">
        <div className="container text-center">
          <span className="section-kicker">WHAT PEOPLE SAY</span>
          <h2 className="section-title">Loved by the Campus Community</h2>
          <p className="section-desc text-center">Hear from students who've experienced UniPass.</p>
        </div>
      </section>

    </div>
  );
}
