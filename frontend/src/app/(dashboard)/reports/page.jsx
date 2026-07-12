'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, UploadCloud, Trash2, Loader2, Sparkles, 
  Clock, ArrowRight, Eye, AlertCircle, CheckCircle, 
  Calendar, Info, AlertTriangle, ArrowUpDown, X
} from 'lucide-react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/reports');
      setReports(res.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Could not load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return p + 15;
      });
    }, 400);

    try {
      const res = await api.post('/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setReports((prev) => [res.data, ...prev]);
        setUploading(false);
        setUploadProgress(0);
        // Automatically open the processed report details
        handleOpenDetails(res.data);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error uploading file:', err);
      setError('Error parsing medical report. Please ensure it is a valid PDF or Image.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selectedReport?.id === id) {
        setDrawerOpen(false);
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Could not delete report. Please try again.');
    }
  };

  const handleOpenDetails = (report) => {
    // Parse JSON arrays safely
    let parsedFindings = [];
    let parsedLabs = [];
    try {
      parsedFindings = typeof report.keyFindings === 'string' ? JSON.parse(report.keyFindings) : report.keyFindings || [];
      parsedLabs = typeof report.labResults === 'string' ? JSON.parse(report.labResults) : report.labResults || [];
    } catch (e) {
      console.error('Error parsing report metadata:', e);
    }

    setSelectedReport({
      ...report,
      parsedFindings,
      parsedLabs,
    });
    setDrawerOpen(true);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative overflow-hidden bg-background bg-medical-grid p-1">
      {/* Mesh decorative rings */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10 shrink-0">
        <div className="p-2.5 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">Report Summarizer</h1>
          <p className="text-xs text-muted-foreground">
            Upload clinical reports (PDF, PNG, JPG) to extract and understand key lab metrics
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden relative z-10">
        {/* Left: Dropzone Upload Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1 no-scrollbar">
          {/* Upload Card */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-white p-8 text-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center justify-center min-h-[220px] shrink-0"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg" 
              onChange={handleFileChange}
              className="hidden" 
            />

            {uploading ? (
              <div className="space-y-4 w-full max-w-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary animate-spin mx-auto">
                  <Loader2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Extracting structured report details...</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Please wait, compiling values</p>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-primary to-cyan-500" 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary mx-auto hover:scale-105 transition-transform duration-200">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Drag & drop your medical file here</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Supports PDF, PNG, or JPG up to 10MB</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-50 hover:bg-primary-100/80 text-primary text-xs font-bold transition-all">
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-red-100 bg-red-50 text-red-700 text-xs font-semibold leading-relaxed flex items-start gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Guidelines Info */}
          <div className="rounded-2xl border border-border bg-white p-5 space-y-3 shadow-sm shrink-0">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" />
              How it works
            </h4>
            <div className="space-y-2 text-[11px] font-semibold text-muted-foreground leading-relaxed">
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-primary-50 text-primary font-extrabold flex items-center justify-center shrink-0">1</span>
                <p>Upload a lab report or clinical summary image.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-primary-50 text-primary font-extrabold flex items-center justify-center shrink-0">2</span>
                <p>Gemini AI extracts raw values and structures them.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-4 h-4 rounded-full bg-primary-50 text-primary font-extrabold flex items-center justify-center shrink-0">3</span>
                <p>Lab values are flagged if they run High or Low against reference markers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Uploaded Files List */}
        <div className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3.5 shrink-0 px-1">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Uploaded Files ({reports.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-3 pb-6">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-white animate-pulse flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/60 rounded w-44" />
                      <div className="h-3 bg-muted/40 rounded w-24" />
                    </div>
                  </div>
                  <div className="w-16 h-8 bg-muted/40 rounded-lg" />
                </div>
              ))
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-white shadow-inner p-6">
                <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xs font-bold text-foreground">No reports uploaded yet</h3>
                <p className="text-[11px] text-muted-foreground max-w-[200px] mt-1 leading-normal">
                  Uploaded medical folders will list here for quick clinical summaries.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleOpenDetails(report)}
                    className="p-4 rounded-xl border border-border bg-white hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform duration-250">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate max-w-[240px]">
                          {report.fileName}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.uploadDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDelete(report.id, e)}
                        className="p-2 rounded-lg bg-white hover:bg-red-50 text-muted-foreground hover:text-red-500 border border-transparent hover:border-red-200/50 transition-all cursor-pointer"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary text-[10px] font-extrabold hover:bg-primary hover:text-white border border-transparent group-hover:border-primary/20 transition-all">
                        <Eye className="w-3.5 h-3.5" />
                        Analyze
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── Slide-over report drawer detail panel ──────────────────────── */}
      <AnimatePresence>
        {drawerOpen && selectedReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/15 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-br from-primary-500 to-cyan-600 flex flex-col justify-end p-5 text-white shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-medical-grid opacity-20 pointer-events-none" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white border border-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="relative z-10 space-y-0.5 pr-8">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[8px] font-extrabold tracking-widest uppercase">
                    Lab Analysis
                  </span>
                  <h2 className="text-base font-bold leading-tight truncate mt-1">
                    {selectedReport.fileName}
                  </h2>
                  <p className="text-[10px] text-white/80 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Uploaded on {new Date(selectedReport.uploadDate).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* AI Summary */}
                <div className="rounded-2xl border border-primary-100 bg-primary-50/20 p-4.5 space-y-1.5">
                  <h4 className="text-[9px] font-extrabold text-primary uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Medical Summary
                  </h4>
                  <p className="text-xs text-foreground font-semibold leading-relaxed">
                    {selectedReport.summary}
                  </p>
                </div>

                {/* Key Findings */}
                {selectedReport.parsedFindings?.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
                      Key Highlights & Observations
                    </h4>
                    <ul className="space-y-2">
                      {selectedReport.parsedFindings.map((finding, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-semibold text-foreground leading-relaxed">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lab Results Table */}
                {selectedReport.parsedLabs?.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2.5">
                      Structured Lab Metrics
                    </h4>
                    <div className="rounded-xl border border-border/80 overflow-hidden bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted/40 border-b border-border/60 text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
                              <th className="py-2.5 px-3">Test Metric</th>
                              <th className="py-2.5 px-3 text-center">Value</th>
                              <th className="py-2.5 px-3 text-center">Reference Range</th>
                              <th className="py-2.5 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 font-semibold text-foreground">
                            {selectedReport.parsedLabs.map((lab, i) => {
                              const isHigh = lab.status?.toLowerCase() === 'high';
                              const isLow = lab.status?.toLowerCase() === 'low';
                              return (
                                <tr key={i} className="hover:bg-muted/10 transition-colors">
                                  <td className="py-3 px-3 text-foreground font-bold">{lab.name}</td>
                                  <td className="py-3 px-3 text-center">
                                    {lab.value} <span className="text-[10px] text-muted-foreground font-medium">{lab.unit}</span>
                                  </td>
                                  <td className="py-3 px-3 text-center text-muted-foreground font-medium">{lab.referenceRange}</td>
                                  <td className="py-3 px-3 text-right">
                                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                      isHigh 
                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                        : isLow 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                      {isHigh && <AlertTriangle className="w-2.5 h-2.5" />}
                                      {isLow && <AlertCircle className="w-2.5 h-2.5" />}
                                      {lab.status || 'Normal'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4 bg-muted/10 shrink-0 flex gap-3">
                <button
                  onClick={(e) => {
                    handleDelete(selectedReport.id, e);
                  }}
                  className="px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Report
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:bg-primary-600 transition-all shadow-sm cursor-pointer text-center"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

