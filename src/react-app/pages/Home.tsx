import { useState } from 'react';
import LiquidEther from '@/react-app/components/LiquidEther';
import YourDashboard from '@/react-app/pages/YourDashboard';
import OrganDetailEnhanced from '@/react-app/pages/OrganDetailEnhanced';
import EnhancedChatbot from '@/react-app/components/EnhancedChatbot';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';
import { OrganData } from '@/shared/types';

export default function Home() {
  const colors = useThemeColors();
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const organData: Record<string, OrganData> = {
    heart: {
      name: 'Heart',
      color: '#FF6B9D',
      currentHealth: 85,
      metrics: [
        { name: 'Heart Rate', value: '72 bpm', status: 'normal', trend: 'stable' },
        { name: 'Blood Pressure', value: '120/80', status: 'normal', trend: 'improving' },
        { name: 'Ejection Fraction', value: '60%', status: 'normal', trend: 'stable' },
        { name: 'Cholesterol', value: '180 mg/dL', status: 'normal', trend: 'improving' }
      ],
      yearlyData: [
        { year: '2020', health: 75 },
        { year: '2021', health: 78 },
        { year: '2022', health: 82 },
        { year: '2023', health: 85 }
      ],
      monthlyData: Array.from({length: 12}, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        health: 80 + Math.random() * 10
      }))
    },
    lungs: {
      name: 'Lungs',
      color: '#4ECDC4',
      currentHealth: 88,
      metrics: [
        { name: 'FEV1', value: '3.2 L', status: 'normal', trend: 'stable' },
        { name: 'SpO2', value: '98%', status: 'excellent', trend: 'stable' },
        { name: 'Lung Capacity', value: '4.8 L', status: 'normal', trend: 'improving' },
        { name: 'Respiratory Rate', value: '16/min', status: 'normal', trend: 'stable' }
      ],
      yearlyData: [
        { year: '2020', health: 82 },
        { year: '2021', health: 84 },
        { year: '2022', health: 86 },
        { year: '2023', health: 88 }
      ],
      monthlyData: Array.from({length: 12}, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        health: 85 + Math.random() * 8
      }))
    },
    liver: {
      name: 'Liver',
      color: '#FFB84D',
      currentHealth: 82,
      metrics: [
        { name: 'ALT', value: '28 U/L', status: 'normal', trend: 'improving' },
        { name: 'AST', value: '25 U/L', status: 'normal', trend: 'stable' },
        { name: 'Bilirubin', value: '0.9 mg/dL', status: 'normal', trend: 'stable' },
        { name: 'Albumin', value: '4.2 g/dL', status: 'normal', trend: 'stable' }
      ],
      yearlyData: [
        { year: '2020', health: 76 },
        { year: '2021', health: 78 },
        { year: '2022', health: 80 },
        { year: '2023', health: 82 }
      ],
      monthlyData: Array.from({length: 12}, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        health: 78 + Math.random() * 10
      }))
    },
    kidneys: {
      name: 'Kidneys',
      color: '#A78BFA',
      currentHealth: 90,
      metrics: [
        { name: 'Creatinine', value: '0.95 mg/dL', status: 'normal', trend: 'stable' },
        { name: 'GFR', value: '95 mL/min', status: 'excellent', trend: 'stable' },
        { name: 'BUN', value: '15 mg/dL', status: 'normal', trend: 'stable' },
        { name: 'Urine Protein', value: 'Negative', status: 'normal', trend: 'stable' }
      ],
      yearlyData: [
        { year: '2020', health: 86 },
        { year: '2021', health: 87 },
        { year: '2022', health: 89 },
        { year: '2023', health: 90 }
      ],
      monthlyData: Array.from({length: 12}, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        health: 88 + Math.random() * 5
      }))
    }
  };

  const handleAskAI = () => {
    setSelectedOrgan(null);
    setChatOpen(true);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: colors.bgGradient,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '40px 20px',
      transition: 'background 0.3s ease'
    }}>
      <LiquidEther
        colors={colors.isDark ? ['#334155', '#475569', '#1E293B'] : ['#4ECDC4', '#95E1D3', '#F38181']}
        mouseForce={15}
        cursorSize={120}
        resolution={0.4}
        autoDemo={true}
        autoSpeed={0.3}
        autoIntensity={1.8}
      />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {selectedOrgan ? (
          <OrganDetailEnhanced
            organKey={selectedOrgan}
            organData={organData[selectedOrgan]}
            onBack={() => setSelectedOrgan(null)}
            onAskAI={handleAskAI}
          />
        ) : (
          <YourDashboard onOrganSelect={setSelectedOrgan} />
        )}
      </div>

      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
          border: 'none',
          boxShadow: colors.accentGlow,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <MessageSquare size={28} color="white" />
      </motion.button>

      <EnhancedChatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
