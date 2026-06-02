import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, IdCard, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AuthSplit } from '@/components/taskio/AuthSplit';
import { Btn, Card, Field, TextInput } from '@/components/taskio/ui';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import { mapApiErrors } from '@/lib/utils';

export function RegisterFreelancerPage() {
  const navigate = useNavigate();
  const { registerUser, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      toast.error('Aceite os termos para continuar.');
      return;
    }
    setErrors({});
    try {
      const path = await registerUser({ name, email, password, cpf, phone: phone || undefined });
      toast.success('Conta criada com sucesso!');
      navigate(path);
    } catch (err) {
      const { message, fields } = mapApiErrors(err);
      setErrors(fields);
      toast.error(message);
    }
  };

  return (
    <PageTransition>
      <AuthSplit
        title="Junte-se à TASKIO"
        subtitle="Monte um perfil técnico forte e receba projetos compatíveis com suas habilidades."
      >
        <Card className="p-7">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Crie sua conta de freelancer
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Monte um perfil técnico forte para receber projetos compatíveis.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Field label="Nome completo" error={errors.name}>
              <TextInput
                placeholder="Ex: João da Silva"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mail profissional" error={errors.email}>
                <TextInput
                  type="email"
                  placeholder="nome@email.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Telefone (WhatsApp)" error={errors.phone}>
                <TextInput
                  placeholder="(00) 00000-0000"
                  icon={Phone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CPF" error={errors.cpf}>
                <TextInput
                  placeholder="000.000.000-00"
                  icon={IdCard}
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </Field>
              <Field label="Senha segura" hint="Mínimo 8 caracteres" error={errors.password}>
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field>
            </div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring/40"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>
                Concordo com os{' '}
                <a className="font-medium text-primary hover:underline" href="#">
                  Termos
                </a>{' '}
                e{' '}
                <a className="font-medium text-primary hover:underline" href="#">
                  Política de Privacidade
                </a>{' '}
                da TASKIO.
              </span>
            </label>
            <Btn className="w-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Concluir registro'}{' '}
              <ArrowRight className="h-4 w-4" />
            </Btn>
          </form>
        </Card>
      </AuthSplit>
    </PageTransition>
  );
}
