import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, X, MapPin, Calendar, Tag, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';

export const ReportLostPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('');
  
  // Image state & live preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await reportService.getCategories();
        setCategories(cats);
        if (cats.length > 0) setCategory(cats[0]);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast("Image size must be under 10MB", "error");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!itemName.trim() || !category || !description.trim() || !location.trim() || !incidentDate) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadRes = await reportService.uploadImage(imageFile);
        imageUrl = uploadRes.image_url;
      }

      await reportService.createReport({
        report_type: 'LOST',
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        brand: brand.trim() || null,
        color: color.trim() || null,
        distinctive_features: distinctiveFeatures.trim() || null,
        additional_info: additionalInfo.trim() || null,
        location: location.trim(),
        incident_date: incidentDate,
        incident_time: incidentTime || null,
        image_url: imageUrl
      });

      addToast("Lost item report logged successfully!", "success");
      navigate('/my-reports');
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to submit report";
      setErrorMsg(detail);
      addToast(detail, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '2.5rem auto', padding: '0 1.5rem 4rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
          <div style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--accent-rose)'
          }}>
            <PlusCircle size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Report Lost Item</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Provide accurate details to enable AI multimodal similarity matching across campus reports
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Item Category & Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Item Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sony Wireless Headphones"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Brand & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Brand / Manufacturer</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sony, Apple, Nike"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Color(s)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Matte Black / Silver"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          {/* Location & Incident Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Incident Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Library 2nd Floor Study Desk"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date Lost *</label>
              <input
                type="date"
                className="form-input"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Approx Time</label>
              <input
                type="time"
                className="form-input"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Describe item appearance, contents, condition, and circumstances of loss..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Distinctive Features */}
          <div className="form-group">
            <label className="form-label">Distinctive Markings or Features</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Scratch on hinge, Antigravity sticker, red zipper pull"
              value={distinctiveFeatures}
              onChange={(e) => setDistinctiveFeatures(e.target.value)}
            />
          </div>

          {/* Image Upload with Preview */}
          <div className="form-group">
            <label className="form-label">Item Photograph (Image Upload)</label>
            {imagePreview ? (
              <div style={{ position: 'relative', width: 'fit-content', marginTop: 8 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'var(--accent-rose)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '1.5rem',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}>
                <Upload size={24} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Click to upload item image (JPEG, PNG, WebP max 10MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Additional Information */}
          <div className="form-group">
            <label className="form-label">Additional Private Context (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Reward offered, contact preferences..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Submitting Lost Report...' : 'File Lost Item Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportLostPage;
