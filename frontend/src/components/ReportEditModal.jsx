import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';

export const ReportEditModal = ({ report, onClose, onSaveSuccess, categories }) => {
  if (!report) return null;

  const { addToast } = useToast();

  const [itemName, setItemName] = useState(report.item_name || '');
  const [category, setCategory] = useState(report.category || categories?.[0] || 'Others');
  const [description, setDescription] = useState(report.description || '');
  const [brand, setBrand] = useState(report.brand || '');
  const [color, setColor] = useState(report.color || '');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState(report.distinctive_features || '');
  const [location, setLocation] = useState(report.location || '');
  const [incidentDate, setIncidentDate] = useState(report.incident_date || '');
  const [status, setStatus] = useState(report.status || 'ACTIVE');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await reportService.updateReport(report.id, {
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        brand: brand.trim() || null,
        color: color.trim() || null,
        distinctive_features: distinctiveFeatures.trim() || null,
        location: location.trim(),
        incident_date: incidentDate,
        status
      });

      addToast("Report updated successfully!", "success");
      onSaveSuccess(updated);
      onClose();
    } catch (err) {
      addToast(err.response?.data?.detail || "Failed to update report", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
          Edit Report #{report.id} ({report.report_type})
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              className="form-input"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories?.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Report Status *</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="MATCHED">MATCHED</option>
                <option value="CLAIMED">CLAIMED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                className="form-input"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text"
                className="form-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incident Date *</label>
            <input
              type="date"
              className="form-input"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Distinctive Features</label>
            <input
              type="text"
              className="form-input"
              value={distinctiveFeatures}
              onChange={(e) => setDistinctiveFeatures(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportEditModal;
