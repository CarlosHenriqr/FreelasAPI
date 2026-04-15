import sanitizeHtml from 'sanitize-html';

/**
 * Remove toda tag HTML de uma string.
 * Usado nos campos de texto livre antes de persistir no banco.
 */
export function sanitizeString(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}