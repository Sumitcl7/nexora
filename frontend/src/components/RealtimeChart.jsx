// src/components/RealtimeChart.jsx
import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { subscribe, unsubscribe } from '../services/realtime';

export default function RealtimeChart({ maxPoints=40 }) {
  const [data, setData] = useState([]);
  const ref = useRef();

  useEffect(()=>{
    const handler = items => {
      // items are array of event objects { device_id, timestamp, value }
      const pts = items.map(it => {
        const ts = it.timestamp?.N ?? it.ts ?? it.timestamp ?? (it.created_at?.N ?? it.created_at);
        const val = it.value?.N ?? it.value ?? it.Value ?? 0;
        return { ts: Number(ts), value: Number(val) };
      }).sort((a,b)=>a.ts-b.ts);

      if (pts.length === 0) return;

      setData(prev => {
        const merged = [...prev, ...pts].slice(-maxPoints);
        return merged.map((d,i)=>({ ...d, label: new Date(d.ts*1000).toLocaleTimeString() }));
      });
    };

    const unsub = subscribe(handler);
    return () => { unsub(); };
  }, [maxPoints]);

  return (
    <div style={{ width:'100%', height:280 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10f0c6" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#10f0c6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <YAxis domain={['dataMin','dataMax']} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="transparent" fill="url(#grad)"/>
          <Line type="monotone" dataKey="value" stroke="#10f0c6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

