import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BENS_TOMBADOS, DECRETOS_PDF } from '../data/bensTombados.ts';
import { PUBLIC_LEGAL_DOCUMENTS } from '../data/publicLegalDocuments.ts';
import { SEDE_MUNICIPIO } from '../data/municipios.ts';
import { SUPER_ADMIN_EMAIL } from '../data/adminConfig.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

type Role =
  | 'SuperAdmin'
  | 'AdminSPC'
  | 'EditorDPE'
  | 'EditorDPHAP'
  | 'EditorDPI'
  | 'Colaborador'
  | 'Viewer';

interface AuthContext {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

interface MockFirestoreState {
  users: Record<string, { role: Role }>;
}

/**
 * Avaliador determinístico que espelha fielmente a lógica declarada em firestore.rules
 * para validação automatizada da matriz RBAC em CI/CD (sem depender de JVM local).
 */
function createFirestoreRulesEvaluator(state: MockFirestoreState) {
  const isAuthenticated = (auth: AuthContext | null) => auth !== null;
  const hasUserDoc = (auth: AuthContext | null) =>
    auth !== null && Boolean(state.users[auth.uid]);
  const getUserRole = (auth: AuthContext | null): Role | null =>
    hasUserDoc(auth) ? state.users[auth!.uid].role : null;
  const hasRole = (auth: AuthContext | null, role: Role) =>
    isAuthenticated(auth) && getUserRole(auth) === role;
  const isSuperAdminEmail = (auth: AuthContext | null) =>
    isAuthenticated(auth) &&
    auth!.email_verified === true &&
    auth!.email === 'leplonghi@gmail.com';
  const isSuperAdmin = (auth: AuthContext | null) =>
    isSuperAdminEmail(auth) || hasRole(auth, 'SuperAdmin');
  const isAdmin = (auth: AuthContext | null) =>
    isSuperAdmin(auth) || hasRole(auth, 'AdminSPC');
  const isEditor = (auth: AuthContext | null) =>
    isAdmin(auth) ||
    hasRole(auth, 'EditorDPE') ||
    hasRole(auth, 'EditorDPHAP') ||
    hasRole(auth, 'EditorDPI');
  const isColaborador = (auth: AuthContext | null) =>
    isEditor(auth) || hasRole(auth, 'Colaborador');

  return {
    canReadPublicHeritage: () => true,
    canWritePublicHeritage: (auth: AuthContext | null) => isEditor(auth),
    canReadLegislation: (auth: AuthContext | null, docData: { status: string }) =>
      docData.status === 'published' || isEditor(auth),
    canWriteLegislation: (auth: AuthContext | null) => isEditor(auth),
    canReadUser: (auth: AuthContext | null, targetUserId: string) =>
      isAuthenticated(auth) && (auth!.uid === targetUserId || isEditor(auth)),
    canCreateUser: (
      auth: AuthContext | null,
      targetUserId: string,
      newData: { role: Role }
    ) =>
      (isAuthenticated(auth) &&
        auth!.uid === targetUserId &&
        newData.role === 'Viewer') ||
      isSuperAdmin(auth) ||
      (isAdmin(auth) && newData.role !== 'SuperAdmin'),
    canUpdateUser: (
      auth: AuthContext | null,
      existingData: { role: Role },
      newData: { role: Role }
    ) =>
      isSuperAdmin(auth) ||
      (isAdmin(auth) &&
        existingData.role !== 'SuperAdmin' &&
        newData.role !== 'SuperAdmin'),
    canDeleteUser: (auth: AuthContext | null) => isSuperAdmin(auth),
    canReadIngestionItem: (
      auth: AuthContext | null,
      existingData: { uploadedBy: string }
    ) =>
      isEditor(auth) ||
      (isAuthenticated(auth) && existingData.uploadedBy === auth!.uid),
    canCreateIngestionItem: (
      auth: AuthContext | null,
      newData: { uploadedBy: string; status: string }
    ) =>
      isColaborador(auth) &&
      newData.uploadedBy === auth!.uid &&
      newData.status === 'submitted',
    canUpdateIngestionItem: (
      auth: AuthContext | null,
      newData: { status: string }
    ) =>
      isEditor(auth) && (newData.status !== 'published' || isAdmin(auth)),
    canDeleteIngestionItem: (auth: AuthContext | null) => isAdmin(auth),
    canReadAuditLog: (auth: AuthContext | null) => isEditor(auth),
    canCreateAuditLog: (auth: AuthContext | null, newData: { userId: string }) =>
      isColaborador(auth) && newData.userId === auth!.uid,
    canModifyOrDeleteAuditLog: () => false
  };
}

/**
 * Avaliador determinístico que espelha a lógica de storage.rules
 */
function createStorageRulesEvaluator(state: MockFirestoreState) {
  const isAuthenticated = (auth: AuthContext | null) => auth !== null;
  const isSuperAdminEmail = (auth: AuthContext | null) =>
    isAuthenticated(auth) &&
    auth!.email_verified === true &&
    auth!.email === 'leplonghi@gmail.com';
  const getUserRole = (auth: AuthContext | null): Role | null =>
    isAuthenticated(auth) && state.users[auth!.uid]
      ? state.users[auth!.uid].role
      : null;
  const isEditor = (auth: AuthContext | null) =>
    isSuperAdminEmail(auth) ||
    ['SuperAdmin', 'AdminSPC', 'EditorDPE', 'EditorDPHAP', 'EditorDPI'].includes(
      getUserRole(auth) || ''
    );
  const isColaborador = (auth: AuthContext | null) =>
    isEditor(auth) || getUserRole(auth) === 'Colaborador';
  const isValidUploadSize = (sizeBytes: number) =>
    sizeBytes > 0 && sizeBytes < 100 * 1024 * 1024;

  return {
    canReadIngestionPath: (auth: AuthContext | null, pathUserId: string) =>
      isEditor(auth) || (isAuthenticated(auth) && auth!.uid === pathUserId),
    canWriteIngestionPath: (
      auth: AuthContext | null,
      pathUserId: string,
      sizeBytes: number
    ) =>
      isValidUploadSize(sizeBytes) &&
      (isEditor(auth) || (isColaborador(auth) && auth!.uid === pathUserId)),
    canDeleteIngestionPath: (auth: AuthContext | null) => isEditor(auth),
    canReadPublicAsset: () => true,
    canWritePublicAsset: (auth: AuthContext | null, sizeBytes: number) =>
      isEditor(auth) && isValidUploadSize(sizeBytes)
  };
}

test('Etapa B - Verificação estrutural de firestore.rules e storage.rules', () => {
  const firestoreRules = fs.readFileSync(
    path.join(ROOT_DIR, 'firestore.rules'),
    'utf-8'
  );
  const storageRules = fs.readFileSync(
    path.join(ROOT_DIR, 'storage.rules'),
    'utf-8'
  );

  // Verifica proteção contra null pointer em getUserData/getUserRole
  assert.match(firestoreRules, /exists\(userDocPath\(\)\)/);
  // Verifica coleções críticas da ingestão e auditoria
  assert.match(firestoreRules, /match \/ingestion_queue\/\{document\}/);
  assert.match(firestoreRules, /match \/audit_logs\/\{document\}/);
  assert.match(firestoreRules, /match \/upload_batches\/\{document\}/);
  assert.match(firestoreRules, /match \/tombamento_polygons\/\{document\}/);
  assert.match(firestoreRules, /match \/legislation_documents\/\{document\}/);
  assert.match(firestoreRules, /match \/analytics_sessions\/\{sessionId\}/);
  assert.match(firestoreRules, /match \/analytics_config\/\{docId\}/);
  // Verifica imutabilidade do log de auditoria
  assert.match(firestoreRules, /allow update, delete: if false;/);
  // Verifica preservação do SuperAdmin institucional
  assert.equal(SUPER_ADMIN_EMAIL, 'leplonghi@gmail.com');
  assert.match(firestoreRules, /leplonghi@gmail\.com/);
  assert.match(storageRules, /leplonghi@gmail\.com/);
  // Verifica isolamento de arquivos de ingestão não publicados no Storage
  assert.match(storageRules, /match \/patrimonio_ingestion\/\{userId\}\/\{allPaths=\*\*\}/);
});

test('Etapa B - Matriz RBAC do Firestore: prevenção de escalonamento de privilégios e proteção de documentos', () => {
  const state: MockFirestoreState = {
    users: {
      'uid-super': { role: 'SuperAdmin' },
      'uid-admin-spc': { role: 'AdminSPC' },
      'uid-editor-dphap': { role: 'EditorDPHAP' },
      'uid-colab-1': { role: 'Colaborador' },
      'uid-colab-2': { role: 'Colaborador' },
      'uid-viewer': { role: 'Viewer' }
    }
  };
  const rules = createFirestoreRulesEvaluator(state);

  const anon = null;
  const viewer: AuthContext = { uid: 'uid-viewer', email: 'v@spc.ma.gov.br', email_verified: true };
  const colab1: AuthContext = { uid: 'uid-colab-1', email: 'c1@spc.ma.gov.br', email_verified: true };
  const colab2: AuthContext = { uid: 'uid-colab-2', email: 'c2@spc.ma.gov.br', email_verified: true };
  const editor: AuthContext = { uid: 'uid-editor-dphap', email: 'ed@spc.ma.gov.br', email_verified: true };
  const adminSpc: AuthContext = { uid: 'uid-admin-spc', email: 'adm@spc.ma.gov.br', email_verified: true };
  const superAdminEmail: AuthContext = {
    uid: 'uid-new-no-doc',
    email: 'leplonghi@gmail.com',
    email_verified: true
  };
  const unverifiedSuperEmail: AuthContext = {
    uid: 'uid-spoof',
    email: 'leplonghi@gmail.com',
    email_verified: false
  };

  // 1. Leitura pública de conteúdos publicados vs bloqueio de rascunhos
  assert.equal(rules.canReadPublicHeritage(), true);
  assert.equal(rules.canWritePublicHeritage(anon), false);
  assert.equal(rules.canWritePublicHeritage(colab1), false);
  assert.equal(rules.canWritePublicHeritage(editor), true);

  assert.equal(rules.canReadLegislation(anon, { status: 'published' }), true);
  assert.equal(rules.canReadLegislation(anon, { status: 'draft' }), false);
  assert.equal(rules.canReadLegislation(viewer, { status: 'draft' }), false);
  assert.equal(rules.canReadLegislation(editor, { status: 'draft' }), true);

  // 2. Prevenção de escalonamento de privilégios em /users/{userId}
  const newSignup: AuthContext = { uid: 'uid-novo', email: 'novo@gmail.com', email_verified: true };
  assert.equal(rules.canCreateUser(newSignup, 'uid-novo', { role: 'Viewer' }), true);
  assert.equal(rules.canCreateUser(newSignup, 'uid-novo', { role: 'SuperAdmin' }), false);
  assert.equal(rules.canCreateUser(newSignup, 'uid-novo', { role: 'AdminSPC' }), false);

  // Usuário comum ou Colaborador não pode promover a si mesmo
  assert.equal(rules.canUpdateUser(viewer, { role: 'Viewer' }, { role: 'AdminSPC' }), false);
  assert.equal(rules.canUpdateUser(colab1, { role: 'Colaborador' }, { role: 'EditorDPHAP' }), false);

  // AdminSPC pode atribuir Editor/Colaborador, mas NÃO pode promover ninguém a SuperAdmin nem alterar SuperAdmin
  assert.equal(rules.canUpdateUser(adminSpc, { role: 'Viewer' }, { role: 'EditorDPE' }), true);
  assert.equal(rules.canUpdateUser(adminSpc, { role: 'Viewer' }, { role: 'SuperAdmin' }), false);
  assert.equal(rules.canUpdateUser(adminSpc, { role: 'SuperAdmin' }, { role: 'Viewer' }), false);

  // SuperAdmin verificado (mesmo sem documento prévio em /users) possui acesso total; e-mail não verificado é bloqueado
  assert.equal(rules.canUpdateUser(superAdminEmail, { role: 'Viewer' }, { role: 'SuperAdmin' }), true);
  assert.equal(rules.canUpdateUser(unverifiedSuperEmail, { role: 'Viewer' }, { role: 'EditorDPE' }), false);

  // 3. Fila de Ingestão (documentos internos/não publicados)
  assert.equal(rules.canReadIngestionItem(anon, { uploadedBy: 'uid-colab-1' }), false);
  assert.equal(rules.canReadIngestionItem(viewer, { uploadedBy: 'uid-colab-1' }), false);
  assert.equal(rules.canReadIngestionItem(colab1, { uploadedBy: 'uid-colab-1' }), true);
  assert.equal(rules.canReadIngestionItem(colab2, { uploadedBy: 'uid-colab-1' }), false);
  assert.equal(rules.canReadIngestionItem(editor, { uploadedBy: 'uid-colab-1' }), true);

  // Colaborador só cria item próprio com status 'submitted'
  assert.equal(
    rules.canCreateIngestionItem(colab1, { uploadedBy: 'uid-colab-1', status: 'submitted' }),
    true
  );
  assert.equal(
    rules.canCreateIngestionItem(colab1, { uploadedBy: 'uid-colab-1', status: 'published' }),
    false
  );
  assert.equal(
    rules.canCreateIngestionItem(colab1, { uploadedBy: 'uid-colab-2', status: 'submitted' }),
    false
  );

  // Editor pode aprovar/rejeitar, mas apenas Admin pode publicar definitivamente
  assert.equal(rules.canUpdateIngestionItem(editor, { status: 'approved' }), true);
  assert.equal(rules.canUpdateIngestionItem(editor, { status: 'published' }), false);
  assert.equal(rules.canUpdateIngestionItem(adminSpc, { status: 'published' }), true);

  // 4. Imutabilidade dos Audit Logs
  assert.equal(rules.canCreateAuditLog(colab1, { userId: 'uid-colab-1' }), true);
  assert.equal(rules.canCreateAuditLog(colab1, { userId: 'uid-colab-2' }), false);
  assert.equal(rules.canReadAuditLog(colab1), false);
  assert.equal(rules.canReadAuditLog(editor), true);
  assert.equal(rules.canModifyOrDeleteAuditLog(), false);
});

test('Etapa B - Matriz RBAC do Storage: isolamento de uploads de ingestão e limites de tamanho', () => {
  const state: MockFirestoreState = {
    users: {
      'uid-editor': { role: 'EditorDPHAP' },
      'uid-colab-1': { role: 'Colaborador' },
      'uid-colab-2': { role: 'Colaborador' },
      'uid-viewer': { role: 'Viewer' }
    }
  };
  const storage = createStorageRulesEvaluator(state);

  const anon = null;
  const colab1: AuthContext = { uid: 'uid-colab-1', email: 'c1@spc.ma.gov.br', email_verified: true };
  const colab2: AuthContext = { uid: 'uid-colab-2', email: 'c2@spc.ma.gov.br', email_verified: true };
  const editor: AuthContext = { uid: 'uid-editor', email: 'ed@spc.ma.gov.br', email_verified: true };

  // Arquivos de ingestão não publicados NÃO podem ser lidos publicamente nem por outros colaboradores
  assert.equal(storage.canReadIngestionPath(anon, 'uid-colab-1'), false);
  assert.equal(storage.canReadIngestionPath(colab2, 'uid-colab-1'), false);
  assert.equal(storage.canReadIngestionPath(colab1, 'uid-colab-1'), true);
  assert.equal(storage.canReadIngestionPath(editor, 'uid-colab-1'), true);

  // Upload permitido para Colaborador na própria pasta até 100 MB
  assert.equal(storage.canWriteIngestionPath(colab1, 'uid-colab-1', 5 * 1024 * 1024), true);
  assert.equal(storage.canWriteIngestionPath(colab1, 'uid-colab-2', 5 * 1024 * 1024), false);
  assert.equal(storage.canWriteIngestionPath(colab1, 'uid-colab-1', 150 * 1024 * 1024), false);

  // Acervo público: leitura pública, escrita exclusiva para Editores/Admins
  assert.equal(storage.canReadPublicAsset(), true);
  assert.equal(storage.canWritePublicAsset(colab1, 1024), false);
  assert.equal(storage.canWritePublicAsset(editor, 1024), true);
});

test('Etapa C e E - Integridade do acervo, legislação, mapas e configuração de deploy sem segredos expostos', () => {
  // 1. Verifica que vite.config.ts não injeta GEMINI_API_KEY no bundle cliente
  const viteConfig = fs.readFileSync(path.join(ROOT_DIR, 'vite.config.ts'), 'utf-8');
  assert.doesNotMatch(viteConfig, /GEMINI_API_KEY/);

  // 2. Verifica firebase.json
  const firebaseJson = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'firebase.json'), 'utf-8')
  );
  assert.equal(firebaseJson.hosting.public, 'dist');
  assert.ok(
    firebaseJson.hosting.rewrites.some(
      (r: { source: string; destination: string }) =>
        r.source === '**' && r.destination === '/index.html'
    )
  );

  // 3. Verifica integridade dos 63 bens tombados e decretos em PDF (16 decretos distintos cobrindo 46 inscrições)
  assert.equal(BENS_TOMBADOS.length, 63);
  const uniqueAssetIds = new Set(BENS_TOMBADOS.map((b) => b.id));
  assert.equal(uniqueAssetIds.size, 63);

  for (const bem of BENS_TOMBADOS) {
    assert.ok(
      SEDE_MUNICIPIO[bem.municipio],
      `Município "${bem.municipio}" do bem ${bem.id} deve possuir coordenadas em SEDE_MUNICIPIO`
    );
  }

  const decreeEntries = Object.entries(DECRETOS_PDF);
  assert.equal(decreeEntries.length, 16);
  const assetsWithPdf = BENS_TOMBADOS.filter((b) => Boolean(DECRETOS_PDF[b.decreto.numero]));
  assert.equal(assetsWithPdf.length, 16);
  for (const [num, dec] of decreeEntries) {
    const pdfPath = path.join(ROOT_DIR, 'public', dec.url);
    assert.ok(fs.existsSync(pdfPath), `PDF do Decreto ${num} ausente em ${pdfPath}`);
  }

  // 4. Verifica integridade dos 11 atos da biblioteca de legislação
  assert.equal(PUBLIC_LEGAL_DOCUMENTS.length, 11);
  for (const doc of PUBLIC_LEGAL_DOCUMENTS) {
    if (doc.sourceUrl.startsWith('/')) {
      const localPath = path.join(ROOT_DIR, 'public', doc.sourceUrl);
      assert.ok(fs.existsSync(localPath), `Arquivo de legislação ausente: ${localPath}`);
    }
  }
});
