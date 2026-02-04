# Water Treatment Plant Visualization - Integration Guide

## Quick Start

1. **Add your 3D model**: Place your `.glb` file named `wtp-model.glb` in the project folder
2. **Serve the files**: Use a local web server (required for ES modules)
3. **Open in browser**: Navigate to `index.html`

### Running a Local Server

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install "Live Server" extension, right-click index.html > "Open with Live Server"
```

Then open: `http://localhost:8000`

---

## GLB Model Requirements

Your `.glb` model should have **named nodes** for each component. The script automatically maps nodes based on their names.

### Naming Convention

| Component | Node Name Pattern | Notes |
|-----------|-------------------|-------|
| Raw Water Tank | `RWT` | Tank container |
| Raw Water (mesh) | `RWT_Water` | Animated water surface |
| Chemical Storage | `CST`, `CST_Water` | |
| Coagulation Tank | `CFT`, `CFT_Water` | |
| Coagulation Mixer | `CFT_Mixer` | Rotates when active |
| Sedimentation Tank | `SCT`, `SCT_Water` | |
| Sedimentation Scraper | `SCT_Scraper` | Rotates when active |
| Sedimentation Sludge | `SCT_Sludge` | Sludge layer |
| Clean Water Tank | `CWT`, `CWT_Water` | |
| Sludge Tank | `SLT`, `SLT_Water` | |
| Chemical Dosing Pump | `CDP` | Glows when active |
| Main Pumps | `PPS_Pump1`, `PPS_Pump2` | Glow + vibrate when active |
| Filter Unit | `FTR` | |
| Pipes | `Pipe_*` | Any name containing "Pipe" |

**Tips for Blender export:**
- Name objects in the Outliner panel
- Export with "Include > Selected Objects" if needed
- Enable "Mesh > Apply Modifiers"
- Check "Animation" if you have baked animations

---

## JSON Payload Structure

The visualization accepts a JSON object with the following structure:

```javascript
{
    "RWT": {
        "Level": 65.5,           // Tank level percentage (0-100)
        "High_Level_Alarm": false,
        "Low_Level_Alarm": false,
        "Inflow_Rate": 120.0,    // m³/h
        "Outflow_Rate": 115.0,
        "pH": 7.2,
        "Turbidity": 45.0        // NTU
    },
    "CDP": {
        "Status": true,          // Pump running
        "Mode": "AUTO",          // "AUTO" or "MANUAL"
        "Dosing_Rate": 5.5,      // L/h
        "Total_Chemical_Used": 1250.0,
        "Pressure": 2.5,         // bar
        "Fault": false
    },
    "CST": {
        "Level": 78.0,
        "Low_Level_Alarm": false
    },
    "CFT": {
        "Level": 55.0,
        "Mixer_Status": true,    // Mixer rotating
        "pH": 6.8,
        "Turbidity": 25.0,
        "Dosing_Rate": 3.2
    },
    "SCT": {
        "Level": 70.0,
        "Sludge_Level": 15.0,
        "Turbidity_Outlet": 8.0,
        "Scraper_Status": true   // Scraper rotating
    },
    "FTR": {
        "Differential_Pressure": 0.8,
        "Flow_Rate": 95.0,
        "Backwash_Status": false // Reverse flow animation
    },
    "CWT": {
        "Level": 82.0,
        "High_Level_Alarm": false,
        "Low_Level_Alarm": false,
        "pH": 7.0,
        "Turbidity": 0.5,
        "Residual_Chlorine": 0.8
    },
    "SLT": {
        "Level": 35.0,
        "Pump_Status": false
    },
    "PPS": {
        "Pump1_Status": true,
        "Pump2_Status": false,
        "Mode": "AUTO",
        "Flow_Rate": 110.0,
        "Outlet_Pressure": 3.2,
        "Fault": false
    },
    "PLT": {
        "Total_Inflow": 120.0,
        "Total_Outflow": 115.0,
        "System_Mode": "AUTO",   // "AUTO" or "MANUAL"
        "Alarm_Status": false
    }
}
```

---

## Integration Methods

### 1. JavaScript API (Recommended)

The visualizer exposes a global `WTPVisualizer` object:

```javascript
// Update with new data
WTPVisualizer.updatePlantData({
    RWT: { Level: 75, pH: 7.1 },
    PPS: { Pump1_Status: true, Flow_Rate: 125 }
});

// Get current data
const currentData = WTPVisualizer.getPlantData();

// Reset camera view
WTPVisualizer.resetView();

// Start/stop simulation mode
WTPVisualizer.startSimulation();
WTPVisualizer.stopSimulation();
```

### 2. Node-RED Integration

In Node-RED, use a **template node** or **function node** to send data:

```javascript
// Function node example
const payload = msg.payload; // Your decoded JSON

// Inject script to update visualization
msg.payload = `<script>
    if (window.WTPVisualizer) {
        WTPVisualizer.updatePlantData(${JSON.stringify(payload)});
    }
</script>`;

return msg;
```

Or use **WebSocket** for real-time updates:

```javascript
// In index.html, add WebSocket client:
const ws = new WebSocket('ws://localhost:1880/ws/wtp');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    WTPVisualizer.updatePlantData(data);
};
```

### 3. REST API Polling

```javascript
// Add to index.html or wtp-visualizer.js
setInterval(async () => {
    try {
        const response = await fetch('/api/plant-data');
        const data = await response.json();
        WTPVisualizer.updatePlantData(data);
    } catch (err) {
        console.error('Failed to fetch data:', err);
    }
}, 1000); // Poll every second
```

### 4. MQTT (via mqtt.js)

```html
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
<script>
    const client = mqtt.connect('ws://broker:8083');

    client.on('connect', () => {
        client.subscribe('wtp/data');
    });

    client.on('message', (topic, message) => {
        const data = JSON.parse(message.toString());
        WTPVisualizer.updatePlantData(data);
    });
</script>
```

---

## Customization

### Change Model Path

Edit `wtp-visualizer.js`:

```javascript
const CONFIG = {
    modelPath: 'your-model.glb',  // Change this
    // ...
};
```

### Change Colors

```javascript
const CONFIG = {
    colors: {
        cleanWater: 0x4fc3f7,    // Light blue
        rawWater: 0x8d6e63,      // Brown
        sludge: 0x5d4037,        // Dark brown
        alarm: 0xff5252,         // Red
        ok: 0x69f0ae,            // Green
        warning: 0xffd740,       // Yellow
        pumpOn: 0x69f0ae,        // Green
        pumpOff: 0x616161,       // Gray
        chemical: 0xab47bc       // Purple
    },
    // ...
};
```

### Add New Components

1. Add the named node to your `.glb` model
2. Update the `mapComponent()` function to recognize the new name
3. Add animation logic in the appropriate update function
4. Update the dashboard HTML if needed

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Error loading model" | Ensure `wtp-model.glb` exists and path is correct |
| CORS errors | Use a local web server, don't open `file://` directly |
| No animations | Check node names in your GLB match the naming convention |
| Black screen | Check browser console for errors |
| Labels not showing | Toggle with "Toggle Labels" button |

---

## File Structure

```
project/
├── index.html           # Main HTML page with UI
├── wtp-visualizer.js    # Three.js visualization script
├── wtp-model.glb        # Your 3D model (add this)
├── sample-payload.json  # Example JSON structure
└── INTEGRATION-GUIDE.md # This file
```
