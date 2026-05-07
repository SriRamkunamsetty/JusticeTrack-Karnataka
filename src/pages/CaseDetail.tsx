import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Clock, Calendar, Building, FileText, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractedDataRecord, setExtractedDataRecord] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/cases/${id}`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const data = await res.json();
          setCaseData(data.case);
          setExtractedDataRecord(data.extractedData);
          setExtractedData(data.extractedData ? JSON.parse(data.extractedData.raw_json || '{}') : {});
          setAuditLogs(data.auditLogs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <Card><CardContent className="h-96 bg-gray-100 mt-6"></CardContent></Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Case not found</h2>
        <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  let aiActions = [];
  try {
    const actionsData = extractedData?.actions;
    aiActions = Array.isArray(actionsData) ? actionsData : (actionsData ? JSON.parse(actionsData) : []);
    if (!Array.isArray(aiActions)) aiActions = [];
  } catch(e) {
    aiActions = [];
  }

  const statusColor = caseData.status === 'approved' ? 'bg-kar-success' : caseData.status === 'rejected' ? 'bg-kar-error' : 'bg-kar-blue';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-kar-slate" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-kar-slate flex items-center">
            {caseData.case_number}
            <Badge className={`ml-3 text-white border-transparent ${statusColor}`}>
              {caseData.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </h1>
          <p className="text-kar-slate/60 text-sm">Uploaded on {format(new Date(caseData.upload_date), "MMM d, yyyy 'at' h:mm a")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-black/5 border-b border-black/5">
              <CardTitle className="text-lg flex items-center"><FileText className="w-5 h-5 mr-2" /> Extracted Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <h4 className="text-xs uppercase font-bold text-kar-slate/50 tracking-wider mb-1">Court Name</h4>
                  <p className="font-medium text-kar-slate">{extractedData.court_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-kar-slate/50 tracking-wider mb-1">Judge Name</h4>
                  <p className="font-medium text-kar-slate">{extractedData.judge_name || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-xs uppercase font-bold text-kar-slate/50 tracking-wider mb-1">Parties</h4>
                  <p className="font-medium text-kar-slate">{Array.isArray(extractedData.parties) ? extractedData.parties.join(' vs ') : extractedData.parties || 'N/A'}</p>
                </div>
                <div className="col-span-2 bg-kar-cream/30 p-4 rounded-lg border border-kar-blue/10">
                   <h4 className="text-xs uppercase font-bold text-kar-slate/80 tracking-wider mb-2 flex items-center"><Clock className="w-4 h-4 mr-1 text-orange-500" /> Appeal Window</h4>
                   <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-kar-slate/60 mr-2">Allowed:</span>
                        <span className="font-bold text-kar-slate">{extractedData.appeal_window?.allowed ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-kar-slate/60 mr-2">Expiry Date:</span>
                        <span className="font-bold text-kar-error">{extractedData.appeal_window?.expiry_date || 'N/A'}</span>
                      </div>
                   </div>
                </div>

                {extractedData.key_orders && Array.isArray(extractedData.key_orders) && (
                  <div className="col-span-2">
                    <h4 className="text-xs uppercase font-bold text-kar-slate/50 tracking-wider mb-2">Key Orders</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-kar-slate/80">
                      {extractedData.key_orders.map((order: string, i: number) => <li key={i}>{order}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {extractedDataRecord?.reviewer_notes && (
            <Card>
              <CardHeader className="bg-black/5 border-b border-black/5">
                <CardTitle className="text-lg flex items-center"><FileText className="w-5 h-5 mr-2" /> Reviewer Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-900 text-sm">
                  {extractedDataRecord.reviewer_notes}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="bg-black/5 border-b border-black/5">
              <CardTitle className="text-lg flex items-center"><CheckCircle2 className="w-5 h-5 mr-2" /> Action Plans</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {aiActions.length === 0 ? (
                <p className="text-sm text-kar-slate/50 italic">No action plans generated.</p>
              ) : (
                aiActions.map((action: any, idx: number) => {
                  const isUrgent = action.priority === 'High' || action.urgency === 'High';
                  const isCritical = action.risk_level === 'Critical';
                  
                  return (
                    <div key={idx} className={`bg-white p-4 rounded-lg border shadow-sm space-y-3 relative overflow-hidden ${isUrgent ? 'border-orange-500/30' : 'border-kar-blue/20'} ${isCritical ? 'border-kar-error/40' : ''}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-kar-error' : isUrgent ? 'bg-orange-500' : 'bg-kar-blue'}`}></div>
                      <div className="font-semibold text-kar-blue pl-2">{action.title}</div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm pl-2">
                        <div className="flex items-center text-kar-slate/80"><Building className="w-4 h-4 mr-2 text-kar-slate/50"/> {action.department}</div>
                        <div className={`flex items-center ${isUrgent ? 'text-kar-error font-medium' : 'text-kar-slate/80'}`}>
                          <Calendar className={`w-4 h-4 mr-2 ${isUrgent ? 'text-kar-error' : 'text-kar-slate/50'}`} /> {action.timeline}
                        </div>
                      </div>
                      <div className="bg-black/5 p-3 rounded text-sm ml-2 mt-2 border-l-2 border-kar-blue/30">
                        <span className="font-semibold text-kar-slate block text-xs uppercase mb-1">Recommended Action</span>
                        <p className="text-kar-slate/80">{action.recommended_next_step || action.recommended_officer_action || 'N/A'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-black/5 border-b border-black/5">
              <CardTitle className="text-lg flex items-center"><History className="w-5 h-5 mr-2" /> Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-black/5">
                 {auditLogs.length === 0 ? (
                   <div className="p-6 text-center text-sm text-kar-slate/50 italic">No audit events recorded.</div>
                 ) : (
                   auditLogs.map((log) => (
                     <div key={log.id} className="p-4 flex space-x-3">
                       <div className="mt-0.5">
                         {log.action === 'APPROVE_CASE' ? (
                           <CheckCircle2 className="w-4 h-4 text-kar-success" />
                         ) : log.action === 'REJECT_CASE' ? (
                           <AlertTriangle className="w-4 h-4 text-kar-error" />
                         ) : (
                           <div className="w-4 h-4 rounded-full bg-kar-slate/20"></div>
                         )}
                       </div>
                       <div>
                         <div className="text-sm font-medium text-kar-slate">{log.action.replace('_', ' ')}</div>
                         <div className="text-xs text-kar-slate/60 mb-1">{format(new Date(log.timestamp), "MMM d, yyyy h:mm a")} by User {log.user_id.split('-')[0]}</div>
                         {log.details && (
                           <div className="text-xs bg-kar-cream p-2 rounded text-kar-slate mt-1 italic border border-black/5">"{log.details}"</div>
                         )}
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
