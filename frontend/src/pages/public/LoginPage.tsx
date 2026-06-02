import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/taskio/Logo';
import { Btn, Field, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { mapApiErrors } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [type, setType] = useState<'user' | 'company'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFormError('');
    try {
      const path = await login({ email, password, type });
      toast.success('Login realizado com sucesso!');
      navigate(path);
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setFormError(message);
      setErrors(fields);
      toast.error(message);
    }
  };

  return (
    <PageTransition>
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col px-6 py-10 sm:px-12">
          <Logo />
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Bem-vindo de volta
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Entre na sua conta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use suas credenciais TASKIO para acessar o workspace.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <Field label="Tipo de conta">
                <div className="grid grid-cols-2 gap-2">
                  <Btn
                    type="button"
                    variant={type === 'user' ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => setType('user')}
                  >
                    <User className="h-4 w-4" /> Freelancer
                  </Btn>
                  <Btn
                    type="button"
                    variant={type === 'company' ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => setType('company')}
                  >
                    <Building2 className="h-4 w-4" /> Empresa
                  </Btn>
                </div>
              </Field>
              <Field label="E-mail" htmlFor="email" error={errors.email}>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Senha" htmlFor="senha" error={errors.password}>
                <TextInput
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Link
                  to="/recuperar-senha"
                  className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </Field>
              {formError && !Object.keys(errors).length && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <Btn type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'} <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Não possui uma conta?{' '}
              <Link
                to="/cadastro/freelancer"
                className="font-semibold text-primary hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 TASKIO · Plataforma segura e criptografada
          </p>
        </div>

        <div className="relative hidden overflow-hidden bg-[oklch(0.14_0.02_265)] lg:block">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(0.55_0.22_268/0.35),transparent_60%)]" />
          <div className="relative flex h-full flex-col justify-between p-12 text-[oklch(0.97_0.005_255)]">
            <div className="flex items-center gap-2 text-sm font-medium text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Sistema operacional ·
              uptime 99.99%
            </div>
            <div>
              <p className="font-display text-3xl font-semibold leading-snug">
                &quot;A TASKIO reduziu nosso tempo médio de contratação técnica de 6 semanas para 4
                dias.&quot;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-sm font-semibold">
                  MR
                </div>
                <div>
                  <p className="text-sm font-semibold">Marina Reis</p>
                  <p className="text-xs text-white/60">Head of Engineering · Nexo Financial</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { v: '12k+', l: 'freelancers' },
                { v: '1.8k', l: 'empresas' },
                { v: '48h', l: 'onboarding' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="font-display text-xl font-bold">{s.v}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/60">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
