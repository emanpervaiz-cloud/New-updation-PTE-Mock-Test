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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginTop: 0 }}>Sign In to Migration PTE Mock test</h3>
        {state.user ? (
          <div>
            <p>Signed in as <strong>{state.user.name || state.user.email}</strong></p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleLogout} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: '#f44336', color: '#fff', border: 'none' }}>Sign out</button>
              <button onClick={() => onClose && onClose()} style={{ flex: 1, padding: '8px 12px', borderRadius: 8 }}>Close</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input placeholder="Full name (optional)" value={name} onChange={e => setName(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
              <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={handleLogin} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: '#3949ab', color: '#fff', border: 'none' }}>Sign in</button>
              <button onClick={() => onClose && onClose()} style={{ flex: 1, padding: '8px 12px', borderRadius: 8 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
