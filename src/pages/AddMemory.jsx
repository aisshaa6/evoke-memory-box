import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemories } from '../hooks/useMemories';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLanguage } from '../contexts/LanguageContext';
import { Star, ArrowLeft, Camera, Mic, Square, Trash2, MapPin, Map } from 'lucide-react';
import LocationMapPicker from '../components/LocationMapPicker';
import './AddMemory.css';

export default function AddMemory() {
    const { t, translateTag } = useLanguage();
    const { addMemory } = useMemories();
    const { isRecording, startRecording, stopRecording, audioBase64, audioSizeMB, clearAudio } = useAudioRecorder();
    const navigate = useNavigate();

    const DEFAULT_TAGS = [
        t('addMemory.tags.family'),
        t('addMemory.tags.travel'),
        t('addMemory.tags.work'),
        t('addMemory.tags.special'),
        t('addMemory.tags.nature'),
        t('addMemory.tags.art')
    ];

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoWarning, setPhotoWarning] = useState(null);
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [tags, setTags] = useState([]);
    const [customTag, setCustomTag] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Warn if file is large
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > 4) {
            setPhotoWarning('error');
            return;
        } else if (sizeMB > 1.5) {
            setPhotoWarning('warn');
        } else {
            setPhotoWarning(null);
        }

        // Compress via canvas if > 1MB
        if (sizeMB > 1) {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 1200;
                let w = img.width, h = img.height;
                if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.75);
                setPhoto(compressed);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } else {
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleTag = (tag) => {
        setTags((prev) =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const addCustomTag = (e) => {
        e.preventDefault();
        if (customTag.trim() && !tags.includes(customTag.trim())) {
            setTags([...tags, customTag.trim()]);
        }
        setCustomTag('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
        await addMemory({
            title,
            date,
            note,
            photo,
            audio: audioBase64,
            location: `${city}${city && country ? ', ' : ''}${country}`,
            tags,
            isFavorite
        });
        navigate('/browse');
        } catch (err) {
            console.error(err);
            alert(err.message);
            setIsSaving(false);
        }
    };

    return (
        <div className="page-container add-memory-container">
            <header className="page-header mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                <button onClick={() => navigate('/home')} className="back-btn glass-btn">
                    <ArrowLeft size={24} color="var(--text-primary)" />
                </button>
                <h1 className="header-title" style={{ fontSize: '1.8rem', textAlign: 'center', whiteSpace: 'normal', overflowWrap: 'break-word', flex: 1, padding: '0 0.5rem' }}>{t('addMemory.pageTitle')}</h1>
                <div style={{ width: '50px' }}></div> {/* spacer */}
            </header>

            <div className="premium-form-wrapper glass-card">
                <form className="memory-form-premium" onSubmit={handleSubmit}>

                    <div className="form-title-row">
                        <input
                            type="text"
                            placeholder={t('addMemory.titlePlaceholder')}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="premium-input"
                            required
                        />
                        <button
                            type="button"
                            className={`favorite-toggle glass-btn ${isFavorite ? 'active' : ''}`}
                            onClick={() => setIsFavorite(!isFavorite)}
                        >
                            <div className="heart-icon-wrapper">
                                <Star fill={isFavorite ? "#FF416C" : "none"} color={isFavorite ? "#FF416C" : "var(--text-primary)"} size={24} />
                            </div>
                        </button>
                    </div>

                    <div className="form-meta-grid">
                        <div className="meta-group form-group">
                            <label>{t('common.date')}</label>
                            <input type="date" className="premium-input" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="meta-group form-group">
                             <div className="location-label-row">
                                 <label>{t('common.location')}</label>
                             </div>
                             <div className="location-inputs">
                                 <div className="loc-icon-wrapper">
                                     <MapPin size={18} color="#FF416C" />
                                 </div>
                                 <input type="text" placeholder={t('addMemory.locationCity')} value={city} onChange={e => setCity(e.target.value)} />
                                 <input type="text" placeholder={t('addMemory.locationCountry')} value={country} onChange={e => setCountry(e.target.value)} />
                             </div>
                             <button
                                 type="button"
                                 className="map-pick-btn"
                                 onClick={() => setShowMapPicker(true)}
                             >
                                 <Map size={18} color="#FF416C" />
                                 {t('addMemory.pickFromMap')}
                             </button>
                         </div>
                    </div>

                    <div className="form-group mb-4">
                        <label>{t('common.note')}</label>
                        <textarea
                            placeholder={t('addMemory.notePlaceholder')}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={6}
                            className="premium-textarea"
                            required
                        />
                    </div>

                    <div className="media-section-premium mb-4">
                        <div className="media-card glass-card inner-glass">
                            <label>{t('addMemory.photoLabel')}</label>
                            {photo ? (
                                <div className="preview-container mt-2">
                                    <img src={photo} alt="Preview" className="preview-img" />
                                    <button type="button" className="remove-media-btn" onClick={() => { setPhoto(null); setPhotoWarning(null); }}>
                                        <Trash2 size={18} color="#FF416C" />
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-area mt-2">
                                    <div className="upload-icon-wrapper"><Camera size={32} color="#FF416C" /></div>
                                    <span>{t('addMemory.uploadPhoto')}</span>
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                                </label>
                            )}
                            {photoWarning === 'error' && (
                                <div className="photo-warning error mt-2">
                                    ⚠️ {t('addMemory.photoTooLarge')}
                                </div>
                            )}
                            {photoWarning === 'warn' && (
                                <div className="photo-warning warn mt-2">
                                    📦 {t('addMemory.photoCompressed')}
                                </div>
                            )}
                        </div>

                        <div className="media-card glass-card inner-glass">
                            <label>{t('addMemory.audioLabel')}</label>
                            {audioBase64 ? (
                                <div className="audio-player-wrapper mt-2">
                                    <audio controls src={audioBase64} />
                                    <button type="button" className="remove-media-btn" onClick={clearAudio}>
                                        <Trash2 size={18} color="#FF416C" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={`upload-area mt-2 ${isRecording ? 'recording' : ''}`}
                                    onClick={isRecording ? stopRecording : startRecording}
                                    style={{ border: 'none' }}
                                >
                                    <div className="upload-icon-wrapper" style={{ background: isRecording ? '#FFD1DF' : 'white' }}>
                                        {isRecording ? <Square size={32} color="#FF416C" /> : <Mic size={32} color="#FF416C" />}
                                    </div>
                                    <span style={{ color: isRecording ? '#FF416C' : 'inherit' }}>{isRecording ? t('addMemory.stopRecording') : t('addMemory.startRecording')}</span>
                                </button>
                            )}
                            {audioBase64 && audioSizeMB > 5 && (
                                <div className="photo-warning error mt-2">
                                    ⚠️ {t('addMemory.audioTooLarge')} ({audioSizeMB}MB)
                                </div>
                            )}
                            {audioBase64 && audioSizeMB > 2 && audioSizeMB <= 5 && (
                                <div className="photo-warning warn mt-2">
                                    🎙️ {t('addMemory.audioLarge')} ({audioSizeMB}MB)
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label>{t('addMemory.tagsLabel')}</label>
                        <div className="tags-container mt-2">
                            {[...new Set([...DEFAULT_TAGS, ...tags])].map(tag => (
                                <button
                                    type="button"
                                    key={tag}
                                    className={`tag-chip ${tags.includes(tag) ? 'selected' : ''}`}
                                    onClick={() => toggleTag(tag)}
                                >
                                    {translateTag(tag)}
                                </button>
                            ))}
                        </div>
                        <div className="custom-tag-input-group mt-3">
                            <input
                                type="text"
                                placeholder={t('addMemory.customTagPlaceholder')}
                                value={customTag}
                                onChange={e => setCustomTag(e.target.value)}
                                className="custom-tag-input premium-input"
                            />
                            <button type="button" onClick={addCustomTag} className="btn-secondary-outline glass-btn">
                                {t('common.add')}
                            </button>
                        </div>
                    </div>

                    <div className="form-footer mt-5 text-center">
                        <button type="submit" className="btn-gradient" style={{ fontSize: '1.4rem', padding: '16px 48px' }}>
                            {t('addMemory.saveButton')}
                        </button>
                    </div>
                </form>
            </div>

            {showMapPicker && (
                <LocationMapPicker
                    onSelect={(pickedCity, pickedCountry) => {
                        setCity(pickedCity);
                        setCountry(pickedCountry);
                    }}
                    onClose={() => setShowMapPicker(false)}
                />
            )}
        </div>
    );
}
