import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Paperclip,
  Check,
  CheckCheck,
  Ban,
  BellOff,
  User,
  Loader2
} from 'lucide-react';
import { Conversation, Message } from '../types';
import { getConversations, saveConversations, markConversationRead } from '../utils/messageStorage';

export const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Load conversations on mount
  useEffect(() => {
      const loadData = () => {
          const chats = getConversations();
          setConversations(chats);
      };
      loadData();
      window.addEventListener('localDataUpdate', loadData);
      return () => window.removeEventListener('localDataUpdate', loadData);
  }, []);

  const activeConversation = activeChatId ? conversations.find(c => c.id === activeChatId) : null;

   // Close menu on click outside
   useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleConversationClick = (id: string) => {
      setActiveChatId(id);
      const chat = conversations.find(c => c.id === id);
      // Only mark as read on explicit click
      if (chat && chat.unread > 0) {
          markConversationRead(id);
      }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeConversation) return;
    
    // Ensure we are targeting the currently viewed chat
    const targetChatId = activeConversation.id;

    const userMessageText = inputText;
    const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'me',
        text: userMessageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
    };

    // Optimistic Update
    const updatedConversations = conversations.map(c => {
        if (c.id === targetChatId) {
            return {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessage: 'You: ' + userMessageText,
                time: 'Just now'
            };
        }
        return c;
    });
    
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    
    setInputText('');
    setIsTyping(true);

    try {
        // Use activeConversation (which represents state at render) for prompt context
        const systemPrompt = `You are playing the role of ${activeConversation.name || 'Customer'}, a customer chatting with a grocery store merchant. 
        
        CONTEXT:
        - The merchant (user) is chatting with you.
        - Previous messages: ${activeConversation.messages.map(m => `[${m.sender === 'me' ? 'Merchant' : 'You'}]: ${m.text}`).join(' | ')}
        - Merchant just said: "${userMessageText}"

        INSTRUCTIONS:
        - Reply naturally to the merchant's message.
        - Keep the response short (1-2 sentences).
        - Act like a busy but polite customer.
        - If they answer a question, acknowledge it.
        - Do not include [You] or [Merchant] prefixes in your output. Just the text.
        `;

        // Initialize Gemini Client
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userMessageText,
            config: {
                systemInstruction: systemPrompt,
            }
        });
        
        const replyText = response.text;
        
        const replyMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'them',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setIsTyping(false);

        // Update with reply - Fetch fresh state from storage to avoid conflicts
        const finalConversations = getConversations().map(c => {
            if (c.id === targetChatId) {
                return {
                    ...c,
                    messages: [...c.messages, replyMessage],
                    lastMessage: replyText,
                    time: 'Just now',
                    unread: 0 // Since user is currently looking at it
                };
            }
            return c;
        });
        
        setConversations(finalConversations);
        saveConversations(finalConversations);

    } catch (error) {
        console.error("Error generating reply:", error);
        setIsTyping(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Page Title */}
      <div className="mb-6 shrink-0">
         <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Messages</h1>
         <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Communicate with customers in real-time.</p>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-soft overflow-hidden flex border border-gray-100 dark:border-slate-700 min-h-0">
        
        {/* Sidebar List */}
        <div className="w-full md:w-96 bg-cream-50/50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-700 flex flex-col">
          <div className="p-6 pb-2">
             <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search chats..." 
                 className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-500/20 outline-none text-sm font-medium dark:text-white"
               />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
             {conversations.map((chat) => (
               <div 
                 key={chat.id}
                 onClick={() => handleConversationClick(chat.id)}
                 className={`p-4 rounded-2xl cursor-pointer transition-all flex gap-4 items-center ${
                   activeConversation?.id === chat.id 
                     ? 'bg-white dark:bg-slate-800 shadow-md scale-[1.02]' 
                     : 'hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                 }`}
               >
                 <div className="relative">
                   <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                   {chat.online && (
                     <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-baseline mb-1">
                     <h3 className={`font-bold text-sm truncate ${activeConversation?.id === chat.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                       {chat.name}
                     </h3>
                     <span className="text-xs text-gray-400 font-medium">{chat.time}</span>
                   </div>
                   <p className={`text-xs truncate ${chat.unread > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                     {chat.lastMessage}
                   </p>
                 </div>
                 {chat.unread > 0 && (
                   <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-glow">
                     {chat.unread}
                   </div>
                 )}
               </div>
             ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <Send size={32} className="text-gray-400 dark:text-gray-500 ml-1" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No message selected</h3>
                <p className="max-w-xs mx-auto">Choose a conversation from the list to start chatting with your customers.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-20 px-8 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <img src={activeConversation.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                       <h3 className="font-bold text-gray-900 dark:text-white">{activeConversation.name}</h3>
                       <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                         {activeConversation.online ? 'Online now' : 'Offline'}
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 relative">
                    <button className="p-3 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                       <Phone size={20} />
                    </button>
                    <button className="p-3 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                       <Video size={20} />
                    </button>
                    
                    <div className="relative">
                      <button 
                          onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                          className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      >
                          <MoreVertical size={20} />
                      </button>
    
                      {isMenuOpen && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-gray-100 dark:border-slate-700 z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                              <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                  <User size={16} /> View Profile
                              </button>
                              <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                  <BellOff size={16} /> Mute Notifications
                              </button>
                              <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                              <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                  <Ban size={16} /> Block User
                              </button>
                          </div>
                      )}
                    </div>
                 </div>
              </div>
    
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-dots-pattern dark:bg-slate-800">
                 <div className="text-center">
                   <span className="px-4 py-1 bg-gray-50 dark:bg-slate-700 text-gray-400 text-xs font-bold rounded-md">Today</span>
                 </div>
                 
                 {activeConversation.messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                         <div 
                           className={`px-6 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm
                           ${msg.sender === 'me' 
                             ? 'bg-brand-600 text-white rounded-br-none' 
                             : 'bg-cream-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                           }`}
                         >
                           {msg.text}
                         </div>
                         <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold px-1">
                            <span>{msg.timestamp}</span>
                            {msg.sender === 'me' && (
                               msg.read ? <CheckCheck size={12} className="text-brand-500" /> : <Check size={12} />
                            )}
                         </div>
                      </div>
                   </div>
                 ))}
    
                 {isTyping && (
                     <div className="flex justify-start">
                        <div className="bg-cream-100 dark:bg-slate-700 px-6 py-4 rounded-3xl rounded-bl-none">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                     </div>
                 )}
              </div>
    
              {/* Input Area */}
              <div className="p-6 border-t border-gray-50 dark:border-slate-700 bg-white dark:bg-slate-800">
                 <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                   {['Yes, it is available!', 'Your order is ready.', 'Thanks for shopping!'].map((quickReply, i) => (
                     <button 
                       key={i}
                       onClick={() => setInputText(quickReply)}
                       className="px-4 py-2 bg-cream-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-brand-50 dark:hover:bg-slate-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap border border-gray-100 dark:border-slate-600"
                     >
                       {quickReply}
                     </button>
                   ))}
                 </div>
                 
                 <div className="flex items-end gap-3 bg-cream-50 dark:bg-slate-900 p-2 rounded-3xl border border-gray-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                    <button className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                       <Paperclip size={20} />
                    </button>
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message..." 
                      rows={1}
                      className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 max-h-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <button 
                       onClick={handleSend}
                       disabled={isTyping}
                       className={`p-3 rounded-2xl transition-all shadow-md ${
                         inputText.trim() && !isTyping
                           ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200' 
                           : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                       }`}
                    >
                       {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};