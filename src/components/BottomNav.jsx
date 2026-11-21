import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home, Layers, Plus, CalendarDays, NotebookPen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './BottomNav.css';

// Mobile-only tab bar. Before this, every screen was a dead end: users had to go
// back to Home to reach anything else, and "add memory" (the core action) sat
// below the fold. The centre "+" keeps it in the thumb zone on every screen.
const HIDDEN_ON = ['/', '/auth', '/add'];

export default function BottomNav() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { pathname } = useLocation();
    const hidden = !user || HIDDEN_ON.includes(pathname);

    useEffect(() => {
        document.body.classList.toggle('has-bottom-nav', !hidden);
        return () => document.body.classList.remove('has-bottom-nav');
    }, [hidden]);

    // While typing, Android resizes the viewport and the bar would sit on top of the
    // keyboard, covering the field being edited. Hide it until focus leaves the input.
    const [typing, setTyping] = useState(false);
    useEffect(() => {
        const isField = (el) => el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
        const onIn = (e) => setTyping(isField(e.target));
        const onOut = () => setTyping(false);
        document.addEventListener('focusin', onIn);
        document.addEventListener('focusout', onOut);
        return () => {
            document.removeEventListener('focusin', onIn);
            document.removeEventListener('focusout', onOut);
        };
    }, []);

    if (hidden) return null;

    const items = [
        { to: '/home', icon: Home, label: t('nav.home') },
        { to: '/browse', icon: Layers, label: t('nav.browse') },
        { to: '/add', icon: Plus, label: t('nav.add'), primary: true },
        { to: '/calendar', icon: CalendarDays, label: t('nav.calendar') },
        { to: '/journal', icon: NotebookPen, label: t('nav.journal') },
    ];

    return (
        <nav className={`bottom-nav ${typing ? 'is-typing' : ''}`} aria-label={t('nav.main')}>
            {items.map(({ to, icon, label, primary }) => {
                const Icon = icon;
                return (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `bottom-nav-item ${primary ? 'primary' : ''} ${isActive ? 'active' : ''}`}
                    aria-label={primary ? label : undefined}
                >
                    <span className="bottom-nav-icon">
                        <Icon size={primary ? 26 : 22} strokeWidth={primary ? 2.5 : 2} />
                    </span>
                    {!primary && <span className="bottom-nav-label">{label}</span>}
                </NavLink>
                );
            })}
        </nav>
    );
}
