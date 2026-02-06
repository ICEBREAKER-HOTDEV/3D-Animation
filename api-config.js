/**
 * API Configuration and Data Fetching for WTP Visualization
 *
 * This module handles:
 * - Fetching data from the real API
 * - Transforming API response to visualization format
 * - Automatic polling with configurable interval
 * - Error handling and connection status
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_CONFIG = {
    // API endpoint
    endpoint: 'https://api-staging-buildot.machinesensiot.xyz/api/Dashboard/GetAssetDevicesData',

    // Asset ID to fetch
    assetId: 6141,

    // Bearer token (update this when it expires)
    // Token expires at: 2025-02-06 (based on JWT exp: 1770375045)
    bearerToken: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkUWFJTXd0c3VxSGdyaW9vdmNVTnZtUFRkcGUxa3RvNk53QVFLS2hOX0RJIn0.eyJleHAiOjE3NzAzNzUwNDUsImlhdCI6MTc3MDM2NDI0NSwianRpIjoiZTE3YWQxOGQtZGQ1NS00ODMxLThmZGMtMTFhZWFkZDRhYjgwIiwiaXNzIjoiaHR0cHM6Ly9kZXYuY2xvYWsubWFjaGluZXNlbnNpb3QuY29tL3JlYWxtcy9tc1NhbmRib3giLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZDYyYjJhZmYtZjJjZS00NWZiLWFjNjQtNTQyNjdlMmM2ZWE2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibXNTYW5kYm94X21haW5hcHAiLCJzaWQiOiI0MWI3MTUyNS1hNDBhLTRiZWItOTQ1Ny02MjQwOTE2NmRmMWMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBpLmlvdC5tYWNoaW5lc2Vuc2lvdC5jb20iLCJodHRwczovL3N0YWdpbmcubWFjaGluZXNlbnMuY29tIiwiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAzMyIsImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MSIsImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMCIsImh0dHBzOi8vZW1zLm1hY2hpbmVzZW5zaW90Lm5ldCIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSIsImh0dHBzOi8vbWFjaGluZXNlbnMuY29tIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1tc3NhbmRib3giXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJtYWNoaW5lc2VucyBpb3Qgc2FuZGJveCIsInByZWZlcnJlZF91c2VybmFtZSI6Im1zc2FuZGJveCIsImdpdmVuX25hbWUiOiJtYWNoaW5lc2VucyBpb3QiLCJmYW1pbHlfbmFtZSI6InNhbmRib3giLCJlbWFpbCI6Im1zc2FuZGJveEBtYWlsaW5hdG9yLmNvbSJ9.WCyuAD4uTrY7B8AGSxFyhObcWrx5CqPBn3Wam04GaggdPQGanOyeJk28pBiLa_sYYksccDTE97f4-kaaMdP_Skaj_saRMAimrNeeWykqKiJTf5KFGyGSJHQ5U-qVx7u64JG07QN0ugT6mimlyWxs0YXDSMNAl6gzh2NhXu6zbzvFdrhjB00mAYlwnarLZszxvqTW34rPMxTDLmM-wr1iAR2Csu9NHpFIWEahqt5EmAXuMtI2v1ZiU3v_9cQzo9qrwPYzO8Vik0c9xCZLvC24jkEDZAhy3hrijy7DZ5W9oGfAJt4K5Pzk8ys5reMXN9hcDiAg6-MRmdLgvFC-D_md7w',

    // Polling interval in milliseconds (3 seconds = 3000ms)
    pollingInterval: 3000,

    // Enable/disable API polling on startup
    autoStart: true,

    // Retry settings
    maxRetries: 3,
    retryDelay: 2000 // ms
};

// ============================================================================
// STATE
// ============================================================================

let pollingIntervalId = null;
let isPolling = false;
let lastFetchTime = null;
let connectionStatus = 'disconnected'; // 'connected', 'disconnected', 'error'
let consecutiveErrors = 0;

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Transform API response to visualization format
 * @param {Object} apiResponse - Raw API response
 * @returns {Object} Transformed data for visualization
 */
