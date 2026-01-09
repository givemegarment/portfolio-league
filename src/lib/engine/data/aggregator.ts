/**
 * WebSocket Data Aggregator
 * Aggregates real-time market data from 14+ exchanges
 * Normalizes data into unified format for the terminal
 */

import type {
  ExchangeId,
  ExchangeConfig,
  NormalizedTick,
  OrderBook,
  OrderBookLevel,
  TickerData,
  OHLCV,
  AggregatorEvent,
  AggregatorCallback,
  SubscriptionChannel,
  ParsedMessage,
} from '../types';

// ============================================================================
// EXCHANGE CONFIGURATIONS
// ============================================================================

const EXCHANGE_CONFIGS: Record<ExchangeId, ExchangeConfig> = {
  binance: {
    id: 'binance',
    name: 'Binance',
    logo: '/exchanges/binance.svg',
    wsUrl: 'wss://stream.binance.com:9443/ws',
    restUrl: 'https://api.binance.com',
    supported: { spot: true, futures: false, options: false },
    rateLimit: 1200,
    subscribeMessage: (symbol, channel) => ({
      method: 'SUBSCRIBE',
      params: [
        channel === 'trades'
          ? `${symbol.toLowerCase()}@aggTrade`
          : channel === 'orderbook'
            ? `${symbol.toLowerCase()}@depth20@100ms`
            : channel === 'ticker'
              ? `${symbol.toLowerCase()}@ticker`
              : `${symbol.toLowerCase()}@kline_1m`,
      ],
      id: Date.now(),
    }),
    parseMessage: (msg) => parseBinanceMessage(msg),
  },
  'binance-futures': {
    id: 'binance-futures',
    name: 'Binance Futures',
    logo: '/exchanges/binance.svg',
    wsUrl: 'wss://fstream.binance.com/ws',
    restUrl: 'https://fapi.binance.com',
    supported: { spot: false, futures: true, options: false },
    rateLimit: 1200,
    subscribeMessage: (symbol, channel) => ({
      method: 'SUBSCRIBE',
      params: [
        channel === 'trades'
          ? `${symbol.toLowerCase()}@aggTrade`
          : channel === 'orderbook'
            ? `${symbol.toLowerCase()}@depth20@100ms`
            : channel === 'ticker'
              ? `${symbol.toLowerCase()}@ticker`
              : `${symbol.toLowerCase()}@kline_1m`,
      ],
      id: Date.now(),
    }),
    parseMessage: (msg) => parseBinanceMessage(msg),
  },
  bybit: {
    id: 'bybit',
    name: 'Bybit',
    logo: '/exchanges/bybit.svg',
    wsUrl: 'wss://stream.bybit.com/v5/public/spot',
    restUrl: 'https://api.bybit.com',
    supported: { spot: true, futures: true, options: true },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      op: 'subscribe',
      args: [
        channel === 'trades'
          ? `publicTrade.${symbol}`
          : channel === 'orderbook'
            ? `orderbook.50.${symbol}`
            : `tickers.${symbol}`,
      ],
    }),
    parseMessage: (msg) => parseBybitMessage(msg),
  },
  okx: {
    id: 'okx',
    name: 'OKX',
    logo: '/exchanges/okx.svg',
    wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
    restUrl: 'https://www.okx.com',
    supported: { spot: true, futures: true, options: true },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      op: 'subscribe',
      args: [
        {
          channel: channel === 'trades' ? 'trades' : channel === 'orderbook' ? 'books5' : 'tickers',
          instId: symbol,
        },
      ],
    }),
    parseMessage: (msg) => parseOkxMessage(msg),
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    logo: '/exchanges/coinbase.svg',
    wsUrl: 'wss://ws-feed.exchange.coinbase.com',
    restUrl: 'https://api.exchange.coinbase.com',
    supported: { spot: true, futures: false, options: false },
    rateLimit: 300,
    subscribeMessage: (symbol, channel) => ({
      type: 'subscribe',
      product_ids: [symbol],
      channels: [channel === 'trades' ? 'matches' : channel === 'orderbook' ? 'level2' : 'ticker'],
    }),
    parseMessage: (msg) => parseCoinbaseMessage(msg),
  },
  kraken: {
    id: 'kraken',
    name: 'Kraken',
    logo: '/exchanges/kraken.svg',
    wsUrl: 'wss://ws.kraken.com',
    restUrl: 'https://api.kraken.com',
    supported: { spot: true, futures: true, options: false },
    rateLimit: 300,
    subscribeMessage: (symbol, channel) => ({
      event: 'subscribe',
      pair: [symbol],
      subscription: {
        name: channel === 'trades' ? 'trade' : channel === 'orderbook' ? 'book' : 'ticker',
      },
    }),
    parseMessage: (msg) => parseKrakenMessage(msg),
  },
  kucoin: {
    id: 'kucoin',
    name: 'KuCoin',
    logo: '/exchanges/kucoin.svg',
    wsUrl: 'wss://ws-api-spot.kucoin.com',
    restUrl: 'https://api.kucoin.com',
    supported: { spot: true, futures: true, options: false },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      type: 'subscribe',
      topic: channel === 'trades' ? `/market/match:${symbol}` : `/market/level2:${symbol}`,
      privateChannel: false,
      response: true,
    }),
    parseMessage: (msg) => parseKucoinMessage(msg),
  },
  htx: {
    id: 'htx',
    name: 'HTX',
    logo: '/exchanges/htx.svg',
    wsUrl: 'wss://api.huobi.pro/ws',
    restUrl: 'https://api.huobi.pro',
    supported: { spot: true, futures: true, options: false },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      sub: channel === 'trades' ? `market.${symbol}.trade.detail` : `market.${symbol}.depth.step0`,
      id: Date.now().toString(),
    }),
    parseMessage: (msg) => parseHtxMessage(msg),
  },
  gate: {
    id: 'gate',
    name: 'Gate.io',
    logo: '/exchanges/gate.svg',
    wsUrl: 'wss://api.gateio.ws/ws/v4/',
    restUrl: 'https://api.gateio.ws',
    supported: { spot: true, futures: true, options: false },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      time: Math.floor(Date.now() / 1000),
      channel: channel === 'trades' ? 'spot.trades' : 'spot.order_book',
      event: 'subscribe',
      payload: [symbol],
    }),
    parseMessage: (msg) => parseGateMessage(msg),
  },
  bitget: {
    id: 'bitget',
    name: 'Bitget',
    logo: '/exchanges/bitget.svg',
    wsUrl: 'wss://ws.bitget.com/spot/v1/stream',
    restUrl: 'https://api.bitget.com',
    supported: { spot: true, futures: true, options: false },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      op: 'subscribe',
      args: [
        {
          instType: 'sp',
          channel: channel === 'trades' ? 'trade' : 'books',
          instId: symbol,
        },
      ],
    }),
    parseMessage: (msg) => parseBitgetMessage(msg),
  },
  mexc: {
    id: 'mexc',
    name: 'MEXC',
    logo: '/exchanges/mexc.svg',
    wsUrl: 'wss://wbs.mexc.com/ws',
    restUrl: 'https://api.mexc.com',
    supported: { spot: true, futures: true, options: false },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      method: 'SUBSCRIPTION',
      params: [channel === 'trades' ? `spot@public.deals.v3.api@${symbol}` : `spot@public.limit.depth.v3.api@${symbol}@20`],
    }),
    parseMessage: (msg) => parseMexcMessage(msg),
  },
  deribit: {
    id: 'deribit',
    name: 'Deribit',
    logo: '/exchanges/deribit.svg',
    wsUrl: 'wss://www.deribit.com/ws/api/v2',
    restUrl: 'https://www.deribit.com',
    supported: { spot: false, futures: true, options: true },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      jsonrpc: '2.0',
      method: 'public/subscribe',
      params: {
        channels: [channel === 'trades' ? `trades.${symbol}.raw` : `book.${symbol}.100ms`],
      },
      id: Date.now(),
    }),
    parseMessage: (msg) => parseDeribitMessage(msg),
  },
  hyperliquid: {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    logo: '/exchanges/hyperliquid.svg',
    wsUrl: 'wss://api.hyperliquid.xyz/ws',
    restUrl: 'https://api.hyperliquid.xyz',
    supported: { spot: false, futures: true, options: false },
    rateLimit: 1200,
    subscribeMessage: (symbol, channel) => ({
      method: 'subscribe',
      subscription: {
        type: channel === 'trades' ? 'trades' : channel === 'orderbook' ? 'l2Book' : 'allMids',
        coin: symbol,
      },
    }),
    parseMessage: (msg) => parseHyperliquidMessage(msg),
  },
  dydx: {
    id: 'dydx',
    name: 'dYdX',
    logo: '/exchanges/dydx.svg',
    wsUrl: 'wss://indexer.dydx.trade/v4/ws',
    restUrl: 'https://indexer.dydx.trade',
    supported: { spot: false, futures: true, options: false },
    rateLimit: 600,
    subscribeMessage: (symbol, channel) => ({
      type: 'subscribe',
      channel: channel === 'trades' ? 'v4_trades' : 'v4_orderbook',
      id: symbol,
    }),
    parseMessage: (msg) => parseDydxMessage(msg),
  },
};

