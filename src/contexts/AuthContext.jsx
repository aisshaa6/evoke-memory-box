import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, uploadDataUrl, signedUrl } from '../lib/supabase';

const AuthContext = createContext();

async function toAppUser(authUser) {
    if (!authUser) return null;
    const meta = authUser.user_metadata || {};
    return {
        id: authUser.id,
        name: meta.name || '',
        email: authUser.email,
        photo: await signedUrl(meta.photo_path),
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            setUser(await toAppUser(data.session?.user));
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            toAppUser(session?.user).then(setUser);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    const signup = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name }, emailRedirectTo: window.location.origin + '/auth' },
        });
        if (error) throw error;
        // Email confirmation açıqdırsa session olmur
        if (!data.session) {
            const err = new Error('CONFIRM_EMAIL');
            err.code = 'CONFIRM_EMAIL';
            throw err;
        }
        setUser(await toAppUser(data.user));
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(await toAppUser(data.user));
    };

    const updateProfile = async (photoBase64) => {
        if (!user) return;
        const path = await uploadDataUrl(user.id, photoBase64, 'avatar');
        const { data, error } = await supabase.auth.updateUser({ data: { photo_path: path } });
        if (error) throw error;
        setUser(await toAppUser(data.user));
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const value = { user, loading, signup, login, updateProfile, logout };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
