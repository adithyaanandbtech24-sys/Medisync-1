import { useState, useEffect } from 'react';
import { Heart, Wind, Activity, Droplet, Upload, Plus, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import OrganCard from '@/react-app/components/OrganCard';
import ChatPanel from '@/react-app/components/ChatPanel';
import UploadModal from '@/react-app/components/UploadModal';
import { OrganData } from '@/shared/types';

interface DashboardProps {
  onOrganSelect: (organKey: string) => void;
}

export default function Dashboard({ onOrganSelect }: DashboardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
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
    // Load uploaded reports
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
    setChatOpen(true);
    // Refresh reports list
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
      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Sidebar */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <GlassCard style={{ padding: '30px' }}>
            {/* Profile */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ECDC4, #556270)',
                margin: '0 auto 20px',
                overflow: 'hidden',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#4ECDC4"/>
                  <circle cx="50" cy="35" r="15" fill="white"/>
                  <path d="M 25 70 Q 25 50, 50 50 Q 75 50, 75 70 Q 75 85, 50 85 Q 25 85, 25 70" fill="white"/>
                </svg>
              </div>
              <h2 style={{ color: '#2C3E50', margin: '0 0 5px 0', fontSize: '24px', fontWeight: '600' }}>
                Patient Dashboard
              </h2>
              <p style={{ color: '#7F8C8D', margin: 0, fontSize: '14px' }}>Welcome back</p>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setUploadModalOpen(true)}
              style={{
                width: '100%',
                background: 'transparent',
                border: '2px dashed rgba(78, 205, 196, 0.4)',
                padding: '14px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.3s',
                color: '#4ECDC4',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '30px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(78, 205, 196, 0.08)';
                e.currentTarget.style.borderColor = '#4ECDC4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(78, 205, 196, 0.4)';
              }}
            >
              <Upload size={20} />
              Upload Reports
            </button>

            {/* Overall Health Score */}
            <div style={{
              background: 'rgba(78, 205, 196, 0.08)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#2C3E50', fontSize: '14px', fontWeight: '700', marginBottom: '15px' }}>
                Overall Health Score
              </h3>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#4ECDC4', marginBottom: '10px' }}>
                {overallHealth}%
              </div>
              <div style={{ color: '#7F8C8D', fontSize: '12px' }}>
                Based on {Object.keys(organData).length} organ metrics
              </div>
            </div>

            {/* CTA Card */}
            <div style={{
              background: 'linear-gradient(135deg, #FFB84D, #F38181)',
              borderRadius: '15px',
              padding: '20px',
              color: 'white'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>
                Track Your Health
              </div>
              <div style={{ fontSize: '12px', marginBottom: '15px', opacity: 0.9 }}>
                Upload medical reports to see detailed analytics
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  color: '#F38181',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Upload Now
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#2C3E50', fontSize: '36px', fontWeight: '700', margin: '0 0 10px 0' }}>
              Health Dashboard
            </h1>
            <p style={{ color: '#7F8C8D', fontSize: '16px', margin: 0 }}>
              Monitor your organ health trends and metrics
            </p>
          </div>

          {/* Organ Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
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
          </div>

          {/* Recent Activity */}
          <GlassCard style={{ padding: '30px' }}>
            <h2 style={{ color: '#2C3E50', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              Recent Activity
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {uploadedFiles.slice(-3).reverse().map(file => (
                <div key={file.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: 'rgba(78, 205, 196, 0.08)',
                  borderRadius: '12px'
                }}>
                  <FileText size={24} color="#4ECDC4" />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#2C3E50', fontSize: '14px', fontWeight: '600' }}>
                      {file.name}
                    </div>
                    <div style={{ color: '#7F8C8D', fontSize: '12px' }}>
                      {file.uploadDate} • {file.size}
                    </div>
                  </div>
                  <CheckCircle size={20} color="#4ECDC4" />
                </div>
              ))}
              {uploadedFiles.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#7F8C8D' }}>
                  <Upload size={48} color="#BDC3C7" style={{ marginBottom: '15px', display: 'block', margin: '0 auto 15px' }} />
                  <div style={{ fontSize: '14px', marginBottom: '15px' }}>No reports uploaded yet</div>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Upload Your First Report
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
          border: 'none',
          boxShadow: '0 8px 30px rgba(78, 205, 196, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          zIndex: 1000
        }}
      >
        <MessageSquare size={26} color="white" />
      </button>

      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <UploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
