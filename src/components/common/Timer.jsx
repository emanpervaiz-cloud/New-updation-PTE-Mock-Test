import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime, onComplete, autoSubmit = true }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (autoSubmit && onComplete) {
        onComplete();
      }
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, onComplete, autoSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 60;
  const isCriticalTime = timeLeft <= 30;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      background: isCriticalTime ? '#fee2e2' : (isLowTime ? '#fff3e0' : '#f8f9fe'),
      borderRadius: 10,
      border: `1.5px solid ${isCriticalTime ? '#fecaca' : (isLowTime ? '#ffe0b2' : '#eef2f6')}`,
      color: isCriticalTime ? '#dc2626' : (isLowTime ? '#fb8c00' : 'var(--primary-color)'),
      fontWeight: 700,
      fontSize: 16,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      boxShadow: isCriticalTime ? '0 0 10px rgba(220, 38, 38, 0.1)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <span style={{ fontSize: 18 }}>{isCriticalTime ? '⏰' : '⏱️'}</span>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;