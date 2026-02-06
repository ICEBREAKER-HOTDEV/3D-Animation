# 🌊 Water Treatment Plant (WTP) 3D Visualization

A real-time 3D visualization of a Water Treatment Plant using Three.js, featuring live data integration, interactive controls, and comprehensive monitoring capabilities.

## ✨ Features

### 🎨 3D Visualization
- **Interactive 3D Model**: Fully interactive water treatment plant model with orbit controls
- **Realistic Rendering**: PBR materials, shadows, and lighting for photorealistic appearance
- **Transparent Tanks**: Glass-like tank materials to see water levels inside
- **Dynamic Water Levels**: Real-time water level animations with smooth interpolation

### 📊 Real-time Monitoring
- **Live Data Updates**: Automatic polling from API every 3 seconds
- **Tank Monitoring**:
  - Raw Water Tank (RWT)
  - Chemical Storage Tank (CST)
  - Coagulation/Flocculation Tank (CFT)
  - Sedimentation Tank (SCT) - 2 tanks
  - Clean Water Tank (CWT) - 2 tanks
  - Sludge Tank (SLT)
- **Pump Status**: Visual indicators for pump on/off/fault states
- **Mixer/Scraper Animation**: Rotating animations when active
- **Water Quality Metrics**: pH, turbidity, chlorine levels, etc.

### 🔔 Alarm System
- **Visual Alarms**: Pulsing red indicators for alarm conditions
- **Alarm Panel**: Real-time alarm list with active warnings
- **Multi-level Alarms**: High/low level alarms for critical tanks

### 🔐 Authentication
- **Secure Login**: Token-based authentication with login modal
- **Persistent Sessions**: Auto-saves bearer token to localStorage
- **Auto Re-authentication**: Handles token expiration gracefully
- **Logout Capability**: Clear credentials and re-login

### 🎮 Interactive Controls
- **Camera Controls**: Orbit, pan, zoom with mouse/touch
- **Reset View**: Quick button to reset camera position
- **Toggle Labels**: Show/hide component labels
- **Collapsible Dashboard**: Expandable sections for detailed data

## 🎬 Demo

The visualization includes:
- 6 different tank types with dynamic water levels
- 2 pumps with status indicators
- Mixers and scrapers with rotation animations
- Pipe flow visualizations
- Comprehensive dashboard with 10+ data sections

## 📦 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Modern Web Browser** (Chrome, Firefox, Edge, Safari)
- **Internet Connection** (for API access and CDN resources)

## 🚀 Installation

1. **Clone or download the repository**
   ```bash
   git clone ...
   ```

2. **Verify files are present**
   ```bash
   # You should have these files:
   # - index.html
   # - wtp-visualizer.js
   # - api-config.js
   # - wtp-model.glb (your 3D model file)
   ```

3. **No npm install needed!** This project uses ES6 modules and CDN imports.

## ▶️ Running the Project

### Method 1: Using npx serve (Recommended)

```bash
npx serve .
```

This will:
- Start a local development server
- Automatically open your browser
- Typically runs on `http://localhost:3000`

**Output example:**
```
   ┌────────────────────────────────────────┐
   │                                        │
   │   Serving!                             │
   │                                        │
   │   - Local:    http://localhost:3000    │
   │   - Network:  http://192.168.1.x:3000  │
   │                                        │
   └────────────────────────────────────────┘
```

### Method 2: Using Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Method 3: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 🔑 Login Credentials

On first run, you'll see a login modal. Use these credentials:

```
Username: XXX
Password: XXX
```

## 📁 Project Structure

```
├── index.html              # Main HTML file with UI
├── wtp-visualizer.js       # Three.js visualization logic
├── api-config.js           # API integration & authentication
├── wtp-model.glb          # 3D model file (Blender export)
├── README.md              # This file
```

### File Descriptions

- **index.html**: UI structure, dashboard panels, controls
- **wtp-visualizer.js**: 3D scene setup, animations, water levels, alarms
- **api-config.js**: Authentication, API polling, data transformation
- **wtp-model.glb**: 3D model with tanks, pumps, mixers, pipes

## 🎯 Usage

### Basic Controls

- **Mouse Left Click + Drag**: Rotate camera
- **Mouse Right Click + Drag**: Pan camera
- **Mouse Scroll**: Zoom in/out
- **Reset View Button**: Return to default camera position
- **Toggle Labels**: Show/hide component labels

### API Status Indicator (Top-Right)

- **Green Dot**: Connected, receiving live data
- **Red Dot**: Error or disconnected
- **Gray Dot**: Polling stopped
- **Stop/Start Button**: Toggle API polling
- **Logout Button**: Clear token and re-login

### Alarms

Active alarms appear in the **ACTIVE ALARMS** panel (top-right) when triggered:
- RWT High/Low Level
- CWT High/Low Level
- CST Low Level
- Pump Faults

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

**Built with ❤️ using Three.js and modern web technologies**