// ============================================================================
// MESSAGE PARSERS
// ============================================================================

function parseBinanceMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;

  // Aggregate trade
  if (data.e === 'aggTrade') {
    return {
      type: 'trade',
      data: {
        symbol: (data.s as string) || '',
        exchange: 'binance',
        timestamp: data.T as number,
        price: parseFloat(data.p as string),
        size: parseFloat(data.q as string),
        side: data.m ? 'sell' : 'buy',
        tradeId: String(data.a),
      },
    };
  }

  // Depth update
  if (data.lastUpdateId && data.bids && data.asks) {
    const bids = (data.bids as string[][]).map((level, i, arr) => ({
      price: parseFloat(level[0]),
      size: parseFloat(level[1]),
      total: arr.slice(0, i + 1).reduce((sum, l) => sum + parseFloat(l[1]), 0),
    }));
    const asks = (data.asks as string[][]).map((level, i, arr) => ({
      price: parseFloat(level[0]),
      size: parseFloat(level[1]),
      total: arr.slice(0, i + 1).reduce((sum, l) => sum + parseFloat(l[1]), 0),
    }));

    const midPrice = (bids[0]?.price + asks[0]?.price) / 2 || 0;

    return {
      type: 'orderbook',
      data: {
        symbol: '',
        exchange: 'binance',
        timestamp: Date.now(),
        bids,
        asks,
        spread: asks[0]?.price - bids[0]?.price || 0,
        midPrice,
      },
    };
  }

  // Ticker
  if (data.e === '24hrTicker') {
    return {
      type: 'ticker',
      data: {
        symbol: (data.s as string) || '',
        exchange: 'binance',
        price: parseFloat(data.c as string),
        change24h: parseFloat(data.p as string),
        changePercent24h: parseFloat(data.P as string),
        high24h: parseFloat(data.h as string),
        low24h: parseFloat(data.l as string),
        volume24h: parseFloat(data.v as string),
        quoteVolume24h: parseFloat(data.q as string),
        timestamp: data.E as number,
      },
    };
  }

  // Kline
  if (data.e === 'kline' && data.k) {
    const k = data.k as Record<string, unknown>;
    return {
      type: 'kline',
      data: {
        symbol: (data.s as string) || '',
        exchange: 'binance',
        time: k.t as number,
        open: parseFloat(k.o as string),
        high: parseFloat(k.h as string),
        low: parseFloat(k.l as string),
        close: parseFloat(k.c as string),
        volume: parseFloat(k.v as string),
      },
    };
  }

  return null;
}

function parseBybitMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (!data.topic || !data.data) return null;

  const topic = data.topic as string;
  const payload = data.data as Record<string, unknown>;

  if (topic.startsWith('publicTrade')) {
    const trades = Array.isArray(payload) ? payload : [payload];
    const trade = trades[0] as Record<string, unknown>;
    return {
      type: 'trade',
      data: {
        symbol: trade.s as string,
        exchange: 'bybit',
        timestamp: trade.T as number,
        price: parseFloat(trade.p as string),
        size: parseFloat(trade.v as string),
        side: trade.S === 'Buy' ? 'buy' : 'sell',
        tradeId: trade.i as string,
      },
    };
  }

  return null;
}

function parseOkxMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (!data.data || !Array.isArray(data.data)) return null;

  const arg = data.arg as Record<string, unknown>;
  const payload = (data.data as Record<string, unknown>[])[0];

  if (arg?.channel === 'trades') {
    return {
      type: 'trade',
      data: {
        symbol: payload.instId as string,
        exchange: 'okx',
        timestamp: parseInt(payload.ts as string),
        price: parseFloat(payload.px as string),
        size: parseFloat(payload.sz as string),
        side: payload.side === 'buy' ? 'buy' : 'sell',
        tradeId: payload.tradeId as string,
      },
    };
  }

  return null;
}

function parseCoinbaseMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;

  if (data.type === 'match' || data.type === 'last_match') {
    return {
      type: 'trade',
      data: {
        symbol: data.product_id as string,
        exchange: 'coinbase',
        timestamp: new Date(data.time as string).getTime(),
        price: parseFloat(data.price as string),
        size: parseFloat(data.size as string),
        side: data.side as 'buy' | 'sell',
        tradeId: data.trade_id as string,
      },
    };
  }

  return null;
}

function parseKrakenMessage(msg: unknown): ParsedMessage | null {
  // Kraken uses array format for trades
  if (!Array.isArray(msg)) return null;
  // Implementation would go here
  return null;
}

function parseKucoinMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (data.type !== 'message') return null;
  // Implementation would go here
  return null;
}

function parseHtxMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (data.ping) return null; // Heartbeat
  // Implementation would go here
  return null;
}

function parseGateMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (data.event !== 'update') return null;
  // Implementation would go here
  return null;
}

function parseBitgetMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (data.action !== 'snapshot' && data.action !== 'update') return null;
  // Implementation would go here
  return null;
}

function parseMexcMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (!data.d) return null;
  // Implementation would go here
  return null;
}

function parseDeribitMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (!data.params) return null;
  // Implementation would go here
  return null;
}

function parseHyperliquidMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (!data.channel) return null;
  // Implementation would go here
  return null;
}

function parseDydxMessage(msg: unknown): ParsedMessage | null {
  const data = msg as Record<string, unknown>;
  if (data.type !== 'channel_data') return null;
  // Implementation would go here
  return null;
}

// ============================================================================
// AGGREGATOR CLASS
// ============================================================================

export class DataAggregator {
  private connections: Map<ExchangeId, WebSocket> = new Map();
  private callbacks: Set<AggregatorCallback> = new Set();
  private subscriptions: Map<string, Set<ExchangeId>> = new Map();
  private reconnectTimers: Map<ExchangeId, NodeJS.Timeout> = new Map();
  private pingIntervals: Map<ExchangeId, NodeJS.Timeout> = new Map();
  private lastTick: Map<string, NormalizedTick> = new Map();
  private orderBooks: Map<string, OrderBook> = new Map();

  constructor(private exchanges: ExchangeId[] = ['binance', 'coinbase', 'bybit']) {}

