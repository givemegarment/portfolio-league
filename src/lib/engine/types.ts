/**
 * Core types for the Imitatio Pro Terminal
 * Kiyotaka-style professional trading interface
 */

// ============================================================================
// MARKET DATA TYPES
// ============================================================================

export interface NormalizedTick {
  symbol: string;
  exchange: string;
  timestamp: number;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  tradeId?: string;
}

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number; // Cumulative size
}

export interface OrderBook {
  symbol: string;
  exchange: string;
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  midPrice: number;
}

export interface FootprintBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta: number; // Buy volume - Sell volume
  levels: FootprintLevel[];
  poc: number; // Point of Control (highest volume price)
}

export interface FootprintLevel {
  price: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  totalVolume: number;
}

export interface VolumeProfile {
  levels: VolumeProfileLevel[];
  poc: number;
  valueAreaHigh: number;
  valueAreaLow: number;
  totalVolume: number;
}

export interface VolumeProfileLevel {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  percentage: number;
}

// ============================================================================
// EXCHANGE CONFIGURATION
// ============================================================================

export type ExchangeId =
  | 'binance'
  | 'binance-futures'
  | 'bybit'
  | 'okx'
  | 'coinbase'
  | 'kraken'
  | 'kucoin'
  | 'htx'
  | 'gate'
  | 'bitget'
  | 'mexc'
  | 'deribit'
  | 'hyperliquid'
  | 'dydx';

export interface ExchangeConfig {
  id: ExchangeId;
  name: string;
  logo: string;
  wsUrl: string;
  restUrl: string;
  supported: {
    spot: boolean;
    futures: boolean;
    options: boolean;
  };
  rateLimit: number;
  subscribeMessage: (symbol: string, channel: SubscriptionChannel) => object;
  parseMessage: (msg: unknown) => ParsedMessage | null;
}

export type SubscriptionChannel =
  | 'trades'
  | 'orderbook'
  | 'ticker'
  | 'kline';

export interface ParsedMessage {
  type: 'trade' | 'orderbook' | 'ticker' | 'kline';
  data: NormalizedTick | OrderBook | TickerData | OHLCV;
}

export interface TickerData {
  symbol: string;
  exchange: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  timestamp: number;
}

// ============================================================================
// TERMINAL LAYOUT TYPES
// ============================================================================

export type WidgetType =
  | 'chart'
  | 'orderbook'
  | 'trades'
  | 'ticker'
  | 'watchlist'
  | 'positions'
  | 'orders'
  | 'news'
  | 'alerts'
  | 'dom' // Depth of Market
  | 'footprint'
  | 'heatmap'
  | 'volumeProfile';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  symbol?: string;
  exchange?: ExchangeId;
  timeframe?: Timeframe;
  settings?: Record<string, unknown>;
}

export interface PanelConfig {
  id: string;
  widgets: WidgetConfig[];
  direction: 'horizontal' | 'vertical';
  sizes: number[];
}

export interface TerminalLayout {
  id: string;
  name: string;
  description?: string;
  panels: PanelConfig[];
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
  isShared?: boolean;
  shareId?: string;
}

// ============================================================================
// TIMEFRAMES
// ============================================================================

export type Timeframe =
  | '1s' | '5s' | '15s' | '30s'
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M';

export const TIMEFRAME_MS: Record<Timeframe, number> = {
  '1s': 1000,
  '5s': 5000,
  '15s': 15000,
  '30s': 30000,
  '1m': 60000,
  '3m': 180000,
  '5m': 300000,
  '15m': 900000,
  '30m': 1800000,
  '1h': 3600000,
  '2h': 7200000,
  '4h': 14400000,
  '6h': 21600000,
  '8h': 28800000,
  '12h': 43200000,
  '1d': 86400000,
  '3d': 259200000,
  '1w': 604800000,
  '1M': 2592000000,
};

// ============================================================================
// CHART TYPES
// ============================================================================

export type ChartType =
  | 'candles'
  | 'line'
  | 'area'
  | 'bars'
  | 'heikinAshi'
  | 'renko'
  | 'footprint'
  | 'volumeProfile';

