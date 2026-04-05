"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "בית", icon: "🏠" },
  { href: "/path", label: "מסלול", icon: "📖" },
  { href: "/leaderboard", label: "מובילים", icon: "🏆" },
  { href: "/profile", label: "פרופיל", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1.5 text-xs transition-all rounded-xl",
              isActive
                ? "text-primary"
                : "text-muted-foreground active:scale-95"
            )}
          >
            <span className={cn("text-xl transition-transform", isActive && "scale-110")}>
              {item.icon}
            </span>
            <span className={cn("font-medium", isActive && "font-bold")}>{item.label}</span>
            {isActive && (
              <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
