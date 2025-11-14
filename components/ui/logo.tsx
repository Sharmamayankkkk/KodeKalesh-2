import Image from "next/image";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo - will use Logo.png if available, otherwise fallback to icon */}
      <div className={cn("bg-primary rounded-lg flex items-center justify-center overflow-hidden", sizeClasses[size])}>
        <Image
          src="/Logo.png"
          alt="HealthPulse Pro Logo"
          width={size === "sm" ? 32 : size === "md" ? 40 : 48}
          height={size === "sm" ? 32 : size === "md" ? 40 : 48}
          className="object-cover"
          onError={(e) => {
            // Fallback to icon if image doesn't load
            e.currentTarget.style.display = 'none';
          }}
        />
        <Heart className={cn("text-primary-foreground", size === "sm" ? "w-5 h-5" : size === "md" ? "w-6 h-6" : "w-7 h-7")} />
      </div>
      {showText && (
        <div>
          <h1 className={cn("font-bold text-foreground", textSizeClasses[size])}>
            HealthPulse Pro
          </h1>
        </div>
      )}
    </div>
  );
}
