import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Journal.css';

const STICKER_CATEGORIES = [
    {
        name: 'Duygular', icon: '😊',
        items: ['😊', '😍', '🥰', '😂', '🥹', '😢', '😤', '🤩', '😎', '🥳', '😴', '🤔', '😌', '🥺', '😇', '🤗']
    },
    {
        name: 'Doğa', icon: '🌸',
        items: ['🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '🌿', '🍃', '🌙', '⭐', '☀️', '🌈', '🌊', '🏔️', '🌲', '🦋']
    },
    {
        name: 'Yemek', icon: '🍕',
        items: ['🍕', '🍔', '🍜', '🍣', '🍰', '☕', '🧋', '🍓', '🍇', '🍦', '🎂', '🍩', '🧁', '🍫', '🍿', '🥗']
    },
    {
        name: 'Aktivite', icon: '🎨',
        items: ['🎨', '📚', '🎵', '🎬', '✈️', '⚽', '🏃', '🧘', '💪', '🎮', '📸', '🏕️', '🚴', '🎯', '🎭', '💃']
    },
    {
        name: 'Semboller', icon: '✨',
        items: ['✨', '💫', '⚡', '🔥', '💕', '💖', '💎', '🌟', '🎉', '🎊', '🍀', '🦄', '🌙', '💌', '🏆', '🎁']
    },
];


function toDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Journal() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { loaded, saveEntry, deleteEntry, getEntry, hasEntry } = useJournal();


    const FE_MONTHS = t('journal.monthsFull');
    const FE_DAYS = t('journal.daysFull');

    const STICKER_CATEGORIES = [
        {
            name: t('journal.stickerCats.emotions'), icon: '😊',
            items: ['😊', '😍', '🥰', '😂', '🥹', '😢', '😤', '🤩', '😎', '🥳', '😴', '🤔', '😌', '🥺', '😇', '🤗']
        },
        {
            name: t('journal.stickerCats.nature'), icon: '🌸',
            items: ['🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '🌿', '🍃', '🌙', '⭐', '☀️', '🌈', '🌊', '🏔️', '🌲', '🦋']
        },
        {
            name: t('journal.stickerCats.food'), icon: '🍕',
            items: ['🍕', '🍔', '🍜', '🍣', '🍰', '☕', '🧋', '🍓', '🍇', '🍦', '🎂', '🍩', '🧁', '🍫', '🍿', '🥗']
        },
        {
            name: t('journal.stickerCats.activity'), icon: '🎨',
            items: ['🎨', '📚', '🎵', '🎬', '✈️', '⚽', '🏃', '🧘', '💪', '🎮', '📸', '🏕️', '🚴', '🎯', '🎭', '💃']
        },
        {
            name: t('journal.stickerCats.symbols'), icon: '✨',
            items: ['✨', '💫', '⚡', '🔥', '💕', '💖', '💎', '🌟', '🎉', '🎊', '🍀', '🦄', '🌙', '💌', '🏆', '🎁']
        },
    ];

    const TEXT_COLORS = [
        { label: t('journal.textColors.default'), value: 'inherit' },
        { label: t('journal.textColors.pink'), value: '#FF6B9A' },
        { label: t('journal.textColors.purple'), value: '#9B6EFF' },
        { label: t('journal.textColors.blue'), value: '#6EB5FF' },
        { label: t('journal.textColors.green'), value: '#6EBF8A' },
        { label: t('journal.textColors.gold'), value: '#C9A96E' },
        { label: t('journal.textColors.red'), value: '#FF6B6B' },
        { label: t('journal.textColors.turquoise'), value: '#5BC8C8' },
    ];

    const FONT_SIZES = ['1rem', '1.2rem', '1.5rem', '2rem', '2.5rem'];
    const FONT_SIZE_LABELS = [
        t('journal.fontSizeLabels.small'),
        t('journal.fontSizeLabels.normal'),
        t('journal.fontSizeLabels.medium'),
        t('journal.fontSizeLabels.large'),
        t('journal.fontSizeLabels.huge')
    ];
    const editorRef = useRef(null);
    const saveTimerRef = useRef(null);

    const [currentDate, setCurrentDate] = useState(() => {
        const stateDate = location.state?.date; // "YYYY-MM-DD" from Calendar
        if (stateDate) {
            const [y, m, d] = stateDate.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date();
    });
    const [activeStickerCat, setActiveStickerCat] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFontSize, setShowFontSize] = useState(false);
    const [savedIndicator, setSavedIndicator] = useState(false);
    const [currentFontSize, setCurrentFontSize] = useState('1.2rem');
    const [currentColor, setCurrentColor] = useState('inherit');

    const dateKey = toDateKey(currentDate);

    // Load entry when the date changes or once entries arrive from the server.
    // Before `loaded`, the editor is read-only so typing can't overwrite a saved entry.
    useEffect(() => {
        if (!loaded) return;
        const entry = getEntry(dateKey);
        if (editorRef.current) {
            editorRef.current.innerHTML = entry?.content || '';
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateKey, loaded]);

    const triggerSave = useCallback(() => {
        if (!loaded) return;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            if (editorRef.current) {
                saveEntry(dateKey, editorRef.current.innerHTML);
                setSavedIndicator(true);
                setTimeout(() => setSavedIndicator(false), 1800);
            }
        }, 600);
    }, [dateKey, saveEntry, loaded]);

    const exec = (command, value = null) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
    };

    const insertEmoji = (emoji) => {
        editorRef.current?.focus();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const span = document.createElement('span');
            span.style.fontSize = '1.6em';
            span.style.lineHeight = '1';
            span.textContent = emoji;
            range.insertNode(span);
            range.setStartAfter(span);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            editorRef.current.innerHTML += `<span style="font-size:1.6em;line-height:1">${emoji}</span>`;
        }
        triggerSave();
    };

    const applyFontSize = (size) => {
        setCurrentFontSize(size);
        exec('fontSize', '7');
        // Replace font size 7 with actual CSS size
        const fonts = editorRef.current?.querySelectorAll('font[size="7"]');
        fonts?.forEach(f => {
            const span = document.createElement('span');
            span.style.fontSize = size;
            span.innerHTML = f.innerHTML;
            f.replaceWith(span);
        });
        setShowFontSize(false);
    };

    const applyColor = (color) => {
        setCurrentColor(color);
        exec('foreColor', color);
        setShowColorPicker(false);
    };

    const goDay = (dir) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + dir);
        setCurrentDate(d);
        setActiveStickerCat(null);
    };

    const goToday = () => {
        setCurrentDate(new Date());
        setActiveStickerCat(null);
    };

    const handleDelete = () => {
        if (confirm(t('journal.deleteConfirm'))) {
            deleteEntry(dateKey);
            if (editorRef.current) editorRef.current.innerHTML = '';
        }
    };

    const isToday = toDateKey(currentDate) === toDateKey(new Date());
    const entryExists = hasEntry(dateKey);

    const formatDate = (d) =>
        `${FE_DAYS[d.getDay()]}, ${d.getDate()} ${FE_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

    return (
        <div className="page-container journal-container">
            {/* Header */}
            <header className="journal-header">
                <button onClick={() => navigate('/home')} className="back-btn glass-btn">
                    <ArrowLeft size={24} color="var(--text-primary)" />
                </button>

                <div className="journal-date-nav">
                    <button className="glass-btn day-nav-btn" onClick={() => goDay(-1)}>
                        <ChevronLeft size={22} color="var(--text-primary)" />
                    </button>
                    <div className="current-date-block">
                        <span className="journal-day-label">{formatDate(currentDate)}</span>
                        {entryExists && <span className="entry-dot" title="Bu güne yazı var" />}
                    </div>
                    <button className="glass-btn day-nav-btn" onClick={() => goDay(1)}>
                        <ChevronRight size={22} color="var(--text-primary)" />
                    </button>
                </div>

                <div className="journal-header-actions">
                    {!isToday && (
                        <button className="btn-gradient today-btn" onClick={goToday}>{t('calendar.today')}</button>
                    )}
                    {entryExists && (
                        <button className="glass-btn icon-btn danger" onClick={handleDelete} title={t('common.delete')}>
                            <Trash2 size={18} color="#FF416C" />
                        </button>
                    )}
                </div>
            </header>

            {/* Toolbar */}
            <div className="journal-toolbar glass-card">
                {/* Format */}
                <div className="toolbar-group">
                    <button className="tool-btn" onClick={() => exec('bold')} title={t('journal.tooltips.bold')}><b>B</b></button>
                    <button className="tool-btn" onClick={() => exec('italic')} title={t('journal.tooltips.italic')}><i>I</i></button>
                    <button className="tool-btn" onClick={() => exec('underline')} title={t('journal.tooltips.underline')}><u>U</u></button>
                    <button className="tool-btn" onClick={() => exec('strikeThrough')} title={t('journal.tooltips.strike')}><s>S</s></button>
                </div>

                <div className="toolbar-divider" />

                {/* Font size */}
                <div className="toolbar-group" style={{ position: 'relative' }}>
                    <button className="tool-btn text-btn" onClick={() => { setShowFontSize(!showFontSize); setShowColorPicker(false); setActiveStickerCat(null); }} title={t('journal.tooltips.fontSize')}>
                        Aa
                    </button>
                    {showFontSize && (
                        <div className="tool-dropdown glass-card">
                            {FONT_SIZES.map((s, i) => (
                                <button
                                    key={s}
                                    className={`tool-dropdown-item ${currentFontSize === s ? 'active' : ''}`}
                                    style={{ fontSize: s }}
                                    onClick={() => applyFontSize(s)}
                                >
                                    {FONT_SIZE_LABELS[i]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Text color */}
                <div className="toolbar-group" style={{ position: 'relative' }}>
                    <button
                        className="tool-btn color-btn"
                        onClick={() => { setShowColorPicker(!showColorPicker); setShowFontSize(false); setActiveStickerCat(null); }}
                        title={t('journal.tooltips.color')}
                    >
                        <span className="color-indicator" style={{ background: currentColor === 'inherit' ? 'var(--grad-primary)' : currentColor }} />
                        A
                    </button>
                    {showColorPicker && (
                        <div className="tool-dropdown glass-card color-dropdown">
                            {TEXT_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    className={`color-option ${currentColor === c.value ? 'active' : ''}`}
                                    onClick={() => applyColor(c.value)}
                                    title={c.label}
                                >
                                    <span className="color-dot" style={{ background: c.value === 'inherit' ? 'var(--grad-primary)' : c.value }} />
                                    <span>{c.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="toolbar-divider" />

                {/* Lists */}
                <div className="toolbar-group">
                    <button className="tool-btn text-btn" onClick={() => exec('insertUnorderedList')} title={t('journal.tooltips.unorderedList')}>• —</button>
                    <button className="tool-btn text-btn" onClick={() => exec('insertOrderedList')} title={t('journal.tooltips.orderedList')}>1.</button>
                </div>

                {/* Align */}
                <div className="toolbar-group">
                    <button className="tool-btn text-btn" onClick={() => exec('justifyLeft')} title={t('journal.tooltips.alignLeft')}>⬱</button>
                    <button className="tool-btn text-btn" onClick={() => exec('justifyCenter')} title={t('journal.tooltips.alignCenter')}>≡</button>
                </div>

                <div className="toolbar-divider" />

                {/* Sticker Categories */}
                <div className="toolbar-group sticker-group">
                    {STICKER_CATEGORIES.map(cat => (
                        <button
                            key={cat.name}
                            className={`sticker-cat-btn ${activeStickerCat === cat.name ? 'active' : ''}`}
                            onClick={() => { setActiveStickerCat(activeStickerCat === cat.name ? null : cat.name); setShowColorPicker(false); setShowFontSize(false); }}
                            title={cat.name}
                        >
                            {cat.icon}
                        </button>
                    ))}
                </div>

                {/* Save indicator */}
                <div className="toolbar-save">
                    {savedIndicator ? (
                        <span className="saved-badge">✓ {t('journal.saved')}</span>
                    ) : (
                        <Save size={18} color="var(--text-secondary)" />
                    )}
                </div>
            </div>

            {/* Sticker Panel */}
            {activeStickerCat && (
                <div className="sticker-panel glass-card">
                    <div className="sticker-grid">
                        {STICKER_CATEGORIES.find(c => c.name === activeStickerCat)?.items.map(emoji => (
                            <button key={emoji} className="sticker-btn" onClick={() => insertEmoji(emoji)}>
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Editor */}
            <div className="journal-editor-card glass-card">
                <div className="editor-placeholder-wrapper">
                    <div
                        ref={editorRef}
                        className="journal-editor"
                        contentEditable={loaded}
                        aria-busy={!loaded}
                        suppressContentEditableWarning
                        onInput={triggerSave}
                        data-placeholder={t('journal.placeholder')}
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
