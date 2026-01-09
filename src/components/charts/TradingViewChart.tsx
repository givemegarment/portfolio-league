'use client';

import { useEffect, useRef, memo } from 'react';

type TradingViewChartProps = {
  symbol: string;
  height?: number;
  interval?: string;
  showToolbar?: boolean;
};

/**
 * TradingView Advanced Chart Widget
 * Displays full-featured chart with indicators and drawing tools
 */
function TradingViewChart({
  symbol,
  height = 400,
  interval = 'D',
  showToolbar = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Map our symbols to TradingView format
  const tvSymbol = getTradingViewSymbol(symbol);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create container for widget
    const widgetContainer = document.createElement('div');
    widgetContainer.id = `tradingview_${symbol}_${Date.now()}`;
    widgetContainer.style.height = '100%';
    containerRef.current.appendChild(widgetContainer);

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0a0a0f',
          enable_publishing: false,
          hide_top_toolbar: !showToolbar,
          hide_legend: false,
          save_image: false,
          container_id: widgetContainer.id,
          backgroundColor: 'rgba(5, 5, 7, 1)',
          gridColor: 'rgba(255, 255, 255, 0.05)',
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
        });
      }
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
    };
  }, [tvSymbol, interval, showToolbar, symbol]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-xl border border-white/5 bg-[#050507]"
      style={{ height }}
    />
  );
}

/**
 * TradingView Mini Chart Widget
 * Compact chart for cards and previews
 */
export function MiniChart({
  symbol,
  height = 200,
  dateRange = '1M',
}: {
  symbol: string;
  height?: number;
  dateRange?: '1D' | '1M' | '3M' | '12M' | '60M' | 'ALL';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvSymbol = getTradingViewSymbol(symbol);

  useEffect(() => {
    if (!containerRef.current) return;

    const widgetId = `mini_${symbol}_${Date.now()}`;
    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.innerHTML = `
      <div class="tradingview-widget-container__widget" id="${widgetId}"></div>
    `;
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: tvSymbol,
      width: '100%',
      height: height,
      locale: 'en',
      dateRange: dateRange,
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
    });

    widgetContainer.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, height, dateRange, symbol]);

  return <div ref={containerRef} style={{ height }} />;
}

/**
 * TradingView Symbol Overview Widget
 * Shows price, change, and mini chart in one compact widget
 */
export function SymbolOverview({
  symbols,
  height = 400,
}: {
  symbols: string[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const tvSymbols = symbols.map(s => [getTradingViewSymbol(s), getDisplayName(s)]);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: tvSymbols,
      chartOnly: false,
      width: '100%',
      height: height,
      locale: 'en',
      colorTheme: 'dark',
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: true,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: 'Inter, sans-serif',
      fontSize: '10',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      lineWidth: 2,
      lineType: 0,
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', 'all|1W'],
    });

    widgetContainer.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbols, height]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-xl border border-white/5"
      style={{ height }}
    />
  );
}

/**
 * TradingView Ticker Tape Widget
 * Scrolling ticker of multiple symbols
 */
export function TickerTape({ symbols }: { symbols?: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultSymbols = ['BTC', 'ETH', 'SOL', 'PEPE', 'DEGEN', 'LINK'];
  const activeSymbols = symbols || defaultSymbols;

  const tvSymbols = activeSymbols.map(s => ({
    proName: getTradingViewSymbol(s),
    title: s,
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: tvSymbols,
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en',
    });

    widgetContainer.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbols]);

  return (
    <div ref={containerRef} className="h-12 overflow-hidden border-y border-white/5" />
  );
}

// Helper: Map asset symbols to TradingView format
function getTradingViewSymbol(symbol: string): string {
  const symbolMap: Record<string, string> = {
    // Majors
    BTC: 'BINANCE:BTCUSDT',
    ETH: 'BINANCE:ETHUSDT',
    SOL: 'BINANCE:SOLUSDT',
    // Stablecoins (show vs USD)
    USDC: 'COINBASE:USDCUSD',
    USDT: 'BINANCE:USDTUSD',
    DAI: 'COINBASE:DAIUSD',
    // Base Ecosystem
    AERO: 'BYBIT:AEROUSDT',
    DEGEN: 'BYBIT:DEGENUSDT',
    BRETT: 'BYBIT:BRETTUSDT',
    TOSHI: 'MEXC:TOSHIUSDT',
    HIGHER: 'MEXC:HIGHERUSDT',
    // L2
    OP: 'BINANCE:OPUSDT',
    ARB: 'BINANCE:ARBUSDT',
    POL: 'BINANCE:POLUSDT',
    // DeFi
    LINK: 'BINANCE:LINKUSDT',
    UNI: 'BINANCE:UNIUSDT',
    AAVE: 'BINANCE:AAVEUSDT',
    MKR: 'BINANCE:MKRUSDT',
    CRV: 'BINANCE:CRVUSDT',
    // Meme/AI
    PEPE: 'BINANCE:PEPEUSDT',
    WIF: 'BINANCE:WIFUSDT',
    BONK: 'BINANCE:BONKUSDT',
    RENDER: 'BINANCE:RENDERUSDT',
    FET: 'BINANCE:FETUSDT',
    // Alt L1s
    AVAX: 'BINANCE:AVAXUSDT',
    NEAR: 'BINANCE:NEARUSDT',
    INJ: 'BINANCE:INJUSDT',
    SUI: 'BINANCE:SUIUSDT',
    APT: 'BINANCE:APTUSDT',
  };

  return symbolMap[symbol] || `BINANCE:${symbol}USDT`;
}

// Helper: Get display name
function getDisplayName(symbol: string): string {
  const nameMap: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    SOL: 'Solana',
    PEPE: 'Pepe',
    DEGEN: 'Degen',
    LINK: 'Chainlink',
  };
  return nameMap[symbol] || symbol;
}

// Declare TradingView on window
declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

export default memo(TradingViewChart);
