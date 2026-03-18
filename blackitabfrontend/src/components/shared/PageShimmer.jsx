/**
 * PageShimmer — Reusable shimmer skeleton loading states
 * Usage: <PageShimmer variant="dashboard" />
 * Variants: dashboard, list, detail, form, cards, table
 */

const ShimmerLine = ({ className = '' }) => (
  <div className={`shimmer-line ${className}`} />
);

/* ── Dashboard: header + stat cards + content panels ───── */
const DashboardShimmer = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
    {/* Header */}
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-6 bg-white dark:bg-white/[0.02]">
      <ShimmerLine className="h-3 w-28 mb-3" />
      <ShimmerLine className="h-6 w-48 mb-2" />
      <ShimmerLine className="h-3 w-64" />
    </div>
    {/* Stat cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
          <ShimmerLine className="h-8 w-8 rounded-lg mb-3" />
          <ShimmerLine className="h-3 w-20 mb-2" />
          <ShimmerLine className="h-6 w-16" />
        </div>
      ))}
    </div>
    {/* Content panels */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <ShimmerLine className="h-4 w-32 mb-4" />
        <ShimmerLine className="h-20 w-full mb-3" />
        <ShimmerLine className="h-8 w-28" />
      </div>
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <ShimmerLine className="h-4 w-24 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <ShimmerLine key={i} className="h-10 w-full" />)}
        </div>
      </div>
    </div>
  </div>
);

/* ── List: header + row items ──────────────────────────── */
const ListShimmer = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
      <ShimmerLine className="h-5 w-40 mb-2" />
      <ShimmerLine className="h-3 w-64" />
    </div>
    <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
        <ShimmerLine className="h-3 w-24" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <ShimmerLine className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <ShimmerLine className="h-3.5 w-3/5" />
              <ShimmerLine className="h-2.5 w-2/5" />
            </div>
            <ShimmerLine className="h-6 w-16 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Detail: header + body sections ────────────────────── */
const DetailShimmer = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
    {/* Page header */}
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-6 bg-white dark:bg-white/[0.02]">
      <div className="flex items-center gap-4 mb-4">
        <ShimmerLine className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <ShimmerLine className="h-5 w-48" />
          <ShimmerLine className="h-3 w-32" />
        </div>
      </div>
      <ShimmerLine className="h-3 w-full mb-2" />
      <ShimmerLine className="h-3 w-4/5" />
    </div>
    {/* Content sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2].map(i => (
        <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <ShimmerLine className="h-4 w-28 mb-4" />
          <div className="space-y-3">
            <ShimmerLine className="h-3 w-full" />
            <ShimmerLine className="h-3 w-5/6" />
            <ShimmerLine className="h-3 w-3/4" />
            <ShimmerLine className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
    {/* Bottom section */}
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
      <ShimmerLine className="h-4 w-36 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <ShimmerLine className="h-2 w-2 rounded-full shrink-0" />
            <ShimmerLine className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Form: header + form field placeholders ────────────── */
const FormShimmer = () => (
  <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
      <ShimmerLine className="h-5 w-40 mb-2" />
      <ShimmerLine className="h-3 w-64" />
    </div>
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-6 bg-white dark:bg-white/[0.02] space-y-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i}>
          <ShimmerLine className="h-3 w-24 mb-2" />
          <ShimmerLine className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div>
        <ShimmerLine className="h-3 w-28 mb-2" />
        <ShimmerLine className="h-24 w-full rounded-lg" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <ShimmerLine className="h-10 w-24 rounded-lg" />
        <ShimmerLine className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  </div>
);

/* ── Cards: hero banner + card grid ────────────────────── */
const CardsShimmer = () => (
  <div className="min-h-screen">
    {/* Hero skeleton */}
    <div className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <ShimmerLine className="h-4 w-48 mx-auto mb-6 rounded-full" />
        <ShimmerLine className="h-10 w-96 mx-auto mb-4" />
        <ShimmerLine className="h-4 w-80 mx-auto mb-8" />
        <div className="flex gap-4 justify-center">
          {[1, 2, 3].map(i => <ShimmerLine key={i} className="h-8 w-28 rounded-lg" />)}
        </div>
      </div>
    </div>
    {/* Card grid */}
    <div className="max-w-7xl mx-auto px-6 py-16">
      <ShimmerLine className="h-7 w-64 mb-3" />
      <ShimmerLine className="h-4 w-80 mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="border border-gray-200 dark:border-white/10 rounded-2xl p-6 bg-white dark:bg-white/[0.02]">
            <div className="flex items-start justify-between mb-4">
              <ShimmerLine className="h-14 w-14 rounded-xl" />
              <ShimmerLine className="h-6 w-16 rounded-full" />
            </div>
            <ShimmerLine className="h-5 w-24 mb-2" />
            <ShimmerLine className="h-3 w-full mb-1.5" />
            <ShimmerLine className="h-3 w-4/5 mb-4" />
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map(j => <ShimmerLine key={j} className="h-5 w-16 rounded-md" />)}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
              <ShimmerLine className="h-3 w-20" />
              <ShimmerLine className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Table: header + table header + table rows ─────────── */
const TableShimmer = () => (
  <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
      <div className="flex items-center justify-between">
        <div>
          <ShimmerLine className="h-5 w-40 mb-2" />
          <ShimmerLine className="h-3 w-56" />
        </div>
        <div className="flex gap-2">
          <ShimmerLine className="h-9 w-24 rounded-lg" />
          <ShimmerLine className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
    {/* Search / filter bar */}
    <div className="flex gap-3">
      <ShimmerLine className="h-10 flex-1 rounded-lg" />
      <ShimmerLine className="h-10 w-32 rounded-lg" />
    </div>
    {/* Table */}
    <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
      {/* Table header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
        <ShimmerLine className="h-3 w-8" />
        <ShimmerLine className="h-3 w-32 flex-1" />
        <ShimmerLine className="h-3 w-20" />
        <ShimmerLine className="h-3 w-20" />
        <ShimmerLine className="h-3 w-16" />
      </div>
      {/* Table rows */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0">
          <ShimmerLine className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <ShimmerLine className="h-3 w-40" />
            <ShimmerLine className="h-2.5 w-28" />
          </div>
          <ShimmerLine className="h-3 w-16" />
          <ShimmerLine className="h-3 w-16" />
          <ShimmerLine className="h-6 w-14 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/* ── Variant Map ───────────────────────────────────────── */

const VARIANTS = {
  dashboard: DashboardShimmer,
  list: ListShimmer,
  detail: DetailShimmer,
  form: FormShimmer,
  cards: CardsShimmer,
  table: TableShimmer,
};

const PageShimmer = ({ variant = 'dashboard' }) => {
  const Component = VARIANTS[variant] || DashboardShimmer;
  return <Component />;
};

export default PageShimmer;
