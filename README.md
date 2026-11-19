# GoDezk Vision AI – Tactical Violence & Physical Threat Detection System

Standalone AI intelligence service and cyber-tactical command dashboard for real-time violence detection, automated altercation alerting, zero-lag edge tracking, and forensic dossier analysis.

## Key Features
- **Multi-Camera Edge Ingestion**: Supports concurrent RTSP feeds, MP4 video looping, and USB webcams.
- **Vision Transformer (ViT) Offline Engine**: Evaluates live frames using a local 85.8M parameter ViT-Base (`models/violence_vit.pth`) at 98.8% accuracy, with ResNet fallback.
- **Temporal Anti-Hallucination Smoothing**: EMA smoothing filter prevents false positives and momentary flicker.
- **Cinematic Threat Alert HUD**: Instant floating alert card with scanlines, perpetrator altercation snapshot, confidence meter, and audio siren.
- **Multi-Camera HUD Stage**: Real-time MJPEG live stream with tactical crosshairs, latency metrics, and dual multi-grid viewer.
- **Forensic Dossier Modal**: Comprehensive evidence review with timestamped telemetry, status tracking (Open / Acknowledged / Resolved), and print/export reporting.
- **Full Historical Registry**: SQLite persistence (`violence_tracker.db`) with filterable incident logs and trend graphs.

## Quick Start

### 1. Launch Backend Server (Serves UI + APIs on Port 8200)
```bat
start.bat
```
Or directly:
```bash
cd backend
py -3.11 violence_server.py
```
Open **`http://localhost:8200`** in any browser.

### 2. Frontend Development (Hot-Reload on Port 8192)
```bash
cd ui
npm install
npm run dev
```
Open **`http://localhost:8192`**.
