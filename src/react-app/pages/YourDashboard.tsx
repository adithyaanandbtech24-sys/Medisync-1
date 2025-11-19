import { useState, useEffect } from 'react';
import { Heart, Wind, Activity, Droplet, Upload, FileText, CheckCircle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/react-app/components/GlassCard';
import OrganCard from '@/react-app/components/OrganCard';
import UploadModal from '@/react-app/components/UploadModal';
import Timeline from '@/react-app/components/Timeline';
import MedicationTracker from '@/react-app/components/MedicationTracker';
import ThemeToggle from '@/react-app/components/ThemeToggle';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';
import { OrganData } from '@/shared/types';

interface YourDashboardProps {
  onOrganSelect: (organKey: string) => void;
}

export default function YourDashboard({ onOrganSelect }: YourDashboardProps) {
  const colors = useThemeColors();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [medications] = useState([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      times: ['08:00', '20:00'],
      instructions: 'Take with food'
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      times: ['08:00'],
      instructions: 'Take in the morning'
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      times: ['20:00'],
      instructions: 'Take before bedtime'
    }
  ]);

  const [timelineEvents] = useState([
    {
      id: '1',
      type: 'upload' as const,
      title: 'Blood Test Results Uploaded',
      description: 'Complete metabolic panel and lipid profile',
      date: new Date(2025, 10, 15)
    },
    {
      id: '2',
      type: 'medication' as const,
      title: 'Started Atorvastatin',
      description: '20mg once daily for cholesterol management',
      date: new Date(2025, 10, 10)
    },
    {
      id: '3',
      type: 'appointment' as const,
      title: 'Cardiology Checkup',
      description: 'Regular follow-up with Dr. Smith',
      date: new Date(2025, 10, 5)
    },
    {
      id: '4',
      type: 'test' as const,
      title: 'ECG Test Completed',
      description: 'Results show normal heart rhythm',
      date: new Date(2025, 9, 28)
    }
  ]);

  const [organData] = useState<Record<string, OrganData>>({
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
      monthlyData: []
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
      monthlyData: []
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
      monthlyData: []
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
      monthlyData: []
    }
  });

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        if (data.reports) {
          setUploadedFiles(data.reports.map((r: any) => ({
            id: r.id,
            name: r.filename,
            size: (r.file_size / 1024).toFixed(2) + ' KB',
            uploadDate: new Date(r.upload_date).toLocaleDateString()
          })));
        }
      })
      .catch(err => console.error('Error loading reports:', err));
  }, []);

  const handleUploadComplete = () => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        if (data.reports) {
          setUploadedFiles(data.reports.map((r: any) => ({
            id: r.id,
            name: r.filename,
            size: (r.file_size / 1024).toFixed(2) + ' KB',
            uploadDate: new Date(r.upload_date).toLocaleDateString()
          })));
        }
      });
  };

  const overallHealth = Math.round(
    Object.values(organData).reduce((sum, organ) => sum + organ.currentHealth, 0) / 
    Object.values(organData).length
  );

  return (
    <>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              color: colors.textPrimary, 
              fontSize: '42px', 
              fontWeight: '800', 
              margin: '0 0 8px 0',
              background: `linear-gradient(135deg, ${colors.textPrimary}, ${colors.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Your Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ color: colors.textSecondary, fontSize: '16px', margin: 0 }}
          >
            Welcome back! Here's your health overview
          </motion.p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Settings size={24} color={colors.textSecondary} />
          </motion.button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Left Column - Quick Stats & Actions */}
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Overall Health Score */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard style={{ padding: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `conic-gradient(${colors.accent} ${overallHealth * 3.6}deg, ${colors.divider} 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: colors.cardBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: colors.accent }}>
                      {overallHealth}%
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                      Health Score
                    </div>
                  </div>
                </div>
                <div style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
                  Overall Health Status
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '13px' }}>
                  Based on {Object.keys(organData).length} organ metrics
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Upload CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard style={{
              padding: '25px',
              background: 'linear-gradient(135deg, #FFB84D, #F38181)',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setUploadModalOpen(true)}>
              <div style={{ color: 'white' }}>
                <Upload size={32} style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                  Upload Medical Reports
                </div>
                <div style={{ fontSize: '13px', opacity: 0.95, marginBottom: '15px' }}>
                  Get AI-powered insights from your health data
                </div>
                <div style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <FileText size={16} />
                  Choose Files
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Organ Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '20px'
            }}
          >
            <OrganCard
              name="Heart"
              icon={Heart}
              color={organData.heart.color}
              currentHealth={organData.heart.currentHealth}
              topMetric={organData.heart.metrics[0]}
              onClick={() => onOrganSelect('heart')}
            />
            <OrganCard
              name="Lungs"
              icon={Wind}
              color={organData.lungs.color}
              currentHealth={organData.lungs.currentHealth}
              topMetric={organData.lungs.metrics[0]}
              onClick={() => onOrganSelect('lungs')}
            />
            <OrganCard
              name="Liver"
              icon={Activity}
              color={organData.liver.color}
              currentHealth={organData.liver.currentHealth}
              topMetric={organData.liver.metrics[0]}
              onClick={() => onOrganSelect('liver')}
            />
            <OrganCard
              name="Kidneys"
              icon={Droplet}
              color={organData.kidneys.color}
              currentHealth={organData.kidneys.currentHealth}
              topMetric={organData.kidneys.metrics[0]}
              onClick={() => onOrganSelect('kidneys')}
            />
          </motion.div>

          {/* Medications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MedicationTracker medications={medications} />
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Timeline events={timelineEvents} />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard style={{ padding: '30px' }}>
              <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                Recent Uploads
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {uploadedFiles.slice(-5).reverse().map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      padding: '15px',
                      background: colors.accentLight,
                      borderRadius: '12px',
                      border: `1px solid ${colors.accent}40`
                    }}
                  >
                    <FileText size={24} color={colors.accent} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '600' }}>
                        {file.name}
                      </div>
                      <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                        {file.uploadDate} • {file.size}
                      </div>
                    </div>
                    <CheckCircle size={20} color={colors.accent} />
                  </motion.div>
                ))}
                {uploadedFiles.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
                    <Upload size={48} color={colors.textMuted} style={{ marginBottom: '15px' }} />
                    <div style={{ fontSize: '14px', marginBottom: '15px' }}>No reports uploaded yet</div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUploadModalOpen(true)}
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}, #44A08D)`,
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Upload Your First Report
                    </motion.button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      <UploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
