
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MoreVertical, Shield, ShieldAlert, Mail, Search, X, Check, Lock, AlertCircle, FileText, CheckSquare, Clock, Activity, AlertTriangle, ChevronRight, UserCog, History, Key, Settings, Briefcase, Plus, Filter, Save, Download } from 'lucide-react';
import { store } from '../services/mockStore';
import { User, UserRole, UserStatus } from '../types';

// --- Types & Constants for Governance ---

type GovernanceTab = 'Team' | 'Roles' | 'Approvals' | 'Audit';

interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  avatarColor: string;
  severity: 'normal' | 'warning' | 'critical';
}

const PERMISSION_MATRIX = [
  { action: 'Manage Team Access', owner: true, admin: true, operator: false, viewer: false },
  { action: 'Edit Bot Rules', owner: true, admin: true, operator: true, viewer: false },
  { action: 'Approve Risky Actions', owner: true, admin: true, operator: false, viewer: false },
  { action: 'Resume Paused Bots', owner: true, admin: true, operator: true, viewer: false },
  { action: 'View Analytics', owner: true, admin: true, operator: true, viewer: true },
  { action: 'Manage Billing', owner: true, admin: false, operator: false, viewer: false },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: '1', user: 'Sarah Connor', action: 'changed Safety Mode', target: 'to Aggressive', timestamp: '10 mins ago', avatarColor: 'bg-blue-500', severity: 'warning' },
  { id: '2', user: 'John Smith', action: 'resumed', target: 'Growth Bot', timestamp: '1 hour ago', avatarColor: 'bg-green-500', severity: 'normal' },
  { id: '3', user: 'Admin User', action: 'invited', target: 'mike@example.com', timestamp: '2 hours ago', avatarColor: 'bg-purple-500', severity: 'normal' },
  { id: '4', user: 'System', action: 'triggered', target: 'Auto-Pause (Rate Limit)', timestamp: '3 hours ago', avatarColor: 'bg-gray-500', severity: 'critical' },
  { id: '5', user: 'Sarah Connor', action: 'approved', target: 'Post #1023', timestamp: 'Yesterday', avatarColor: 'bg-blue-500', severity: 'normal' },
];

