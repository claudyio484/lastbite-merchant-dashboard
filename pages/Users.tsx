import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit3,
  Shield,
  Mail,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  X,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { fetchUsers, createUserApi, updateUserApi, deleteUserApi } from '../utils/api';

// Map backend role to display label
const ROLE_LABEL: Record<string, string> = {
  MERCHANT_OWNER: 'Owner',
  MERCHANT_ADMIN: 'Manager',
  MERCHANT_STAFF: 'Staff',
  SUPER_ADMIN: 'Super Admin',
};

// Map display label to backend role
const ROLE_VALUE: Record<string, string> = {
  Owner: 'MERCHANT_OWNER',
  Manager: 'MERCHANT_ADMIN',
  Staff: 'MERCHANT_STAFF',
};

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
}

export const Users: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id?: string }>({ isOpen: false });

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'Staff',
      jobTitle: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers();
      setUsers(res.data || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(u => {
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleEdit = (e: React.MouseEvent, user: ApiUser) => {
      e.stopPropagation();
      setEditingId(user.id);
      setFormData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          role: ROLE_LABEL[user.role] || 'Staff',
          jobTitle: user.jobTitle || '',
      });
      setIsModalOpen(true);
      setActiveMenuId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteModal({ isOpen: true, id });
      setActiveMenuId(null);
  };

  const confirmDelete = async () => {
      if (deleteModal.id) {
        try {
          await deleteUserApi(deleteModal.id);
          await loadUsers();
        } catch (err: any) {
          alert(err.message || 'Failed to delete user');
        }
      }
      setDeleteModal({ isOpen: false });
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormLoading(true);
      setError('');

      try {
        const backendRole = ROLE_VALUE[formData.role] || 'MERCHANT_STAFF';

        if (editingId) {
          await updateUserApi(editingId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || undefined,
            role: backendRole,
            jobTitle: formData.jobTitle || undefined,
          });
        } else {
          await createUserApi({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || undefined,
            role: backendRole,
            jobTitle: formData.jobTitle || undefined,
          });
        }

        await loadUsers();
        closeModal();
      } catch (err: any) {
        setError(err.message || 'Failed to save user');
      } finally {
        setFormLoading(false);
      }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setError('');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'Staff', jobTitle: '' });
  };

  const getRoleColor = (role: string) => {
      const label = ROLE_LABEL[role] || role;
      switch(label) {
          case 'Owner': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
          case 'Manager': return 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800';
          default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600';
      }
  };

  const formatLastActive = (user: ApiUser) => {
    if (!user.lastLoginAt) return 'Never';
    const diff = Date.now() - new Date(user.lastLoginAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 5) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Remove User?"
        message="Are you sure you want to remove this user? They will lose access to the dashboard immediately."
        confirmText="Remove User"
        cancelText="Cancel"
        variant="danger"
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('users')}</h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{t('manage_team')}</p>
        </div>

        <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200 transition-all"
        >
            <Plus size={20} /> {t('add_user')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-soft border border-gray-100 dark:border-slate-700 flex items-center">
         <Search className="ml-4 text-gray-400" size={20} />
         <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
         />
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/users/${user.id}`)}
                className="group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all relative cursor-pointer"
              >
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-cream-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
                              {user.avatar ? (
                                  <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                              ) : (
                                  <UserIcon size={28} />
                              )}
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {user.firstName} {user.lastName}
                              </h3>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleColor(user.role)}`}>
                                  <Shield size={10} /> {ROLE_LABEL[user.role] || user.role}
                              </span>
                          </div>
                      </div>

                      <div className="relative">
                          <button
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === user.id ? null : user.id); }}
                              className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                          >
                              <MoreVertical size={20} />
                          </button>

                          {activeMenuId === user.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                                  <button onClick={(e) => { e.stopPropagation(); navigate(`/users/${user.id}`); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                      <UserIcon size={16} /> View Profile
                                  </button>
                                  <button onClick={(e) => handleEdit(e, user)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                      <Edit3 size={16} /> Edit
                                  </button>
                                  {user.role !== 'MERCHANT_OWNER' && (
                                    <>
                                      <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                      <button onClick={(e) => handleDelete(e, user.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                          <Trash2 size={16} /> Delete
                                      </button>
                                    </>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-slate-700/50">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="p-1.5 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-400">
                              <Mail size={14} />
                          </div>
                          <span className="truncate font-medium">{user.email}</span>
                      </div>
                      {user.jobTitle && (
                        <p className="text-xs text-gray-400 font-medium">{user.jobTitle}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                          <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-md ${user.isActive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 bg-gray-100 dark:bg-slate-700'}`}>
                              {user.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                              {user.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-brand-500 transition-colors">
                              {formatLastActive(user)} <ArrowRight size={12} />
                          </div>
                      </div>
                  </div>
              </div>
          ))}

          {filteredUsers.length === 0 && !loading && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <UserIcon size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-bold">No team members found</p>
            </div>
          )}
      </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{editingId ? 'Edit User' : t('add_user')}</h2>
                      <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
                          {error}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                          <input
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                              placeholder="Sara"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                          <input
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                              placeholder="Khan"
                          />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                          <input
                              type="email"
                              required
                              disabled={!!editingId}
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white disabled:opacity-50"
                              placeholder="sara@mygrocery.ae"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                          <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                              placeholder="+971..."
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                              <select
                                  value={formData.role}
                                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                                  className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white cursor-pointer"
                              >
                                  <option value="Staff">Staff</option>
                                  <option value="Manager">Manager</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                              <input
                                  type="text"
                                  value={formData.jobTitle}
                                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                                  className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                                  placeholder="Cashier"
                              />
                          </div>
                      </div>

                      <div className="pt-4">
                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                              {formLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                              {editingId ? 'Update User' : 'Create User'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};