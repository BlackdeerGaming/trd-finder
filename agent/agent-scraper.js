import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Agente Scraper MPI (Convocatorias Documentales)
// Fuente real: API SODA (Socrata) de Datos Abiertos Colombia - dataset "SECOP II - Procesos de Contratación"
// https://www.datos.gov.co/resource/p6dx-8zbt.json
// No requiere API key para uso liviano; se agrega un pequeño delay entre consultas por buena práctica.

const SECOP_ENDPOINT = 'https://www.datos.gov.co/resource/p6dx-8zbt.json';

// Términos de búsqueda con sus tokens de verificación local, etiquetas temáticas
// y peso de afinidad con el negocio de MPI LTDA (gestión documental, archivo, TRD, digitalización).
// "tokens" se usan para VERIFICAR localmente (contra título+descripción reales) que el resultado
// que trajo Socrata de verdad es relevante, en vez de confiar ciegamente en su ranking de texto libre.
const SEARCH_TERMS = [
  { q: 'tabla de retencion documental', tokens: ['tabla', 'retencion', 'documental'], tags: ['TRD', 'Tabla de Retención Documental'], weight: 3 },
  { q: 'gestion documental archivo', tokens: ['gestion', 'documental', 'archivo'], tags: ['Gestión Documental', 'Archivo'], weight: 3 },
  { q: 'digitalizacion de archivo', tokens: ['digitalizacion', 'archivo'], tags: ['Digitalización', 'Archivo'], weight: 3 },
  { q: 'organizacion de archivos', tokens: ['organizacion', 'archivo'], tags: ['Organización Documental'], weight: 2 },
  { q: 'custodia documental', tokens: ['custodia', 'documental'], tags: ['Custodia Documental'], weight: 2 },
  { q: 'foliacion de archivo', tokens: ['foliacion', 'archivo'], tags: ['Foliación', 'Archivo'], weight: 2 },
  { q: 'sistema de gestion documental SGDEA', tokens: ['sgdea'], tags: ['SGDEA', 'Software Documental'], weight: 1 },
  { q: 'inventario documental', tokens: ['inventario', 'documental'], tags: ['Inventario Documental'], weight: 1 },
];

// Consultas adicionales por modalidad de contratación, combinando un término núcleo con un filtro
// $where real sobre "modalidad_de_contratacion". Sin esto, el volumen de "Contratación directa"
// (miles de contratos pequeños de apoyo archivístico) satura los resultados y nunca aparecen
// licitaciones, concursos, selecciones abreviadas o mínimas cuantías reales relacionadas con el tema,
// dejando esos filtros de "Tipo de Oportunidad" siempre vacíos.
const MODALITY_DIVERSITY_QUERIES = [
  { where: "modalidad_de_contratacion like '%Licitaci%'" },
  { where: "modalidad_de_contratacion like '%Concurso%'" },
  { where: "modalidad_de_contratacion like '%Selecci%n Abreviada%'" },
  { where: "modalidad_de_contratacion like '%nima cuant%'" },
];
const DIVERSITY_CORE_QUERY = 'gestion documental archivo';

// Estados de "estado_del_procedimiento" que indican que el proceso ya está resuelto
// (contratista seleccionado/adjudicado o proceso terminado) y por lo tanto ya no acepta ofertas.
const RESOLVED_PROCESS_STATES = [
  'seleccionado',
  'adjudicado',
  'terminado',
  'cancelado',
  'liquidado',
  'fallido',
  'rechazado',
  'desierto',
  'revocado',
];

// Solo se conservan procesos publicados dentro de esta ventana (en días) para mantener resultados vigentes.
const MAX_AGE_DAYS = 545; // ~18 meses
const RESULTS_PER_TERM = 30;
const RESULTS_PER_DIVERSITY_QUERY = 15;
const MAX_CONVOCATORIAS = 100;
const MAX_LEADS = 20;
// Cuántas convocatorias de cada modalidad "especial" (no invitación) se garantizan en el resultado
// final. Sin esto, el enorme volumen de Contratación Directa reciente ("invitación") desplaza por
// fecha a las licitaciones/concursos/mínimas cuantías más antiguas y el filtro "Tipo de Oportunidad"
// queda vacío para esas categorías aunque sí existan procesos reales.
const MIN_PER_NON_INVITACION_TIPO = 8;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (s = '') =>
  s
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const toISODate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const parseMoney = (value) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const mapTipoOportunidad = (modalidad = '') => {
  const m = normalize(modalidad);
  if (m.includes('licitaci')) return 'licitación';
  if (m.includes('concurso')) return 'concurso';
  if (m.includes('seleccion') && m.includes('abreviada')) return 'selección abreviada';
  if (m.includes('minima cuant')) return 'mínima cuantía';
  return 'invitación';
};

