import React, { useState } from 'react';

export default function IncidentDossierModal({ incident, isOpen, onClose, onStatusChange }) {
  if (!isOpen || !incident) return null;

  const [notes, setNotes] = useState(incident.notes || '');
  const [currentStatus, setCurrentStatus] = useState(incident.status || 'open');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      await fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: incident.id, status: newStatus })
      });
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(incident.id, newStatus);
    } catch (e) {
      console.error("Status update error:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const severityColor = incident.severity === 'CRITICAL' ? '#ef4444' : (incident.severity === 'WARNING' ? '#f59e0b' : '#3b82f6');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: `2px solid ${severityColor}`,
        borderRadius: '20px',
        width: '840px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: `0 25px 60px -15px rgba(15,23,42,0.25), 0 0 35px ${severityColor}40`,
        position: 'relative'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: `${severityColor}18`,
              border: `1px solid ${severityColor}44`,
              color: severityColor,
              fontSize: '11px',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)'
            }}>
              INCIDENT ID: {incident.id}
            </span>
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: currentStatus === 'resolved' ? '#d1fae5' : (currentStatus === 'acknowledged' ? '#fef3c7' : '#fee2e2'),
              color: currentStatus === 'resolved' ? '#065f46' : (currentStatus === 'acknowledged' ? '#92400e' : '#991b1b'),
              fontSize: '10px',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>
              ● STATUS: {currentStatus}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              color: '#64748b',
              fontSize: '20px',
              fontWeight: '700',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Main Altercation Snapshot with HUD crosshairs */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            maxHeight: '400px',
            backgroundColor: '#020617',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${severityColor}88`,
            marginBottom: '20px'
          }}>
            {incident.photo_b64 ? (
              <img
                src={incident.photo_b64}
                alt={incident.camera_name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#64748b' }}>
                <span style={{ fontSize: '42px' }}>🥊</span>
                <span style={{ fontSize: '13px' }}>Digital Forensic Altercation Telemetry Frame Captured</span>
              </div>
            )}

            {/* Corner Crosshairs */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: `2px solid ${severityColor}`, borderLeft: `2px solid ${severityColor}` }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: `2px solid ${severityColor}`, borderRight: `2px solid ${severityColor}` }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: `2px solid ${severityColor}`, borderLeft: `2px solid ${severityColor}` }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: `2px solid ${severityColor}`, borderRight: `2px solid ${severityColor}` }} />
          </div>

          {/* Incident Forensic Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Camera Checkpoint</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginTop: '2px', display: 'block' }}>
                {incident.camera_name}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>📍 {incident.location}</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Detection Timestamp</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginTop: '2px', display: 'block', fontFamily: 'var(--font-mono)' }}>
                {incident.timestamp}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Est. Duration: {incident.duration_sec || 3.5}s</span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>ViT Model Confidence</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: severityColor, marginTop: '2px', display: 'block', fontFamily: 'var(--font-mono)' }}>
                {incident.confidence}% Match
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Severity: {incident.severity}</span>
            </div>
          </div>

          {/* Incident Assessment Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Incident Intelligence & Security Notes:
            </label>
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '13px',
              lineHeight: 1.5
            }}>
              {incident.notes || 'Aggressive confrontation detected. Rapid-response team dispatched.'}
            </div>
          </div>

          {/* Action Button Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={isUpdating || currentStatus === 'acknowledged'}
                onClick={() => handleUpdateStatus('acknowledged')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  backgroundColor: currentStatus === 'acknowledged' ? '#78350f' : '#b45309',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: currentStatus === 'acknowledged' ? 'default' : 'pointer'
                }}
              >
                Mark Acknowledged
              </button>

              <button
                type="button"
                disabled={isUpdating || currentStatus === 'resolved'}
                onClick={() => handleUpdateStatus('resolved')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  backgroundColor: currentStatus === 'resolved' ? '#065f46' : '#059669',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: currentStatus === 'resolved' ? 'default' : 'pointer'
                }}
              >
                Resolve & Close Incident
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                color: '#334155',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              📄 Print Forensic Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
