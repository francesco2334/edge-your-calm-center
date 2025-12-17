import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaWrapperProps {
  children: ReactNode;
  className?: string;
  /** Include top safe area padding */
  top?: boolean;
  /** Include bottom safe area padding */
  bottom?: boolean;
  /** Include keyboard avoidance */
  keyboard?: boolean;
}

/**
 * SafeAreaWrapper - Ensures content respects device safe areas
 * 
 * Usage:
 * - Wrap full-screen components to prevent content clipping on notched devices
 * - Use keyboard prop for forms that need to avoid the on-screen keyboard
 */
export function SafeAreaWrapper({ 
  children, 
  className,
  top = true,
  bottom = true,
  keyboard = false,
}: SafeAreaWrapperProps) {
  return (
    <div 
      className={cn(
        'min-h-screen flex flex-col',
        top && 'pt-safe-top',
        bottom && 'pb-safe-bottom',
        keyboard && 'keyboard-avoiding',
        className
      )}
      style={{
        // Fallback for browsers that don't support env()
        paddingTop: top ? 'max(env(safe-area-inset-top, 0px), 0px)' : undefined,
        paddingBottom: bottom ? 'max(env(safe-area-inset-bottom, 0px), 0px)' : undefined,
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * SafeBottomButton - Wrapper for bottom CTAs that need to stay above safe area
 * Use this for fixed-position buttons at the bottom of the screen
 */
export function SafeBottomButton({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div 
      className={cn(
        'px-5 pb-safe-bottom',
        className
      )}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
      }}
    >
      {children}
    </div>
  );
}
