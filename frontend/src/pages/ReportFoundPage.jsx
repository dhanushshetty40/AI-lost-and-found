import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, X, MapPin, Calendar, Tag, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import reportService from '../services/reportService';

export const ReportFoundPage = () => {
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
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');
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
        report_type: 'FOUND',
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        brand: brand.trim() || null,
        color: color.trim() || null,
        distinctive_features: distinctiveFeatures.trim() || null,
        additional_info: additionalInfo.trim() || null,
        verification_question: verificationQuestion.trim() || null,
        confidential_notes: confidentialNotes.trim() || null,
        location: location.trim(),
        incident_date: incidentDate,
        incident_time: incidentTime || null,
        image_url: imageUrl
      });

      addToast("Found item report logged successfully!", "success");
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
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-emerald)'
          }}>
            <Search size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Report Found Item</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Log a discovered item to help the AI matching system notify the rightful owner
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
              <label className="form-label">Found Item Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Found Car Keys (Toyota)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Brand & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Brand / Manufacturer (if visible)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Toyota, Apple, Dell"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Color(s)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Silver / Blue tag"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          {/* Location & Incident Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Where Found (Campus Location) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Auditorium Main Hall - Row F"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date Found *</label>
              <input
                type="date"
                className="form-input"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Found</label>
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
            <label className="form-label">Item Description & Condition *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Describe physical condition, key tags, or where item was turned in..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Distinctive Features */}
          <div className="form-group">
            <label className="form-label">Distinctive Features (Key for Verification)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Unique key ring tag, custom engraving, blue lanyard"
              value={distinctiveFeatures}
              onChange={(e) => setDistinctiveFeatures(e.target.value)}
            />
          </div>

          {/* Verification Challenge Question (Feature 2) */}
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                🔒 Secret Verification Question for Claimant (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. What cartoon keychain is on the zipper? / What wallpaper is on the lockscreen?"
                value={verificationQuestion}
                onChange={(e) => setVerificationQuestion(e.target.value)}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                The claimant will be required to answer this exact question when filing an ownership claim.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                🔐 Hidden Confidential Notes (Only revealed to Approved Claimant)
              </label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="e.g. Kept safely in Admin Locker #14 / Contact finder after approval at desk 4"
                value={confidentialNotes}
                onChange={(e) => setConfidentialNotes(e.target.value)}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                This is strictly hidden from the public catalog and only unlocked once you verify and approve the owner.
              </span>
            </div>
          </div>

          {/* Image Upload with Preview */}
          <div className="form-group">
            <label className="form-label">Photograph of Found Item (Image Upload)</label>
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
                <Upload size={24} color="var(--accent-emerald)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Click to upload photograph (JPEG, PNG, WebP max 10MB)
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
            <label className="form-label">Current Safe Location / Holding Office</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Handed over to Campus Security Desk / Admin Office Room 102"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '1rem', backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
            disabled={loading}
          >
            {loading ? 'Submitting Found Report...' : 'File Found Item Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportFoundPage;