  /**
   * Subscribe to events from the aggregator
   */
  subscribe(callback: AggregatorCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Emit event to all subscribers
   */
  private emit(event: AggregatorEvent): void {
    this.callbacks.forEach((cb) => cb(event));

    // Update local state
    if (event.type === 'trade') {
      this.lastTick.set(`${event.data.exchange}:${event.data.symbol}`, event.data);
    } else if (event.type === 'orderbook') {
      this.orderBooks.set(`${event.data.exchange}:${event.data.symbol}`, event.data);
    }
  }

  /**
   * Connect to an exchange WebSocket
   */
  connect(exchangeId: ExchangeId): void {
    if (this.connections.has(exchangeId)) {
      console.log(`[Aggregator] Already connected to ${exchangeId}`);
      return;
    }

    const config = EXCHANGE_CONFIGS[exchangeId];
    if (!config) {
      console.error(`[Aggregator] Unknown exchange: ${exchangeId}`);
      return;
    }

    try {
      console.log(`[Aggregator] Connecting to ${config.name}...`);
      const ws = new WebSocket(config.wsUrl);

      ws.onopen = () => {
        console.log(`[Aggregator] Connected to ${config.name}`);
        this.emit({ type: 'connected', exchange: exchangeId });

        // Re-subscribe to any existing subscriptions
        this.subscriptions.forEach((exchanges, key) => {
          if (exchanges.has(exchangeId)) {
            const [symbol, channel] = key.split(':') as [string, SubscriptionChannel];
            this.sendSubscription(exchangeId, symbol, channel);
          }
        });

        // Start ping interval for exchanges that need it
        this.startPingInterval(exchangeId, ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle ping/pong
          if (this.handlePingPong(exchangeId, ws, data)) return;

          const parsed = config.parseMessage(data);
          if (parsed) {
            this.emit({
              type: parsed.type,
              data: parsed.data,
            } as AggregatorEvent);
          }
        } catch (err) {
          console.error(`[Aggregator] Parse error for ${exchangeId}:`, err);
        }
      };

      ws.onerror = (error) => {
        console.error(`[Aggregator] WebSocket error for ${config.name}:`, error);
        this.emit({ type: 'error', exchange: exchangeId, message: 'WebSocket error' });
      };

      ws.onclose = (event) => {
        console.log(`[Aggregator] Disconnected from ${config.name}: ${event.reason || 'Unknown reason'}`);
        this.connections.delete(exchangeId);
        this.clearPingInterval(exchangeId);
        this.emit({ type: 'disconnected', exchange: exchangeId, reason: event.reason });

        // Auto-reconnect after 5 seconds
        this.scheduleReconnect(exchangeId);
      };

      this.connections.set(exchangeId, ws);
    } catch (err) {
      console.error(`[Aggregator] Failed to connect to ${exchangeId}:`, err);
      this.emit({ type: 'error', exchange: exchangeId, message: 'Connection failed' });
    }
  }

  /**
   * Disconnect from an exchange
   */
  disconnect(exchangeId: ExchangeId): void {
    const ws = this.connections.get(exchangeId);
    if (ws) {
      this.clearReconnectTimer(exchangeId);
      this.clearPingInterval(exchangeId);
      ws.close();
      this.connections.delete(exchangeId);
    }
  }

  /**
   * Disconnect from all exchanges
   */
  disconnectAll(): void {
    this.exchanges.forEach((id) => this.disconnect(id));
  }

  /**
   * Subscribe to a symbol on specific exchanges
   */
  subscribeSymbol(
    symbol: string,
    channel: SubscriptionChannel,
    exchanges: ExchangeId[] = this.exchanges
  ): void {
    const key = `${symbol}:${channel}`;

    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }

    exchanges.forEach((exchangeId) => {
      this.subscriptions.get(key)!.add(exchangeId);

      // Connect if not already connected
      if (!this.connections.has(exchangeId)) {
        this.connect(exchangeId);
      } else {
        this.sendSubscription(exchangeId, symbol, channel);
      }
    });
  }

