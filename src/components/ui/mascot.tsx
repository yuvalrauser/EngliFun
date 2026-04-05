"use client";

import { cn } from "@/lib/utils";

interface MascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-16 w-16", px: 64 },
  md: { container: "h-24 w-24", px: 96 },
  lg: { container: "h-32 w-32", px: 128 },
  xl: { container: "h-44 w-44", px: 176 },
};

export function Mascot({ size = "md", className }: MascotProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("relative inline-flex items-center justify-center", s.container, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/owl.png"
        alt="EngliFun Owl"
        width={s.px}
        height={s.px}
        className="object-contain drop-shadow-lg"
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
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-card drop-shadow-sm" />
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
