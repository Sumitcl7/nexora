// src/pages/AlertsPage.jsx
import React, { useState, useEffect } from 'react';
import { subscribe } from '../services/realtime';

function severityForValue(v) {
  const n = Number(v);
  if (n >= 150) return 'critical';
  if (n >= 100) return 'warning';
  return 'normal';
}

export default function AlertsPage(){
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(()=>{
    const unsub = subscribe(items => {
      const newAlerts = items.map(it => {
        const id = `${it.device_id?.S ?? it.device_id ?? ''}-${it.timestamp?.N ?? it.timestamp ?? Date.now()}`;
        const value = it.value?.N ?? it.value ?? 0;
        return { id, device: it.device_id?.S ?? it.device_id ?? it.device, value: Number(value), ts: Number(it.timestamp?.N ?? it.timestamp ?? Math.floor(Date.now()/1000)), severity: severityForValue(value), ack: false };
      }).filter(a=>a);
      if (newAlerts.length) setAlerts(prev => [...newAlerts, ...prev].slice(0,100));
    });
    return ()=>unsub();
  },[]);

  function toggleAck(id) {
    setAlerts(a => a.map(x => x.id === id ? {...x, ack: !x.ack} : x));
  }

  const shown = alerts.filter(a => filter==='all' ? true : (a.severity === filter));
  return (
    <div className="alerts-page">
      <h2>Alerts</h2>
      <div className="alerts-controls">
        <button onClick={()=>setFilter('all')}>All</button>
        <button onClick={()=>setFilter('normal')}>Normal</button>
        <button onClick={()=>setFilter('warning')}>Warning</button>
        <button onClick={()=>setFilter('critical')}>Critical</button>
      </div>

      <div className="alerts-list">
        {shown.length === 0 ? <div className="muted">No current alerts</div> :
          shown.map(a => (
            <div key={a.id} className={`alert-row ${a.severity} ${a.ack ? 'acked' : ''}`}>
              <div>{a.device} · {a.value} · {new Date(a.ts*1000).toLocaleTimeString()}</div>
              <div><button onClick={()=>toggleAck(a.id)}>{a.ack ? 'Unack' : 'Acknowledge'}</button></div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

