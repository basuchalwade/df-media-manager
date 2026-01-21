import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MoreVertical, Shield, ShieldAlert, Mail, Search, X, Check, Lock, AlertCircle } from 'lucide-react';
import { store } from '../services/mockStore';
import { User, UserRole, UserStatus } from '../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'invite' | 'create' | 'edit'>('create');
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: UserRole.Viewer,
    status: UserStatus.Active
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await store.getUsers();
    setUsers(data);
  };

  const handleOpenModal = (mode: 'invite' | 'create' | 'edit', user?: User) => {
    setModalMode(mode);
    if (user && mode === 'edit') {
      setFormData({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        password: '', 
        role: user.role,
        status: user.status 
      });
    } else {
      setFormData({ 
        id: '', 
        name: '', 
        email: '', 
        password: '', 
        role: UserRole.Viewer,
        status: UserStatus.Active 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.email) return;

    if (modalMode === 'edit') {
      await store.updateUser(formData.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
    } else {
      // Create or Invite
      const newUser = {
        name: modalMode === 'invite' ? (formData.email.split('@')[0]) : formData.name,
        email: formData.email,
        role: formData.role,
        status: modalMode === 'invite' ? UserStatus.Invited : UserStatus.Active
      };
      await store.addUser(newUser);
    }
    
    await loadUsers();
    setIsModalOpen(false);
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === UserStatus.Active ? UserStatus.Suspended : UserStatus.Active;
    await store.updateUser(user.id, { status: newStatus });
    await loadUsers();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.Monitor: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.Viewer: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Active: return 'bg-green-100 text-green-700';
      case UserStatus.Suspended: return 'bg-red-100 text-red-700';
      case UserStatus.Invited: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-slate-500">Manage access, roles, and permissions for your team.</p>
        </div>
        <button 
          onClick={() => handleOpenModal('create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </header>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === UserStatus.Active ? 'bg-green-500' : user.status === UserStatus.Suspended ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {user.lastActive}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal('edit', user)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit User"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    {user.status !== UserStatus.Invited && (
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`p-1.5 rounded transition-colors ${user.status === UserStatus.Active ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-green-600 hover:bg-green-50'}`}
                        title={user.status === UserStatus.Active ? "Suspend User" : "Activate User"}
                      >
                        {user.status === UserStatus.Active ? <ShieldAlert className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">
                {modalMode === 'edit' ? 'Edit User Details' : 'Add New User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Mode Tabs for Create/Invite */}
              {modalMode !== 'edit' && (
                <div className="flex border-b border-slate-200 mb-6">
                  <button
                    onClick={() => handleOpenModal('create')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${modalMode === 'create' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Create Manually
                  </button>
                  <button
                    onClick={() => handleOpenModal('invite')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${modalMode === 'invite' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Invite via Email
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {/* Username Field - Only for Create/Edit */}
                {modalMode !== 'invite' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                )}

                {/* Email Field - Always visible */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password Field - Only for Create */}
                {modalMode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Access Role</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[UserRole.Viewer, UserRole.Monitor, UserRole.Admin].map((role) => (
                      <label key={role} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.role === role ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={formData.role === role}
                          onChange={() => setFormData({ ...formData, role: role })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-slate-900">{role}</span>
                          <span className="block text-xs text-slate-500">
                            {role === UserRole.Admin && 'Full access to all settings and user management.'}
                            {role === UserRole.Monitor && 'Can manage bots and view analytics, no settings access.'}
                            {role === UserRole.Viewer && 'Read-only access to dashboard and analytics.'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info Box for Invite */}
                {modalMode === 'invite' && (
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>An invitation email will be sent to the user with instructions to set up their account.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.email}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalMode === 'edit' ? 'Save Changes' : (modalMode === 'invite' ? 'Send Invitation' : 'Create Account')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
