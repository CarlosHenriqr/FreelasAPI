import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Lock } from "lucide-react";
import { Logo } from "@/components/taskio/Logo";

export function AuthSplit({ children, title = "Junte-se à TASKIO", subtitle = "Acelere seus projetos com acesso direto a empresas e profissionais de excelência técnica." }: {
  children: ReactNode; title?: string; subtitle?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.2fr]">
      <div className="relative hidden overflow-hidden bg-[oklch(0.14_0.02_265)] text-white lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.55_0.22_268/0.4),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">{title}</h2>
            <p className="mt-4 max-w-md text-sm text-white/70">{subtitle}</p>
            <div className="mt-10 space-y-5">
              {[
                { icon: Sparkles, t: "Acesso a projetos premium", d: "Conecte-se com startups e enterprises buscando especialização real." },
                { icon: ShieldCheck, t: "Verificação técnica", d: "Cada perfil passa por validação via repositórios e provas práticas." },
                { icon: Lock, t: "Escrow nativo", d: "Pagamentos protegidos com liberação automática por milestone." },
              ].map((f) => (
                <div key={f.t} className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5"><f.icon className="h-4 w-4" /></div>
                  <div>
                    <p className="font-semibold">{f.t}</p>
                    <p className="text-sm text-white/60">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/40">Plataforma segura e criptografada · SOC 2 ready</p>
        </div>
      </div>
      <div className="flex flex-col bg-surface-muted px-4 py-8 sm:px-8">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
          {children}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
