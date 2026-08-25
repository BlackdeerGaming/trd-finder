import React from 'react';
import { LayoutGrid, List, Calendar, MapPin, Building, Building2, ExternalLink, BookmarkIcon, Bot, FileCheck, Target } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const ResultsView = () => {
  const { data, loading, isGridMode, setIsGridMode, isFavorite, toggleFavorite, setSelectedItem, searchMode } = useAppContext();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
         <span>Analizando convocatorias...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Oportunidades Encontradas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mostrando {data.length} resultados clasificados para {searchMode}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button 
            className="btn-icon" 
            style={{ background: isGridMode ? 'var(--bg-secondary)' : 'transparent', color: isGridMode ? 'var(--text-primary)' : 'var(--text-muted)' }}
            onClick={() => setIsGridMode(true)}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            className="btn-icon" 
            style={{ background: !isGridMode ? 'var(--bg-secondary)' : 'transparent', color: !isGridMode ? 'var(--text-primary)' : 'var(--text-muted)' }}
            onClick={() => setIsGridMode(false)}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          No se encontraron convocatorias que coincidan con los filtros y/o el perfil MPI.
        </div>
      ) : (
        <div className={`results-container ${isGridMode ? 'grid-mode' : ''}`} style={isGridMode ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        } : {
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {data.map(item => (
            <ResultCard 
              key={item.id} 
              item={item} 
              isGridMode={isGridMode}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onSelect={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ResultCard = ({ item, isGridMode, isFavorite, onToggleFavorite, onSelect }) => {
  const { searchMode } = useAppContext();
  
  const isMPIHighlight = searchMode === 'MPI LTDA' && item.afinidad_mpi === 'alta';
  const hasPdf = !!item.enlace_pdf;
  const isOfficial = !item.fuente.toLowerCase().includes('agrupador');

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: isGridMode ? 'column' : 'row',
      gap: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      borderColor: isMPIHighlight ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)',
    }}>
      {/* MPI Highlight Border */}
      {isMPIHighlight && <div className="mpi-highlight" />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: isMPIHighlight ? '0.5rem' : '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-status-${item.estado.replace(/ /g, '-').replace(/ó/g, 'o')}`}>{item.estado}</span>
            {searchMode === 'General' ? (
              <span className={`badge badge-relevance-${item.relevancia}`}>Relevancia {item.relevancia}</span>
            ) : (
              <span className={`badge badge-afinidad-${item.afinidad_mpi}`} style={{ background: item.afinidad_mpi === 'alta' ? '#FEF3C7' : 'var(--bg-tertiary)', color: item.afinidad_mpi === 'alta' ? '#D97706' : 'var(--text-secondary)' }}>
                 <Target size={12} style={{marginRight: '0.2rem'}} /> MPI {item.afinidad_mpi}
              </span>
            )}
            {hasPdf && <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-base)' }}>PDF Verificado</span>}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFavorite ? '#FBBF24' : 'var(--border-color)' }}
          >
            <BookmarkIcon fill={isFavorite ? '#FBBF24' : 'none'} strokeWidth={2.5} size={20} />
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
            {item.titulo}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: isGridMode ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.descripcion_resumida}
          </p>
        </div>

        <div className="card-meta-grid" style={{ display: 'grid', gridTemplateColumns: isGridMode ? '1fr' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Building2 size={14} />
            <span style={{ fontWeight: isOfficial ? 600 : 400 }}>{item.entidad}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <MapPin size={14} />
            <span>{item.ciudad}, {item.pais}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.estado === 'próxima a cerrar' ? 'var(--status-closing)' : 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Calendar size={14} />
            <span style={{fontWeight: item.estado === 'próxima a cerrar' ? 600 : 400}}>Cierre: {item.fecha_cierre}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isGridMode ? 'row' : 'column', gap: '0.5rem', justifyContent: 'flex-end', alignItems: isGridMode ? 'center' : 'stretch', borderTop: isGridMode ? '1px solid var(--border-color)' : 'none', paddingTop: isGridMode ? '1rem' : '0', borderLeft: !isGridMode ? '1px solid var(--border-color)' : 'none', paddingLeft: !isGridMode ? '1.5rem' : '0' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: isGridMode ? 0 : 'auto' }}>
          ${item.presupuesto.toLocaleString('es-CO')}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', width: isGridMode ? 'auto' : '100%', marginLeft: 'auto' }}>
          {hasPdf ? (
             <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={(e) => { e.stopPropagation(); window.open(item.enlace_pdf, '_blank'); }}>
                <FileCheck size={14} /> Ver PDF
             </button>
          ) : (
             <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={(e) => { e.stopPropagation(); window.open(item.enlace_convocatoria, '_blank'); }}>
                <ExternalLink size={14} /> Página
             </button>
          )}
          <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={onSelect}>
            Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
