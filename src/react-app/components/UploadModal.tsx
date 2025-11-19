import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useThemeColors } from '@/react-app/hooks/useThemeColors';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (analysis: string, filename: string) => void;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const colors = useThemeColors();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          onUploadComplete(data.analysis, data.filename);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }} 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{ 
          width: '100%', 
          maxWidth: '600px',
          position: 'relative'
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
      <GlassCard 
        style={{ 
          padding: '40px',
          background: colors.isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: colors.textPrimary, fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Upload Medical Reports
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: colors.textSecondary,
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? colors.accent : colors.divider}`,
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            background: dragActive ? colors.accentLight : 'transparent',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div>
              <Loader2 size={48} color={colors.accent} className="animate-spin" style={{ margin: '0 auto 20px' }} />
              <div style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Analyzing your reports...
              </div>
              <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
                This may take a few moments
              </div>
            </div>
          ) : (
            <div>
              <Upload size={48} color={colors.accent} style={{ margin: '0 auto 20px' }} />
              <div style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Drag and drop your files here
              </div>
              <div style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '20px' }}>
                or click to browse
              </div>
              <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                Supported formats: PDF, JPG, PNG, TXT
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.txt"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: colors.accentLight,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <FileText size={20} color={colors.accent} />
            <div style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '600' }}>
              HIPAA Compliant & Secure
            </div>
          </div>
          <div style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: '1.6' }}>
            Your medical data is encrypted end-to-end and stored securely. We never share your information with third parties.
          </div>
        </div>
      </GlassCard>
      </motion.div>
    </motion.div>
  );
}
