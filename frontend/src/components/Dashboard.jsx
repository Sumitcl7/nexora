import React from 'react'
import EventForm from './EventForm'
import AggregatesGrid from './AggregatesGrid'
import AlertsPanel from './AlertsPanel'

export default function Dashboard(){
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <div className='lg:col-span-2 space-y-6'>
        <div className='panel neon-blue p-6 neon-outline'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>Resource Usage</h2>
            <div className='text-sm muted'>Past 24 h</div>
          </div>
          <div className='mt-4'>
            <AggregatesGrid />
          </div>
        </div>

        <div className='panel p-6'>
          <EventForm api={import.meta.env.VITE_API_ENDPOINT} />
        </div>
      </div>

      <aside className='space-y-6'>
        <div className='panel p-4 neon-outline'>
          <h3 className='text-lg font-semibold'>Alerts</h3>
          <div className='mt-4 space-y-3'>
            <AlertsPanel />
          </div>
        </div>

        <div className='panel p-4'>
          <h3 className='text-lg font-semibold'>Quick actions</h3>
          <div className='mt-3 text-sm muted'>Deploy / Run analyzer / View logs</div>
        </div>
      </aside>
    </div>
  )
}
