import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

export function LoadingSpinner({
  className,
  size = "medium",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClassMap = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2
          className={cn(
            "animate-spin text-primary",
            sizeClassMap[size],
            className
          )}
        />
      </div>
    );
  }

  return (
    <Loader2
      className={cn(
        "animate-spin text-primary",
        sizeClassMap[size],
        className
      )}
    />
  );
}
