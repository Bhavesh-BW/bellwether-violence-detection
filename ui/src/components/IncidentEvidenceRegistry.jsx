import React, { useState, useMemo } from 'react';

export default function IncidentEvidenceRegistry({
  incidents = [],
  onSelectIncident,
  onAcknowledgeIncident,
  onDataRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewType, setViewType] = useState('table'); // 'table' | 'cards'

  // Filtered incidents
  const filtered = useMemo(() => {
    return incidents.filter((item) => {
      const matchSearch = (
        (item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.camera_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchSev = severityFilter === 'ALL' || item.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchSev && matchStatus;
    });
  }, [incidents, searchTerm, severityFilter, statusFilter]);

  const getSeverityPill = (sev) => {
    const isCrit = sev === 'CRITICAL';
    const isWarn = sev === 'WARNING';
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: '6px',
        backgroundColor: isCrit ? 'rgba(239, 68, 68, 0.18)' : (isWarn ? 'rgba(245, 158, 11, 0.18)' : 'rgba(59, 130, 246, 0.18)'),
        color: isCrit ? '#ef4444' : (isWarn ? '#f59e0b' : '#60a5fa'),
        border: `1px solid ${isCrit ? '#ef444444' : (isWarn ? '#f59e0b44' : '#3b82f644')}`,
        fontSize: '10px',
        fontWeight: '800',
        fontFamily: 'var(--font-mono)'
      }}>
        {sev}
      </span>
    );
  };

  const getStatusPill = (st) => {
    const isResolved = st === 'resolved';
    const isAck = st === 'acknowledged';
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: '6px',
        backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.15)' : (isAck ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
        color: isResolved ? '#10b981' : (isAck ? '#fbbf24' : '#f87171'),
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase'
      }}>
        ● {st}
      </span>
    );
  };

  return (
    <div id="incident-registry-section" className="med-card" style={{ padding: '20px', marginBottom: '32px' }}>
      {/* Header & Search Bar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
              Violence Threat Incident Registry & Evidentiary Dossiers
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              border: '1px solid var(--border-light)',
              color: '#475569'
            }}>
              {filtered.length} Records
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Permanent forensic audit trail of all detected brawls, physical skirmishes, and security interventions with frame evidence.
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Text Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by ID, sector, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px 6px 28px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                color: '#0f172a',
                fontSize: '12px',
                width: '230px',
                outline: 'none',
                boxShadow: 'var(--shadow-card)'
              }}
            />
            <span style={{ position: 'absolute', left: '9px', top: '7px', fontSize: '11px', color: '#64748b' }}>
              🔍
            </span>
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              color: '#334155',
              fontSize: '12px',
              fontWeight: '700',
              outline: 'none',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning</option>
            <option value="SUSPICIOUS">Suspicious</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              color: '#334155',
              fontSize: '12px',
              fontWeight: '700',
              outline: 'none',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="open">Open Alerts</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => setViewType('table')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: viewType === 'table' ? '#ffffff' : 'transparent',
                color: viewType === 'table' ? '#0f172a' : '#64748b',
                boxShadow: viewType === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewType('cards')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: viewType === 'cards' ? '#ffffff' : 'transparent',
                color: viewType === 'cards' ? '#0f172a' : '#64748b',
                boxShadow: viewType === 'cards' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Presentation: Table or Cards */}
      {filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          No violence incidents match your current search criteria.
        </div>
      ) : viewType === 'table' ? (
        /* Table Mode */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: '#475569' }}>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Altercation Frame</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Incident ID</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Location / Checkpoint</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Detection Time</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Severity</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Confidence</th>
                <th style={{ padding: '10px 12px', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: '700', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => onSelectIncident(item)}
                >
                  {/* Evidence Thumbnail */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{
                      width: '54px',
                      height: '36px',
                      borderRadius: '6px',
                      backgroundColor: '#020617',
                      overflow: 'hidden',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.photo_b64 ? (
                        <img src={item.photo_b64} alt={item.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '14px' }}>🥊</span>
                      )}
                    </div>
                  </td>

                  {/* ID */}
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#0284c7' }}>
                    {item.id}
                  </td>

                  {/* Location */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.camera_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.location}</div>
                  </td>

                  {/* Timestamp */}
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: '#475569' }}>
                    {item.timestamp}
                  </td>

                  {/* Severity */}
                  <td style={{ padding: '10px 12px' }}>
                    {getSeverityPill(item.severity)}
                  </td>

                  {/* Confidence */}
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: '800', color: item.confidence >= 80 ? '#ef4444' : '#d97706' }}>
                    {item.confidence}%
                  </td>

                  {/* Status */}
                  <td style={{ padding: '10px 12px' }}>
                    {getStatusPill(item.status)}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(item);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards Mode */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectIncident(item)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                borderRadius: '8px',
                backgroundColor: '#020617',
                overflow: 'hidden',
                marginBottom: '10px',
                position: 'relative'
              }}>
                {item.photo_b64 ? (
                  <img src={item.photo_b64} alt={item.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                    🥊
                  </div>
                )}
                <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                  {getSeverityPill(item.severity)}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {item.confidence}% Match
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#64748b' }}>
                  {item.id}
                </span>
                {getStatusPill(item.status)}
              </div>

              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>
                {item.camera_name}
              </div>

              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                📍 {item.location} • {item.timestamp}
              </div>

              <div style={{
                fontSize: '11px',
                color: '#334155',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.notes || 'Aggressive confrontation detected.'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
