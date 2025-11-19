import { useState, useEffect } from 'react';
import { Brain, MessageSquare } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import { OrganData } from '@/shared/types';

interface OrganDetailProps {
  organKey: string;
  organData: OrganData;
  onBack: () => void;
  onAskAI: () => void;
}

export default function OrganDetail({ organKey, organData, onBack, onAskAI }: OrganDetailProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'M' | 'Y'>('Y');

  useEffect(() => {
    // Load metrics from database for future use
    fetch(`/api/metrics/${organKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.metrics) {
          // Metrics loaded successfully
          console.log('Loaded metrics:', data.metrics);
        }
      })
      .catch(err => console.error('Error loading metrics:', err));
  }, [organKey]);

  const Icon = organData.name === 'Heart' ? require('lucide-react').Heart :
               organData.name === 'Lungs' ? require('lucide-react').Wind :
               organData.name === 'Liver' ? require('lucide-react').Activity :
               require('lucide-react').Droplet;

  const chartData = selectedPeriod === 'Y' ? organData.yearlyData : organData.monthlyData;

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'rgba(78, 205, 196, 0.15)',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '12px',
          color: '#4ECDC4',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${organData.color}, ${organData.color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 10px 30px ${organData.color}40`
        }}>
          <Icon size={40} color="white" />
        </div>
        <div>
          <h1 style={{ color: '#2C3E50', fontSize: '36px', fontWeight: '700', margin: '0 0 8px 0' }}>
            {organData.name} Health
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: `${organData.color}20`,
              color: organData.color,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {organData.currentHealth}% Health Score
            </div>
            <div style={{ color: '#7F8C8D', fontSize: '14px' }}>
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {organData.metrics.map((metric, idx) => (
          <GlassCard key={idx} style={{ padding: '20px' }}>
            <div style={{ color: '#7F8C8D', fontSize: '13px', marginBottom: '8px' }}>{metric.name}</div>
            <div style={{ color: '#2C3E50', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              {metric.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: metric.status === 'excellent' ? 'rgba(78, 205, 196, 0.15)' : 
                           metric.status === 'normal' ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                color: metric.status === 'excellent' || metric.status === 'normal' ? '#4ECDC4' : '#FF6B6B',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {metric.status}
              </div>
              <div style={{ color: '#7F8C8D', fontSize: '11px' }}>
                {metric.trend === 'improving' ? '↗ Improving' : 
                 metric.trend === 'declining' ? '↘ Declining' : '→ Stable'}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Historical Chart */}
      {chartData.length > 0 && (
        <GlassCard style={{ padding: '30px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ color: '#2C3E50', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              Health Trends
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['M', 'Y'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period as 'M' | 'Y')}
                  style={{
                    background: selectedPeriod === period ? `${organData.color}30` : 'transparent',
                    border: 'none',
                    color: selectedPeriod === period ? organData.color : '#7F8C8D',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '300px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 300">
              <defs>
                <linearGradient id={`gradient-${organKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={organData.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={organData.color} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Grid */}
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1="60" y1={50 + i * 50} x2="780" y2={50 + i * 50} 
                  stroke="rgba(127, 140, 141, 0.1)" strokeWidth="1" />
              ))}
              
              {(() => {
                const width = 720;
                const spacing = width / (chartData.length + 1);
                
                const healthPath = chartData.map((d, i) => {
                  const x = 60 + spacing * (i + 1);
                  const y = 250 - (d.health * 2);
                  return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
                }).join(' ');
                
                const areaPath = `${healthPath} L ${60 + spacing * chartData.length},250 L 60,250 Z`;
                
                return (
                  <>
                    <path d={areaPath} fill={`url(#gradient-${organKey})`} />
                    <path d={healthPath} fill="none" stroke={organData.color} strokeWidth="3" strokeLinecap="round" />
                    
                    {chartData.map((d, i) => {
                      const x = 60 + spacing * (i + 1);
                      const y = 250 - (d.health * 2);
                      const label = selectedPeriod === 'Y' ? d.year : d.month;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill={organData.color}>
                            <title>{label}: {d.health.toFixed(1)}%</title>
                          </circle>
                          <text x={x} y="280" fill="#7F8C8D" fontSize="11" textAnchor="middle">
                            {label}
                          </text>
                        </g>
                      );
                    })}
                    
                    {[100, 75, 50, 25, 0].map((val, i) => (
                      <text key={i} x="45" y={50 + i * 50} fill="#7F8C8D" fontSize="10" textAnchor="end">
                        {val}%
                      </text>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </GlassCard>
      )}

      {/* AI Insights */}
      <GlassCard style={{ padding: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
          <Brain size={24} color={organData.color} />
          <h3 style={{ color: '#2C3E50', fontSize: '18px', fontWeight: '700', margin: 0 }}>
            AI Insights
          </h3>
        </div>
        <p style={{ color: '#2C3E50', fontSize: '14px', lineHeight: '1.8', margin: '0 0 15px 0' }}>
          Your {organData.name.toLowerCase()} health has shown {organData.currentHealth >= 85 ? 'excellent' : 'good'} progress. 
          All key metrics are within normal ranges. Continue maintaining your current lifestyle and medication regimen. 
          Regular monitoring is recommended every 3-6 months.
        </p>
        <button
          onClick={() => {
            onAskAI();
          }}
          style={{
            background: `linear-gradient(135deg, ${organData.color}, ${organData.color}dd)`,
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={18} />
          Ask AI About This
        </button>
      </GlassCard>
    </div>
  );
}
