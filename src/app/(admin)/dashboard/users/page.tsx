/* List User Terdaftar */

import { getUsers } from "@/lib/actions/users";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  user: "User",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">Daftar User</h1>
        <p className="mt-1 text-sm text-violet-600">{users.length} akun terdaftar</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-violet-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-violet-200 bg-violet-50">
            <tr>
              <th className="px-4 py-3 font-medium text-violet-700">Nama</th>
              <th className="px-4 py-3 font-medium text-violet-700">No. HP</th>
              <th className="px-4 py-3 font-medium text-violet-700">Role</th>
              <th className="px-4 py-3 font-medium text-violet-700">Bergabung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-100 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-violet-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-violet-900">{user.full_name}</td>
                <td className="px-4 py-3 text-violet-600">{user.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      user.role === "admin"
                        ? "rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white"
                        : "rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700"
                    }
                  >
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-violet-600">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
