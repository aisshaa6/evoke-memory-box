import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemories } from '../hooks/useMemories';
import { ArrowLeft, Star, MapPin, Calendar, Tag, Edit3, Trash2, Save, X, Camera, Mic, Square, Map } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLanguage } from '../contexts/LanguageContext';
import LocationMapPicker from '../components/LocationMapPicker';
import './MemoryDetail.css';

export default function MemoryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, language, translateTag } = useLanguage();
    const { memories, updateMemory, deleteMemory, toggleFavorite } = useMemories();

    const DEFAULT_TAGS = [
        t('addMemory.tags.family'),
        t('addMemory.tags.travel'),
        t('addMemory.tags.work'),
        t('addMemory.tags.special'),
        t('addMemory.tags.nature'),
        t('addMemory.tags.art')
    ];
    const memory = memories.find(m => m.id === id);

    const { isRecording, startRecording, stopRecording, audioBase64, audioSizeMB, clearAudio } = useAudioRecorder();

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Edit form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [photo, setPhoto] = useState(null);
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [tags, setTags] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [customTag, setCustomTag] = useState('');
    const [editAudio, setEditAudio] = useState(null);

    if (!memory) {
        return (
            <div className="page-container">
                <div className="empty-state glass-card mt-5 text-center">
                    <h2>{t('detail.memoryNotFound')}</h2>
                    <button className="btn-gradient mt-4" onClick={() => navigate('/browse')}>{t('common.back')}</button>
                </div>
            </div>
        );
    }

    const startEdit = () => {
        const [c, co] = (memory.location || '').split(',').map(s => s?.trim() || '');
        setTitle(memory.title || '');
        setDate(memory.date || '');
        setNote(memory.note || '');
        setPhoto(memory.photo || null);
        setCity(c || '');
        setCountry(co || '');
        setTags(memory.tags || []);
        setIsFavorite(memory.isFavorite || false);
        setEditAudio(memory.audio || null);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        clearAudio();
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > 4) return; // silently reject — too large

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
                setPhoto(canvas.toDataURL('image/jpeg', 0.75));
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
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const addCustomTag = (e) => {
        e.preventDefault();
        if (customTag.trim() && !tags.includes(customTag.trim())) {
            setTags([...tags, customTag.trim()]);
        }
        setCustomTag('');
    };

    const handleSave = () => {
        updateMemory(id, {
            title,
            date,
            note,
            photo,
            audio: audioBase64 || editAudio,
            location: `${city}${city && country ? ', ' : ''}${country}`,
            tags,
            isFavorite,
        });
        setIsEditing(false);
        clearAudio();
    };

    const handleDelete = () => {
        deleteMemory(id);
        navigate('/browse');
    };

    const formatDate = (d) => {
        try { return new Date(d).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }); }
        catch { return d; }
    };

    if (isEditing) {
        return (
            <div className="page-container detail-container">
                <header className="page-header mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                    <button onClick={cancelEdit} className="back-btn glass-btn">
                        <X size={24} color="var(--text-primary)" />
                    </button>
                    <h1 className="header-title" style={{ fontSize: '2rem' }}>{t('detail.editMemory')}</h1>
                    <button onClick={handleSave} className="btn-gradient save-btn">
                        <Save size={18} /> {t('common.save')}
                    </button>
                </header>

                <div className="premium-form-wrapper glass-card">
                    <form className="memory-form-premium" onSubmit={e => { e.preventDefault(); handleSave(); }}>

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
                                        <button type="button" className="remove-media-btn" onClick={() => setPhoto(null)}>
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
                            </div>

                            <div className="media-card glass-card inner-glass">
                                <label>{t('addMemory.audioLabel')}</label>
                                {(audioBase64 || editAudio) ? (
                                    <div className="audio-player-wrapper mt-2">
                                        <audio controls src={audioBase64 || editAudio} />
                                        <button type="button" className="remove-media-btn" onClick={() => { clearAudio(); setEditAudio(null); }}>
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

    return (
        <div className="page-container detail-container">
            <header className="page-header mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                <button onClick={() => navigate('/browse')} className="back-btn glass-btn">
                    <ArrowLeft size={24} color="var(--text-primary)" />
                </button>
                <div className="detail-header-actions">
                    <button className="glass-btn icon-btn" onClick={startEdit} title={t('common.edit')}>
                        <Edit3 size={22} color="var(--text-primary)" />
                    </button>
                    <button className="glass-btn icon-btn danger" onClick={() => setShowDeleteConfirm(true)} title={t('common.delete')}>
                        <Trash2 size={22} color="#FF416C" />
                    </button>
                    <button
                        className={`glass-btn icon-btn ${memory.isFavorite ? 'fav-active' : ''}`}
                        onClick={() => toggleFavorite(id)}
                        title={t('common.favorite')}
                    >
                        <Star fill={memory.isFavorite ? "#FF416C" : "none"} color={memory.isFavorite ? "#FF416C" : "var(--text-primary)"} size={22} />
                    </button>
                </div>
            </header>

            <div className="detail-layout">
                {memory.photo && (
                    <div className="detail-photo-wrapper glass-card">
                        <img src={memory.photo} alt={memory.title} className="detail-photo" />
                    </div>
                )}

                <div className="detail-body glass-card">
                    <div className="detail-meta">
                        <span className="detail-badge"><Calendar size={14} /> {formatDate(memory.date)}</span>
                        {memory.location && <span className="detail-badge"><MapPin size={14} /> {memory.location}</span>}
                    </div>

                    <h1 className="detail-title">{memory.title}</h1>

                    {memory.tags && memory.tags.length > 0 && (
                        <div className="detail-tags">
                            <Tag size={16} color="var(--text-secondary)" />
                            {memory.tags.map(t => <span key={t} className="detail-tag-chip">{translateTag(t)}</span>)}
                        </div>
                    )}

                    <div className="detail-note">
                        <p>{memory.note}</p>
                    </div>

                    {memory.audio && (
                        <div className="detail-audio">
                            <p className="detail-audio-label"><Mic size={16} /> {t('addMemory.audioLabel')}</p>
                            <audio controls src={memory.audio} />
                        </div>
                    )}
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="confirm-modal glass-card" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <Trash2 size={40} color="#FF416C" />
                        </div>
                        <h2>{t('detail.deleteConfirmTitle')}</h2>
                        <p className="text-secondary mt-2">{t('detail.deleteConfirmDesc')}</p>
                        <div className="confirm-actions mt-4">
                            <button className="btn-gradient" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</button>
                            <button className="btn-delete" onClick={handleDelete}>{t('detail.deleteConfirmButton')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
