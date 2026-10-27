/**
 * Administrador total do portal.
 * Definido pelo Eduardo em 11/10/2026: por enquanto, só esta conta tem acesso total.
 * Valem as duas camadas: este arquivo (apenas para a tela) e firestore.rules / storage.rules
 * (que de fato protegem os dados). Se trocar o e-mail aqui, troque também nas duas regras.
 */
export const SUPER_ADMIN_EMAIL = 'leplonghi@gmail.com';