function transformApiData(apiResponse) {
    // Extract the water treatment plant data
    const wtpData = apiResponse?.data?.waterTreatmentPlantComponentsData?.[0];

    if (!wtpData) {
        console.warn('No water treatment plant data found in API response');
        return null;
    }

    // Transform to visualization format
    // Note: For tanks with 2 instances (SCT, CWT), we're using single values from API
    // You may need to adjust this if you want different values for each tank
    return {
        RWT: {
            Level: wtpData.rwtLevel || 0,
            High_Level_Alarm: wtpData.rwtLevelHighAlarm || false,
            Low_Level_Alarm: wtpData.rwtLevelLowAlarm || false,
            Inflow_Rate: wtpData.rwtInflowRate || 0,
            Outflow_Rate: wtpData.rwtOutflowRate || 0,
            pH: parseFloat(wtpData.rwtph) || 7.0,
            Turbidity: wtpData.rwtTurbidity || 0
        },
        CDP: {
            Status: wtpData.cdpStatus || false,
            Mode: wtpData.cdpMode || 'AUTO',
            Dosing_Rate: wtpData.cdpDosingRate || 0,
            Total_Chemical_Used: wtpData.cdpTotalChemicalUsed || 0,
            Pressure: wtpData.cdpPressure || 0,
            Fault: wtpData.cdpFault || false
        },
        CST: {
            Level: wtpData.cstLevel || 0,
            Low_Level_Alarm: wtpData.cstLowLevelAlarm || false
        },
        CFT: {
            Level: wtpData.cftLevel || 0,
            Mixer_Status: wtpData.cftMixerStatus || false,
            pH: parseFloat(wtpData.cftph) || 7.0,
            Turbidity: wtpData.cftTurbidity || 0,
            Dosing_Rate: wtpData.cftDosingRate || 0
        },
        // SCT: Single tank values (API provides single value, visualization has 2 tanks)
        // Both tanks use the same API value
        SCT: [
            {
                Level: wtpData.sctLevel || 0,
                Sludge_Level: wtpData.sctSludgeLevel || 0,
                Turbidity_Outlet: wtpData.sctTurbidityOutlet || 0,
                Scraper_Status: wtpData.sctScraperStatus || false
            },
            {
                Level: wtpData.sctLevel || 0,
                Sludge_Level: wtpData.sctSludgeLevel || 0,
                Turbidity_Outlet: wtpData.sctTurbidityOutlet || 0,
                Scraper_Status: wtpData.sctScraperStatus || false
            }
        ],
        FTR: {
            Differential_Pressure: wtpData.ftrDifferentialPressure || 0,
            Flow_Rate: wtpData.ftrFlowRate || 0,
            Backwash_Status: wtpData.ftrBackwashStatus || false
        },
        // CWT: Single tank values (API provides single value, visualization has 2 tanks)
        // Both tanks use the same API value
        CWT: [
            {
                Level: wtpData.cwtLevel || 0,
                High_Level_Alarm: wtpData.cwtLevelHighAlarm || false,
                Low_Level_Alarm: wtpData.cwtLevelLowAlarm || false,
                pH: parseFloat(wtpData.cwtph) || 7.0,
                Turbidity: wtpData.cwtTurbidity || 0,
                Residual_Chlorine: wtpData.cwtResidualChlorine || 0
            },
            {
                Level: wtpData.cwtLevel || 0,
                High_Level_Alarm: wtpData.cwtLevelHighAlarm || false,
                Low_Level_Alarm: wtpData.cwtLevelLowAlarm || false,
                pH: parseFloat(wtpData.cwtph) || 7.0,
                Turbidity: wtpData.cwtTurbidity || 0,
                Residual_Chlorine: wtpData.cwtResidualChlorine || 0
            }
        ],
        SLT: {
            Level: wtpData.sltLevel || 0,
            Pump_Status: wtpData.sltPumpStatus || false
        },
        PPS: {
            Status: wtpData.ppsPumpStatus || false,
            Mode: wtpData.ppsMode || 'AUTO',
            Flow_Rate: wtpData.ppsFlowRate || 0,
            Outlet_Pressure: wtpData.ppsOutletPressure || 0,
            Fault: wtpData.ppsFault || false
        },
        PLT: {
            Total_Inflow: wtpData.pltTotalInflow || 0,
            Total_Outflow: wtpData.pltTotalOutflow || 0,
            System_Mode: wtpData.pltSystemMode || 'AUTO',
            Alarm_Status: wtpData.pltAlarmStatus || false
        }
    };
}

