import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../firebase';
import {
  IngestionItem,
  IngestionStatus,
  IngestionContentType,
  Department,
  AuditLog,
  UploadBatch
} from '../types';

// Coleções Firestore
const INGESTION_QUEUE_COL = 'ingestion_queue';
const AUDIT_LOGS_COL = 'audit_logs';
const UPLOAD_BATCHES_COL = 'upload_batches';

/**
 * Valida se um GeoJSON está no sistema de coordenadas WGS84 (EPSG:4326)
 * @param geoJsonText O conteúdo textual do GeoJSON
 */
export function validateGeoJsonWGS84(geoJsonText: string): { valid: boolean; error?: string } {
  try {
    const geojson = JSON.parse(geoJsonText);
    
    // Verificar se possui coordenadas
    if (!geojson || typeof geojson !== 'object') {
      return { valid: false, error: 'Formato JSON inválido.' };
    }

    let coordinatesToCheck: any[] = [];

    if (geojson.type === 'Point') {
      coordinatesToCheck.push(geojson.coordinates);
    } else if (geojson.type === 'LineString' || geojson.type === 'MultiPoint') {
      coordinatesToCheck.push(...geojson.coordinates);
    } else if (geojson.type === 'Polygon' || geojson.type === 'MultiLineString') {
      geojson.coordinates.forEach((ring: any) => coordinatesToCheck.push(...ring));
    } else if (geojson.type === 'MultiPolygon') {
      geojson.coordinates.forEach((poly: any) => {
        poly.forEach((ring: any) => coordinatesToCheck.push(...ring));
      });
    } else if (geojson.type === 'Feature') {
      return validateGeoJsonWGS84(JSON.stringify(geojson.geometry));
    } else if (geojson.type === 'FeatureCollection') {
      if (!Array.isArray(geojson.features)) {
        return { valid: false, error: 'FeatureCollection sem array de features.' };
      }
      for (const feature of geojson.features) {
        const res = validateGeoJsonWGS84(JSON.stringify(feature.geometry));
        if (!res.valid) return res;
      }
      return { valid: true };
    } else {
      return { valid: false, error: `Tipo de geometria não suportado: ${geojson.type}` };
    }

    if (coordinatesToCheck.length === 0) {
      return { valid: false, error: 'Nenhuma coordenada encontrada no arquivo.' };
    }

    // Verificar se as coordenadas estão nos limites de WGS84 / EPSG:4326 em graus decimais
    for (const coord of coordinatesToCheck) {
      if (!Array.isArray(coord) || coord.length < 2) {
        return { valid: false, error: 'Formato de coordenada inválido (esperado [lng, lat]).' };
      }
      const lng = coord[0];
      const lat = coord[1];
      
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        return { valid: false, error: 'As coordenadas devem ser numéricas.' };
      }

      // Limites em graus decimais para WGS84
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return { 
          valid: false, 
          error: `Coordenada fora dos limites WGS84/EPSG:4326: [${lng}, ${lat}]. Pode estar em UTM ou outro sistema métrico.` 
        };
      }
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: `Erro ao analisar arquivo geográfico: ${err.message}` };
  }
}

/**
 * Valida CSV para verificar se contém colunas de coordenadas válidas no sistema EPSG:4326
 */
export function validateCsvCoordinates(csvText: string): { valid: boolean; error?: string } {
  try {
    const lines = csvText.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { valid: false, error: 'Arquivo CSV vazio ou sem dados.' };
    }

    // Identificar separador comum
    const header = lines[0];
    const separator = header.includes(';') ? ';' : header.includes('\t') ? '\t' : ',';
    const columns = header.split(separator).map(c => c.trim().toLowerCase());

    const latIndex = columns.findIndex(c => ['lat', 'latitude', 'latitud', 'y'].includes(c));
    const lngIndex = columns.findIndex(c => ['lng', 'longitude', 'long', 'longitud', 'x'].includes(c));

    if (latIndex === -1 || lngIndex === -1) {
      return { valid: false, error: 'Colunas de latitude e longitude não encontradas no cabeçalho.' };
    }

    // Validar primeiras 10 linhas para ver se as coordenadas são válidas
    const rowsToTest = lines.slice(1, 11);
    for (let i = 0; i < rowsToTest.length; i++) {
      const rowParts = rowsToTest[i].split(separator);
      const lat = parseFloat(rowParts[latIndex]);
      const lng = parseFloat(rowParts[lngIndex]);

      if (isNaN(lat) || isNaN(lng)) {
        return { valid: false, error: `Linha ${i + 2}: Coordenada inválida ou ausente.` };
      }

      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return { 
          valid: false, 
          error: `Linha ${i + 2}: Coordenada fora do sistema decimal WGS84 [${lng}, ${lat}].` 
        };
      }
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: `Erro na leitura do CSV: ${err.message}` };
  }
}

