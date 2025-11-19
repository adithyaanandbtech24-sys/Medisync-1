import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, CheckCircle, Plus } from 'lucide-react';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions?: string;
  nextDose?: Date;
}

interface MedicationTrackerProps {
  medications: Medication[];
  onAddMedication?: () => void;
}

export default function MedicationTracker({ medications, onAddMedication }: MedicationTrackerProps) {
  const colors = useThemeColors();
  const [takenToday, setTakenToday] = useState<Set<string>>(new Set());

  const markAsTaken = (medId: string) => {
    setTakenToday(prev => new Set([...prev, medId]));
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours();
  };

  const getTimeOfDay = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const isUpcoming = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    const current = getCurrentTime();
    return hour > current && hour <= current + 2;
  };

  return (
    <div style={{
      background: colors.cardBg,
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: `1px solid ${colors.cardBorder}`,
      padding: '30px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{ 
          color: colors.textPrimary, 
          fontSize: '20px', 
          fontWeight: '700',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Pill size={24} color="#A78BFA" />
          Today's Medications
        </h2>
        {onAddMedication && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddMedication}
            style={{
              background: colors.accentLight,
              border: `1px solid ${colors.accent}`,
              color: colors.accent,
              padding: '8px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            Add
          </motion.button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {medications.map((med, idx) => {
          const isTaken = takenToday.has(med.id);
          
          return (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: isTaken ? `${colors.success}10` : colors.inputBg,
                padding: '18px 20px',
                borderRadius: '14px',
                border: `1px solid ${isTaken ? colors.success : colors.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: isTaken 
                  ? `linear-gradient(135deg, ${colors.success}, ${colors.success}dd)` 
                  : 'linear-gradient(135deg, #A78BFA, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isTaken ? (
                  <CheckCircle size={24} color="white" />
                ) : (
                  <Pill size={24} color="white" />
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: colors.textPrimary, 
                  fontSize: '16px', 
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {med.name}
                </div>
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '13px',
                  marginBottom: '6px'
                }}>
                  {med.dosage} • {med.frequency}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {med.times.map((time, tidx) => {
                    const upcoming = isUpcoming(time);
                    return (
                      <div
                        key={tidx}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: upcoming ? `${colors.warning}20` : `${colors.textSecondary}15`,
                          color: upcoming ? colors.warning : colors.textSecondary,
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Clock size={12} />
                        {time} {getTimeOfDay(time)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              {!isTaken && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => markAsTaken(med.id)}
                  style={{
                    background: colors.accent,
                    border: 'none',
                    color: 'white',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Mark Taken
                </motion.button>
              )}
            </motion.div>
          );
        })}

        {medications.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: colors.textSecondary
          }}>
            <Pill size={48} color={colors.textMuted} style={{ marginBottom: '15px' }} />
            <div style={{ fontSize: '14px' }}>No medications scheduled for today</div>
            {onAddMedication && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddMedication}
                style={{
                  marginTop: '15px',
                  background: colors.accent,
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add Your First Medication
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
