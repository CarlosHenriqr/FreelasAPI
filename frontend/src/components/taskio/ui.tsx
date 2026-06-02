import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/* ---------- Button ---------- */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98]",
        secondary: "border bg-surface text-foreground shadow-xs hover:bg-accent",
        ghost: "text-foreground hover:bg-accent",
        outline: "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
        danger: "bg-destructive text-destructive-foreground hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export function Btn({ className, variant, size, ...props }: BtnProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

/* ---------- Input ---------- */
export function Field({ label, hint, error, children, htmlFor, className }: { label?: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</label>}
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextInput({ className, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
      <input
        className={cn(
          "h-10 w-full rounded-md border border-input bg-surface px-3 text-sm shadow-xs outline-none transition-all placeholder:text-muted-foreground/70",
          "focus:border-ring focus:ring-2 focus:ring-ring/20",
          Icon && "pl-9",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[96px] w-full rounded-md border border-input bg-surface px-3 py-2.5 text-sm shadow-xs outline-none transition-all placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full appearance-none rounded-md border border-input bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222.5%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat px-3 pr-9 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/* ---------- Card ---------- */
export function Card({ className, children, as: As = "div" }: { className?: string; children: ReactNode; as?: keyof React.JSX.IntrinsicElements }) {
  const Component = As as React.ElementType;
  return <Component className={cn("rounded-xl border bg-card shadow-xs", className)}>{children}</Component>;
}

/* ---------- Badge ---------- */
const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", {
  variants: {
    tone: {
      neutral: "bg-muted text-muted-foreground",
      primary: "bg-primary/10 text-primary",
      success: "bg-success/12 text-success",
      warning: "bg-warning/15 text-[oklch(0.45_0.12_80)]",
      danger: "bg-destructive/10 text-destructive",
      info: "bg-info/12 text-info",
      outline: "border bg-transparent text-muted-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});
export function Badge({ tone, className, children }: VariantProps<typeof badgeVariants> & { className?: string; children: ReactNode }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

/* ---------- Stat ---------- */
export function StatCard({ label, value, delta, deltaTone = "success", icon: Icon, hint }: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "success" | "danger" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/8 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
        {delta && (
          <span className={cn(
            "text-xs font-semibold",
            deltaTone === "success" && "text-success",
            deltaTone === "danger" && "text-destructive",
            deltaTone === "neutral" && "text-muted-foreground"
          )}>{delta}</span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<{ className?: string }>; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-surface px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="h-5 w-5" /></div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Chip (for tech tags) ---------- */
export function Chip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-surface-muted px-2 py-1 text-xs font-medium text-foreground">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="text-muted-foreground hover:text-foreground" aria-label="Remover">×</button>
      )}
    </span>
  );
}
