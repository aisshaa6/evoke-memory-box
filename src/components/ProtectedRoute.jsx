import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="auth-loading-spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'var(--text-primary)', width: 30, height: 30 }} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" />;
    }

    return children;
}
