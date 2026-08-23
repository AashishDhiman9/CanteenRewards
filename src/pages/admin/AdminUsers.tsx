import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCoins } from '../../lib/utils';
import { Users, Search, ShieldCheck, UserCheck, Sparkles, Edit2 } from 'lucide-react';
import type { UserRole } from '../../types';

export const AdminUsers: React.FC = () => {
  const { availableUsers, updateUserRole } = useAuth();
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
    setSuccessMsg(`User role updated to ${newRole}.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filtered = availableUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Campus Users & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage student loyalty memberships and authorize canteen counter staff and administrators.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, roll no, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-xs focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-[#E8E1D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDF9F3] border-b border-[#E8E1D9] text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#3D2B1F]">{u.full_name}</p>
                    <p className="text-[10px] text-stone-400">{u.email || 'No email'}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-stone-700">{u.roll_no}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-900'
                          : u.role === 'staff'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-700">
                    🪙 {formatCoins(u.wallet?.balance || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#3D2B1F] focus:outline-none focus:border-amber-600 cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