// Verifica localmente, contra el título + descripción reales del proceso, qué términos de
// búsqueda realmente aplican. Actúa como red de seguridad de relevancia: un proceso que Socrata
// devolvió por coincidencia difusa (p. ej. porque menciona "archivo" en un campo secundario) pero
// cuyo texto visible no contiene ninguno de nuestros términos reales, se descarta más adelante.
const matchSearchTerms = (record) => {
  const text = normalize(`${record.nombre_del_procedimiento || ''} ${record.descripci_n_del_procedimiento || ''}`);
  return SEARCH_TERMS.filter((term) => term.tokens.every((tok) => text.includes(tok)));
};

// Estado real del proceso a partir de dos señales reales del dataset:
//  1) estado_del_procedimiento: si ya fue "Seleccionado"/"Adjudicado"/etc., el proceso está resuelto (cerrada).
//  2) Antigüedad de fecha_de_publicacion_del: en Contratación Directa (la modalidad más común aquí)
//     la ventana de recepción de ofertas es de días, no meses, así que procesos sin resolución
//     registrada pero publicados hace tiempo se consideran cerrados; recientes sin resolver -> abierta;
//     intermedios -> próxima a cerrar.
const inferEstado = (record) => {
  const estadoProc = normalize(record.estado_del_procedimiento || '');
  if (RESOLVED_PROCESS_STATES.some((s) => estadoProc.includes(s))) return 'cerrada';

  const pubDate = record.fecha_de_publicacion_del ? new Date(record.fecha_de_publicacion_del) : null;
  const ageDays =
    pubDate && !Number.isNaN(pubDate.getTime()) ? (Date.now() - pubDate.getTime()) / 86400000 : null;

  if (estadoProc.includes('evaluacion')) {
    return ageDays !== null && ageDays > 30 ? 'cerrada' : 'próxima a cerrar';
  }

  if (ageDays === null) return 'abierta';
  if (ageDays > 20) return 'cerrada';
  if (ageDays > 8) return 'próxima a cerrar';
  return 'abierta';
};

const inferSector = (entidad = '') => {
  const e = entidad.toLowerCase();
  if (/hospital|salud|clinica|clínica|e\.?s\.?e\.?/.test(e)) return 'Salud';
  if (/universidad|colegio|educaci|instituto educativo/.test(e)) return 'Educación';
  if (/alcald|municipio|gobernaci|distrito/.test(e)) return 'Gobierno Territorial';
  if (/polic|ejercito|ejército|fuerza|defensa/.test(e)) return 'Defensa y Seguridad';
  if (/ministerio|superintendencia|agencia nacional|unidad administrativa/.test(e)) return 'Gobierno Nacional';
  return 'Sector Público';
};

