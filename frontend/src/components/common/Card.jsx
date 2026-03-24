import { Card as DSCard } from '../ui/Card/Card';

/**
 * Backward-compatible Card component
 *
 * This component wraps the new design system Card component
 * for backward compatibility with existing code.
 *
 * @deprecated Use `import { Card } from '@/components/ui'` for new code
 */
export default function Card({
  children,
  onClick,
  hoverable = false,
  className = '',
  style = {},
  ...props
}) {
  return (
    <DSCard
      variant="default"
      onClick={onClick}
      hoverable={hoverable || !!onClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </DSCard>
  );
}
