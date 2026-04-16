import { useEffect, useMemo, useState } from "react";
import { createUser, fetchUsers, type UserListItem } from "./api";

type CreateForm = {
  fullName: string;
  username: string;
  password: string;
  role: "admin" | "user";
};

const initialForm: CreateForm = {
  fullName: "",
  username: "",
  password: "",
  role: "user",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateForm>(initialForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.fullName.trim().length > 0 &&
      form.username.trim().length > 0 &&
      form.password.trim().length > 0 &&
      !creating
    );
  }, [form, creating]);

  async function onCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!canSubmit) return;

    setCreating(true);
    try {
      const created = await createUser({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        password: form.password,
        role: form.role,
      });

      setUsers((prev) => [created, ...prev]);
      setForm(initialForm);
      setCreateSuccess("User created successfully.");
    } catch (err) {
      console.error(err);
      setCreateError(typeof err === "string" ? err : err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Admin user list and create user (Phase 1)
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create User</h2>

        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onCreateUser}>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Full Name</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.fullName}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, fullName: value }));
              }}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Username</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.username}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, username: value }));
              }}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.password}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, password: value }));
              }}
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Role</label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={form.role}
              onChange={(e) => {
                const value = e.currentTarget.value as "admin" | "user";
                setForm((f) => ({ ...f, role: value }));
              }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create User"}
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
          <h2 className="text-lg font-semibold text-slate-900">User List</h2>
          <button
            type="button"
            onClick={loadUsers}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-600">Loading users...</p> : null}

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
                  <th className="px-3 py-2">Full Name</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{user.id}</td>
                    <td className="px-3 py-2">{user.fullName}</td>
                    <td className="px-3 py-2">{user.username}</td>
                    <td className="px-3 py-2">{user.role}</td>
                    <td className="px-3 py-2">{user.isActive ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{user.createdAt}</td>
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