async function fetchSecop(params) {
  const url = `${SECOP_ENDPOINT}?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    console.warn(`   ! SECOP respondió ${res.status} para ${url}`);
    return [];
  }
  return res.json();
}

const fetchByTerm = (term) =>
  fetchSecop(
    new URLSearchParams({
      $q: term.q,
      $limit: String(RESULTS_PER_TERM),
      $order: 'fecha_de_publicacion_del DESC',
    })
  );

const fetchByModality = (diversityQuery) =>
  fetchSecop(
    new URLSearchParams({
      $q: DIVERSITY_CORE_QUERY,
      $where: diversityQuery.where,
      $limit: String(RESULTS_PER_DIVERSITY_QUERY),
      $order: 'fecha_de_publicacion_del DESC',
    })
  );

function buildConvocatoria(record, matchedTerms) {
  const tags = [...new Set(matchedTerms.flatMap((t) => t.tags))].slice(0, 5);
  const affinityScore = matchedTerms.reduce((sum, t) => sum + t.weight, 0);
  const nivel = affinityScore >= 5 ? 'alta' : affinityScore >= 2 ? 'media' : 'baja';

  const fechaPublicacion = toISODate(record.fecha_de_publicacion_del) || 'No definida';
  const fechaCierre =
    toISODate(record.fecha_de_recepcion_de) ||
    toISODate(record.fecha_de_apertura_de_respuesta) ||
    'No definida';

  const descripcionCompleta =
    record.descripci_n_del_procedimiento || record.nombre_del_procedimiento || 'Sin descripción disponible.';
  const descripcionResumida =
    descripcionCompleta.length > 220 ? `${descripcionCompleta.slice(0, 217)}...` : descripcionCompleta;

  const requisitos = [
    record.modalidad_de_contratacion ? `Modalidad de contratación: ${record.modalidad_de_contratacion}` : null,
    record.duracion && record.unidad_de_duracion
      ? `Duración estimada: ${record.duracion} ${record.unidad_de_duracion}`
      : null,
    record.codigo_principal_de_categoria ? `Categoría UNSPSC: ${record.codigo_principal_de_categoria}` : null,
  ].filter(Boolean);

  const entidad = record.entidad || 'Entidad no especificada';
  const ordenEntidad = record.ordenentidad ? ` (Orden ${record.ordenentidad})` : '';

  return {
    id: `secop-${record.id_del_proceso}`,
    titulo: record.nombre_del_procedimiento || 'Proceso de contratación sin título',
    nombre_convocatoria: record.referencia_del_proceso || record.id_del_proceso,
    entidad,
    empresa: `Sector Público${ordenEntidad}`,
    pais: 'Colombia',
    departamento:
      record.departamento_entidad && record.departamento_entidad !== 'No Definido'
        ? record.departamento_entidad
        : 'No especificado',
    ciudad: record.ciudad_entidad && record.ciudad_entidad !== 'No Definido' ? record.ciudad_entidad : 'No especificada',
    tipo_oportunidad: mapTipoOportunidad(record.modalidad_de_contratacion),
    descripcion_resumida: descripcionResumida,
    descripcion_completa: descripcionCompleta,
    fecha_publicacion: fechaPublicacion,
    fecha_cierre: fechaCierre,
    estado: inferEstado(record),
    presupuesto: parseMoney(record.precio_base),
    requisitos_principales: requisitos,
    // urlproceso apunta al detalle exacto del proceso (con noticeUID), por eso es "página convocatoria exacta"
    // y no una página genérica de contratación de la entidad.
    enlace_convocatoria: record.urlproceso?.url || null,
    enlace_pdf: null,
    tipo_enlace: 'pagina_convocatoria',
    fuente: 'SECOP II · Datos Abiertos Colombia',
    relevancia: nivel,
    afinidad_mpi: nivel,
    etiquetas: tags.length ? tags : ['Gestión Documental'],
    observaciones_agente: `Proceso identificado por coincidencia real con los términos de búsqueda: ${matchedTerms
      .map((t) => t.q)
      .join(', ')}. Publicado por ${entidad}.`,
  };
}

// Selecciona el conjunto final garantizando hasta `minPerTipo` resultados de cada modalidad
// no-invitación (licitación, concurso, selección abreviada, mínima cuantía) antes de llenar el resto
// de los cupos con todo lo demás ordenado por prioridad de estado y fecha. Así ninguna modalidad real
// queda invisible solo por ser menos frecuente que "invitación" (Contratación Directa).
function selectWithModalityQuota(convocatorias, comparator, max, minPerTipo) {
  const sorted = [...convocatorias].sort(comparator);

  const guaranteed = [];
  const tipoCounts = {};
  for (const c of sorted) {
    if (c.tipo_oportunidad === 'invitación') continue;
    tipoCounts[c.tipo_oportunidad] = (tipoCounts[c.tipo_oportunidad] || 0) + 1;
    if (tipoCounts[c.tipo_oportunidad] <= minPerTipo) guaranteed.push(c);
  }

  const guaranteedIds = new Set(guaranteed.map((c) => c.id));
  const rest = sorted.filter((c) => !guaranteedIds.has(c.id));

  return [...guaranteed, ...rest].slice(0, max).sort(comparator);
}

function buildLeads(convocatorias) {
  const byEntidad = new Map();
  for (const c of convocatorias) {
    if (!byEntidad.has(c.entidad)) byEntidad.set(c.entidad, []);
    byEntidad.get(c.entidad).push(c);
  }

  const leads = [...byEntidad.entries()]
    .map(([entidad, procesos]) => {
      const count = procesos.length;
      const nivel = count >= 3 ? 'alto' : count === 2 ? 'medio' : 'bajo';
      const tagCounts = {};
      for (const p of procesos) {
        for (const tag of p.etiquetas) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
      const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Gestión Documental';
      const masReciente = procesos
        .map((p) => p.fecha_publicacion)
        .filter((f) => f !== 'No definida')
        .sort()
        .reverse()[0];

      return {
        id: `lead-${entidad.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
        nombre_entidad: entidad,
        tipo_entidad: 'Pública',
        sector: inferSector(entidad),
        pais: 'Colombia',
        ciudad: procesos[0].ciudad,
        descripcion: `Entidad pública que ha publicado ${count} proceso${count === 1 ? '' : 's'} de contratación relacionado${
          count === 1 ? '' : 's'
        } con gestión documental, archivo o TRD en SECOP II.`,
        posible_necesidad: topTag,
        nivel_oportunidad: nivel,
        fuente_detectada: 'SECOP II · Datos Abiertos Colombia',
        pagina_web: null,
        email_contacto: null,
        telefono_contacto: null,
        linkedin_empresa: null,
        contacto_persona: null,
        cargo_contacto: null,
        observaciones_agente: `Detectada a partir de ${count} proceso${count === 1 ? '' : 's'} real${
          count === 1 ? '' : 'es'
        } de contratación pública relacionados con gestión documental/archivo. Última publicación detectada: ${
          masReciente || 'fecha no disponible'
        }. No se encontraron datos de contacto verificados; requiere investigación manual adicional.`,
      };
    })
    .sort((a, b) => {
      const score = { alto: 3, medio: 2, bajo: 1 };
      return score[b.nivel_oportunidad] - score[a.nivel_oportunidad];
    })
    .slice(0, MAX_LEADS);

  return leads;
}

