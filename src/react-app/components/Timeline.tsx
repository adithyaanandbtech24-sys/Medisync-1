import { motion } from 'framer-motion';
import { Calendar, FileText, Pill, Activity, CheckCircle } from 'lucide-react';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: 'upload' | 'medication' | 'appointment' | 'test';
  title: string;
  description?: string;
  date: Date;
  metadata?: Record<string, any>;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const colors = useThemeColors();

  const getIcon = (type: string) => {
    switch (type) {
      case 'upload': return FileText;
      case 'medication': return Pill;
      case 'appointment': return Calendar;
      case 'test': return Activity;
      default: return CheckCircle;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'upload': return colors.accent;
      case 'medication': return '#A78BFA';
      case 'appointment': return '#FFB84D';
      case 'test': return '#FF6B9D';
      default: return colors.textSecondary;
    }
  };

  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div style={{
      background: colors.cardBg,
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: `1px solid ${colors.cardBorder}`,
      padding: '30px'
    }}>
      <h2 style={{ 
        color: colors.textPrimary, 
        fontSize: '20px', 
        fontWeight: '700', 
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Calendar size={24} color={colors.accent} />
        Health Timeline
      </h2>

      <div style={{ position: 'relative' }}>
        {/* Timeline Line */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          background: colors.divider
        }} />

        {/* Events */}
        {sortedEvents.map((event, idx) => {
          const Icon = getIcon(event.type);
          const eventColor = getColor(event.type);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                position: 'relative',
                paddingLeft: '60px',
                paddingBottom: idx < sortedEvents.length - 1 ? '30px' : '0'
              }}
            >
              {/* Icon */}
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: `${eventColor}20`,
                border: `2px solid ${eventColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                <Icon size={20} color={eventColor} />
              </div>

              {/* Content */}
              <div style={{
                background: `${eventColor}08`,
                padding: '15px 18px',
                borderRadius: '12px',
                border: `1px solid ${eventColor}30`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ 
                    color: colors.textPrimary, 
                    fontSize: '15px', 
                    fontWeight: '600' 
                  }}>
                    {event.title}
                  </div>
                  <div style={{ 
                    color: colors.textSecondary, 
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px'
                  }}>
                    {format(event.date, 'MMM d, yyyy')}
                  </div>
                </div>
                {event.description && (
                  <div style={{ 
                    color: colors.textSecondary, 
                    fontSize: '13px',
                    lineHeight: '1.6'
                  }}>
                    {event.description}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
