import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemories } from '../hooks/useMemories';
import { Search, Filter, Calendar, MapPin, Tag, ArrowLeft, Star, Clock, Trash2, Edit, Shuffle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Browse.css';

export default function Browse() {
    const { memories, toggleFavorite } = useMemories();
    const { t, language, translateTag } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Filters State
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [onlyFavorites, setOnlyFavorites] = useState(location.state?.filterFavorites || false);
    const [showFilters, setShowFilters] = useState(false);
    const [randomMemory, setRandomMemory] = useState(null);

    const allCities = useMemo(() => {
        const cities = memories.map(m => m.location?.split(',')[0].trim()).filter(c => c);
        return [...new Set(cities)];
    }, [memories]);

    const allTags = useMemo(() => {
        const tags = memories.flatMap(m => m.tags || []);
        return [...new Set(tags)];
    }, [memories]);

    const toggleFilterTag = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const filteredMemories = useMemo(() => {
        return memories.filter(m => {
            const titleNoteText = ((m.title || '') + ' ' + (m.note || '')).toLowerCase();
            const matchSearch = titleNoteText.includes(search.toLowerCase());
            const matchFrom = !fromDate || new Date(m.date) >= new Date(fromDate);
            const matchTo = !toDate || new Date(m.date) <= new Date(toDate);
            const matchCity = !selectedCity || (m.location && m.location.includes(selectedCity));
            const matchTags = selectedTags.length === 0 || selectedTags.every(t => (m.tags || []).includes(t));
            const matchFav = !onlyFavorites || m.isFavorite;
            return matchSearch && matchFrom && matchTo && matchCity && matchTags && matchFav;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [memories, search, fromDate, toDate, selectedCity, selectedTags, onlyFavorites]);

    const showRandomMemory = () => {
        if (filteredMemories.length === 0) return;
        const randomIndex = Math.floor(Math.random() * filteredMemories.length);
        setRandomMemory(filteredMemories[randomIndex]);
    };

    return (
        <div className="page-container browse-container">
            <header className="page-header browse-header">
                <div className="header-left">
                    <button onClick={() => navigate('/home')} className="back-btn glass-btn" aria-label={t('a11y.back')}>
                        <ArrowLeft size={24} color="var(--text-primary)" />
                    </button>
                    <div>
                        <h1 className="header-title">{t('browse.pageTitle')}</h1>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={showRandomMemory} className="btn-gradient action-btn surprise-btn" aria-label={t('browse.surpriseMe')}>
                        <Shuffle size={18} aria-hidden="true" /> <span className="btn-label">{t('browse.surpriseMe')}</span>
                    </button>
                </div>
            </header>

            <div className="search-filter-section glass-card p-2 mb-4">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('browse.searchPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input-aurora"
                        aria-label={t('browse.searchPlaceholder')}
                        enterKeyHint="search"
                    />
                </div>
                <button
                    className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                    aria-expanded={showFilters}
                    aria-label={t('browse.filters')}
                >
                    <Filter size={18} aria-hidden="true" /> <span className="btn-label">{t('browse.filters')}</span>
                </button>
            </div>

            {showFilters && (
                <div className="filter-panel glass-card mb-4 slide-down">
                    <div className="filter-group">
                        <h3 className="filter-title"><Calendar size={18} /> {t('browse.dateRange')}</h3>
                        <div className="date-range">
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} title={t('browse.startDate')} />
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} title={t('browse.endDate')} />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title"><MapPin size={18} /> {t('common.location')}</h3>
                        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                            <option value="">{t('browse.allLocations')}</option>
                            {allCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <h3 className="filter-title"><Tag size={18} /> {t('addMemory.tagsLabel')}</h3>
                        <div className="tags-filter">
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleFilterTag(tag)}
                                    className={`tag-btn small ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                >
                                    {translateTag(tag)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={onlyFavorites} onChange={e => setOnlyFavorites(e.target.checked)} />
                            <div className="checkbox-custom"></div>
                            {t('browse.onlyFavorites')}
                        </label>
                    </div>
                </div>
            )}

            {filteredMemories.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon-wrapper mb-3">
                        <Search size={48} color="#FF416C" />
                    </div>
                    <h2 className="mb-2">{t('browse.noResultsTitle')}</h2>
                    <p className="text-secondary">{t('browse.noResultsDesc')}</p>
                </div>
            ) : (
                <div className="masonry-layout">
                    {filteredMemories.map((memory) => {
                        const hasPhoto = !!memory.photo;
                        return (
                            <div
                                key={memory.id}
                                className="memory-card glass-card"
                                role="link"
                                tabIndex={0}
                                onClick={() => navigate(`/memory/${memory.id}`)}
                                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/memory/${memory.id}`); }}
                            >

                                <button
                                    className={`card-fav-btn ${memory.isFavorite ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(memory.id); }}
                                    aria-label={memory.isFavorite ? t('a11y.unfavorite') : t('a11y.favorite')}
                                    aria-pressed={!!memory.isFavorite}
                                >
                                    <Star fill={memory.isFavorite ? "#FF416C" : "none"} color={memory.isFavorite ? "#FF416C" : "var(--text-secondary)"} size={22} />
                                </button>

                                {hasPhoto && (
                                    <div className="card-photo">
                                        <img src={memory.photo} alt={memory.title} />
                                    </div>
                                )}

                                <div className="card-content">
                                    <div className="meta-info">
                                        <span className="card-date badge-light">{new Date(memory.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US')}</span>
                                        {memory.location && <span className="card-location badge-light"><MapPin size={12} /> {memory.location}</span>}
                                    </div>

                                    <h3 className="card-title">{memory.title}</h3>
                                    <p className="card-note">{memory.note}</p>

                                    {memory.tags && memory.tags.length > 0 && (
                                        <div className="card-tags">
                                            {memory.tags.map(t => <span key={t} className="tiny-tag-aurora">{translateTag(t)}</span>)}
                                        </div>
                                    )}
                                    {memory.audio && (
                                        // Playing audio must not open the detail page
                                        <div className="card-audio mt-3" onClick={(e) => e.stopPropagation()}>
                                            <audio controls src={memory.audio} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {randomMemory && (
                <div className="modal-overlay" onClick={() => setRandomMemory(null)}>
                    <div className="aurora-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal glass-btn" onClick={() => setRandomMemory(null)} aria-label={t('settings.close')}>
                            <X size={24} />
                        </button>

                        <div className="modal-bg-gradient grad-secondary"></div>

                        <div className="modal-content-wrapper">
                            {randomMemory.photo && (
                                <div className="modal-photo-container">
                                    <img src={randomMemory.photo} alt="Random Memory" className="modal-photo" />
                                </div>
                            )}

                            <div className="modal-body p-4">
                                <div className="meta-info mb-2 flex-center gap-2">
                                    <span className="badge-light">{new Date(randomMemory.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US')}</span>
                                    {randomMemory.location && <span className="badge-light"><MapPin size={12} /> {randomMemory.location}</span>}
                                </div>
                                <h2 className="modal-title mb-3">{randomMemory.title}</h2>
                                <p className="modal-note text-secondary">{randomMemory.note}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
