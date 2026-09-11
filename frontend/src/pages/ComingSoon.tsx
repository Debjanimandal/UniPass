import NavBar from '../components/NavBar';
import './ComingSoon.css';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div>
      <NavBar />
      <div className="coming-soon-page">
        <div className="container coming-soon-content">
          <div className="coming-soon-icon">🚧</div>
          <h1 className="heading-lg">{title}</h1>
          <p className="text-muted" style={{ fontSize: 'var(--text-lg)', marginTop: 8 }}>
            {description || 'This page is being built. Check back soon!'}
          </p>
        </div>
      </div>
    </div>
  );
}
