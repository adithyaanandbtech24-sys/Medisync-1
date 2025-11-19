import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  title: string;
  color: string;
  dataKeys?: string[];
  chartType?: 'line' | 'area' | 'bar';
  height?: number;
}

export default function InteractiveChart({ 
  data, 
  title, 
  color, 
  dataKeys = ['value'],
  chartType = 'area',
  height = 300 
}: InteractiveChartProps) {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [showAllData, setShowAllData] = useState(false);
  const colors = useThemeColors();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.cardBg,
            backdropFilter: 'blur(20px)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            {payload[0].payload.name}
          </div>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} style={{ color: entry.color, fontSize: '13px', marginBottom: '4px' }}>
              {entry.name}: <strong>{entry.value.toFixed(1)}{entry.unit || ''}</strong>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartProps = {
      data: showAllData ? data : data.slice(-12),
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const commonLineProps = {
      type: 'monotone' as const,
      stroke: color,
      strokeWidth: 3,
      dot: { fill: color, r: 5 },
      activeDot: { r: 7 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} />
            <XAxis dataKey="name" stroke={colors.textSecondary} fontSize={12} />
            <YAxis stroke={colors.textSecondary} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: colors.textPrimary }} />
            {dataKeys.map((key, idx) => (
              <Line key={key} dataKey={key} {...commonLineProps} stroke={idx === 0 ? color : `${color}80`} />
            ))}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} />
            <XAxis dataKey="name" stroke={colors.textSecondary} fontSize={12} />
            <YAxis stroke={colors.textSecondary} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: colors.textPrimary }} />
            {dataKeys.map((key, idx) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={idx === 0 ? color : `${color}80`}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        );
      
      default: // area
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id={`areaGradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} />
            <XAxis dataKey="name" stroke={colors.textSecondary} fontSize={12} />
            <YAxis stroke={colors.textSecondary} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: colors.textPrimary }} />
            {dataKeys.map((key, idx) => (
              <Area 
                key={key}
                type="monotone"
                dataKey={key}
                stroke={idx === 0 ? color : `${color}80`}
                strokeWidth={3}
                fill={`url(#areaGradient-${title})`}
              />
            ))}
          </AreaChart>
        );
    }
  };

  return (
    <div style={{
      background: colors.cardBg,
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: `1px solid ${colors.cardBorder}`,
      padding: '25px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={24} color={color} />
          <h3 style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: '700', margin: 0 }}>
            {title}
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Period Selector */}
          {['daily', 'monthly', 'yearly'].map((p) => (
            <motion.button
              key={p}
              onClick={() => setPeriod(p as any)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: period === p ? `${color}30` : 'transparent',
                border: `1px solid ${period === p ? color : colors.divider}`,
                color: period === p ? color : colors.textSecondary,
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
            >
              {p}
            </motion.button>
          ))}
          
          {/* Show All Toggle */}
          <motion.button
            onClick={() => setShowAllData(!showAllData)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: showAllData ? color : 'transparent',
              border: `1px solid ${color}`,
              color: showAllData ? 'white' : color,
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <TrendingUp size={14} />
            {showAllData ? 'Show Less' : 'Show All'}
          </motion.button>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </motion.div>

      {/* Data Summary */}
      <AnimatePresence>
        {showAllData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: '20px',
              padding: '15px',
              background: `${color}15`,
              borderRadius: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '15px'
            }}
          >
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
                Average
              </div>
              <div style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: '700' }}>
                {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}
              </div>
            </div>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
                Highest
              </div>
              <div style={{ color: color, fontSize: '18px', fontWeight: '700' }}>
                {Math.max(...data.map(d => d.value)).toFixed(1)}
              </div>
            </div>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
                Lowest
              </div>
              <div style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: '700' }}>
                {Math.min(...data.map(d => d.value)).toFixed(1)}
              </div>
            </div>
            <div>
              <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
                Data Points
              </div>
              <div style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: '700' }}>
                {data.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
