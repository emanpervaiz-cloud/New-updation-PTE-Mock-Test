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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fb', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Sidebar Placeholder or Sidebar consistent with Dashboard */}
      <aside style={{
        width: 240,
        background: '#fff',
        borderRight: '1px solid #e8ecf4',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #ff8a65, #ff6f00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 20,
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#3e2723', letterSpacing: '-0.5px' }}>Migration</span>
        </div>

        <div style={{ flex: 1, padding: '20px 0' }}>
          {[
            { icon: '📊', label: 'Dashboard', path: '/' },
            { icon: '📝', label: 'Practice', path: '/landing', active: true },
            { icon: '🎓', label: 'Mock Test', path: '/intro' },
            { icon: '📁', label: 'Materials', path: '/materials' }
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 24px', cursor: 'pointer',
                background: item.active ? 'linear-gradient(90deg, #ede7f6, #f3e5f5)' : 'transparent',
                borderRight: item.active ? '4px solid #673ab7' : '4px solid transparent',
                color: item.active ? '#512da8' : '#5a6270',
                fontWeight: item.active ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <header style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1a1f36', marginBottom: 12 }}>Migration PTE Mock Test</h1>
            <p style={{ fontSize: 16, color: '#5a6270', lineHeight: 1.6 }}>
              Experience the real PTE Academic exam with our AI-powered mock test.
              Get instant scoring and detailed feedback.
            </p>
          </header>

          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 40,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid #eef2f6',
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) 300px',
            gap: 40
          }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1f36', marginBottom: 24 }}>Registration</h2>
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
                    onFocus={e => e.target.style.borderColor = '#673ab7'}
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
                    onFocus={e => e.target.style.borderColor = '#673ab7'}
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
                    onFocus={e => e.target.style.borderColor = '#673ab7'}
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
                    onFocus={e => e.target.style.borderColor = '#673ab7'}
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
                    onFocus={e => e.target.style.borderColor = '#673ab7'}
                    onBlur={e => e.target.style.borderColor = errors.age ? '#ff5252' : '#e2e8f0'}
                  />
                  {errors.age && <span style={{ fontSize: 12, color: '#ff5252' }}>{errors.age}</span>}
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: 10,
                    padding: '14px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #673ab7, #5e35b1)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(103, 58, 183, 0.2)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(103, 58, 183, 0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(103, 58, 183, 0.2)'; }}
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

              <div style={{ marginTop: 40, background: '#fff9c4', padding: 20, borderRadius: 16 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#827717', lineHeight: 1.5, fontWeight: 500 }}>
                  <strong>Important:</strong> Ensure your microphone and headphones are working correctly before you begin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;