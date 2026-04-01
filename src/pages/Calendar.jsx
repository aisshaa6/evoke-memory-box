import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemories } from '../hooks/useMemories';
import { useJournal } from '../hooks/useJournal';
import { ArrowLeft, ChevronLeft, ChevronRight, Star, MapPin, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Calendar.css';

export default function Calendar() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { memories } = useMemories();
    const { entries } = useJournal();

    const months = t('calendar.months');
    const days = t('calendar.days');

    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDay, setSelectedDay] = useState(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    // Monday-first: convert Sunday(0) to 6, else day-1
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build grid cells
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // Map memories by date string
    const memoryMap = {};
    memories.forEach(m => {
        const key = m.date; // "YYYY-MM-DD"
        if (!memoryMap[key]) memoryMap[key] = [];
        memoryMap[key].push(m);
    });

    // Map journal entries by date key
    const journalMap = entries || {};

    const toKey = (d) => {
        if (!d) return null;
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const goToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); };

    const selectedKey = toKey(selectedDay);
    const selectedMemories = selectedKey ? (memoryMap[selectedKey] || []) : [];
    const selectedJournal = selectedKey ? (journalMap[selectedKey] || null) : null;

    const isToday = (d) => {
        return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    return (
        <div className="page-container calendar-container">
            <header className="page-header mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                <button onClick={() => navigate('/home')} className="back-btn glass-btn">
                    <ArrowLeft size={24} color="var(--text-primary)" />
                </button>
                <h1 className="header-title" style={{ fontSize: '2rem' }}>{t('calendar.pageTitle')}</h1>
                <button className="btn-gradient" style={{ padding: '10px 20px', fontSize: '0.95rem' }} onClick={goToday}>
                    {t('calendar.today')}
                </button>
            </header>

            <div className="calendar-card glass-card">
                {/* Month Nav */}
                <div className="cal-month-nav">
                    <button className="cal-nav-btn glass-btn" onClick={prevMonth}>
                        <ChevronLeft size={22} color="var(--text-primary)" />
                    </button>
                    <span className="cal-month-label">{months[month]} {year}</span>
                    <button className="cal-nav-btn glass-btn" onClick={nextMonth}>
                        <ChevronRight size={22} color="var(--text-primary)" />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="cal-grid">
                    {days.map(d => (
                        <div key={d} className="cal-day-header">{d}</div>
                    ))}

                    {/* Day Cells */}
                    {cells.map((d, i) => {
                        if (d === null) return <div key={`empty-${i}`} className="cal-cell empty" />;
                        const key = toKey(d);
                        const dayMemories = memoryMap[key] || [];
                        const hasMemory = dayMemories.length > 0;
                        const hasFav = dayMemories.some(m => m.isFavorite);
                        const hasJournal = !!(journalMap[key]?.content?.trim());
                        const isSelected = selectedDay === d;

                        return (
                            <button
                                key={d}
                                className={`cal-cell ${isToday(d) ? 'today' : ''} ${hasMemory ? 'has-memory' : ''} ${hasJournal ? 'has-journal' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedDay(isSelected ? null : d)}
                            >
                                <span className="cal-day-num">{d}</span>
                                <div className="cal-indicators">
                                    {hasMemory && (
                                        <div className="cal-dots">
                                            {dayMemories.slice(0, 3).map((m, idx) => (
                                                <span key={idx} className={`cal-dot ${m.isFavorite ? 'fav' : ''}`} />
                                            ))}
                                        </div>
                                    )}
                                    {hasJournal && <span className="cal-journal-dot" title="Günlük var" />}
                                </div>
                                {hasFav && <Star size={8} className="cal-fav-star" fill="#FF416C" color="#FF416C" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Panel */}
            {selectedDay && (
                <div className="cal-day-panel mt-4">
                    <h2 className="day-panel-title">
                        {selectedDay} {months[month]} {year}
                        {selectedMemories.length > 0
                            ? <span className="day-count-badge">{selectedMemories.length} {t('calendar.memoriesCount')}</span>
                            : <span className="day-count-badge empty">{t('calendar.noMemories')}</span>
                        }
                        {selectedJournal?.content?.trim() && (
                            <span className="day-count-badge journal-badge">
                                <BookOpen size={13} /> {t('calendar.journalEntry')}
                            </span>
                        )}
                    </h2>

                    {selectedMemories.length === 0 && !selectedJournal?.content?.trim() ? (
                        <div className="glass-card day-empty-card mt-3">
                            <p className="text-secondary text-center">{t('calendar.noMemoriesDesc')}</p>
                            <button className="btn-gradient mt-3" onClick={() => navigate('/add')}>{t('calendar.addMemoryBtn')}</button>
                        </div>
                    ) : (
                        <div className="day-memories-list mt-3">
                            {selectedMemories.map(m => (
                                <div
                                    key={m.id}
                                    className="day-memory-card glass-card"
                                    onClick={() => navigate(`/memory/${m.id}`)}
                                >
                                    {m.photo && (
                                        <div className="day-card-photo">
                                            <img src={m.photo} alt={m.title} />
                                        </div>
                                    )}
                                    <div className="day-card-body">
                                        <div className="day-card-meta">
                                            {m.location && <span className="detail-badge small"><MapPin size={12} /> {m.location}</span>}
                                            {m.isFavorite && <Star size={16} fill="#FF416C" color="#FF416C" />}
                                        </div>
                                        <h3 className="day-card-title">{m.title}</h3>
                                        <p className="day-card-note">{m.note}</p>
                                        {m.tags && m.tags.length > 0 && (
                                            <div className="day-card-tags">
                                                {m.tags.map(t => <span key={t} className="detail-tag-chip">{t}</span>)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Journal Entry Card */}
                            {selectedJournal?.content?.trim() && (
                                <div
                                    className="day-journal-card glass-card"
                                    onClick={() => navigate('/journal', { state: { date: selectedKey } })}
                                >
                                    <div className="day-journal-icon">
                                        <BookOpen size={22} color="#9B6EFF" />
                                    </div>
                                    <div className="day-journal-body">
                                        <span className="day-journal-label">{t('calendar.journalEntry')}</span>
                                        <div
                                            className="day-journal-preview"
                                            dangerouslySetInnerHTML={{
                                                __html: selectedJournal.content.slice(0, 200) +
                                                    (selectedJournal.content.length > 200 ? '...' : '')
                                            }}
                                        />
                                    </div>
                                    <span className="day-journal-arrow">→</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
