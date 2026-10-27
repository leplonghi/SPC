# Plano de MVP - Ocultação e Foco de Recursos (SPC Maranhão)

Este documento define o plano de ação técnico para reduzir o escopo da aplicação no primeiro MVP, focando nos serviços ao cidadão, decretos estaduais e informações institucionais, ocultando seções inacabadas.

## Rotas Afetadas
- `/mapa` -> Redirecionada para Fallback (Em Atualização)
- `/acervo-digital` -> Redirecionada para Fallback (Em Atualização)
- `/acervo` -> Redirecionada para Fallback (Em Atualização)
- `/repositorio` -> Redirecionada para Fallback (Em Atualização)
- `/dphap` -> Redirecionada para Fallback (Em Atualização)
- `/dpi` -> Redirecionada para Fallback (Em Atualização)
- `/dpe` -> Redirecionada para Fallback (Em Atualização)

## Tarefas de Implementação

1. **[App.tsx](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/App.tsx)**:
   - Limitar os `navItems` aos focos: "A SPC", "Serviços" e "Legislação".
   - Limitar links do Rodapé.
   - Redirecionar rotas desativadas.

2. **[HomePage.tsx](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/pages/HomePage.tsx)**:
   - Remover botão de Mapa no Hero.
   - Atualizar Quick Menu de 4 colunas.
   - Ocultar seção de Frentes de Atuação Setoriais.
   - Ocultar seção de Denúncias.

3. **[LegislacaoPage.tsx](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/pages/LegislacaoPage.tsx)**:
   - Ajustar estado inicial para filtrar por `Decreto` por padrão.
   - Renomear o botão de filtro de "Decreto" para "Decretos Estaduais".

---

## ✅ PHASE X COMPLETE
- Lint: ⏳ Pending
- Security: ⏳ Pending
- Build: ⏳ Pending
- Date: 2026-08-25
