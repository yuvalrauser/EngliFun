"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "לוח בקרה", icon: "🏠" },
  { href: "/path", label: "מסלול למידה", icon: "📖" },
  { href: "/leaderboard", label: "טבלת מובילים", icon: "🏆" },
  { href: "/profile", label: "פרופיל", icon: "👤" },
  { href: "/review", label: "חזרה על טעויות", icon: "🔄" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-l border-border bg-card">
      {/* Logo */}
      <div className="pt-4 pb-3">
        <Link href="/dashboard" className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/owl.png"
            alt="EngliFun"
            className="w-full object-contain scale-110"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div className="ms-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="rounded-xl bg-primary/5 p-3 text-center">
          <div className="text-xs text-muted-foreground">למד כל יום!</div>
          <div className="text-sm font-semibold text-primary mt-0.5">🔥 שמור על הסטריק</div>
        </div>
      </div>
    </aside>
  );
}
