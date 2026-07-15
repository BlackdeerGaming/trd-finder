import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Header';
import { SidebarFilters } from './components/SidebarFilters';
import { ResultsView } from './components/ResultsView';
import { ConvocatoriaDetail } from './components/ConvocatoriaDetail';
import { LeadsView } from './components/LeadsView';
import { LeadDetail } from './components/LeadDetail';

const AppContent = () => {
  const { activeTab } = useAppContext();
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <SidebarFilters />
        <div className="content-area">
          {activeTab === 'convocatorias' ? <ResultsView /> : <LeadsView />}
        </div>
      </div>
      {activeTab === 'convocatorias' ? <ConvocatoriaDetail /> : <LeadDetail />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
