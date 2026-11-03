// Shared app UI primitives: page shell, headers, cards, charts, heatmaps.

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-lg px-4 pb-28 pt-4", className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  back = false,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-start gap-2">
      {back && (
        <Link
          to=".."
          className="press mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-foreground"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className={cn("card-soft block w-full p-4 text-left", onClick && "press", className)}>
      {children}
    </Comp>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function Empty({ icon, title, hint, action }: { icon: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card-soft flex flex-col items-center gap-2 px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-2xl">{icon}</div>
      <p className="font-medium text-foreground">{title}</p>
      {hint && <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

/** Circular progress ring (0..1). */
export function Ring({
  value,
  size = 64,
  stroke = 6,
  color = "var(--color-primary)",
  track = "color-mix(in oklab, var(--color-foreground) 10%, transparent)",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        {v > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${v * c} ${c}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Simple bar chart for date series. */
export function Bars({
  dates,
  values,
  color = "var(--color-primary)",
  height = 90,
  labelEvery = 5,
}: {
  dates: string[];
  values: number[];
  color?: string;
  height?: number;
  labelEvery?: number;
}) {
  const max = Math.max(1, ...values.map((v) => (isFinite(v) ? v : 0)));
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {dates.map((d, i) => {
          const v = values[i] ?? 0;
          const h = Math.max(2, Math.round((v / max) * (height - 12)));
          return (
            <div
              key={d}
              className="min-w-[3px] flex-1 rounded-t-[3px]"
              style={{ height: h, background: v > 0 ? color : "color-mix(in oklab, var(--color-foreground) 8%, transparent)" }}
              title={`${d}: ${v}`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        {dates
          .filter((_, i) => i % labelEvery === 0 || i === dates.length - 1)
          .map((d) => (
            <span key={d}>
              {new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          ))}
      </div>
    </div>
  );
}

/** GitHub-style heatmap for the last N local days. */
export function Heatmap({
  dates,
  valueFor,
  weeks = 9,
  color = "var(--color-primary)",
}: {
  dates: string[];
  valueFor: (date: string) => number; // 0..1
  weeks?: number;
  color?: string;
}) {
  const cols: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) cols.push(dates.slice(i, i + 7));
  const shown = cols.slice(-weeks);
  return (
    <div className="flex gap-[3px]">
      {shown.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]">
          {col.map((d) => {
            const v = Math.max(0, Math.min(1, valueFor(d)));
            return (
              <div
                key={d}
                className="size-[13px] rounded-[3px]"
                title={`${d}: ${Math.round(v * 100)}%`}
                style={{
                  background:
                    v > 0
                      ? `color-mix(in oklab, ${color} ${Math.round(30 + v * 70)}%, transparent)`
                      : "color-mix(in oklab, var(--color-foreground) 7%, transparent)",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card-soft flex-1 px-3 py-3">
      <div className="font-display text-xl font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press rounded-full border px-3 py-1.5 text-sm font-medium",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  physical: { label: "Physical", icon: "💪" },
  mental: { label: "Mental", icon: "🧠" },
  productivity: { label: "Productivity", icon: "⚡" },
  emotional: { label: "Emotional", icon: "🫀" },
  lifestyle: { label: "Lifestyle", icon: "🌿" },
  responsibility: { label: "Responsibility", icon: "🏠" },
};
