import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/taskio/Logo';
import { LoginTestimonialsPanel } from '@/components/taskio/LoginTestimonialsPanel';
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
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
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
                  className="mt-1 inline-block text-xs font-medium text-primary link-underline"
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
                className="font-semibold text-primary link-underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            &copy; 2026 TASKIO &middot; Plataforma segura e criptografada
          </p>
        </div>

        <LoginTestimonialsPanel />
      </div>
    </PageTransition>
  );
}
