import React from 'react';
import { Search, Bell, Menu, Activity, Moon, Sun, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Header = () => {
  const {
    filters, setFilters, leadsFilters, setLeadsFilters, theme, toggleTheme,
    searchMode, setSearchMode, activeTab, setActiveTab,
    runScraper, scraperRunning, scraperError,
    isMobileFiltersOpen, setIsMobileFiltersOpen
  } = useAppContext();

  const handleGlobalSearch = (e) => {
    if (activeTab === 'convocatorias') {
      setFilters({ ...filters, globalSearch: e.target.value });
    } else {
      setLeadsFilters({ ...leadsFilters, globalSearch: e.target.value });
    }
  };

  return (
    <header className="header">
      <div className="header-brand">
        <Activity size={28} color="var(--accent-base)" />
        <div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.1rem', color: 'var(--text-primary)' }}>ConvocatoriasTRD<span style={{color: 'var(--accent-base)'}}>Explorer</span><span style={{color: '#F59E0B', fontWeight: 800}}>MPI</span></h1>
          <p className="header-tagline" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Buscador inteligente & Perfilamiento MPI</p>
        </div>
      </div>

      <div className="header-center">

        {/* Module Nav Toggles */}
        <div className="segmented-control feature-nav">
          <button
            className={activeTab === 'convocatorias' ? 'active' : ''}
            onClick={() => setActiveTab('convocatorias')}
          >
            Convocatorias
          </button>
          <button
            className={activeTab === 'leads' ? 'active' : ''}
            onClick={() => setActiveTab('leads')}
            style={{ fontWeight: 600 }}
          >
            Clientes Potenciales
          </button>
        </div>

        {/* Enfoque / Search Mode Toggle */}
        <div className="segmented-control">
          <button
            className={searchMode === 'General' ? 'active' : ''}
            onClick={() => setSearchMode('General')}
          >
            Modo General
          </button>
          <button
            className={searchMode === 'MPI LTDA' ? 'active' : ''}
            onClick={() => setSearchMode('MPI LTDA')}
          >
            MPI LTDA Focus
          </button>
        </div>

        <div className="header-search">
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder={activeTab === 'convocatorias' ? "Buscar por nombre, entidad, país..." : "Buscar por nombre, sector, ciudad o necesidad..."}
            style={{ paddingLeft: '3rem', borderRadius: '50px', background: 'var(--bg-tertiary)' }}
            value={activeTab === 'convocatorias' ? filters.globalSearch : leadsFilters.globalSearch}
            onChange={handleGlobalSearch}
          />
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn btn-outline"
          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          onClick={runScraper}
          disabled={scraperRunning}
          title={scraperError ? `Último error: ${scraperError}` : 'Buscar convocatorias reales en SECOP II'}
        >
          <RefreshCw size={16} className={scraperRunning ? 'spin' : ''} />
          <span className="btn-refresh-label">{scraperRunning ? 'Buscando...' : 'Actualizar Búsqueda'}</span>
        </button>
        <button className="btn-icon" onClick={toggleTheme} title="Alternar Modo Oscuro/Claro">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="btn-icon header-bell">
          <Bell size={20} />
        </button>
        <button
          className="btn-icon header-filters-toggle"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          title="Mostrar/ocultar filtros"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};
