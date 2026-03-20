import { useState } from 'react';
import { Button, Card, Input } from '../components/common';
import { COLORS } from '../utils/constants';

/**
 * Login - Authentication page for all user types
 * Handles login and registration with role-based redirect
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onLogin - Callback when user logs in successfully
 * @param {Function} props.onRegister - Callback when user registers successfully
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message to display
 */
export default function Login({ onLogin, onRegister, loading = false, error = null }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin_parent', // Default role for registration (only parents can register directly)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'login') {
      await onLogin(formData.email, formData.password);
    } else {
      await onRegister({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: COLORS.background,
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: COLORS.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            MotivTrack
          </h1>
          <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
            Empowering families through positive reinforcement
          </p>
        </div>

        {/* Login/Register Card */}
        <Card>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: COLORS.textPrimary,
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              background: '#fee2e2',
              border: `1px solid ${COLORS.error}`,
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              color: COLORS.error,
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your name"
                required
                disabled={loading}
              />
            )}

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: COLORS.textSecondary,
          }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: COLORS.primary,
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: COLORS.primary,
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '13px',
          color: COLORS.textSecondary,
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
