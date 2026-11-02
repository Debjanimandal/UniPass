import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuthStore } from '../store/auth.store';
import { bookingsApi } from '../services/api.client';
import './GuardScanner.css';

interface ScanTicket {
  ticketId: number;
  studentName: string;
  studentEmail: string;
  seatCode: string;
  movieTitle: string;
  screenName: string;
  date: string;
  startTime: string;
}

interface ScanResult {
  ok: boolean;
  alreadyScanned?: boolean;
  scannedAt?: string | null;
  ticket?: ScanTicket;
  message: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });

const SCANNER_ID = 'guard-qr-reader';

export default function GuardScanner() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guard';

  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);

  const verify = async (qrToken: string) => {
    const token = qrToken.trim();
    if (!token || busyRef.current) return;
    busyRef.current = true;
    setVerifying(true);
    try {
      const res = await bookingsApi.scan(token);
      const data = res.data?.data;
      setResult({
        ok: true,
        alreadyScanned: data?.alreadyScanned,
        scannedAt: data?.scannedAt,
        ticket: data?.ticket,
        message: data?.alreadyScanned
          ? 'Already scanned — entry previously granted.'
          : 'Valid ticket — entry granted.',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Invalid or unrecognised QR code.';
      setResult({ ok: false, message: msg });
    } finally {
      setVerifying(false);
      // Small cooldown so a camera doesn't spam the same frame.
      setTimeout(() => { busyRef.current = false; }, 1200);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => { verify(decoded); },
        () => { /* ignore per-frame decode errors */ }
      );
      setCameraOn(true);
    } catch {
      setCameraError('Could not access the camera. You can paste the QR token manually below.');
      setCameraOn(false);
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try { await scanner.stop(); await scanner.clear(); } catch { /* noop */ }
      scannerRef.current = null;
    }
    setCameraOn(false);
  };

  // Clean up the camera when leaving the page.
  useEffect(() => {
    return () => { void stopCamera(); };
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="guard-page">
      <nav className="gs-top-nav">
        <Link to="/" className="gs-logo">
          <img src="/logo.png" alt="UniPass" />
          <span>UniPass</span>
        </Link>
        <div className="gs-user">
          <span>{fullName} · Guard</span>
          <button onClick={handleLogout} className="gs-logout">Log out</button>
        </div>
      </nav>

      <div className="gs-content">
        <h1>Ticket Scanner</h1>
        <p className="gs-sub">Scan a student's QR at the venue entrance. Only the exact QR for a valid, matching ticket is accepted.</p>

        <div className="gs-layout">
          {/* Scanner */}
          <div className="gs-panel">
            <h2>Scan QR</h2>
            <div id={SCANNER_ID} className="gs-reader" />
            {cameraError && <div className="gs-inline-error">{cameraError}</div>}
            <div className="gs-cam-actions">
              {!cameraOn ? (
                <button className="gs-btn primary" onClick={startCamera}>Start Camera</button>
              ) : (
                <button className="gs-btn" onClick={stopCamera}>Stop Camera</button>
              )}
            </div>

            <div className="gs-divider"><span>or paste token</span></div>

            <textarea
              className="gs-token-input"
              placeholder="Paste the QR token (JWT) here…"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              rows={3}
            />
            <button
              className="gs-btn primary full"
              disabled={verifying || !manualToken.trim()}
              onClick={() => verify(manualToken)}
            >
              {verifying ? 'Verifying…' : 'Verify Ticket'}
            </button>
          </div>

          {/* Result */}
          <div className="gs-panel">
            <h2>Result</h2>
            {!result ? (
              <div className="gs-result-empty">Scan or paste a QR to see the result.</div>
            ) : result.ok ? (
              <div className={`gs-result ${result.alreadyScanned ? 'warn' : 'ok'}`}>
                <div className="gs-result-head">
                  {result.alreadyScanned ? '⚠ Already Entered' : '✓ Entry Granted'}
                </div>
                <p className="gs-result-msg">{result.message}</p>
                {result.ticket && (
                  <div className="gs-ticket">
                    <div className="gs-trow"><span>Attendee</span><strong>{result.ticket.studentName}</strong></div>
                    <div className="gs-trow"><span>Movie</span><strong>{result.ticket.movieTitle}</strong></div>
                    <div className="gs-trow"><span>Seat</span><strong>{result.ticket.seatCode}</strong></div>
                    <div className="gs-trow"><span>Screen</span><strong>{result.ticket.screenName}</strong></div>
                    <div className="gs-trow"><span>Date</span><strong>{fmtDate(result.ticket.date)} · {fmtTime(result.ticket.startTime)}</strong></div>
                    <div className="gs-trow"><span>Ticket</span><strong>#{result.ticket.ticketId}</strong></div>
                    {result.alreadyScanned && result.scannedAt && (
                      <div className="gs-trow"><span>Scanned</span><strong>{new Date(result.scannedAt).toLocaleString()}</strong></div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="gs-result bad">
                <div className="gs-result-head">✕ Entry Denied</div>
                <p className="gs-result-msg">{result.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
