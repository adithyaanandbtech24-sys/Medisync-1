import { useState, useRef, useEffect } from 'react';
import { Brain, X, Send, Loader2 } from 'lucide-react';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const colors = useThemeColors();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm your HIPAA-compliant AI medical assistant powered by Google's Gemini AI. Upload your medical reports and I'll analyze them to track your organ health trends over time. What would you like to know?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Load chat history
      fetch('/api/chat/history')
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 1) {
            // Only load if there are messages beyond the initial greeting
            setMessages(data.messages.map((m: any) => ({
              role: m.role,
              content: m.content
            })));
          }
        })
        .catch(err => console.error('Error loading chat history:', err));
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: 'I can help with your health questions. Try asking about your organ health or uploading medical reports.' }
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '110px',
      width: '420px',
      height: '600px',
      background: colors.isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: `1px solid ${colors.cardBorder}`,
      boxShadow: colors.isDark ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${colors.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={22} color="white" />
          </div>
          <div>
            <h3 style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: '700', margin: 0 }}>MediSync AI</h3>
            <p style={{ color: colors.textSecondary, fontSize: '11px', margin: 0 }}>Powered by Gemini AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: colors.textSecondary,
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: '16px',
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
                : colors.inputBg,
              color: msg.role === 'user' ? 'white' : colors.textPrimary,
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              background: colors.inputBg,
              color: colors.textSecondary,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '20px',
        borderTop: `1px solid ${colors.divider}`,
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your health..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1px solid ${colors.inputBorder}`,
            background: colors.inputBg,
            fontSize: '14px',
            outline: 'none',
            color: colors.textPrimary
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: input.trim() 
              ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
              : colors.inputBg,
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
        >
          <Send size={20} color={input.trim() ? 'white' : '#7F8C8D'} />
        </button>
      </div>
    </div>
  );
}
