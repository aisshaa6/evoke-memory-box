import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useJournal() {
    const { user } = useAuth();
    const [entries, setEntries] = useState({});
    // false until the first fetch finishes, so the editor never starts empty over an existing entry
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!user) return;
        supabase.from('journal_entries').select('date_key, content, updated_at').then(({ data, error }) => {
            if (error) { console.error(error); setLoaded(true); return; }
            const map = {};
            data.forEach(r => { map[r.date_key] = { content: r.content, updatedAt: r.updated_at }; });
            setEntries(map);
            setLoaded(true);
        });
    }, [user]);

    const saveEntry = useCallback(async (dateKey, htmlContent) => {
        const updatedAt = new Date().toISOString();
        setEntries(prev => ({ ...prev, [dateKey]: { content: htmlContent, updatedAt } }));
        const { error } = await supabase.from('journal_entries')
            .upsert({ date_key: dateKey, content: htmlContent, updated_at: updatedAt }, { onConflict: 'user_id,date_key' });
        if (error) console.error(error);
    }, []);

    const deleteEntry = useCallback(async (dateKey) => {
        setEntries(prev => {
            const updated = { ...prev };
            delete updated[dateKey];
            return updated;
        });
        const { error } = await supabase.from('journal_entries').delete().eq('date_key', dateKey);
        if (error) console.error(error);
    }, []);

    const getEntry = useCallback((dateKey) => entries[dateKey] || null, [entries]);
    const hasEntry = useCallback((dateKey) => !!(entries[dateKey]?.content?.trim()), [entries]);

    return { entries, loaded, saveEntry, deleteEntry, getEntry, hasEntry };
}
