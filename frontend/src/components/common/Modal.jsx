import { useEffect } from 'react';

/**
 * Modal Dialog component
 * Preserves exact styling from original App.jsx
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  maxWidth,
}) {
  // Determine maxWidth based on size if not explicitly provided
  const getMaxWidth = () => {
    if (maxWidth) return maxWidth;
    switch (size) {
      case 'small': return '400px';
      case 'large': return '800px';
      case 'xlarge': return '1000px';
      default: return '500px'; // medium
    }
  };
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: getMaxWidth(),
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: '20px',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
