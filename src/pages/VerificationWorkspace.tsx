import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, X, ShieldAlert, FileText, ArrowRight, Search, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Dialog } from '@/components/ui/Dialog';

// PDF Viewer imports
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { searchPlugin } from '@react-pdf-viewer/search';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

export default function VerificationWorkspace() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [highlightKeyword, setHighlightKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<'approved' | 'rejected' | null>(null);
  const [isBulkAction, setIsBulkAction] = useState(false);

  const navigate = useNavigate();
  const { searchTerm } = useOutletContext<{ searchTerm: string }>() || { searchTerm: '' };

  // Create plugins
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const searchPluginInstance = searchPlugin();
  const { highlight, jumpToNextMatch } = searchPluginInstance;

  // Trigger search highlight when keyword changes
  useEffect(() => {
    if (highlightKeyword && typeof highlight === 'function') {
      const promise = highlight({ keyword: highlightKeyword, matchCase: false });
      if (promise && promise.then) {
        promise.then(() => {
          if (typeof jumpToNextMatch === 'function') {
             setTimeout(() => jumpToNextMatch(), 300);
          }
        }).catch(() => {});
      } else {
        if (typeof jumpToNextMatch === 'function') {
           setTimeout(() => jumpToNextMatch(), 300);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightKeyword]);

  useEffect(() => {
    // Add auth token
    const token = localStorage.getItem('token');
    fetch('/api/cases', {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const pending = data.filter((c: any) => c.status === 'pending_review' || (c.case && c.case.status === 'pending_review'));
        setCases(pending);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  const selectCase = async (c: any) => {
    try {
      const id = c.id || (c.case && c.case.id);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cases/${id}`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      setSelectedCase(data);
      setEditedData(JSON.parse(data.extractedData.raw_json || '{}'));
      setIsEditing(false);
      setNotes('');
      setHighlightKeyword('');
    } catch(e) {
      console.error(e);
    }
  };

  const executeVerify = async () => {
    if (!confirmActionType) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (isBulkAction) {
      await fetch(`/api/cases/bulk-verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: confirmActionType,
          reviewerNotes: notes || "Bulk action applied.",
          userId: user.id || 'demo',
          caseIds: selectedCaseIds
        })
      });
      // Refresh
      setCases(cases.filter(c => !selectedCaseIds.includes(c.id || c.case.id)));
      setSelectedCaseIds([]);
    } else {
      if (!selectedCase) return;
      await fetch(`/api/cases/${selectedCase.case.id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: confirmActionType,
          reviewerNotes: notes,
          userId: user.id || 'demo',
          finalExtraction: {
            ...selectedCase.extractedData,
            raw_json: JSON.stringify(editedData)
          }
        })
      });
      // Refresh
      setCases(cases.filter(c => (c.id || c.case.id) !== selectedCase.case.id));
      setSelectedCase(null);
    }
    
    setConfirmDialogOpen(false);
    setConfirmActionType(null);
    setIsBulkAction(false);
  };

  const triggerVerify = (action: 'approved' | 'rejected') => {
    setIsBulkAction(false);
    setConfirmActionType(action);
    setConfirmDialogOpen(true);
  };

  const triggerBulkVerify = (action: 'approved' | 'rejected') => {
    if (selectedCaseIds.length === 0) return;
    setIsBulkAction(true);
    setConfirmActionType(action);
    setConfirmDialogOpen(true);
  };

  const filteredCases = cases.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const caseData = c.case || c;
    const caseNum = caseData.case_number?.toLowerCase() || '';
    const exData = c.extractedData ? JSON.parse(c.extractedData.raw_json || '{}') : {};
    const parties = (Array.isArray(exData.parties) ? exData.parties.join(' ') : exData.parties || '').toLowerCase();
    const depts = (Array.isArray(exData.responsible_departments) ? exData.responsible_departments.join(' ') : exData.responsible_departments || '').toLowerCase();
    return caseNum.includes(term) || parties.includes(term) || depts.includes(term);
  });

  if (!selectedCase) {
    if (loading) {
      return (
        <div className="space-y-6 animate-pulse">
           <div><div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div><div className="h-4 bg-gray-200 rounded w-1/3"></div></div>
           <Card><CardContent className="h-64 bg-gray-100 rounded-lg mt-6"></CardContent></Card>
        </div>
      );
    }
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-kar-slate">Pending Verification</h1>
            <p className="text-kar-slate/60">Review and verify AI-extracted data against the original judgment.</p>
          </div>
          {selectedCaseIds.length > 0 && (
            <div className="flex bg-white shadow-sm border border-black/10 rounded-lg p-1.5 animate-in slide-in-from-top-2">
               <span className="px-3 py-1.5 text-sm font-medium text-kar-blue flex items-center border-r border-black/5 mr-1">
                 {selectedCaseIds.length} Selected
               </span>
               <Button variant="danger" size="sm" className="mr-1" onClick={() => triggerBulkVerify('rejected')}>
                 <X className="mr-2 h-4 w-4" /> Reject
               </Button>
               <Button variant="primary" size="sm" className="bg-kar-success hover:bg-kar-success/90 text-white" onClick={() => triggerBulkVerify('approved')}>
                 <Check className="mr-2 h-4 w-4" /> Approve
               </Button>
            </div>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm text-kar-slate">
              <thead className="bg-black/5 text-xs uppercase border-b border-black/10">
                <tr>
                  <th className="px-4 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-kar-blue focus:ring-kar-blue"
                      checked={filteredCases.length > 0 && selectedCaseIds.length === filteredCases.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCaseIds(filteredCases.map(c => c.case?.id || c.id));
                        } else {
                          setSelectedCaseIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 font-medium">Case Number</th>
                  <th className="px-6 py-4 font-medium">Upload Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredCases.map(c => {
                  const caseData = c.case || c;
                  const isChecked = selectedCaseIds.includes(caseData.id);
                  return (
                  <tr key={caseData.id} className={`hover:bg-black/5 transition-colors ${isChecked ? 'bg-kar-blue/5' : ''}`}>
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-kar-blue focus:ring-kar-blue"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCaseIds([...selectedCaseIds, caseData.id]);
                          else setSelectedCaseIds(selectedCaseIds.filter(id => id !== caseData.id));
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">{caseData.case_number}</td>
                    <td className="px-6 py-4">{new Date(caseData.upload_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant="warning">Pending Review</Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/case/${caseData.id}`)}>
                        Details
                      </Button>
                      <Button size="sm" onClick={() => selectCase(c)}>
                        Review <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  )
                })}
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-kar-slate/50">
                      {searchTerm ? 'No pending records match your search.' : 'No pending records for review.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  const exData = JSON.parse(selectedCase.extractedData?.raw_json || '{}');
  let aiActions: any[] = [];
  try {
    const p = selectedCase.extractedData?.actions;
    aiActions = Array.isArray(p) ? p : (p ? JSON.parse(p) : []);
    if (!Array.isArray(aiActions)) aiActions = [];
  } catch(e) {
     aiActions = [];
  }
  // Handle confidence scores visually
  const scores = exData.confidence_scores || {};
  
  const getConfidenceColor = (score: number) => {
    if (!score) return "text-kar-slate/50 bg-black/5 border-black/10";
    if (score >= 90) return "text-kar-success bg-kar-success/10 border-kar-success/20";
    if (score >= 70) return "text-amber-600 bg-amber-100 border-amber-200";
    return "text-kar-error bg-kar-error/10 border-kar-error/20";
  };

  const handleSourceClick = (quote: string) => {
    if (!quote) return;
    setHighlightKeyword(quote);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-300">
      {/* Left: Document Viewer */}
      <Card className="flex-1 overflow-hidden flex flex-col border-kar-blue/20">
        <CardHeader className="bg-black/5 py-3 border-b border-black/10 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-kar-blue" />
            <CardTitle className="text-sm font-medium">{selectedCase.case.file_name}</CardTitle>
          </div>
          <Badge className="border-kar-blue/20 text-kar-slate bg-transparent">{exData.case_number || selectedCase.case.case_number}</Badge>
        </CardHeader>
        <CardContent className="p-0 flex-1 bg-neutral-100 flex flex-col relative">
           
           <div className="flex-1 overflow-auto">
             <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
               <Viewer 
                 fileUrl={`/api/download/${selectedCase.case.id}`} 
                 plugins={[defaultLayoutPluginInstance, searchPluginInstance]} 
               />
             </Worker>
           </div>
           
           {exData.source_references && exData.source_references.length > 0 && (
             <div className="w-full h-48 bg-white border-t border-black/10 overflow-y-auto p-4 space-y-2 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
               <h4 className="text-xs font-semibold text-kar-slate uppercase tracking-wider mb-2">Source References Traceability</h4>
               {exData.source_references.map((ref: any, idx: number) => (
                 <div 
                  key={idx} 
                  className="bg-kar-cream/30 p-2 rounded border border-kar-blue/10 text-xs cursor-pointer hover:bg-kar-blue/5 transition-colors group"
                  onClick={() => handleSourceClick(ref.quote)}
                 >
                   <div className="font-semibold text-kar-blue mb-1 flex items-center justify-between">
                     <span>Field: {ref.field} <span className="text-kar-slate/50 ml-2 font-normal">(Page {ref.page})</span></span>
                     <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2 opacity-0 group-hover:opacity-100">
                        <Search className="h-3 w-3 mr-1" /> View inside PDF
                     </Button>
                   </div>
                   <div className="text-kar-slate italic bg-yellow-100/50 p-1 border-l-2 border-yellow-400">"{ref.quote}"</div>
                 </div>
               ))}
             </div>
           )}
        </CardContent>
      </Card>

      {/* Right: Verification Form */}
      <Card className="flex-1 w-full md:w-1/2 overflow-hidden flex flex-col shadow-lg border-t-4 border-t-kar-blue">
        <CardHeader className="py-4 border-b border-black/10 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Extracted Record Verification</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCase(null)}>Close</Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-kar-cream/10">
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-kar-slate uppercase tracking-wider">Case Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-3 rounded border border-black/5 shadow-sm">
                 <label className="text-xs text-kar-slate/50 uppercase">Parties</label>
                 {isEditing ? (
                   <input 
                     className="w-full mt-1 p-1 text-sm border rounded focus:ring-1 focus:ring-kar-blue"
                     value={Array.isArray(editedData.parties) ? editedData.parties.join(' vs ') : (editedData.parties || '')} 
                     onChange={(e) => setEditedData({...editedData, parties: e.target.value.includes('vs') ? e.target.value.split('vs').map((s: string) => s.trim()) : e.target.value})} 
                   />
                 ) : (
                   <div 
                    className="text-sm font-medium cursor-pointer hover:text-kar-blue hover:underline"
                    onMouseEnter={() => handleSourceClick(editedData.parties ? (Array.isArray(editedData.parties) ? editedData.parties[1] || editedData.parties[0] : editedData.parties) : '')}
                    onMouseLeave={() => setHighlightKeyword('')}
                   >
                     {editedData.parties ? (Array.isArray(editedData.parties) ? editedData.parties.join(' vs ') : editedData.parties) : 'N/A'}
                   </div>
                 )}
                 <div className={`flex items-center mt-1 text-[10px] font-medium ${getConfidenceColor(exData.confidence_scores?.parties)}`}>
                   <Check className="h-3 w-3 mr-1"/> {exData.confidence_scores?.parties || 0}% Confidence
                 </div>
               </div>
               
               <div className="bg-white p-3 rounded border border-black/5 shadow-sm">
                 <label className="text-xs text-kar-slate/50 uppercase">Judge</label>
                 {isEditing ? (
                   <input 
                     className="w-full mt-1 p-1 text-sm border rounded focus:ring-1 focus:ring-kar-blue"
                     value={editedData.judge_name || editedData.judge || ''} 
                     onChange={(e) => setEditedData({...editedData, judge_name: e.target.value})} 
                   />
                 ) : (
                   <div 
                    className="text-sm font-medium cursor-pointer hover:text-kar-blue hover:underline" 
                    onMouseEnter={() => handleSourceClick(editedData.judge_name || editedData.judge)}
                    onMouseLeave={() => setHighlightKeyword('')}
                   >
                     {editedData.judge_name || editedData.judge || 'N/A'}
                   </div>
                 )}
                 <div className={`flex items-center mt-1 text-[10px] font-medium ${getConfidenceColor(exData.confidence_scores?.judge)}`}>
                   <Check className="h-3 w-3 mr-1"/> {exData.confidence_scores?.judge || 0}% Confidence
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-3 rounded border border-black/5 shadow-sm">
                 <label className="text-xs text-kar-slate/50 uppercase">Order Date</label>
                 {isEditing ? (
                   <input 
                     className="w-full mt-1 p-1 text-sm border rounded focus:ring-1 focus:ring-kar-blue"
                     value={editedData.judgment_date || editedData.date_of_order || ''} 
                     onChange={(e) => setEditedData({...editedData, judgment_date: e.target.value})} 
                   />
                 ) : (
                   <div 
                    className="text-sm font-medium cursor-pointer hover:text-kar-blue hover:underline"
                    onMouseEnter={() => handleSourceClick(editedData.judgment_date || editedData.date_of_order)}
                    onMouseLeave={() => setHighlightKeyword('')}
                   >
                     {editedData.judgment_date || editedData.date_of_order || 'N/A'}
                   </div>
                 )}
               </div>
               <div className="bg-white p-3 rounded border border-black/5 shadow-sm relative">
                 <label className="text-xs text-kar-slate/50 uppercase">Appeal Deadline</label>
                 {editedData.urgency === 'High' && (
                     <span className="absolute top-2 right-3 h-2 w-2 rounded-full bg-kar-error animate-pulse"></span>
                 )}
                 {isEditing ? (
                   <div className="space-y-2 mt-1">
                     <input 
                       className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-kar-blue"
                       placeholder="Date"
                       value={editedData.appeal_window?.expiry_date || editedData.appeal_deadline || ''} 
                       onChange={(e) => setEditedData({...editedData, appeal_window: {...editedData.appeal_window, expiry_date: e.target.value}})} 
                     />
                     <input 
                       className="w-full p-1 text-sm border rounded focus:ring-1 focus:ring-kar-blue"
                       type="number"
                       placeholder="Days Remaining"
                       value={editedData.appeal_window?.remaining_days ?? ''} 
                       onChange={(e) => setEditedData({...editedData, appeal_window: {...editedData.appeal_window, remaining_days: parseInt(e.target.value)}})} 
                     />
                   </div>
                 ) : (
                   <>
                     <div className={`text-sm font-medium ${editedData.urgency === 'High' ? 'text-kar-error' : 'text-kar-slate'}`}>{editedData.appeal_window?.expiry_date || editedData.appeal_deadline || 'N/A'}</div>
                     {editedData.appeal_window?.remaining_days !== undefined && (
                       <div className="text-xs text-kar-slate/60 mt-1">{editedData.appeal_window.remaining_days} days remaining</div>
                     )}
                   </>
                 )}
               </div>
            </div>
            
            <div className="bg-white p-3 rounded border border-black/5 shadow-sm">
              <label className="text-xs text-kar-slate/50 uppercase">Key Orders</label>
              {isEditing ? (
                <textarea 
                  className="w-full mt-1 p-2 text-sm border rounded focus:ring-1 focus:ring-kar-blue"
                  rows={4}
                  value={(editedData.key_orders || []).join('\n')}
                  onChange={(e) => setEditedData({...editedData, key_orders: e.target.value.split('\n')})}
                />
              ) : (
                <ul className="text-sm font-medium list-disc ml-4 space-y-1 mt-1">
                  {(editedData.key_orders || []).map((ko: string, i: number) => (
                    <li 
                      key={i} 
                      className="cursor-pointer hover:text-kar-blue hover:bg-kar-blue/5 p-1 -ml-1 rounded transition-colors"
                      onMouseEnter={() => handleSourceClick(ko)}
                      onMouseLeave={() => setHighlightKeyword('')}
                    >
                      {ko}
                    </li>
                  ))}
                  {(!editedData.key_orders || editedData.key_orders.length === 0) && <li className="text-kar-slate/50 list-none -ml-4">None found</li>}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/10">
            <h3 className="text-sm font-semibold text-kar-slate uppercase tracking-wider flex items-center">
              Generated Action Plan
              <Badge className="ml-2 text-[10px] bg-kar-blue/10 text-kar-blue border-transparent">AI Suggested</Badge>
            </h3>

            {aiActions.map((action: any, idx: number) => {
              const isUrgent = action.priority === 'High' || action.urgency === 'High';
              const isCritical = action.risk_level === 'Critical';

              return (
              <div key={idx} className={`bg-white p-4 rounded-lg border shadow-sm space-y-4 relative overflow-hidden ${isUrgent ? 'border-kar-error/40' : 'border-kar-blue/20'}`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-kar-error' : isUrgent ? 'bg-orange-500' : 'bg-kar-blue'}`}></div>
                
                <div className="flex justify-between items-start pl-2">
                  <div className="font-semibold text-kar-blue text-base">{action.title}</div>
                  <div className="flex space-x-2">
                    {isCritical && <Badge className="bg-kar-error/10 text-kar-error border-transparent font-bold"><AlertTriangle className="w-3 h-3 mr-1" /> Legal Risk: Critical</Badge>}
                    <Badge className={`border-transparent ${isUrgent ? 'bg-orange-500/10 text-orange-600 font-bold' : 'bg-kar-cream text-kar-slate'}`}>{action.priority || action.urgency} Priority</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pl-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-kar-slate/80"><span className="text-kar-slate/50 w-24">Department:</span> <span className="font-medium">{action.department}</span></div>
                    {action.compliance_requirement && <div className="flex items-start text-kar-slate/80"><span className="text-kar-slate/50 w-24 shrink-0">Compliance:</span> <span className="font-medium">{action.compliance_requirement}</span></div>}
                    {action.appeal_recommendation && <div className="flex items-start text-kar-slate/80"><span className="text-kar-slate/50 w-24 shrink-0">Appeal Rec:</span> <span className="font-medium">{action.appeal_recommendation}</span></div>}
                  </div>
                  <div className="space-y-3">
                    <div className={`flex items-center p-2 rounded justify-between border ${isUrgent ? 'bg-kar-error/5 border-kar-error/20 text-kar-error' : 'bg-black/5 border-black/10 text-kar-slate'}`}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium inline-block">Deadline: {action.timeline}</span>
                      </div>
                      {action.days_remaining !== undefined && (
                        <div className="text-xs font-bold px-2 py-1 bg-white/50 rounded-full border border-current">
                          {action.days_remaining} Days Left
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {action.recommended_officer_action && (
                  <div className="bg-kar-blue/5 p-3 rounded text-sm ml-2 border border-kar-blue/10">
                    <span className="font-semibold text-kar-blue block text-xs uppercase mb-1">Recommended Officer Action</span>
                    <p className="text-kar-slate/80 font-medium">{action.recommended_officer_action}</p>
                  </div>
                )}

                <div className="bg-black/5 p-3 rounded text-sm ml-2 border-l-2 border-kar-blue/30">
                  <span className="font-semibold text-kar-slate block text-xs uppercase mb-1">Legal Reasoning</span>
                  <p className="text-kar-slate/80">{action.legal_reasoning}</p>
                </div>
              </div>
            )})}
            {aiActions.length === 0 && (
              <div className="text-sm text-kar-slate/50 italic bg-white p-4 rounded border border-black/5 shadow-sm">
                No automatic action plans could be confidently generated.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-black/10">
             <label className="block text-sm font-semibold text-kar-slate uppercase tracking-wider mb-2">Reviewer Notes (Optional)</label>
             <textarea 
               value={notes}
               onChange={e => setNotes(e.target.value)}
               className="w-full rounded-md border border-black/20 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-kar-blue/50"
               rows={3}
               placeholder="Add notes for audit trail..."
             />
          </div>

        </CardContent>
        <CardHeader className="border-t border-black/10 bg-white shrink-0 py-4">
           <div className="flex justify-between items-center space-x-4">
              <div className="flex items-center text-xs text-kar-slate/60 bg-kar-blue/5 p-2 rounded border border-kar-blue/10">
                 <ShieldAlert className="h-4 w-4 mr-2 text-kar-blue" />
                 I verify this extraction accurately reflects the judgment.
              </div>
              <div className="flex space-x-2">
                 <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="text-kar-blue border-kar-blue hover:bg-kar-blue/5">
                   {isEditing ? 'Done Editing' : 'Edit'}
                 </Button>
                 <Button variant="danger" onClick={() => triggerVerify('rejected')}>
                   <X className="mr-2 h-4 w-4" /> Reject
                 </Button>
                 <Button variant="primary" className="bg-kar-success hover:bg-kar-success/90 text-white" onClick={() => triggerVerify('approved')}>
                   <Check className="mr-2 h-4 w-4" /> Approve & Dispatch
                 </Button>
              </div>
           </div>
        </CardHeader>
      </Card>

      <Dialog 
        isOpen={confirmDialogOpen} 
        onClose={() => { setConfirmDialogOpen(false); setConfirmActionType(null); }}
        title={confirmActionType === 'approved' ? "Confirm Approval & Dispatch" : "Confirm Rejection"}
        description={confirmActionType === 'approved' 
          ? "Are you sure you want to approve this verification? This will dispatch the AI-generated action plan to the respective departments immediately." 
          : "Are you sure you want to reject this extraction? Please ensure you have added Reviewer Notes."}
        confirmText={confirmActionType === 'approved' ? "Approve" : "Reject"}
        cancelText="Cancel"
        variant={confirmActionType === 'approved' ? 'default' : 'danger'}
        onConfirm={executeVerify}
      />
    </div>
  );
}
