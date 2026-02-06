# 🔧 Pump Animation Debug Guide

## Issue Fixed

The pump on/off animation was not working because:
1. **Alarm effects were overriding pump colors** - The `updateAlarmEffects()` function was setting emissive colors after `updatePumps()`, overwriting the on/off colors
2. **Fault logic was separate** - Pump faults needed to be integrated into the pump color logic

## ✅ What Was Fixed

### 1. Removed Color Override in Alarms
**Before:**
```javascript
// Alarm effects were overriding pump colors
if (plantData.CDP?.Fault) {
    pulseComponent(components.pumps.CDP, alarmPulse); // ❌ Overwrites pump color
}
```

**After:**
```javascript
// Alarms only add to list, don't change colors
if (plantData.CDP?.Fault) {
    activeAlarms.push('CDP Fault'); // ✅ Only adds to alarm list
}
```

### 2. Integrated Fault Handling in Pump Colors
**Before:**
```javascript
setPumpColor(pump, isOn, time); // ❌ No fault handling
```

**After:**
```javascript
setPumpColor(pump, isOn, hasFault, time); // ✅ Fault-aware
```

### 3. Priority-Based Color System
```javascript
if (hasFault) {
    // FAULT: Blinking red alarm (highest priority)
    color = red, intensity = blinking
} else if (isOn) {
    // ON: Pulsing green glow
    color = green, intensity = pulsing
} else {
    // OFF: Solid red
    color = red, intensity = solid
}
```

## 🎨 Pump Visual States

| State | Color | Effect | Vibration |
|-------|-------|--------|-----------|
| **ON (Normal)** | 🟢 Green | Pulsing glow | ✅ Yes |
| **OFF (Normal)** | 🔴 Red | Solid | ❌ No |
| **FAULT** | 🔴 Red | Blinking | ❌ No |

## 🔍 Debug Console Output

Open browser console (F12) to see debug logs:

### When Model Loads
```
Model loaded successfully
Mapped components: {...}
Pumps found: { CDP: 'YES', PPS: 'YES' }
```

### During Operation
```
CDP Status: { isOn: false, hasFault: false, hasComponent: true }
PPS Status: { isOn: true, hasFault: false, hasComponent: true }
```

## 🧪 Testing Pump Animation

### Test 1: Check Pumps Are Found
1. Open `http://localhost:8000/index.html`
2. Press F12 for console
3. Look for: `Pumps found: { CDP: 'YES', PPS: 'YES' }`

**If shows 'NO':**
- Pump objects not in 3D model
- Check pump naming in Blender
- Should include: `PUMP1_`, `PUMP2_`, `PPS`, or `CDP`

### Test 2: Check Status Values
1. Watch console logs (appear randomly ~1% of frames)
2. Look for: `CDP Status: { isOn: ..., hasFault: ... }`

**Expected values from current API:**
```
CDP Status: { isOn: false, hasFault: false, hasComponent: true }
PPS Status: { isOn: true, hasFault: false, hasComponent: true }
```

### Test 3: Visual Verification
1. Look at pumps in 3D scene
2. **PPS (Pump 1)** should be:
   - 🟢 Green glow (ON)
   - 📳 Vibrating up/down

3. **CDP (Pump 2)** should be:
   - 🔴 Red solid (OFF)
   - ⏸️ No vibration

### Test 4: Watch Real-Time Changes
1. Monitor the pumps in 3D
2. When API data changes pump status:
   - Color should transition
   - Vibration should start/stop
   - Smooth animation (no flicker)

## 🎯 Expected Behavior

### Pump 1 (PPS) - Currently ON
```
API: ppsPumpStatus = true, ppsFault = false

Visual:
  ┌─────────┐
  │  PUMP1  │ ← Green pulsing glow
  └─────────┘
      ↕️        ← Vibrates up/down
```

### Pump 2 (CDP) - Currently OFF
```
API: cdpStatus = false, cdpFault = false

Visual:
  ┌─────────┐
  │  PUMP2  │ ← Red solid color
  └─────────┘
                ← No vibration
```

