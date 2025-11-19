import React, { useEffect, useRef } from "react";

/**
 * UsageChart
 * items: array of { value: number, timestamp: number }
 */
export default function UsageChart({ items }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.scale(DPR, DPR);

    // background subtle gradient
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(4,12,13,0.7)");
    g.addColorStop(1, "rgba(6,18,18,0.3)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    const stepY = 4;
    for (let i = 1; i <= stepY; i++) {
      const y = (h / stepY) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // prepare values
    const vals = items.map((it) => (typeof it.value === "number" ? it.value : NaN)).filter((v) => !Number.isNaN(v));
    if (!vals.length) {
      // draw placeholder
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.font = "14px Inter, Arial, sans-serif";
      ctx.fillText("No numeric values to chart", 12, 30);
      return;
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.12, 4);
    const scaledMin = min - pad;
    const scaledMax = max + pad;

    // compute points horizontally
    const points = vals.map((v, i) => {
      const x = (i / Math.max(1, vals.length - 1)) * (w - 32) + 16;
      const y = h - 16 - ((v - scaledMin) / (scaledMax - scaledMin)) * (h - 32);
      return { x, y, v };
    });

    // fill area
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - 16);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - 16);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
    fillGrad.addColorStop(0, "rgba(27,250,217,0.12)");
    fillGrad.addColorStop(1, "rgba(27,250,217,0.02)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // stroke curve
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#11F0D4";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // draw markers
    ctx.fillStyle = "#e7fffb";
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [items]);

  return (
    <div className="chart-wrap">
      <canvas ref={canvasRef} className="chart-canvas" />
    </div>
  );
}
