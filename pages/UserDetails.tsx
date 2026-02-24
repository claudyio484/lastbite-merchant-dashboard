import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Activity,
  Lock,
  User as UserIcon,
  ShoppingBag,
  FileText,
  X,
  Loader2,
  LogIn,
  UserPlus,
  Pencil,
  Trash,
  ToggleRight
} from 'lucide-react';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { fetchUserById, updateUserApi, deleteUserApi } from '../utils/api';

// Map backend role to display label
const ROLE_LABEL: Record<string, string> = {
  MERCHANT_OWNER: 'Owner',
  MERCHANT_ADMIN: 'Manager',
  MERCHANT_STAFF: 'Staff',
  SUPER_ADMIN: 'Super Admin',
};

const ROLE_VALUE: Record<string, string> = {
  Owner: 'MERCHANT_OWNER',
  Manager: 'MERCHANT_ADMIN',
  Staff: 'MERCHANT_STAFF',
};

interface AuditLog {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: any;
  ip: string | null;
  createdAt: string;
}

interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  avatar: string | null;
  jobTitle: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  recentActivity?: AuditLog[];
}

export const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'permissions'>('activity');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ApiUser & { role: string }>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetchUserById(userId);
      setUser(res.data);
    } catch (err: any) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
      if (user) {
          setFormData({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              role: ROLE_LABEL[user.role] || 'Staff',
              jobTitle: user.jobTitle,
              isActive: user.isActive,
          });
          setFormError('');
          setIsEditModalOpen(true);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !id) return;
      setFormLoading(true);
      setFormError('');

      try {
        const backendRole = ROLE_VALUE[formData.role as string] || user.role;
        await updateUserApi(id, {
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          phone: formData.phone || undefined,
          role: backendRole,
          jobTitle: formData.jobTitle || undefined,
          isActive: formData.isActive,
        });
        await loadUser(id);
        setIsEditModalOpen(false);
      } catch (err: any) {
        setFormError(err.message || 'Failed to update user');
      } finally {
        setFormLoading(false);
      }
  };

  const handleDelete = () => {
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (id) {
        try {
          await deleteUserApi(id);
          navigate('/users');
        } catch (err: any) {
          alert(err.message || 'Failed to delete user');
        }
      }
      setIsDeleteModalOpen(false);
  };

  const getRoleColor = (role: string) => {
      const label = ROLE_LABEL[role] || role;
      switch(label) {
          case 'Owner': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
          case 'Manager': return 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800';
          default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600';
      }
  };

  const getActionIcon = (action: string) => {
      const a = action.toLowerCase();
      if (a.includes('login')) return <LogIn size={16} className="text-blue-500" />;
      if (a.includes('add') || a.includes('create')) return <UserPlus size={16} className="text-emerald-500" />;
      if (a.includes('update') || a.includes('edit')) return <Pencil size={16} className="text-amber-500" />;
      if (a.includes('delete') || a.includes('remove')) return <Trash size={16} className="text-rose-500" />;
      if (a.includes('status')) return <ToggleRight size={16} className="text-purple-500" />;
      return <Activity size={16} className="text-gray-400" />;
  };

  const formatActionText = (log: AuditLog) => {
      const action = log.action;
      switch(action) {
          case 'LOGIN': return 'Logged in';
          case 'ADDED_USER': return `Added team member ${log.details?.email || ''}`;
          case 'UPDATED_PRODUCT': return `Updated product`;
          case 'CREATED_ORDER': return `Created order`;
          case 'UPDATED_SETTINGS': return `Updated store settings`;
          default: return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase());
      }
  };

  const formatTimestamp = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
            <Link to="/users" className="mt-4 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:shadow-glow transition-all">Back to Team</Link>
        </div>
    );
  }

  const roleLabel = ROLE_LABEL[user.role] || user.role;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-20">
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove User?"
        message="Are you sure you want to remove this user? They will lose access to the dashboard immediately."
        confirmText="Remove User"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Edit User</h2>
                      <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      {formError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
                          {formError}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                          <input
                              type="text"
                              required
                              value={formData.firstName || ''}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                          <input
                              type="text"
                              required
                              value={formData.lastName || ''}
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email (read-only)</label>
                          <input
                              type="email"
                              disabled
                              value={formData.email || ''}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none text-gray-900 dark:text-white opacity-50"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                          <input
                              type="tel"
                              value={formData.phone || ''}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                              placeholder="+971..."
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                              <select
                                  value={formData.role || 'Staff'}
                                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                                  className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white cursor-pointer"
                              >
                                  <option value="Staff">Staff</option>
                                  <option value="Manager">Manager</option>
                                  <option value="Owner">Owner</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                              <select
                                  value={formData.isActive ? 'Active' : 'Inactive'}
                                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'Active'})}
                                  className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white cursor-pointer"
                              >
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                          <input
                              type="text"
                              value={formData.jobTitle || ''}
                              onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                              placeholder="Store Manager"
                          />
                      </div>

                      <div className="pt-4">
                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                              {formLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                              Save Changes
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/users" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">User Details</h1>
          <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleColor(user.role)}`}>
                  <Shield size={10} /> {roleLabel}
              </span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border ${user.isActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' : 'text-gray-500 bg-gray-100 border-gray-200 dark:bg-slate-700 dark:border-slate-600'}`}>
                  {user.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                  {user.isActive ? 'Active' : 'Inactive'}
              </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-100 to-brand-50 dark:from-brand-900 dark:to-slate-900"></div>

                  <div className="relative flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-md mb-4">
                          <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                              {user.avatar ? (
                                  <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                              ) : (
                                  <UserIcon size={40} className="text-gray-400" />
                              )}
                          </div>
                      </div>
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
                      {user.jobTitle && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user.jobTitle}</p>}
                      <p className="text-xs text-gray-400 mt-1 font-mono">ID: {user.id.slice(0, 8)}...</p>

                      <div className="w-full space-y-4 mt-6">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-gray-400 shadow-sm"><Mail size={16} /></div>
                              <div className="text-left overflow-hidden">
                                  <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={user.email}>{user.email}</p>
                              </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-gray-400 shadow-sm"><Phone size={16} /></div>
                              <div className="text-left">
                                  <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user.phone || 'N/A'}</p>
                              </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-gray-400 shadow-sm"><Calendar size={16} /></div>
                              <div className="text-left">
                                  <p className="text-xs font-bold text-gray-400 uppercase">Joined</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                              </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-gray-400 shadow-sm"><Clock size={16} /></div>
                              <div className="text-left">
                                  <p className="text-xs font-bold text-gray-400 uppercase">Last Login</p>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {user.lastLoginAt ? formatTimestamp(user.lastLoginAt) : 'Never'}
                                  </p>
                              </div>
                          </div>
                      </div>

                      <div className="w-full pt-6 mt-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                          <button
                            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-200 dark:shadow-none"
                            onClick={handleEditClick}
                          >
                              <Edit3 size={16} /> Edit
                          </button>
                          {roleLabel !== 'Owner' && (
                              <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-900/50 rounded-xl font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-sm flex items-center justify-center gap-2"
                              >
                                  <Trash2 size={16} /> Delete
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Column: History & Permissions */}
          <div className="lg:col-span-8 space-y-6">

              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                        activeTab === 'activity'
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                      Activity History
                      {activeTab === 'activity' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></span>}
                  </button>
                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                        activeTab === 'permissions'
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                      Permissions & Access
                      {activeTab === 'permissions' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></span>}
                  </button>
              </div>

              {activeTab === 'activity' && (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 border border-gray-100 dark:border-slate-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>

                      {user.recentActivity && user.recentActivity.length > 0 ? (
                          <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-slate-700">
                              {user.recentActivity.map((log) => (
                                  <div key={log.id} className="relative pl-10">
                                      <div className="absolute left-0 top-1 p-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full z-10">
                                          {getActionIcon(log.action)}
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                                              {formatActionText(log)}
                                          </p>
                                          <div className="flex items-center gap-3 mt-1">
                                            <p className="text-xs text-gray-400 font-medium">{formatTimestamp(log.createdAt)}</p>
                                            {log.ip && (
                                              <span className="text-xs text-gray-300 font-mono">IP: {log.ip}</span>
                                            )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-10 text-gray-400">
                              <Clock size={32} className="mx-auto mb-3 opacity-50" />
                              <p className="font-medium">No activity recorded yet.</p>
                              <p className="text-xs mt-1">Activity will appear here once this user starts using the dashboard.</p>
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'permissions' && (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 border border-gray-100 dark:border-slate-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Access</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                              { id: 'dashboard', label: 'View Dashboard', icon: <Activity size={18} />, roles: ['MERCHANT_OWNER', 'MERCHANT_ADMIN', 'MERCHANT_STAFF'] },
                              { id: 'products', label: 'Manage Products', icon: <ShoppingBag size={18} />, roles: ['MERCHANT_OWNER', 'MERCHANT_ADMIN', 'MERCHANT_STAFF'] },
                              { id: 'orders', label: 'Process Orders', icon: <FileText size={18} />, roles: ['MERCHANT_OWNER', 'MERCHANT_ADMIN', 'MERCHANT_STAFF'] },
                              { id: 'users', label: 'Manage Users', icon: <UserIcon size={18} />, roles: ['MERCHANT_OWNER', 'MERCHANT_ADMIN'] },
                              { id: 'settings', label: 'Edit Settings', icon: <Lock size={18} />, roles: ['MERCHANT_OWNER'] }
                          ].map((perm) => {
                              const hasAccess = perm.roles.includes(user.role);
                              return (
                                  <div key={perm.id} className={`flex items-center justify-between p-4 rounded-2xl border ${hasAccess ? 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10' : 'border-gray-100 bg-gray-50/50 dark:border-slate-700 dark:bg-slate-800'}`}>
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${hasAccess ? 'bg-white dark:bg-slate-900 text-emerald-600' : 'bg-white dark:bg-slate-900 text-gray-400'}`}>
                                              {perm.icon}
                                          </div>
                                          <span className={`text-sm font-bold ${hasAccess ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{perm.label}</span>
                                      </div>
                                      {hasAccess ? (
                                          <CheckCircle2 size={20} className="text-emerald-500" />
                                      ) : (
                                          <Lock size={18} className="text-gray-300" />
                                      )}
                                  </div>
                              );
                          })}
                      </div>

                      {roleLabel === 'Owner' && (
                          <p className="mt-6 text-xs text-center text-gray-400 font-medium flex items-center justify-center gap-2">
                              <Shield size={12} /> Owners have full access to all system modules.
                          </p>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};