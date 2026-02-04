/**
 * Water Treatment Plant (WTP) Three.js Visualizer
 *
 * This script loads a .glb model and animates it based on JSON payload data.
 * Expected node naming convention in .glb:
 * - Tanks: RWT, CST, CFT, SCT, CWT, SLT (with _Water suffix for water mesh)
 * - Pumps: CDP, PPS_Pump1, PPS_Pump2
 * - Mixers: CFT_Mixer, SCT_Scraper
 * - Pipes: Pipe_RWT_CFT, Pipe_CFT_SCT, etc.
 * - Filters: FTR
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    modelPath: 'wtp-model.glb', // Path to your .glb model
    updateInterval: 1000, // Data update interval in ms
    animationSpeed: 0.016, // Animation delta time
    colors: {
        cleanWater: 0x4fc3f7,
        rawWater: 0x8d6e63,
        sludge: 0x5d4037,
        alarm: 0xff5252,
        ok: 0x69f0ae,
        warning: 0xffd740,
        pumpOn: 0x69f0ae,
        pumpOff: 0x616161,
        chemical: 0xab47bc
    },
    tank: {
        minScale: 0.05,
        maxScale: 1.0
    }
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene, camera, renderer, labelRenderer, controls;
let clock = new THREE.Clock();
let model = null;
let labelsVisible = true;

// Component references
const components = {
    tanks: {},
    pumps: {},
    mixers: {},
    pipes: {},
    filters: {},
    labels: {}
};

// Current animation targets (for smooth interpolation)
const animationTargets = {
    levels: {},
    rotations: {},
    flows: {}
};

// Current plant data
let plantData = getDefaultPayload();

// Active alarms
let activeAlarms = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 50, 200);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(30, 25, 30);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // CSS2D Label Renderer
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById('canvas-container').appendChild(labelRenderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    setupLighting();

    // Grid helper (optional, for development)
    const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Load the model
    loadModel();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    setupControls();

    // Start animation loop
    animate();
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(50, 50, 25);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // Hemisphere light for sky/ground ambient
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x362d1e, 0.3);
    scene.add(hemiLight);
}

// ============================================================================
// MODEL LOADING
// ============================================================================

function loadModel() {
    const loader = new GLTFLoader();

    loader.load(
        CONFIG.modelPath,
        (gltf) => {
            model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                // Map components by name
                mapComponent(child);
            });

            scene.add(model);

            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Create labels for components
            createLabels();

            // Hide loading indicator
            document.getElementById('loading').classList.add('hidden');

            console.log('Model loaded successfully');
            console.log('Mapped components:', components);
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`Loading: ${percent}%`);
        },
        (error) => {
            console.error('Error loading model:', error);
            document.getElementById('loading').innerHTML = `
                <div style="color: #ff5252;">
                    Error loading model.<br>
                    Make sure 'wtp-model.glb' exists in the project folder.<br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    );
}

function mapComponent(object) {
    const name = object.name.toUpperCase();

    // Tanks
    if (name.includes('RWT')) {
        if (name.includes('WATER')) {
            components.tanks.RWT_Water = object;
        } else {
            components.tanks.RWT = object;
        }
    }
    if (name.includes('CST')) {
        if (name.includes('WATER') || name.includes('CHEMICAL')) {
            components.tanks.CST_Water = object;
        } else {
            components.tanks.CST = object;
        }
    }
    if (name.includes('CFT')) {
        if (name.includes('WATER')) {
            components.tanks.CFT_Water = object;
        } else if (name.includes('MIXER')) {
            components.mixers.CFT_Mixer = object;
        } else {
            components.tanks.CFT = object;
        }
    }
    if (name.includes('SCT')) {
        if (name.includes('WATER')) {
            components.tanks.SCT_Water = object;
        } else if (name.includes('SCRAPER')) {
            components.mixers.SCT_Scraper = object;
        } else if (name.includes('SLUDGE')) {
            components.tanks.SCT_Sludge = object;
        } else {
            components.tanks.SCT = object;
        }
    }
    if (name.includes('CWT')) {
        if (name.includes('WATER')) {
            components.tanks.CWT_Water = object;
        } else {
            components.tanks.CWT = object;
        }
    }
    if (name.includes('SLT')) {
        if (name.includes('WATER') || name.includes('SLUDGE')) {
            components.tanks.SLT_Water = object;
        } else {
            components.tanks.SLT = object;
        }
    }

    // Pumps
    if (name.includes('CDP') || name.includes('DOSING')) {
        components.pumps.CDP = object;
    }
    if (name.includes('PPS') || name.includes('PUMP')) {
        if (name.includes('1')) {
            components.pumps.PPS_Pump1 = object;
        } else if (name.includes('2')) {
            components.pumps.PPS_Pump2 = object;
        } else {
            components.pumps.PPS = object;
        }
    }

    // Filters
    if (name.includes('FTR') || name.includes('FILTER')) {
        components.filters.FTR = object;
    }

    // Pipes
    if (name.includes('PIPE')) {
        components.pipes[name] = object;
    }
}

// ============================================================================
// LABELS
// ============================================================================

function createLabels() {
    // Create labels for main tanks
    const tankLabels = [
        { key: 'RWT', text: 'Raw Water Tank', dataKey: 'rwt' },
        { key: 'CST', text: 'Chemical Storage', dataKey: 'cst' },
        { key: 'CFT', text: 'Coagulation Tank', dataKey: 'cft' },
        { key: 'SCT', text: 'Sedimentation Tank', dataKey: 'sct' },
        { key: 'CWT', text: 'Clean Water Tank', dataKey: 'cwt' },
        { key: 'SLT', text: 'Sludge Tank', dataKey: 'slt' }
    ];

    tankLabels.forEach(({ key, text, dataKey }) => {
        const tank = components.tanks[key];
        if (tank) {
            const label = createLabel(text, dataKey);
            tank.add(label);
            components.labels[key] = label;
        }
    });
}

function createLabel(text, dataKey) {
    const div = document.createElement('div');
    div.className = 'label-3d';
    div.innerHTML = `
        <div style="
            background: rgba(0,0,0,0.8);
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            border-left: 3px solid #4fc3f7;
        ">
            <div style="color: #4fc3f7; font-weight: bold;">${text}</div>
            <div style="color: #fff;" id="label-${dataKey}">--</div>
        </div>
    `;

    const label = new CSS2DObject(div);
    label.position.set(0, 5, 0);
    return label;
}

function updateLabels() {
    // Update label values based on plant data
    const labelUpdates = {
        'rwt': `Level: ${plantData.RWT?.Level?.toFixed(1) || '--'}%`,
        'cst': `Level: ${plantData.CST?.Level?.toFixed(1) || '--'}%`,
        'cft': `Level: ${plantData.CFT?.Level?.toFixed(1) || '--'}%`,
        'sct': `Level: ${plantData.SCT?.Level?.toFixed(1) || '--'}%`,
        'cwt': `Level: ${plantData.CWT?.Level?.toFixed(1) || '--'}%`,
        'slt': `Level: ${plantData.SLT?.Level?.toFixed(1) || '--'}%`
    };

    Object.entries(labelUpdates).forEach(([key, value]) => {
        const el = document.getElementById(`label-${key}`);
        if (el) el.textContent = value;
    });
}

function toggleLabels() {
    labelsVisible = !labelsVisible;
    Object.values(components.labels).forEach(label => {
        label.visible = labelsVisible;
    });
}

// ============================================================================
// ANIMATIONS
// ============================================================================

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Update controls
    controls.update();

    // Update animations
    updateTankLevels(delta);
    updateMixers(delta);
    updatePumps(delta);
    updatePipeFlows(delta);
    updateAlarmEffects(delta);

    // Render
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function updateTankLevels(delta) {
    const lerpFactor = 2 * delta; // Smooth interpolation

    // Update each tank water level
    const tankMappings = [
        { water: 'RWT_Water', data: plantData.RWT?.Level },
        { water: 'CST_Water', data: plantData.CST?.Level },
        { water: 'CFT_Water', data: plantData.CFT?.Level },
        { water: 'SCT_Water', data: plantData.SCT?.Level },
        { water: 'CWT_Water', data: plantData.CWT?.Level },
        { water: 'SLT_Water', data: plantData.SLT?.Level }
    ];

    tankMappings.forEach(({ water, data }) => {
        const waterMesh = components.tanks[water];
        if (waterMesh && data !== undefined) {
            const targetScale = CONFIG.tank.minScale +
                (data / 100) * (CONFIG.tank.maxScale - CONFIG.tank.minScale);

            // Initialize if not set
            if (animationTargets.levels[water] === undefined) {
                animationTargets.levels[water] = waterMesh.scale.y;
            }

            // Smooth interpolation
            animationTargets.levels[water] = THREE.MathUtils.lerp(
                animationTargets.levels[water],
                targetScale,
                lerpFactor
            );

            waterMesh.scale.y = animationTargets.levels[water];
        }
    });

    // Update water colors based on turbidity/type
    updateWaterColors();
}

function updateWaterColors() {
    // Raw water tank - brown based on turbidity
    const rwtWater = components.tanks.RWT_Water;
    if (rwtWater && rwtWater.material) {
        const turbidity = plantData.RWT?.Turbidity || 0;
        const color = new THREE.Color().lerpColors(
            new THREE.Color(CONFIG.colors.cleanWater),
            new THREE.Color(CONFIG.colors.rawWater),
            Math.min(turbidity / 100, 1)
        );
        rwtWater.material.color = color;
        rwtWater.material.opacity = 0.7;
        rwtWater.material.transparent = true;
    }

    // Clean water tank - blue
    const cwtWater = components.tanks.CWT_Water;
    if (cwtWater && cwtWater.material) {
        cwtWater.material.color = new THREE.Color(CONFIG.colors.cleanWater);
        cwtWater.material.opacity = 0.7;
        cwtWater.material.transparent = true;
    }

    // Sludge tank - brown
    const sltWater = components.tanks.SLT_Water;
    if (sltWater && sltWater.material) {
        sltWater.material.color = new THREE.Color(CONFIG.colors.sludge);
        sltWater.material.opacity = 0.8;
        sltWater.material.transparent = true;
    }
}

function updateMixers(delta) {
    // CFT Mixer rotation
    const cftMixer = components.mixers.CFT_Mixer;
    if (cftMixer && plantData.CFT?.Mixer_Status) {
        cftMixer.rotation.y += delta * 2; // Rotate when mixer is on
    }

    // SCT Scraper rotation
    const sctScraper = components.mixers.SCT_Scraper;
    if (sctScraper && plantData.SCT?.Scraper_Status) {
        sctScraper.rotation.y += delta * 0.5; // Slower rotation for scraper
    }
}

function updatePumps(delta) {
    const time = clock.getElapsedTime();

    // Chemical Dosing Pump
    const cdp = components.pumps.CDP;
    if (cdp) {
        const isOn = plantData.CDP?.Status;
        if (cdp.material) {
            cdp.material.emissive = new THREE.Color(
                isOn ? CONFIG.colors.pumpOn : CONFIG.colors.pumpOff
            );
            cdp.material.emissiveIntensity = isOn ? 0.3 + Math.sin(time * 5) * 0.1 : 0;
        }
    }

    // Main pumps
    ['PPS_Pump1', 'PPS_Pump2'].forEach((pumpKey, index) => {
        const pump = components.pumps[pumpKey];
        if (pump) {
            const isOn = index === 0
                ? plantData.PPS?.Pump1_Status
                : plantData.PPS?.Pump2_Status;

            if (pump.material) {
                pump.material.emissive = new THREE.Color(
                    isOn ? CONFIG.colors.pumpOn : CONFIG.colors.pumpOff
                );
                pump.material.emissiveIntensity = isOn ? 0.3 + Math.sin(time * 5) * 0.1 : 0;
            }

            // Slight vibration when running
            if (isOn) {
                pump.position.y = pump.userData.originalY || pump.position.y;
                pump.userData.originalY = pump.userData.originalY || pump.position.y;
                pump.position.y += Math.sin(time * 30) * 0.02;
            }
        }
    });
}

function updatePipeFlows(delta) {
    // Animate pipe materials to show flow
    const flowRate = plantData.PPS?.Flow_Rate || 0;
    const time = clock.getElapsedTime();

    Object.values(components.pipes).forEach(pipe => {
        if (pipe.material && flowRate > 0) {
            // Create flowing effect using texture offset or color pulse
            if (pipe.material.map) {
                pipe.material.map.offset.x += delta * flowRate * 0.01;
            }
            // Pulse effect for pipes
            pipe.material.emissive = new THREE.Color(CONFIG.colors.cleanWater);
            pipe.material.emissiveIntensity = 0.1 + Math.sin(time * 3) * 0.05;
        }
    });
}

function updateAlarmEffects(delta) {
    const time = clock.getElapsedTime();
    const alarmPulse = Math.sin(time * 5) > 0;

    // Check for alarms and update visual effects
    activeAlarms = [];

    // RWT alarms
    if (plantData.RWT?.High_Level_Alarm) {
        activeAlarms.push('RWT High Level');
        pulseComponent(components.tanks.RWT, alarmPulse);
    }
    if (plantData.RWT?.Low_Level_Alarm) {
        activeAlarms.push('RWT Low Level');
        pulseComponent(components.tanks.RWT, alarmPulse);
    }

    // CWT alarms
    if (plantData.CWT?.High_Level_Alarm) {
        activeAlarms.push('CWT High Level');
        pulseComponent(components.tanks.CWT, alarmPulse);
    }
    if (plantData.CWT?.Low_Level_Alarm) {
        activeAlarms.push('CWT Low Level');
        pulseComponent(components.tanks.CWT, alarmPulse);
    }

    // Pump faults
    if (plantData.CDP?.Fault) {
        activeAlarms.push('CDP Fault');
        pulseComponent(components.pumps.CDP, alarmPulse);
    }
    if (plantData.PPS?.Fault) {
        activeAlarms.push('PPS Fault');
        pulseComponent(components.pumps.PPS_Pump1, alarmPulse);
        pulseComponent(components.pumps.PPS_Pump2, alarmPulse);
    }

    // Update alarm panel
    updateAlarmPanel();
}

function pulseComponent(component, pulse) {
    if (component && component.material) {
        component.material.emissive = new THREE.Color(
            pulse ? CONFIG.colors.alarm : 0x000000
        );
        component.material.emissiveIntensity = pulse ? 0.5 : 0;
    }
}

function updateAlarmPanel() {
    const panel = document.getElementById('alarm-panel');
    const list = document.getElementById('alarm-list');

    if (activeAlarms.length > 0) {
        panel.classList.add('active');
        list.innerHTML = activeAlarms.map(a => `<div>- ${a}</div>`).join('');
    } else {
        panel.classList.remove('active');
    }
}

// ============================================================================
// DATA HANDLING
// ============================================================================

function getDefaultPayload() {
    return {
        RWT: {
            Level: 65,
            High_Level_Alarm: false,
            Low_Level_Alarm: false,
            Inflow_Rate: 120,
            Outflow_Rate: 115,
            pH: 7.2,
            Turbidity: 45
        },
        CDP: {
            Status: true,
            Mode: 'AUTO',
            Dosing_Rate: 5.5,
            Total_Chemical_Used: 1250,
            Pressure: 2.5,
            Fault: false
        },
        CST: {
            Level: 78,
            Low_Level_Alarm: false
        },
        CFT: {
            Level: 55,
            Mixer_Status: true,
            pH: 6.8,
            Turbidity: 25,
            Dosing_Rate: 3.2
        },
        SCT: {
            Level: 70,
            Sludge_Level: 15,
            Turbidity_Outlet: 8,
            Scraper_Status: true
        },
        FTR: {
            Differential_Pressure: 0.8,
            Flow_Rate: 95,
            Backwash_Status: false
        },
        CWT: {
            Level: 82,
            High_Level_Alarm: false,
            Low_Level_Alarm: false,
            pH: 7.0,
            Turbidity: 0.5,
            Residual_Chlorine: 0.8
        },
        SLT: {
            Level: 35,
            Pump_Status: false
        },
        PPS: {
            Pump1_Status: true,
            Pump2_Status: false,
            Mode: 'AUTO',
            Flow_Rate: 110,
            Outlet_Pressure: 3.2,
            Fault: false
        },
        PLT: {
            Total_Inflow: 120,
            Total_Outflow: 115,
            System_Mode: 'AUTO',
            Alarm_Status: false
        }
    };
}

/**
 * Update plant data from external JSON payload
 * Call this function to update the visualization with new data
 * @param {Object} payload - JSON object with plant data
 */
