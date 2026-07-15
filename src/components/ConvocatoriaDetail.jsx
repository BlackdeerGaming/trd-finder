import React from 'react';
import { X, ExternalLink, BookmarkIcon, Bot, Building2, MapPin, Calendar, FileText, CheckCircle2, Navigation, DollarSign, Target, FileCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const ConvocatoriaDetail = () => {
  const { selectedItem, setSelectedItem, isFavorite, toggleFavorite, searchMode } = useAppContext();

  if (!selectedItem) return null;

  const isMPIHighlight = searchMode === 'MPI LTDA' && selectedItem.afinidad_mpi === 'alta';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={() => setSelectedItem(null)}>
      <div 
        style={{
          width: '100%',
          maxWidth: '700px',
          background: 'var(--bg-primary)',
          height: '100%',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-color)',
          animation: 'slideIn 0.3s ease-out forwards'
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>
        
        {/* Header Modal */}
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
          {isMPIHighlight && <div className="mpi-highlight" />}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`badge badge-status-${selectedItem.estado.replace(/ /g, '-').replace(/ó/g, 'o')}`}>{selectedItem.estado}</span>
                {searchMode === 'MPI LTDA' && (
                  <span className={`badge badge-afinidad-${selectedItem.afinidad_mpi}`} style={{ background: selectedItem.afinidad_mpi === 'alta' ? '#FEF3C7' : 'var(--bg-tertiary)', color: selectedItem.afinidad_mpi === 'alta' ? '#D97706' : 'var(--text-secondary)' }}>
                     <Target size={12} style={{marginRight: '0.2rem'}} /> MPI Afinidad: {selectedItem.afinidad_mpi}
                  </span>
                )}
                {selectedItem.enlace_pdf && (
                  <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-base)' }}>PDF Oficial PDF</span>
                )}
             </div>
             <button className="btn-icon" onClick={() => setSelectedItem(null)}>
               <X size={24} />
             </button>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {selectedItem.titulo}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
            ID Proceso: {selectedItem.nombre_convocatoria || selectedItem.id}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {selectedItem.enlace_pdf && (
              <button className="btn btn-primary" onClick={() => window.open(selectedItem.enlace_pdf, '_blank')}>
                <FileCheck size={18} /> Descargar Pliego PDF
              </button>
            )}
            {selectedItem.enlace_convocatoria && selectedItem.enlace_convocatoria !== 'link_roto_o_generico_encontrado_en_google' && (
              <button className={selectedItem.enlace_pdf ? 'btn btn-outline' : 'btn btn-primary'} onClick={() => window.open(selectedItem.enlace_convocatoria, '_blank')}>
                 <ExternalLink size={18} /> Ver Página del Proceso
              </button>
            )}
            
            <button className="btn btn-outline" onClick={() => toggleFavorite(selectedItem.id)}>
              <BookmarkIcon fill={isFavorite(selectedItem.id) ? '#FBBF24' : 'none'} color={isFavorite(selectedItem.id) ? '#FBBF24' : 'currentColor'} size={18} /> 
              {isFavorite(selectedItem.id) ? 'Guardado' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Content Modal */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Smart Notes */}
          {selectedItem.observaciones_agente && (
            <div style={{ 
              background: 'var(--bg-secondary)',
              border: `1px solid ${isMPIHighlight ? 'rgba(245, 158, 11, 0.4)' : 'rgba(139, 92, 246, 0.2)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Bot size={24} color={isMPIHighlight ? '#F59E0B' : 'var(--status-process)'} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ color: isMPIHighlight ? '#D97706' : 'var(--status-process)', marginBottom: '0.5rem', fontSize: '1rem' }}>Análisis del Agente ({searchMode})</h4>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {selectedItem.observaciones_agente}
                </p>
              </div>
            </div>
          )}

          {/* Quick Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <InfoItem icon={<Building2 />} label="Entidad" value={selectedItem.entidad} />
            <InfoItem icon={<Building2 />} label="Empresa/Sector" value={selectedItem.empresa} />
            <InfoItem icon={<DollarSign />} label="Presupuesto Estimado" value={`$${selectedItem.presupuesto.toLocaleString('es-CO')}`} highlight />
            <InfoItem icon={<FileText />} label="Tipo de Oportunidad" value={selectedItem.tipo_oportunidad} style={{textTransform: 'capitalize'}} />
            <InfoItem icon={<Calendar />} label="Fecha Publicación" value={selectedItem.fecha_publicacion} />
            <InfoItem icon={<Calendar />} label="Fecha Cierre" value={selectedItem.fecha_cierre} />
            <InfoItem icon={<MapPin />} label="Ubicación" value={`${selectedItem.ciudad}, ${selectedItem.departamento} (${selectedItem.pais})`} />
            <InfoItem icon={<Navigation />} label="Fuente" value={selectedItem.fuente} />
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          {/* Detailed Desc */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Descripción Completa</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {selectedItem.descripcion_completa}
            </p>
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          {/* Requirements */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Requisitos Principales Identificados</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
              {selectedItem.requisitos_principales.map((req, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="var(--status-open)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ lineHeight: 1.5 }}>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Etiquetas Temáticas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {selectedItem.etiquetas.map(tag => (
                <span key={tag} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'var(--bg-tertiary)', borderRadius: '20px', color: 'var(--accent-hover)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, highlight }) => (
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
    <div style={{ color: 'var(--text-muted)' }}>{React.cloneElement(icon, { size: 20 })}</div>
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: highlight ? '1.1rem' : '0.9rem', color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: highlight ? 600 : 400, textTransform: label === 'Tipo de Oportunidad'? 'capitalize': 'none' }}>
        {value}
      </div>
    </div>
  </div>
);
