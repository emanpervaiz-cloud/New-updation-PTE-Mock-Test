import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    country: '',
    age: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone number
    const phoneRegex = /^\d{10,}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (at least 10 digits)';
    }

    // Validate country
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    // Validate age
    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age < 16 || age > 80) {
      newErrors.age = 'Please enter a valid age between 16 and 80';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Store user data in localStorage or pass to context/state management
      localStorage.setItem('pteUserData', JSON.stringify(formData));

      // Navigate to exam introduction or first section
      navigate('/exam/introduction');
    }
  };

  const countries = [
    "Australia", "Bangladesh", "Canada", "China", "India",
    "Nepal", "New Zealand", "Pakistan", "Philippines",
    "Sri Lanka", "United Kingdom", "United States", "Vietnam", "Other"
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Navigation Bar - Matching THE MIGRATION website */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e8ecf4',
        padding: '0 48px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 8,
            background: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 20,
          }}>P</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary-color)', letterSpacing: '-0.5px' }}>THE MIGRATION</span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'Home', path: '/' },
            { label: 'Education', path: '/landing', active: true },
            { label: 'Mock Test', path: '/intro' },
            { label: 'Materials', path: '/materials' },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                cursor: 'pointer',
                color: item.active ? 'var(--secondary-color)' : 'var(--text-secondary)',
                fontWeight: item.active ? 700 : 500,
                fontSize: 15,
                transition: 'color 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => !item.active && (e.target.style.color = 'var(--primary-color)')}
              onMouseLeave={e => !item.active && (e.target.style.color = 'var(--text-secondary)')}
            >
              {item.label}
              {item.active && (
                <div style={{
                  position: 'absolute',
                  bottom: -26,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'var(--secondary-color)',
                  borderRadius: '2px 2px 0 0',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/intro')}
          style={{
            padding: '12px 28px',
            borderRadius: 8,
            background: 'var(--secondary-color)',
            color: 'var(--primary-color)',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(250, 169, 22, 0.25)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e59a14'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--secondary-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Book Consultation
        </button>
      </nav>

      {/* Hero Section */}
      <div style={{
        background: 'var(--primary-color)',
        padding: '80px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 600 }}>
            <h1 style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 20,
              lineHeight: 1.2,
            }}>
              Your Journey to PTE Success Starts Here
            </h1>
            <p style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.7,
              marginBottom: 32,
            }}>
              Experience the real PTE Academic exam with our AI-powered mock test.
              Get instant scoring, detailed feedback, and expert guidance to achieve
              your target score for Australian migration.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '16px 32px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 16,
                  border: '2px solid #fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
              >
                Check Your Eligibility
              </button>
              <button
                onClick={() => document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '16px 32px',
                  borderRadius: 8,
                  background: 'var(--secondary-color)',
                  color: 'var(--primary-color)',
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
              >
                Start Mock Test →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 48px', background: 'var(--bg-color)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Why Choose Our PTE Mock Test?
            </h2>
            <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
              Designed by migration experts to help you achieve your dream score
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { icon: '🎯', title: 'AI-Powered Scoring', desc: 'Instant evaluation with detailed feedback' },
              { icon: '📊', title: 'Real Exam Format', desc: 'Authentic PTE Academic test experience' },
              { icon: '🎓', title: 'Expert Guidance', desc: 'Tips from certified PTE trainers' },
              { icon: '📈', title: 'Progress Tracking', desc: 'Monitor your improvement over time' },
            ].map((feature, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Form Section */}
      <div id="registration-form" style={{ padding: '80px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Start Your PTE Journey
            </h2>
            <p style={{ fontSize: 18, color: '#64748b' }}>
              Fill in your details below to begin the mock test
            </p>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: 48,
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
          }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Registration</h3>
              <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32 }}>Complete the form to access your personalized mock test</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="fullName" style={{ fontSize: 14, fontWeight: 600, color: '#3e4e68' }}>Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Abdullah Ali"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1.5px solid ${errors.fullName ? '#ff5252' : '#e2e8f0'}`,
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={e => e.target.style.borderColor = errors.fullName ? '#ff5252' : '#e2e8f0'}
                  />
                  {errors.fullName && <span style={{ fontSize: 12, color: '#ff5252' }}>{errors.fullName}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="email" style={{ fontSize: 14, fontWeight: 600, color: '#3e4e68' }}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. abdullah@example.com"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1.5px solid ${errors.email ? '#ff5252' : '#e2e8f0'}`,
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={e => e.target.style.borderColor = errors.email ? '#ff5252' : '#e2e8f0'}
                  />
                  {errors.email && <span style={{ fontSize: 12, color: '#ff5252' }}>{errors.email}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="phoneNumber" style={{ fontSize: 14, fontWeight: 600, color: '#3e4e68' }}>Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g. 0412345678"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1.5px solid ${errors.phoneNumber ? '#ff5252' : '#e2e8f0'}`,
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={e => e.target.style.borderColor = errors.phoneNumber ? '#ff5252' : '#e2e8f0'}
                  />
                  {errors.phoneNumber && <span style={{ fontSize: 12, color: '#ff5252' }}>{errors.phoneNumber}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="country" style={{ fontSize: 14, fontWeight: 600, color: '#3e4e68' }}>Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1.5px solid ${errors.country ? '#ff5252' : '#e2e8f0'}`,
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: '#fff',
                      cursor: 'pointer'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={e => e.target.style.borderColor = errors.country ? '#ff5252' : '#e2e8f0'}
                  >
                    <option value="">Select your country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && <span style={{ fontSize: 12, color: '#ff5252' }}>{errors.country}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="age" style={{ fontSize: 14, fontWeight: 600, color: '#3e4e68' }}>Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="18"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: `1.5px solid ${errors.age ? '#ff5252' : '#e2e8f0'}`,
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                    onBlur={e => e.target.style.borderColor = errors.age ? '#ff5252' : '#e2e8f0'}
                  />
                  {errors.age && <span style={{ fontSize: 12, color: '#ff5252' }}>{errors.age}</span>}
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: 10,
                    padding: '16px',
                    borderRadius: 12,
                    background: 'var(--secondary-color)',
                    color: 'var(--primary-color)',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(13, 59, 102, 0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(250, 169, 22, 0.4)'; e.currentTarget.style.background = '#e59a14'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 169, 22, 0.3)'; e.currentTarget.style.background = 'var(--secondary-color)'; }}
                >
                  Start PTE Mock Test →
                </button>
              </form>
            </div>

            <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 40 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1f36', marginBottom: 20 }}>Test Overview</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: '🎤', text: 'Speaking & Writing' },
                  { icon: '📖', text: 'Reading Section' },
                  { icon: '🎧', text: 'Listening Section' },

                  { icon: '🤖', text: 'AI Evaluation' },
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#5a6270', fontSize: 15 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 40, background: 'rgba(13, 59, 102, 0.05)', padding: 20, borderRadius: 16, border: '1px solid var(--accent-color)' }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--primary-color)', lineHeight: 1.5, fontWeight: 500 }}>
                  <strong>Important:</strong> Ensure your microphone and headphones are working correctly before you begin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;