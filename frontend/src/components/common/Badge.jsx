import { Badge as DSBadge } from '../ui/Badge/Badge';

/**
 * Backward-compatible Badge component
 * 
 * This component wraps the new design system Badge component
 * and maps old variant names to new ones for backward compatibility.
 * 
 * @deprecated Use `import { Badge } from '@/components/ui'` for new code
 */
export default function Badge({ 
  children, 
  variant = 'default',
  size = 'medium',
  ...props
}) {
  // Map old variant names to new design system variants
  const variantMap = {
    default: 'draft',        // Maps to draft (neutral)
    primary: 'completed',    // Maps to completed (teal)
    success: 'completed',    // Maps to completed (teal)
    warning: 'pending',      // Maps to pending (gold)
    danger: 'overdue',       // Maps to overdue (coral)
    pending: 'pending',      // Maps to pending (gold)
    verified: 'verified',    // Maps to verified (teal)
    redo: 'redo_requested',  // Maps to redo_requested (coral)
  };

  const mappedVariant = variantMap[variant] || 'draft';

  // Note: Design system Badge doesn't have size variants
  // All badges use consistent sizing for uniformity
  return (
    <DSBadge
      variant={mappedVariant}
      {...props}
    >
      {children}
    </DSBadge>
  );
}
