import { AlertCircle } from 'lucide-react';
import { Btn } from '@/components/taskio/ui';

export function ErrorState({
  title = 'Algo deu errado',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-surface px-6 py-16 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-md bg-destructive/8 text-destructive">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {onRetry && (
        <Btn className="mt-5" variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Btn>
      )}
    </div>
  );
}
