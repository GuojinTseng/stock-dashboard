"use client";

import { useState, useEffect, useCallback } from "react";
import StockCard from "@/components/StockCard";
import StockChart from "@/components/StockChart";

const WATCHLIST = [
  { symbol: "AAPL", label: "苹果" },
  { symbol: "TSLA", label: "特斯拉" },
  { symbol: "NVDA", label: "英伟达" },
  { symbol: "^GSPC", label: "标普500" },
  { symbol: "^IXIC", label: "纳斯达克" },
  { symbol: "BTC-USD", label: "比特币" },
];

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

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeSymbol, setActiveSymbol] = useState("AAPL");
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [loadingSymbols, setLoadingSymbols] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const fetchStock = useCallback(async (symbol: string) => {
    if (stocks[symbol]) return;
    setLoadingSymbols((p) => new Set(p).add(symbol));
    try {
      const res = await fetch(`/api/stock/${symbol}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStocks((p) => ({ ...p, [symbol]: data }));
    } catch {
      // silently fail for watchlist items
    } finally {
      setLoadingSymbols((p) => {
        const n = new Set(p);
        n.delete(symbol);
        return n;
      });
    }
  }, [stocks]);

  // Initial load
  useEffect(() => {
    WATCHLIST.forEach((w) => fetchStock(w.symbol));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = search.trim().toUpperCase();
    if (!sym) return;
    setError("");
    setLoadingSymbols((p) => new Set(p).add(sym));
    try {
      const res = await fetch(`/api/stock/${sym}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStocks((p) => ({ ...p, [sym]: data }));
      setActiveSymbol(sym);
      setSearch("");
    } catch (err: any) {
      setError(err.message || `无法找到 ${sym}`);
    } finally {
      setLoadingSymbols((p) => {
        const n = new Set(p);
        n.delete(sym);
        return n;
      });
    }
  };

  const displayedSymbols = [
    ...new Set([...WATCHLIST.map((w) => w.symbol), ...Object.keys(stocks)]),
  ];

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">📈</div>
            StockPulse
          </div>

          <form className="search-wrap" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="搜索股票代码，如 MSFT、2330.TW..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="stock-search"
            />
            <button className="search-btn" type="submit">搜索</button>
          </form>

          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            数据来源 · Yahoo Finance
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {error && <div className="error-msg">⚠️ {error}</div>}

          {/* Watchlist chips */}
          <p className="section-title">自选股</p>
          <div className="watchlist">
            {WATCHLIST.map((w) => {
              const s = stocks[w.symbol];
              const up = s ? s.change >= 0 : true;
              return (
                <button
                  key={w.symbol}
                  className={`watch-chip${activeSymbol === w.symbol ? " active" : ""}`}
                  onClick={() => { setActiveSymbol(w.symbol); fetchStock(w.symbol); }}
                >
                  <span className="watch-chip-symbol">{w.label}</span>
                  {s && (
                    <span
                      className="watch-chip-change"
                      style={{ color: up ? "var(--green)" : "var(--red)" }}
                    >
                      {up ? "▲" : "▼"} {Math.abs(s.changePercent).toFixed(2)}%
                    </span>
                  )}
                  {!s && loadingSymbols.has(w.symbol) && (
                    <span className="watch-chip-change" style={{ color: "var(--text-muted)" }}>...</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <StockChart symbol={activeSymbol} />

          {/* Cards */}
          <p className="section-title">行情卡片</p>
          <div className="cards-grid">
            {displayedSymbols
              .filter((sym) => stocks[sym])
              .map((sym) => (
                <StockCard
                  key={sym}
                  data={stocks[sym]}
                  active={activeSymbol === sym}
                  onClick={() => setActiveSymbol(sym)}
                />
              ))}
            {loadingSymbols.size > 0 &&
              Array.from(loadingSymbols).map((sym) => (
                <div key={sym} className="stock-card loading">
                  <div className="card-symbol" style={{ color: "var(--text-muted)" }}>{sym}</div>
                  <div className="loading-text" style={{ padding: "20px 0" }}>加载中...</div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}
