import { translations } from './translations';

// Built-in tags are stored as language-independent keys ("family", "travel"…)
// so switching language never creates duplicates like "Aile" vs "Family".
export const DEFAULT_TAG_KEYS = Object.keys(translations.tr.common.tags);

// Maps a stored tag (a key, or a legacy translated label in any language) to its key.
// Custom tags are returned unchanged.
export function normalizeTag(tag) {
    if (!tag) return tag;
    if (DEFAULT_TAG_KEYS.includes(tag)) return tag;
    const lower = tag.toLowerCase();
    for (const lang of Object.keys(translations)) {
        const tags = translations[lang]?.common?.tags || {};
        for (const [key, label] of Object.entries(tags)) {
            if (label.toLowerCase() === lower) return key;
        }
    }
    return tag;
}

export function normalizeTags(tags) {
    return [...new Set((tags || []).map(normalizeTag))];
}
