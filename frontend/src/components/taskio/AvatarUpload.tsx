import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Btn } from '@/components/taskio/ui';
import { validateAvatarFile } from '@/lib/api/upload';
import { getInitials, mapApiErrors } from '@/lib/utils';

type AvatarUploadProps = {
  name: string;
  avatarUrl?: string | null;
  onUpload: (file: File) => Promise<{ avatarUrl?: string | null }>;
  disabled?: boolean;
};

export function AvatarUpload({ name, avatarUrl, onUpload, disabled }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const displayUrl = preview ?? avatarUrl ?? null;

  const handleFile = async (file: File) => {
    const err = validateAvatarFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      await onUpload(file);
      toast.success('Avatar atualizado.');
    } catch (err) {
      setPreview(null);
      toast.error(mapApiErrors(err).message);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border bg-surface-muted">
        {displayUrl ? (
          <img src={displayUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-primary text-lg font-semibold text-primary-foreground">
            {getInitials(name)}
          </div>
        )}
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 grid place-items-center bg-foreground/40 opacity-0 transition-opacity hover:opacity-100 disabled:pointer-events-none"
          aria-label="Alterar foto"
        >
          <Camera className="h-5 w-5 text-white" />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium">Foto de perfil</p>
        <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP · máximo 2 MB</p>
        <Btn
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Enviando...' : 'Escolher imagem'}
        </Btn>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
