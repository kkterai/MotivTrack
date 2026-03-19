import { useNavigate } from 'react-router-dom';
import { Button } from '../common';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLORS } from '../../utils/constants';

/**
 * Header - Application header with navigation and logout
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title to display
 * @param {boolean} props.showLogout - Whether to show logout button
 */
export default function Header({ title, showLogout = true }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      background: 'white',
      borderBottom: `1px solid ${COLORS.background}`,
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo/Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px' }}>🎯</div>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: COLORS.textPrimary,
              margin: 0,
            }}>
              {title || 'MotivTrack'}
            </h1>
            {user && (
              <div style={{
                fontSize: '13px',
                color: COLORS.textSecondary,
              }}>
                {user.name}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        {showLogout && user && (
          <Button
            variant="outline"
            onClick={handleLogout}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
