import { getErrorMessage } from '@/lib/axios';
import { useDashboardStatsQuery } from './api';
import { useLowStockSocket } from './useLowStockSocket';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function StatCard({
  label,
  value,
  icon,
  accentColor,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor } as React.CSSProperties}>
      <div className="flex items-start justify-between mb-3 pl-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(220 13% 52%)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'hsl(222 47% 11%)' }}>
            {value}
          </p>
        </div>
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: 'white', border: '1px solid hsl(220 15% 91%)' }}
    >
      <div className="flex items-center justify-between">
        <div className="shimmer h-3 w-28 rounded" />
        <div className="shimmer h-10 w-10 rounded-xl" />
      </div>
      <div className="shimmer h-7 w-20 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  useLowStockSocket();
  const { data, isLoading, isError, error } = useDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="space-y-6 page-enter">
        <div className="space-y-1">
          <div className="shimmer h-6 w-36 rounded" />
          <div className="shimmer h-4 w-64 rounded mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-xl p-4 text-sm"
        style={{
          background: 'hsl(358 72% 52% / 0.06)',
          border: '1px solid hsl(358 72% 52% / 0.18)',
          color: 'hsl(358 72% 42%)',
        }}
      >
        <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {getErrorMessage(error)}
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Products',
      value: data.totalProducts.toLocaleString(),
      accentColor: 'hsl(245 75% 55%)',
      iconBg: 'hsl(245 75% 55% / 0.1)',
      iconColor: 'hsl(245 75% 50%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: 'Total Sales',
      value: data.totalSales.toLocaleString(),
      accentColor: 'hsl(142 60% 42%)',
      iconBg: 'hsl(142 60% 42% / 0.1)',
      iconColor: 'hsl(142 60% 38%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      label: 'Total Revenue',
      value: currencyFormatter.format(data.totalRevenue),
      accentColor: 'hsl(38 90% 48%)',
      iconBg: 'hsl(38 90% 48% / 0.1)',
      iconColor: 'hsl(38 90% 38%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: 'Low Stock Items',
      value: data.lowStockCount.toLocaleString(),
      accentColor: data.lowStockCount > 0 ? 'hsl(358 72% 52%)' : 'hsl(142 60% 42%)',
      iconBg: data.lowStockCount > 0 ? 'hsl(358 72% 52% / 0.1)' : 'hsl(142 60% 42% / 0.1)',
      iconColor: data.lowStockCount > 0 ? 'hsl(358 72% 46%)' : 'hsl(142 60% 38%)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'hsl(222 47% 11%)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(220 13% 50%)' }}>
            Business overview · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Low stock table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          border: '1px solid hsl(220 15% 91%)',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        }}
      >
        {/* Table header bar */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid hsl(220 15% 92%)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: 'hsl(358 72% 52% / 0.08)', color: 'hsl(358 72% 46%)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'hsl(222 47% 11%)' }}>Low Stock Products</p>
              <p className="text-xs" style={{ color: 'hsl(220 13% 52%)' }}>Items that need restocking soon</p>
            </div>
          </div>
          {data.lowStockProducts.length > 0 && (
            <span className="status-badge danger">
              {data.lowStockProducts.length} item{data.lowStockProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {data.lowStockProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'hsl(142 60% 42% / 0.08)', color: 'hsl(142 60% 38%)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'hsl(222 47% 14%)' }}>All stocked up</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(220 13% 52%)' }}>No products below the low-stock threshold</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock Qty</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="font-medium" style={{ color: 'hsl(222 47% 11%)' }}>{product.name}</td>
                    <td>
                      <span
                        className="font-mono rounded px-2 py-0.5 text-xs"
                        style={{
                          background: 'hsl(245 75% 55% / 0.07)',
                          color: 'hsl(245 75% 45%)',
                        }}
                      >
                        {product.sku}
                      </span>
                    </td>
                    <td style={{ color: 'hsl(220 13% 45%)' }}>{product.category}</td>
                    <td>
                      <span className="status-badge danger">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        {product.stockQuantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
