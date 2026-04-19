export const ASSETS = ["BTC", "ETH", "SPY", "QQQ", "AAPL", "TSLA", "SOL"] as const;
export type Asset = (typeof ASSETS)[number];

export const TIMEFRAMES = ["1H", "4H", "Daily", "Weekly"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const YAHOO_SYMBOLS: Record<Asset, string> = {
  BTC: "BTC-USD",
  ETH: "ETH-USD",
  SPY: "SPY",
  QQQ: "QQQ",
  AAPL: "AAPL",
  TSLA: "TSLA",
  SOL: "SOL-USD",
};

export const YAHOO_INTERVALS: Record<Timeframe, string> = {
  "1H": "1h",
  "4H": "4h",
  Daily: "1d",
  Weekly: "1wk",
};
