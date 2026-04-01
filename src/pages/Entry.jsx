import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EvokeLogo from '../components/EvokeLogo';
import { useLanguage } from '../contexts/LanguageContext';
import './Entry.css';

export default function Entry() {
    const { t } = useLanguage();
    const [phase, setPhase] = useState('initial'); // 'initial', 'reveal', 'expand'
    const navigate = useNavigate();

    useEffect(() => {
        // Phase 1: Reveal logo and text
        const revealTimer = setTimeout(() => {
            setPhase('reveal');
        }, 200);

        // Phase 2: Expand orb to transition
        const expandTimer = setTimeout(() => {
            setPhase('expand');
        }, 1500);

        // Phase 3: Navigate
        const navTimer = setTimeout(() => {
            navigate('/home');
        }, 2000);

        return () => {
            clearTimeout(revealTimer);
            clearTimeout(expandTimer);
            clearTimeout(navTimer);
        };
    }, [navigate]);

    return (
        <div className="premium-entry-container">
            <div className={`glass-orb ${phase}`}>
                <div className="orb-inner">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <EvokeLogo size={64} className="text-gradient" />
                    </div>
                    <h1 className="orb-title">
                        <span className="text-gradient">Evoke</span>
                    </h1>
                    <p className="orb-subtitle">{t('entry.subtitle')}</p>
                </div>
            </div>
            {/* Ambient dynamic particles */}
            <div className="ambient-particles">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="ambient-dot"
                        style={{
                            '--tx': `${(Math.random() - 0.5) * 400}px`,
                            '--ty': `${(Math.random() - 0.5) * 400}px`,
                            '--delay': `${Math.random() * 2}s`,
                            '--duration': `${Math.random() * 3 + 2}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
