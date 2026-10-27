import { BENS_TOMBADOS, DECRETOS_PDF, anoDoDecreto } from '../data/bensTombados';
import { PUBLIC_LEGAL_DOCUMENTS as L } from '../data/publicLegalDocuments';
import fs from 'fs';
import path from 'path';
/** Conferência dos números e arquivos publicados no portal. Uso: npx tsx scripts/validar-dados.ts */
const PUBLIC = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../public');
const B=BENS_TOMBADOS;
console.log('bens',B.length,'ids unicos',new Set(B.map(b=>b.id)).size);
const mun:Record<string,number>={}; B.forEach(b=>mun[b.municipio]=(mun[b.municipio]||0)+1);
console.log('municipios',Object.keys(mun).length,JSON.stringify(mun));
const anos:Record<string,number>={}; B.forEach(b=>{const a=anoDoDecreto(b);anos[String(a)]=(anos[String(a)]||0)+1}); console.log('anos',JSON.stringify(anos));
console.log('sem data decreto',B.filter(b=>!b.decreto.data).map(b=>b.id+':'+b.decreto.numero+'/'+b.decreto.ano).join(' '));
console.log('sem numero',B.filter(b=>!b.decreto.numero||/confirm/i.test(b.decreto.numero)).map(b=>b.id).join(' '));
console.log('livro datas min/max',B.map(b=>b.livro.data).filter(Boolean).sort()[0],B.map(b=>b.livro.data).filter(Boolean).sort().slice(-1)[0]);
console.log('decreto anos min/max',Math.min(...B.map(anoDoDecreto).filter(Boolean) as number[]),Math.max(...B.map(anoDoDecreto).filter(Boolean) as number[]));
const com=B.filter(b=>DECRETOS_PDF[b.decreto.numero]); console.log('bens com pdf',com.length,'decretos pdf distintos',Object.keys(DECRETOS_PDF).length);
for(const [k,v] of Object.entries(DECRETOS_PDF)) if(!fs.existsSync(''+PUBLIC+''+v.url)) console.log('PDF AUSENTE',k,v.url);
// consistencia numero vs ano
B.forEach(b=>{const n=b.decreto.numero; if(b.decreto.data&&b.decreto.ano&&Number(b.decreto.data.slice(0,4))!==b.decreto.ano) console.log('ano divergente',b.id)});
console.log('legal',L.length); const sc:Record<string,number>={}; L.forEach(d=>sc[d.scope]=(sc[d.scope]||0)+1); console.log(JSON.stringify(sc));
console.log('legal locais',L.filter(d=>d.sourceUrl.startsWith('/')).length);
L.forEach(d=>{ if(d.sourceUrl.startsWith('/') && !fs.existsSync(''+PUBLIC+''+d.sourceUrl)) console.log('LEGAL PDF AUSENTE',d.id,d.sourceUrl); if(!d.validationNote) console.log('sem validationNote',d.id); if(!d.officialPublication) console.log('sem officialPublication',d.id)});
L.forEach(d=>console.log(d.id,'|',d.date,'|',d.scope,'|',d.category,'|',d.sourceKind,'|',d.verifiedAt));
