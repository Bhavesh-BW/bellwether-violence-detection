import React from 'react';

export default function ThreatTrendChart({ trendData = [], activeFilter = 'today', onFilterChange }) {
  const filterOptions = [
    { key: 'today', label: '• Today (Shift)' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7d', label: 'Past 7 Days' },
    { key: '30d', label: 'Past 30 Days' }
  ];

  const totalIncidents = trendData.reduce((acc, d) => acc + (d.total_incidents || 0), 0);
  const totalCritical = trendData.reduce((acc, d) => acc + (d.critical || 0), 0);
  const maxVal = Math.max(...trendData.map(d => d.total_incidents || 0), 4);

  return (
    <div className="med-card" style={{ padding: '20px' }}>
      {/* Chart Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
              Violence Threat Timeline & Altercation Density
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: totalIncidents > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: totalIncidents > 0 ? '#ef4444' : '#059669'
            }}>
              {totalIncidents > 0 ? `${totalIncidents} incidents recorded` : '0 Incidents (All Clear)'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Temporal distribution of aggressive behavior and critical physical confrontations detected by ViT models.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#f1f5f9',
          border: '1px solid var(--border-light)',
          padding: '3px',
          borderRadius: '8px'
        }}>
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onFilterChange && onFilterChange(opt.key)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: activeFilter === opt.key ? '#ffffff' : 'transparent',
                color: activeFilter === opt.key ? '#0f172a' : 'var(--text-muted)',
                boxShadow: activeFilter === opt.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Presentation */}
      <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
        {trendData.length === 0 ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
            Collecting real-time surveillance timeline data...
          </div>
        ) : (
          trendData.map((d, idx) => {
            const count = d.total_incidents || 0;
            const crit = d.critical || 0;
            const heightPct = Math.max(8, Math.min(100, (count / maxVal) * 100));
            const hasCrit = crit > 0;

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative'
                }}
                title={`${d.label}: ${count} total incidents (${crit} critical)`}
              >
                {/* Bar Value Tooltip Badge */}
                {count > 0 && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)',
                    color: hasCrit ? '#ef4444' : '#d97706',
                    marginBottom: '3px'
                  }}>
                    {count}
                  </span>
                )}

                {/* Vertical Bar */}
                <div style={{
                  width: '100%',
                  maxWidth: '24px',
                  height: `${heightPct}%`,
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: count === 0 ? '#e2e8f0' : (hasCrit ? '#ef4444' : '#f59e0b'),
                  boxShadow: count > 0 ? (hasCrit ? '0 0 10px rgba(239, 68, 68, 0.35)' : '0 0 8px rgba(245, 158, 11, 0.25)') : 'none',
                  transition: 'height 0.3s ease, background-color 0.2s'
                }} />
              </div>
            );
          })
        )}
      </div>

      {/* X-Axis Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
        {trendData.length > 0 ? (
          <>
            <span>{trendData[0]?.label}</span>
            {trendData.length > 2 && <span>{trendData[Math.floor(trendData.length / 2)]?.label}</span>}
            <span>{trendData[trendData.length - 1]?.label}</span>
          </>
        ) : (
          <span>00:00</span>
        )}
      </div>

      {/* Legend Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
          <span>Critical Altercations ({totalCritical})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
          <span>Elevated / Aggression</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#cbd5e1' }} />
          <span>Surveillance Baseline</span>
        </div>
      </div>
    </div>
  );
}
