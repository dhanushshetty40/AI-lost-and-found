import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Sparkles, BarChart2, Cpu, Zap, Award, 
  CheckCircle2, ArrowRight, RefreshCw, Layers, Database, ShieldCheck, Play
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import experimentService from '../services/experimentService';
import LoadingSpinner from '../components/LoadingSpinner';

export const ModelExperimentPage = () => {
  const { addToast } = useToast();
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Simulator States
  const [queryText, setQueryText] = useState('Lost black Apple MacBook Pro 14-inch in leather sleeve');
  const [candidateText, setCandidateText] = useState('Found Space Gray 14-inch Apple laptop in dark protective sleeve');
  const [category, setCategory] = useState('Electronics & Gadgets');
  const [simResults, setSimResults] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchBenchmarks = async () => {
    setLoading(true);
    try {
      const data = await experimentService.getBenchmarks();
      setBenchmarks(data);
    } catch (err) {
      console.error("Failed to load benchmarks:", err);
      addToast("Failed to fetch model evaluation metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    if (!queryText || !candidateText) {
      addToast("Please provide both query text and candidate item text", "warning");
      return;
    }
    setSimulating(true);
    try {
      const data = await experimentService.runLiveComparison(queryText, candidateText, category);
      setSimResults(data);
      addToast("Live model inference completed!", "success");
    } catch (err) {
      console.error("Simulation error:", err);
      addToast("Failed to run live model comparison", "error");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      
      {/* Hero Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#EEF2FF', color: '#4F46E5', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <FlaskConical size={14} /> AI/ML Experimentation & Empirical Model Benchmarks
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Model Experimentation & Evaluation Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
          Empirical comparison of TF-IDF, Word2Vec, Sentence-Transformers, ResNet-50, and CLIP multimodal fusion on the CLF-Bench-500 dataset.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading AI/ML Empirical Evaluation Dataset..." />
      ) : benchmarks ? (
        <>
          {/* Dataset Provenance Card */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #4F46E5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Database size={18} color="#818CF8" /> Benchmark Dataset: {benchmarks.dataset_summary.dataset_name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Source: {benchmarks.dataset_summary.source} • License: {benchmarks.dataset_summary.license}
                </span>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                {benchmarks.dataset_summary.evaluation_split}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Records</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>{benchmarks.dataset_summary.total_records}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lost Reports</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F87171' }}>{benchmarks.dataset_summary.lost_records}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found Reports</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34D399' }}>{benchmarks.dataset_summary.found_records}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ground-Truth Matches</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818CF8' }}>{benchmarks.dataset_summary.labeled_matching_pairs} pairs</div>
              </div>
            </div>
          </div>

          {/* Text Matching Models Benchmark Table */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#60A5FA" /> Text Embedding & Similarity Benchmarks
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Evaluates lexical n-gram statistics against subword and dense transformer semantic vectors.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>ALGORITHM / MODEL</th>
                    <th style={{ padding: '0.75rem' }}>PRECISION</th>
                    <th style={{ padding: '0.75rem' }}>RECALL</th>
                    <th style={{ padding: '0.75rem' }}>F1-SCORE</th>
                    <th style={{ padding: '0.75rem' }}>TOP-1 ACC</th>
                    <th style={{ padding: '0.75rem' }}>TOP-3 ACC</th>
                    <th style={{ padding: '0.75rem' }}>MRR</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>LATENCY (MS)</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.text_models.map((m) => (
                    <tr key={m.model_name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{m.model_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.architecture}</div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#34D399', fontWeight: 700 }}>{m.precision}%</td>
                      <td style={{ padding: '0.75rem', color: '#60A5FA', fontWeight: 700 }}>{m.recall}%</td>
                      <td style={{ padding: '0.75rem', color: '#C084FC', fontWeight: 700 }}>{m.f1_score}%</td>
                      <td style={{ padding: '0.75rem', color: '#FFFFFF' }}>{m.top1_accuracy}%</td>
                      <td style={{ padding: '0.75rem', color: '#FFFFFF' }}>{m.top3_accuracy}%</td>
                      <td style={{ padding: '0.75rem', color: '#FBBF24', fontWeight: 700 }}>{m.mrr}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{m.avg_latency_ms} ms</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Image & Multimodal Feature Models Table */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="#C084FC" /> Image & Multimodal Feature Benchmarks
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Evaluates color histograms, ResNet-50 CNN representations, and joint Vision-Language CLIP embeddings.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>APPROACH / MODEL</th>
                    <th style={{ padding: '0.75rem' }}>MODALITY</th>
                    <th style={{ padding: '0.75rem' }}>PRECISION</th>
                    <th style={{ padding: '0.75rem' }}>RECALL</th>
                    <th style={{ padding: '0.75rem' }}>F1-SCORE</th>
                    <th style={{ padding: '0.75rem' }}>TOP-1 ACC</th>
                    <th style={{ padding: '0.75rem' }}>TOP-3 ACC</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>LATENCY (MS)</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.image_models.map((m) => (
                    <tr key={m.model_name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{m.model_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.architecture}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-primary">{m.modality}</span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#34D399', fontWeight: 700 }}>{m.precision}%</td>
                      <td style={{ padding: '0.75rem', color: '#60A5FA', fontWeight: 700 }}>{m.recall}%</td>
                      <td style={{ padding: '0.75rem', color: '#C084FC', fontWeight: 700 }}>{m.f1_score}%</td>
                      <td style={{ padding: '0.75rem', color: '#FFFFFF' }}>{m.top1_accuracy}%</td>
                      <td style={{ padding: '0.75rem', color: '#FFFFFF' }}>{m.top3_accuracy}%</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{m.avg_latency_ms} ms</span>
                      </td>
                    </tr>
                  ))}
                  {/* Multimodal Ensemble Row */}
                  <tr style={{ background: 'rgba(79, 70, 229, 0.1)', borderTop: '2px solid #4F46E5' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 800, color: '#818CF8' }}>★ {benchmarks.multimodal_fusion.model_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{benchmarks.multimodal_fusion.architecture}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-success">MULTIMODAL ENSEMBLE</span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#34D399', fontWeight: 800 }}>{benchmarks.multimodal_fusion.precision}%</td>
                    <td style={{ padding: '0.75rem', color: '#60A5FA', fontWeight: 800 }}>{benchmarks.multimodal_fusion.recall}%</td>
                    <td style={{ padding: '0.75rem', color: '#C084FC', fontWeight: 800 }}>{benchmarks.multimodal_fusion.f1_score}%</td>
                    <td style={{ padding: '0.75rem', color: '#FFFFFF', fontWeight: 800 }}>{benchmarks.multimodal_fusion.top1_accuracy}%</td>
                    <td style={{ padding: '0.75rem', color: '#FFFFFF', fontWeight: 800 }}>{benchmarks.multimodal_fusion.top3_accuracy}%</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{benchmarks.multimodal_fusion.avg_latency_ms} ms</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Live Model Inference Simulator */}
          <div className="card" style={{ padding: '1.75rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={20} color="#FBBF24" /> Interactive Live Model Comparison Simulator
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
                  Test any pair of descriptions in real time to observe algorithmic scoring discrepancies and latencies.
                </p>
              </div>
              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Play size={16} /> {simulating ? 'Evaluating Models...' : 'Execute Live Comparison'}
              </button>
            </div>

            <form onSubmit={handleRunSimulation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Query Text (Lost Item Description)
                </label>
                <textarea
                  rows={3}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Candidate Text (Found Item Description)
                </label>
                <textarea
                  rows={3}
                  value={candidateText}
                  onChange={(e) => setCandidateText(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </form>

            {/* Live Results Display */}
            {simResults && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Live Model Evaluation Output
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#818CF8', fontWeight: 600 }}>
                    Best Match: {simResults.best_matching_model}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {simResults.results.map((res) => (
                    <div key={res.model_name} style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                        {res.model_name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: res.similarity_score >= 70 ? '#34D399' : (res.similarity_score >= 40 ? '#FBBF24' : '#F87171') }}>
                          {res.similarity_score}%
                        </span>
                        <span className={`badge ${res.decision === 'MATCH' ? 'badge-success' : (res.decision === 'POTENTIAL' ? 'badge-warning' : 'badge-danger')}`}>
                          {res.decision}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Inference Latency: <strong>{res.latency_ms} ms</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', background: 'rgba(79, 70, 229, 0.08)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #6366F1' }}>
                  <strong>XAI Rationale:</strong> {simResults.explainable_breakdown}
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ModelExperimentPage;
