/**
 * Administrador total do portal.
 * Definido em 11/10/2026: por padrão, esta conta possui acesso administrativo total.
 * Valem as duas camadas: este arquivo (interface) e firestore.rules / storage.rules
 * (validação no servidor). Se trocar o e-mail para o ambiente institucional,
 * atualize também firestore.rules e storage.rules.
 */
const envSuperAdminEmail =
  typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPER_ADMIN_EMAIL
    ? (import.meta as any).env.VITE_SUPER_ADMIN_EMAIL
    : typeof process !== 'undefined' && process.env?.VITE_SUPER_ADMIN_EMAIL
      ? process.env.VITE_SUPER_ADMIN_EMAIL
      : undefined;

export const SUPER_ADMIN_EMAIL: string = envSuperAdminEmail || 'leplonghi@gmail.com';
