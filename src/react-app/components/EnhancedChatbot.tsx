import { useState, useRef, useEffect } from 'react';
import { Brain, X, Send, Loader2, Sparkles, FileText, Pill, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface EnhancedChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedChatbot({ isOpen, onClose }: EnhancedChatbotProps) {
  const colors = useThemeColors();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "👋 Hello! I'm MediSync AI, your personal medical assistant powered by Google's Gemini AI.\n\nI can help you with:\n\n🔬 Understanding your lab results and health metrics\n💊 Medication information (dosages, timing, interactions)\n📋 Explaining medical terms and conditions\n🏃 Lifestyle and preventive care recommendations\n\nWhat would you like to know?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // Load chat history
      fetch('/api/chat/history')
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 1) {
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
        { role: 'assistant', content: 'I apologize for the inconvenience. Please try asking your question again, or contact support if the issue persists.' }
      ]);
    }
  };

  const quickActions = [
    { icon: FileText, text: 'Explain my lab results', color: '#4ECDC4' },
    { icon: Pill, text: 'Medication interactions', color: '#A78BFA' },
    { icon: Heart, text: 'Heart health tips', color: '#FF6B9D' },
    { icon: Sparkles, text: 'Health improvement plan', color: '#FFB84D' }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '110px',
        width: '450px',
        height: '650px',
        background: colors.isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: colors.isDark ? '0 25px 70px rgba(0, 0, 0, 0.6)' : '0 25px 70px rgba(0, 0, 0, 0.25)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: `1px solid ${colors.divider}`,
        background: `linear-gradient(135deg, ${colors.accent}15, transparent)`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(78, 205, 196, 0.4)'
              }}
            >
              <Brain size={26} color="white" />
            </motion.div>
            <div>
              <h3 style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: '700', margin: 0 }}>
                MediSync AI
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#4ECDC4',
                  animation: 'pulse 2s infinite'
                }} />
                <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                  Online • Powered by Gemini
                </p>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: colors.inputBg,
              border: `1px solid ${colors.divider}`,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary
            }}
          >
            <X size={20} />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '14px 18px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
                  : colors.inputBg,
                color: msg.role === 'user' ? 'white' : colors.textPrimary,
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'user' 
                  ? '0 4px 12px rgba(78, 205, 196, 0.3)' 
                  : `0 2px 8px ${colors.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', justifyContent: 'flex-start' }}
          >
            <div style={{
              padding: '14px 18px',
              borderRadius: '18px 18px 18px 4px',
              background: colors.inputBg,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: `0 2px 8px ${colors.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`
            }}>
              <Loader2 size={18} color={colors.accent} className="animate-spin" />
              <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
                Analyzing...
              </span>
            </div>
          </motion.div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '0 24px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}
        >
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInput(action.text)}
                style={{
                  padding: '12px',
                  background: colors.inputBg,
                  border: `1px solid ${colors.divider}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} color={action.color} />
                <span style={{ flex: 1, textAlign: 'left' }}>{action.text}</span>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Input */}
      <div style={{
        padding: '20px 24px',
        borderTop: `1px solid ${colors.divider}`,
        background: colors.isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask me anything about your health..."
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '14px',
              border: `1.5px solid ${colors.inputBorder}`,
              background: colors.inputBg,
              fontSize: '14px',
              outline: 'none',
              color: colors.textPrimary,
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = colors.accent}
            onBlur={(e) => e.currentTarget.style.borderColor = colors.inputBorder}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: input.trim() && !isTyping
                ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'
                : colors.inputBg,
              border: 'none',
              cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(78, 205, 196, 0.3)' : 'none'
            }}
          >
            <Send size={20} color={input.trim() && !isTyping ? 'white' : colors.textMuted} />
          </motion.button>
        </div>
        <p style={{ 
          color: colors.textMuted, 
          fontSize: '11px', 
          margin: '12px 0 0 0',
          textAlign: 'center'
        }}>
          🔒 HIPAA compliant • Your data is encrypted and secure
        </p>
      </div>
    </motion.div>
  );
}
