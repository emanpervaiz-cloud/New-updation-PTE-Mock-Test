import React, { useState, useMemo } from 'react';
import vocabDataJson from './pte_basic_vocab.json';

const VocabBook = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    // Parse and map the new JSON structure to something easy to display
    const VOCAB_DATA = useMemo(() => {
        const basicList = vocabDataJson?.basic_vocabulary || [];
        return basicList.map(item => ({
            id: item.id || Math.random(),
            word: item.word || 'Unknown Word',
            type: item.type || 'N/A', // e.g. 'adjective', 'noun/verb'
            definition: item.meaning || 'No definition available.',
            example: item.example_sentence || 'No example available.',
            synonyms: item.synonym || [],
            antonyms: item.antonym || [],
            collocations: item.collocations || [],
            pteTasks: item.pte_task || []
        }));
    }, []);

    // Create a normalized type string for filtering
    const getFilterType = (typeStr) => {
        if (!typeStr || typeof typeStr !== 'string') return 'Other';
        const lower = typeStr.toLowerCase();
        if (lower.includes('verb')) return 'Verb';
        if (lower.includes('noun')) return 'Noun';
        if (lower.includes('adjective') || lower.includes('adj')) return 'Adj';
        if (lower.includes('adverb') || lower.includes('adv')) return 'Adv';
        return 'Other';
    };

    const filteredData = VOCAB_DATA.filter(item => {
        const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase());
        const mappedType = getFilterType(item.type);
        const matchesFilter = filter === 'All' || mappedType === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-color)', marginBottom: 8 }}>📚 {vocabDataJson.database || "Vocab Book"}</h2>
                <p style={{ color: '#666', fontSize: 15 }}>{vocabDataJson.description || "Master high-frequency words for your PTE Academic exam."}</p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="🔍 Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '12px 16px', borderRadius: 8, border: '1px solid #e0e0e0',
                        fontSize: 14, width: 300, outline: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'Adj', 'Verb', 'Noun', 'Adv'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '8px 16px', borderRadius: 20, border: 'none',
                                background: filter === type ? 'var(--primary-color)' : 'var(--accent-color)',
                                color: filter === type ? '#fff' : 'var(--primary-color)',
                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {filteredData.map(item => (
                    <div key={item.id} style={{
                        background: '#fff', borderRadius: 12, padding: '20px',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'default',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#333' }}>{item.word}</h3>
                            <span style={{
                                background: '#f3e5f5', color: '#7b1fa2', fontSize: 11, fontWeight: 600,
                                padding: '4px 8px', borderRadius: 6, textTransform: 'capitalize'
                            }}>{item.type}</span>
                        </div>
                        <p style={{ margin: '0 0 12px', color: '#555', fontSize: 14, lineHeight: 1.5 }}>{item.definition}</p>

                        {item.synonyms.length > 0 && (
                            <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                                <strong>Synonyms:</strong> {item.synonyms.join(', ')}
                            </div>
                        )}

                        <div style={{ background: 'var(--accent-color)', padding: '10px 12px', borderRadius: 8, borderLeft: '3px solid var(--secondary-color)', marginTop: 'auto' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#444', fontStyle: 'italic' }}>"{item.example}"</p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No words found matching your search or filter.
                </div>
            )}
        </div>
    );
};

export default VocabBook;
