// src/EventsChart.jsx
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function EventsChart({ events = [] }) {
  const points = useMemo(() => {
    const sorted = [...events].sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0));
    return sorted.slice(-18);
  }, [events]);

  const labels = points.map(p => {
    if (!p.timestamp) return "";
    const d = new Date(p.timestamp * 1000);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "value",
        data: points.map(p => (typeof p.value === "number" ? p.value : null)),
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 3,
        borderColor: "#2ee6c6",
        backgroundColor: ctx => {
          const c = ctx.chart.ctx;
          const g = c.createLinearGradient(0,0,0,200);
          g.addColorStop(0, "rgba(46,230,198,0.18)");
          g.addColorStop(1, "rgba(6,22,23,0)");
          return g;
        },
        segment: {
          borderColor: '#2ee6c6'
        }
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#071617", titleColor: "#fff", bodyColor: "#fff" },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#8ea6a6" } },
      y: {
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: { color: "#8ea6a6" },
      },
    },
  };

  return <Line data={data} options={options} />;
}
