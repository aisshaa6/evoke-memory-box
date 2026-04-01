import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for an existing session on load
        try {
            const savedUser = localStorage.getItem('evoke_auth_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const mockDb = () => {
        try {
            return JSON.parse(localStorage.getItem('evoke_users_db') || '{}');
        } catch {
            return {};
        }
    };

    const signup = (name, email, password) => {
        const db = mockDb();
        if (db[email]) {
            throw new Error('Bu e-posta adresi zaten kullanılıyor.');
        }
        const newUser = { name, email, password };
        db[email] = newUser;
        localStorage.setItem('evoke_users_db', JSON.stringify(db));
        
        // Auto-login after signup
        login(email, password);
    };

    const login = (email, password) => {
        const db = mockDb();
        const existingUser = db[email];
        if (!existingUser || existingUser.password !== password) {
            throw new Error('E-posta veya şifre hatalı.');
        }
        
        const sessionUser = { name: existingUser.name, email: existingUser.email, photo: existingUser.photo };
        setUser(sessionUser);
        localStorage.setItem('evoke_auth_user', JSON.stringify(sessionUser));
    };

    const updateProfile = (photoBase64) => {
        if (!user) return;
        const db = mockDb();
        if (db[user.email]) {
            db[user.email].photo = photoBase64;
            localStorage.setItem('evoke_users_db', JSON.stringify(db));
            
            const updatedUser = { ...user, photo: photoBase64 };
            setUser(updatedUser);
            localStorage.setItem('evoke_auth_user', JSON.stringify(updatedUser));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('evoke_auth_user');
    };

    const value = {
        user,
        loading,
        signup,
        login,
        updateProfile,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
