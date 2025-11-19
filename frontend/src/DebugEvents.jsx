// src/DebugEvents.jsx
import React, { useState } from "react";

export default function DebugEvents({ eventsUrl }) {
  const [raw, setRaw] = useState(null);

  async function refresh() {
    try {
      const r = await fetch(eventsUrl);
      const j = await r.json();
      setRaw(j);
    } catch (e) {
      setRaw({ error: String(e) });
    }
  }

  function copyJSON() {
    if (!raw) return;
    navigator.clipboard?.writeText(JSON.stringify(raw, null, 2));
  }

  return (
    <div className="rounded-2xl p-6 deep-card">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Debug — Raw API</div>
        <div className="flex gap-2">
          <button onClick={refresh} className="px-3 py-1 rounded bg-slate-700 text-sm">Refresh</button>
          <button onClick={copyJSON} className="px-3 py-1 rounded bg-slate-700 text-sm">Copy JSON</button>
        </div>
      </div>

      <pre className="mt-4 text-xs text-slate-300 max-h-56 overflow-auto bg-[#061616] p-3 rounded">
        {raw ? JSON.stringify(raw, null, 2) : "No debug output yet"}
      </pre>
    </div>
  );
}
