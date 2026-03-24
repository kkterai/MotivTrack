import { Button as DSButton } from '../ui/Button/Button';

/**
 * Backward-compatible Button component
 *
 * This component wraps the new design system Button component
 * and maps old variant names to new ones for backward compatibility.
 *
 * @deprecated Use `import { Button } from '@/components/ui'` for new code
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) {
  // Map old variant names to new design system variants
  const variantMap = {
    primary: 'primary',      // Maps to navy
    secondary: 'secondary',  // Maps to white with border
    success: 'success',      // Maps to teal
    warning: 'secondary',    // Maps to secondary (no direct warning variant)
    danger: 'destructive',   // Maps to coral red
    outline: 'ghost',        // Maps to ghost (transparent)
  };

  const mappedVariant = variantMap[variant] || 'primary';

  return (
    <DSButton
      type={type}
      variant={mappedVariant}
      size="md"
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
      {...props}
    >
      {children}
    </DSButton>
  );
}
