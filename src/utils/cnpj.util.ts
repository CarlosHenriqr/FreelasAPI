/**
 * Validação local de CNPJ (algoritmo de dígitos verificadores).
 * A consulta externa à API cnpj.ws é feita no service para verificar
 * se o CNPJ é real e está ativo na Receita Federal.
 */
export function isValidCNPJ(raw: string): boolean {
  const cnpj = raw.replace(/\D/g, '');

  if (cnpj.length !== 14) return false;

  // Rejeita sequências triviais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Cálculo do 1º dígito verificador
  const calc = (cnpj: string, length: number): number => {
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(cnpj[length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result;
  };

  if (calc(cnpj, 12) !== parseInt(cnpj[12])) return false;
  if (calc(cnpj, 13) !== parseInt(cnpj[13])) return false;

  return true;
}

/** Normaliza CNPJ removendo pontos, barras e traço */
export function normalizeCNPJ(raw: string): string {
  return raw.replace(/\D/g, '');
}

// ─── Consulta externa: cnpj.ws ────────────────────────────────────────────────

export type CnpjWsResponse = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string; // "ATIVA" | "BAIXADA" | "INAPTA" | ...
  descricao_situacao_cadastral: string;
};

/**
 * Consulta o CNPJ na API pública cnpj.ws.
 * Retorna null em caso de erro (CNPJ inexistente ou falha de rede).
 *
 * Use apenas no registro de empresa — não bloqueie o fluxo se a API
 * estiver fora do ar; faça log e permita o registro com revisão manual.
 */
export async function fetchCnpjInfo(cnpj: string): Promise<CnpjWsResponse | null> {
  const normalized = normalizeCNPJ(cnpj);
  try {
    const response = await fetch(`https://publica.cnpj.ws/cnpj/${normalized}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) return null;

    const data = (await response.json()) as CnpjWsResponse;
    return data;
  } catch {
    return null;
  }
}