## 🔧 Troubleshooting

### Problem: Both pumps are gray/no color
**Cause:** Pumps not found in 3D model

**Solution:**
1. Check console: `Pumps found: { CDP: 'NO', PPS: 'NO' }`
2. Verify pump names in Blender model
3. Names should include: `PUMP1_`, `PUMP2_`, `PPS`, or `CDP`

### Problem: Pumps found but no animation
**Cause:** Status data not reaching pumps

**Solution:**
1. Check console logs for status values
2. Verify API is returning data
3. Check `plantData.CDP.Status` and `plantData.PPS.Status`

### Problem: Colors flickering
**Cause:** Multiple systems fighting over emissive colors

**Solution:**
- ✅ Already fixed! Removed alarm color override
- If still happening, check for other code modifying emissive

### Problem: Vibration not working
**Cause:** Position not being updated or isOn = false

**Solution:**
1. Check console: `isOn` should be `true`
2. Verify `cdp.userData.originalY` is set
3. Make sure pump object has position property

### Problem: Wrong colors (both red or both green)
**Cause:** Status values incorrect or inverted

**Solution:**
1. Check API response in `test-api.html`
2. Verify transformation in `api-config.js`
3. Console log should show correct `isOn` values

## 📊 Current API Values

From your latest API response:
```json
{
  "ppsPumpStatus": true,    // PPS = ON  ✅
  "cdpStatus": false,       // CDP = OFF ❌
  "ppsFault": false,        // No fault  ✅
  "cdpFault": false         // No fault  ✅
}
```

**Expected visuals:**
- **PPS (Pump 1)**: 🟢 Green + vibrating
- **CDP (Pump 2)**: 🔴 Red + still

## 🎬 Animation Timeline

```
Frame N:
  1. updateTankLevels()     ← Update tank water
  2. updateMixers()         ← Update mixer rotation
  3. updatePumps()          ← ✅ Set pump colors & vibration
  4. updatePipeFlows()      ← Update pipe effects
  5. updateAlarmEffects()   ← Check alarms (no color override)
  6. render()               ← Draw frame

Frame N+1:
  (repeat)
```

## 🔬 Manual Test

### Force Pump ON
Open console and run:
```javascript
// Force PPS to ON
plantData.PPS.Status = true;

// Force CDP to ON
plantData.CDP.Status = true;
```

Both pumps should turn green and vibrate.

### Force Pump OFF
```javascript
// Force PPS to OFF
plantData.PPS.Status = false;

// Force CDP to OFF
plantData.CDP.Status = false;
```

Both pumps should turn red and stop vibrating.

### Force Fault
```javascript
// Add fault to PPS
plantData.PPS.Fault = true;
```

PPS should blink red (alarm state).

## 📝 Debug Checklist

- [ ] Console shows "Pumps found: YES"
- [ ] Console logs show pump status values
- [ ] API data is being fetched (status indicator green)
- [ ] Dashboard shows correct pump status
- [ ] PPS shows green when `ppsPumpStatus = true`
- [ ] CDP shows red when `cdpStatus = false`
- [ ] Vibration works when pump is ON
- [ ] No color flickering

## 🎉 Success Indicators

You know it's working when:
1. ✅ Console shows pumps found
2. ✅ PPS glows green and vibrates (when ON)
3. ✅ CDP shows red and is still (when OFF)
4. ✅ Colors change when API data changes
5. ✅ Vibration starts/stops with status
6. ✅ Faults show blinking red (if any)

## 📞 Still Not Working?

If pumps still don't animate:

1. **Check 3D Model**: Verify pump objects exist
2. **Check Names**: Must include PUMP1_, PUMP2_, PPS, or CDP
3. **Check API**: Open `test-api.html` to verify data
4. **Check Console**: Look for errors or warnings
5. **Clear Cache**: Hard refresh (Ctrl+Shift+R)

---

**The fix is now live!** Pumps should animate correctly based on their ON/OFF status from the API. 🚀
