import { Link } from "react-router-dom";

export function Logo({ subtitle, className = "" }: { subtitle?: string; className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.35_0.2_268)] shadow-sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l4 4L19 6" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-tight">TASKIO</span>
        {subtitle && <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{subtitle}</span>}
      </div>
    </Link>
  );
}
