'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

// You would generate these with web-push library
// For now, these are placeholders - replace with your actual VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

export default function NotificationPermission() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }

    // Get current permission state
    setPermission(Notification.permission as PermissionState);

    // Check if already subscribed
    checkSubscription();

    // Show banner after delay if not subscribed and permission not denied
    const timer = setTimeout(() => {
      if (Notification.permission === 'default') {
        setShowBanner(true);
      }
    }, 10000); // Show after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      console.warn('VAPID public key not configured');
      // Still request permission for future use
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      setShowBanner(false);
      return;
    }

    setIsLoading(true);

    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result !== 'granted') {
        setShowBanner(false);
        setIsLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAddress: address,
        }),
      });

      setIsSubscribed(true);
      setShowBanner(false);

      // Show a test notification
      registration.showNotification('Notifications Enabled! 🎉', {
        body: 'You\'ll now receive updates about competitions and rankings.',
        icon: '/icon.svg',
        badge: '/icon-simple.svg',
      });
    } catch (error) {
      console.error('Error subscribing to push:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notification_banner_dismissed', Date.now().toString());
  };

  // Don't show if unsupported, denied, or already subscribed
  if (permission === 'unsupported' || permission === 'denied' || isSubscribed || !showBanner) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-40 animate-fade-in-down sm:left-auto sm:right-4 sm:w-96">
      <div className="rounded-2xl border border-base-blue/20 bg-surface-2/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-blue/20">
            <svg className="h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white">Stay Updated</h3>
            <p className="mt-1 text-sm text-white/60">
              Get notified about rank changes, competition results, and more
            </p>
          </div>

          {/* Close */}
          <button onClick={dismiss} className="text-white/40 hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={subscribe}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-base-blue px-4 py-2 text-sm font-semibold text-white hover:bg-base-blue-light transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enabling...
              </span>
            ) : (
              'Enable Notifications'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


