import { useRef, useState, CSSProperties, ReactNode, MouseEvent } from 'react';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  spotlight?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void;
}

export default function GlassCard({ 
  children, 
  className = '', 
  spotlight = true, 
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const colors = useThemeColors();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{
        position: 'relative',
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: `1px solid ${colors.cardBorder}`,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {spotlight && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(78, 205, 196, 0.15), transparent 40%)`,
            pointerEvents: 'none',
            opacity: 1
          }}
        />
      )}
      {children}
    </div>
  );
}
