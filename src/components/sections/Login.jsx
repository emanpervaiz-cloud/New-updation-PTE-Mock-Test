import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

    // Email validation
    useEffect(() => {
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    }, [email]);

    const isFormValid = email && password && !emailError && !loading;

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setError('');
        setLoading(true);

        try {
            const success = await AuthService.login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
            fontFamily: "'Inter', sans-serif",
            padding: '20px'
        }}>
            <div style={{
                background: '#ffffff',
                padding: '48px 40px',
                borderRadius: '24px',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.06)',
                width: '100%',
                maxWidth: '440px',
                textAlign: 'center',
                border: '1px solid #f0f2f5'
            }}>
                {/* Logo */}
                <div style={{
                    width: 64, height: 64, borderRadius: 18, margin: '0 auto 24px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 7h-9" />
                        <path d="M14 17H5" />
                        <circle cx="17" cy="17" r="3" />
                        <circle cx="7" cy="7" r="3" />
                    </svg>
                </div>

                <h2 style={{ margin: '0 0 10px', color: '#1e293b', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                    Welcome Back
                </h2>
                <p style={{ margin: '0 0 36px', color: '#64748b', fontSize: '15px', fontWeight: 400 }}>
                    Sign in to start your PTE mock test
                </p>

                {error && (
                    <div style={{
                        background: '#fff1f2', color: '#e11d48', padding: '14px',
                        borderRadius: '12px', marginBottom: '24px', fontSize: '14px',
                        fontWeight: 500, border: '1px solid #ffe4e6', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Email Field */}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: emailError ? '1.5px solid #fb7185' : '1.5px solid #e2e8f0',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s',
                                    background: '#fcfdfe'
                                }}
                                onFocus={(e) => {
                                    if (!emailError) e.target.style.borderColor = '#6366f1';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    if (!emailError) e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        {emailError && (
                            <span style={{ color: '#e11d48', fontSize: '12px', marginTop: '6px', display: 'block' }}>
                                {emailError}
                            </span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s',
                                    background: '#fcfdfe'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    color: '#94a3b8'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid}
                        style={{
                            background: isFormValid ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : '#e2e8f0',
                            color: isFormValid ? '#ffffff' : '#94a3b8',
                            border: 'none',
                            padding: '16px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: isFormValid ? 'pointer' : 'not-allowed',
                            marginTop: '8px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: isFormValid ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                        }}
                        onMouseEnter={e => isFormValid && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => isFormValid && (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        {loading ? (
                            <>
                                <div style={{
                                    width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                                <span>Signing in...</span>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </>
                        ) : (
                            <span>Start Mock Test</span>
                        )}
                    </button>
                </form>

                <p style={{ marginTop: '32px', fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                    Don't have an account? <span
                        style={{ color: '#6366f1', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}
                        onClick={() => navigate('/register')}
                    >
                        Create an account
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
