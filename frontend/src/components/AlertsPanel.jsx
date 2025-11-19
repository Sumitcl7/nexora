import React from "react";

const AlertRow = ({ title, desc, severity = "high" }) => {
  const color = severity === "high" ? "bg-orange-900/40 border-orange-500/30" : "bg-slate-800/40";
  return (
    <div className={`p-3 rounded-lg border ${color} flex items-start gap-3 mb-3`}>
      <div className="w-10 h-10 rounded-md flex items-center justify-center">
        {severity === "high" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v12" stroke="#ffb39a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="18" r="1.5" fill="#ffb39a"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 8v4" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="16" r="1.5" fill="#00d4ff"/></svg>
        )}
      </div>
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="text-xs muted">{desc}</div>
      </div>
    </div>
  );
};

export default function AlertsPanel() {
  return (
    <div className="card p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Alerts</div>
        <div className="text-sm muted">Notifications</div>
      </div>

      <AlertRow title="High Usage Detected" desc="Resource usage exceeded threshold. Apr 25, 2024 — 10:25 AM" severity="high" />
      <AlertRow title="Anomaly Detected" desc="Unusual usage pattern identified. Apr 25, 2024 — 05:17 PM" severity="low" />
      <AlertRow title="Anomaly Detected" desc="Unusual usage pattern identified. Apr 25, 2024 — 05:17 PM" severity="low" />

      <div className="text-xs muted mt-3">Manage alert subscriptions in the settings panel.</div>
    </div>
  );
}
