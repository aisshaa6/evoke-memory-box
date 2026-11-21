import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { normalizeTag } from '../i18n/tags';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('memorybox_lang') || 'tr';
    });

    useEffect(() => {
        localStorage.setItem('memorybox_lang', language);
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let val = translations[language];
        for (const k of keys) {
            if (val && val[k]) {
                val = val[k];
            } else {
                // Fallback to Turkish if key not found in current language
                let fallback = translations['tr'];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Key not found at all
                    }
                }
                return fallback;
            }
        }
        return val;
    };

    const translateTag = (tagStr) => {
        if (!tagStr) return tagStr;
        const key = normalizeTag(tagStr);
        return translations[language]?.common?.tags?.[key] || tagStr;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateTag }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
