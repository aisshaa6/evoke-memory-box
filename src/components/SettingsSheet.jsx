import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { THEMES, LANGUAGES, getSavedTheme, applyTheme } from '../lib/themes';
import './SettingsSheet.css';

// Bottom sheet for theme + language. Replaces the two floating corner buttons
// that covered content on every screen: settings are rarely used, so they live
// one tap away in the profile menu instead of permanently on top of the UI.
export default function SettingsSheet({ open, onClose }) {
    const { t, language, setLanguage } = useLanguage();
    const [theme, setTheme] = useState(getSavedTheme);
    const closeRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        closeRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    const pickTheme = (id) => { setTheme(id); applyTheme(id); };

    // Portal to <body>: page containers animate with transform, which would trap
    // a fixed overlay under the bottom nav.
    return createPortal(
        <div className="sheet-overlay" onClick={onClose}>
            <div
                className="settings-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-sheet-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sheet-handle" aria-hidden="true" />
                <div className="sheet-header">
                    <h2 id="settings-sheet-title">{t('settings.title')}</h2>
                    <button ref={closeRef} className="sheet-close" onClick={onClose} aria-label={t('settings.close')}>
                        <X size={20} />
                    </button>
                </div>

                <h3 className="sheet-section-title">{t('settings.theme')}</h3>
                <div className="sheet-themes" role="radiogroup" aria-label={t('settings.theme')}>
                    {THEMES.map(th => (
                        <button
                            key={th.id}
                            role="radio"
                            aria-checked={theme === th.id}
                            className={`sheet-theme ${theme === th.id ? 'active' : ''}`}
                            onClick={() => pickTheme(th.id)}
                        >
                            <span className="sheet-swatch" style={{ background: th.swatch }}>
                                {theme === th.id && <Check size={16} color="white" strokeWidth={3} />}
                            </span>
                            <span className="sheet-theme-label">{t(th.labelKey)}</span>
                        </button>
                    ))}
                </div>

                <h3 className="sheet-section-title">{t('settings.language')}</h3>
                <div className="sheet-langs" role="radiogroup" aria-label={t('settings.language')}>
                    {LANGUAGES.map(l => (
                        <button
                            key={l.id}
                            role="radio"
                            aria-checked={language === l.id}
                            className={`sheet-lang ${language === l.id ? 'active' : ''}`}
                            onClick={() => setLanguage(l.id)}
                        >
                            <span aria-hidden="true">{l.flag}</span>
                            <span>{l.label}</span>
                            {language === l.id && <Check size={16} className="sheet-lang-check" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}
