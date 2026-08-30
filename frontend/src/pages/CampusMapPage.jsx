import React, { useState, useEffect } from 'react';
import { 
  MapPin, Flame, Filter, Search, RefreshCw, Eye, Sparkles, 
  Layers, Shield, Building2, AlertCircle, CheckCircle2, ChevronRight,
  Info, Compass, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import analyticsService from '../services/analyticsService';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  "All Categories",
  "Electronics & Gadgets",
  "Bags & Backpacks",
  "Wallets & Purses",
  "Stationery & Books",
  "Clothing & Accessories",
  "ID Cards & Documents",
  "Keys & Security Cards",
  "Other Valuables"
];

export const CampusMapPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // State variables
  const [mapData, setMapData] = useState(null);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'
  const [reportTypeFilter, setReportTypeFilter] = useState('ALL'); // 'ALL', 'LOST', 'FOUND', 'RESOLVED'
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item / inspector
  const [selectedReport, setSelectedReport] = useState(null);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (reportTypeFilter === 'LOST') params.report_type = 'LOST';
      if (reportTypeFilter === 'FOUND') params.report_type = 'FOUND';
      if (reportTypeFilter === 'RESOLVED') params.status = 'RESOLVED';
      if (categoryFilter !== 'All Categories') params.category = categoryFilter;
      if (selectedBuildingId) params.location_id = selectedBuildingId;

      const [data, heatData] = await Promise.all([
        analyticsService.getCampusMapData(params),
        analyticsService.getHeatmapData()
      ]);

      setMapData(data);
      setHeatmapPoints(heatData);
    } catch (err) {
      console.error("Failed to load campus map data:", err);
      addToast("Unable to load campus spatial dataset", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [reportTypeFilter, categoryFilter, selectedBuildingId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMapData();
  };

  // Filter reports by search query client-side
  const displayedReports = (mapData?.reports || []).filter(rep => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rep.item_name.toLowerCase().includes(q) ||
      rep.description.toLowerCase().includes(q) ||
      rep.location.toLowerCase().includes(q) ||
      rep.category.toLowerCase().includes(q)
    );
  });

  const selectedBuilding = mapData?.locations.find(l => l.id === selectedBuildingId);

  return (
    <div className="campus-map-page" style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#EEF2FF', color: '#4F46E5', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Compass size={14} /> Campus Intelligence & Spatial AI (Phase 6)
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            Interactive Campus Lost & Found Map
          </h1>
          <p style={{ color: '#64748B', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Live geospatial coordinates and hotspot density clustering across campus landmarks
          </p>
        </div>

        {/* Quick KPI pills & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: '#F8FAFC', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
            <span style={{ color: '#EF4444', fontWeight: 600 }}>● {mapData?.lost_markers_count || 0} Lost</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span style={{ color: '#10B981', fontWeight: 600 }}>● {mapData?.found_markers_count || 0} Found</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span style={{ color: '#8B5CF6', fontWeight: 600 }}>● {mapData?.resolved_markers_count || 0} Recovered</span>
          </div>

          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <RefreshCw size={15} className={refreshing ? "spin-animation" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: '12px', 
        border: '1px solid #E2E8F0', 
        padding: '1rem 1.25rem', 
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left Side: View Mode & Type toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Layer Mode: Markers vs Heatmap */}
          <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => setViewMode('markers')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'markers' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'markers' ? '#4F46E5' : '#64748B',
                fontWeight: viewMode === 'markers' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'markers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <MapPin size={15} /> Item Pins ({displayedReports.length})
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'heatmap' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'heatmap' ? '#EA580C' : '#64748B',
                fontWeight: viewMode === 'heatmap' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'heatmap' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Flame size={15} /> Hotspot Heatmap
            </button>
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '8px', padding: '3px' }}>
            {['ALL', 'LOST', 'FOUND', 'RESOLVED'].map((type) => (
              <button
                key={type}
                onClick={() => setReportTypeFilter(type)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: reportTypeFilter === type ? '#FFFFFF' : 'transparent',
                  color: reportTypeFilter === type ? '#1E293B' : '#64748B',
                  fontWeight: reportTypeFilter === type ? 600 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  boxShadow: reportTypeFilter === type ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {type === 'ALL' ? 'All Types' : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Right Side: Search Box */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search items or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.85rem 0.5rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Building Quick-Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setSelectedBuildingId(null)}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid',
            borderColor: selectedBuildingId === null ? '#4F46E5' : '#E2E8F0',
            background: selectedBuildingId === null ? '#EEF2FF' : '#FFFFFF',
            color: selectedBuildingId === null ? '#4F46E5' : '#64748B',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          📍 Entire Campus (All Zones)
        </button>
        {(mapData?.locations || []).map(loc => (
          <button
            key={loc.id}
            onClick={() => setSelectedBuildingId(selectedBuildingId === loc.id ? null : loc.id)}
            style={{
              whiteSpace: 'nowrap',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: selectedBuildingId === loc.id ? '#4F46E5' : '#E2E8F0',
              background: selectedBuildingId === loc.id ? '#EEF2FF' : '#FFFFFF',
              color: selectedBuildingId === loc.id ? '#4F46E5' : '#64748B',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            🏢 {loc.name} {loc.total_lost > 0 ? `(${loc.total_lost} lost)` : ''}
          </button>
        ))}
      </div>

      {/* Map + Inspector Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '1fr 340px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Main Vector SVG Campus Map */}
        <div style={{
          background: '#0F172A',
          borderRadius: '16px',
          border: '1px solid #1E293B',
          padding: '1rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          minHeight: '620px'
        }}>
          {loading ? (
            <div style={{ height: '580px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner message="Rendering Campus Spatial Intelligence Engine..." />
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', paddingBottom: '62%', height: 0 }}>
              <svg 
                viewBox="0 0 1000 620" 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  userSelect: 'none',
                  borderRadius: '12px'
                }}
              >
                {/* SVG Definitions for Gradients & Filters */}
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.75" />
                  </pattern>

                  {/* Heatmap Gradients */}
                  <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#F97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                  </radialGradient>
                  
                  <radialGradient id="heatModerate" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                    <stop offset="60%" stopColor="#EAB308" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="heatLow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                    <stop offset="70%" stopColor="#34D399" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </radialGradient>

                  {/* Building Glow */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Campus Background & Grid */}
                <rect width="1000" height="620" fill="#0B1120" rx="12" />
                <rect width="1000" height="620" fill="url(#campusGrid)" />

                {/* Campus Pathways / Road Network */}
                {/* Main Outer Perimeter Ring */}
                <path d="M 120 100 L 880 100 Q 920 100 920 140 L 920 500 Q 920 540 880 540 L 120 540 Q 80 540 80 500 L 80 140 Q 80 100 120 100 Z" fill="none" stroke="#1E293B" strokeWidth="24" strokeLinecap="round" />
                
                {/* Inner Cross Avenues */}
                <path d="M 500 100 L 500 540" fill="none" stroke="#1E293B" strokeWidth="18" />
                <path d="M 80 320 L 920 320" fill="none" stroke="#1E293B" strokeWidth="18" />
                
                {/* Diagonal Quad Walkways */}
                <path d="M 280 200 L 420 380" fill="none" stroke="#1E293B" strokeWidth="10" strokeDasharray="6 6" />
                <path d="M 720 180 L 580 300" fill="none" stroke="#1E293B" strokeWidth="10" strokeDasharray="6 6" />
                <path d="M 580 300 L 800 470" fill="none" stroke="#1E293B" strokeWidth="10" strokeDasharray="6 6" />

                {/* Green Campus Quads & Open Lawns */}
                <ellipse cx="500" cy="320" rx="70" ry="45" fill="#064E3B" fillOpacity="0.35" stroke="#047857" strokeWidth="1.5" />
                <text x="500" y="323" fill="#34D399" fontSize="10" textAnchor="middle" fontWeight="600" letterSpacing="1">CENTRAL QUAD</text>

                <rect x="230" y="160" width="100" height="60" rx="8" fill="#064E3B" fillOpacity="0.25" stroke="#065F46" strokeWidth="1" />
                <rect x="670" y="140" width="100" height="60" rx="8" fill="#064E3B" fillOpacity="0.25" stroke="#065F46" strokeWidth="1" />

                {/* Heatmap Layer (Active when viewMode === 'heatmap') */}
                {viewMode === 'heatmap' && heatmapPoints.map((pt) => {
                  const cx = (pt.x / 100) * 1000;
                  const cy = (pt.y / 100) * 620;
                  const radius = Math.max(50, pt.intensity * 120);
                  const gradientId = pt.risk_level === 'HIGH' ? 'url(#heatHigh)' : (pt.risk_level === 'MODERATE' ? 'url(#heatModerate)' : 'url(#heatLow)');

                  return (
                    <g key={`heat-${pt.location_id}`}>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={radius} 
                        fill={gradientId} 
                      />
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={radius * 0.4} 
                        fill={gradientId} 
                      />
                    </g>
                  );
                })}

                {/* Campus Landmark Buildings & Zones */}
                {(mapData?.locations || []).map((loc) => {
                  const cx = (loc.x / 100) * 1000;
                  const cy = (loc.y / 100) * 620;
                  const isHovered = hoveredBuilding === loc.id;
                  const isSelected = selectedBuildingId === loc.id;

                  return (
                    <g 
                      key={loc.id} 
                      onClick={() => setSelectedBuildingId(isSelected ? null : loc.id)}
                      onMouseEnter={() => setHoveredBuilding(loc.id)}
                      onMouseLeave={() => setHoveredBuilding(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Building Plot Foundation */}
                      <rect 
                        x={cx - 55} 
                        y={cy - 35} 
                        width="110" 
                        height="70" 
                        rx="10" 
                        fill={isSelected ? '#312E81' : (isHovered ? '#1E293B' : '#0F172A')}
                        stroke={isSelected ? '#6366F1' : (isHovered ? '#94A3B8' : '#334155')}
                        strokeWidth={isSelected ? "2.5" : "1.5"}
                        filter={isSelected ? "url(#glow)" : "none"}
                      />

                      {/* Building Accent Bar */}
                      <rect 
                        x={cx - 55} 
                        y={cy - 35} 
                        width="110" 
                        height="6" 
                        rx="3" 
                        fill={loc.total_lost > 0 ? '#EF4444' : '#10B981'}
                      />

                      {/* Building Name Label */}
                      <text 
                        x={cx} 
                        y={cy - 12} 
                        fill="#F8FAFC" 
                        fontSize="11" 
                        fontWeight="700" 
                        textAnchor="middle"
                      >
                        {loc.name.split('&')[0].trim()}
                      </text>

                      {/* Zone Subtitle */}
                      <text 
                        x={cx} 
                        y={cy + 5} 
                        fill="#94A3B8" 
                        fontSize="8.5" 
                        textAnchor="middle"
                      >
                        {loc.zone}
                      </text>

                      {/* Incident Counter Badges */}
                      <g transform={`translate(${cx - 38}, ${cy + 14})`}>
                        <rect width="36" height="15" rx="4" fill="#7F1D1D" fillOpacity="0.8" />
                        <text x="18" y="11" fill="#FCA5A5" fontSize="8.5" fontWeight="600" textAnchor="middle">
                          {loc.total_lost} Lost
                        </text>
                      </g>

                      <g transform={`translate(${cx + 2}, ${cy + 14})`}>
                        <rect width="36" height="15" rx="4" fill="#064E3B" fillOpacity="0.8" />
                        <text x="18" y="11" fill="#6EE7B7" fontSize="8.5" fontWeight="600" textAnchor="middle">
                          {loc.total_found} Found
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Individual Report Markers Layer (viewMode === 'markers') */}
                {viewMode === 'markers' && displayedReports.map((rep) => {
                  const px = (rep.x / 100) * 1000;
                  const py = (rep.y / 100) * 620;
                  const isLost = rep.report_type === 'LOST';
                  const isResolved = rep.status === 'RESOLVED' || rep.status === 'CLAIMED';
                  const isSelected = selectedReport?.id === rep.id;

                  const pinColor = isResolved ? '#8B5CF6' : (isLost ? '#EF4444' : '#10B981');

                  return (
                    <g 
                      key={`rep-pin-${rep.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(rep);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse Animation Ring for active items */}
                      <circle 
                        cx={px} 
                        cy={py} 
                        r={isSelected ? "18" : "12"} 
                        fill={pinColor} 
                        fillOpacity="0.25"
                        stroke={pinColor}
                        strokeWidth="1"
                      />

                      {/* Pin Center */}
                      <circle 
                        cx={px} 
                        cy={py} 
                        r={isSelected ? "9" : "6"} 
                        fill={pinColor} 
                        stroke="#FFFFFF" 
                        strokeWidth="2" 
                      />

                      {/* Item Tooltip Mini Label on hover or selected */}
                      {isSelected && (
                        <g transform={`translate(${px}, ${py - 16})`}>
                          <rect 
                            x="-60" 
                            y="-22" 
                            width="120" 
                            height="22" 
                            rx="5" 
                            fill="#1E293B" 
                            stroke="#475569" 
                            strokeWidth="1" 
                          />
                          <text 
                            x="0" 
                            y="-8" 
                            fill="#FFFFFF" 
                            fontSize="9" 
                            fontWeight="600" 
                            textAnchor="middle"
                          >
                            {rep.item_name.length > 18 ? rep.item_name.substring(0, 18) + '...' : rep.item_name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Legend Box in Bottom Left */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.75rem',
                color: '#E2E8F0',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: '#94A3B8' }}>MAP LEGEND:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span> Lost Item
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span> Found Item
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }}></span> Recovered / Returned
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Slide-out Report Inspector / Building Detail Drawer */}
        {selectedReport && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Header with Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: selectedReport.report_type === 'LOST' ? '#FEE2E2' : '#D1FAE5',
                  color: selectedReport.report_type === 'LOST' ? '#DC2626' : '#059669',
                  marginBottom: '0.35rem'
                }}>
                  {selectedReport.report_type} REPORT #{selectedReport.id}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
                  {selectedReport.item_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Thumbnail / Category */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#F8FAFC', padding: '0.6rem', borderRadius: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 700 }}>
                {selectedReport.category.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Category</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{selectedReport.category}</div>
              </div>
            </div>

            {/* Location & Time */}
            <div style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>📍 Location:</strong> {selectedReport.location}</div>
              <div><strong>📅 Date:</strong> {selectedReport.incident_date} {selectedReport.incident_time ? `at ${selectedReport.incident_time}` : ''}</div>
              {selectedReport.brand && <div><strong>🏷️ Brand:</strong> {selectedReport.brand}</div>}
              {selectedReport.color && <div><strong>🎨 Color:</strong> {selectedReport.color}</div>}
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>Description</div>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155', lineHeight: 1.4, background: '#F8FAFC', padding: '0.6rem', borderRadius: '6px' }}>
                {selectedReport.description}
              </p>
            </div>

            {/* Distinctive features */}
            {selectedReport.distinctive_features && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>Distinctive Features</div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>{selectedReport.distinctive_features}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => navigate('/matches')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem',
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={15} /> Check Potential AI Matches
              </button>

              {selectedReport.report_type === 'FOUND' && selectedReport.status === 'ACTIVE' && (
                <button
                  onClick={() => navigate('/claims')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem',
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Shield size={15} /> File Ownership Claim
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Campus Landmark Performance Grid */}
      <div style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="#4F46E5" /> Campus Landmark Zone Analytics
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {(mapData?.locations || []).map(loc => (
            <div 
              key={loc.id} 
              onClick={() => setSelectedBuildingId(selectedBuildingId === loc.id ? null : loc.id)}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: selectedBuildingId === loc.id ? '#4F46E5' : '#E2E8F0',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: selectedBuildingId === loc.id ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>{loc.name}</h4>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 700,
                  background: loc.risk_level === 'HIGH' ? '#FEE2E2' : (loc.risk_level === 'MEDIUM' ? '#FEF3C7' : '#D1FAE5'),
                  color: loc.risk_level === 'HIGH' ? '#DC2626' : (loc.risk_level === 'MEDIUM' ? '#D97706' : '#059669')
                }}>
                  {loc.risk_level} RISK
                </span>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>{loc.zone}</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Lost</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EF4444' }}>{loc.total_lost}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Found</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10B981' }}>{loc.total_found}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Recovery</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4F46E5' }}>{loc.recovery_rate_percent}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusMapPage;
