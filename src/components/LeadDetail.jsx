import React from 'react';
import { X, BookmarkIcon, Bot, Building2, MapPin, Mail, Phone, Link2, ExternalLink, Briefcase, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const LeadDetail = () => {
  const { selectedLead, setSelectedLead, isFavoriteLead, toggleFavoriteLead, rawConvocatorias, setSelectedItem, setActiveTab } = useAppContext();

  if (!selectedLead) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={() => setSelectedLead(null)}>
      <div 
        style={{
          width: '100%',
          maxWidth: '650px',
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
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`badge badge-opp-${selectedLead.nivel_oportunidad}`} style={{textTransform: 'capitalize'}}>Oportunidad {selectedLead.nivel_oportunidad}</span>
                <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{selectedLead.tipo_entidad}</span>
                <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-base)' }}>{selectedLead.posible_necesidad}</span>
             </div>
             <button className="btn-icon" onClick={() => setSelectedLead(null)}>
               <X size={24} />
             </button>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {selectedLead.nombre_entidad}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <MapPin size={16} /> {selectedLead.ciudad}, {selectedLead.pais}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {selectedLead.email_contacto && (
              <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(selectedLead.email_contacto)}>
                <Mail size={18} /> Copiar Email
              </button>
            )}
            {selectedLead.pagina_web && (
              <button className="btn btn-outline" onClick={() => window.open(selectedLead.pagina_web, '_blank')}>
                 <ExternalLink size={18} /> Visitar Web
              </button>
            )}
            
            <button className="btn btn-outline" onClick={() => toggleFavoriteLead(selectedLead.id)}>
              <BookmarkIcon fill={isFavoriteLead(selectedLead.id) ? '#FBBF24' : 'none'} color={isFavoriteLead(selectedLead.id) ? '#FBBF24' : 'currentColor'} size={18} /> 
              {isFavoriteLead(selectedLead.id) ? 'Guardado' : 'Guardar'}
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {selectedLead.observaciones_agente && (
            <div style={{ 
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-base)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Bot size={24} color="var(--accent-base)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--accent-base)', marginBottom: '0.5rem', fontSize: '1rem' }}>Smart Insight del Agente</h4>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                  {selectedLead.observaciones_agente}
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Fuente detectada: {selectedLead.fuente_detectada}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <InfoItem icon={<Building2 />} label="Sector" value={selectedLead.sector} />
            <InfoItem icon={<Briefcase />} label="Necesidad Detectada" value={selectedLead.posible_necesidad} highlight />
            <InfoItem icon={<User />} label="Contacto" value={selectedLead.contacto_persona || 'No especificado'} />
            <InfoItem icon={<Briefcase />} label="Cargo Contacto" value={selectedLead.cargo_contacto || 'No especificado'} />
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Descripción de Negocio</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {selectedLead.descripcion}
            </p>
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Datos de Contacto Directo</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
              {selectedLead.email_contacto && (
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <Mail size={18} color="var(--text-muted)" />
                  <a href={`mailto:${selectedLead.email_contacto}`} style={{ color: 'var(--accent-hover)', textDecoration: 'none' }}>{selectedLead.email_contacto}</a>
                </li>
              )}
              {selectedLead.telefono_contacto && (
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <Phone size={18} color="var(--text-muted)" />
                  <span>{selectedLead.telefono_contacto}</span>
                </li>
              )}
              {selectedLead.linkedin_empresa && (
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <Link2 size={18} color="#0A66C2" />
                  <a href={selectedLead.linkedin_empresa} target="_blank" rel="noreferrer" style={{ color: '#0A66C2', textDecoration: 'none' }}>Ver Perfil en LinkedIn</a>
                </li>
              )}
              {!selectedLead.email_contacto && !selectedLead.telefono_contacto && !selectedLead.linkedin_empresa && (
                <li style={{ color: 'var(--text-muted)' }}>No se encontraron datos de contacto directo. Referirse a la página web o investigar manualmente.</li>
              )}
            </ul>
          </div>

          <div style={{ height: '1px', background: 'var(--border-color)' }} />

          {/* Related Convocatorias */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Procesos y Convocatorias Relacionadas</h3>
            {(() => {
              const related = rawConvocatorias.filter(c => c.entidad === selectedLead.nombre_entidad);
              if (related.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No se han detectado convocatorias activas o recientes asociadas a esta entidad.</p>;
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Esta entidad tiene {related.length} proceso(s) detectado(s) por el agente:</p>
                  {related.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => {
                        setSelectedItem(c);
                        setActiveTab('convocatorias');
                        setSelectedLead(null);
                      }}
                      style={{ 
                        padding: '1rem', 
                        background: 'var(--bg-tertiary)', 
                        borderRadius: 'var(--radius-md)', 
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        transition: 'var(--transition)'
                      }}
                      className="related-item"
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c.titulo}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.tipo_oportunidad} • {c.estado}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-base)' }}>${c.presupuesto.toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
      <div style={{ fontSize: highlight ? '1.1rem' : '0.9rem', color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: highlight ? 600 : 400 }}>
        {value}
      </div>
    </div>
  </div>
);
