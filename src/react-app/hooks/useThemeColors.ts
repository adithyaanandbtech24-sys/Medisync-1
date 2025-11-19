import { useTheme } from '@/react-app/contexts/ThemeContext';

export function useThemeColors() {
  const { isDark } = useTheme();

  return {
    // Background
    bg: isDark ? '#0F172A' : '#E8F5F7',
    bgGradient: isDark 
      ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' 
      : 'linear-gradient(135deg, #E8F5F7 0%, #F0E8F5 100%)',
    
    // Cards
    cardBg: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.08)',
    cardBorder: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.12)',
    
    // Text
    textPrimary: isDark ? '#F1F5F9' : '#2C3E50',
    textSecondary: isDark ? '#94A3B8' : '#7F8C8D',
    textMuted: isDark ? '#64748B' : '#BDC3C7',
    
    // Accents
    accent: '#4ECDC4',
    accentLight: isDark ? 'rgba(78, 205, 196, 0.2)' : 'rgba(78, 205, 196, 0.1)',
    accentGlow: isDark 
      ? '0 10px 40px rgba(78, 205, 196, 0.3)' 
      : '0 8px 30px rgba(78, 205, 196, 0.25)',
    
    // Dividers
    divider: isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(127, 140, 141, 0.1)',
    
    // Input
    inputBg: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    inputBorder: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(127, 140, 141, 0.2)',
    
    // Status colors
    success: '#4ECDC4',
    warning: '#FFB84D',
    error: '#FF6B6B',
    info: '#A78BFA',
    
    // Spotlights
    spotlightGradient: isDark
      ? 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(78, 205, 196, 0.15), transparent 40%)'
      : 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(78, 205, 196, 0.15), transparent 40%)',
    
    isDark
  };
}
