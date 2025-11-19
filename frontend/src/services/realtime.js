// src/services/realtime.js
// Provides subscribe(callback) and unsubscribe() semantics.
// Uses WebSocket if env VITE_WS_ENDPOINT present, otherwise falls back to polling GET /v1/events.

import ReconnectingWebSocket from 'reconnecting-websocket';

const API = import.meta.env.VITE_API_ENDPOINT || '';
const EVENTS_URL = API.endsWith('/') ? `${API}v1/events` : `${API}/v1/events`;
const WS_URL = import.meta.env.VITE_WS_ENDPOINT || ''; // optional

let ws;
let pollTimer = null;
let subs = new Set();

async function fetchEventsOnce() {
  try {
    const res = await fetch(EVENTS_URL, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.items ?? data.Items ?? data.events ?? [];
    return items;
  } catch (e) {
    console.warn('fetchEventsOnce', e);
    return null;
  }
}

function notify(items) {
  subs.forEach(cb => {
    try { cb(items); } catch(e){console.error(e);}
  });
}

function startPolling() {
  stopPolling();
  pollTimer = setInterval(async () => {
    const items = await fetchEventsOnce();
    if (items) notify(items);
  }, 5000);
  // initial
  fetchEventsOnce().then(items => items && notify(items));
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

export function subscribe(cb) {
  subs.add(cb);
  // start transport if first subscriber
  if (subs.size === 1) {
    if (WS_URL) {
      try {
        ws = new ReconnectingWebSocket(WS_URL);
        ws.addEventListener('message', ev => {
          try {
            const payload = JSON.parse(ev.data);
            const items = payload.items ?? payload.Items ?? payload.events ?? [];
            notify(items);
          } catch (e) { console.warn(e); }
        });
        ws.addEventListener('open', () => {
          // optional: request snapshot
          fetchEventsOnce().then(items => items && notify(items));
        });
        ws.addEventListener('error', () => {
          // fallback to polling handled below
          if (!ws || ws.readyState !== 1) startPolling();
        });
      } catch (e) {
        startPolling();
      }
    } else {
      startPolling();
    }
  }
  // return unsubscribe function
  return () => unsubscribe(cb);
}

export function unsubscribe(cb) {
  subs.delete(cb);
  if (subs.size === 0) {
    // teardown
    if (ws) {
      try { ws.close(); } catch {}
      ws = null;
    }
    stopPolling();
  }
}

