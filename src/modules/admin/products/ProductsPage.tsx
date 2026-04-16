import { useEffect, useMemo, useState } from "react";
import { createProduct, fetchProducts, type ProductListItem } from "./api";

type CreateForm = {
  sku: string;
  name: string;
  description: string;
};

const initialForm: CreateForm = {
  sku: "",
  name: "",
  description: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateForm>(initialForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.sku.trim().length > 0 &&
      form.name.trim().length > 0 &&
      !creating
    );
  }, [form, creating]);

  async function onCreateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!canSubmit) return;

    setCreating(true);
    try {
      const created = await createProduct({
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });

      setProducts((prev) => [created, ...prev]);
      setForm(initialForm);
      setCreateSuccess("Product created successfully.");
    } catch (err) {
      console.error(err);
      setCreateError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <p className="mt-1 text-sm text-slate-600">Admin product list and create product</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create Product</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onCreateProduct}>
          <div>
            <label className="mb-1 block text-sm text-slate-700">SKU</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.sku}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, sku: value }));
              }}
              placeholder="Enter SKU"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Name</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.name}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, name: value }));
              }}
              placeholder="Enter product name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-700">Description</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              rows={3}
              value={form.description}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, description: value }));
              }}
              placeholder="Optional description"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>

        {createError ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {createError}
          </p>
        ) : null}

        {createSuccess ? (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {createSuccess}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Product List</h2>
          <button
            type="button"
            onClick={loadProducts}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading products...</p> : null}

        {!loading && error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {!loading && !error ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Season</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{product.id}</td>
                    <td className="px-3 py-2">{product.sku}</td>
                    <td className="px-3 py-2">{product.name}</td>
                    <td className="px-3 py-2">{product.seasonName ?? "-"}</td>
                    <td className="px-3 py-2">{product.isActive ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{product.createdAt}</td>
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
