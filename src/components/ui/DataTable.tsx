'use client';

import { useState, useMemo, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type SortDirection = 'asc' | 'desc' | null;

export type ColumnAlign = 'left' | 'center' | 'right';

export type TableDensity = 'compact' | 'comfortable';

export interface ColumnDef<T> {
  /** Unique key for the column, used for sorting and as React key */
  key: string;
  /** Header text to display */
  header: string;
  /** Whether this column can be sorted */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: T[keyof T], row: T, index: number) => ReactNode;
  /** Optional fixed width (e.g., '100px', '10%') */
  width?: string;
  /** Text alignment within the column */
  align?: ColumnAlign;
  /** Custom sort function for complex sorting logic */
  sortFn?: (a: T, b: T) => number;
  /** Whether to hide this column on mobile */
  hideOnMobile?: boolean;
  /** Optional CSS class for the column cells */
  className?: string;
}

export interface DataTableProps<T> {
  /** Array of data items to display */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Unique key extractor for each row */
  keyExtractor: (item: T, index: number) => string | number;
  /** Optional click handler for rows */
  onRowClick?: (item: T, index: number) => void;
  /** Show loading skeleton state */
  loading?: boolean;
  /** Number of skeleton rows to show when loading */
  skeletonRows?: number;
  /** Message to show when data is empty */
  emptyMessage?: string;
  /** Secondary message for empty state */
  emptySubMessage?: string;
  /** Icon for empty state */
  emptyIcon?: ReactNode;
  /** Whether to make the header sticky */
  stickyHeader?: boolean;
  /** Table density (affects padding) */
  density?: TableDensity;
  /** Initial sort column key */
  defaultSortKey?: string;
  /** Initial sort direction */
  defaultSortDirection?: SortDirection;
  /** Callback when sort changes */
  onSortChange?: (key: string, direction: SortDirection) => void;
  /** Optional CSS class for the container */
  className?: string;
  /** Optional CSS class for the table */
  tableClassName?: string;
  /** Max height for scrollable table body */
  maxHeight?: string;
  /** Whether to show alternating row backgrounds */
  striped?: boolean;
  /** Whether rows are hoverable */
  hoverable?: boolean;
  /** Custom row class name generator */
  rowClassName?: (item: T, index: number) => string;
  /** Header content (renders above the table) */
  headerContent?: ReactNode;
  /** Footer content (renders below the table) */
  footerContent?: ReactNode;
}

// ============================================================================
// Utility Components
// ============================================================================

function SortIndicator({ direction }: { direction: SortDirection }) {
  return (
    <span className="ml-1.5 inline-flex flex-col text-[8px] leading-none">
      <svg
        className={`h-2 w-2 transition-colors ${
          direction === 'asc' ? 'text-white' : 'text-white/20'
        }`}
        viewBox="0 0 8 8"
        fill="currentColor"
      >
        <path d="M4 0L8 4H0L4 0Z" />
      </svg>
      <svg
        className={`h-2 w-2 -mt-0.5 transition-colors ${
          direction === 'desc' ? 'text-white' : 'text-white/20'
        }`}
        viewBox="0 0 8 8"
        fill="currentColor"
      >
        <path d="M4 8L0 4H8L4 8Z" />
      </svg>
    </span>
  );
}

