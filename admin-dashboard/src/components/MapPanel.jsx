import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Shop Icon (Blue)
const shopIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom Rider Icon (Green)
const riderIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapPanel = ({ shops = [], riders = [] }) => {
    // Default center: Delhi
    const defaultCenter = [28.6139, 77.2090];

    return (
        <div className="w-3/5 relative">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                className="h-full w-full"
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Shop Markers (Blue) */}
                {shops.map((shop, idx) => (
                    <Marker
                        key={`shop-${idx}`}
                        position={[shop.lat || defaultCenter[0], shop.lng || defaultCenter[1]]}
                        icon={shopIcon}
                    >
                        <Popup>
                            <div className="text-sm">
                                <b className="text-blue-600">🏪 {shop.name}</b>
                                <br />
                                <span className="text-xs text-slate-600">
                                    Pending Orders: {shop.pendingOrders || 0}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Rider Markers (Green) */}
                {riders.map((rider, idx) => {
                    const riderLat = rider.lat || defaultCenter[0] + (Math.random() - 0.5) * 0.1;
                    const riderLng = rider.lng || defaultCenter[1] + (Math.random() - 0.5) * 0.1;

                    return (
                        <React.Fragment key={`rider-${idx}`}>
                            <Marker
                                position={[riderLat, riderLng]}
                                icon={riderIcon}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <b className="text-emerald-600">🛵 {rider.name}</b>
                                        <br />
                                        <span className="text-xs">
                                            {rider.isOnline ? '🟢 Online' : '🔴 Offline'}
                                        </span>
                                        <br />
                                        <span className="text-xs text-slate-600">
                                            🔋 {rider.battery || 85}% •
                                            🚀 {rider.stats?.activeCount || 0} ongoing
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Proximity Circle (500m radius) */}
                            {rider.isOnline && (
                                <Circle
                                    center={[riderLat, riderLng]}
                                    radius={500}
                                    pathOptions={{
                                        color: 'green',
                                        fillColor: 'green',
                                        fillOpacity: 0.1,
                                        weight: 1
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-slate-200 z-[1000]">
                <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Shops (Pending Orders)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span>Riders (Live Location)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPanel;
