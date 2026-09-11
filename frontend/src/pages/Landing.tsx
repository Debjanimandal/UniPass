import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './Landing.css';

const features = [
  {
    icon: '🎬',
    title: 'Discover Films & Events',
    desc: 'Browse the full programme of campus screenings, special events, and film society shows in one place.',
  },
  {
    icon: '💺',
    title: 'Choose Your Seat',
    desc: 'See the exact seat layout for your screening and pick the perfect spot — regular, premium, or VIP.',
  },
  {
    icon: '📱',
    title: 'Instant Digital Ticket',
    desc: 'Receive your secure QR ticket instantly. No printing needed — just open your phone at the door.',
  },
  {
    icon: '🛡️',
    title: 'Secure Entry',
    desc: 'Our cryptographic QR system ensures only valid, unmodified tickets grant venue access.',
  },
];

const steps = [
  { step: '01', title: 'Create your account', desc: 'Register with your university email in under 60 seconds.' },
  { step: '02', title: 'Find a screening', desc: 'Browse films and events, pick a date, time, and screen that works for you.' },
  { step: '03', title: 'Reserve your seat', desc: 'Select from the live seat map and confirm your booking with one click.' },
  { step: '04', title: 'Show your QR code', desc: 'Open your digital ticket and let the guard scan you in. Done.' },
];

const upcomingFilms = [
  {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    duration: '169 min',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIe.jpg',
    screenings: 2,
  },
  {
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    duration: '166 min',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    screenings: 1,
  },
  {
    title: 'Parasite',
    genre: 'Thriller',
    duration: '132 min',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    screenings: 1,
  },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <NavBar />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient-1" />
          <div className="hero-gradient-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge animate-fade-in">
            <span className="badge badge-blue">🎓 University of Excellence Film Society</span>
          </div>
          <h1 className="hero-title animate-fade-in delay-1">
            Your Campus Cinema,<br />
            <span className="hero-title-accent">Reimagined</span>
          </h1>
          <p className="hero-subtitle animate-fade-in delay-2">
            Discover films and events, choose your seat, and enter securely —<br className="hero-br" />
            all with one smart digital pass.
          </p>
          <div className="hero-actions animate-fade-in delay-3">
            <Link to="/register" className="btn btn-primary btn-xl">
              Get Your Pass
            </Link>
            <Link to="/films" className="btn btn-secondary btn-xl hero-btn-outline">
              Browse Films
            </Link>
          </div>
          <div className="hero-stats animate-fade-in delay-4">
            <div className="hero-stat">
              <span className="hero-stat-num">5+</span>
              <span className="hero-stat-label">Films this term</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">3</span>
              <span className="hero-stat-label">Campus screens</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">130+</span>
              <span className="hero-stat-label">Seats available</span>
            </div>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-indicator">
            <div className="scroll-dot" />
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="heading-md">Everything you need for campus cinema</h2>
            <p className="section-subtitle text-muted">
              From discovery to entry — UniPass handles the complete experience.
            </p>
          </div>
          <div className="grid-4 features-grid">
            {features.map((f, i) => (
              <div key={f.title} className={`feature-card animate-fade-in delay-${i + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Now Showing ──────────────────────────────────────── */}
      <section className="section now-showing-section">
        <div className="container">
          <div className="now-showing-header">
            <div>
              <h2 className="heading-md">Now Showing</h2>
              <p className="text-muted" style={{ marginTop: 6 }}>
                Current and upcoming films on campus
              </p>
            </div>
            <Link to="/films" className="btn btn-secondary">
              View All Films →
            </Link>
          </div>
          <div className="films-grid">
            {upcomingFilms.map((film) => (
              <div key={film.title} className="film-card">
                <div className="film-poster-wrap">
                  <img
                    src={film.poster}
                    alt={film.title}
                    className="film-poster"
                    loading="lazy"
                  />
                  <div className="film-overlay">
                    <Link to="/films" className="btn btn-primary btn-sm">
                      View Screenings
                    </Link>
                  </div>
                  <span className="film-badge badge badge-blue">{film.genre}</span>
                </div>
                <div className="film-info">
                  <h3 className="film-title">{film.title}</h3>
                  <div className="film-meta">
                    <span>⏱ {film.duration}</span>
                    <span>🎞 {film.screenings} screening{film.screenings !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="heading-md">How UniPass Works</h2>
            <p className="section-subtitle text-muted">
              Four simple steps from discovery to entry
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={s.step} className={`step-card animate-fade-in delay-${i + 1}`}>
                <div className="step-number">{s.step}</div>
                <div className="step-connector" />
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Ready to claim your seat?</h2>
              <p className="cta-subtitle">
                Join hundreds of students enjoying campus cinema with UniPass.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Account
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg cta-login-btn">
                  Already have an account? Log in →
                </Link>
              </div>
            </div>
            <div className="cta-graphic">
              <div className="cta-ticket">
                <div className="cta-ticket-header">
                  <div className="cta-ticket-dot" />
                  <div className="cta-ticket-dot" />
                  <div className="cta-ticket-dot" />
                </div>
                <div className="cta-ticket-qr">
                  <svg viewBox="0 0 100 100" width="90" height="90">
                    <rect x="10" y="10" width="35" height="35" fill="none" stroke="#1a56db" strokeWidth="4"/>
                    <rect x="20" y="20" width="15" height="15" fill="#1a56db"/>
                    <rect x="55" y="10" width="35" height="35" fill="none" stroke="#1a56db" strokeWidth="4"/>
                    <rect x="65" y="20" width="15" height="15" fill="#1a56db"/>
                    <rect x="10" y="55" width="35" height="35" fill="none" stroke="#1a56db" strokeWidth="4"/>
                    <rect x="20" y="65" width="15" height="15" fill="#1a56db"/>
                    <rect x="55" y="55" width="10" height="10" fill="#1a56db"/>
                    <rect x="70" y="55" width="10" height="10" fill="#1a56db"/>
                    <rect x="80" y="70" width="10" height="10" fill="#1a56db"/>
                    <rect x="55" y="80" width="10" height="10" fill="#1a56db"/>
                    <rect x="70" y="80" width="20" height="10" fill="#1a56db"/>
                  </svg>
                </div>
                <div className="cta-ticket-info">
                  <div className="cta-ticket-line" />
                  <div className="cta-ticket-line cta-ticket-line-sm" />
                </div>
                <div className="cta-ticket-badge">✓ VALID</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon logo-icon-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="currentColor" opacity="0.9"/>
                </svg>
              </div>
              <span className="footer-logo-text">UniPass</span>
            </div>
            <p className="footer-tagline">Smart Event Booking & Secure Entry</p>
          </div>
          <div className="footer-links">
            <Link to="/films">Films</Link>
            <Link to="/events">Events</Link>
            <Link to="/login">Log In</Link>
            <Link to="/register">Register</Link>
          </div>
          <p className="footer-copy">© 2026 UniPass. University project — internal use only.</p>
        </div>
      </footer>
    </div>
  );
}
