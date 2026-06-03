import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth.api';
import { Logo } from '@/components/taskio/Logo';
import { Btn, Card, Field, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { mapApiErrors } from '@/lib/utils';

type Step = 'email' | 'code' | 'reset';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('Código enviado para seu e-mail.');
      setStep('code');
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const result = await authApi.verifyResetCode(email, code);
      if (!result.valid) {
        toast.error('Código inválido ou expirado.');
        return;
      }
      toast.success('Código verificado!');
      setStep('reset');
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        code,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      toast.success('Senha redefinida com sucesso!');
      navigate('/login');
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <Logo />
        <Card className="mt-8 w-full max-w-md p-7">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Recuperar senha</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {step === 'email' && 'Informe seu e-mail para receber o código de verificação.'}
            {step === 'code' && 'Digite o código enviado para seu e-mail.'}
            {step === 'reset' && 'Defina sua nova senha.'}
          </p>

          <div className="mt-6 flex gap-2">
            {(['email', 'code', 'reset'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  (step === 'email' && i === 0) ||
                  (step === 'code' && i <= 1) ||
                  (step === 'reset' && i <= 2)
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {step === 'email' && (
            <form className="mt-6 space-y-4" onSubmit={handleEmail}>
              <Field label="E-mail" error={errors.email}>
                <TextInput
                  type="email"
                  placeholder="seu@email.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Btn className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar código'} <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>
          )}

          {step === 'code' && (
            <form className="mt-6 space-y-4" onSubmit={handleVerify}>
              <Field label="Código de verificação" error={errors.code}>
                <TextInput
                  placeholder="000000"
                  icon={KeyRound}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </Field>
              <Btn className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar código'} <ArrowRight className="h-4 w-4" />
              </Btn>
              <button
                type="button"
                className="w-full text-center text-xs text-primary hover:underline"
                onClick={() => setStep('email')}
              >
                Reenviar código
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form className="mt-6 space-y-4" onSubmit={handleReset}>
              <Field label="Nova senha" error={errors.newPassword}>
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              <Field label="Confirmar senha" error={errors.confirmNewPassword}>
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
              <Btn className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Redefinir senha'} <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
