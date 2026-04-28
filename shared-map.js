// shared-map.js

// Feature: Icon Initialization (if lucide exists)
if (typeof lucide !== 'undefined') lucide.createIcons();

// 1. Initialize Map
const mapId = document.getElementById('real-map') ? 'real-map' : 'map';
const map = L.map(mapId, { zoomControl: false }).setView([19.1136, 72.8697], 15);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '©OpenStreetMap'
}).addTo(map);

const posIncident = [19.1136, 72.8697];
const posUser = [19.1160, 72.8650];
const posHospital = [19.1050, 72.8800];

// Incident Marker (Pulsing Red)
const incidentIcon = L.divIcon({ className: 'pulse-marker', iconSize: [20, 20] });
L.marker(posIncident, { icon: incidentIcon }).addTo(map);

// User Marker (Blue Dot)
const userIcon = L.divIcon({ className: 'blue-dot', iconSize: [15, 15] });
L.marker(posUser, { icon: userIcon }).addTo(map);

// Hospital Icon
const hospitalIcon = L.divIcon({ 
    html: '<div style="color:#2e7d32; background:white; padding:5px; border-radius:5px; border:1px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.1)">🏥</div>', 
    className: '', iconSize: [30, 30] 
});
L.marker(posHospital, { icon: hospitalIcon }).addTo(map);

let trackingProgress = 0;
const totalEtaMinutes = 2;
const totalEtaSeconds = totalEtaMinutes * 60;

const etaElement = document.getElementById('eta-display');
const statusText = document.getElementById('current-status-text') || document.getElementById('status-text');

let startTime = null;
let vehicleMarker = null;

let totalDistance = 0;
const segmentDistances = [];
const cumulativeDistances = [0];

// Global state for responder view
window.missionState = 0;
window.isAnimatingMap = false;

