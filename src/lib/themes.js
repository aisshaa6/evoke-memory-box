export const THEME_STORAGE_KEY = 'ani_kutusu_theme';

export const THEMES = [
    { id: 'aurora', labelKey: 'common.themes.aurora', swatch: 'linear-gradient(135deg, #FFD1DF, #C4D7FF)', icon: '✨' },
    { id: 'cherry', labelKey: 'common.themes.cherry', swatch: 'linear-gradient(135deg, #F2A7BB, #D4869A)', icon: '🌸' },
    { id: 'dark-aurora', labelKey: 'common.themes.darkAurora', swatch: 'linear-gradient(135deg, #C4A3FF, #80B4FF)', icon: '🌌' },
    { id: 'midnight', labelKey: 'common.themes.midnight', swatch: 'linear-gradient(135deg, #C9A96E, #6E82C9)', icon: '🌙' },
    { id: 'forest', labelKey: 'common.themes.forest', swatch: 'linear-gradient(135deg, #A8D5A2, #D4EAC2)', icon: '🌿' },
];

export const LANGUAGES = [
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export function getSavedTheme() {
    try { return localStorage.getItem(THEME_STORAGE_KEY) || 'aurora'; } catch { return 'aurora'; }
}

export function applyTheme(id) {
    if (!id || id === 'aurora') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', id);
    try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch { /* storage unavailable */ }
}
