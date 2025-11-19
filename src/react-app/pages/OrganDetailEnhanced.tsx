import { useState, useEffect } from 'react';
import { Brain, MessageSquare, TrendingUp, Activity, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/react-app/components/GlassCard';
import InteractiveChart from '@/react-app/components/InteractiveChart';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';
import { OrganData } from '@/shared/types';

interface OrganDetailEnhancedProps {
  organKey: string;
  organData: OrganData;
  onBack: () => void;
  onAskAI: () => void;
}

export default function OrganDetailEnhanced({ organKey, organData, onBack, onAskAI }: OrganDetailEnhancedProps) {
  const colors = useThemeColors();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/metrics/${organKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.metrics) {
          console.log('Loaded metrics:', data.metrics);
        }
      })
      .catch(err => console.error('Error loading metrics:', err));
  }, [organKey]);

  const Icon = organData.name === 'Heart' ? require('lucide-react').Heart :
               organData.name === 'Lungs' ? require('lucide-react').Wind :
               organData.name === 'Liver' ? require('lucide-react').Activity :
               require('lucide-react').Droplet;

  // Generate comprehensive chart data
  const yearlyChartData = organData.yearlyData.map(d => ({
    name: d.year,
    value: d.health,
    ...d
  }));

  const monthlyChartData = Array.from({length: 12}, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: 80 + Math.random() * 15,
    metric1: 70 + Math.random() * 20,
    metric2: 75 + Math.random() * 18
  }));

  const dailyChartData = Array.from({length: 30}, (_, i) => ({
    name: `Day ${i + 1}`,
    value: 82 + Math.random() * 12,
    morning: 80 + Math.random() * 10,
    evening: 83 + Math.random() * 10
  }));

  return (
    <div>
      {/* Header */}
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.02, x: -5 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          background: colors.accentLight,
          border: `1px solid ${colors.accent}`,
          padding: '12px 20px',
          borderRadius: '12px',
          color: colors.accent,
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <ChevronLeft size={20} />
        Back to Dashboard
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px' }}
      >
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '24px',
          background: `linear-gradient(135deg, ${organData.color}, ${organData.color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 15px 40px ${organData.color}50`
        }}>
          <Icon size={45} color="white" />
        </div>
        <div>
          <h1 style={{ 
            color: colors.textPrimary, 
            fontSize: '42px', 
            fontWeight: '800', 
            margin: '0 0 10px 0',
            background: `linear-gradient(135deg, ${colors.textPrimary}, ${organData.color})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {organData.name} Health
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: `${organData.color}25`,
              color: organData.color,
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <TrendingUp size={18} />
              {organData.currentHealth}% Health Score
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}
      >
        {organData.metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            whileHover={{ scale: 1.03 }}
          >
            <GlassCard 
              style={{ 
                padding: '24px',
                cursor: 'pointer',
                border: selectedMetric === metric.name ? `2px solid ${organData.color}` : undefined
              }}
              onClick={() => setSelectedMetric(metric.name)}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ color: colors.textSecondary, fontSize: '13px', fontWeight: '600' }}>
                  {metric.name}
                </div>
                {metric.trend === 'improving' ? (
                  <TrendingUp size={16} color={colors.success} />
                ) : metric.trend === 'declining' ? (
                  <AlertCircle size={16} color={colors.error} />
                ) : (
                  <Activity size={16} color={colors.textSecondary} />
                )}
              </div>
              <div style={{ color: colors.textPrimary, fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>
                {metric.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  background: metric.status === 'excellent' ? `${colors.success}20` : 
                             metric.status === 'normal' ? `${colors.success}15` : `${colors.error}15`,
                  color: metric.status === 'excellent' || metric.status === 'normal' ? colors.success : colors.error,
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {metric.status}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: '500' }}>
                  {metric.trend === 'improving' ? '↗ Improving' : 
                   metric.trend === 'declining' ? '↘ Declining' : '→ Stable'}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ marginBottom: '30px' }}
      >
        <InteractiveChart
          data={yearlyChartData}
          title="Yearly Health Trends"
          color={organData.color}
          dataKeys={['value']}
          chartType="area"
          height={350}
        />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <InteractiveChart
            data={monthlyChartData}
            title="Monthly Progress"
            color={organData.color}
            dataKeys={['value', 'metric1']}
            chartType="line"
            height={280}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <InteractiveChart
            data={dailyChartData.slice(-14)}
            title="Daily Tracking (Last 14 Days)"
            color={organData.color}
            dataKeys={['morning', 'evening']}
            chartType="bar"
            height={280}
          />
        </motion.div>
      </div>

      {/* AI Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${organData.color}, ${organData.color}dd)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Brain size={28} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
                AI-Powered Insights
              </h3>
              <p style={{ color: colors.textPrimary, fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' }}>
                Your {organData.name.toLowerCase()} health has shown {organData.currentHealth >= 85 ? 'excellent' : 'good'} progress 
                over the past year, with a current health score of <strong style={{ color: organData.color }}>{organData.currentHealth}%</strong>. 
                All key metrics are within {organData.currentHealth >= 85 ? 'optimal' : 'normal'} ranges.
              </p>
              
              <div style={{
                padding: '16px 20px',
                background: `${organData.color}10`,
                borderRadius: '12px',
                borderLeft: `4px solid ${organData.color}`,
                marginBottom: '16px'
              }}>
                <div style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  💡 Recommendations
                </div>
                <ul style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.7', margin: 0, paddingLeft: '20px' }}>
                  <li>Continue maintaining your current lifestyle and medication regimen</li>
                  <li>Regular monitoring is recommended every 3-6 months</li>
                  <li>Stay hydrated and maintain a balanced diet</li>
                  <li>Engage in moderate exercise for 30 minutes daily</li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAskAI}
                style={{
                  background: `linear-gradient(135deg, ${organData.color}, ${organData.color}dd)`,
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: `0 8px 20px ${organData.color}40`
                }}
              >
                <MessageSquare size={20} />
                Ask AI About This Organ
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* What You Can Improve Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ marginTop: '30px' }}
      >
        <GlassCard style={{ padding: '30px' }}>
          <h3 style={{ 
            color: colors.textPrimary, 
            fontSize: '20px', 
            fontWeight: '700', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <TrendingUp size={24} color={organData.color} />
            What You Can Improve
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            {[
              { title: 'Diet Optimization', desc: 'Include more omega-3 rich foods', impact: 'High' },
              { title: 'Exercise Routine', desc: 'Add 15 min cardio to daily routine', impact: 'Medium' },
              { title: 'Sleep Quality', desc: 'Maintain consistent sleep schedule', impact: 'High' },
              { title: 'Stress Management', desc: 'Practice meditation or yoga', impact: 'Medium' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                style={{
                  padding: '16px 18px',
                  background: colors.inputBg,
                  borderRadius: '12px',
                  border: `1px solid ${colors.divider}`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ color: colors.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                    {item.title}
                  </div>
                  <div style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: item.impact === 'High' ? `${colors.success}20` : `${colors.warning}20`,
                    color: item.impact === 'High' ? colors.success : colors.warning,
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    {item.impact}
                  </div>
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '13px' }}>
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
