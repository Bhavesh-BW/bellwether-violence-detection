import React, { useEffect, useState, useRef } from 'react';
import { playTacticalChime, TACTICAL_CHIME_B64 } from '../utils/alertSound';

export default function CinematicThreatAlert({ alert, onDismiss, soundEnabled = true }) {
  const [countdown, setCountdown] = useState(14);
  const audioElemRef = useRef(null);

  useEffect(() => {
    if (!alert) return;
    if (soundEnabled) {
      playTacticalChime();
      if (audioElemRef.current) {
        audioElemRef.current.currentTime = 0;
        audioElemRef.current.play().catch(() => {});
      }
    }
    setCountdown(14);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss(alert);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alert, soundEnabled, onDismiss]);

  if (!alert) return null;

  const severityColor = alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';

  return (
    <div className="floating-threat-card" role="alert" aria-live="assertive">
      <audio ref={audioElemRef} src={TACTICAL_CHIME_B64} preload="auto" style={{ display: 'none' }} />
      <div className="cinematic-scanline" />

      {/* Top Header Badge & Close Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="threat-badge-flashing" style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.06em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>⚠️</span>
            <span>CRITICAL VIOLENCE DETECTED</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '10px',
            color: '#475569',
            fontFamily: 'var(--font-mono)',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            padding: '2px 7px',
            borderRadius: '4px'
          }}>
            {countdown}s
          </span>

          <button
            type="button"
            onClick={() => onDismiss(alert)}
            aria-label="Dismiss Alert"
            title="Dismiss Alert"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'color 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0f172a')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Center Target Lock Area */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
        {/* Tactical Crosshair Frame & Altercation Thumbnail */}
        <div style={{
          position: 'relative',
          width: '84px',
          height: '84px',
          borderRadius: '10px',
          backgroundColor: '#020617',
          border: `2px solid ${severityColor}`,
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: `0 0 18px ${severityColor}88`
        }}>
          {alert.photo_b64 ? (
            <img
              src={alert.photo_b64}
              alt={alert.camera_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              🥊
            </div>
          )}

          {/* Tactical Crosshair Reticle Overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '3px', left: '3px', width: '10px', height: '10px', borderTop: `2px solid ${severityColor}`, borderLeft: `2px solid ${severityColor}` }} />
            <div style={{ position: 'absolute', top: '3px', right: '3px', width: '10px', height: '10px', borderTop: `2px solid ${severityColor}`, borderRight: `2px solid ${severityColor}` }} />
            <div style={{ position: 'absolute', bottom: '3px', left: '3px', width: '10px', height: '10px', borderBottom: `2px solid ${severityColor}`, borderLeft: `2px solid ${severityColor}` }} />
            <div style={{ position: 'absolute', bottom: '3px', right: '3px', width: '10px', height: '10px', borderBottom: `2px solid ${severityColor}`, borderRight: `2px solid ${severityColor}` }} />
          </div>

          {/* Match Confidence Pill */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            backgroundColor: 'rgba(225, 29, 72, 0.95)',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: '800',
            textAlign: 'center',
            padding: '2px 0',
            fontFamily: 'var(--font-mono)'
          }}>
            CONF: {alert.confidence || 96.4}%
          </div>
        </div>

        {/* Altercation Intelligence Data */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            VIOLENCE DETECTED • {alert.camera_id?.toUpperCase() || 'CAM 01'}
          </div>
          <div style={{
            fontSize: '15px',
            fontWeight: '800',
            color: '#0f172a',
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {alert.camera_name || 'Public Concourse'}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#64748b',
            marginTop: '4px'
          }}>
            <span>📍 {alert.location || 'Perimeter Sector'}</span>
            <span>•</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#475569' }}>{alert.timestamp || 'Just now'}</span>
          </div>

          <div style={{
            fontSize: '11px',
            color: '#b91c1c',
            marginTop: '5px',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {alert.notes || 'Physical confrontation in progress. Immediate intervention advised.'}
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => {
            fetch('/api/alerts/acknowledge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: alert.id })
            }).catch(() => {});
            onDismiss(alert);
          }}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: '8px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
            transition: 'opacity 0.15s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <span>🚨 DISPATCH SECURITY UNIT</span>
        </button>

        <button
          type="button"
          onClick={() => onDismiss(alert)}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            fontSize: '12px',
            fontWeight: '700',
            border: '1px solid #e2e8f0'
          }}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