export const ingestionService = {
  /**
   * Upload de arquivo para o Firebase Storage
   */
  async uploadFile(file: File, userId: string): Promise<{ url: string; path: string }> {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `patrimonio_ingestion/${userId}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return { url, path: storagePath };
  },

  /**
   * Registra um Log de Auditoria
   */
  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const logId = doc(collection(db, AUDIT_LOGS_COL)).id;
    const timestamp = new Date().toISOString();
    
    await setDoc(doc(db, AUDIT_LOGS_COL, logId), {
      ...log,
      id: logId,
      timestamp
    });
  },

  /**
   * Submete um item para a Fila de Ingestão
   */
  async submitIngestionItem(itemData: Omit<IngestionItem, 'id' | 'status' | 'uploadedAt' | 'auditTrail'>): Promise<string> {
    const itemDocRef = doc(collection(db, INGESTION_QUEUE_COL));
    const itemId = itemDocRef.id;
    const uploadedAt = new Date().toISOString();
    
    const initialAudit = {
      action: 'Envio Inicial',
      userId: itemData.uploadedBy,
      userName: itemData.uploadedByName,
      timestamp: uploadedAt,
      notes: 'Item enviado para a Central de Ingestão Patrimonial.'
    };

    const newItem: IngestionItem = {
      ...itemData,
      id: itemId,
      status: IngestionStatus.SUBMITTED,
      uploadedAt,
      auditTrail: [initialAudit]
    };

    await setDoc(itemDocRef, newItem);

    // Registra Log de Auditoria Geral
    await this.createAuditLog({
      action: 'INGEST_SUBMIT',
      entityType: 'ingestion_item',
      entityId: itemId,
      userId: itemData.uploadedBy,
      userName: itemData.uploadedByName,
      newData: newItem,
      notes: `Item "${itemData.title}" enviado por ${itemData.uploadedByName}.`
    });

    return itemId;
  },

  /**
   * Busca toda a Fila de Ingestão (com filtros)
   */
  async getIngestionQueue(filters?: {
    status?: IngestionStatus;
    department?: Department;
    suggestedModule?: string;
  }): Promise<IngestionItem[]> {
    let q = query(collection(db, INGESTION_QUEUE_COL));
    
    const constraints: any[] = [];
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.department) {
      constraints.push(where('department', '==', filters.department));
    }
    if (filters?.suggestedModule) {
      constraints.push(where('suggestedModule', '==', filters.suggestedModule));
    }
    
    constraints.push(orderBy('uploadedAt', 'desc'));
    
    try {
      const qWithConstraints = query(collection(db, INGESTION_QUEUE_COL), ...constraints);
      const querySnapshot = await getDocs(qWithConstraints);
      return querySnapshot.docs.map(doc => doc.data() as IngestionItem);
    } catch (e) {
      // Se der erro de índice no Firestore (comum com múltiplos wheres + orderBy), rodamos query simples e filtramos na memória
      const querySnapshot = await getDocs(q);
      let items = querySnapshot.docs.map(doc => doc.data() as IngestionItem);
      
      if (filters?.status) {
        items = items.filter(i => i.status === filters.status);
      }
      if (filters?.department) {
        items = items.filter(i => i.department === filters.department);
      }
      if (filters?.suggestedModule) {
        items = items.filter(i => i.suggestedModule === filters.suggestedModule);
      }
      
      return items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
  },

  /**
   * Busca os envios de um Colaborador específico
   */
  async getMySubmissions(userId: string): Promise<IngestionItem[]> {
    const q = query(
      collection(db, INGESTION_QUEUE_COL),
      where('uploadedBy', '==', userId),
      orderBy('uploadedAt', 'desc')
    );
    
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as IngestionItem);
    } catch (e) {
      // Fallback em caso de erro de índice
      const allSnapshot = await getDocs(collection(db, INGESTION_QUEUE_COL));
      return allSnapshot.docs
        .map(doc => doc.data() as IngestionItem)
        .filter(item => item.uploadedBy === userId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
  },

  /**
   * Atualiza o Status de um Item de Ingestão e adiciona histórico de auditoria
   */
  async updateIngestionStatus(
    itemId: string,
    newStatus: IngestionStatus,
    userId: string,
    userName: string,
    notes?: string,
    publishedDetails?: { collection: string; itemId: string }
  ): Promise<void> {
    const itemRef = doc(db, INGESTION_QUEUE_COL, itemId);
    const itemSnap = await getDoc(itemRef);
    if (!itemSnap.exists()) {
      throw new Error('Item de ingestão não encontrado.');
    }

    const previousItemData = itemSnap.data() as IngestionItem;
    const nowStr = new Date().toISOString();

    const auditEntry = {
      action: `Alteração de Status para: ${newStatus}`,
      userId,
      userName,
      timestamp: nowStr,
      notes: notes || `Alterado status de "${previousItemData.status}" para "${newStatus}".`
    };

    const updatePayload: any = {
      status: newStatus,
      reviewedBy: userId,
      reviewedAt: nowStr,
      auditTrail: arrayUnion(auditEntry)
    };

    if (notes) {
      updatePayload.reviewNotes = notes;
    }

    if (publishedDetails) {
      updatePayload.publishedCollection = publishedDetails.collection;
      updatePayload.publishedItemId = publishedDetails.itemId;
    }

    await updateDoc(itemRef, updatePayload);

    // Registra Log de Auditoria Geral
    await this.createAuditLog({
      action: 'INGEST_STATUS_CHANGE',
      entityType: 'ingestion_item',
      entityId: itemId,
      userId,
      userName,
      previousData: { status: previousItemData.status },
      newData: { status: newStatus, notes },
      notes: `Status do item "${previousItemData.title}" alterado para ${newStatus} por ${userName}.`
    });

    // Se aprovado ou publicado, podemos realizar a integração de publicação nas coleções finais
    if (newStatus === IngestionStatus.PUBLISHED && publishedDetails) {
      await this.publishToFinalCollection(previousItemData, publishedDetails.collection, publishedDetails.itemId);
    }
  },

  /**
   * Cria o registro correspondente na coleção pública final se aprovado
   */
  async publishToFinalCollection(item: IngestionItem, collectionName: string, targetId: string): Promise<void> {
    const docRef = doc(db, collectionName, targetId);
    
    // Mapear dados para a estrutura de destino com base no tipo de conteúdo
    const publishPayload: any = {
      id: targetId,
      name: item.title,
      description: item.description,
      department_responsible: item.department,
      declared_source: item.declaredSource,
      uploaded_by_name: item.uploadedByName,
      published_at: new Date().toISOString(),
      tags: item.tags,
      image_url: item.fileType.startsWith('image/') ? item.fileUrl : '',
      file_url: item.fileUrl,
      file_name: item.fileName,
      file_extension: item.fileExtension,
      municipality: item.municipality || '',
      rights: item.rights || '',
      author: item.author || ''
    };

    // Caso seja poligonal/mapa, adicionar geometria nos campos corretos
    if (item.suggestedModule === 'poligonal_mapa' || collectionName === 'tombamento_polygons') {
      try {
        // Tentar obter dados geográficos do metadata
        publishPayload.geometry = item.metadata || {};
        publishPayload.code = `POL-${targetId.substring(0,6).toUpperCase()}`;
      } catch (e) {
        console.error('Erro ao estruturar geometria do mapa:', e);
      }
    }

    await setDoc(docRef, publishPayload);
  },

  /**
   * Cria um batch de upload para rastrear uploads em lote
   */
  async createUploadBatch(batchName: string, userId: string, totalFiles: number): Promise<string> {
    const batchId = doc(collection(db, UPLOAD_BATCHES_COL)).id;
    const batch: UploadBatch = {
      id: batchId,
      batchName,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      totalFiles,
      processedFiles: 0,
      failedFiles: 0,
      status: 'pending'
    };
    await setDoc(doc(db, UPLOAD_BATCHES_COL, batchId), batch);
    return batchId;
  },

  /**
   * Incrementa arquivos processados em um lote
   */
  async incrementBatchProgress(batchId: string, success: boolean): Promise<void> {
    const batchRef = doc(db, UPLOAD_BATCHES_COL, batchId);
    const batchSnap = await getDoc(batchRef);
    if (!batchSnap.exists()) return;

    const data = batchSnap.data() as UploadBatch;
    const processed = data.processedFiles + 1;
    const failed = data.failedFiles + (success ? 0 : 1);
    const status = processed >= data.totalFiles ? 'completed' : 'processing';

    await updateDoc(batchRef, {
      processedFiles: processed,
      failedFiles: failed,
      status
    });
  }
};
