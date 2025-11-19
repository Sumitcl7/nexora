import React, { useState } from 'react';
import './index.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RealtimeChart from './components/RealtimeChart';
import DraggableCard from './components/DraggableCard';
import DevicesPage from './pages/DevicesPage';
import AlertsPage from './pages/AlertsPage';

export default function App(){
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('nexora-theme') || 'dark');

  React.useEffect(()=> {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexora-theme', theme);
  }, [theme]);

  function onGetStarted(){ setPage('dashboard'); }

  return (
    <div className="app-root">
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header onGetStarted={onGetStarted} theme={theme} setTheme={setTheme} />
        <main className="page-body">
          {page === 'dashboard' && (
            <>
              <section className="dashboard-grid">
                <DraggableCard id="card-1" className="card-large">
                  <h3>Realtime</h3>
                  <RealtimeChart />
                </DraggableCard>

                <DraggableCard id="card-2" className="card-small">
                  <h4>Recent Events</h4>
                  <div className="muted">Use the sidebar → Debug to inspect raw API</div>
                </DraggableCard>
              </section>
            </>
          )}
          {page === 'devices' && <DevicesPage />}
          {page === 'alerts' && <AlertsPage />}
          {page === 'debug' && <div className="debug-page">Debug — Raw API</div>}
        </main>
      </div>
    </div>
  );
}

