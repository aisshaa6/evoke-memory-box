import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemories } from '../hooks/useMemories';
import { ArrowLeft, PieChart as PieChartIcon, TrendingUp, Map, Star, Award, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import './Statistics.css';

const PIE_COLORS = ['#FFD1DF', '#C4D7FF', '#E2C2FF', '#B5E8FB', '#FFB6C1', '#B0E0E6'];

export default function Statistics() {
    const { memories } = useMemories();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const totalMemories = memories.length;
    const totalFavorites = memories.filter(m => m.isFavorite).length;

    const memoriesPerYear = useMemo(() => {
        const counts = {};
        memories.forEach(m => {
            const year = new Date(m.date).getFullYear();
            if (!isNaN(year)) {
                counts[year] = (counts[year] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year - b.year);
    }, [memories]);

    const tagsData = useMemo(() => {
        const counts = {};
        memories.forEach(m => {
            if (m.tags) {
                m.tags.forEach(t => {
                    counts[t] = (counts[t] || 0) + 1;
                });
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 tags
    }, [memories]);

    return (
        <div className="page-container stats-container">
            <header className="page-header stats-header flex-center" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/home')} className="back-btn glass-btn">
                    <ArrowLeft size={24} color="var(--text-primary)" />
                </button>
                <h1 className="header-title" style={{ fontSize: '2rem' }}>{t('stats.pageTitle')}</h1>
                <div style={{ width: '50px' }}></div>
            </header>

            {totalMemories === 0 ? (
                <div className="empty-state glass-card mt-5">
                    <div className="empty-icon-wrapper mb-3" style={{ background: 'rgba(138, 35, 135, 0.1)' }}>
                        <PieChartIcon size={48} color="#8A2387" />
                    </div>
                    <h2>{t('stats.noDataTitle')}</h2>
                    <p className="text-secondary mt-2">{t('stats.noDataDesc')}</p>
                </div>
            ) : (
                <div className="stats-bento-grid">

                    {/* Total Memories KPI */}
                    <div className="stats-kpi glass-card">
                        <div className="kpi-icon-wrapper grad-primary">
                            <Layers size={28} color="white" />
                        </div>
                        <div className="kpi-content">
                            <h3>{t('stats.totalMemories')}</h3>
                            <p className="kpi-value text-gradient">{totalMemories}</p>
                        </div>
                    </div>

                    {/* Favorites KPI */}
                    <div className="stats-kpi glass-card">
                        <div className="kpi-icon-wrapper grad-secondary">
                            <Star size={28} color="white" />
                        </div>
                        <div className="kpi-content">
                            <h3>{t('stats.favorites')}</h3>
                            <p className="kpi-value" style={{ color: '#8A2387' }}>{totalFavorites}</p>
                        </div>
                    </div>

                    {/* Most Tagged KPI */}
                    <div className="stats-kpi glass-card">
                        <div className="kpi-icon-wrapper grad-tertiary">
                            <Award size={28} color="white" />
                        </div>
                        <div className="kpi-content">
                            <h3>{t('stats.mostTagged')}</h3>
                            <p className="kpi-value" style={{ color: '#8A99C6', fontSize: '2rem' }}>
                                {tagsData.length > 0 ? tagsData[0].name : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Bar Chart Area */}
                    <div className="glass-card chart-cell bento-large-col">
                        <div className="chart-header">
                            <div className="chart-icon grad-primary"><TrendingUp size={20} color="white" /></div>
                            <h2>{t('stats.yearlyDistribution')}</h2>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={memoriesPerYear} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} dx={-10} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255, 65, 108, 0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="url(#colorUv)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C4D7FF" stopOpacity={0.9} />
                                            <stop offset="95%" stopColor="#E2C2FF" stopOpacity={0.7} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart Area */}
                    <div className="glass-card chart-cell">
                        <div className="chart-header">
                            <div className="chart-icon grad-secondary"><Map size={20} color="white" /></div>
                            <h2>{t('stats.categoryAnalysis')}</h2>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Pie
                                        data={tagsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {tagsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="pie-legend">
                            {tagsData.map((entry, index) => (
                                <div key={entry.name} className="legend-item">
                                    <span className="legend-color" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                                    <span className="legend-label">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
