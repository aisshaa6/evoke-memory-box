import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Check, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import 'leaflet/dist/leaflet.css';
import './LocationMapPicker.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const selectedIcon = L.divIcon({
    className: '',
    html: `<div class="picker-marker">
        <div class="picker-marker-inner"></div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

function ClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

async function reverseGeocode(lat, lng, lang) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
        const res = await fetch(url, {
            headers: { 'Accept-Language': lang || 'tr' }
        });
        const data = await res.json();
        const addr = data.address || {};
        const city =
            addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.state || '';
        const country = addr.country || '';
        return { city, country };
    } catch {
        return { city: '', country: '' };
    }
}

export default function LocationMapPicker({ onSelect, onClose }) {
    const { t, language } = useLanguage();
    const [selected, setSelected] = useState(null);
    const [geocoded, setGeocoded] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleMapClick = useCallback(async (latlng) => {
        setSelected(latlng);
        setGeocoded(null);
        setLoading(true);
        const result = await reverseGeocode(latlng.lat, latlng.lng, language);
        setGeocoded(result);
        setLoading(false);
    }, [language]);

    const handleConfirm = () => {
        if (geocoded) {
            onSelect(geocoded.city, geocoded.country);
            onClose();
        }
    };

    return (
        <div className="map-picker-overlay" onClick={onClose}>
            <div className="map-picker-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="map-picker-header">
                    <div className="map-picker-title-row">
                        <MapPin size={20} color="#FF416C" />
                        <h2>{t('addMemory.mapPickerTitle')}</h2>
                    </div>
                    <button className="map-picker-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <p className="map-picker-hint">{t('addMemory.mapPickerHint')}</p>

                {/* Map */}
                <div className="map-picker-map-wrap">
                    <MapContainer
                        center={[39.9, 32.8]}
                        zoom={5}
                        className="map-picker-leaflet"
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <ClickHandler onMapClick={handleMapClick} />
                        {selected && (
                            <Marker position={selected} icon={selectedIcon} />
                        )}
                    </MapContainer>
                </div>

                {/* Result bar */}
                <div className="map-picker-footer">
                    <div className="map-picker-result">
                        {loading && (
                            <span className="map-picker-loading">
                                <Loader size={16} className="spin" />
                                {t('addMemory.mapPickerSearching')}
                            </span>
                        )}
                        {!loading && geocoded && (
                            <span className="map-picker-found">
                                <MapPin size={14} color="#FF416C" />
                                <strong>{geocoded.city}</strong>
                                {geocoded.city && geocoded.country ? ', ' : ''}
                                {geocoded.country}
                            </span>
                        )}
                        {!loading && !geocoded && (
                            <span className="map-picker-empty">
                                {t('addMemory.mapPickerClickHint')}
                            </span>
                        )}
                    </div>
                    <button
                        className="map-picker-confirm btn-gradient"
                        disabled={!geocoded || loading}
                        onClick={handleConfirm}
                    >
                        <Check size={18} />
                        {t('addMemory.mapPickerConfirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
