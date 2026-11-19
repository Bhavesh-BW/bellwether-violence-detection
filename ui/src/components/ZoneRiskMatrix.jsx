import React, { useState, useEffect } from 'react';

export default function ZoneRiskMatrix({ period = 'today' }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/zones')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setZones(data);
      })
      .catch(err => console.error("Error fetching zones:", err))
      .finally(() => setLoading(false));
  }, [period]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'MEDIUM': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'LOW': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default: return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  return (
    <div className="med-card" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Zone Security & Physical Threat Matrix
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Real-time security risk evaluation, physical incident density, and rapid-response tactical readiness per facility zone.
          </p>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '3px 9px',
          borderRadius: '9999px',
          backgroundColor: '#e0f2fe',
          color: '#0284c7'
        }}>
          4 Surveillance Sectors Active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {zones.map((z) => {
          const colors = getRiskColor(z.risk_level);
          return (
            <div
              key={z.id}
              style={{
                backgroundColor: '#f8fafc',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    {z.name}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: colors.bg,
                    color: colors.text,
                    fontSize: '10px',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {z.risk_level} RISK
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
                  {z.status}
                </div>
              </div>

              <div>
                {/* Risk Bar Meter */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#64748b' }}>Threat Index:</span>
                  <span style={{ fontWeight: '800', color: colors.text, fontFamily: 'var(--font-mono)' }}>
                    {z.risk_score} / 100
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${z.risk_score}%`,
                    backgroundColor: colors.text,
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* Footer specs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                  <span>📷 {z.cameras_assigned} Checkpoint</span>
                  <span>🥊 {z.active_incidents_today} Today</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
