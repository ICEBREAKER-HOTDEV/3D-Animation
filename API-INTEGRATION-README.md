# API Integration Guide

## Overview

The 3D Water Treatment Plant visualization now fetches **real-time data** from your API endpoint automatically.

## How It Works

1. **Automatic Polling**: The system fetches data from the API every 3 seconds
2. **Data Transformation**: API response is automatically converted to the visualization format
3. **Live Updates**: Tank levels, pump status, and all parameters update in real-time
4. **Status Indicator**: A connection status indicator shows if data is flowing

## Getting Started

### 1. Open the Visualization

```bash
# Start a local web server
python -m http.server 8000

# Or use Node.js
npx serve .
```

Then open: `http://localhost:8000`

### 2. Connection Status

Look for the **status indicator** in the top-right corner:
- 🟢 **Green dot (Live Data)**: Connected and receiving data
- ⚫ **Gray dot (Disconnected)**: Not polling
- 🔴 **Red dot (Error)**: Connection error

### 3. Control Buttons

- **Start/Stop Button**: Manually start or stop API polling
- **Simulate Data**: Use sample data instead of API (for testing)

## Configuration

Edit `api-config.js` to customize:

```javascript
const API_CONFIG = {
    // API endpoint
    endpoint: 'https://api-staging-buildot.machinesensiot.xyz/api/Dashboard/GetAssetDevicesData',

    // Asset ID
    assetId: 6141,

    // Bearer token (update when expired)
    bearerToken: 'YOUR_TOKEN_HERE',

    // Polling interval (milliseconds)
    pollingInterval: 3000,  // 3 seconds

    // Auto-start on load
    autoStart: true
};
```

## Updating the Bearer Token

Your API uses JWT authentication that expires periodically. When the token expires:

### Option 1: Update Manually

1. Open `api-config.js`
2. Find the `bearerToken` field
3. Replace with your new token:

```javascript
bearerToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI...',
```

### Option 2: Set via Browser Console

```javascript
// Update token without editing file
WTPAPI.config.bearerToken = 'YOUR_NEW_TOKEN';
WTPAPI.startPolling();
```

### How to Get a New Token

1. Log into your API system
2. Get the token from your authentication flow
3. The token format starts with: `eyJ...`
4. Update using one of the methods above

## API Response Format

The API returns data in this structure:

```json
{
  "data": {
    "waterTreatmentPlantComponentsData": [
      {
        "rwtLevel": 41.1,
        "rwtLevelHighAlarm": false,
        "cdpStatus": false,
        "cftMixerStatus": true,
        ...
      }
    ]
  },
  "success": true
}
```

This is automatically transformed to the visualization format.

## Troubleshooting

### No Data Appearing

1. **Check Connection Status**: Look at the status indicator
2. **Check Console**: Open browser DevTools (F12) and check for errors
3. **Verify Token**: Make sure the bearer token hasn't expired
4. **Check CORS**: The API must allow requests from your domain

### CORS Errors

If you see CORS errors in the console:

```
Access to fetch at '...' has been blocked by CORS policy
```

**Solutions:**
- Contact your API administrator to add your domain to allowed origins
- Run the visualization from `localhost` (already configured in API)
- Use a CORS proxy for testing (not recommended for production)

### Token Expired

Error message: `HTTP 401: Unauthorized`

**Solution**: Update the bearer token (see "Updating the Bearer Token" section above)

### API Connection Failed

Error message: `Failed to fetch` or `NetworkError`

**Check:**
- Internet connection
- API endpoint URL is correct
- Firewall/network settings allow the connection

## Using Both API and Simulation

You can switch between modes:

1. **Live API Mode**: Click "Stop" on the API status indicator
2. **Simulation Mode**: Click "Simulate Data" button in controls
3. **Switch Back**: Stop simulation, then click "Start" on API status

## Advanced Usage

### Manual API Calls

```javascript
// Fetch data once
const data = await WTPAPI.fetchPlantData();
console.log(data);

// Check connection status
const status = WTPAPI.getConnectionStatus();
console.log(status); // 'connected', 'disconnected', or 'error'

// Get last fetch time
const lastFetch = WTPAPI.getLastFetchTime();
console.log(lastFetch);
```

### Change Polling Interval

```javascript
// Update to 5 seconds
WTPAPI.config.pollingInterval = 5000;

// Restart polling with new interval
WTPAPI.stopPolling();
WTPAPI.startPolling();
```

### Custom Data Transformation

If your API format changes, edit the `transformApiData()` function in `api-config.js`:

```javascript
function transformApiData(apiResponse) {
    const wtpData = apiResponse?.data?.waterTreatmentPlantComponentsData?.[0];

    return {
        RWT: {
            Level: wtpData.rwtLevel,
            pH: parseFloat(wtpData.rwtph),
            // ... your custom mapping
        }
    };
}
```

## Data Mapping

| API Field | Visualization Field | Description |
|-----------|---------------------|-------------|
| `rwtLevel` | `RWT.Level` | Raw water tank level (%) |
| `rwtph` | `RWT.pH` | Raw water pH value |
| `cdpStatus` | `CDP.Status` | Chemical dosing pump on/off |
| `cftMixerStatus` | `CFT.Mixer_Status` | Coagulation mixer on/off |
| `ppsPumpStatus` | `PPS.Status` | Main pump on/off |
| `sctLevel` | `SCT[0].Level` | Sedimentation tank level |
| `cwtLevel` | `CWT[0].Level` | Clean water tank level |
| ... | ... | See `api-config.js` for full mapping |

## Performance Tips

1. **Adjust Polling Interval**: Increase if you don't need real-time updates
2. **Monitor Network**: Each poll makes an API request
3. **Use Simulation for Testing**: Save API calls during development

## Security Notes

⚠️ **Important**: Never commit your bearer token to version control

- Add `api-config.js` to `.gitignore`
- Or store the token in environment variables
- Use a configuration file that's not tracked by Git

Example `.gitignore`:
```
api-config.js
.env
```

## Support

For issues with:
- **Visualization**: Check the main INTEGRATION-GUIDE.md
- **API Access**: Contact your API administrator
- **Token Authentication**: Check your API documentation
