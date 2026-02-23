import { Conversation } from '../types';

const STORAGE_KEY = 'lastbite_messages_v1';

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?u=1',
    lastMessage: 'Is the organic milk still available?',
    time: '10:42 AM',
    unread: 2,
    online: true,
    messages: [
      { id: '1', sender: 'them', text: 'Hi! I saw you have organic milk on sale.', timestamp: '10:40 AM' },
      { id: '2', sender: 'them', text: 'Is the organic milk still available?', timestamp: '10:42 AM' },
    ]
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://i.pravatar.cc/150?u=2',
    lastMessage: 'Great, I will pick it up at 5.',
    time: 'Yesterday',
    unread: 0,
    online: false,
    messages: [
      { id: '1', sender: 'me', text: 'Your order #4028 is ready for pickup!', timestamp: '4:30 PM', read: true },
      { id: '2', sender: 'them', text: 'Great, I will pick it up at 5.', timestamp: '4:35 PM' },
    ]
  },
  {
    id: '3',
    name: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/150?u=3',
    lastMessage: 'Can you hold the pastries for me?',
    time: 'Yesterday',
    unread: 0,
    online: true,
    messages: [
      { id: '1', sender: 'them', text: 'Running a bit late.', timestamp: '5:15 PM' },
      { id: '2', sender: 'them', text: 'Can you hold the pastries for me?', timestamp: '5:16 PM' },
    ]
  }
];

export const getConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
    return INITIAL_CONVERSATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_CONVERSATIONS;
  }
};

export const saveConversations = (conversations: Conversation[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  window.dispatchEvent(new Event('localDataUpdate'));
};

export const markConversationRead = (id: string): void => {
    const conversations = getConversations();
    const updated = conversations.map(c => 
        c.id === id ? { ...c, unread: 0 } : c
    );
    saveConversations(updated);
};