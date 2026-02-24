export interface ActivityLog {
  id: string;
  action: string;
  target?: string;
  timestamp: string;
  type: 'update' | 'create' | 'delete' | 'login' | 'status';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Owner' | 'Manager' | 'Staff' | 'Driver';
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatar?: string;
  joinedDate?: string;
  permissions?: string[];
  history?: ActivityLog[];
}

const STORAGE_KEY = 'lastbite_users_v1';

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Joe Doe',
    email: 'joe@example.com',
    phone: '+971 50 123 4567',
    role: 'Owner',
    status: 'Active',
    lastActive: 'Just now',
    avatar: 'https://i.pravatar.cc/150?u=joe',
    joinedDate: '2023-01-15',
    permissions: ['all'],
    history: [
      { id: 'h1', action: 'Updated store settings', timestamp: '2 hours ago', type: 'update' },
      { id: 'h2', action: 'Processed Order #4039', target: 'Order #4039', timestamp: '5 hours ago', type: 'update' },
      { id: 'h3', action: 'Logged in', timestamp: 'Today, 09:00 AM', type: 'login' },
      { id: 'h4', action: 'Added new user', target: 'Ahmed Ali', timestamp: 'Yesterday', type: 'create' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    phone: '+971 55 987 6543',
    role: 'Manager',
    status: 'Active',
    lastActive: '2 hours ago',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    joinedDate: '2023-03-10',
    permissions: ['dashboard', 'products', 'orders', 'analytics', 'users'],
    history: [
      { id: 'h1', action: 'Updated product stock', target: 'Organic Berry Mix', timestamp: '2 hours ago', type: 'update' },
      { id: 'h2', action: 'Resolved customer message', target: 'Chat #12', timestamp: 'Yesterday', type: 'status' },
      { id: 'h3', action: 'Logged in', timestamp: 'Yesterday, 08:30 AM', type: 'login' }
    ]
  },
  {
    id: '3',
    name: 'Ahmed Ali',
    email: 'ahmed@example.com',
    phone: '+971 52 333 4444',
    role: 'Staff',
    status: 'Inactive',
    lastActive: '3 days ago',
    joinedDate: '2023-06-20',
    permissions: ['orders', 'products'],
    history: [
      { id: 'h1', action: 'Marked order as Ready', target: 'Order #4035', timestamp: '3 days ago', type: 'status' },
      { id: 'h2', action: 'Logged in', timestamp: '3 days ago', type: 'login' }
    ]
  }
];

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return MOCK_USERS;
  }
};

export const getUserById = (id: string): User | undefined => {
    const users = getUsers();
    return users.find(u => u.id === id);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index >= 0) {
    // Update existing
    users[index] = { ...users[index], ...user };
  } else {
    // Add new
    users.unshift(user);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('localDataUpdate'));
};

export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('localDataUpdate'));
};