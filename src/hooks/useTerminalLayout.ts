/**
 * Terminal Layout Management Hook
 * Handles saving, loading, and sharing terminal layouts
 */

import { useState, useCallback, useEffect } from 'react';
import type { TerminalLayout, WidgetConfig, PanelConfig } from '@/lib/engine/types';

const STORAGE_KEY = 'imitatio_terminal_layouts';
const DEFAULT_LAYOUT_ID = 'default';

// Default layout configuration
const DEFAULT_LAYOUT: TerminalLayout = {
  id: DEFAULT_LAYOUT_ID,
  name: 'Default Layout',
  description: 'Standard trading view with chart, order book, and trades',
  panels: [
    {
      id: 'main',
      widgets: [
        { id: 'chart-1', type: 'chart', title: 'Price Chart' },
        { id: 'trades-1', type: 'trades', title: 'Recent Trades' },
      ],
      direction: 'vertical',
      sizes: [75, 25],
    },
    {
      id: 'sidebar',
      widgets: [
        { id: 'orderbook-1', type: 'orderbook', title: 'Order Book' },
      ],
      direction: 'vertical',
      sizes: [100],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isDefault: true,
};

// Preset layouts
const PRESET_LAYOUTS: TerminalLayout[] = [
  DEFAULT_LAYOUT,
  {
    id: 'scalper',
    name: 'Scalper View',
    description: 'Fast execution layout with DOM and time & sales',
    panels: [
      {
        id: 'left',
        widgets: [
          { id: 'chart-1', type: 'chart', title: 'Chart', timeframe: '1m' },
        ],
        direction: 'vertical',
        sizes: [100],
      },
      {
        id: 'center',
        widgets: [
          { id: 'dom-1', type: 'dom', title: 'DOM' },
          { id: 'trades-1', type: 'trades', title: 'T&S' },
        ],
        direction: 'vertical',
        sizes: [50, 50],
      },
      {
        id: 'right',
        widgets: [
          { id: 'orderbook-1', type: 'orderbook', title: 'Book' },
          { id: 'positions-1', type: 'positions', title: 'Positions' },
        ],
        direction: 'vertical',
        sizes: [60, 40],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'analysis',
    name: 'Analysis View',
    description: 'Multi-timeframe analysis with volume profile',
    panels: [
      {
        id: 'charts',
        widgets: [
          { id: 'chart-1', type: 'chart', title: '1H Chart', timeframe: '1h' },
          { id: 'chart-2', type: 'chart', title: '15M Chart', timeframe: '15m' },
        ],
        direction: 'horizontal',
        sizes: [50, 50],
      },
      {
        id: 'tools',
        widgets: [
          { id: 'vp-1', type: 'volumeProfile', title: 'Volume Profile' },
          { id: 'orderbook-1', type: 'orderbook', title: 'Order Book' },
        ],
        direction: 'vertical',
        sizes: [50, 50],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export interface UseTerminalLayoutOptions {
  layoutId?: string;
  isShared?: boolean;
  onLayoutChange?: (layout: TerminalLayout) => void;
}

export interface UseTerminalLayoutReturn {
  layout: TerminalLayout;
  layouts: TerminalLayout[];
  isLoading: boolean;
  error: string | null;
  saveLayout: (layout: TerminalLayout) => void;
  deleteLayout: (layoutId: string) => void;
  duplicateLayout: (layoutId: string, newName: string) => TerminalLayout;
  shareLayout: (layoutId: string) => Promise<string>;
  loadSharedLayout: (shareId: string) => Promise<TerminalLayout | null>;
  setActiveLayout: (layoutId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  updatePanelSizes: (panelId: string, sizes: number[]) => void;
  resetToDefault: () => void;
}

export function useTerminalLayout({
  layoutId,
  isShared = false,
  onLayoutChange,
}: UseTerminalLayoutOptions = {}): UseTerminalLayoutReturn {
  const [layouts, setLayouts] = useState<TerminalLayout[]>(PRESET_LAYOUTS);
  const [activeLayoutId, setActiveLayoutId] = useState<string>(layoutId || DEFAULT_LAYOUT_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current layout
  const layout = layouts.find((l) => l.id === activeLayoutId) || DEFAULT_LAYOUT;

  // Load layouts from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userLayouts = JSON.parse(stored) as TerminalLayout[];
        // Merge preset layouts with user layouts (user layouts take precedence)
        const mergedLayouts = [...PRESET_LAYOUTS];
        userLayouts.forEach((userLayout) => {
          const existingIndex = mergedLayouts.findIndex((l) => l.id === userLayout.id);
          if (existingIndex >= 0) {
            mergedLayouts[existingIndex] = userLayout;
          } else {
            mergedLayouts.push(userLayout);
          }
        });
        setLayouts(mergedLayouts);
      }
    } catch (err) {
      console.error('Failed to load layouts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load shared layout if provided
  useEffect(() => {
    if (isShared && layoutId) {
      loadSharedLayout(layoutId).then((sharedLayout) => {
        if (sharedLayout) {
          setLayouts((prev) => [...prev, sharedLayout]);
          setActiveLayoutId(sharedLayout.id);
        }
      });
    }
  }, [isShared, layoutId]);

  // Save layouts to storage
  const persistLayouts = useCallback((updatedLayouts: TerminalLayout[]) => {
    try {
      // Only save non-preset layouts
      const userLayouts = updatedLayouts.filter(
        (l) => !PRESET_LAYOUTS.some((p) => p.id === l.id && !l.isDefault)
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userLayouts));
    } catch (err) {
      console.error('Failed to save layouts:', err);
    }
  }, []);

  // Save a layout
  const saveLayout = useCallback(
    (layoutToSave: TerminalLayout) => {
      setLayouts((prev) => {
        const existingIndex = prev.findIndex((l) => l.id === layoutToSave.id);
        const updated = { ...layoutToSave, updatedAt: Date.now() };

        let newLayouts: TerminalLayout[];
        if (existingIndex >= 0) {
          newLayouts = [...prev];
          newLayouts[existingIndex] = updated;
        } else {
          newLayouts = [...prev, updated];
        }

        persistLayouts(newLayouts);
        return newLayouts;
      });

      onLayoutChange?.(layoutToSave);
    },
    [persistLayouts, onLayoutChange]
  );

  // Delete a layout
  const deleteLayout = useCallback(
    (layoutIdToDelete: string) => {
      if (layoutIdToDelete === DEFAULT_LAYOUT_ID) {
        setError('Cannot delete default layout');
        return;
      }

      setLayouts((prev) => {
        const newLayouts = prev.filter((l) => l.id !== layoutIdToDelete);
        persistLayouts(newLayouts);
        return newLayouts;
      });

      if (activeLayoutId === layoutIdToDelete) {
        setActiveLayoutId(DEFAULT_LAYOUT_ID);
      }
    },
    [activeLayoutId, persistLayouts]
  );

  // Duplicate a layout
  const duplicateLayout = useCallback(
    (layoutIdToDuplicate: string, newName: string): TerminalLayout => {
      const original = layouts.find((l) => l.id === layoutIdToDuplicate);
      if (!original) {
        throw new Error('Layout not found');
      }

      const newLayout: TerminalLayout = {
        ...original,
        id: `layout-${Date.now()}`,
        name: newName,
        isDefault: false,
        isShared: false,
        shareId: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      saveLayout(newLayout);
      return newLayout;
    },
    [layouts, saveLayout]
  );

  // Share a layout (generate shareable URL)
  const shareLayout = useCallback(
    async (layoutIdToShare: string): Promise<string> => {
      const layoutToShare = layouts.find((l) => l.id === layoutIdToShare);
      if (!layoutToShare) {
        throw new Error('Layout not found');
      }

      // Generate a unique share ID
      const shareId = btoa(JSON.stringify({
        id: layoutToShare.id,
        timestamp: Date.now(),
        random: Math.random().toString(36).substring(7),
      })).replace(/[+/=]/g, '').substring(0, 12);

      // In a real implementation, this would be saved to a backend
      // For now, we'll encode the layout in the URL (limited to simple layouts)
      const encodedLayout = btoa(JSON.stringify({
        ...layoutToShare,
        shareId,
        isShared: true,
      }));

      // Store locally for demo
      localStorage.setItem(`shared_layout_${shareId}`, encodedLayout);

      // Update the layout with share info
      const updatedLayout = {
        ...layoutToShare,
        isShared: true,
        shareId,
        updatedAt: Date.now(),
      };
      saveLayout(updatedLayout);

      // Return shareable URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      return `${baseUrl}/terminal/share/${shareId}`;
    },
    [layouts, saveLayout]
  );

  // Load a shared layout
  const loadSharedLayout = useCallback(
    async (shareId: string): Promise<TerminalLayout | null> => {
      try {
        // Try to load from local storage (demo mode)
        const stored = localStorage.getItem(`shared_layout_${shareId}`);
        if (stored) {
          const decodedLayout = JSON.parse(atob(stored)) as TerminalLayout;
          return {
            ...decodedLayout,
            id: `shared-${shareId}`,
            name: `${decodedLayout.name} (Shared)`,
          };
        }

        // In a real implementation, this would fetch from a backend
        setError('Shared layout not found');
        return null;
      } catch (err) {
        console.error('Failed to load shared layout:', err);
        setError('Failed to load shared layout');
        return null;
      }
    },
    []
  );

  // Set active layout
  const setActiveLayout = useCallback((newLayoutId: string) => {
    setActiveLayoutId(newLayoutId);
    setError(null);
  }, []);

  // Update a widget in the current layout
  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<WidgetConfig>) => {
      const updatedLayout: TerminalLayout = {
        ...layout,
        panels: layout.panels.map((panel) => ({
          ...panel,
          widgets: panel.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, ...updates } : widget
          ),
        })),
        updatedAt: Date.now(),
      };

      saveLayout(updatedLayout);
    },
    [layout, saveLayout]
  );

  // Update panel sizes
  const updatePanelSizes = useCallback(
    (panelId: string, sizes: number[]) => {
      const updatedLayout: TerminalLayout = {
        ...layout,
        panels: layout.panels.map((panel) =>
          panel.id === panelId ? { ...panel, sizes } : panel
        ),
        updatedAt: Date.now(),
      };

      saveLayout(updatedLayout);
    },
    [layout, saveLayout]
  );

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    setActiveLayoutId(DEFAULT_LAYOUT_ID);
    setError(null);
  }, []);

  return {
    layout,
    layouts,
    isLoading,
    error,
    saveLayout,
    deleteLayout,
    duplicateLayout,
    shareLayout,
    loadSharedLayout,
    setActiveLayout,
    updateWidget,
    updatePanelSizes,
    resetToDefault,
  };
}

export default useTerminalLayout;
