import React, { useState } from 'react'

export default function EventForm({ api, onSent }) {
  const [deviceId, setDeviceId] = useState(device-)
  const [value, setValue] = useState(42.5)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  async function sendEvent(e) {
    e.preventDefault()
    if (!api) { setMsg('API endpoint not set'); return }
    const payload = { device_id: deviceId, timestamp: Math.floor(Date.now()/1000), value: parseFloat(value) }
    setSending(true)
    try {
      const resp = await fetch(${api}/v1/events, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await resp.json()
      if (!resp.ok) {
        setMsg('Error: ' + (data.error || JSON.stringify(data)))
      } else {
        setMsg('Sent — stored id: ' + (data.item?.device_id || 'OK'))
        onSent && onSent(payload)
      }
    } catch (err) {
      setMsg('Network error: ' + err.message)
    } finally {
      setSending(false)
      setTimeout(()=>setMsg(''), 5000)
    }
  }

  return (
    <div className='p-1'>
      <form onSubmit={sendEvent} className='space-y-3'>
        <div>
          <label className='block text-sm text-gray-300'>Device ID</label>
          <input value={deviceId} onChange={e=>setDeviceId(e.target.value)} className='mt-1 w-full bg-gray-900 border border-gray-700 rounded p-2' />
        </div>
        <div>
          <label className='block text-sm text-gray-300'>Value</label>
          <input type='number' value={value} onChange={e=>setValue(e.target.value)} className='mt-1 w-full bg-gray-900 border border-gray-700 rounded p-2' />
        </div>
        <div>
          <button disabled={sending} className='px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60'>
            {sending ? 'Sending...' : 'Send Event'}
          </button>
        </div>
        {msg && <div className='text-sm mt-2 text-green-300'>{msg}</div>}
      </form>
    </div>
  )
}
