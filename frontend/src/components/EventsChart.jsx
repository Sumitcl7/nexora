import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  TimeScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  TimeScale
);

export default function EventsChart({ apiUrl, onStats }) {
  const [points, setPoints] = useState([]);
  const timerRef = useRef(null);

  const fetchOnce = async () => {
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      const items = json?.items ?? json?.Items ?? json?.events ?? [];
      // turn items into (time, value) pairs sorted by timestamp
      const mapped = items
        .map((it) => {
          const ts = Number(it.timestamp ?? it.ts ?? it.created_at ?? it.ts);
          const raw = it.value ?? it.Value ?? it.v ?? 0;
          const val =
            typeof raw === "object" ? Number(raw.N ?? raw) : Number(raw);
          return { ts: ts || Date.now() / 1000, value: isNaN(val) ? 0 : val };
        })
        .sort((a, b) => a.ts - b.ts);

      setPoints((prev) => {
        // merge with prev but keep only last 50 points to keep chart light
        const merged = [...prev, ...mapped];
        // dedupe by timestamp
        const dedup = [];
        const seen = new Set();
        for (let p of merged) {
          if (!seen.has(p.ts)) {
            dedup.push(p);
            seen.add(p.ts);
          }
        }
        const tail = dedup.slice(-50);
        if (onStats) {
          const vals = tail.map((x) => x.value);
          const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          const max = vals.length ? Math.max(...vals) : 0;
          onStats({ avg: Number(avg.toFixed(2)), max: Number(max.toFixed(2)) });
        }
        return tail;
      });
    } catch (e) {
      console.error("EventsChart fetch error", e);
    }
  };

  useEffect(() => {
    if (!apiUrl) return;
    fetchOnce();
    timerRef.current = setInterval(fetchOnce, 5000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [apiUrl]);

  const labels = points.map((p) =>
    new Date(p.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const data = {
    labels,
    datasets: [
      {
        label: "Usage",
        data: points.map((p) => p.value),
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderColor: "rgba(20, 248, 224, 1)",
        backgroundColor: (ctx) => {
          const c = ctx.chart.ctx;
          const g = c.createLinearGradient(0, 0, 0, 300);
          g.addColorStop(0, "rgba(20,248,224,0.12)");
          g.addColorStop(1, "rgba(20,248,224,0.02)");
          return g;
        },
      },
    ],
  };

  const options = {
    animation: { duration: 600 },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: { beginAtZero: false },
      },
    },
    plugins: {
      tooltip: { mode: "index", intersect: false },
      legend: { display: false },
    },
  };

  return (
    <div className="chart-wrap">
      <div className="chart-inner" style={{ height: 320 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
