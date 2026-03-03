import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';

const AuthModal = ({ onClose, open }) => {
  const { login, state, logout } = useExam();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!open) return null;

  const handleLogin = () => {
    if (!email) return;
    const user = { id: email, name: name || email.split('@')[0], email };
    login(user);
    onClose && onClose();
  };

  const handleLogout = () => {
    logout();
    onClose && onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13, 59, 102, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 24, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid var(--accent-color)' }}>
        <h3 style={{ marginTop: 0, color: 'var(--primary-color)', fontSize: 20, textAlign: 'center', marginBottom: 24 }}>Sign In to Migration PTE</h3>
        {state.user ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Signed in as <strong style={{ color: 'var(--primary-color)' }}>{state.user.name || state.user.email}</strong></p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleLogout} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Sign out</button>
              <button onClick={() => onClose && onClose()} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'var(--accent-color)', color: 'var(--text-secondary)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-color)' }}>Full Name</label>
                <input placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--accent-color)', background: '#f8fafd', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-color)' }}>Email Address</label>
                <input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--accent-color)', background: '#f8fafd', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              <button onClick={handleLogin} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--primary-color)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(13, 59, 102, 0.2)' }}>Sign In to Dashboard</button>
              <button onClick={() => onClose && onClose()} style={{ padding: '12px 16px', borderRadius: 12, background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
