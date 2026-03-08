import React, { useEffect, useRef, useState } from 'react';

const AudioPlayer = ({ src, title = "Audio Player", onPlay, onPause }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        if (onPlay) onPlay();
      } catch (err) {
        console.error("Error playing audio:", err);
        setError("Playback failed. Please try again.");
      }
    }
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
    setError(null);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    console.error("Audio error:", audioRef.current.error);
    setError("Failed to load audio. Please check file path.");
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '16px 20px',
      border: '1px solid var(--accent-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: '100%',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
      />

      {error && (
        <div style={{ fontSize: 12, color: '#dc2626', background: '#fee2e2', padding: '8px 12px', borderRadius: 8, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={togglePlayback}
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: isPlaying ? 'var(--secondary-color)' : 'var(--primary-color)',
            color: isPlaying ? 'var(--primary-color)' : '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 10px rgba(13, 59, 102, 0.2)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? "⏹" : "▶"}
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {title && <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1f36' }}>{title}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', minWidth: 32 }}>{formatTime(currentTime)}</span>
            <div
              onClick={handleSeek}
              style={{
                flex: 1, height: 10, background: '#e2e8f0', borderRadius: 10, position: 'relative', overflow: 'hidden',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#cbd5e1'}
              onMouseLeave={e => e.currentTarget.style.background = '#e2e8f0'}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  transition: 'width 0.1s linear'
                }}
              />
              {/* Seek handle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                background: 'var(--primary-color)',
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                pointerEvents: 'none'
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', minWidth: 32 }}>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;