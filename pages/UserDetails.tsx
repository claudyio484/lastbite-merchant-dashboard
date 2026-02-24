import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload
} from 'lucide-react';
import { getUserById, deleteUser, saveUser, User } from '../utils/userStorage';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'activity' | 'permissions'>('activity');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const AVAILABLE_PERMISSIONS = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'products', label: 'Products' },
      { id: 'orders', label: 'Orders' },
      { id: 'users', label: 'Users' },
      { id: 'settings', label: 'Settings' }
  ];

  useEffect(() => {
    if (id) {
      setUser(getUserById(id));
    }
  }, [id]);

  const handleEditClick = () => {
      if (user) {
          setFormData({
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              status: user.status,
              permissions: user.permissions || [],
              avatar: user.avatar
          });
          setIsEditModalOpen(true);
      }
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

  const togglePermission = (permissionId: string) => {
      setFormData(prev => {
          const currentPermissions = prev.permissions || [];
          const newPermissions = currentPermissions.includes(permissionId)
              ? currentPermissions.filter(p => p !== permissionId)
              : [...currentPermissions, permissionId];
          return { ...prev, permissions: newPermissions };
      });
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (user && formData.name && formData.email) {
          const updatedUser: User = {
              ...user,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role as any,
              status: formData.status as any,
              permissions: formData.permissions,
              avatar: formData.avatar
          };
          
          saveUser(updatedUser);
          setUser(updatedUser);
          setIsEditModalOpen(false);
      }
  };

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
            <Link to="/users" className="mt-4 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:shadow-glow transition-all">Back to Team</Link>
        </div>
    );
  }

  const handleDelete = () => {
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      if (user) {
        deleteUser(user.id);
        navigate('/users');
      }
      setIsDeleteModalOpen(false);
  };

  const getRoleColor = (role: string) => {
      switch(role) {
          case 'Owner': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
          case 'Manager': return 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800';
          default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600';
      }
  };

  const getActionIcon = (type: string) => {
      switch(type) {
          case 'login': return <Clock size={16} className="text-blue-500" />;
          case 'create': return <CheckCircle2 size={16} className="text-emerald-500" />;
          case 'update': return <Edit3 size={16} className="text-amber-500" />;
          case 'status': return <Activity size={16} className="text-purple-500" />;
          default: return <FileText size={16} className="text-gray-400" />;
      }
  };

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
                              value={formData.name || ''}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                          <input 
                              type="email" 
                              required
                              value={formData.email || ''}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
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
                                  <option value="Driver">Driver</option>
                                  <option value="Owner">Owner</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                              <select 
                                  value={formData.status || 'Active'}
                                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
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
                                          formData.permissions?.includes(perm.id)
                                              ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
                                              : 'bg-gray-50 border-gray-100 dark:bg-slate-900 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                                      }`}
                                  >
                                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                          formData.permissions?.includes(perm.id)
                                              ? 'bg-brand-600 border-brand-600 text-white'
                                              : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                                      }`}>
                                          {formData.permissions?.includes(perm.id) && <CheckCircle2 size={12} />}
                                      </div>
                                      <span className={`text-sm font-medium ${
                                          formData.permissions?.includes(perm.id)
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
                  <Shield size={10} /> {user.role}
              </span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border ${user.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' : 'text-gray-500 bg-gray-100 border-gray-200 dark:bg-slate-700 dark:border-slate-600'}`}>
                  {user.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                  {user.status}
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
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                  <UserIcon size={40} className="text-gray-400" />
                              )}
                          </div>
                      </div>
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{user.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">User ID: {user.id}</p>
                      
                      <div className="w-full space-y-4">
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
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}</p>
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
                          {user.role !== 'Owner' && (
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
                      
                      {user.history && user.history.length > 0 ? (
                          <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-slate-700">
                              {user.history.map((log) => (
                                  <div key={log.id} className="relative pl-10">
                                      <div className="absolute left-0 top-1 p-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full z-10">
                                          {getActionIcon(log.type)}
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                                              {log.action} {log.target && <span className="text-brand-600 dark:text-brand-400 font-extrabold">{log.target}</span>}
                                          </p>
                                          <p className="text-xs text-gray-400 font-medium mt-1">{log.timestamp}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-10 text-gray-400">
                              <Clock size={32} className="mx-auto mb-3 opacity-50" />
                              <p>No activity recorded yet.</p>
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'permissions' && (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 border border-gray-100 dark:border-slate-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Access</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                              { id: 'dashboard', label: 'View Dashboard', icon: <Activity size={18} /> },
                              { id: 'products', label: 'Manage Products', icon: <ShoppingBag size={18} /> },
                              { id: 'orders', label: 'Process Orders', icon: <FileText size={18} /> },
                              { id: 'users', label: 'Manage Users', icon: <UserIcon size={18} /> },
                              { id: 'settings', label: 'Edit Settings', icon: <Lock size={18} /> }
                          ].map((perm) => {
                              const hasAccess = user.role === 'Owner' || user.permissions?.includes(perm.id) || user.permissions?.includes('all');
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
                              )
                          })}
                      </div>
                      
                      {user.role === 'Owner' && (
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