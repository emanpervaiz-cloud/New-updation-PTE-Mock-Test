import React from 'react';

/**
 * ScoreDisplay — Reusable component to display AI evaluation results
 * Shows 5-dimension scores with feedback, band descriptor, strengths, and improvements
 */
const ScoreDisplay = ({ evaluation, loading, error, onGetScore, hasResponse, questionType }) => {
    if (!hasResponse && !loading && !evaluation) {
        return null;
    }

    // Show "Get Score" button when response exists but no evaluation yet
    if (!evaluation && !loading && !error) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', marginTop: 16
            }}>
                <button
                    onClick={onGetScore}
                    style={{
                        padding: '14px 36px', borderRadius: 14,
                        background: 'var(--secondary-color)',
                        color: 'var(--primary-color)', border: 'none',
                        fontWeight: 700, fontSize: 15, cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 6px 20px rgba(250, 169, 22, 0.25)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        letterSpacing: '0.3px'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 28px rgba(250, 169, 22, 0.35)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(250, 169, 22, 0.25)';
                    }}
                >
                    <span style={{ fontSize: 20 }}>📊</span>
                    Get AI Score
                </button>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #f8f9fe, #fff)',
                borderRadius: 20, padding: '32px',
                border: '1px solid #eef2f6',
                textAlign: 'center',
                marginTop: 16,
                animation: 'fadeIn 0.3s ease'
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '4px solid var(--accent-color)', borderTopColor: 'var(--primary-color)',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 16px'
                }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-color)', marginBottom: 4 }}>
                    AI Examiner Evaluating...
                </div>
                <div style={{ fontSize: 13, color: '#5a6270' }}>
                    Our 30+ year experienced examiner is analyzing your response
                </div>
                <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{
                background: '#fef2f2', borderRadius: 16, padding: '20px 24px',
                border: '1px solid #fecaca', marginTop: 16,
                display: 'flex', alignItems: 'center', gap: 12
            }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 2 }}>Evaluation Error</div>
                    <div style={{ fontSize: 13, color: '#7f1d1d' }}>{error}</div>
                </div>
                <button
                    onClick={onGetScore}
                    style={{
                        marginLeft: 'auto', padding: '8px 16px', borderRadius: 10,
                        background: '#dc2626', color: '#fff', border: 'none',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Score result display
    if (!evaluation) return null;

    // Simplified display for writing - card style like speaking
    if (questionType === 'writing') {
        const getScoreColor = (score) => {
            if (score >= 8) return '#2e7d32';
            if (score >= 6) return '#1565c0';
            if (score >= 4) return '#f57f17';
            return '#c62828';
        };

        const writingDimensions = [
            {
                key: 'grammar',
                label: 'Grammar Range & Accuracy',
                icon: '📝',
                color: '#2e7d32',
                score: evaluation.grammarScore || 5,
                feedback: evaluation.grammarErrors?.length > 0
                    ? `Found ${evaluation.grammarErrors.length} grammar issues: ${evaluation.grammarErrors.slice(0, 2).join(', ')}${evaluation.grammarErrors.length > 2 ? '...' : ''}`
                    : 'Grammar analysis shows good sentence structure. Continue using varied sentence types.'
            },
            {
                key: 'spelling',
                label: 'Spelling & Punctuation',
                icon: '✏️',
                color: '#e65100',
                score: evaluation.spellingScore || 5,
                feedback: evaluation.spellingErrors?.length > 0
                    ? `Found ${evaluation.spellingErrors.length} spelling errors: ${evaluation.spellingErrors.slice(0, 2).join(', ')}${evaluation.spellingErrors.length > 2 ? '...' : ''}`
                    : 'Spelling and punctuation are accurate. Maintain careful proofreading habits.'
            },
            {
                key: 'vocabulary',
                label: 'Vocabulary & Lexical Resource',
                icon: '📚',
                color: 'var(--primary-color)',
                score: evaluation.vocabularyScore || 5,
                feedback: evaluation.vocabularySuggestions?.length > 0
                    ? `Vocabulary suggestions: ${evaluation.vocabularySuggestions.slice(0, 2).join(', ')}${evaluation.vocabularySuggestions.length > 2 ? '...' : ''}`
                    : 'Vocabulary usage is appropriate. Consider using more academic vocabulary for higher scores.'
            }
        ];

        return (
            <div style={{
                background: 'linear-gradient(135deg, #fafbff, #fff)',
                borderRadius: 20, padding: 0,
                border: '1px solid #e8ecf4',
                marginTop: 16,
                overflow: 'hidden',
                animation: 'fadeIn 0.5s ease',
                boxShadow: 'var(--shadow-md)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'var(--primary-color)',
                    padding: '20px 28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 24 }}>✍️</span>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Writing Feedback</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>AI-powered analysis</div>
                        </div>
                    </div>
                </div>

                {/* Writing Overall Score Section */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
                    padding: '24px 28px', borderBottom: '1px solid #e8ecf4',
                    background: 'rgba(46, 125, 50, 0.03)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: '#5a6270', fontWeight: 600, marginBottom: 4 }}>YOUR SCORE</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                            <span style={{ fontSize: 48, fontWeight: 800, color: getScoreColor(evaluation.overallScore || 0), lineHeight: 1 }}>
                                {evaluation.overallScore || 0}
                            </span>
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#94a3b8' }}>/ 10</span>
                        </div>
                    </div>
                </div>

                {/* Dimension Cards */}
                <div style={{ padding: '24px 28px' }}>
                    {writingDimensions.map(({ key, label, icon, color, score, feedback }) => (
                        <div key={key} style={{
                            marginBottom: 20, padding: '20px 24px',
                            background: '#fff', borderRadius: 16,
                            border: '1px solid #f0f2f8',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: 12
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 20 }}>{icon}</span>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1f36' }}>{label}</span>
                                </div>
                                <div style={{
                                    fontSize: 20, fontWeight: 800, color: getScoreColor(score),
                                    background: `${getScoreColor(score)}15`, padding: '6px 16px',
                                    borderRadius: 12
                                }}>
                                    {score}/10
                                </div>
                            </div>
                            {/* Score bar */}
                            <div style={{ height: 8, background: '#f1f3f9', borderRadius: 4, marginBottom: 12, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${score * 10}%`,
                                    background: `linear-gradient(90deg, ${color}, ${getScoreColor(score)})`,
                                    borderRadius: 4, transition: 'width 0.8s ease'
                                }} />
                            </div>
                            <div style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>
                                {feedback}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Overall Feedback */}
                {evaluation.feedback && (
                    <div style={{ padding: '0 28px 24px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2e7d32', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>💡</span> Overall Feedback
                        </div>
                        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, background: '#f0fdf4', padding: '16px 20px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                            {evaluation.feedback}
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        );
    }

    const dimensions = [
        { key: 'fluency_coherence', label: 'Fluency & Coherence', icon: '🗣️', color: 'var(--primary-color)' },
        { key: 'pronunciation_intonation', label: 'Pronunciation & Intonation', icon: '🎯', color: '#1565c0' },
        { key: 'grammar_range_accuracy', label: 'Grammar Range & Accuracy', icon: '📝', color: '#2e7d32' },
        { key: 'vocabulary_lexical_resource', label: 'Vocabulary & Lexical Resource', icon: '📚', color: '#e65100' },
        { key: 'task_achievement', label: 'Task Achievement & Relevance', icon: '🎯', color: '#c62828' }
    ];

    const getScoreColor = (score) => {
        if (score >= 8) return '#2e7d32';
        if (score >= 6) return '#1565c0';
        if (score >= 4) return '#f57f17';
        return '#c62828';
    };

    const getBandColor = (band) => {
        if (band?.includes('Expert')) return '#2e7d32';
        if (band?.includes('Strong')) return '#1565c0';
        if (band?.includes('Competent')) return '#f57f17';
        if (band?.includes('Developing')) return '#e65100';
        return '#c62828';
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #fafbff, #fff)',
            borderRadius: 20, padding: 0,
            border: '1px solid #e8ecf4',
            marginTop: 16,
            overflow: 'hidden',
            animation: 'fadeIn 0.5s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
        }}>
            {/* Header */}
            <div style={{
                background: 'var(--primary-color)',
                padding: '20px 28px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🏆</span>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>AI Examiner Score</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>AI-powered evaluation</div>
                    </div>
                </div>
                <div style={{
                    background: getBandColor(evaluation.band_descriptor),
                    padding: '6px 16px', borderRadius: 20,
                    fontSize: 13, fontWeight: 700, color: '#fff',
                    letterSpacing: '0.3px'
                }}>
                    {evaluation.band_descriptor || 'Evaluating...'}
                </div>
            </div>

            {/* Total Score */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
                padding: '24px 28px', borderBottom: '1px solid var(--accent-color)',
                background: 'rgba(13, 59, 102, 0.03)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, fontWeight: 800, color: getScoreColor(evaluation.scaled_score || 0), lineHeight: 1 }}>
                        {evaluation.total_score || 0}
                    </div>
                    <div style={{ fontSize: 13, color: '#5a6270', fontWeight: 600, marginTop: 4 }}>out of 50</div>
                </div>
                <div style={{ width: 1, height: 60, background: '#e8ecf4' }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: getScoreColor(evaluation.scaled_score || 0), lineHeight: 1 }}>
                        {evaluation.scaled_score || 0}
                    </div>
                    <div style={{ fontSize: 13, color: '#5a6270', fontWeight: 600, marginTop: 4 }}>scaled /10</div>
                </div>
                <div style={{ width: 1, height: 60, background: '#e8ecf4' }} />
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: 20, fontWeight: 800,
                        color: 'var(--primary-color)', lineHeight: 1,
                        padding: '8px 16px', background: 'rgba(13, 59, 102, 0.05)', borderRadius: 12
                    }}>
                        {evaluation.cefr_level || 'N/A'}
                    </div>
                    <div style={{ fontSize: 13, color: '#5a6270', fontWeight: 600, marginTop: 4 }}>CEFR Level</div>
                </div>
                {evaluation.overall_pte_score && (
                    <>
                        <div style={{ width: 1, height: 60, background: '#e8ecf4' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>
                                {evaluation.overall_pte_score}
                            </div>
                            <div style={{ fontSize: 13, color: '#5a6270', fontWeight: 600, marginTop: 4 }}>PTE Score /90</div>
                        </div>
                    </>
                )}
            </div>

            {/* Transcript Display (for speaking questions) */}
            {evaluation.transcript && questionType === 'speaking' && (
                <div style={{ padding: '0 28px 24px' }}>
                    <div style={{
                        background: 'var(--accent-color)', borderRadius: 14, padding: '16px 20px',
                        border: '1px solid var(--accent-color)'
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>📝</span> Speech Transcript
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-main)', fontStyle: 'italic', lineHeight: 1.6, background: '#fff', padding: '12px 16px', borderRadius: 8, border: '1px dashed #d1d5db' }}>
                            "{evaluation.transcript}"
                        </div>
                    </div>
                </div>
            )}

            {/* Dimension Scores */}
            <div style={{ padding: '0 28px 20px' }}>
                {dimensions.map(({ key, label, icon, color }) => {
                    // Normalize data: check for nested object first, then flat key
                    let dim = evaluation[key];

                    // Fallback for flat keys if nested object is missing
                    if (!dim) {
                        const flatKeyMap = {
                            'fluency_coherence': 'fluencyScore',
                            'pronunciation_intonation': 'pronunciationScore',
                            'grammar_range_accuracy': 'grammarScore',
                            'vocabulary_lexical_resource': 'vocabularyScore',
                            'task_achievement': 'taskScore'
                        };
                        const flatKey = flatKeyMap[key];
                        if (evaluation[flatKey] !== undefined) {
                            dim = { score: evaluation[flatKey], feedback: evaluation.feedback || '' };
                        }
                    }

                    if (!dim) return null;
                    const score = typeof dim.score === 'number' ? dim.score : 0;
                    const feedback = dim.feedback || '';

                    return (
                        <div key={key} style={{
                            marginBottom: 16, padding: '16px 20px',
                            background: '#fff', borderRadius: 14,
                            border: '1px solid #f0f2f8',
                            transition: 'all 0.2s',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 18 }}>{icon}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1f36' }}>{label}</span>
                                </div>
                                <div style={{
                                    fontSize: 18, fontWeight: 800, color: getScoreColor(score),
                                    background: `${getScoreColor(score)}10`, padding: '4px 14px',
                                    borderRadius: 10
                                }}>
                                    {score}/10
                                </div>
                            </div>
                            {/* Score bar */}
                            <div style={{ height: 6, background: '#f1f3f9', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${score * 10}%`,
                                    background: `linear-gradient(90deg, ${color}, ${getScoreColor(score)})`,
                                    borderRadius: 3, transition: 'width 0.8s ease'
                                }} />
                            </div>
                            <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>
                                {feedback}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Strength & Improvement */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                padding: '0 28px 24px'
            }}>
                {evaluation.top_strength && (
                    <div style={{
                        background: '#f0fdf4', borderRadius: 14, padding: '16px 20px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>💪</span> Top Strength
                        </div>
                        <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>
                            {evaluation.top_strength}
                        </div>
                    </div>
                )}
                {evaluation.priority_improvement && (
                    <div style={{
                        background: '#fff7ed', borderRadius: 14, padding: '16px 20px',
                        border: '1px solid #fed7aa'
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>🎯</span> Priority Improvement
                        </div>
                        <div style={{ fontSize: 13, color: '#9a3412', lineHeight: 1.5 }}>
                            {evaluation.priority_improvement}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div >
    );
};

export default ScoreDisplay;
