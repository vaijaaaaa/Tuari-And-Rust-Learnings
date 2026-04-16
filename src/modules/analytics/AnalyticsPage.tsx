import { useEffect, useState } from "react";
import { fetchDashboardSummary, type DashboardSummary } from "./api";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setSummary(await fetchDashboardSummary());
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
        <p className="text-sm text-slate-600">Demo KPI summary from local SQLite data</p>
      </section>

      {loading ? <p className="text-sm text-slate-600">Loading dashboard summary...</p> : null}
      {!loading && error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      {!loading && !error && summary ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Products</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Low Stock</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.lowStockCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Stock Units</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalStockUnits}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sales Amount</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalSalesAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Purchase Amount</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.totalPurchaseAmount.toFixed(2)}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

