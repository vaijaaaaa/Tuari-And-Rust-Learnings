import { useEffect, useMemo, useState } from "react";
import { createSeason, fetchSeasons, type SeasonListItem } from "./api";

type CreateForm = {
  name: string;
  startDate: string;
  endDate: string;
};

const initialForm: CreateForm = {
  name: "",
  startDate: "",
  endDate: "",
};

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<SeasonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateForm>(initialForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  async function loadSeasons() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchSeasons();
      setSeasons(data);
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to load seasons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSeasons();
  }, []);

  const canSubmit = useMemo(() => {
    return form.name.trim().length > 0 && !creating;
  }, [form, creating]);

  async function onCreateSeason(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!canSubmit) return;

    setCreating(true);
    try {
      const created = await createSeason({
        name: form.name.trim(),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });

      setSeasons((prev) => [created, ...prev]);
      setForm(initialForm);
      setCreateSuccess("Season created successfully.");
    } catch (err) {
      console.error(err);
      setCreateError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to create season");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Seasons</h1>
        <p className="mt-1 text-sm text-slate-600">Admin season list and create season</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create Season</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={onCreateSeason}>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Name</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.name}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, name: value }));
              }}
              placeholder="Enter season name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Start Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.startDate}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, startDate: value }));
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">End Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.endDate}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, endDate: value }));
              }}
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create Season"}
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
          <h2 className="text-lg font-semibold text-slate-900">Season List</h2>
          <button
            type="button"
            onClick={loadSeasons}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading seasons...</p> : null}

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
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((season) => (
                  <tr key={season.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{season.id}</td>
                    <td className="px-3 py-2">{season.name}</td>
                    <td className="px-3 py-2">{season.startDate ?? "-"}</td>
                    <td className="px-3 py-2">{season.endDate ?? "-"}</td>
                    <td className="px-3 py-2">{season.isActive ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{season.createdAt}</td>
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
