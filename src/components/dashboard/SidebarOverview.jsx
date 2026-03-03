import React from 'react';

const SidebarOverview = ({ history, targetScore, avgScore, lastScore, onStartTest, onShowTargetModal, onStartMockTest }) => {

    const recentHistory = [...history].reverse().slice(0, 5);

    return (
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick Start CTA */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary-color), #08243e)',
                borderRadius: 14, padding: '24px',
                boxShadow: 'var(--shadow-md)',
            }}>
                <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>🚀 Ready to Test?</h4>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: '0 0 14px', lineHeight: 1.5 }}>
                    Take a full mock test and get your estimated PTE score instantly.
                </p>
                <button
                    onClick={onStartMockTest}
                    style={{
                        width: '100%', background: 'var(--secondary-color)', color: 'var(--primary-color)',
                        border: 'none', borderRadius: 8, padding: '12px',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    Start Mock Test →
                </button>
            </div>

            {/* Score Overview */}
            <div style={{
                background: 'var(--bg-color)', borderRadius: 14, padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--accent-color)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--primary-color)' }}>📈 Score Overview</h4>
                    <button
                        onClick={onShowTargetModal}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '12px',
                            cursor: 'pointer', fontWeight: 600, textDecoration: 'underline'
                        }}
                    >
                        Edit Target
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                        { label: 'Tests Taken', value: history.length, color: 'var(--primary-color)', bg: 'rgba(13, 59, 102, 0.05)' },
                        { label: 'Avg Score', value: avgScore || '—', color: 'var(--success-color)', bg: 'rgba(46, 125, 50, 0.05)' },
                        { label: 'Last Score', value: lastScore || '—', color: 'var(--secondary-color)', bg: 'rgba(250, 169, 22, 0.08)' },
                        { label: 'Target', value: `${targetScore}+`, color: 'var(--danger-color)', bg: 'rgba(211, 47, 47, 0.05)' },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            background: stat.bg, borderRadius: 10, padding: '12px',
                            textAlign: 'center', border: `1px solid ${stat.color}22`
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Practiced History */}
            <div style={{
                background: 'var(--bg-color)', borderRadius: 14, padding: '20px',
                boxShadow: 'var(--shadow-sm)', flex: 1,
                border: '1px solid var(--accent-color)',
            }}>
                <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--primary-color)' }}>🕐 Recent History</h4>

                {recentHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                        <div style={{ fontSize: 32 }}>📭</div>
                        <p style={{ fontSize: 13, marginTop: 8 }}>No mock tests completed yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {recentHistory.map((test, i) => (
                            <div key={i} style={{
                                background: 'var(--accent-color)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                                        {test.date}
                                    </span>
                                    <span style={{ fontSize: 11, color: '#64748b' }}>Items: {test.totalAnswered || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-color)' }}>Mock Test #{history.length - i}</span>
                                    <span style={{
                                        background: test.overall >= targetScore ? 'rgba(46, 125, 50, 0.1)' : 'rgba(250, 169, 22, 0.1)',
                                        color: test.overall >= targetScore ? 'var(--success-color)' : '#92400e',
                                        borderRadius: '6px', padding: '2px 8px', fontSize: 13, fontWeight: 700,
                                    }}>{test.overall}/90</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                    {['speaking', 'writing', 'reading', 'listening'].map(s => (
                                        <span key={s} style={{
                                            fontSize: 10, background: 'var(--bg-color)', color: 'var(--primary-color)',
                                            border: '1px solid rgba(13, 59, 102, 0.1)', borderRadius: 4, padding: '2px 6px',
                                            fontWeight: 600
                                        }}>
                                            {s.slice(0, 1).toUpperCase()}: {test[s] || '—'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default SidebarOverview;