export interface ChartSettings {
  type: ChartType;
  timeframe: Timeframe;
  showVolume: boolean;
  showGrid: boolean;
  showCrosshair: boolean;
  showLegend: boolean;
  indicators: IndicatorConfig[];
  drawings: DrawingConfig[];
  theme: 'dark' | 'light';
}

export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  params: Record<string, number | string | boolean>;
  visible: boolean;
  overlay: boolean; // true = on price chart, false = separate pane
  color?: string;
  lineWidth?: number;
}

export type IndicatorType =
  | 'sma' | 'ema' | 'wma' | 'vwap' | 'vwma'
  | 'bollinger' | 'keltner' | 'donchian'
  | 'rsi' | 'stochastic' | 'cci' | 'mfi' | 'williams'
  | 'macd' | 'adx' | 'atr' | 'obv' | 'cmf'
  | 'ichimoku' | 'supertrend' | 'pivots'
  | 'volumeProfile' | 'vwapBands' | 'anchoredVwap';

export interface DrawingConfig {
  id: string;
  type: DrawingType;
  points: { time: number; price: number }[];
  style: DrawingStyle;
  visible: boolean;
  locked: boolean;
}

export type DrawingType =
  | 'trendline' | 'ray' | 'horizontalLine' | 'verticalLine'
  | 'channel' | 'pitchfork' | 'fibRetracement' | 'fibExtension'
  | 'rectangle' | 'ellipse' | 'triangle'
  | 'text' | 'arrow' | 'icon';

export interface DrawingStyle {
  color: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  fillColor?: string;
  fillOpacity?: number;
  fontSize?: number;
}

// ============================================================================
// AGGREGATOR TYPES
// ============================================================================

export interface AggregatorState {
  connected: boolean;
  subscriptions: Map<string, Set<ExchangeId>>;
  lastTick: Map<string, NormalizedTick>;
  orderBooks: Map<string, OrderBook>;
  reconnectAttempts: number;
  error: string | null;
}

export type AggregatorEvent =
  | { type: 'connected'; exchange: ExchangeId }
  | { type: 'disconnected'; exchange: ExchangeId; reason?: string }
  | { type: 'trade'; data: NormalizedTick }
  | { type: 'orderbook'; data: OrderBook }
  | { type: 'ticker'; data: TickerData }
  | { type: 'kline'; data: OHLCV & { symbol: string; exchange: string } }
  | { type: 'error'; exchange: ExchangeId; message: string };

export type AggregatorCallback = (event: AggregatorEvent) => void;

// ============================================================================
// SYMBOL TYPES
// ============================================================================

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  exchange: ExchangeId;
  type: 'spot' | 'perpetual' | 'future' | 'option';
  pricePrecision: number;
  quantityPrecision: number;
  minQuantity: number;
  maxQuantity: number;
  tickSize: number;
  contractSize?: number;
  expirationDate?: number;
}

// ============================================================================
// THEME
// ============================================================================

export interface TerminalTheme {
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textMuted: string;
  textDimmed: string;
  accent: string;
  accentHover: string;
  bullish: string;
  bullishBg: string;
  bearish: string;
  bearishBg: string;
  warning: string;
  error: string;
  gridLines: string;
  crosshair: string;
}

export const DARK_THEME: TerminalTheme = {
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceHover: '#1a1a24',
  border: 'rgba(255, 255, 255, 0.06)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textDimmed: 'rgba(255, 255, 255, 0.3)',
  accent: '#0052FF',
  accentHover: '#0066FF',
  bullish: '#10B981',
  bullishBg: 'rgba(16, 185, 129, 0.1)',
  bearish: '#EF4444',
  bearishBg: 'rgba(239, 68, 68, 0.1)',
  warning: '#F59E0B',
  error: '#EF4444',
  gridLines: 'rgba(255, 255, 255, 0.03)',
  crosshair: 'rgba(255, 255, 255, 0.3)',
};
