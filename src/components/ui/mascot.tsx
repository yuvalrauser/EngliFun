"use client";

import { cn } from "@/lib/utils";

const widthMap = {
  sm: "w-28",
  md: "w-36",
  lg: "w-48",
  xl: "w-64",
};

interface MascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Mascot({ size = "md", className }: MascotProps) {
  return (
    <div className={cn("inline-flex items-center justify-center", widthMap[size], className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/owl.png"
        alt="EngliFun"
        className="w-full object-contain drop-shadow-lg"
      />
    </div>
  );
}

export function MascotWithBubble({
  size = "md",
  message,
  className,
}: {
  size?: MascotProps["size"];
  message: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Mascot size={size} />
      <div className="relative max-w-xs rounded-2xl bg-card px-5 py-3 text-center shadow-md ring-1 ring-border">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-card" />
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