export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GovernanceTab>('Team');
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'invite' | 'create' | 'edit'>('create');
  
  // Governance State
  const [requireSafetyApproval, setRequireSafetyApproval] = useState(true);
  const [requireGrowthApproval, setRequireGrowthApproval] = useState(true);
  const [requireBulkApproval, setRequireBulkApproval] = useState(false);

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
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Active: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case UserStatus.Suspended: return 'bg-red-50 text-red-700 border-red-100';
      case UserStatus.Invited: return 'bg-amber-50 text-amber-800 border-amber-100';
    }
  };

  // --- Render Sub-Components ---

  const ApprovalToggle = ({ label, description, checked, onChange, icon: Icon }: any) => (
      <div className="flex items-start justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div className="flex gap-4">
              <div className={`p-2 rounded-lg ${checked ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="font-bold text-slate-900 text-sm">{label}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">{description}</p>
              </div>
          </div>
          <button 
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block w-4 h-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'} mt-1`} />
          </button>
      </div>
  );

  // --- Tab Content Renderers ---

  const renderTeamTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            />
          </div>
          <div className="flex gap-2">
             <button className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                 <Filter className="w-3.5 h-3.5" /> Filter
             </button>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                      <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getRoleBadgeColor(user.role)}`}>
                    {user.role === UserRole.Admin && <Shield className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeColor(user.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === UserStatus.Active ? 'bg-emerald-500' : user.status === UserStatus.Suspended ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  {user.lastActive}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal('edit', user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Permissions"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    {user.status !== UserStatus.Invited && (
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${user.status === UserStatus.Active ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                        title={user.status === UserStatus.Active ? "Suspend Access" : "Restore Access"}
                      >
                        {user.status === UserStatus.Active ? <Lock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );

  const renderRolesTab = () => (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Role Permissions Matrix</h3>
              <p className="text-sm text-slate-500 mt-1">Define capabilities for each system role.</p>
          </div>
          <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                      <th className="px-6 py-4 border-r border-slate-100 w-1/3">Permission</th>
                      <th className="px-6 py-4 text-center w-1/6 text-purple-700 bg-purple-50/50">Owner</th>
                      <th className="px-6 py-4 text-center w-1/6 text-blue-700 bg-blue-50/50">Admin</th>
                      <th className="px-6 py-4 text-center w-1/6 text-emerald-700 bg-emerald-50/50">Operator</th>
                      <th className="px-6 py-4 text-center w-1/6 text-slate-600">Viewer</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {PERMISSION_MATRIX.map((perm, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700 text-sm border-r border-slate-100">
                              {perm.action}
                          </td>
                          <td className="px-6 py-4 text-center bg-purple-50/10">
                              {perm.owner ? <Check className="w-5 h-5 text-purple-600 mx-auto" strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center bg-blue-50/10">
                              {perm.admin ? <Check className="w-5 h-5 text-blue-600 mx-auto" strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center bg-emerald-50/10">
                              {perm.operator ? <Check className="w-5 h-5 text-emerald-600 mx-auto" strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center">
                              {perm.viewer ? <Check className="w-5 h-5 text-slate-600 mx-auto" strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
              Role permissions are currently managed at the organization level and cannot be customized per user.
          </div>
      </div>
  );

  const renderApprovalsTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600">
                  <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="font-bold text-blue-900 text-sm">Governance & Compliance</h4>
                  <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
                      Enforce strict controls on high-risk actions. When enabled, these actions will require 
                      secondary approval from an Admin or Owner before execution.
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
              <ApprovalToggle 
                  label="Safety Mode Modifications" 
                  description="Require approval when changing a bot's safety level (e.g. Moderate → Aggressive)."
                  checked={requireSafetyApproval}
                  onChange={setRequireSafetyApproval}
                  icon={Shield}
              />
              <ApprovalToggle 
                  label="Aggressive Growth Tactics" 
                  description="Require approval for enabling competitor interaction or high-volume follow strategies."
                  checked={requireGrowthApproval}
                  onChange={setRequireGrowthApproval}
                  icon={Activity}
              />
              <ApprovalToggle 
                  label="Bulk Operations" 
                  description="Require approval when deleting or archiving more than 50 items at once."
                  checked={requireBulkApproval}
                  onChange={setRequireBulkApproval}
                  icon={FileText}
              />
          </div>
      </div>
  );

  const renderAuditTab = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">System Audit Log</h3>
              <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-blue-100">
                  <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                  {MOCK_AUDIT_LOGS.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                          <div className={`w-8 h-8 rounded-full ${log.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                              {log.user.charAt(0)}
                          </div>
                          <div className="flex-1">
                              <p className="text-sm text-slate-900">
                                  <span className="font-bold">{log.user}</span> 
                                  <span className="text-slate-500 mx-1">{log.action}</span> 
                                  <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{log.target}</span>
                              </p>
                          </div>
                          <div className="flex items-center gap-3">
                              {log.severity === 'warning' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">Warning</span>}
                              {log.severity === 'critical' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase tracking-wider">Critical</span>}
                              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600 transition-colors">
                                  {log.timestamp}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Load Older Events</button>
              </div>
          </div>
      </div>
  );

  // --- Main Render ---

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Organization & Governance
          </h1>
          <p className="text-lg text-slate-500 font-medium mt-1">Manage team access, permissions, and compliance rules.</p>
        </div>
        <div className="flex gap-3">
            {activeTab === 'Team' && (
                <button 
                  onClick={() => handleOpenModal('create')}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
            )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
          <div className="flex gap-8">
              {[
                  { id: 'Team', icon: Users, label: 'Team Members' },
                  { id: 'Roles', icon: Key, label: 'Roles & Permissions' },
                  { id: 'Approvals', icon: CheckSquare, label: 'Approval Workflows' },
                  { id: 'Audit', icon: History, label: 'Audit Log' }
              ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as GovernanceTab)}
                          className={`
                              flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all
                              ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                          `}
                      >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                      </button>
                  );
              })}
          </div>
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px]">
          {activeTab === 'Team' && renderTeamTab()}
          {activeTab === 'Roles' && renderRolesTab()}
          {activeTab === 'Approvals' && renderApprovalsTab()}
          {activeTab === 'Audit' && renderAuditTab()}
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {modalMode === 'edit' ? <UserCog className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
                {modalMode === 'edit' ? 'Edit Member Access' : 'Add Team Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mode Tabs for Create/Invite */}
              {modalMode !== 'edit' && (
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => handleOpenModal('create')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${modalMode === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Create Manually
                  </button>
                  <button
                    onClick={() => handleOpenModal('invite')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${modalMode === 'invite' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Invite via Email
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {/* Username Field - Only for Create/Edit */}
                {modalMode !== 'invite' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all text-sm font-medium"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                )}

                {/* Email Field - Always visible */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all text-sm font-medium"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                {/* Password Field - Only for Create */}
                {modalMode === 'create' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Temporary Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all text-sm font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Access Role</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[UserRole.Viewer, UserRole.Monitor, UserRole.Admin].map((role) => (
                      <label key={role} className={`flex items-start p-3 border rounded-xl cursor-pointer transition-all ${formData.role === role ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <div className="flex h-5 items-center">
                            <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={formData.role === role}
                            onChange={() => setFormData({ ...formData, role: role })}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                        </div>
                        <div className="ml-3">
                          <span className="block text-sm font-bold text-slate-900">{role}</span>
                          <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
                            {role === UserRole.Admin && 'Full access to all settings, billing, and user management.'}
                            {role === UserRole.Monitor && 'Can manage bots and view analytics, but no settings access.'}
                            {role === UserRole.Viewer && 'Read-only access to dashboard and analytics data.'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info Box for Invite */}
                {modalMode === 'invite' && (
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-medium flex gap-2 border border-amber-100">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>An invitation email will be sent to this address with a magic link to set up their account password.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              {modalMode === 'edit' && (
                  <button className="text-xs font-bold text-red-500 hover:underline">Revoke Access</button>
              )}
              <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.email}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    {modalMode === 'edit' ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {modalMode === 'edit' ? 'Save Changes' : (modalMode === 'invite' ? 'Send Invite' : 'Create Account')}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