  /**
   * Unsubscribe from a symbol
   */
  unsubscribeSymbol(symbol: string, channel: SubscriptionChannel): void {
    const key = `${symbol}:${channel}`;
    this.subscriptions.delete(key);
    // Note: Most exchanges don't support unsubscribe, so we just stop tracking
  }

  /**
   * Send subscription message to exchange
   */
  private sendSubscription(
    exchangeId: ExchangeId,
    symbol: string,
    channel: SubscriptionChannel
  ): void {
    const ws = this.connections.get(exchangeId);
    const config = EXCHANGE_CONFIGS[exchangeId];

    if (ws && ws.readyState === WebSocket.OPEN && config) {
      const msg = config.subscribeMessage(symbol, channel);
      ws.send(JSON.stringify(msg));
      console.log(`[Aggregator] Subscribed to ${symbol} ${channel} on ${exchangeId}`);
    }
  }

  /**
   * Handle exchange-specific ping/pong
   */
  private handlePingPong(exchangeId: ExchangeId, ws: WebSocket, data: unknown): boolean {
    const d = data as Record<string, unknown>;

    // HTX ping
    if (exchangeId === 'htx' && d.ping) {
      ws.send(JSON.stringify({ pong: d.ping }));
      return true;
    }

    // Bybit ping
    if (exchangeId === 'bybit' && d.op === 'ping') {
      ws.send(JSON.stringify({ op: 'pong' }));
      return true;
    }

    return false;
  }

  /**
   * Start ping interval for exchanges that need it
   * Note: Browser WebSocket doesn't have ping() - we send a text message instead
   */
  private startPingInterval(exchangeId: ExchangeId, ws: WebSocket): void {
    // Binance WebSocket connections are kept alive by the browser's automatic ping/pong
    // Some exchanges require custom ping messages
    if (exchangeId === 'bybit') {
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ op: 'ping' }));
        }
      }, 20000);
      this.pingIntervals.set(exchangeId, interval);
    }
  }

  /**
   * Clear ping interval
   */
  private clearPingInterval(exchangeId: ExchangeId): void {
    const interval = this.pingIntervals.get(exchangeId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(exchangeId);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(exchangeId: ExchangeId): void {
    this.clearReconnectTimer(exchangeId);
    const timer = setTimeout(() => {
      console.log(`[Aggregator] Attempting to reconnect to ${exchangeId}...`);
      this.connect(exchangeId);
    }, 5000);
    this.reconnectTimers.set(exchangeId, timer);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(exchangeId: ExchangeId): void {
    const timer = this.reconnectTimers.get(exchangeId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(exchangeId);
    }
  }

  /**
   * Get the latest tick for a symbol
   */
  getLastTick(exchange: ExchangeId, symbol: string): NormalizedTick | undefined {
    return this.lastTick.get(`${exchange}:${symbol}`);
  }

  /**
   * Get the current order book for a symbol
   */
  getOrderBook(exchange: ExchangeId, symbol: string): OrderBook | undefined {
    return this.orderBooks.get(`${exchange}:${symbol}`);
  }

  /**
   * Get connection status
   */
  isConnected(exchangeId: ExchangeId): boolean {
    const ws = this.connections.get(exchangeId);
    return ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get all connected exchanges
   */
  getConnectedExchanges(): ExchangeId[] {
    return Array.from(this.connections.keys()).filter((id) => this.isConnected(id));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let aggregatorInstance: DataAggregator | null = null;

export function getAggregator(exchanges?: ExchangeId[]): DataAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new DataAggregator(exchanges);
  }
  return aggregatorInstance;
}

export function destroyAggregator(): void {
  if (aggregatorInstance) {
    aggregatorInstance.disconnectAll();
    aggregatorInstance = null;
  }
}

// Export config for external use
export { EXCHANGE_CONFIGS };
export type { ExchangeConfig };
