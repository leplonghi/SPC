# Manual de Homologação, Segurança e Governança Institucional — Portal SPC/SECMA

Este documento consolida a arquitetura de ambientes, o manual de homologação no Firebase, o modelo de controle de acesso baseado em perfis (RBAC), o plano de governança para futura transferência à infraestrutura oficial do Governo do Estado do Maranhão (SECMA/ATI) e o checklist de liberação para produção.

---

## 1. Arquitetura de Ambientes (Etapa C)

O Portal da Superintendência do Patrimônio Cultural do Maranhão (SPC/SECMA) opera em três ambientes isolados:

| Ambiente | Finalidade | `VITE_APP_ENV` | Alvo de Build (`VITE_DEPLOY_TARGET`) | Hospedagem / Projeto Firebase |
| :--- | :--- | :--- | :--- | :--- |
| **Desenvolvimento Local** | Desenvolvimento, testes unitários e emuladores locais | `development` | `firebase` | `localhost:3001` / Firebase Emulators (`5000`, `8080`, `9099`, `9199`) |
| **Homologação (Staging)** | Validação funcional, curadoria técnica e revisão institucional | `homologation` | `firebase` | Firebase Hosting (`spc-maranhao-2025-v1` / canal `homologacao` ou Preview Channels de PR) |
| **Produção Institucional (Futura)** | Portal público oficial sob domínio governamental (`*.ma.gov.br`) | `production` | `firebase` (ou `cloudflare`) | Projeto Firebase institucional dedicado da SECMA/ATI |

### Isolamento entre Firebase Hosting e Cloudflare Workers
- O arquivo `vite.config.ts` foi estruturado para que o comando padrão `npm run build` (e `npm run build:firebase`) gere os artefatos estáticos diretamente em `dist/` (`dist/index.html` e `dist/assets/*`), compatível nativamente com o `firebase.json` (`"public": "dist"`).
- Os plugins `@cloudflare/vite-plugin` e `@openai/sites-vite-plugin` permanecem preservados e isolados, sendo carregados apenas quando executado `npm run build:cloudflare` (`VITE_DEPLOY_TARGET=cloudflare`).

---

## 2. Manual de Configuração do Firebase de Homologação (Entregável 7)

### 2.1. Pré-requisitos
1. Node.js `22.x` e `npm` instalados.
2. Firebase CLI instalado (`npm install -g firebase-tools`).
3. Acesso autenticado ao projeto de homologação (`spc-maranhao-2025-v1`).

### 2.2. Configuração de Variáveis Locais
1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Preencha as variáveis `VITE_FIREBASE_*` com as credenciais públicas do SDK Web do projeto de homologação.
3. **Importante:** Nunca insira chaves privadas de Service Account ou chaves de API de IA (`GEMINI_API_KEY`) em variáveis `VITE_*`.

### 2.3. Configuração de Segredos no GitHub Actions (CI/CD)
No repositório GitHub (`Settings > Secrets and variables > Actions`), configure:

1. **Environment `homologacao`**:
   - Crie o ambiente `homologacao` em `Settings > Environments`.
   - Ative **Required reviewers** (ex.: conta administrativa responsável pela homologação) para exigir aprovação manual antes de qualquer deploy em homologação.
2. **Autenticação de Deploy (escolha uma das opções abaixo)**:
   - **Opção A — Identidade Federada (Workload Identity Federation - Recomendada):**
     - `GCP_WORKLOAD_IDENTITY_PROVIDER`: identificador completo do provedor OIDC no Google Cloud IAM.
     - `GCP_SERVICE_ACCOUNT`: e-mail da Service Account com papéis mínimos (`Firebase Hosting Admin` e `Cloud Datastore Viewer`).
   - **Opção B — Credencial de Serviço (GitHub Secret):**
     - `FIREBASE_SERVICE_ACCOUNT_HOMOLOGACAO`: JSON da Service Account restrita ao escopo do Firebase Hosting do projeto de homologação.
3. **Variáveis opcionais de SDK (`Secrets` ou `Variables`)**:
   - `VITE_FIREBASE_PROJECT_ID` (padrão: `spc-maranhao-2025-v1`)
   - `VITE_SUPER_ADMIN_EMAIL` (padrão: `leplonghi@gmail.com`)

### 2.4. Publicação Manual de Regras (Somente com Autorização Expressa)
Para atualizar as regras de segurança no ambiente de homologação após revisão:
```bash
firebase use homologacao
firebase deploy --only firestore:rules,storage
```

---

## 3. Instruções para Adição Futura do Domínio Institucional (Entregável 8)

Quando a Secretaria de Estado da Cultura (SECMA) e a Agência Estadual de Tecnologia da Informação (ATI/MA) definirem o subdomínio oficial (ex.: `patrimonio.cultura.ma.gov.br` ou `spc.ma.gov.br`):

1. **No Console do Firebase (Projeto Institucional):**
   - Acesse **Hosting > Adicionar domínio personalizado**.
   - Informe o domínio institucional (`spc.ma.gov.br` ou `patrimonio.cultura.ma.gov.br`).