const main = async () => {
  console.log('Iniciando Agente Scraper MPI (Convocatorias Documentales)...');
  console.log('   > Consultando SECOP II (Datos Abiertos Colombia) en tiempo real...');

  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  const rawById = new Map();

  for (const term of SEARCH_TERMS) {
    console.log(`   > Buscando: "${term.q}"...`);
    try {
      const records = await fetchByTerm(term);
      for (const record of records) {
        if (record.id_del_proceso) rawById.set(record.id_del_proceso, record);
      }
    } catch (err) {
      console.warn(`   ! Fallo la consulta para "${term.q}": ${err.message}`);
    }
    await sleep(300);
  }

  for (const dq of MODALITY_DIVERSITY_QUERIES) {
    console.log(`   > Buscando por modalidad: ${dq.where}...`);
    try {
      const records = await fetchByModality(dq);
      for (const record of records) {
        if (record.id_del_proceso) rawById.set(record.id_del_proceso, record);
      }
    } catch (err) {
      console.warn(`   ! Fallo la consulta por modalidad: ${err.message}`);
    }
    await sleep(300);
  }

  let convocatorias = [];
  for (const record of rawById.values()) {
    const pubDate = new Date(record.fecha_de_publicacion_del || 0).getTime();
    if (pubDate && pubDate < cutoff) continue;

    const matchedTerms = matchSearchTerms(record);
    if (matchedTerms.length === 0) continue; // red de seguridad: descarta falsos positivos del texto libre

    convocatorias.push(buildConvocatoria(record, matchedTerms));
  }

  const estadoPriority = { abierta: 3, 'próxima a cerrar': 2, cerrada: 1 };
  const byEstadoThenFecha = (a, b) => {
    const diff = (estadoPriority[b.estado] || 0) - (estadoPriority[a.estado] || 0);
    if (diff !== 0) return diff;
    return b.fecha_publicacion.localeCompare(a.fecha_publicacion);
  };

  convocatorias = selectWithModalityQuota(convocatorias, byEstadoThenFecha, MAX_CONVOCATORIAS, MIN_PER_NON_INVITACION_TIPO);

  const leads = buildLeads(convocatorias);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dataPath = path.join(__dirname, '..', 'data');
  const fileOut = path.join(dataPath, 'convocatorias.json');
  const leadsOut = path.join(dataPath, 'leads.json');

  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  if (convocatorias.length === 0) {
    console.warn('   ! No se encontraron convocatorias reales en esta ejecución. Se conservan los datos existentes.');
    return;
  }

  fs.writeFileSync(fileOut, JSON.stringify(convocatorias, null, 2), 'utf-8');
  fs.writeFileSync(leadsOut, JSON.stringify(leads, null, 2), 'utf-8');

  const estadoCounts = convocatorias.reduce((acc, c) => ((acc[c.estado] = (acc[c.estado] || 0) + 1), acc), {});
  const tipoCounts = convocatorias.reduce((acc, c) => ((acc[c.tipo_oportunidad] = (acc[c.tipo_oportunidad] || 0) + 1), acc), {});
  console.log(`✅ Extracción de Convocatorias: ${convocatorias.length} oportunidades reales guardadas en ${fileOut}`);
  console.log(`   > Por estado: ${JSON.stringify(estadoCounts)}`);
  console.log(`   > Por tipo de oportunidad: ${JSON.stringify(tipoCounts)}`);
  console.log(`✅ Generación de Leads OSE: ${leads.length} posibles clientes identificados y guardados en ${leadsOut}`);
};

main().catch((err) => {
  console.error('Error ejecutando el agente scraper:', err);
  process.exitCode = 1;
});
