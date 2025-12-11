'use client';

import { useState, useEffect, useRef } from 'react';
import {
  getStoredNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  formatNotificationTime,
  NOTIFICATION_META,
  type Notification,
} from '@/lib/notifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getStoredNotifications());
      setUnreadCount(getUnreadCount());
    };

    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    const updated = markAsRead(id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const handleMarkAllAsRead = () => {
    const updated = markAllAsRead();
    setNotifications(updated);
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-rose text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-base-blue hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg
                  className="mx-auto h-10 w-10 text-white/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="mt-2 text-sm text-white/40">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => {
                  const meta = NOTIFICATION_META[notification.type];

                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                        !notification.read ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                          style={{ backgroundColor: `${meta.color}20` }}
                        >
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${
                              notification.read ? 'text-white/60' : 'text-white'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 shrink-0 rounded-full bg-base-blue" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-white/40 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-white/30">
                            {formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/5 px-4 py-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-xs text-white/40 hover:text-white/60"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



