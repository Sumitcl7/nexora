// src/AlertsPanel.jsx
import React from "react";

export default function AlertsPanel({ events = [], threshold = 150 }) {
  const alerts = (events || []).filter(e => typeof e.value === "number" && e.value > threshold);
  return (
    <div className="rounded-2xl p-6 deep-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Alerts</div>
        <div className="text-sm text-slate-400">{alerts.length} active</div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-slate-400">No current alerts</div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a, i) => (
            <li key={i} className="p-3 rounded border-l-4 border-rose-500 bg-[#071617]/40">
              <div className="font-semibold text-rose-200">High Usage</div>
              <div className="text-sm text-slate-300">{a.device} — {a.value} @ {a.timestamp}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
