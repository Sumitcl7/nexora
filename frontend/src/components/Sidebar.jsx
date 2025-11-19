// src/components/Sidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
    >
      <div className="sidebar-top">
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '☰' : '⟨'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <button className={page==='dashboard'?'active':''} onClick={() => setPage('dashboard')}>Dashboard</button>
        <button className={page==='devices'?'active':''} onClick={() => setPage('devices')}>Devices</button>
        <button className={page==='alerts'?'active':''} onClick={() => setPage('alerts')}>Alerts</button>
        <button className={page==='debug'?'active':''} onClick={() => setPage('debug')}>Debug</button>
      </nav>

      <div className="sidebar-footer">
        <small className="muted">Nexora</small>
      </div>
    </motion.aside>
  );
}
