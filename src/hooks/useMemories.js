import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useMemories() {
    const [memories, setMemories] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('ani_kutusu_memories');
        if (saved) {
            try {
                setMemories(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse memories from localStorage');
            }
        }
    }, []);

    const saveMemories = (newMemories) => {
        setMemories(newMemories);
        localStorage.setItem('ani_kutusu_memories', JSON.stringify(newMemories));
    };

    const addMemory = (memory) => {
        const newMemory = { ...memory, id: uuidv4() };
        saveMemories([newMemory, ...memories]);
        return newMemory;
    };

    const updateMemory = (id, updates) => {
        saveMemories(memories.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const deleteMemory = (id) => {
        saveMemories(memories.filter(m => m.id !== id));
    };

    const toggleFavorite = (id) => {
        saveMemories(memories.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
    };

    return { memories, addMemory, updateMemory, deleteMemory, toggleFavorite };
}
