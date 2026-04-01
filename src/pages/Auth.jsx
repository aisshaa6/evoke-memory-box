import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EvokeLogo from '../components/EvokeLogo';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Auth.css';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Fake network delay for premium feel
            await new Promise(res => setTimeout(res, 800));

            if (isLogin) {
                login(email, password);
            } else {
                if (!name.trim()) throw new Error(t('auth.errorName'));
                if (password !== passwordConfirm) throw new Error(t('auth.errorPassword'));
                signup(name, email, password);
            }
            navigate('/home');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
        setShowPassword(false);
    };

    return (
        <div className="auth-container">
            {/* Ambient Background */}
            <div className="auth-ambient-bg"></div>
            
            <div className={`auth-split-card glass-card ${!isLogin ? 'signup-mode' : ''}`}>
                {/* Left Side: 3D Illustration */}
                <div className="auth-illustration">
                    <img src="/auth_illustration.png" alt="Evoke Login" className={`illus-img ${!isLogin ? 'fade-out' : 'fade-in'}`} />
                    <img src="/auth_illustration_signup.png" alt="Evoke Signup" className={`illus-img ${!isLogin ? 'fade-in' : 'fade-out'}`} />
                    <div className="auth-illus-overlay">
                        <h2>{isLogin ? t('auth.livingMemories') : t('auth.newBeginning')}</h2>
                        <p>{isLogin ? t('auth.pastTraces') : t('auth.protectMemories')}</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="auth-form-side">
                    <div className="auth-header text-center mb-4">
                        <div className="mb-3" style={{ display: 'inline-block' }}>
                            <EvokeLogo size={60} className="text-gradient" />
                        </div>
                        <h2>{isLogin ? t('auth.welcomeBack') : t('auth.joinUs')}</h2>
                        <p className="text-secondary">
                            {isLogin ? t('auth.loginDesc') : t('auth.signupDesc')}
                        </p>
                    </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="input-group">
                            <span className="input-icon"><User size={18} /></span>
                            <input 
                                type="text" 
                                placeholder={t('auth.fullNamePlaceholder')} 
                                className="auth-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required={!isLogin}
                            />
                        </div>
                    )}
                    
                    <div className="input-group">
                        <span className="input-icon"><Mail size={18} /></span>
                        <input 
                            type="email" 
                            placeholder={t('auth.emailPlaceholder')} 
                            className="auth-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <span className="input-icon"><Lock size={18} /></span>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder={t('auth.passwordPlaceholder')} 
                            className="auth-input pr-5"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button" 
                            className="toggle-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex="-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <span className="input-icon"><Lock size={18} /></span>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder={t('auth.confirmPasswordPlaceholder')} 
                                className="auth-input pr-5"
                                value={passwordConfirm}
                                onChange={e => setPasswordConfirm(e.target.value)}
                                required={!isLogin}
                            />
                            <button 
                                type="button" 
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    )}

                    <button type="submit" className="btn-gradient auth-submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <span className="auth-loading-spinner" />
                        ) : (
                            <>
                                {isLogin ? t('auth.login') : t('auth.signup')}
                                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer text-center mt-4">
                    <p className="text-secondary">
                        {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                    </p>
                    <button className="auth-toggle-btn" onClick={toggleMode} type="button">
                        {isLogin ? t('auth.createAccount') : t('auth.loginHere')}
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
}
