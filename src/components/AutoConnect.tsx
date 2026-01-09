'use client';

import { useEffect, useRef } from 'react';
import { useConnect, useAccount } from 'wagmi';

/**
 * AutoConnect component that automatically connects the wallet
 * when running inside the Base app (MiniKit context)
 */
export default function AutoConnect() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const hasAttemptedConnect = useRef(false);

  useEffect(() => {
    // Only attempt once and only if not already connected
    if (hasAttemptedConnect.current || isConnected) {
      return;
    }

    // Check if we're in the Base app context by detecting the SDK
    const isMiniApp = typeof window !== 'undefined' && (
      // Check for Base app user agent or embedded context
      window.navigator.userAgent.includes('Base') ||
      window.self !== window.top || // iframe detection
      // Check for Coinbase Wallet provider
      (window as any).ethereum?.isCoinbaseWallet ||
      (window as any).coinbaseWalletExtension
    );

    if (isMiniApp) {
      hasAttemptedConnect.current = true;
      
      // Find the Coinbase Wallet connector and auto-connect
      const coinbaseConnector = connectors.find(
        (c) => c.id === 'coinbaseWalletSDK' || c.id === 'coinbaseWallet'
      );
      
      if (coinbaseConnector) {
        // Small delay to ensure everything is loaded
        setTimeout(() => {
          connect({ connector: coinbaseConnector });
        }, 100);
      }
    }
  }, [connect, connectors, isConnected]);

  return null;
}







