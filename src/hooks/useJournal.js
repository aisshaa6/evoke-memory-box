import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ani_kutusu_journal';

export function useJournal() {
    const [entries, setEntries] = useState({});

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setEntries(JSON.parse(saved));
        } catch (e) { /* ignore */ }
    }, []);

    const saveEntry = useCallback((dateKey, htmlContent) => {
        setEntries(prev => {
            const updated = {
                ...prev,
                [dateKey]: { content: htmlContent, updatedAt: new Date().toISOString() }
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const deleteEntry = useCallback((dateKey) => {
        setEntries(prev => {
            const updated = { ...prev };
            delete updated[dateKey];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const getEntry = useCallback((dateKey) => {
        return entries[dateKey] || null;
    }, [entries]);

    const hasEntry = useCallback((dateKey) => {
        return !!(entries[dateKey]?.content?.trim());
    }, [entries]);

    return { entries, saveEntry, deleteEntry, getEntry, hasEntry };
}
