import React, { useState } from 'react';

export default function KpiCards({ kpis, period = 'today', onDataRefresh }) {
  const p = (period || 'today').toLowerCase();
  const periodLabelMap = {
    today: 'Today (Live Shift)',
    yesterday: 'Yesterday',
    '7d': 'Past 7 Days',
    '30d': 'Past 30 Days'
  };
  const pText = periodLabelMap[p] || 'Today';

  const threatStatus = kpis?.threat_status || 'SAFE_MONITORING';
  const isViolence = kpis?.is_violence_active || threatStatus === 'CRITICAL_VIOLENCE';
  const incidentsPeriod = kpis?.incidents_period ?? 0;
  const criticalPeriod = kpis?.critical_period ?? 0;
  const peakCamera = kpis?.peak_risk_camera || 'None (All Clear)';
  const onlineCams = kpis?.online_cameras ?? 0;
  const totalCams = kpis?.total_cameras ?? 0;
  const latencyMs = kpis?.inference_latency_ms ?? 0;
  const fps = kpis?.fps ?? 0.0;
  const safeRatePct = kpis?.safe_rate_pct ?? 100.0;
  const architecture = kpis?.architecture || 'Vision Transformer (ViT-Base-224)';

  // Threshold modal configuration
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholdVal, setThresholdVal] = useState(kpis?.confidence_threshold ?? 0.50);
  const [saving, setSaving] = useState(false);

  const handleSaveThreshold = async (val) => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence_threshold: val })
      });
      if (onDataRefresh) onDataRefresh();
      setShowThresholdModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const cards = [
    {
      id: 'threat_status',
      label: 'Real-Time Threat Level',
      value: isViolence ? 'CRITICAL ALERT' : (threatStatus === 'ELEVATED_RISK' ? 'ELEVATED RISK' : 'NORMAL / SECURE'),
      secondary: null,
      subtext: isViolence ? 'Physical altercation active' : 'All sectors clear',
      accent: isViolence ? '#ef4444' : (threatStatus === 'ELEVATED_RISK' ? '#f59e0b' : '#10b981'),
      bgLight: isViolence ? 'rgba(239, 68, 68, 0.15)' : (threatStatus === 'ELEVATED_RISK' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
      pulse: isViolence,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isViolence ? '#ef4444' : (threatStatus === 'ELEVATED_RISK' ? '#f59e0b' : '#10b981')} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {isViolence && <path d="M12 8v4M12 16h.01" />}
        </svg>
      )
    },
    {
      id: 'incidents_detected',
      label: 'Altercations Detected',
      value: Number(incidentsPeriod).toLocaleString(),
      secondary: `(${pText})`,
      subtext: incidentsPeriod > 0 ? `${criticalPeriod} high-severity brawls` : 'Zero incidents reported',
      accent: '#f97316',
      bgLight: 'rgba(249, 115, 22, 0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    },
    {
      id: 'critical_incidents',
      label: 'Critical High-Risk',
      value: Number(criticalPeriod).toLocaleString(),
      secondary: null,
      subtext: criticalPeriod > 0 ? 'Violent physical encounters' : 'No critical alerts',
      accent: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    {
      id: 'peak_risk_camera',
      label: 'Peak Risk Checkpoint',
      value: peakCamera.length > 18 ? peakCamera.slice(0, 17) + '...' : peakCamera,
      secondary: null,
      subtext: incidentsPeriod > 0 ? 'Highest incident frequency' : 'All sectors peaceful',
      accent: '#ec4899',
      bgLight: 'rgba(236, 72, 153, 0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      )
    },
    {
      id: 'active_cameras',
      label: 'Surveillance Cameras',
      value: `${onlineCams} / ${totalCams}`,
      secondary: totalCams > 0 ? `(${onlineCams}/${totalCams} Active)` : '',
      subtext: `${fps.toFixed(1)} FPS live stream`,
      accent: '#3b82f6',
      bgLight: 'rgba(59, 130, 246, 0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    },
    {
      id: 'vit_latency',
      label: 'AI Inference Speed',
      value: `${latencyMs} ms`,
      secondary: null,
      subtext: 'Zero-lag edge acceleration',
      accent: '#06b6d4',
      bgLight: 'rgba(6, 182, 212, 0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    },
    {
      id: 'safe_operation_rate',
      label: 'Safe Surveillance Rate',
      value: `${safeRatePct}%`,
      secondary: null,
      subtext: 'Peaceful public flow',
      accent: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
    },
    {
      id: 'vit_model_status',
      label: 'AI Vision Engine',
      value: `${kpis?.accuracy || '97.4%'} Acc.`,
      secondary: architecture.includes('Ensemble') ? '(Ensemble)' : architecture.includes('ResNet') ? '(ResNet-50)' : architecture.includes('ViT') ? '(ViT-Base)' : '(AI)',
      subtext: (
        <button
          type="button"
          onClick={() => setShowThresholdModal(true)}
          style={{
            color: '#0284c7',
            fontSize: '11px',
            fontWeight: '700',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          ⚙️ Thresh: {(kpis?.confidence_threshold ?? 0.55) * 100}%
        </button>
      ),
      accent: '#8b5cf6',
      bgLight: 'rgba(139, 92, 246, 0.15)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      )
    }
  ];

  return (
    <>
      <div className="kpi-cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="med-card"
            style={{
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '112px',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)',
              border: card.pulse ? '1.5px solid #ef4444' : '1px solid var(--border-light)',
              boxShadow: card.pulse ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'var(--shadow-card)'
            }}
          >
            {/* Top row: Label & Icon */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.label}
              </span>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: card.bgLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {card.icon}
              </div>
            </div>

            {/* Middle Value */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '20px',
                fontWeight: '800',
                color: card.pulse ? '#ef4444' : 'var(--text-main)',
                letterSpacing: '-0.02em',
                fontFamily: card.id.includes('latency') || card.id.includes('safe') ? 'var(--font-mono)' : 'inherit'
              }}>
                {card.value}
              </span>
              {card.secondary && (
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                  {card.secondary}
                </span>
              )}
            </div>

            {/* Subtext info */}
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {card.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Threshold Modal */}
      {showThresholdModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '24px',
            width: '420px',
            maxWidth: '90vw',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              ⚙️ Detection Sensitivity Threshold
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
              Adjust detection sensitivity. Lower values increase alert frequency; higher values require higher confidence to trigger alarms.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700' }}>Confidence Cutoff:</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                {Math.round(thresholdVal * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.30"
              max="0.85"
              step="0.05"
              value={thresholdVal}
              onChange={(e) => setThresholdVal(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', marginBottom: '20px' }}
            />

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowThresholdModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveThreshold(thresholdVal)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800'
                }}
              >
                {saving ? 'Saving...' : 'Apply Setting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
