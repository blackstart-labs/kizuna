import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { useAppStore } from './stores/useAppStore';
import { useFetchData } from './hooks/useFetchData';
import { HomelabHealthSummary, Service, Host, Container, Incident, Recommendation, SelfMetrics } from './types';
import { DashboardView } from './features/dashboard/DashboardView';
import { ServicesView } from './features/services/ServicesView';
import { HostsView } from './features/hosts/HostsView';
import { ContainersView } from './features/containers/ContainersView';
import { IncidentsView } from './features/incidents/IncidentsView';
import { OptimizerView } from './features/optimizer/OptimizerView';
import { SettingsView } from './features/settings/SettingsView';

export const App: React.FC = () => {
  const { activeTab } = useAppStore();

  const { data: dashboard, loading: dashLoading, refetch: refetchDash } = useFetchData<HomelabHealthSummary>('/api/v1/dashboard', 10000);
  const { data: services, loading: srvLoading, refetch: refetchSrv } = useFetchData<Service[]>('/api/v1/services', 15000);
  const { data: hosts, loading: hstLoading, refetch: refetchHst } = useFetchData<Host[]>('/api/v1/hosts', 15000);
  const { data: containers, loading: cntLoading, refetch: refetchCnt } = useFetchData<Container[]>('/api/v1/containers', 10000);
  const { data: incidents, loading: incLoading, refetch: refetchInc } = useFetchData<Incident[]>('/api/v1/incidents', 10000);
  const { data: recommendations, loading: recLoading, refetch: refetchRec } = useFetchData<Recommendation[]>('/api/v1/recommendations', 30000);
  const { data: metrics, loading: metLoading, refetch: refetchMet } = useFetchData<SelfMetrics>('/api/v1/self/metrics', 10000);

  const handleRefreshAll = () => {
    refetchDash();
    refetchSrv();
    refetchHst();
    refetchCnt();
    refetchInc();
    refetchRec();
    refetchMet();
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header onRefresh={handleRefreshAll} />
        <main className="page-body">
          {activeTab === 'dashboard' && <DashboardView summary={dashboard} loading={dashLoading} />}
          {activeTab === 'services' && <ServicesView services={services} loading={srvLoading} />}
          {activeTab === 'hosts' && <HostsView hosts={hosts} loading={hstLoading} />}
          {activeTab === 'containers' && <ContainersView containers={containers} loading={cntLoading} onRefresh={refetchCnt} />}
          {activeTab === 'incidents' && <IncidentsView incidents={incidents} loading={incLoading} />}
          {activeTab === 'optimizer' && <OptimizerView recommendations={recommendations} loading={recLoading} />}
          {activeTab === 'settings' && <SettingsView metrics={metrics} loading={metLoading} />}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
};

export default App;
