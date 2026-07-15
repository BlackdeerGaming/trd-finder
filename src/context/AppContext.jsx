import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// En desarrollo apunta al backend local; en producción se toma de VITE_API_URL
// (definida en .env.production) para no depender de localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperError, setScraperError] = useState(null);
  
  // Theme & App Modes
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchMode, setSearchMode] = useState('General'); // 'General' | 'MPI LTDA'
  const [activeTab, setActiveTab] = useState('convocatorias'); // 'convocatorias' | 'leads'

  // Sync theme with HTML root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fitro State
  const [filters, setFilters] = useState({
    globalSearch: '',
    nombre: '',
    pais: '',
    empresa: '',
    entidad: '',
    tipoOportunidad: '',
    estado: '',
    categoriaTematica: [],
    nivelRelevancia: '',
    afinidad_mpi: '', // "alta", "media", "baja"
    tipo_enlace: '', // "pagina_convocatoria", "pagina_proceso", "pdf_descargable", "enlace_fuente_secundaria"
    soloFuentesOficiales: false,
    solo_con_pdf: false,
    favoritos: false
  });

  const [leadsFilters, setLeadsFilters] = useState({
    globalSearch: '',
    nombre_entidad: '',
    tipo_entidad: '',
    sector: '',
    pais: '',
    ciudad: '',
    nivel_oportunidad: '',
    posible_necesidad: '',
    tiene_email: false,
    tiene_telefono: false,
    tiene_linkedin: false,
    favoritos: false
  });

  const [leadsSortOrder, setLeadsSortOrder] = useState('oportunidad'); // 'oportunidad' | 'nombre'

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [favoriteLeads, setFavoriteLeads] = useState(() => {
    const saved = localStorage.getItem('favoriteLeads');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [isGridMode, setIsGridMode] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Load backend data
  useEffect(() => {
    fetchData();
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('favoriteLeads', JSON.stringify([...favoriteLeads]));
  }, [favoriteLeads]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resConv, resLeads] = await Promise.all([
        fetch(`${API_URL}/api/convocatorias`),
        fetch(`${API_URL}/api/leads`)
      ]);
      if (resConv.ok) {
        const json = await resConv.json();
        setData(json);
      }
      if (resLeads.ok) {
        const json = await resLeads.json();
        setLeadsData(json);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const runScraper = async () => {
    try {
      setScraperRunning(true);
      setScraperError(null);
      const res = await fetch(`${API_URL}/api/scraper/run`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Fallo la ejecución del agente.');
      }
      await fetchData();
    } catch (err) {
      console.error('Error ejecutando el agente scraper', err);
      setScraperError(err.message);
    } finally {
      setScraperRunning(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isFavorite = (id) => favorites.has(id);

  const toggleFavoriteLead = (id) => {
    setFavoriteLeads(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isFavoriteLead = (id) => favoriteLeads.has(id);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Computed state: Filtered and Sorted data
  const filteredData = data.filter(item => {
    // Favorites map independent toggle
    if (filters.favoritos && !favorites.has(item.id)) return false;

    // In MPI Search Mode, if afinidad_mpi is baja, we might want to drop it, or sort it.
    // Spec says: "descartar resultados de baja afinidad" in MPI Target Search Behavior.
    if (searchMode === 'MPI LTDA') {
       if (item.afinidad_mpi === 'baja' && !filters.favoritos) return false;
    }

    // Global Search (always applies)
    if (filters.globalSearch) {
      const lowSearch = filters.globalSearch.toLowerCase();
      const matchGlobal = 
        item.titulo.toLowerCase().includes(lowSearch) ||
        item.entidad.toLowerCase().includes(lowSearch) ||
        item.pais.toLowerCase().includes(lowSearch) ||
        item.empresa.toLowerCase().includes(lowSearch);
      if (!matchGlobal) return false;
    }

    // Exact Filters
    if (filters.nombre && !item.titulo.toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.pais && item.pais !== filters.pais) return false;
    if (filters.empresa && !item.empresa.toLowerCase().includes(filters.empresa.toLowerCase())) return false;
    if (filters.entidad && !item.entidad.toLowerCase().includes(filters.entidad.toLowerCase())) return false;
    if (filters.tipoOportunidad && item.tipo_oportunidad !== filters.tipoOportunidad) return false;
    if (filters.estado && item.estado !== filters.estado) return false;
    if (filters.nivelRelevancia && item.relevancia !== filters.nivelRelevancia) return false;
    
    // New MPI and Link filters
    if (filters.afinidad_mpi && item.afinidad_mpi !== filters.afinidad_mpi) return false;
    if (filters.tipo_enlace && item.tipo_enlace !== filters.tipo_enlace) return false;
    if (filters.solo_con_pdf && !item.enlace_pdf) return false;

    return true;
  });

  // Sorting
  filteredData.sort((a, b) => {
    if (searchMode === 'MPI LTDA') {
      // Sort by MPI Affirmative Affinity
      const affinityScore = { "alta": 3, "media": 2, "baja": 1 };
      const scoreA = affinityScore[a.afinidad_mpi] || 0;
      const scoreB = affinityScore[b.afinidad_mpi] || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }
    // General sort fallback: relevance and budget
    const relevanceScore = { "alta": 3, "media": 2, "baja": 1 };
    const rA = relevanceScore[a.relevancia] || 0;
    const rB = relevanceScore[b.relevancia] || 0;
    if (rA !== rB) return rB - rA;
    
    return b.presupuesto - a.presupuesto;
  });

  const filteredLeads = leadsData.filter(item => {
    // Favorites
    if (leadsFilters.favoritos && !favoriteLeads.has(item.id)) return false;

    // Global Search
    if (leadsFilters.globalSearch) {
      const lowSearch = leadsFilters.globalSearch.toLowerCase();
      const matchGlobal = 
        item.nombre_entidad?.toLowerCase().includes(lowSearch) ||
        item.sector?.toLowerCase().includes(lowSearch) ||
        item.ciudad?.toLowerCase().includes(lowSearch) ||
        item.posible_necesidad?.toLowerCase().includes(lowSearch);
      if (!matchGlobal) return false;
    }

    // Exact Filters
    if (leadsFilters.nombre_entidad && !item.nombre_entidad?.toLowerCase().includes(leadsFilters.nombre_entidad.toLowerCase())) return false;
    if (leadsFilters.tipo_entidad && item.tipo_entidad !== leadsFilters.tipo_entidad) return false;
    if (leadsFilters.sector && !item.sector?.toLowerCase().includes(leadsFilters.sector.toLowerCase())) return false;
    if (leadsFilters.pais && item.pais !== leadsFilters.pais) return false;
    if (leadsFilters.ciudad && !item.ciudad?.toLowerCase().includes(leadsFilters.ciudad.toLowerCase())) return false;
    if (leadsFilters.nivel_oportunidad && item.nivel_oportunidad !== leadsFilters.nivel_oportunidad) return false;
    if (leadsFilters.posible_necesidad && !item.posible_necesidad?.toLowerCase().includes(leadsFilters.posible_necesidad.toLowerCase())) return false;

    // Boolean filters
    if (leadsFilters.tiene_email && !item.email_contacto) return false;
    if (leadsFilters.tiene_telefono && !item.telefono_contacto) return false;
    if (leadsFilters.tiene_linkedin && !item.linkedin_empresa) return false;

    return true;
  });

  // Sorting for leads
  filteredLeads.sort((a, b) => {
    if (leadsSortOrder === 'nombre') {
      return a.nombre_entidad.localeCompare(b.nombre_entidad);
    }
    if (leadsSortOrder === 'oportunidad') {
      const oppScore = { "alto": 3, "medio": 2, "bajo": 1 };
      const scoreA = oppScore[a.nivel_oportunidad] || 0;
      const scoreB = oppScore[b.nivel_oportunidad] || 0;
      return scoreB - scoreA;
    }
    return 0;
  });

  return (
    <AppContext.Provider value={{
      data: filteredData,
      loading,
      scraperRunning,
      scraperError,
      runScraper,
      filters,
      setFilters,
      isGridMode,
      setIsGridMode,
      isFavorite,
      toggleFavorite,
      favorites,
      selectedItem,
      setSelectedItem,
      theme,
      toggleTheme,
      searchMode,
      setSearchMode,
      activeTab,
      setActiveTab,
      rawConvocatorias: data, // Raw data directly from state
      leadsData: filteredLeads,
      leadsFilters,
      setLeadsFilters,
      isFavoriteLead,
      toggleFavoriteLead,
      favoriteLeads,
      selectedLead,
      setSelectedLead,
      leadsSortOrder,
      setLeadsSortOrder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
