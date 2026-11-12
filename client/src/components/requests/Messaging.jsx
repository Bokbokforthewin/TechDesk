import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle } from 'lucide-react';

export default function Messaging({ requestId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = () => {
    if (!requestId) return;
    const token = localStorage.getItem('access_token');
    
    fetch(`http://localhost:8000/api/requests/${requestId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load messages.');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
          setError('');
        } else {
          setMessages([]);
        }
      })
      .catch((err) => {
        console.error('Messaging fetch error:', err);
        setError('Failed to load chat history.');
        setMessages([]);
      });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:8000/api/requests/${requestId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message_content: content }),
      });

      if (res.ok) {
        setContent('');
        fetchMessages();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setError('Network error sending message.');
    }
  };

  return (
    <div className="flex flex-col h-80 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2 bg-white border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center">
        <span>Request Conversation Thread</span>
        {error && <span className="text-[10px] text-red-500 font-normal">{error}</span>}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser?.user_id;
            return (
              <div key={msg.message_id || Math.random()} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-0.5 px-1">{msg.sender?.name || 'User'}</span>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.message_content}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                  {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-center text-xs text-slate-400 py-6">No messages yet. Send a message below.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}