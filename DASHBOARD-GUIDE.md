# 📊 Dashboard Panel Guide

## Overview

The dashboard panel now uses an **accordion interface** to display all component data. Click on any section header to expand/collapse it and see all available values.

## 🎯 How to Use

### Expand/Collapse Sections

**Click on any component header** to show/hide its details:

```
┌─────────────────────────────┐
│ ▼ Raw Water Tank (RWT)      │ ← Click to expand
├─────────────────────────────┤
│ Level              65.2%    │
│ High Level Alarm   NO       │
│ Low Level Alarm    NO       │
│ pH                 7.2      │
│ Turbidity          45.1 NTU │
│ Inflow Rate        120 m³/h │
│ Outflow Rate       115 m³/h │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ▶ Chemical Storage (CST)    │ ← Click to expand
└─────────────────────────────┘
```

### Default State

- **First section (RWT)**: Expanded by default
- **All other sections**: Collapsed to save space

### Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| ▼ | Section is expanded |
| ▶ | Section is collapsed |
| 🟢 Green | OK / ON status |
| 🔴 Red | Alarm / OFF status |
| 🟡 Yellow | Warning status |

## 📋 All Available Data

### 1. Raw Water Tank (RWT)
```
Level               65.2%
High Level Alarm    NO ✅
Low Level Alarm     NO ✅
pH                  7.2
Turbidity           45.1 NTU
Inflow Rate         120.0 m³/h
Outflow Rate        115.0 m³/h
```

### 2. Chemical Storage Tank (CST)
```
Level               78.0%
Low Level Alarm     NO ✅
```

### 3. Coagulation Tank (CFT)
```
Level               55.0%
Mixer Status        ON ✅
pH                  6.8
Turbidity           25.0 NTU
Dosing Rate         3.2 L/h
```

### 4. Sedimentation Tank (SCT)
```
Level               70.0%
Sludge Level        15.0%
Turbidity Outlet    8.0 NTU
Scraper Status      ON ✅
```

### 5. Filter Unit (FTR)
```
Flow Rate               95.0 m³/h
Differential Pressure   0.8 bar
Backwash Status         OFF
```

### 6. Clean Water Tank (CWT)
```
Level               82.0%
High Level Alarm    NO ✅
Low Level Alarm     NO ✅
pH                  7.0
Turbidity           0.5 NTU
Residual Chlorine   0.8 mg/L
```

### 7. Sludge Tank (SLT)
```
Level           35.0%
Pump Status     OFF
```

### 8. Chemical Dosing Pump (CDP)
```
Status              OFF
Mode                AUTO
Dosing Rate         6.8 L/h
Total Chemical Used 2053 L
Pressure            2.1 bar
Fault               NO ✅
```

### 9. Main Pump Station (PPS)
```
Status              ON ✅
Mode                MANUAL
Flow Rate           123.3 m³/h
Outlet Pressure     2.8 bar
Fault               NO ✅
```

### 10. Plant Overall (PLT)
```
Total Inflow    369.4 m³/h
Total Outflow   307.4 m³/h
System Mode     MANUAL
Alarm Status    NO ✅
```

## 🎨 Color Coding

### Status Values

**Green (OK/ON):**
- Pump status: ON
- Mixer status: ON
- Alarms: NO

**Red (Alarm/OFF):**
- Pump status: OFF
- Alarms: YES
- Faults: YES

**Yellow (Warning):**
- Backwash: ACTIVE

### Alarm Display

```
High Level Alarm    YES 🔴  ← Red when alarm active
Low Level Alarm     NO  ✅  ← Green when no alarm
Fault               YES 🔴  ← Red when fault
```

## 💡 Usage Tips

### 1. Quick Overview
Keep only important sections expanded:
- RWT (main inlet)
- CWT (final output)
- PPS (main pump)

### 2. Detailed Monitoring
Expand specific sections when:
- Investigating alarms
- Checking specific parameters
- Troubleshooting issues

### 3. Space Management
- Collapse sections you don't need
- Panel scrolls if too many sections expanded
- Max height: 90vh (90% of screen)

### 4. Keyboard-Free Operation
- All controls are click-based
- No need to type or use keyboard
- Just click headers to expand/collapse

## 🔄 Live Updates

All values update **every 3 seconds** from the API:

```
Level    65.2%  ← Updates live
  ↓              ← Every 3 seconds
Level    66.1%  ← New value
```

Watch the values change in real-time when:
- Tank levels change
- Pumps turn on/off
- Alarms activate/clear
- System parameters vary

## 📱 Responsive Design

The accordion works on all screen sizes:

**Desktop:**
- Panel on left side
- Full detail visibility
- Easy to expand/collapse

**Mobile:**
- Panel overlay
- Scroll for more sections
- Touch-friendly headers

## 🎯 Quick Actions

### Expand All Important Sections
Click these headers:
1. Raw Water Tank (RWT)
2. Main Pump Station (PPS)
3. Clean Water Tank (CWT)
4. Plant Overall (PLT)

### Monitor Alarms
Watch these fields:
- RWT: High/Low Level Alarm
- CWT: High/Low Level Alarm
- CDP: Fault
- PPS: Fault
- PLT: Alarm Status

### Check Production
Monitor these values:
- PLT: Total Inflow/Outflow
- PPS: Flow Rate
- RWT: Inflow/Outflow Rate
- CWT: Level

## 🔍 Data Hierarchy

```
Plant Overall (PLT)          ← System-wide data
    ↓
Main Processes              ← Core treatment
    RWT → CFT → SCT → FTR → CWT
    ↓
Support Systems             ← Auxiliary equipment
    CST (chemicals)
    CDP (dosing)
    PPS (pumping)
    SLT (waste)
```

## ⚙️ Customization

### Change Default Expanded Section

Edit `index.html`, remove `collapsed` class:

```html
<!-- Default: Collapsed -->
<div class="status-section collapsed" id="cft-status">

<!-- Make it expanded by default -->
<div class="status-section" id="cft-status">
```

### Add New Fields

1. Add HTML element in `index.html`:
```html
<div class="status-item">
    <span class="label">New Field</span>
    <span class="value" id="new-field">--</span>
</div>
```

2. Update in `wtp-visualizer.js`:
```javascript
updateElement('new-field', plantData.COMPONENT?.New_Field);
```

## 🎉 Benefits

✅ **See all data** - Every API field displayed
✅ **Save space** - Collapse what you don't need
✅ **Easy navigation** - Click to expand/collapse
✅ **Clean interface** - Organized by component
✅ **Live updates** - All values refresh automatically
✅ **Color coded** - Quick status identification
✅ **Scrollable** - Handle lots of data smoothly

---

**Tip:** Keep the most important sections expanded and collapse the rest for the best monitoring experience! 🚀