// ============================================================================
// API FETCHING
// ============================================================================

/**
 * Fetch data from the API
 * @returns {Promise<Object>} Transformed plant data
 */
async function fetchPlantData() {
    const url = `${API_CONFIG.endpoint}?assetId=${API_CONFIG.assetId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${API_CONFIG.bearerToken}`
            },
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if API returned success
        if (!data.success) {
            throw new Error(data.message || 'API returned unsuccessful response');
        }

        // Transform and return data
        const transformedData = transformApiData(data);

        if (!transformedData) {
            throw new Error('Failed to transform API data');
        }

        // Update connection status
        connectionStatus = 'connected';
        consecutiveErrors = 0;
        lastFetchTime = new Date();
        updateConnectionIndicator();

        return transformedData;

    } catch (error) {
        console.error('Error fetching plant data:', error);
        consecutiveErrors++;

        // Update connection status
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            connectionStatus = 'disconnected';
        } else {
            connectionStatus = 'error';
        }

        updateConnectionIndicator();

        // Stop polling after too many consecutive errors
        if (consecutiveErrors >= API_CONFIG.maxRetries) {
            console.error(`Stopping polling after ${consecutiveErrors} consecutive errors`);
            stopPolling();
        }

        throw error;
    }
}

/**
 * Fetch and update visualization with API data
 */
async function fetchAndUpdate() {
    try {
        const plantData = await fetchPlantData();

        // Update the visualization
        if (window.WTPVisualizer) {
            window.WTPVisualizer.updatePlantData(plantData);
        } else {
            console.warn('WTPVisualizer not found. Make sure wtp-visualizer.js is loaded.');
        }

    } catch (error) {
        console.error('Failed to fetch and update:', error);
        // Error is already handled in fetchPlantData
    }
}

// ============================================================================
// POLLING CONTROL
// ============================================================================

/**
 * Start polling the API at configured interval
 */
function startPolling() {
    if (isPolling) {
        console.log('Polling already active');
        return;
    }

    console.log(`Starting API polling every ${API_CONFIG.pollingInterval}ms`);

    // Stop simulation mode if it's running
    // if (window.WTPVisualizer) {
    //     const simBtn = document.getElementById('btn-simulate');
    //     if (simBtn && simBtn.classList.contains('active')) {
    //         window.WTPVisualizer.stopSimulation();
    //         simBtn.classList.remove('active');
    //         simBtn.textContent = 'Simulate Data';
    //     }
    // }

    isPolling = true;

    // First fetch immediately
    fetchAndUpdate();

    // Then poll at interval
    pollingIntervalId = setInterval(fetchAndUpdate, API_CONFIG.pollingInterval);

    updateConnectionIndicator();
}

/**
 * Stop polling the API
 */
function stopPolling() {
    if (!isPolling) {
        console.log('Polling not active');
        return;
    }

    console.log('Stopping API polling');
    isPolling = false;

    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }

    connectionStatus = 'disconnected';
    updateConnectionIndicator();
}

/**
 * Toggle polling on/off
 */
function togglePolling() {
    if (isPolling) {
        stopPolling();
    } else {
        startPolling();
    }
}

// ============================================================================
// UI UPDATES
// ============================================================================

/**
 * Update connection status indicator in UI
 */
