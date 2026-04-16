import { useEffect, useState } from "react";
import { createSale, fetchSales, type SaleListItem } from "./api";

export default function SalesPage() {
  const [rows, setRows] = useState<SaleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchSales());
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to load sales");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    const pid = Number(productId);
    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (!Number.isFinite(pid) || !Number.isFinite(qty) || !Number.isFinite(price)) {
      setSubmitError("Enter valid productId, quantity, and unitPrice");
      return;
    }

    setSubmitting(true);
    try {
      await createSale({
        items: [{ productId: pid, quantity: qty, unitPrice: price }],
        note: note || undefined,
      });
      setProductId("");
      setQuantity("");
      setUnitPrice("");
      setNote("");
      await load();
    } catch (err) {
      console.error(err);
      setSubmitError(typeof err === "string" ? err : err instanceof Error ? err.message : "Sale failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sales</h1>
        <p className="mt-1 text-sm text-slate-600">Record outgoing stock for demo flow</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create Sale</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={onSubmit}>
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Product ID"
            value={productId}
            onChange={(e) => setProductId(e.currentTarget.value)}
          />
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.currentTarget.value)}
          />
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Unit Price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.currentTarget.value)}
          />
          <input
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Create Sale"}
          </button>
        </form>
        {submitError ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Sales History</h2>
        {loading ? <p className="text-sm text-slate-600">Loading sales...</p> : null}
        {!loading && error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}
        {!loading && !error ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Items</th>
                  <th className="px-3 py-2">By</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{row.id}</td>
                    <td className="px-3 py-2">{row.totalAmount.toFixed(2)}</td>
                    <td className="px-3 py-2">{row.itemCount}</td>
                    <td className="px-3 py-2">{row.createdBy ?? "-"}</td>
                    <td className="px-3 py-2">{row.createdAt}</td>
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