function SkeletonRow<T>({
  columns,
  density,
}: {
  columns: ColumnDef<T>[];
  density: TableDensity;
}) {
  const paddingClass = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <tr className="border-b border-white/5">
      {columns.map((col) => (
        <td
          key={col.key}
          className={`${paddingClass} ${col.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
          style={{ width: col.width }}
        >
          <div className="h-4 rounded shimmer" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({
  message,
  subMessage,
  icon,
}: {
  message: string;
  subMessage?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
        {icon || (
          <svg
            className="h-8 w-8 text-white/20"
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
        )}
      </div>
      <p className="font-medium text-white/60">{message}</p>
      {subMessage && <p className="mt-1 text-sm text-white/30">{subMessage}</p>}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * DataTable - A generic, sortable data table component with DropsTab-inspired styling
 *
 * Features:
 * - Sortable columns with visual indicators
 * - Loading skeleton state
 * - Empty state handling
 * - Responsive design with horizontal scroll
 * - Sticky header option
 * - Row hover effects and click handlers
 * - Compact and comfortable density options
 * - Custom cell rendering
 *
 * @example
 * // Basic usage
 * <DataTable
 *   data={tokens}
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'price', header: 'Price', sortable: true, align: 'right' },
 *     { key: 'change', header: '24h', render: (v) => <ChangeCell value={v} /> },
 *   ]}
 *   keyExtractor={(item) => item.id}
 * />
 *
 * @example
 * // With all options
 * <DataTable
 *   data={portfolio}
 *   columns={columns}
 *   keyExtractor={(item) => item.symbol}
 *   onRowClick={(item) => handleSelect(item)}
 *   loading={isLoading}
 *   stickyHeader
 *   density="compact"
 *   striped
 *   defaultSortKey="value"
 *   defaultSortDirection="desc"
 * />
 */
export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No data available',
  emptySubMessage,
  emptyIcon,
  stickyHeader = false,
  density = 'comfortable',
  defaultSortKey,
  defaultSortDirection = 'asc',
  onSortChange,
  className = '',
  tableClassName = '',
  maxHeight,
  striped = true,
  hoverable = true,
  rowClassName,
  headerContent,
  footerContent,
}: DataTableProps<T>) {
  // Sort state
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSortKey ? defaultSortDirection : null
  );

  // Handle column header click for sorting
  const handleSort = useCallback(
    (column: ColumnDef<T>) => {
      if (!column.sortable) return;

      let newDirection: SortDirection;

      if (sortKey !== column.key) {
        // New column - start with ascending
        newDirection = 'asc';
      } else if (sortDirection === 'asc') {
        // Same column, was asc - go to desc
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        // Same column, was desc - clear sort
        newDirection = null;
      } else {
        // Was null - go to asc
        newDirection = 'asc';
      }

      setSortKey(newDirection ? column.key : null);
      setSortDirection(newDirection);
      onSortChange?.(column.key, newDirection);
    },
    [sortKey, sortDirection, onSortChange]
  );

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    const column = columns.find((col) => col.key === sortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        const result = column.sortFn(a, b);
        return sortDirection === 'desc' ? -result : result;
      }

      // Default sorting logic
      const aValue = a[sortKey as keyof T];
      const bValue = b[sortKey as keyof T];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Compare values
      let comparison = 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  // Density-based padding
  const cellPadding = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';
  const headerPadding = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  // Alignment classes
  const alignmentClasses: Record<ColumnAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/5 bg-surface-2 ${className}`}
    >
      {/* Optional header content */}
      {headerContent && (
        <div className="border-b border-white/5 px-4 py-4">{headerContent}</div>
      )}

      {/* Table container with horizontal scroll */}
      <div
        className="overflow-x-auto"
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        <table className={`w-full text-sm ${tableClassName}`}>
          {/* Table Header */}
          <thead
            className={stickyHeader ? 'sticky top-0 z-10 bg-surface-2' : ''}
          >
            <tr className="border-b border-white/5">
              {columns.map((column) => {
                const isSorted = sortKey === column.key;
                const isClickable = column.sortable;

                return (
                  <th
                    key={column.key}
                    className={`
                      ${headerPadding}
                      ${alignmentClasses[column.align || 'left']}
                      ${column.hideOnMobile ? 'hidden sm:table-cell' : ''}
                      text-xs font-medium uppercase tracking-wider text-white/40
                      ${isClickable ? 'cursor-pointer select-none hover:text-white/60 transition-colors' : ''}
                      ${column.className || ''}
                    `}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(column);
                      }
                    }}
                  >
                    <span className="inline-flex items-center">
                      {column.header}
                      {column.sortable && (
                        <SortIndicator
                          direction={isSorted ? sortDirection : null}
                        />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {/* Loading State */}
            {loading &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} columns={columns} density={density} />
              ))}

            {/* Empty State */}
            {!loading && sortedData.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    message={emptyMessage}
                    subMessage={emptySubMessage}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!loading &&
              sortedData.map((item, index) => {
                const key = keyExtractor(item, index);
                const isClickable = !!onRowClick;
                const customClass = rowClassName?.(item, index) || '';

                return (
                  <tr
                    key={key}
                    className={`
                      border-b border-white/5
                      ${striped && index % 2 === 1 ? 'bg-white/[0.01]' : ''}
                      ${hoverable ? 'hover:bg-white/[0.03]' : ''}
                      ${isClickable ? 'cursor-pointer' : ''}
                      transition-colors duration-150
                      ${customClass}
                    `}
                    onClick={() => onRowClick?.(item, index)}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick?.(item, index);
                      }
                    }}
                  >
                    {columns.map((column) => {
                      const value = item[column.key as keyof T];
                      const content = column.render
                        ? column.render(value, item, index)
                        : String(value ?? '');

                      return (
                        <td
                          key={column.key}
                          className={`
                            ${cellPadding}
                            ${alignmentClasses[column.align || 'left']}
                            ${column.hideOnMobile ? 'hidden sm:table-cell' : ''}
                            text-white
                            ${column.className || ''}
                          `}
                          style={{ width: column.width }}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Optional footer content */}
      {footerContent && (
        <div className="border-t border-white/5 px-4 py-3 bg-surface-3/30">
          {footerContent}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper Components for Common Cell Types
// ============================================================================

/**
 * Cell component for displaying percentage changes with color coding
 */
export function ChangeCell({
  value,
  precision = 2,
  showSign = true,
}: {
  value: number;
  precision?: number;
  showSign?: boolean;
}) {
  const isPositive = value >= 0;
  const formatted = value.toFixed(precision);
  const sign = showSign && isPositive ? '+' : '';

  return (
    <span
      className={`font-mono font-medium ${
        isPositive ? 'text-accent-emerald' : 'text-accent-rose'
      }`}
    >
      {sign}
      {formatted}%
    </span>
  );
}

/**
 * Cell component for displaying currency values
 */
export function CurrencyCell({
  value,
  currency = 'USD',
  precision,
}: {
  value: number;
  currency?: string;
  precision?: number;
}) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision ?? (value < 1 ? 6 : 2),
  });

  return <span className="font-mono">{formatter.format(value)}</span>;
}

/**
 * Cell component for displaying token/asset with icon
 */
export function AssetCell({
  symbol,
  name,
  icon,
}: {
  symbol: string;
  name?: string;
  icon?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon ? (
        <img
          src={icon}
          alt={symbol}
          className="h-8 w-8 rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">
          {symbol.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <div className="font-medium text-white">{symbol}</div>
        {name && <div className="text-xs text-white/40">{name}</div>}
      </div>
    </div>
  );
}

/**
 * Cell component for displaying a rank badge
 */
export function RankCell({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-black">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-xs font-bold text-black">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-xs font-bold text-white">
        3
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-white/60">
      {rank}
    </div>
  );
}

/**
 * Cell component for displaying a badge/tag
 */
export function BadgeCell({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const variantClasses = {
    default: 'bg-white/10 text-white/70 border-white/10',
    success: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    danger: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
    info: 'bg-base-blue/10 text-base-blue border-base-blue/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

/**
 * Cell component for truncated text with tooltip
 */
export function TruncatedCell({
  text,
  maxLength = 20,
}: {
  text: string;
  maxLength?: number;
}) {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated
    ? `${text.slice(0, maxLength)}...`
    : text;

  return (
    <span title={isTruncated ? text : undefined} className="font-mono text-sm">
      {displayText}
    </span>
  );
}

/**
 * Cell component for displaying addresses (wallet, contract, etc.)
 */
export function AddressCell({
  address,
  prefixLength = 6,
  suffixLength = 4,
}: {
  address: string;
  prefixLength?: number;
  suffixLength?: number;
}) {
  const shortened =
    address.length > prefixLength + suffixLength + 3
      ? `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`
      : address;

  return (
    <span title={address} className="font-mono text-sm text-white/80">
      {shortened}
    </span>
  );
}
