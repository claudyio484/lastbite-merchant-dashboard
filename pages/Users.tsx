import React, { useState, useEffect, useRef } from 'react';
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
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { getUsers, saveUser, deleteUser, User } from '../utils/userStorage';

export const Users: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id?: string }>({ isOpen: false });

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'Staff',
      status: 'Active',
      permissions: [] as string[],
      avatar: null as string | null
  });

  const AVAILABLE_PERMISSIONS = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'products', label: 'Products' },
      { id: 'orders', label: 'Orders' },
      { id: 'users', label: 'Users' },
      { id: 'settings', label: 'Settings' }
  ];

  useEffect(() => {
    const loadData = () => setUsers(getUsers());
    loadData();
    window.addEventListener('localDataUpdate', loadData);
    return () => window.removeEventListener('localDataUpdate', loadData);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (e: React.MouseEvent, user: User) => {
      e.stopPropagation();
      setEditingId(user.id);
      setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          permissions: user.permissions || [],
          avatar: user.avatar || null
      });
      setIsModalOpen(true);
      setActiveMenuId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteModal({ isOpen: true, id });
      setActiveMenuId(null);
  };

  const confirmDelete = () => {
      if (deleteModal.id) {
          deleteUser(deleteModal.id);
      }
      setDeleteModal({ isOpen: false });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, avatar: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newUser: User = {
          id: editingId || Date.now().toString(),
          name: formData.name,
          email: formData.email,
          role: formData.role as any,
          status: formData.status as any,
          permissions: formData.permissions,
          lastActive: editingId ? (users.find(u => u.id === editingId)?.lastActive || 'Just now') : 'Invited',
          avatar: formData.avatar || undefined,
          joinedDate: editingId ? (users.find(u => u.id === editingId)?.joinedDate) : new Date().toISOString()
      };

      saveUser(newUser);
      closeModal();
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', email: '', role: 'Staff', status: 'Active', permissions: [], avatar: null });
  };

  const togglePermission = (permissionId: string) => {
      setFormData(prev => {
          const newPermissions = prev.permissions.includes(permissionId)
              ? prev.permissions.filter(p => p !== permissionId)
              : [...prev.permissions, permissionId];
          return { ...prev, permissions: newPermissions };
      });
  };

  const getRoleColor = (role: string) => {
      switch(role) {
          case 'Owner': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
          case 'Manager': return 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800';
          default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600';
      }
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
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                  <UserIcon size={28} />
                              )}
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{user.name}</h3>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleColor(user.role)}`}>
                                  <Shield size={10} /> {user.role}
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
                                  <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                  <button onClick={(e) => handleDelete(e, user.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                      <Trash2 size={16} /> Delete
                                  </button>
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
                      <div className="flex items-center justify-between mt-2">
                          <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-md ${user.status === 'Active' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-500 bg-gray-100 dark:bg-slate-700'}`}>
                              {user.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                              {user.status}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-brand-500 transition-colors">
                              Details <ArrowRight size={12} />
                          </div>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{editingId ? 'Edit User' : t('add_user')}</h2>
                      <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      {/* Avatar Upload */}
                      <div className="flex flex-col items-center mb-6">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-600 shadow-md">
                                  {formData.avatar ? (
                                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <UserIcon size={40} />
                                      </div>
                                  )}
                              </div>
                              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera className="text-white" size={24} />
                              </div>
                          </div>
                          <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                          />
                          <p className="text-xs text-gray-500 mt-2">Click to upload new photo</p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                          <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                              placeholder="John Doe"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                          <input 
                              type="email" 
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                              placeholder="john@example.com"
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
                                  <option value="Driver">Driver</option>
                                  <option value="Owner">Owner</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                              <select 
                                  value={formData.status}
                                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                                  className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white cursor-pointer"
                              >
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                          <div className="grid grid-cols-2 gap-3">
                              {AVAILABLE_PERMISSIONS.map((perm) => (
                                  <div 
                                      key={perm.id}
                                      onClick={() => togglePermission(perm.id)}
                                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                          formData.permissions.includes(perm.id)
                                              ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
                                              : 'bg-gray-50 border-gray-100 dark:bg-slate-900 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                                      }`}
                                  >
                                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                          formData.permissions.includes(perm.id)
                                              ? 'bg-brand-600 border-brand-600 text-white'
                                              : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                                      }`}>
                                          {formData.permissions.includes(perm.id) && <CheckCircle2 size={12} />}
                                      </div>
                                      <span className={`text-sm font-medium ${
                                          formData.permissions.includes(perm.id)
                                              ? 'text-brand-900 dark:text-brand-100'
                                              : 'text-gray-600 dark:text-gray-400'
                                      }`}>
                                          {perm.label}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                      <div className="pt-4">
                          <button type="submit" className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all">
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