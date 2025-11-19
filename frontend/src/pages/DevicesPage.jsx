// src/pages/DevicesPage.jsx
import React, { useEffect, useState } from 'react';
import { subscribe } from '../services/realtime';

function healthFromTs(ts) {
  const now = Date.now()/1000;
  const delta = now - Number(ts);
  if (delta < 300) return { label: 'online', color: 'green' };
  if (delta < 3600) return { label: 'idle', color: 'yellow' };
  return { label: 'offline', color: 'red' };
}

export default function DevicesPage(){
  const [devices, setDevices] = useState({});

  useEffect(()=>{
    const unsub = subscribe(items => {
      const map = {...devices};
      items.forEach(it => {
        const id = it.device_id?.S ?? it.device_id ?? it.device ?? 'unknown';
        const ts = it.timestamp?.N ?? it.ts ?? it.timestamp ?? Math.floor(Date.now()/1000);
        const value = it.value?.N ?? it.value ?? it.Value ?? 0;
        map[id] = { id, ts: Number(ts), value: Number(value) };
      });
      setDevices(map);
    });
    return () => unsub();
  }, []);

  const list = Object.values(devices).sort((a,b)=>b.ts-a.ts);

  return (
    <div className="devices-page">
      <h2>Devices</h2>
      <div className="devices-list">
        {list.length === 0 ? <div className="muted">No devices yet</div> :
          list.map(d => {
            const h = healthFromTs(d.ts);
            return (
              <div key={d.id} className="device-row">
                <div className="device-left">
                  <div className="device-id">{d.id}</div>
                  <div className="device-ts muted">last: {new Date(d.ts*1000).toLocaleString()}</div>
                </div>
                <div className="device-right">
                  <div className="device-value">{d.value}</div>
                  <div className="device-health" style={{color: h.color}}>{h.label}</div>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

