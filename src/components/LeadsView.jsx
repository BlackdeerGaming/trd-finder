import React from 'react';
import { LayoutGrid, List, MapPin, Building2, BookmarkIcon, Mail, Phone, Link2, ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const LeadsView = () => {
  const { leadsData, loading, isGridMode, setIsGridMode, isFavoriteLead, toggleFavoriteLead, setSelectedLead, leadsSortOrder, setLeadsSortOrder } = useAppContext();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
         <span>Analizando clientes potenciales...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Clientes Potenciales OSE</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mostrando {leadsData.length} leads detectados</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Order Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ordenar por:</span>
            <select 
              className="input-field" 
              style={{ fontSize: '0.85rem', padding: '0.4rem 2rem 0.4rem 1rem', width: 'auto' }}
              value={leadsSortOrder}
              onChange={(e) => setLeadsSortOrder(e.target.value)}
            >
              <option value="oportunidad">Oportunidad</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
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
      </div>

      {leadsData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          No se encontraron clientes potenciales con los filtros actuales.
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
          {leadsData.map(item => (
            <LeadCard 
              key={item.id} 
              item={item} 
              isGridMode={isGridMode}
              isFavorite={isFavoriteLead(item.id)}
              onToggleFavorite={() => toggleFavoriteLead(item.id)}
              onSelect={() => setSelectedLead(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LeadCard = ({ item, isGridMode, isFavorite, onToggleFavorite, onSelect }) => {
  return (
    <div className="card leads-card" style={{
      display: 'flex',
      flexDirection: isGridMode ? 'column' : 'row',
      gap: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-opp-${item.nivel_oportunidad}`} style={{ textTransform: 'capitalize' }}>Oportunidad {item.nivel_oportunidad}</span>
            <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{item.tipo_entidad}</span>
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
            {item.nombre_entidad}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: isGridMode ? 2 : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.descripcion}
          </p>
        </div>

        <div className="card-meta-grid" style={{ display: 'grid', gridTemplateColumns: isGridMode ? '1fr' : 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Building2 size={14} />
            <span>{item.sector}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <MapPin size={14} />
            <span>{item.ciudad}, {item.pais}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto' }}>
          {item.email_contacto && <Mail size={16} color="var(--text-secondary)" title="Tiene Email" />}
          {item.telefono_contacto && <Phone size={16} color="var(--text-secondary)" title="Tiene Teléfono" />}
          {item.linkedin_empresa && <Link2 size={16} color="#0A66C2" title="Tiene LinkedIn" />}
          {item.pagina_web && <ExternalLink size={16} color="var(--text-secondary)" title="Tiene Web" />}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent-base)', fontWeight: 600 }}>{item.posible_necesidad}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isGridMode ? 'row' : 'column', gap: '0.5rem', justifyContent: 'flex-end', alignItems: isGridMode ? 'center' : 'stretch', borderTop: isGridMode ? '1px solid var(--border-color)' : 'none', paddingTop: isGridMode ? '1rem' : '0', borderLeft: !isGridMode ? '1px solid var(--border-color)' : 'none', paddingLeft: !isGridMode ? '1.5rem' : '0' }}>
        <div style={{ display: 'flex', gap: '0.5rem', width: isGridMode ? 'auto' : '100%', marginLeft: 'auto' }}>
          <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', width: isGridMode ? '100%' : 'auto' }} onClick={onSelect}>
            Ver Detalle del Lead
          </button>
        </div>
      </div>
    </div>
  );
};
