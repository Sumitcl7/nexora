import React, { useEffect, useState } from 'react'

export default function EventsPanel(){
  const [events, setEvents] = useState([])
  const apiBase = import.meta.env.VITE_API_ENDPOINT || ''
  const eventsUrl = apiBase.endsWith('/') ? apiBase + 'v1/events' : apiBase + '/v1/events'

  async function fetchEvents(){
    try {
      const r = await fetch(eventsUrl)
      const txt = await r.text()
      let body
      try { body = JSON.parse(txt) } catch(e) { body = txt }
      const arr = body?.items ?? body?.Items ?? (Array.isArray(body) ? body : [])
      setEvents(Array.isArray(arr) ? arr : [])
      // update debug block
      const dbg = document.getElementById('debugOutput')
      if (dbg) dbg.textContent = JSON.stringify(body, null, 2)
    } catch(err){
      console.error('events fetch error', err)
      setEvents([])
      const dbg = document.getElementById('debugOutput')
      if (dbg) dbg.textContent = String(err)
    }
  }

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, Number(import.meta.env.VITE_POLL_INTERVAL_MS || 5000))
    return () => clearInterval(interval)
    // eslint-disable-next-line
  }, [])

  return (
    <div>
      <h3>Recent Events</h3>
      {events.length === 0 ? (
        <div className='muted'>No events returned by API</div>
      ) : (
        <ul className='events-list'>
          {events.map((it, idx) => {
            const device = it.device_id?.S ?? it.device_id ?? it.device ?? 'unknown'
            const value = (typeof it.value === 'object' && it.value?.N) ? it.value.N : it.value ?? it.Value
            const ts = it.timestamp ?? it.ts ?? it.timestamp
            return (
              <li key={idx}>
                <div className='device'>{device}</div>
                <div className='muted small'>ts: {ts}</div>
                <div className='value'>{value}</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