function updatePlantData(payload) {
    // Merge new payload with existing data
    plantData = { ...plantData, ...payload };

    // Update UI dashboard
    updateDashboard();
    updateLabels();
}

function updateDashboard() {
    // RWT
    updateElement('rwt-level', plantData.RWT?.Level?.toFixed(1) + '%');
    updateElement('rwt-ph', plantData.RWT?.pH?.toFixed(1));
    updateElement('rwt-turbidity', plantData.RWT?.Turbidity?.toFixed(1) + ' NTU');
    updateElement('rwt-inflow', plantData.RWT?.Inflow_Rate?.toFixed(0) + ' m³/h');

    // CFT
    updateElement('cft-level', plantData.CFT?.Level?.toFixed(1) + '%');
    updateElement('cft-mixer', plantData.CFT?.Mixer_Status ? 'ON' : 'OFF',
        plantData.CFT?.Mixer_Status ? 'ok' : '');
    updateElement('cft-ph', plantData.CFT?.pH?.toFixed(1));

    // SCT
    updateElement('sct-level', plantData.SCT?.Level?.toFixed(1) + '%');
    updateElement('sct-sludge', plantData.SCT?.Sludge_Level?.toFixed(1) + '%');
    updateElement('sct-scraper', plantData.SCT?.Scraper_Status ? 'ON' : 'OFF',
        plantData.SCT?.Scraper_Status ? 'ok' : '');

    // FTR
    updateElement('ftr-flow', plantData.FTR?.Flow_Rate?.toFixed(0) + ' m³/h');
    updateElement('ftr-pressure', plantData.FTR?.Differential_Pressure?.toFixed(2) + ' bar');
    updateElement('ftr-backwash', plantData.FTR?.Backwash_Status ? 'ACTIVE' : 'OFF',
        plantData.FTR?.Backwash_Status ? 'warning' : '');

    // CWT
    updateElement('cwt-level', plantData.CWT?.Level?.toFixed(1) + '%');
    updateElement('cwt-ph', plantData.CWT?.pH?.toFixed(1));
    updateElement('cwt-chlorine', plantData.CWT?.Residual_Chlorine?.toFixed(2) + ' mg/L');

    // CDP
    updateElement('cdp-status-val', plantData.CDP?.Status ? 'ON' : 'OFF',
        plantData.CDP?.Status ? 'ok' : '');
    updateElement('cdp-mode', plantData.CDP?.Mode);
    updateElement('cdp-rate', plantData.CDP?.Dosing_Rate?.toFixed(1) + ' L/h');

    // PPS
    updateElement('pps-pump1', plantData.PPS?.Pump1_Status ? 'ON' : 'OFF',
        plantData.PPS?.Pump1_Status ? 'ok' : '');
    updateElement('pps-pump2', plantData.PPS?.Pump2_Status ? 'ON' : 'OFF',
        plantData.PPS?.Pump2_Status ? 'ok' : '');
    updateElement('pps-flow', plantData.PPS?.Flow_Rate?.toFixed(0) + ' m³/h');

    // System mode
    const modeEl = document.getElementById('system-mode');
    if (modeEl) {
        modeEl.textContent = plantData.PLT?.System_Mode || 'AUTO';
        modeEl.className = 'mode' +
            (plantData.PLT?.System_Mode === 'MANUAL' ? ' manual' : '');
    }
}

