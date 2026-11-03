// Bottom navigation: Home, Habits, Routines, Progress + More.
// Mobile-first; hidden on the onboarding flow.

import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, CalendarCheck2, House, LayoutGrid, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  { to: "/habits", label: "Habits", icon: Repeat, match: (p: string) => p.startsWith("/habits") },
  { to: "/routines", label: "Routines", icon: CalendarCheck2, match: (p: string) => p.startsWith("/routines") },
  { to: "/progress", label: "Progress", icon: BarChart3, match: (p: string) => p.startsWith("/progress") },
  { to: "/more", label: "More", icon: LayoutGrid, match: (p: string) => p.startsWith("/more") || p.startsWith("/focus") || p.startsWith("/journal") || p.startsWith("/academy") || p.startsWith("/challenges") || p.startsWith("/goals") || p.startsWith("/bad-habits") || p.startsWith("/digital") || p.startsWith("/tasks") || p.startsWith("/settings") },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/onboarding")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {ITEMS.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "press flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                  active && "bg-primary/10",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
