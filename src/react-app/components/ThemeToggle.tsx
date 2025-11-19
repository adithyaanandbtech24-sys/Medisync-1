import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/react-app/contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: isDark 
          ? 'linear-gradient(135deg, #334155, #1E293B)' 
          : 'linear-gradient(135deg, #4ECDC4, #44A08D)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(78, 205, 196, 0.3)',
        transition: 'all 0.3s ease'
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun size={24} color="#F1F5F9" /> : <Moon size={24} color="white" />}
      </motion.div>
    </motion.button>
  );
}
