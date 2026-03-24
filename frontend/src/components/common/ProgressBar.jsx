import { ProgressBar as DSProgressBar } from '../ui/ProgressBar/ProgressBar';

/**
 * Backward-compatible ProgressBar component
 * 
 * This component wraps the new design system ProgressBar component
 * for backward compatibility with existing code.
 * 
 * @deprecated Use `import { ProgressBar } from '@/components/ui'` for new code
 */
export default function ProgressBar({
  current,
  max,
  color,
  height,
  showLabel = true,
  animated = true,
  ...props
}) {
  // Map old props to new design system props
  // Old: current/max, New: value/max
  const value = current !== undefined ? current : 0;
  const maxValue = max !== undefined ? max : 100;

  return (
    <DSProgressBar
      value={value}
      max={maxValue}
      showValue={showLabel}
      variant="success"
      {...props}
    />
  );
}
