import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/* ---------- Button ---------- */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.97]",
        secondary: "border border-border bg-surface text-foreground hover:bg-accent hover:border-accent",
        ghost: "text-foreground hover:bg-muted",
        outline: "border border-primary/25 bg-primary/5 text-primary hover:bg-primary/10",
        danger: "bg-destructive text-destructive-foreground hover:brightness-110",
        link: "text-primary underline-offset-4 hover:underline font-medium",
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
export function Field({ label, hint, error, children, htmlFor, className, required }: { label?: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string; className?: string; required?: boolean }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground tracking-tight">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextInput({ className, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />}
      <input
        className={cn(
          "h-10 w-full rounded-md border border-input bg-surface px-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground/60",
          "focus:border-primary focus:ring-1 focus:ring-primary/20",
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
        "min-h-[96px] w-full rounded-md border border-input bg-surface px-3 py-2.5 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20",
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
        "h-10 w-full appearance-none rounded-md border border-input bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222.5%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:12px] bg-[position:right_0.75rem_center] bg-no-repeat px-3 pr-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20",
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
  return <Component className={cn("rounded-lg border bg-card", className)}>{children}</Component>;
}

/* ---------- Badge ---------- */
const badgeVariants = cva("inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider", {
  variants: {
    tone: {
      neutral: "bg-muted text-muted-foreground",
      primary: "bg-primary/8 text-primary",
      success: "bg-success/10 text-success",
      warning: "bg-warning/12 text-warning-foreground",
      danger: "bg-destructive/8 text-destructive",
      info: "bg-info/10 text-info",
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
    <Card className="p-5 transition-colors duration-150 hover:bg-surface-muted/50">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/6 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-3xl font-bold tracking-tighter">{value}</p>
        {delta && (
          <span className={cn(
            "font-mono text-[10px] font-medium",
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-surface px-6 py-16 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/6 text-primary"><Icon className="h-5 w-5" /></div>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Chip ---------- */
export function Chip({ children, onRemove }: { children: ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border bg-surface-muted px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Remover">&times;</button>
      )}
    </span>
  );
}
