"use client";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  marketCap?: number;
  currency?: string;
}

interface Props {
  data: StockData;
  onClick?: () => void;
  active?: boolean;
}

function fmt(n: number, decimals = 2) {
  return n?.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtVolume(n?: number) {
  if (!n) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toLocaleString();
}

function fmtMarketCap(n?: number) {
  if (!n) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  return "$" + n.toLocaleString();
}

export default function StockCard({ data, onClick, active }: Props) {
  const up = data.change >= 0;
  return (
    <div
      className={`stock-card${active ? " active" : ""}`}
      onClick={onClick}
      style={active ? { borderColor: "var(--accent-blue)", background: "rgba(59,130,246,0.06)" } : {}}
    >
      <div className="card-header">
        <div>
          <div className="card-symbol">{data.symbol}</div>
          <div className="card-name">{data.name}</div>
        </div>
        <div className={`badge ${up ? "up" : "down"}`}>
          {up ? "▲" : "▼"} {Math.abs(data.changePercent).toFixed(2)}%
        </div>
      </div>

      <div className="card-price">
        {data.currency === "USD" || !data.currency ? "$" : data.currency + " "}
        {fmt(data.price)}
      </div>

      <div className="card-meta">
        <span style={{ color: up ? "var(--green)" : "var(--red)" }}>
          {up ? "+" : ""}{fmt(data.change)} 今日
        </span>
        <span>成交量 {fmtVolume(data.volume)}</span>
      </div>

      <div className="stats-row" style={{ marginTop: "16px" }}>
        {[
          { label: "开盘", value: data.open != null ? `$${fmt(data.open)}` : "—" },
          { label: "最高", value: data.high != null ? `$${fmt(data.high)}` : "—" },
          { label: "最低", value: data.low != null ? `$${fmt(data.low)}` : "—" },
          { label: "市值", value: fmtMarketCap(data.marketCap) },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