function updateElement(id, value, statusClass = '') {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value || '--';
        el.className = 'value ' + statusClass;
    }
}

// ============================================================================
// SIMULATION (for testing without real data)
// ============================================================================

let simulationInterval = null;

function startSimulation() {
    if (simulationInterval) return;

    simulationInterval = setInterval(() => {
        // Simulate changing values
        const simData = {
            RWT: {
                Level: 50 + Math.random() * 40,
                pH: 6.5 + Math.random() * 1.5,
                Turbidity: 30 + Math.random() * 40,
                Inflow_Rate: 100 + Math.random() * 50,
                High_Level_Alarm: Math.random() > 0.95,
                Low_Level_Alarm: Math.random() > 0.95
            },
            CFT: {
                Level: 40 + Math.random() * 40,
                Mixer_Status: true,
                pH: 6.0 + Math.random() * 1.5,
                Turbidity: 15 + Math.random() * 20
            },
            SCT: {
                Level: 60 + Math.random() * 30,
                Sludge_Level: 10 + Math.random() * 20,
                Scraper_Status: true
            },
            CWT: {
                Level: 70 + Math.random() * 25,
                pH: 6.8 + Math.random() * 0.6,
                Residual_Chlorine: 0.5 + Math.random() * 0.8
            },
            FTR: {
                Flow_Rate: 80 + Math.random() * 40,
                Differential_Pressure: 0.5 + Math.random() * 1
            },
            PPS: {
                Pump1_Status: true,
                Pump2_Status: Math.random() > 0.7,
                Flow_Rate: 90 + Math.random() * 40
            },
            CDP: {
                Status: true,
                Dosing_Rate: 3 + Math.random() * 5
            },
            SLT: {
                Level: 20 + Math.random() * 40
            }
        };

        updatePlantData(simData);
    }, CONFIG.updateInterval);
}

function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

// ============================================================================
// UI CONTROLS
// ============================================================================

function setupControls() {
    document.getElementById('btn-reset-view').addEventListener('click', () => {
        camera.position.set(30, 25, 30);
        controls.target.set(0, 0, 0);
        controls.update();
    });

    document.getElementById('btn-toggle-labels').addEventListener('click', toggleLabels);

    const simBtn = document.getElementById('btn-simulate');
    simBtn.addEventListener('click', () => {
        if (simulationInterval) {
            stopSimulation();
            simBtn.classList.remove('active');
            simBtn.textContent = 'Simulate Data';
        } else {
            startSimulation();
            simBtn.classList.add('active');
            simBtn.textContent = 'Stop Simulation';
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// EXPORTS & INITIALIZATION
// ============================================================================

// Make updatePlantData available globally for external calls (Node-RED, etc.)
window.WTPVisualizer = {
    updatePlantData,
    startSimulation,
    stopSimulation,
    getPlantData: () => plantData,
    resetView: () => {
        camera.position.set(30, 25, 30);
        controls.target.set(0, 0, 0);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