2. **Na Zona DNS Governamental (`ma.gov.br` — gerida pela ATI/MA):**
   - Adicione o registro `TXT` de verificação de propriedade fornecido pelo Firebase Hosting.
   - Adicione os registros `A` (ou `CNAME`) apontando para os IPs de borda do Firebase Hosting.
3. **Provisionamento TLS/SSL:**
   - Aguarde a emissão automática do certificado SSL gerenciado pelo Google Trust Services (Let's Encrypt) com renovação automática e HTTP Strict Transport Security (HSTS).
4. **Autorização de Domínio no Firebase Authentication:**
   - Em **Authentication > Settings > Authorized domains**, adicione o novo domínio `*.ma.gov.br` para que o fluxo OAuth (Google Sign-In) funcione sem bloqueio de origem.
5. **Restrição da API Key no Google Cloud Console:**
   - Em **APIs & Services > Credentials**, edite a `Browser key` do Firebase e adicione restrição de **HTTP Referrers**:
     - `https://spc-maranhao-2025-v1.web.app/*`
     - `https://spc-maranhao-2025-v1.firebaseapp.com/*`
     - `https://*.cultura.ma.gov.br/*`

---

## 4. Governança Institucional e Transferência de Gestão (Etapa F)

### 4.1. Titularidade dos Serviços
- Atualmente, o ambiente de preparação/homologação (`spc-maranhao-2025-v1`) está sob custódia técnica de preparação (`leplonghi@gmail.com`).
- **Não foi realizada transferência de titularidade nesta etapa**, conforme restrição expressa.
- Para a transferência oficial à SECMA/ATI:
  1. Designar uma conta institucional oficial (ex.: `ti.spc@cultura.ma.gov.br` ou grupo gerenciado no Google Cloud Organization do Estado).
  2. Adicionar a conta institucional como `Owner` no Google Cloud IAM / Firebase Console.
  3. Atualizar `VITE_SUPER_ADMIN_EMAIL` em `data/adminConfig.ts`, `firestore.rules` e `storage.rules` em commit auditado.
  4. Rebaixar contas individuais de desenvolvimento para papéis de menor privilégio ou removê-las após o termo de aceite definitivo.

### 4.2. Administração do Firebase e Controle de Acessos (RBAC)
O sistema implementa controle de acesso em **dupla camada** (Interface React + Regras `firestore.rules` e `storage.rules` no servidor):

| Perfil (`UserRole`) | Escopo de Acesso na Interface | Permissões Efetivas (`firestore.rules` e `storage.rules`) |
| :--- | :--- | :--- |
| `SuperAdmin` | Acesso total (`/admin`, `/ingestao`, gestão de todos os perfis) | Leitura e escrita total; único perfil autorizado a atribuir ou remover `SuperAdmin` e excluir usuários. |
| `AdminSPC` | Painel `/admin` e `/ingestao`, publicação final e gestão de perfis departamentais | Gerencia usuários exceto `SuperAdmin`; aprova e publica definitivamente itens da fila de ingestão (`status == 'published'`). |
| `EditorDPHAP` / `EditorDPE` / `EditorDPI` | Painel `/admin` (módulos técnicos) e `/ingestao` (fila de revisão) | Cria/edita bens patrimoniais, áreas, legislação e revisa submissões na `ingestion_queue` (exceto promoção a `SuperAdmin`). |
| `Colaborador` | Exclusivo à Central de Ingestão (`/ingestao` — envio e acompanhamento dos próprios itens) | Cria submissões próprias (`status == 'submitted'`), grava arquivos apenas em `/patrimonio_ingestion/{uid}/**` (até 100 MB) e lê apenas seus próprios envios. Bloqueado em `/admin`. |
| `Viewer` / Visitante | Navegação pública do portal | Leitura pública apenas de acervos, bens tombados e legislação com `status == 'published'`. Sem acesso a `ingestion_queue`, `audit_logs` ou arquivos em revisão. |

### 4.3. Política de Backup e Retenção
1. **Acervo Estático Versionado (Git):**
   - Os 63 registros verificados do Livro de Tombo (`data/bensTombados.ts`), os 16 decretos digitalizados e os 11 atos normativos (`data/publicLegalDocuments.ts`) em `public/documentos/` possuem versionamento integral em Git, permitindo restauração imediata a qualquer ponto no tempo.
2. **Cloud Firestore (PITR e Exportação Agendada):**
   - Habilitar **Point-in-Time Recovery (PITR)** no Firestore (retenção de 7 dias para recuperação granular).
   - Configurar rotina semanal via Cloud Scheduler + Cloud Functions/Run para exportar `heritage_assets`, `legislation`, `ingestion_queue`, `users` e `audit_logs` para bucket Google Cloud Storage de retenção fria (`Archive Storage`).
3. **Firebase Storage:**
   - Habilitar **Object Versioning** no bucket do Storage para impedir perda acidental por sobrescrita de arquivos submetidos.

### 4.4. Recuperação de Incidentes
- **Rollback de Hospedagem:** O Firebase Hosting mantém histórico imutável de releases. Em caso de regressão visual ou funcional, o rollback para a versão anterior leva menos de 30 segundos via console ou `firebase hosting:clone`.
- **Auditoria Forense:** A coleção `audit_logs` possui regra estrita `allow update, delete: if false;` em `firestore.rules` (append-only), garantindo que nenhum usuário — nem mesmo administradores — possa apagar ou adulterar registros de quem enviou, revisou ou publicou documentos pelo aplicativo cliente.
- **Comprometimento de Conta:** Revogar imediatamente os refresh tokens do usuário no Firebase Authentication Console e alterar o `role` em `/users/{uid}` para `Viewer`.

### 4.5. Fluxo Editorial e Publicação de Conteúdo
1. **Submissão (`submitted`):** Realizada por `Colaborador` ou `Editor` na Central de Ingestão (`/ingestao`), exigindo título, resumo, departamento responsável (`DPHAP`, `DPI`, `DPE`), fonte declarada e aceite de responsabilidade. O arquivo é salvo em caminho isolado (`/patrimonio_ingestion/{uid}/...`) sem leitura pública.
2. **Revisão Técnica (`in_review` / `needs_correction` / `approved` / `rejected`):** Realizada por `Editor` do respectivo departamento ou `AdminSPC`.
3. **Publicação (`published`):** Ação exclusiva de `AdminSPC` ou `SuperAdmin`, que copia os metadados validados para a coleção pública final (`heritage_assets`, `tombamento_polygons` ou `legislation_documents` com `status: 'published'`).

### 4.6. Tratamento de Dados Pessoais e Conformidade com a LGPD (Lei nº 13.709/2018)
- **Proteção de Proprietários de Imóveis Tombados:** Conforme diretriz curatorial documentada em `data/bensTombados.ts`, nomes de proprietários privados de imóveis tombados **não são publicados** no portal público.
- **Denúncias e Solicitações (`DenunciaPage.tsx`, `ServicosPage.tsx`):** As orientações ao cidadão direcionam o protocolo formal para os canais institucionais oficiais (`spc.cultura@ma.gov.br` e atendimento presencial no Edifício Clodomir Milet), evitando coleta desnecessária de dados pessoais sensíveis em banco público.
- **Autenticação Administrativa:** Armazena apenas `uid`, nome institucional, departamento e perfil funcional (`role`) na coleção `/users`, com leitura restrita ao próprio titular e à equipe de curadoria/administração.

### 4.7. Processo de Atualização e Manutenção Contínua
1. Criar branch temática a partir de `main`.
2. Executar localmente:
   - `npm run typecheck` (validação estática TypeScript sem erros).
   - `npm test` (suíte automatizada de regras RBAC, integridade de dados e PDFs).
   - `npm run build` (verificação de geração limpa em `dist/`).
3. Abrir Pull Request para `main`. O workflow `.github/workflows/firebase-homologacao.yml` executará todas as validações e gerará o Preview Channel para homologação.
4. Somente após aprovação técnica e curatorial, realizar o merge e acionar o deploy controlado.

---

## 5. Checklist de Liberação para Produção (Entregável 9)

Antes de promover qualquer versão do ambiente de homologação para o ambiente de produção institucional, todos os itens abaixo devem estar marcados e evidenciados:

- [ ] **1. Compilação e Tipagem:** `npm run typecheck` e `npm run build` executados com código de saída `0`.
- [ ] **2. Testes Automatizados:** `npm test` com 100% dos testes de regras RBAC (`firestore.rules` e `storage.rules`) e integridade documental aprovados.
- [ ] **3. Auditoria de Segredos:** Confirmado que o bundle em `dist/assets/*.js` não contém chaves privadas (`GEMINI_API_KEY`, tokens de serviço ou credenciais de administração).
- [ ] **4. Regras do Firebase Publicadas:** `firestore.rules` e `storage.rules` sincronizadas no projeto alvo antes da abertura do tráfego público.
- [ ] **5. Restrição de API Key no GCP:** Chave pública do Firebase restrita por *HTTP Referrer* apenas aos domínios oficiais do portal.
- [ ] **6. Validação de Rotas e Assets:** Todos os 16 decretos de tombamento em PDF e os 6 PDFs locais da biblioteca de legislação respondendo com HTTP `200 OK` e cabeçalhos `X-Content-Type-Options: nosniff`.
- [ ] **7. Validação de Perfis (RBAC):** Testado login com conta `SuperAdmin`, `Editor` e `Colaborador`, confirmando que `Colaborador` não acessa `/admin` e que visitantes anônimos não leem `ingestion_queue` nem `/patrimonio_ingestion/**`.
- [ ] **8. Acessibilidade e Responsividade:** Verificados alto contraste, widget VLibras, navegação por teclado (`Ir para o conteúdo`), mapa dos municípios e menu Origami 3D em desktop e dispositivos móveis.
- [ ] **9. Backup Prévio:** Exportação manual do Firestore realizada antes da janela de publicação.
- [ ] **10. Aprovação Institucional:** Autorização formal registrada pelo responsável da SPC/SECMA no Pull Request e no ambiente do GitHub Actions.