L.Routing.control({
    waypoints: [
        L.latLng(19.1220, 72.8580),
        L.latLng(19.1136, 72.8697)
    ],
    createMarker: function() { return null; },
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: false,
    showAlternatives: false,
    lineOptions: {
        styles: [{ color: '#e53935', weight: 4, opacity: 0.8, dashArray: '10, 10' }]
    }
}).on('routesfound', function(e) {
    const routes = e.routes;
    const coordinates = routes[0].coordinates; 
    const roadPoints = coordinates.map(c => [c.lat, c.lng]);
    
    totalDistance = 0;
    segmentDistances.length = 0;
    cumulativeDistances.length = 0;
    cumulativeDistances.push(0);

    for (let i = 0; i < roadPoints.length - 1; i++) {
        const p1 = L.latLng(roadPoints[i][0], roadPoints[i][1]);
        const p2 = L.latLng(roadPoints[i + 1][0], roadPoints[i + 1][1]);
        const dist = p1.distanceTo(p2);
        segmentDistances.push(dist);
        totalDistance += dist;
        cumulativeDistances.push(totalDistance);
    }

    const vehicleIcon = L.divIcon({ 
        html: '<div class="vehicle-icon" style="font-size: 30px;">🚗</div>', 
        className: '', 
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    if (vehicleMarker) map.removeLayer(vehicleMarker);
    vehicleMarker = L.marker(roadPoints[0], { icon: vehicleIcon }).addTo(map);

    const routingContainer = document.querySelector('.leaflet-routing-container');
    if(routingContainer) routingContainer.style.display = 'none';

    // Start auto-animation if we're not on tracking page, or if we are, wait for start
    if (!document.getElementById('btn-start')) {
        window.isAnimatingMap = true;
    }

    startTime = Date.now();
    requestAnimationFrame(() => animate(roadPoints));

}).addTo(map);

function getPointAtProgress(progress, roadPoints) {
    if (progress <= 0) return roadPoints[0];
    if (progress >= 100) return roadPoints[roadPoints.length - 1];
    
    const targetDistance = (progress / 100) * totalDistance;
    
    for (let i = 0; i < cumulativeDistances.length - 1; i++) {
        if (targetDistance >= cumulativeDistances[i] && targetDistance <= cumulativeDistances[i+1]) {
            const segmentStart = roadPoints[i];
            const segmentEnd = roadPoints[i+1];
            const segmentLength = segmentDistances[i];
            let t = 0;
            if (segmentLength > 0) t = (targetDistance - cumulativeDistances[i]) / segmentLength;
            
            const lat = segmentStart[0] + (segmentEnd[0] - segmentStart[0]) * t;
            const lng = segmentStart[1] + (segmentEnd[1] - segmentStart[1]) * t;
            return [lat, lng];
        }
    }
    return roadPoints[roadPoints.length - 1];
}

function updateUI(progress, roadPoints) {
    if (vehicleMarker) {
        const pos = getPointAtProgress(progress, roadPoints);
        vehicleMarker.setLatLng(pos);
    }

    const remainingProgress = 100 - progress;
    const remainingSeconds = Math.max(0, Math.ceil((remainingProgress / 100) * totalEtaSeconds));
    const mins = Math.ceil(remainingSeconds / 60);
    
    if (etaElement) {
        if (mins <= 0) etaElement.innerText = "Arrived";
        else etaElement.innerText = `${mins} min${mins > 1 ? 's' : ''}`;
    }

    if (document.getElementById('step-0')) {
        document.getElementById('step-0').classList.toggle('active', progress >= 0);
        document.getElementById('step-1').classList.toggle('active', progress >= 20);
        document.getElementById('step-2').classList.toggle('active', progress >= 60);
        document.getElementById('step-3').classList.toggle('active', progress >= 100);
    }

    if (statusText) {
        if (progress >= 100) {
            statusText.innerText = "ARRIVED";
            statusText.style.color = "#2e7d32";
        } else if (progress >= 60) {
            statusText.innerText = "NEAR LOCATION";
            statusText.style.color = "var(--primary, #e53935)";
        } else if (progress >= 20) {
            statusText.innerText = "ON THE WAY";
            statusText.style.color = "var(--primary, #e53935)";
        } else {
            statusText.innerText = "ASSIGNED";
            statusText.style.color = "var(--primary, #e53935)";
        }
    }
    
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = progress + '%';
    
    const speedText = document.getElementById('speed-text');
    if (speedText) {
        if (progress >= 100) speedText.innerHTML = '0 <span class="text-xs">km/h</span>';
        else if (Math.random() > 0.9) speedText.innerHTML = Math.floor(40 + Math.random() * 20) + ' <span class="text-xs">km/h</span>';
    }
}

function animate(roadPoints) {
    if (!window.isAnimatingMap) {
        startTime = Date.now(); // Reset start time while waiting
        requestAnimationFrame(() => animate(roadPoints));
        return;
    }

    const elapsed = Date.now() - startTime;
    const durationMs = totalEtaSeconds * 1000;
    
    trackingProgress = (elapsed / durationMs) * 100;

    if (trackingProgress >= 100) {
        trackingProgress = 100;
        updateUI(trackingProgress, roadPoints);
        return;
    }

    updateUI(trackingProgress, roadPoints);
    requestAnimationFrame(() => animate(roadPoints));
}

// Tracking specific logic overrides
window.startJourney = function() {
    window.isAnimatingMap = true;
    startTime = Date.now();
    document.getElementById('btn-start').style.display = "none";
    const reachedBtn = document.getElementById('btn-reached');
    reachedBtn.disabled = false;
    reachedBtn.style.opacity = "1";
    reachedBtn.style.cursor = "pointer";
    reachedBtn.classList.add('btn-start');
}

window.reachedLocation = function() {
    // Just mock finishing the journey
    trackingProgress = 100;
    document.getElementById('btn-reached').style.display = "none";
    document.getElementById('btn-complete').style.display = "flex";
}

setTimeout(() => map.invalidateSize(), 100);
window.addEventListener('resize', () => map.invalidateSize());
