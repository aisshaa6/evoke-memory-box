import { useState, useEffect } from 'react';
import './ThemePicker.css';
import { useLanguage } from '../contexts/LanguageContext';

export default function ThemePicker() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);

    const THEMES = [
        {
            id: 'aurora',
            label: t('common.themes.aurora'),
            swatch: 'linear-gradient(135deg, #FFD1DF, #C4D7FF)',
            icon: '✨'
        },
        {
            id: 'cherry',
            label: t('common.themes.cherry'),
            swatch: 'linear-gradient(135deg, #F2A7BB, #D4869A)',
            icon: '🌸'
        },
        {
            id: 'dark-aurora',
            label: t('common.themes.darkAurora'),
            swatch: 'linear-gradient(135deg, #C4A3FF, #80B4FF)',
            icon: '🌌'
        },
        {
            id: 'midnight',
            label: t('common.themes.midnight'),
            swatch: 'linear-gradient(135deg, #C9A96E, #6E82C9)',
            icon: '🌙'
        },
        {
            id: 'forest',
            label: t('common.themes.forest'),
            swatch: 'linear-gradient(135deg, #A8D5A2, #D4EAC2)',
            icon: '🌿'
        },
    ];

    const [activeTheme, setActiveTheme] = useState(() => {
        return localStorage.getItem('ani_kutusu_theme') || 'aurora';
    });

    useEffect(() => {
        const theme = activeTheme === 'aurora' ? '' : activeTheme;
        document.documentElement.setAttribute('data-theme', theme);
        if (activeTheme === 'aurora') {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('ani_kutusu_theme', activeTheme);
    }, [activeTheme]);

    const currentTheme = THEMES.find(t => t.id === activeTheme) || THEMES[0];

    return (
        <div className={`theme-picker-wrapper ${open ? 'open' : ''}`}>
            {/* Theme Panel */}
            {open && (
                <div className="theme-panel glass-card">
                    <p className="theme-panel-label">{t('common.selectTheme')}</p>
                    <div className="theme-swatches">
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                className={`theme-swatch ${activeTheme === theme.id ? 'active' : ''}`}
                                onClick={() => { setActiveTheme(theme.id); setOpen(false); }}
                                title={theme.label}
                            >
                                <span
                                    className="swatch-circle"
                                    style={{ background: theme.swatch }}
                                >
                                    {activeTheme === theme.id && (
                                        <span className="swatch-check">✓</span>
                                    )}
                                </span>
                                <span className="swatch-label">{theme.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                className="theme-trigger glass-btn"
                onClick={() => setOpen(!open)}
                title={t('common.changeTheme')}
                style={{ background: currentTheme.swatch }}
            >
                <span className="theme-trigger-icon">{open ? '✕' : currentTheme.icon}</span>
            </button>
        </div>
    );
}
