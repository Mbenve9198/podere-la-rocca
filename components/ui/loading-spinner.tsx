import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md',
  text,
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-4", className)}>
      <div className={cn(
        "animate-spin rounded-full border-t-transparent border-primary", 
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
} 