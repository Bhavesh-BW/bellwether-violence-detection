import React, { useState, useEffect, useRef } from 'react';

export default function LiveHudFeed({
  activeCamera = 'market',
  cameras = [],
  onSwitchCamera,
  onAddCamera,
  onEditCamera,
  onRemoveCamera,
  fps = 25.0,
  latencyMs = 18.5,
  isViolenceActive = false,
  viewMode = 'focused',
  onViewModeChange,
  onDataRefresh
}) {
  const [internalViewMode, setInternalViewMode] = useState(viewMode || 'focused');
  const currentViewMode = onViewModeChange ? viewMode : internalViewMode;

  const handleModeChange = (mode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // Dual Grid Slot states
  const [slot1Cam, setSlot1Cam] = useState('live_cam_01');
  const [slot2Cam, setSlot2Cam] = useState('live_cam_01');

  useEffect(() => {
    if (cameras && cameras.length > 0) {
      if (!cameras.some(c => c.id === slot1Cam)) setSlot1Cam(cameras[0].id);
      if (!cameras.some(c => c.id === slot2Cam)) setSlot2Cam(cameras[1]?.id || cameras[0].id);
    }
  }, [cameras]);

  const [streamKey, setStreamKey] = useState(Date.now());
  const [hudOverlay, setHudOverlay] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCam, setEditingCam] = useState(null);

  // Add Camera form fields
  const [newCamName, setNewCamName] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('');
  const [newCamSource, setNewCamSource] = useState('');
  const [newCamRole, setNewCamRole] = useState('security');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const containerRef = useRef(null);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleRefreshFeed = () => {
    setStreamKey(Date.now());
    if (onDataRefresh) onDataRefresh();
  };

  const handleDownloadSnapshot = (camId) => {
    const link = document.createElement('a');
    link.href = `/api/snapshot?camera=${encodeURIComponent(camId)}&_t=${Date.now()}`;
    link.download = `threat_snapshot_${camId}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCamName.trim() || !newCamSource.trim()) {
      setFormError('Please provide both camera name and RTSP/video source path.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await onAddCamera({
        name: newCamName.trim(),
        location: newCamLocation.trim() || 'Sector Checkpoint',
        source: newCamSource.trim(),
        role: newCamRole
      });
      if (res && res.success) {
        setShowAddModal(false);
        setNewCamName('');
        setNewCamLocation('');
        setNewCamSource('');
      } else {
        setFormError(res?.error || 'Failed to add camera');
      }
    } catch (err) {
      setFormError(err.message || 'Error adding camera');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCam) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await onEditCamera(editingCam);
      if (res && res.success) {
        setShowEditModal(false);
        setEditingCam(null);
      } else {
        setFormError(res?.error || 'Failed to update camera');
      }
    } catch (err) {
      setFormError(err.message || 'Error editing camera');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCamInfo = cameras.find(c => c.id === activeCamera) || cameras[0] || {
    id: 'live_cam_01',
    name: 'Live Security Cam 1',
    location: 'Facility Perimeter',
    source: 'rtsps://admin:Admin%40123@124.123.89.162:40001/video/live?channel=1&subtype=0'
  };

  return (
    <div ref={containerRef} className="med-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header & Camera Selection Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left: Camera Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {cameras.map((cam) => {
            const isActive = cam.id === activeCamera;
            const isAlert = cam.is_alert || (isActive && isViolenceActive);
            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => onSwitchCamera(cam.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? (isAlert ? '#ef4444' : '#0284c7') : '#ffffff',
                  border: `1px solid ${isActive ? (isAlert ? '#ef4444' : '#0284c7') : 'var(--border-light)'}`,
                  color: isActive ? '#ffffff' : '#475569',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(2, 132, 199, 0.25)' : 'var(--shadow-card)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isAlert ? '#ffffff' : (cam.is_online ? '#10b981' : '#f59e0b'),
                  boxShadow: isAlert ? '0 0 8px #ffffff' : (cam.is_online ? '0 0 6px #10b981' : 'none')
                }} />
                <span>{cam.name}</span>
                {cam.current_violence_prob > 0.40 && (
                  <span style={{
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: isAlert ? '#7f1d1d' : 'rgba(245, 158, 11, 0.25)',
                    color: isAlert ? '#fecdd3' : '#b45309',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {Math.round(cam.current_violence_prob * 100)}%
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Camera Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: '#e0f2fe',
              border: '1px dashed #0284c7',
              color: '#0284c7',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span>+ Add Camera</span>
          </button>
        </div>

        {/* Right: View Mode & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Edit Active Camera */}
          <button
            type="button"
            onClick={() => {
              setEditingCam({ ...activeCamInfo });
              setShowEditModal(true);
            }}
            title="Configure Camera Properties"
            style={{
              padding: '6px 10px',
              borderRadius: '7px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              color: '#475569',
              fontSize: '11px',
              fontWeight: '700',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            ⚙️ Setup
          </button>

          {/* Delete Active Camera (if not protected primary live camera) */}
          {activeCamera !== 'live_cam_01' && (
            <button
              type="button"
              onClick={() => onRemoveCamera(activeCamera)}
              title="Remove Camera Checkpoint"
              style={{
                padding: '6px 10px',
                borderRadius: '7px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              🗑️ Delete
            </button>
          )}

          {/* View Mode: Focused vs Grid */}
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
              onClick={() => handleModeChange('focused')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: currentViewMode === 'focused' ? '#ffffff' : 'transparent',
                color: currentViewMode === 'focused' ? '#0f172a' : '#64748b',
                boxShadow: currentViewMode === 'focused' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              Focused
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('grid')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: currentViewMode === 'grid' ? '#ffffff' : 'transparent',
                color: currentViewMode === 'grid' ? '#0f172a' : '#64748b',
                boxShadow: currentViewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              Dual Grid
            </button>
          </div>

          {/* Refresh Stream */}
          <button
            type="button"
            onClick={handleRefreshFeed}
            title="Reload Video Stream Relay"
            style={{
              padding: '6px 10px',
              borderRadius: '7px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              color: '#475569',
              fontSize: '12px',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            🔄
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title="Fullscreen CCTV Mode"
            style={{
              padding: '6px 10px',
              borderRadius: '7px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)',
              color: '#475569',
              fontSize: '12px',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Main Video Presentation Stage */}
      {currentViewMode === 'focused' ? (
        /* Single Focused Camera Feed */
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          maxHeight: '720px',
          backgroundColor: '#020617',
          borderRadius: '12px',
          overflow: 'hidden',
          border: isViolenceActive ? '2px solid #ef4444' : '1px solid var(--border-light)',
          boxShadow: isViolenceActive ? '0 0 35px rgba(239, 68, 68, 0.4)' : 'var(--shadow-card)'
        }}>
          <img
            src={`/api/feed?camera=${encodeURIComponent(activeCamera)}&_t=${streamKey}`}
            alt={activeCamInfo.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />

          {/* Tactical Action Buttons Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '44px',
            right: '16px',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            <button
              type="button"
              onClick={() => handleDownloadSnapshot(activeCamera)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(4px)'
              }}
            >
              <span>📷 Capture Frame</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dual Multi-Camera Grid Stage */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px'
        }}>
          {/* Slot 1 */}
          <div style={{
            position: 'relative',
            aspectRatio: '16/9',
            backgroundColor: '#020617',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '12px',
              zIndex: 15,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <select
                value={slot1Cam}
                onChange={(e) => setSlot1Cam(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#0f172a',
                  fontSize: '11px',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {cameras.map(c => <option key={c.id} value={c.id} style={{ background: '#ffffff', color: '#0f172a' }}>Slot 1: {c.name}</option>)}
              </select>
            </div>
            <img
              src={`/api/feed?camera=${encodeURIComponent(slot1Cam)}&_t=${streamKey}`}
              alt="Slot 1 Feed"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* Slot 2 */}
          <div style={{
            position: 'relative',
            aspectRatio: '16/9',
            backgroundColor: '#020617',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '12px',
              zIndex: 15,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <select
                value={slot2Cam}
                onChange={(e) => setSlot2Cam(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#0f172a',
                  fontSize: '11px',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {cameras.map(c => <option key={c.id} value={c.id} style={{ background: '#ffffff', color: '#0f172a' }}>Slot 2: {c.name}</option>)}
              </select>
            </div>
            <img
              src={`/api/feed?camera=${encodeURIComponent(slot2Cam)}&_t=${streamKey}`}
              alt="Slot 2 Feed"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
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
            width: '460px',
            maxWidth: '90vw',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              📹 Register New Surveillance Camera Checkpoint
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
              Enter the RTSP stream URL, video file path, or webcam ID to deploy zero-lag violence detection.
            </p>

            {formError && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '12px',
                marginBottom: '14px'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Camera Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. South Corridor Gate 03"
                  value={newCamName}
                  onChange={(e) => setNewCamName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Location / Zone:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Food Court & West Wing"
                  value={newCamLocation}
                  onChange={(e) => setNewCamLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Source URL or Local Path:
                </label>
                <input
                  type="text"
                  placeholder="rtsp://... or test/video.mp4 or 0"
                  value={newCamSource}
                  onChange={(e) => setNewCamSource(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                >
                  {submitting ? 'Registering...' : 'Deploy Checkpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Camera Modal */}
      {showEditModal && editingCam && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
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
            width: '460px',
            maxWidth: '90vw',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              ⚙️ Edit Surveillance Checkpoint ({editingCam.id})
            </h3>

            {formError && (
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '12px',
                marginBottom: '14px'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Camera Name:
                </label>
                <input
                  type="text"
                  value={editingCam.name || ''}
                  onChange={(e) => setEditingCam({ ...editingCam, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Location:
                </label>
                <input
                  type="text"
                  value={editingCam.location || ''}
                  onChange={(e) => setEditingCam({ ...editingCam, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  Stream Source:
                </label>
                <input
                  type="text"
                  value={editingCam.source || ''}
                  onChange={(e) => setEditingCam({ ...editingCam, source: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
