import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingScreenProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
  minHeight?: string;
}

export function LoadingScreen({
  text = "Caricamento in corso...",
  fullScreen = false,
  className,
  minHeight = "min-h-[200px]"
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" : minHeight,
        className
      )}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
} 