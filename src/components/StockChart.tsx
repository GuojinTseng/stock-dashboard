"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

interface ChartPoint {
  date: string;
  close: number;
}

interface Props {
  symbol: string;
}

const PERIODS = ["1M", "3M", "1Y", "5Y"];

export default function StockChart({ symbol }: Props) {
  const [period, setPeriod] = useState("3M");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/chart/${symbol}?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol, period]);

  const isUp = data.length > 1 && data[data.length - 1].close >= data[0].close;
  const color = isUp ? "#22c55e" : "#ef4444";

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        data: data.map((d) => d.close),
        borderColor: color,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: (ctx: any) => {
          const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
          grad.addColorStop(0, isUp ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          return grad;
        },
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: "rgba(15,22,41,0.9)",
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      titleColor: "#8892a4",
      bodyColor: "#e8eaf0",
      bodyFont: { size: 14, weight: "600" as const },
      padding: 12,
      callbacks: {
        label: (ctx: any) => ` $${ctx.raw.toFixed(2)}`,
      },
    }},
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#4a5568",
          maxTicksLimit: 8,
          font: { size: 11 },
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#4a5568",
          font: { size: 11 },
          callback: (v: any) => `$${Number(v).toLocaleString()}`,
        },
        position: "right" as const,
      },
    },
  };

  return (
    <div className="chart-section">
      <div className="chart-header">
        <div>
          <div className="chart-title">{symbol} · 价格走势</div>
          <div className="chart-subtitle">历史收盘价</div>
        </div>
        <div className="period-tabs">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={`period-tab${period === p ? " active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        {loading ? (
          <p className="loading-text">加载中...</p>
        ) : data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="loading-text">暂无数据</p>
        )}
      </div>
    </div>
  );
}
