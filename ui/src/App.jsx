import React, { useState, useEffect, useCallback, useRef } from 'react';
import KpiCards from './components/KpiCards';
import LiveHudFeed from './components/LiveHudFeed';
import ThreatTrendChart from './components/ThreatTrendChart';
import ZoneRiskMatrix from './components/ZoneRiskMatrix';
import IncidentEvidenceRegistry from './components/IncidentEvidenceRegistry';
import CinematicThreatAlert from './components/CinematicThreatAlert';
import IncidentDossierModal from './components/IncidentDossierModal';
import { playTacticalChime } from './utils/alertSound';

export default function App() {
  // Live IST Clock
  const [clockTime, setClockTime] = useState(() => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) + ' IST';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }) + ' IST');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // System states
  const [kpis, setKpis] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [activeCamera, setActiveCamera] = useState('live_cam_01');
  const [viewMode, setViewMode] = useState('focused');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [trendRange, setTrendRange] = useState('today');
  const trendRangeRef = useRef('today');
  const [trendData, setTrendData] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch KPI & status data
  const fetchData = useCallback(async () => {
    try {
      const currentRange = trendRangeRef.current || 'today';
      const ts = Date.now();
      const [kpiRes, camRes, trendRes, alertRes] = await Promise.all([
        fetch(`/api/kpis?range=${encodeURIComponent(currentRange)}&_t=${ts}`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(`/api/cameras?_t=${ts}`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(`/api/threat-trend?range=${encodeURIComponent(currentRange)}&_t=${ts}`, { cache: 'no-store' }).then(r => r.json()).catch(() => null),
        fetch(`/api/alerts?limit=150&_t=${ts}`, { cache: 'no-store' }).then(r => r.json()).catch(() => null)
      ]);

      if (kpiRes) {
        setKpis(kpiRes);
        if (typeof kpiRes.sound_enabled === 'boolean') {
          setSoundEnabled(kpiRes.sound_enabled);
        }
      }
      if (camRes?.cameras) {
        setCameras(camRes.cameras);
        if (camRes.active) setActiveCamera(camRes.active);
      }
      if (trendRes) setTrendData(trendRes);
      if (alertRes) setIncidents(alertRes);
    } catch (e) {
      console.error("Fetch data error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect to SSE real-time threat alert stream
  useEffect(() => {
    let evtSource = null;
    try {
      evtSource = new EventSource('/api/alerts/events');
      evtSource.addEventListener('alert', (e) => {
        try {
          const alertPayload = JSON.parse(e.data);
          if (soundEnabled) {
            playTacticalChime();
          }
          setActiveAlert(alertPayload);
          setIncidents((prev) => [alertPayload, ...(prev || []).filter(a => a.id !== alertPayload.id)]);
        } catch (err) {
          console.error("Error processing SSE alert event:", err);
        }
      });
    } catch (e) {
      console.warn("SSE stream unavailable:", e);
    }
    return () => {
      if (evtSource) evtSource.close();
    };
  }, [soundEnabled]);

  // Periodic polling for KPIs and status
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDismissAlert = (alertObj) => {
    if (alertObj?.id) {
      fetch('/api/alerts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertObj.id })
      }).catch(() => {});
    }
    setActiveAlert(null);
  };

  const handleSwitchCamera = async (camId) => {
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera: camId })
      });
      if (res.ok) {
        setActiveCamera(camId);
        fetchData();
      }
    } catch (e) {
      console.error("Switch camera error:", e);
    }
  };

  const handleAddCamera = async ({ name, location, source, role }) => {
    try {
      const res = await fetch('/api/cameras/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, source, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add camera');
      await fetchData();
      if (data.camera_id) {
        await handleSwitchCamera(data.camera_id);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const handleEditCamera = async ({ id, name, location, source, role }) => {
    try {
      const res = await fetch('/api/cameras/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, location, source, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to edit camera');
      await fetchData();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const handleRemoveCamera = async (camId) => {
    if (camId === 'live_cam_01') {
      alert("Primary live security camera checkpoint is protected and cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this surveillance checkpoint?")) return;
    try {
      const res = await fetch('/api/cameras/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: camId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove camera');
      await fetchData();
    } catch (e) {
      alert(`Error removing camera: ${e.message}`);
    }
  };

  const handleTrendRangeChange = async (newRange) => {
    setTrendRange(newRange);
    trendRangeRef.current = newRange;
    try {
      const [trendRes, kpiRes] = await Promise.all([
        fetch(`/api/threat-trend?range=${encodeURIComponent(newRange)}`).then(r => r.json()).catch(() => null),
        fetch(`/api/kpis?range=${encodeURIComponent(newRange)}`).then(r => r.json()).catch(() => null)
      ]);
      if (Array.isArray(trendRes)) setTrendData(trendRes);
      if (kpiRes) setKpis(kpiRes);
    } catch (e) {
      console.error("Trend/KPI fetch error:", e);
    }
  };

  const handleTriggerTestAlert = async () => {
    try {
      if (soundEnabled) {
        playTacticalChime();
      }
      const activeCamObj = cameras.find(c => c.id === activeCamera);
      const res = await fetch('/api/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_name: activeCamObj?.name || 'Live Surveillance Checkpoint',
          location: activeCamObj?.location || 'Main Hospital Entrance'
        })
      });
      const data = await res.json();
      if (data?.alert) {
        setActiveAlert(data.alert);
      }
      fetchData();
    } catch (e) {
      console.error("Test alert error:", e);
    }
  };

  const isViolenceLive = kpis?.is_violence_active || kpis?.threat_status === 'CRITICAL_VIOLENCE';

  return (
    <div style={{ minHeight: '100vh', padding: '24px 32px', maxWidth: '1720px', margin: '0 auto' }}>
      {/* Floating Tactical Threat Alert Card */}
      <CinematicThreatAlert
        alert={activeAlert}
        onDismiss={handleDismissAlert}
        soundEnabled={soundEnabled}
      />

      {/* Forensic Incident Dossier Modal */}
      <IncidentDossierModal
        incident={selectedIncident}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        onStatusChange={(id, newStatus) => {
          setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
          fetchData();
        }}
      />

      {/* Main Tactical Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              GoDezk Vision AI – Tactical Violence & Physical Threat Detection System
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: isViolenceLive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${isViolenceLive ? '#ef4444' : '#10b981'}`,
              color: isViolenceLive ? '#f87171' : '#10b981',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isViolenceLive ? '#ef4444' : '#10b981',
                boxShadow: `0 0 8px ${isViolenceLive ? '#ef4444' : '#10b981'}`
              }}></span>
              {isViolenceLive ? 'THREAT DETECTED' : 'SYSTEM LIVE'}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              border: '1px solid var(--border-light)',
              color: '#0284c7',
              fontSize: '12px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)'
            }}>
              🟢 {clockTime}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-camera Vision Transformer (ViT-Base-224, 85.8M params) real-time violence detection, automated physical confrontation alerting, zero-lag edge tracking, and forensic dossier management.
          </p>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Period Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: '5px 12px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Period:</span>
            <select
              value={trendRange}
              onChange={(e) => handleTrendRangeChange(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '12px',
                fontWeight: '700',
                color: '#0284c7',
                cursor: 'pointer',
                outline: 'none',
                padding: '2px 0'
              }}
            >
              <option value="today" style={{ background: '#ffffff', color: '#0f172a' }}>• Today (Live Shift)</option>
              <option value="yesterday" style={{ background: '#ffffff', color: '#0f172a' }}>Yesterday</option>
              <option value="7d" style={{ background: '#ffffff', color: '#0f172a' }}>Past 7 Days</option>
              <option value="30d" style={{ background: '#ffffff', color: '#0f172a' }}>Past 30 Days</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (nextState) {
                playTacticalChime();
              }
            }}
            title={soundEnabled ? 'Siren Audio Alerts Active' : 'Siren Muted'}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: soundEnabled ? '#d1fae5' : '#ffffff',
              border: `1px solid ${soundEnabled ? '#10b981' : 'var(--border-light)'}`,
              color: soundEnabled ? '#059669' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <span>{soundEnabled ? '🔔 Siren ON' : '🔕 Siren OFF'}</span>
          </button>

          {/* Test Alert Button */}
          <button
            type="button"
            onClick={handleTriggerTestAlert}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <span>⚡ Test Threat HUD</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchData}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 8 Violence Intelligence KPI Cards */}
      <KpiCards kpis={kpis} period={trendRange} onDataRefresh={fetchData} />

      {/* Main Surveillance Stage (LiveHudFeed + ThreatTrendChart) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
        <LiveHudFeed
          activeCamera={activeCamera}
          cameras={cameras}
          onSwitchCamera={handleSwitchCamera}
          onAddCamera={handleAddCamera}
          onEditCamera={handleEditCamera}
          onRemoveCamera={handleRemoveCamera}
          fps={kpis?.fps}
          latencyMs={kpis?.inference_latency_ms}
          isViolenceActive={isViolenceLive}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onDataRefresh={fetchData}
        />
        <ThreatTrendChart
          trendData={trendData}
          activeFilter={trendRange}
          onFilterChange={handleTrendRangeChange}
        />
      </div>

      {/* Zone Security Risk Assessment Matrix */}
      <ZoneRiskMatrix period={trendRange} />

      {/* Incident Evidence Registry & Dossier Table */}
      <IncidentEvidenceRegistry
        incidents={incidents}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        onDataRefresh={fetchData}
      />
    </div>
  );
}
