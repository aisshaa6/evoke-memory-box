import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, uploadDataUrl, signedUrl } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// DB row → UI-ın gözlədiyi shape (photo/audio = göstərilə bilən URL)
async function fromRow(row) {
    const [photo, audio] = await Promise.all([signedUrl(row.photo_path), signedUrl(row.audio_path)]);
    return {
        id: row.id,
        title: row.title,
        date: row.date,
        note: row.note,
        location: row.location,
        tags: row.tags || [],
        isFavorite: row.is_favorite,
        photo,
        audio,
        photoPath: row.photo_path,
        audioPath: row.audio_path,
    };
}

// Yeni data:URL → upload; null → sil; köhnə URL → olduğu kimi saxla
async function resolveMedia(userId, value, existingPath, name) {
    if (value === undefined) return undefined;
    if (!value) return null;
    if (value.startsWith('data:')) return uploadDataUrl(userId, value, name);
    return existingPath;
}

export function useMemories() {
    const { user } = useAuth();
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        if (!user) return Promise.resolve();
        return supabase
            .from('memories')
            .select('*')
            .order('created_at', { ascending: false })
            .then(async ({ data, error }) => {
                if (error) console.error(error);
                else setMemories(await Promise.all(data.map(fromRow)));
                setLoading(false);
            });
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        if (!user) return;
        supabase
            .from('memories')
            .select('*')
            .order('created_at', { ascending: false })
            .then(async ({ data, error }) => {
                if (cancelled) return;
                if (error) console.error(error);
                else setMemories(await Promise.all(data.map(fromRow)));
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [user]);

    const addMemory = async (memory) => {
        const id = uuidv4();
        const photo_path = await resolveMedia(user.id, memory.photo, null, `${id}-photo`);
        const audio_path = await resolveMedia(user.id, memory.audio, null, `${id}-audio`);
        const { data, error } = await supabase.from('memories').insert({
            id,
            title: memory.title,
            date: memory.date || null,
            note: memory.note,
            location: memory.location,
            tags: memory.tags || [],
            is_favorite: !!memory.isFavorite,
            photo_path,
            audio_path,
        }).select().single();
        if (error) throw error;
        const newMemory = await fromRow(data);
        setMemories(prev => [newMemory, ...prev]);
        return newMemory;
    };

    const updateMemory = async (id, updates) => {
        const current = memories.find(m => m.id === id);
        const row = {};
        if ('title' in updates) row.title = updates.title;
        if ('date' in updates) row.date = updates.date || null;
        if ('note' in updates) row.note = updates.note;
        if ('location' in updates) row.location = updates.location;
        if ('tags' in updates) row.tags = updates.tags;
        if ('isFavorite' in updates) row.is_favorite = !!updates.isFavorite;
        if ('photo' in updates) row.photo_path = await resolveMedia(user.id, updates.photo, current?.photoPath, `${id}-photo`);
        if ('audio' in updates) row.audio_path = await resolveMedia(user.id, updates.audio, current?.audioPath, `${id}-audio`);
        const { data, error } = await supabase.from('memories').update(row).eq('id', id).select().single();
        if (error) throw error;
        const updated = await fromRow(data);
        setMemories(prev => prev.map(m => m.id === id ? updated : m));
    };

    const deleteMemory = async (id) => {
        const current = memories.find(m => m.id === id);
        setMemories(prev => prev.filter(m => m.id !== id));
        const { error } = await supabase.from('memories').delete().eq('id', id);
        if (error) { console.error(error); load(); return; }
        const paths = [current?.photoPath, current?.audioPath].filter(Boolean);
        if (paths.length) await supabase.storage.from('memories').remove(paths);
    };

    const toggleFavorite = async (id) => {
        const current = memories.find(m => m.id === id);
        if (!current) return;
        // Optimistic UI: ürək dərhal dolur
        setMemories(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
        const { error } = await supabase.from('memories').update({ is_favorite: !current.isFavorite }).eq('id', id);
        if (error) { console.error(error); load(); }
    };

    return { memories, loading, addMemory, updateMemory, deleteMemory, toggleFavorite };
}
