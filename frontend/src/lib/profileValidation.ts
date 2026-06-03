const BIO_MIN_LENGTH = 10;

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhoneDigits(phone);
  return digits.length >= 10 && digits.length <= 11;
}

export function validateFreelancerProfile(
  bio: string,
  phone: string,
  techCount: number,
): string | null {
  const bioTrimmed = bio.trim();
  if (!bioTrimmed) return 'A bio é obrigatória.';
  if (bioTrimmed.length < BIO_MIN_LENGTH) {
    return `A bio deve ter pelo menos ${BIO_MIN_LENGTH} caracteres.`;
  }
  if (!isValidPhone(phone)) {
    return 'Informe um telefone válido (10 ou 11 dígitos).';
  }
  if (techCount < 1) {
    return 'Selecione ao menos uma tecnologia na stack.';
  }
  return null;
}
