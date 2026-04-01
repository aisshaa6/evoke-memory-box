import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemories } from '../hooks/useMemories';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, MapPin, Star, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../contexts/LanguageContext';
import './MapView.css';

// Fix default icon paths broken by Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pink aurora marker
const createAuroraIcon = (isFav) => L.divIcon({
    className: '',
    html: `<div class="aurora-marker ${isFav ? 'fav' : ''}">
        <div class="aurora-marker-inner"></div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

// Cache geocode results in memory
const geocodeCache = {};

async function geocodeLocation(locationStr) {
    if (!locationStr) return null;
    if (geocodeCache[locationStr]) return geocodeCache[locationStr];
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationStr)}&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': localStorage.getItem('memorybox_lang') || 'tr' } });
        const data = await res.json();
        if (data && data.length > 0) {
            const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            geocodeCache[locationStr] = result;
            return result;
        }
    } catch (e) { /* silently fail */ }
    return null;
}

function FitBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points.length === 0) return;
        if (points.length === 1) {
            map.setView([points[0].lat, points[0].lng], 8);
        } else {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [60, 60] });
        }
    }, [points, map]);
    return null;
}

export default function MapView() {
    const navigate = useNavigate();
    const { memories } = useMemories();
    const { t, language } = useLanguage();
    const [geoMemories, setGeoMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noLocation, setNoLocation] = useState(false);

    const memoriesWithLocation = memories.filter(m => m.location && m.location.trim());

    useEffect(() => {
        if (memoriesWithLocation.length === 0) {
            setLoading(false);
            setNoLocation(true);
            return;
        }
        setNoLocation(false);
        let cancelled = false;
        const geocodeAll = async () => {
            const results = [];
            for (const m of memoriesWithLocation) {
                const coords = await geocodeLocation(m.location);
                if (coords) results.push({ ...m, lat: coords.lat, lng: coords.lng });
            }
            if (!cancelled) {
                setGeoMemories(results);
                setLoading(false);
                if (results.length === 0) setNoLocation(true);
            }
        };
        geocodeAll();
        return () => { cancelled = true; };
    }, [memories.length]);

    const formatDate = (d) => {
        try { return new Date(d).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }); }
        catch { return d; }
    };

    const points = geoMemories.map(m => ({ lat: m.lat, lng: m.lng }));

    return (
        <div className="mapview-page">
            {/* Floating Header */}
            <div className="map-header glass-card">
                <button onClick={() => navigate('/home')} className="back-btn glass-btn">
                    <ArrowLeft size={24} color="var(--text-primary)" />
                </button>
                <div>
                    <h1 className="map-title">{t('map.title')}</h1>
                    {!loading && (
                        <p className="map-subtitle">
                            {geoMemories.length > 0
                                ? `${geoMemories.length} ${t('map.showing')}`
                                : t('map.noLocation')}
                        </p>
                    )}
                </div>
                <div style={{ width: 50 }} />
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="map-loading">
                    <div className="loading-orb"></div>
                    <p>{t('map.loading')}</p>
                </div>
            )}

            {/* No Location State Overlay */}
            {!loading && noLocation && (
                <div className="map-empty-overlay">
                    <div className="map-empty-content glass-card slide-up">
                        <MapPin size={48} color="#FF416C" />
                        <h2>{t('map.noMemoriesTitle')}</h2>
                        <p className="text-secondary">{t('map.notAvailable')}</p>
                        <button className="btn-gradient mt-4" onClick={() => navigate('/add')}>{t('map.addMemory')}</button>
                    </div>
                </div>
            )}

            {/* Map (Always visible behind if not loading) */}
            {!loading && (
                <MapContainer
                    center={[39.9, 32.8]}
                    zoom={6}
                    className="leaflet-map"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {geoMemories.map(m => (
                        <Marker
                            key={m.id}
                            position={[m.lat, m.lng]}
                            icon={createAuroraIcon(m.isFavorite)}
                        >
                            <Popup className="aurora-popup" maxWidth={280}>
                                <div className="popup-inner" onClick={() => navigate(`/memory/${m.id}`)}>
                                    {m.photo && (
                                        <div className="popup-photo">
                                            <img src={m.photo} alt={m.title} />
                                        </div>
                                    )}
                                    <div className="popup-body">
                                        <div className="popup-meta">
                                            <span><Calendar size={12} /> {formatDate(m.date)}</span>
                                            {m.isFavorite && <Star size={12} fill="#FF416C" color="#FF416C" />}
                                        </div>
                                        <h3 className="popup-title">{m.title}</h3>
                                        <p className="popup-location"><MapPin size={12} /> {m.location}</p>
                                        {m.note && <p className="popup-note">{m.note.slice(0, 100)}{m.note.length > 100 ? '...' : ''}</p>}
                                        <span className="popup-link">{t('common.details')} →</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
}
