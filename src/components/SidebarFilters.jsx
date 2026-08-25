import React from 'react';
import { Filter, Star, FileText, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const SidebarFilters = () => {
  const {
    filters, setFilters, leadsFilters, setLeadsFilters, searchMode, activeTab,
    ciudadesColombia, ciudadesColombiaLeads, isMobileFiltersOpen, setIsMobileFiltersOpen
  } = useAppContext();

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleLeadsFilterChange = (field, value) => {
    setLeadsFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleFavoritosMode = () => {
    if (activeTab === 'convocatorias') {
      handleFilterChange('favoritos', !filters.favoritos);
    } else {
      handleLeadsFilterChange('favoritos', !leadsFilters.favoritos);
    }
  }

  const togglePdfMode = () => {
    handleFilterChange('solo_con_pdf', !filters.solo_con_pdf);
  }

  const toggleFuentesOficialesMode = () => {
    handleFilterChange('soloFuentesOficiales', !filters.soloFuentesOficiales);
  }

  return (
    <>
      {isMobileFiltersOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileFiltersOpen(false)} />
      )}
      <aside className={`sidebar-filters ${isMobileFiltersOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} color="var(--text-primary)" />
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Filtros Avanzados</h2>
        </div>
        <button className="btn-icon sidebar-close-btn" onClick={() => setIsMobileFiltersOpen(false)} title="Cerrar filtros">
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          className="btn" 
          style={{
            flex: activeTab === 'convocatorias' ? 1 : 'none', width: activeTab === 'leads' ? '100%' : 'auto',
            background: (activeTab === 'convocatorias' ? filters.favoritos : leadsFilters.favoritos) ? 'var(--relevance-mid)' : 'var(--bg-tertiary)',
            color: (activeTab === 'convocatorias' ? filters.favoritos : leadsFilters.favoritos) ? 'var(--relevance-mid-text)' : 'var(--text-primary)',
            border: `1px solid ${(activeTab === 'convocatorias' ? filters.favoritos : leadsFilters.favoritos) ? 'var(--relevance-mid-text)' : 'var(--border-color)'}`,
            padding: '0.5rem',
            fontSize: '0.85rem'
          }}
          onClick={toggleFavoritosMode}
        >
          <Star size={16} fill={(activeTab === 'convocatorias' ? filters.favoritos : leadsFilters.favoritos) ? 'var(--relevance-mid-text)' : 'none'} />
          Favoritos
        </button>

        {activeTab === 'convocatorias' && (
          <button 
            className="btn" 
            style={{
              flex: 1,
              background: filters.solo_con_pdf ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
              color: filters.solo_con_pdf ? 'var(--accent-base)' : 'var(--text-primary)',
              border: `1px solid ${filters.solo_con_pdf ? 'var(--accent-base)' : 'var(--border-color)'}`,
              padding: '0.5rem',
              fontSize: '0.85rem'
            }}
            onClick={togglePdfMode}
          >
            <FileText size={16} />
            Con PDF
          </button>
        )}
      </div>

      {activeTab === 'convocatorias' ? (
        <>
          {searchMode === 'MPI LTDA' && (
        <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
           <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>🌟 Afinidad con MPI LTDA</label>
           <select 
            className="input-field" 
            style={{background: 'var(--bg-secondary)'}}
            value={filters.afinidad_mpi} 
            onChange={e => handleFilterChange('afinidad_mpi', e.target.value)}
          >
            <option value="">Mostrar todo (Alta y Media)</option>
            <option value="alta">Solo Alta Afinidad</option>
            <option value="media">Solo Media Afinidad</option>
          </select>
        </div>
      )}

      {searchMode === 'General' && (
         <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Relevancia Documental</label>
          <select 
            className="input-field" 
            value={filters.nivelRelevancia} 
            onChange={e => handleFilterChange('nivelRelevancia', e.target.value)}
          >
            <option value="">Cualquier relevancia</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      )}

      <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>País</label>
        <select 
          className="input-field" 
          value={filters.pais} 
          onChange={e => handleFilterChange('pais', e.target.value)}
        >
          <option value="">Todos los países</option>
          <option value="Colombia">Colombia</option>
          <option value="México">México</option>
          <option value="Perú">Perú</option>
        </select>
      </div>

      <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Ciudad (Colombia)</label>
        <select
          className="input-field"
          value={filters.ciudad}
          onChange={e => handleFilterChange('ciudad', e.target.value)}
          disabled={ciudadesColombia.length === 0}
        >
          <option value="">Todas las ciudades</option>
          {ciudadesColombia.map(ciudad => (
            <option key={ciudad} value={ciudad}>{ciudad}</option>
          ))}
        </select>
      </div>

      <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Estado del Proceso</label>
        <select 
          className="input-field" 
          value={filters.estado} 
          onChange={e => handleFilterChange('estado', e.target.value)}
        >
          <option value="">Cualquier estado</option>
          <option value="abierta">Abierta</option>
          <option value="próxima a cerrar">Próxima a cerrar</option>
          <option value="cerrada">Cerrada</option>
        </select>
      </div>

      <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tipo de Oportunidad</label>
        <select 
          className="input-field" 
          value={filters.tipoOportunidad} 
          onChange={e => handleFilterChange('tipoOportunidad', e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="licitación">Licitación</option>
          <option value="concurso">Concurso</option>
          <option value="selección abreviada">Selección Abreviada</option>
          <option value="mínima cuantía">Mínima Cuantía</option>
          <option value="contratación directa">Contratación Directa</option>
          <option value="régimen especial">Régimen Especial</option>
          <option value="solicitud de información">Solicitud de Información</option>
          <option value="subasta">Subasta</option>
          <option value="enajenación de bienes">Enajenación de Bienes</option>
          <option value="otra modalidad">Otra Modalidad</option>
        </select>
      </div>

      <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tipo de Enlace</label>
        <select 
          className="input-field" 
          value={filters.tipo_enlace} 
          onChange={e => handleFilterChange('tipo_enlace', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="pagina_convocatoria">Página Convocatoria Exacta</option>
          <option value="pdf_descargable">PDF Descargable Oficial</option>
          <option value="pagina_proceso">Página General de Proceso</option>
        </select>
      </div>
        </>
      ) : (
        <>
          <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Nivel de Oportunidad</label>
            <select className="input-field" value={leadsFilters.nivel_oportunidad} onChange={e => handleLeadsFilterChange('nivel_oportunidad', e.target.value)}>
              <option value="">Todas</option>
              <option value="alto">Alto</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
            </select>
          </div>

          <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tipo de Entidad</label>
            <select className="input-field" value={leadsFilters.tipo_entidad} onChange={e => handleLeadsFilterChange('tipo_entidad', e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="Pública">Pública</option>
              <option value="Privada">Privada</option>
              <option value="Mixta">Mixta</option>
            </select>
          </div>

          <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>País</label>
            <select className="input-field" value={leadsFilters.pais} onChange={e => handleLeadsFilterChange('pais', e.target.value)}>
              <option value="">Todos los países</option>
              <option value="Colombia">Colombia</option>
              <option value="México">México</option>
              <option value="Perú">Perú</option>
            </select>
          </div>

          <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Ciudad (Colombia)</label>
            <select
              className="input-field"
              value={leadsFilters.ciudad}
              onChange={e => handleLeadsFilterChange('ciudad', e.target.value)}
              disabled={ciudadesColombiaLeads.length === 0}
            >
              <option value="">Todas las ciudades</option>
              {ciudadesColombiaLeads.map(ciudad => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Disponibilidad de Contacto</label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={leadsFilters.tiene_email} onChange={e => handleLeadsFilterChange('tiene_email', e.target.checked)} />
              Tiene Email
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={leadsFilters.tiene_telefono} onChange={e => handleLeadsFilterChange('tiene_telefono', e.target.checked)} />
              Tiene Teléfono
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <input type="checkbox" checked={leadsFilters.tiene_linkedin} onChange={e => handleLeadsFilterChange('tiene_linkedin', e.target.checked)} />
              Tiene LinkedIn
            </label>
          </div>
        </>
      )}
      
      <button 
        className="btn btn-outline" 
        style={{ marginTop: 'auto' }}
        onClick={() => {
          if (activeTab === 'convocatorias') {
            setFilters({
              ...filters, globalSearch: '', pais: '', ciudad: '', estado: '',
              tipoOportunidad: '', nivelRelevancia: '', afinidad_mpi: '',
              tipo_enlace: '',  favoritos: false, solo_con_pdf: false
            });
          } else {
            setLeadsFilters({
              ...leadsFilters, globalSearch: '', nombre_entidad: '', 
              tipo_entidad: '', sector: '', pais: '', ciudad: '', 
              nivel_oportunidad: '', posible_necesidad: '', tiene_email: false, 
              tiene_telefono: false, tiene_linkedin: false, favoritos: false
            });
          }
        }}
      >
        Limpiar Filtros
      </button>
      </aside>
    </>
  );
};
