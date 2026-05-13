'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { User } from '@/types'
import { Shield, ShieldOff, Search } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const { data, refetch } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => apiClient.get('/admin/users/', {
      params: { search, role: roleFilter }
    }).then((r) => r.data),
  })

  const toggleVerify = async (userId: string, current: boolean) => {
    await apiClient.patch(`/admin/users/${userId}/`, { is_verified: !current })
    refetch()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all registered users</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All roles</option>
          <option value="engineer">Engineers</option>
          <option value="client">Clients</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Joined</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {data?.results?.map((user: User) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                      <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                        {user.first_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="capitalize px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {format(new Date(user.date_joined), 'MMM d, yyyy')}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    user.is_verified
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button onClick={() => toggleVerify(user.id, user.is_verified)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      user.is_verified
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}>
                    {user.is_verified
                      ? <><ShieldOff className="w-3.5 h-3.5" />Revoke</>
                      : <><Shield className="w-3.5 h-3.5" />Verify</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
