import { COLORS } from '../../utils/constants';

/**
 * Reusable Input component
 * Preserves exact styling from original App.jsx
 */
export default function Input({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  fullWidth = true,
  rows = 3,
  ...props
}) {
  const baseStyles = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: `2px solid ${error ? COLORS.red : '#e5e7eb'}`,
    fontSize: '16px',
    width: fullWidth ? '100%' : 'auto',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    backgroundColor: disabled ? COLORS.gray : 'white',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const focusStyles = {
    borderColor: error ? COLORS.red : COLORS.purple,
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.grayDark,
          }}
        >
          {label}
        </label>
      )}
      <InputComponent
        type={type !== 'textarea' ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={type === 'textarea' ? rows : undefined}
        style={baseStyles}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = focusStyles.borderColor;
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? COLORS.red : '#e5e7eb';
        }}
        {...props}
      />
      {error && (
        <div
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: COLORS.red,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
