import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const API = import.meta.env.VITE_API_ENDPOINT || ''

export default function AggregatesGrid(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchAggregates(){
    setLoading(true)
    try{
      const res = await fetch(${API}/v1/aggregates)
      const json = await res.json()
      setItems(json.items || json || [])
    }catch(e){ setItems([]) }
    setLoading(false)
  }

  useEffect(()=>{ fetchAggregates(); const t = setInterval(fetchAggregates,15000); return ()=>clearInterval(t) },[])

  const sorted = (items || []).slice().map(it => {
    return {
      agg_id: it.agg_id?.S || it.agg_id,
      avg: parseFloat(it.avg?.N || it.avg || 0),
      ts: parseInt(it.ts?.N || it.ts || (it.timestamp?.N || it.timestamp || Date.now()/1000))
    }
  }).sort((a,b)=>a.ts-b.ts)

  const chartData = sorted.map(it => ({ ts: new Date(it.ts*1000).toLocaleTimeString(), avg: it.avg }))

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
        {sorted.slice().reverse().slice(0,3).map(a => (
          <div key={a.agg_id} className='panel p-4 neon-outline'>
            <div className='text-sm muted'>ID</div>
            <div className='font-mono text-sm'>{a.agg_id}</div>
            <div className='mt-2 text-lg font-bold'>{a.avg}</div>
            <div className='text-xs muted'>count: {a.count||1}</div>
          </div>
        ))}
      </div>

      <div className='panel p-3'>
        <div style={{ width:'100%', height:260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey='ts' minTickGap={20} tick={{ fill: '#9fb6c9' }} />
              <YAxis tick={{ fill: '#9fb6c9' }} />
              <Tooltip />
              <Line type='monotone' dataKey='avg' stroke='#60a5fa' strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
