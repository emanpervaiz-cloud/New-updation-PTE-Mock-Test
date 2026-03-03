import React from 'react';

const ProgressBar = ({ current, total, showPercentage = true }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ margin: '12px 0 24px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#5a6270'
      }}>
        <span>Question <span style={{ color: 'var(--primary-color)', fontSize: 15, fontWeight: 700 }}>{current}</span> of {total}</span>
        {showPercentage && <span style={{ color: 'var(--primary-color)' }}>{percentage}% Complete</span>}
      </div>
      <div style={{
        height: 6, width: '100%', background: '#e2e8f0', borderRadius: 10, overflow: 'hidden'
      }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
            width: `${percentage}%`,
            borderRadius: 10,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;