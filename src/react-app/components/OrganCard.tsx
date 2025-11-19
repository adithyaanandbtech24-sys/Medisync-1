import { ChevronRight, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';

interface OrganCardProps {
  name: string;
  icon: LucideIcon;
  color: string;
  currentHealth: number;
  topMetric: {
    name: string;
    value: string;
  };
  onClick: () => void;
}

export default function OrganCard({ name, icon: Icon, color, currentHealth, topMetric, onClick }: OrganCardProps) {
  const colors = useThemeColors();
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
    <GlassCard
      style={{ 
        padding: '25px', 
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        marginBottom: '20px' 
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 20px ${color}30`
        }}>
          <Icon size={28} color="white" />
        </div>
        <ChevronRight size={24} color="#4ECDC4" />
      </div>
      
      <h3 style={{ 
        color: colors.textPrimary, 
        fontSize: '20px', 
        fontWeight: '700', 
        margin: '0 0 8px 0' 
      }}>
        {name}
      </h3>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '15px' 
      }}>
        <div style={{
          flex: 1,
          height: '8px',
          background: colors.divider,
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${currentHealth}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            borderRadius: '4px',
            transition: 'width 1s ease'
          }} />
        </div>
        <span style={{ 
          color, 
          fontSize: '16px', 
          fontWeight: '700', 
          minWidth: '45px' 
        }}>
          {currentHealth}%
        </span>
      </div>
      
      <div style={{ color: colors.textSecondary, fontSize: '13px' }}>
        {topMetric.name}: {topMetric.value}
      </div>
    </GlassCard>
    </motion.div>
  );
}
