# 🚀 Live API Data - Quick Start Guide

## Overview

Your WTP visualizer now automatically uses **LIVE API DATA** by default! No configuration needed - just open the page and it starts fetching real-time data.

## 🎯 How It Works

### Automatic Startup

When you open `index.html`:

1. ✅ **API polling starts automatically** (every 3 seconds)
2. ✅ **Live data flows to the 3D visualization**
3. ✅ **Status indicator shows connection** (top-right corner)
4. ✅ **All tank levels, pumps, and values update in real-time**

### Visual Indicators

Look at the **top-right corner** for two indicators:

#### 1. API Status Indicator
```
🟢 Live Data          ← Connected and receiving data
   2s ago
   [Stop]
```

#### 2. System Mode Indicator
```
System Mode: AUTO
Data: Live API        ← Data source (green = live)
```

## 📊 Data Sources

The system has **two modes** that never run simultaneously:

### 1. Live API Mode (Default) ✅
- **Status**: `Data: Live API` (green)
- **What it does**: Fetches real data from your API every 3 seconds
- **When to use**: Normal operation, real monitoring
- **How to stop**: Click "Stop" button on API status indicator

### 2. Simulation Mode
- **Status**: `Data: Simulation` (yellow)
- **What it does**: Generates random test data
- **When to use**: Testing, demos, when API is down
- **How to start**: Click "Simulate Data" button

## 🎮 Controls

### Start/Stop Live API
```
Top-right indicator:
[Stop] ← Click to stop API polling
[Start] ← Click to start API polling
```

### Switch to Simulation
```
Bottom-left controls:
[Simulate Data] ← Click to start simulation
  (automatically stops API)

[Stop Simulation] ← Click to stop simulation
  (automatically restarts API)
```

## ⚡ Quick Actions

### Start Fresh (Live Data)
1. Refresh the page
2. API polling starts automatically
3. Watch the status indicator turn green

### Test with Simulation
1. Click "Stop" on API status
2. Click "Simulate Data"
3. Data source shows "Simulation" (yellow)

### Return to Live Data
1. Click "Stop Simulation"
2. API automatically restarts
3. Data source shows "Live API" (green)

## 🔍 Monitoring Live Data

### Check Connection Status

**Green dot + "Live Data"**
- ✅ Everything working
- ✅ Data flowing normally

**Red dot + "Error"**
- ❌ API connection failed
- Check console (F12) for details
- Verify bearer token hasn't expired

**Gray dot + "Disconnected"**
- ⚫ API polling stopped
- Click "Start" to resume

### View Current Values

All values in the **left panel** update live:

```
Plant Status Dashboard

Raw Water Tank (RWT)
Level          65.2%      ← Updates every 3s
pH             7.2
Turbidity      45.1 NTU
Inflow         120 m³/h

Chemical Dosing (CDP)
Status         ON         ← Green = running
Mode           AUTO
Dosing Rate    5.5 L/h
```

## 🛠️ Configuration

### Change Polling Speed

Edit `api-config.js`:

```javascript
const API_CONFIG = {
    pollingInterval: 3000,  // Change to 5000 for 5 seconds
    autoStart: true,        // Change to false to start manually
    // ...
};
```

### Disable Auto-Start

If you want **manual control**:

```javascript
const API_CONFIG = {
    autoStart: false,  // ← Set to false
    // ...
};
```

Then click "Start" button when ready.

### Update API Token

When token expires, edit `api-config.js`:

```javascript
const API_CONFIG = {
    bearerToken: 'NEW_TOKEN_HERE',  // ← Paste new token
    // ...
};
```

## 📱 Mobile / Remote Access

The live data works on any device:

1. **Start local server**: `python -m http.server 8000`
2. **Access from phone**: `http://YOUR_IP:8000`
3. **Live data flows** to mobile browser

## 🔧 Troubleshooting

### Problem: No data appearing

**Check:**
1. Status indicator shows "Live Data" (green)?
2. Browser console (F12) has errors?
3. Bearer token expired? (Update in `api-config.js`)

### Problem: "Disconnected" status

**Solution:**
- Click "Start" button on status indicator
- Or refresh the page (auto-starts)

### Problem: Old/stale data

**Check:**
- Time indicator: "2s ago" should update
- If stuck, click "Stop" then "Start"

### Problem: CORS error

**Console shows:** `blocked by CORS policy`

**Solution:**
- Make sure running from `localhost` (not `file://`)
- Your API already allows localhost

## 🎨 What Updates Live

When API data flows, these update in real-time:

### 3D Visualization
- ✅ Tank water levels (animated fill)
- ✅ Pump colors (green ON, red OFF)
- ✅ Pump glow effects (pulsing when running)
- ✅ Mixer/scraper rotation (when active)
- ✅ Alarm colors (red pulse on alarms)

### Dashboard Panel
- ✅ All numeric values
- ✅ Status indicators (ON/OFF)
- ✅ Alarm states
- ✅ System mode
- ✅ pH, turbidity, flow rates

### Labels (3D scene)
- ✅ Tank level percentages
- ✅ Pump status

## 💡 Pro Tips

### 1. Monitor Connection
Keep an eye on the status indicator:
- Should update every 3 seconds
- "Live Data" stays green

### 2. Check Timestamp
The "Xs ago" should be recent (< 5s)

### 3. Use Browser Console
Press F12 to see:
- API fetch logs
- Data transformation logs
- Connection errors

### 4. Test Before Demo
Open `test-api.html` first:
- Verify API connection
- Check data format
- Test authentication

## 🔄 Data Flow

```
API Server (every 3s)
    ↓
Fetch data from:
https://api-staging-buildot.machinesensiot.xyz/...
    ↓
Transform to visualization format
    ↓
Update 3D scene + dashboard
    ↓
User sees live data!
```

## 📊 Performance

- **Network**: ~1 API call every 3 seconds
- **Data size**: ~2-3 KB per request
- **CPU**: Minimal (just updates visuals)
- **Memory**: Stable (no leaks)

## 🎯 Best Practices

### For Normal Operation
1. Leave API auto-start enabled
2. Monitor the status indicator
3. Refresh if connection drops

### For Development
1. Use simulation mode for testing
2. Switch to live data to verify
3. Check `test-api.html` for debugging

### For Presentations
1. Test API connection first
2. Keep page visible (don't minimize)
3. Have simulation as backup

## 🚨 Emergency: API Down?

If API is unavailable:

1. **Quick fix**: Click "Simulate Data"
2. **Notification**: System shows "Data: Simulation"
3. **Automatic retry**: API tries 3 times before stopping
4. **Manual restart**: Click "Start" when API is back

## ✨ Success Indicators

You know it's working when:

1. ✅ Status dot is **green**
2. ✅ Text says "**Live Data**"
3. ✅ Timestamp updates (e.g., "3s ago")
4. ✅ Data source shows "**Live API**" (green)
5. ✅ Tank levels/pumps match your actual plant
6. ✅ Values change over time

## 📞 Support

- **API issues**: Check `API-INTEGRATION-README.md`
- **Token expired**: See "Updating the Bearer Token" section
- **General help**: See `INTEGRATION-GUIDE.md`
- **Test connection**: Open `test-api.html`

---

**You're all set!** 🎉 Just open `index.html` and watch your plant data come alive in 3D!