function updateConnectionIndicator() {
    const indicator = document.getElementById('api-status-indicator');
    if (!indicator) return;

    const statusText = document.getElementById('api-status-text');
    const statusDot = document.getElementById('api-status-dot');
    const lastUpdate = document.getElementById('api-last-update');
    const dataSource = document.getElementById('data-source');

    if (statusDot) {
        statusDot.className = 'status-dot';
        if (connectionStatus === 'connected') {
            statusDot.classList.add('connected');
        } else if (connectionStatus === 'disconnected') {
            statusDot.classList.add('disconnected');
        } else {
            statusDot.classList.add('error');
        }
    }

    if (statusText) {
        if (connectionStatus === 'connected') {
            statusText.textContent = 'Live Data';
        } else if (connectionStatus === 'disconnected') {
            statusText.textContent = 'Disconnected';
        } else {
            statusText.textContent = 'Error';
        }
    }

    if (lastUpdate && lastFetchTime) {
        const timeAgo = Math.floor((Date.now() - lastFetchTime.getTime()) / 1000);
        lastUpdate.textContent = timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`;
    }

    // Update data source indicator
    if (dataSource) {
        if (isPolling && connectionStatus === 'connected') {
            dataSource.textContent = 'Data: Live API';
            dataSource.style.color = '#69f0ae';
        } else if (isPolling && connectionStatus === 'error') {
            dataSource.textContent = 'Data: API Error';
            dataSource.style.color = '#ff5252';
        } else {
            dataSource.textContent = 'Data: Simulation';
            dataSource.style.color = '#ffd740';
        }
    }
}

// Update "time ago" every second
setInterval(() => {
    if (lastFetchTime) {
        updateConnectionIndicator();
    }
}, 1000);

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize API integration
 */
function initAPI() {
    console.log('API Integration initialized');

    // Add connection indicator to DOM if it doesn't exist
    createConnectionIndicator();

    // Auto-start polling if configured
    if (API_CONFIG.autoStart) {
        // Wait a bit for the visualizer to load
        setTimeout(() => {
            startPolling();
        }, 1000);
    }
}

/**
 * Create connection status indicator in UI
 */
function createConnectionIndicator() {
    // Check if indicator already exists
    if (document.getElementById('api-status-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'api-status-indicator';
    indicator.innerHTML = `
        <div style="
            position: absolute;
            top: 60px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            padding: 8px 15px;
            border-radius: 8px;
            z-index: 100;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        ">
            <div id="api-status-dot" class="status-dot disconnected"></div>
            <div style="display: flex; flex-direction: column;">
                <span id="api-status-text" style="color: #fff; font-weight: bold;">Disconnected</span>
                <span id="api-last-update" style="color: #888; font-size: 10px;">Never</span>
            </div>
            <button id="api-toggle-btn" style="
                background: #4fc3f7;
                border: none;
                color: #000;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                margin-left: 5px;
            ">Start</button>
        </div>

        <style>
            .status-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            .status-dot.connected {
                background: #69f0ae;
            }
            .status-dot.disconnected {
                background: #616161;
                animation: none;
            }
            .status-dot.error {
                background: #ff5252;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    `;

    document.body.appendChild(indicator);

    // Add toggle button listener
    const toggleBtn = document.getElementById('api-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            togglePolling();
            toggleBtn.textContent = isPolling ? 'Stop' : 'Start';
            toggleBtn.style.background = isPolling ? '#ff5252' : '#4fc3f7';
        });
    }

    // Update button text on initialization
    if (API_CONFIG.autoStart) {
        setTimeout(() => {
            if (toggleBtn) {
                toggleBtn.textContent = 'Stop';
                toggleBtn.style.background = '#ff5252';
            }
        }, 1100);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Make functions available globally
window.WTPAPI = {
    startPolling,
    stopPolling,
    togglePolling,
    fetchPlantData,
    transformApiData,
    getConnectionStatus: () => connectionStatus,
    getLastFetchTime: () => lastFetchTime,
    isPolling: () => isPolling,
    config: API_CONFIG
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAPI);
} else {
    initAPI();
}
