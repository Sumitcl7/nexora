// frontend/src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import "./index.css"; // keep if you have tailwind/css

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const dashboardRef = useRef(null);

  const API = import.meta.env.VITE_API_ENDPOINT || "";
  const eventsUrl = API.endsWith("/") ? `${API}v1/events` : `${API}/v1/events`;

  useEffect(() => {
    // fetch on load
    fetchRecentEvents();
    // eslint-disable-next-line
  }, []);

  async function fetchRecentEvents() {
    setLoading(true);
    try {
      const res = await fetch(eventsUrl, { method: "GET" });
      const txt = await res.text();
      // Parse leniently (some endpoints return JSON string or object)
      let body;
      try {
        body = JSON.parse(txt);
      } catch (e) {
        body = txt;
      }

      // Accept multiple shapes, prefer body.items or body.Items
      const items = body?.items ?? body?.Items ?? body?.events ?? (Array.isArray(body) ? body : []);
      setEvents(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("fetchRecentEvents error", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function onGetStartedClick() {
    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: "smooth" });
    }
    fetchRecentEvents();
  }

  function renderValue(v){
    // handle DynamoDB style { N: '123.45' } or plain number/string
    if (v == null) return "-";
    if (typeof v === "object") {
      if (v.N) return v.N;
      if (v.S) return v.S;
    }
    return String(v);
  }

  return (
    <div className="min-h-screen bg-[#071617] text-gray-200">
      <header className="p-6 flex justify-between items-center">
        <div className="text-teal-300 font-bold">NEXORA</div>
        <button
          onClick={onGetStartedClick}
          className="py-2 px-4 rounded-full border border-teal-600 text-teal-200 hover:bg-teal-600/10"
        >
          Get Started
        </button>
      </header>

      <main className="px-8">
        <section className="max-w-4xl">
          <h1 className="text-3xl font-extrabold mb-2">Smart Resource Tracker</h1>
          <p className="text-slate-300 mb-8">
            Monitor and manage your resource consumption with real-time analytics and alerts.
          </p>
        </section>

        <section ref={dashboardRef} id="dashboard" className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#0b1b1b] rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Resource Usage</h3>
            <p className="text-sm text-slate-400 mb-4">Past 24 h · Avg · live</p>
            <div className="h-48 bg-gradient-to-b from-[#071617] to-[#061616] rounded-md flex items-center justify-center">
              <div className="text-teal-300">[ chart placeholder ]</div>
            </div>
          </div>

          <aside className="bg-[#0b1b1b] rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold mb-3">Recent Events</h4>

            {loading ? (
              <div>Loading...</div>
            ) : events.length === 0 ? (
              <div className="text-slate-400 text-sm">No events returned by API</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {events.map((it, idx) => {
                  const device = it.device_id?.S ?? it.device_id ?? it.device ?? "unknown";
                  const value = renderValue(it.value ?? it.Value ?? it.value);
                  const ts = renderValue(it.timestamp ?? it.ts ?? it.timestamp);
                  return (
                    <li key={idx} className="border-b border-slate-800 pb-2">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium text-teal-200">{device}</div>
                          <div className="text-slate-400 text-xs">ts: {ts}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{value}</div>
                          <div className="text-slate-400 text-xs">value</div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </section>
      </main>

      <footer className="p-6 text-center text-sm text-slate-500">Nexora — demo</footer>
    </div>
  );
}

export default App;
