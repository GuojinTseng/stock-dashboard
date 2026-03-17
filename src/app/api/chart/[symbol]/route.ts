import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

const PERIOD_MAP: Record<string, { period1: Date; interval: "1d" | "1wk" }> = {
  "1M": { period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), interval: "1d" },
  "3M": { period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), interval: "1d" },
  "1Y": { period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), interval: "1wk" },
  "5Y": { period1: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), interval: "1wk" },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const period = req.nextUrl.searchParams.get("period") || "3M";
  const cfg = PERIOD_MAP[period] || PERIOD_MAP["3M"];

  try {
    const result = (await yahooFinance.historical(symbol.toUpperCase(), {
      period1: cfg.period1,
      interval: cfg.interval as any,
    })) as any[];

    const data = result.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      close: r.close,
      open: r.open,
      high: r.high,
      low: r.low,
      volume: r.volume,
    }));

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: `无法获取 ${symbol} 的历史数据` },
      { status: 404 }
    );
  }
}
