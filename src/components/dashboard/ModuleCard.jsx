import React from 'react';

const ModuleCard = ({ module, onStartPractice }) => {
    const { module_name, icon, total_items, practiced, progress_percentage, average_score, color, accent, border } = module;

    return (
        <div
            style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                border: `1px solid var(--accent-color)`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
            }}
            onClick={onStartPractice}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(13, 59, 102, 0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px'
                    }}>
                        {icon}
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-color)' }}>{module_name}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-color)' }}>{average_score || '--'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Score</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>
                <span>Practiced: <strong style={{ color: 'var(--primary-color)' }}>{practiced}</strong></span>
                <span>{Math.round(progress_percentage)}%</span>
            </div>

            <div style={{ height: '8px', background: 'var(--accent-color)', border: '1px solid var(--accent-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                    style={{
                        width: `${Math.max(progress_percentage, 0)}%`,
                        height: '100%',
                        background: 'var(--primary-color)',
                        borderRadius: '4px'
                    }}
                />
            </div>

            <button
                style={{
                    marginTop: 'auto',
                    width: '100%',
                    padding: '12px',
                    background: 'var(--accent-color)',
                    color: 'var(--primary-color)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
            >
                Start Practice Now
            </button>
        </div >
    );
};

export default ModuleCard;
