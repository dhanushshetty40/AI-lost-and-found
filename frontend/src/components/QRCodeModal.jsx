import React, { useState, useEffect } from 'react';
import { QrCode, Printer, Copy, Check, Download, ExternalLink, X, Shield, Tag } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import lifecycleService from '../services/lifecycleService';
import LoadingSpinner from './LoadingSpinner';

export const QRCodeModal = ({ reportId, isOpen, onClose }) => {
  const { addToast } = useToast();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !reportId) return;

    const fetchQR = async () => {
      setLoading(true);
      try {
        const data = await lifecycleService.getReportQRCode(reportId);
        setQrData(data);
      } catch (err) {
        console.error("Failed to load QR code:", err);
        addToast("Failed to generate item QR code", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!qrData?.verification_url) return;
    navigator.clipboard.writeText(qrData.verification_url);
    setCopied(true);
    addToast("Verification link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintTag = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '100%',
        padding: '1.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        color: '#1E293B'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#EEF2FF', color: '#4F46E5', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <QrCode size={13} /> SMARTFIND ITEM IDENTIFICATION TAG
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Item QR Code & Recovery Tag
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <LoadingSpinner message="Generating QR Code Security Matrix..." />
          </div>
        ) : qrData ? (
          <div>
            {/* Printable Recovery Tag Preview Container */}
            <div className="printable-tag" style={{
              background: '#F8FAFC',
              border: '2px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              {/* Tag Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5' }}>SMARTFIND CAMPUS RECOVERY</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>
                  {qrData.item_tag_code}
                </span>
              </div>

              {/* QR Image */}
              <div style={{ display: 'inline-block', background: '#FFFFFF', padding: '0.75rem', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', marginBottom: '0.75rem' }}>
                <img 
                  src={qrData.qr_data_url} 
                  alt="Item QR Code" 
                  style={{ width: '160px', height: '160px', display: 'block' }}
                />
              </div>

              {/* Item Info */}
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                {qrData.item_name}
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.25rem' }}>
                <strong>Category:</strong> {qrData.category} • <strong>Zone:</strong> {qrData.location}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Scan with any smartphone camera to view lifecycle or file return
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handlePrintTag}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1rem',
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} /> Print Item Tag
              </button>

              <button
                onClick={handleCopyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1rem',
                  background: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#EF4444', padding: '2rem 0' }}>
            Unable to load QR code for this report.
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;
