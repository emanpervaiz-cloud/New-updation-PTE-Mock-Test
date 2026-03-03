import React, { useState } from 'react';
import { CATEGORIES, ESSAY_DATABASE, ESSAY_RUBRIC } from '../../data/materialsData';
import DictationLab from './DictationLab';

const Materials = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [viewMode, setViewMode] = useState('categories'); // 'categories', 'essay-db', or 'rubric'

    const renderCategories = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Interactive Essay Database Card */}
            <div
                onClick={() => setViewMode('essay-db')}
                style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    border: '1px solid var(--accent-color)', cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ background: 'rgba(13, 59, 102, 0.05)', padding: '16px 20px', borderBottom: '1px solid var(--accent-color)' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary-color)' }}>💎 Interactive Essay DB</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px' }}>
                        Browse 10+ professional structures, linking phrases, and advanced vocabulary.
                    </p>
                    <button style={{
                        width: '100%', padding: '10px', borderRadius: 8,
                        background: 'var(--primary-color)', color: '#fff', border: 'none',
                        fontWeight: 700, cursor: 'pointer'
                    }}>Open Database</button>
                </div>
            </div>

            {/* AI Rubric card */}
            <div
                onClick={() => setViewMode('rubric')}
                style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    border: '1px solid var(--accent-color)', cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ background: 'rgba(13, 59, 102, 0.05)', padding: '16px 20px', borderBottom: '1px solid var(--accent-color)' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary-color)' }}>🤖 AI Evaluation Rubric</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px' }}>
                        Understand how the AI scores your essay. Full breakdown of PTE scoring criteria.
                    </p>
                    <button style={{
                        width: '100%', padding: '10px', borderRadius: 8,
                        background: 'var(--primary-color)', color: '#fff', border: 'none',
                        fontWeight: 700, cursor: 'pointer'
                    }}>View Rubric</button>
                </div>
            </div>

            {/* Dictation Lab card */}
            <div
                onClick={() => setViewMode('dictation-lab')}
                style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    border: '1px solid var(--accent-color)', cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ background: 'rgba(13, 59, 102, 0.05)', padding: '16px 20px', borderBottom: '1px solid var(--accent-color)' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary-color)' }}>🎧 Audio Dictation Lab</h3>
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: 14, color: '#666', margin: '0 0 16px' }}>
                        Practice high-frequency PTE words and sentences in a real test simulation environment.
                    </p>
                    <button style={{
                        width: '100%', padding: '10px', borderRadius: 8,
                        background: 'var(--secondary-color)', color: 'var(--primary-color)', border: 'none',
                        fontWeight: 700, cursor: 'pointer'
                    }}>Open Lab</button>
                </div>
            </div>

            {CATEGORIES.map(cat => (
                <div key={cat.id} style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    border: '1px solid #f0f0f0'
                }}>
                    <div style={{
                        background: cat.color, padding: '16px 20px',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#333' }}>{cat.title}</h3>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                        {cat.items.map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 0', borderBottom: idx < cat.items.length - 1 ? '1px solid #f5f5f5' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8, background: '#f5f7fa',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 700, color: '#666'
                                    }}>
                                        {item.type}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{item.title}</div>
                                        <div style={{ fontSize: 11, color: '#999' }}>{item.size}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        alert(`Starting download: ${item.title}`);
                                    }}
                                    style={{
                                        background: 'none', border: '1px solid #e0e0e0', borderRadius: 6,
                                        padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#555',
                                        cursor: 'pointer', transition: 'all 0.15s'
                                    }}
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderEssayDB = () => (
        <div>
            <button
                onClick={() => { setViewMode('categories'); setSelectedTemplate(null); }}
                style={{
                    marginBottom: 20, padding: '8px 16px', borderRadius: 8,
                    border: '1px solid #ddd', background: '#fff', cursor: 'pointer',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
                }}
            >
                ← Back to Materials
            </button>

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {/* Templates List */}
                <div style={{ width: 300, flexShrink: 0, background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: 16, color: '#444' }}>Select Template</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {ESSAY_DATABASE.templates.map(tpl => (
                            <div
                                key={tpl.id}
                                onClick={() => setSelectedTemplate(tpl)}
                                style={{
                                    padding: '12px', borderRadius: 8, cursor: 'pointer',
                                    background: selectedTemplate?.id === tpl.id ? '#ede7f6' : '#f8f9fa',
                                    color: selectedTemplate?.id === tpl.id ? '#512da8' : '#333',
                                    fontWeight: selectedTemplate?.id === tpl.id ? 700 : 500,
                                    fontSize: 14, border: '1px solid',
                                    borderColor: selectedTemplate?.id === tpl.id ? '#512da8' : 'transparent'
                                }}
                            >
                                {tpl.title}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#666' }}>Linking Phrases</h4>
                        {Object.entries(ESSAY_DATABASE.linking_phrases).slice(0, 3).map(([key, val]) => (
                            <div key={key} style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>{key.replace(/_/g, ' ')}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {val.slice(0, 3).map(p => (
                                        <span key={p} style={{ fontSize: 10, background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>{p}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Template Content */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #eee', minHeight: 500 }}>
                    {selectedTemplate ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <h2 style={{ margin: 0, color: '#333' }}>{selectedTemplate.title}</h2>
                                <span style={{ padding: '4px 12px', background: '#e1f5fe', color: '#0288d1', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                    {selectedTemplate.essay_type}
                                </span>
                            </div>
                            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>{selectedTemplate.description}</p>

                            <div style={{ background: '#fdf7e3', padding: '12px 16px', borderRadius: 8, borderLeft: '4px solid #f9a825', marginBottom: 24 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#856404', marginBottom: 4 }}>STRUCTURE GUIDE</div>
                                <div style={{ fontSize: 13, color: '#856404' }}>{selectedTemplate.structure_guide}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {Object.entries(selectedTemplate.frames).map(([section, frames]) => (
                                    <div key={section}>
                                        <h5 style={{ textTransform: 'capitalize', margin: '0 0 10px', fontSize: 15, color: '#444', borderBottom: '1px solid #eee', paddingBottom: 6 }}>
                                            {section.replace(/_/g, ' ')}
                                        </h5>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {frames.map((f, i) => (
                                                <div key={i} style={{ padding: '12px', background: '#f8f9fa', borderRadius: 8, border: '1px solid #eee' }}>
                                                    <div style={{ fontSize: 13, lineHeight: '1.6', color: '#333' }}>{f.frame}</div>
                                                    <div style={{ marginTop: 8, fontSize: 11, color: '#999', fontStyle: 'italic' }}>
                                                        Tone: {f.tone} • {f.sentence_count} sentences
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}>
                            <div style={{ fontSize: 64 }}>📝</div>
                            <p>Select a template from the list to view its structure and frames.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderRubric = () => (
        <div>
            <button
                onClick={() => setViewMode('categories')}
                style={{
                    marginBottom: 20, padding: '8px 16px', borderRadius: 8,
                    border: '1px solid #ddd', background: '#fff', cursor: 'pointer',
                    fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                }}
                onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
                onMouseOut={(e) => e.target.style.background = '#fff'}
            >
                <span>←</span> Back to Materials
            </button>

            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #eee', padding: '32px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ borderBottom: '2px solid #00796b', paddingBottom: 24, marginBottom: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#004d40', fontSize: 28, fontWeight: 800 }}>{ESSAY_RUBRIC.rubric_meta.title}</h2>
                            <p style={{ color: '#666', margin: '12px 0 0', maxWidth: 800, lineHeight: '1.6' }}>{ESSAY_RUBRIC.rubric_meta.description}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>VERSION {ESSAY_RUBRIC.rubric_meta.version}</div>
                            <div style={{ fontSize: 13, color: '#999' }}>Released: {ESSAY_RUBRIC.rubric_meta.created}</div>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                    <div style={{ padding: 16, background: '#e0f2f1', borderRadius: 12, border: '1px solid #b2dfdb' }}>
                        <div style={{ fontSize: 11, color: '#00796b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Total Score</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#004d40' }}>{ESSAY_RUBRIC.rubric_meta.total_score} Points</div>
                    </div>
                    <div style={{ padding: 16, background: '#fff3e0', borderRadius: 12, border: '1px solid #ffe0b2' }}>
                        <div style={{ fontSize: 11, color: '#e65100', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Passing Threshold</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#bf360c' }}>{ESSAY_RUBRIC.rubric_meta.passing_threshold} Points</div>
                    </div>
                    <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 12, border: '1px solid #e0e0e0' }}>
                        <div style={{ fontSize: 11, color: '#616161', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Ideal Length</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#212121' }}>220–270 Words</div>
                    </div>
                </div>

                {/* Criteria List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {ESSAY_RUBRIC.criteria.map((criterion) => (
                        <div key={criterion.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #eaeaea', overflow: 'hidden' }}>
                            <div style={{ background: '#f8f9fa', padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 20, color: '#1a1a1a' }}>{criterion.name}</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>{criterion.description}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#00796b' }}>{criterion.max_score} Pts</div>
                                    <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>{criterion.weight_percent}% WEIGHT</div>
                                </div>
                            </div>
                            <div style={{ padding: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                    {criterion.scoring_guide && Object.entries(criterion.scoring_guide).map(([level, info]) => (
                                        <div key={level} style={{
                                            padding: 16, borderRadius: 12,
                                            background: level === 'high' ? '#e8f5e9' : level === 'medium' ? '#fff9c4' : '#ffebee',
                                            border: '1px solid',
                                            borderColor: level === 'high' ? '#c8e6c9' : level === 'medium' ? '#fff59d' : '#ffcdd2'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontWeight: 700, fontSize: 12, color: level === 'high' ? '#2e7d32' : level === 'medium' ? '#f57f17' : '#c62828' }}>
                                                    {info.label || level.toUpperCase()}
                                                </span>
                                                <span style={{ fontSize: 12, fontWeight: 700 }}>{info.score_range} Pts</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 13, color: '#333', lineHeight: '1.5' }}>{info.description}</p>
                                        </div>
                                    ))}
                                </div>

                                {criterion.red_flags && (
                                    <div style={{ marginTop: 20, padding: 16, background: '#fff5f5', borderRadius: 12, border: '1px solid #feb2b2' }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: '#c53030', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>🚩</span> Red Flags (Avoid These)
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                            {criterion.red_flags.map((flag, i) => (
                                                <div key={i} style={{ fontSize: 12, color: '#742a2a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 6 }}>●</span> {flag}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Score mapping */}
                <div style={{ marginTop: 40, padding: 24, background: '#f3f4f6', borderRadius: 16, border: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#374151', fontSize: 20 }}>📊 Score to PTE Band Mapping</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        {ESSAY_RUBRIC.rubric_meta.score_to_pte_band.map((band, idx) => (
                            <div key={idx} style={{
                                background: band.passed ? '#fff' : '#f9fafb',
                                padding: 16, borderRadius: 12, border: '1px solid',
                                borderColor: band.passed ? '#00796b' : '#d1d5db',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: band.passed ? '#00796b' : '#6b7280', marginBottom: 4 }}>{band.band}</div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>PTE {band.pte_equivalent}</div>
                                <div style={{ fontSize: 12, color: '#666' }}>Rubric: {band.range}</div>
                                {band.passed && <div style={{ position: 'absolute', top: -5, right: -5, background: '#00796b', color: '#fff', fontSize: 10, padding: '10px 10px 2px', transform: 'rotate(45deg)', width: 40, textAlign: 'center' }}>✓</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checklist */}
                <div style={{ marginTop: 32, padding: '24px 32px', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', borderRadius: 20, color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <span style={{ fontSize: 32 }}>🏆</span>
                        <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Perfect Essay Checklist</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        {ESSAY_RUBRIC.ideal_essay_checklist.map((check, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, backdropFilter: 'blur(5px)' }}>
                                <span style={{ color: '#fdbb2d', fontWeight: 'bold' }}>✓</span>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{check.item}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDictationLab = () => (
        <div>
            <button
                onClick={() => setViewMode('categories')}
                style={{
                    marginBottom: 20, padding: '8px 16px', borderRadius: 8,
                    border: '1px solid #ddd', background: '#fff', cursor: 'pointer',
                    fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                }}
                onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
                onMouseOut={(e) => e.target.style.background = '#fff'}
            >
                <span>←</span> Back to Materials
            </button>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <DictationLab />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (viewMode) {
            case 'essay-db': return renderEssayDB();
            case 'rubric': return renderRubric();
            case 'dictation-lab': return renderDictationLab();
            default: return renderCategories();
        }
    };

    return (
        <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>📁 Study Materials</h2>
                <p style={{ color: '#666', fontSize: 15 }}>Curated resources to boost your preparation.</p>
            </div>

            {renderContent()}
        </div>
    );
};

export default Materials;
