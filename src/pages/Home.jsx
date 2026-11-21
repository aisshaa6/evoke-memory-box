import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { Camera, Layers, BarChart3, Plus, ArrowUpRight, CalendarDays, Map, NotebookPen, Star, MapPin, LogOut, ImagePlus } from 'lucide-react';
import EvokeLogo from '../components/EvokeLogo';
import { useAuth } from '../contexts/AuthContext';
import { useMemories } from '../hooks/useMemories';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuth();
    const { memories } = useMemories();
    const { t, language } = useLanguage();
    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const latest = memories.length > 0 ? memories[memories.length - 1] : null;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDate = (d) => {
        try { return new Date(d).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }); }
        catch { return d; }
    };

    const currentFormattedDate = new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Str = event.target.result;
                updateProfile(base64Str).catch(err => alert(err.message));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="home-container page-container">
            {/* Top User Navigation */}
            {user && (
                <nav className="home-top-nav">
                    <div className="profile-dropdown-container" ref={dropdownRef}>
                        <div 
                            className={`user-profile-chip ${showProfileMenu ? 'active' : ''}`} 
                            onClick={() => setShowProfileMenu(!showProfileMenu)} 
                            title={t('common.profile')}
                        >
                        <div className="user-avatar">
                            {user.photo ? (
                                <img src={user.photo} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="user-greeting">{t('common.greeting')}, {user.name.split(' ')[0]}</span>
                    </div>

                    {showProfileMenu && (
                        <div className="profile-dropdown slide-down">
                            <div className="dropdown-arrow"></div>
                            <button 
                                className="dropdown-item" 
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setShowProfileMenu(false);
                                }}
                            >
                                <ImagePlus size={16} /> {t('common.uploadPhoto')}
                            </button>
                            <button className="dropdown-item text-danger" onClick={logout}>
                                <LogOut size={16} /> {t('common.logout')}
                            </button>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={(e) => {
                            handlePhotoUpload(e);
                            setShowProfileMenu(false);
                        }} 
                    />
                    </div>

                    {/* Right: Date & Quick Actions */}
                    <div className="top-nav-right">
                        <span className="current-date text-secondary">
                            <CalendarDays size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                            {currentFormattedDate}
                        </span>
                        <button onClick={() => navigate('/browse', { state: { filterFavorites: true } })} className="btn-gradient action-btn quick-add-btn">
                            <Star size={18} fill="white" /> {t('common.favorites')}
                        </button>
                    </div>
                </nav>
            )}

            <header className="premium-header">
                {/* Left: Title */}
                <div className="title-wrapper">
                    <div className="hero-logo-group">
                        <div className="hero-logo-box">
                            <EvokeLogo size={76} className="hero-logo-icon text-gradient" />
                        </div>
                        <h1 className="hero-title">
                            <span className="text-gradient">Evoke</span>
                        </h1>
                    </div>
                    <p className="hero-subtitle">{t('home.subtitle')}</p>
                </div>

                {/* Right: Spotlight */}
                {latest ? (
                    <div
                        className="spotlight-card glass-card"
                        onClick={() => navigate(`/memory/${latest.id}`)}
                    >
                        {latest.photo && (
                            <div className="spotlight-photo">
                                <img src={latest.photo} alt={latest.title} />
                            </div>
                        )}
                        <div className="spotlight-body">
                            <div className="spotlight-meta">
                                <span className="spotlight-date">{formatDate(latest.date)}</span>
                                {latest.isFavorite && <Star size={14} fill="#FF416C" color="#FF416C" />}
                            </div>
                            <h3 className="spotlight-title">{latest.title}</h3>
                            {latest.location && (
                                <p className="spotlight-location"><MapPin size={12} /> {latest.location}</p>
                            )}
                            {latest.note && (
                                <p className="spotlight-note">{latest.note.slice(0, 90)}{latest.note.length > 90 ? '...' : ''}</p>
                            )}
                            <span className="spotlight-cta">{t('home.last')} →</span>
                        </div>
                    </div>
                ) : (
                    <div className="spotlight-card spotlight-empty glass-card">
                        <div className="spotlight-empty-icon">✨</div>
                        <p className="spotlight-empty-text">{t('home.noMemories')}</p>
                        <Link to="/add" className="btn-gradient" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>{t('home.firstMemory')}</Link>
                    </div>
                )}
            </header>

            <div className="bento-grid">

                {/* Large Primary Action */}
                <Link to="/add" className="bento-item bento-large glass-card interactive-scale group">
                    <div className="bento-bg-gradient grad-primary"></div>
                    <div className="bento-content">
                        <div className="icon-glass mb-3">
                            <Camera size={28} color="var(--text-primary)" />
                        </div>
                        <h2 className="bento-title text-dark">{t('home.addMemory')}</h2>
                        <p className="bento-desc text-dark-50">{t('home.addMemoryDesc')}</p>
                    </div>
                    <div className="action-circle">
                        <Plus size={24} color="var(--text-primary)" />
                    </div>
                </Link>

                {/* Journal */}
                <Link to="/journal" className="bento-item glass-card interactive-scale group">
                    <div className="bento-bg-gradient" style={{ background: 'linear-gradient(135deg, #FFD1DF 0%, #E2C2FF 100%)' }}></div>
                    <div className="bento-content">
                        <div className="icon-glass mb-3">
                            <NotebookPen size={28} color="var(--text-primary)" />
                        </div>
                        <h2 className="bento-title text-dark">{t('home.journal')}</h2>
                        <p className="bento-desc text-dark-50">{t('home.journalDesc')}</p>
                    </div>
                    <div className="action-circle">
                        <ArrowUpRight size={24} color="var(--text-primary)" />
                    </div>
                </Link>

                {/* Browse Memories */}
                <Link to="/browse" className="bento-item glass-card interactive-scale group">
                    <div className="bento-bg-gradient grad-secondary"></div>
                    <div className="bento-content">
                        <div className="icon-glass mb-3">
                            <Layers size={28} color="var(--text-primary)" />
                        </div>
                        <h2 className="bento-title text-dark">{t('home.browse')}</h2>
                        <p className="bento-desc text-dark-50">{t('home.browseDesc')}</p>
                    </div>
                    <div className="action-circle">
                        <ArrowUpRight size={24} color="var(--text-primary)" />
                    </div>
                </Link>

                {/* Calendar */}
                <Link to="/calendar" className="bento-item glass-card interactive-scale group">
                    <div className="bento-bg-gradient" style={{ background: 'linear-gradient(135deg, #B5E8FB 0%, #C4D7FF 100%)' }}></div>
                    <div className="bento-content">
                        <div className="icon-glass mb-3">
                            <CalendarDays size={28} color="var(--text-primary)" />
                        </div>
                        <h2 className="bento-title text-dark">{t('home.calendar')}</h2>
                        <p className="bento-desc text-dark-50">{t('home.calendarDesc')}</p>
                    </div>
                    <div className="action-circle">
                        <ArrowUpRight size={24} color="var(--text-primary)" />
                    </div>
                </Link>

                {/* Map */}
                <Link to="/map" className="bento-item glass-card interactive-scale group">
                    <div className="bento-bg-gradient" style={{ background: 'linear-gradient(135deg, #E2C2FF 0%, #B5E8FB 100%)' }}></div>
                    <div className="map-bg-pattern"></div>
                    <div className="bento-content">
                        <div className="icon-glass mb-3">
                            <Map size={28} color="var(--text-primary)" />
                        </div>
                        <h2 className="bento-title text-dark">{t('home.map')}</h2>
                        <p className="bento-desc text-dark-50">{t('home.mapDesc')}</p>
                    </div>
                    <div className="action-circle">
                        <ArrowUpRight size={24} color="var(--text-primary)" />
                    </div>
                </Link>

                {/* Stats */}
                <Link to="/stats" className="bento-item glass-card interactive-scale group">
                    <div className="bento-bg-gradient grad-tertiary"></div>
                    <div className="bento-content">
                        <div className="icon-glass mb-3">
                            <BarChart3 size={28} color="var(--text-primary)" />
                        </div>
                        <h2 className="bento-title text-dark">{t('home.stats')}</h2>
                        <p className="bento-desc text-dark-50">{t('home.statsDesc')}</p>
                    </div>
                    <div className="action-circle">
                        <ArrowUpRight size={24} color="var(--text-primary)" />
                    </div>
                </Link>

                {/* Info Widget - Square Card */}
                <div className="bento-item glass-card">
                    <div className="bento-bg-gradient grad-secondary"></div>
                    <div className="bento-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <span className="stat-number text-dark">{memories.length}</span>
                        <span className="stat-label">{t('home.savedMemories')}</span>
                        {memories.length > 0 && (
                            <p className="latest-title mt-3" style={{ fontSize: '1.1rem', fontWeight: 400 }}>
                                {t('home.last')}: <strong>{memories[memories.length - 1].title}</strong>
                            </p>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
