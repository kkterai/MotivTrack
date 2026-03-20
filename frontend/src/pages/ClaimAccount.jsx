import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invitationService } from '../services/invitations';
import api from '../services/api';
import { useAuthStore } from '../stores/useAuthStore';
import { COLORS, STORAGE_KEYS } from '../utils/constants';
import { Button, Card, Input } from '../components/common';

/**
 * ClaimAccount - Child registration page via invitation link
 * Validates token, allows child to set password and complete registration
 */
export default function ClaimAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  
  // Registration form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Please check the link and try again.');
      setLoading(false);
      return;
    }

    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      const response = await invitationService.validateToken(token);
      setInvitation(response);
      
      // Pre-fill first name if available from child profile
      if (response.childProfile?.name) {
        setFirstName(response.childProfile.name);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to validate invitation:', err);
      setError(err.response?.data?.error || 'This invitation link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register the child account using the dedicated endpoint
      const response = await api.post('/auth/register-child', {
        token: token,
        password: password,
        name: firstName,
      });

      // Clear any existing session first
      localStorage.clear();
      
      // Store NEW auth token and user data in localStorage
      if (response.success && response.data.token) {
        console.log('[ClaimAccount] Registration response:', response);
        console.log('[ClaimAccount] User data:', response.data.user);
        console.log('[ClaimAccount] User role:', response.data.user.role);
        
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        
        // Mark that this is a new registration requiring onboarding
        localStorage.setItem('motivtrack_needs_onboarding', 'true');
        
        console.log('[ClaimAccount] Stored user data:', localStorage.getItem(STORAGE_KEYS.USER_DATA));
        console.log('[ClaimAccount] Needs onboarding flag:', localStorage.getItem('motivtrack_needs_onboarding'));
      }

      // Redirect to child onboarding flow
      // Force a full page reload to let the app re-initialize with the new auth state
      console.log('[ClaimAccount] Redirecting to /child/onboarding');
      window.location.href = '/child/onboarding';
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitation) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: COLORS.background, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
      }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', color: COLORS.textSecondary }}>
            Validating invitation...
          </div>
        </Card>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: COLORS.background, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
      }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: COLORS.textPrimary }}>
            Invalid Invitation
          </h2>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
            {error}
          </p>
          <Button onClick={() => navigate('/login')} variant="primary">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: COLORS.background, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Card style={{ maxWidth: '500px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: COLORS.textPrimary }}>
            You've been invited!
          </h2>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
            {invitation?.inviter?.name || 'Your parent'} has invited you to join MotivTrack
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#991b1b',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              fullWidth
              required
            />

            <Input
              label="Email"
              type="email"
              value={invitation?.email || ''}
              disabled
              fullWidth
              style={{ background: '#f9fafb', cursor: 'not-allowed' }}
            />

            <Input
              label="Create Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              fullWidth
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              fullWidth
              required
            />
          </div>

          {/* Info Box */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '24px',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>
              ✨ Once you create your account, you'll be able to earn points towards earning rewards!
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
          </Button>
        </form>

        {/* Footer */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '24px', 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            Already have an account?{' '}
            <a 
              href="/login" 
              style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '600' }}
            >
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
