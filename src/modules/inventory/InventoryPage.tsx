import { useEffect, useState } from "react";
import { adjustStock, fetchInventory, type InventoryItem } from "./api";
import { getCurrentRole } from "../auth/session";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [quantityDelta, setQuantityDelta] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const role = getCurrentRole();

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await fetchInventory());
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!productId && items.length > 0) {
      setProductId(String(items[0].productId));
    }
  }, [items, productId]);

  async function onAdjust(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    const pid = Number(productId);
    const delta = Number(quantityDelta);
    if (!Number.isFinite(pid) || !Number.isFinite(delta)) {
      setSubmitError("Enter valid productId and quantityDelta");
      return;
    }

    setSubmitting(true);
    try {
      await adjustStock({ productId: pid, quantityDelta: delta, note: note || undefined });
      setProductId("");
      setQuantityDelta("");
      setNote("");
      await load();
    } catch (err) {
      console.error(err);
      setSubmitError(typeof err === "string" ? err : err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
        <p className="mt-1 text-sm text-slate-600">Live stock view and manual adjustments</p>
      </section>

      {role === "admin" ? (
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Adjust Stock</h2>
          {items.length === 0 ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No active products exist yet. Create a product first, then adjust its stock.
            </p>
          ) : null}

          <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={onAdjust}>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={productId}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setProductId(value);
              }}
            >
              {items.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.productId} - {item.sku} - {item.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              placeholder="Quantity Delta (+/-)"
              value={quantityDelta}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setQuantityDelta(value);
              }}
            />
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              placeholder="Note"
              value={note}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setNote(value);
              }}
            />
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-fit rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70"
            >
              {submitting ? "Applying..." : "Apply Adjustment"}
            </button>
          </form>
          {submitError ? (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Stock Table</h2>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading inventory...</p> : null}
        {!loading && error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}

        {!loading && !error ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">Product ID</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId} className="border-t border-slate-200">
                    <td className="px-3 py-2">{item.productId}</td>
                    <td className="px-3 py-2">{item.sku}</td>
                    <td className="px-3 py-2">{item.name}</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">{item.updatedAt ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

