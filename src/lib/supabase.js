import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    console.error('VITE_SUPABASE_URL və VITE_SUPABASE_ANON_KEY .env faylında təyin olunmalıdır.');
}

export const supabase = createClient(url, anonKey);

export const BUCKET = 'memories';

// data:URL → Storage-a yüklə, path qaytar
export async function uploadDataUrl(userId, dataUrl, name) {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = (blob.type.split('/')[1] || 'bin').split(';')[0];
    const path = `${userId}/${name}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: blob.type });
    if (error) throw error;
    return path;
}

// Private bucket üçün müvəqqəti (1 saatlıq) URL
export async function signedUrl(path) {
    if (!path) return null;
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
    return data?.signedUrl || null;
}
