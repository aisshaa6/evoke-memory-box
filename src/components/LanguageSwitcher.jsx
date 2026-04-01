import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSwitcher.css';

const LANGUAGES = [
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺' }
];

export default function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();
    const [open, setOpen] = useState(false);

    const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    return (
        <div className={`lang-switcher-wrapper ${open ? 'open' : ''}`}>
            {open && (
                <div className="lang-panel glass-card">
                    <div className="lang-options">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.id}
                                className={`lang-option ${language === lang.id ? 'active' : ''}`}
                                onClick={() => { setLanguage(lang.id); setOpen(false); }}
                            >
                                <span className="lang-flag">{lang.flag}</span>
                                <span className="lang-label">{lang.label}</span>
                                {language === lang.id && <span className="lang-check">✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button
                className="lang-trigger glass-btn"
                onClick={() => setOpen(!open)}
                title={t('common.languageSwitcher')}
            >
                <span className="lang-trigger-icon">{open ? '✕' : currentLang.flag}</span>
            </button>
        </div>
    );
}
