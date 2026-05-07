import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Calendar, Building, Scale, ArrowRight, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function ApprovedActions() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('approved');
  const [dateRange, setDateRange] = useState('all');

  const { searchTerm } = useOutletContext<{ searchTerm: string }>() || { searchTerm: '' };
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/cases', { headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } })
      .then(r => r.json())
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const filteredCases = cases.filter(c => {
    // Status Filter
    if (statusFilter !== 'all' && c.case?.status !== statusFilter) return false;

    // Date Range Filter
    if (dateRange !== 'all') {
      const uploadDate = new Date(c.case?.upload_date);
      const now = new Date();
      if (dateRange === '7d' && now.getTime() - uploadDate.getTime() > 7 * 24 * 60 * 60 * 1000) return false;
      if (dateRange === '30d' && now.getTime() - uploadDate.getTime() > 30 * 24 * 60 * 60 * 1000) return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const caseNum = c.case?.case_number?.toLowerCase() || '';
    const exData = c.extractedData ? JSON.parse(c.extractedData.raw_json || '{}') : {};
    const parties = (Array.isArray(exData.parties) ? exData.parties.join(' ') : exData.parties || '').toLowerCase();
    const depts = (Array.isArray(exData.responsible_departments) ? exData.responsible_departments.join(' ') : exData.responsible_departments || '').toLowerCase();
    return caseNum.includes(term) || parties.includes(term) || depts.includes(term);
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div><div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div><div className="h-4 bg-gray-200 rounded w-1/3"></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <Card key={i}>
                <CardHeader><div className="h-6 bg-gray-200 rounded w-1/2"></div></CardHeader>
                <CardContent className="h-32 bg-gray-100 rounded-lg m-4 mt-0"></CardContent>
             </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-kar-slate">Approved Government Actions</h1>
          <p className="text-kar-slate/60">Verified legal workflows dispatched to respective departments.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
            <select 
                className="text-xs p-1 border border-black/10 rounded focus:ring-1 focus:ring-kar-blue w-full md:w-auto"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
            >
                <option value="all">All Dates</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
            </select>
            <select 
                className="text-xs p-1 border border-black/10 rounded focus:ring-1 focus:ring-kar-blue w-full md:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((c) => {
          let exData: any = {};
          let actions: any[] = [];
          if (c.extractedData) {
            try {
              exData = JSON.parse(c.extractedData.raw_json || '{}');
              actions = JSON.parse(c.extractedData.actions || '[]');
            } catch (e) {}
          }

          return (
            <Card key={c.case.id} className="border-t-4 border-t-kar-success flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-black/5">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`border-transparent ${c.case.status === 'approved' ? 'bg-kar-success/10 text-kar-success' : c.case.status === 'rejected' ? 'bg-kar-error/10 text-kar-error' : 'bg-kar-warning/10 text-kar-warning'}`}>{c.case.status}</Badge>
                  <span className="text-xs text-kar-slate/50">{new Date(c.case.upload_date).toLocaleDateString()}</span>
                </div>
                <CardTitle className="text-lg text-kar-blue flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-kar-red" />
                  {exData.case_number || c.case.case_number}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1 font-medium">
                  {exData.parties ? (Array.isArray(exData.parties) ? exData.parties.join(' vs ') : exData.parties) : c.case.file_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col space-y-4">
                
                {exData.overall_summary && (
                   <div className="bg-kar-blue/5 border border-kar-blue/10 rounded-md p-3 text-sm">
                      <div className="font-semibold text-kar-blue mb-1 text-xs uppercase tracking-wider">AI Summary</div>
                      <p className="text-kar-slate/80 line-clamp-3">{exData.overall_summary}</p>
                   </div>
                )}

                <div className="flex-1 space-y-3">
                  {actions.slice(0, 2).map((a, i) => {
                    const isUrgent = a.priority === 'High' || a.urgency === 'High';
                    const isCritical = a.risk_level === 'Critical';
                    return (
                    <div key={i} className={`bg-white relative overflow-hidden p-3 rounded border ${isCritical ? 'border-kar-error/30' : isUrgent ? 'border-orange-500/30' : 'border-kar-blue/10'} shadow-sm`}>
                      <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-kar-error' : isUrgent ? 'bg-orange-500' : 'bg-kar-blue'}`}></div>
                      <div className="font-semibold text-kar-blue text-sm mb-1 pl-1 line-clamp-1" title={a.title}>{a.title}</div>
                      <div className="flex items-center text-xs text-kar-slate/70 mb-1 pl-1">
                        <Building className="h-3 w-3 mr-1" /> <span className="truncate">{a.department}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-kar-slate/70 pl-1">
                         <div className="flex items-center">
                           <Calendar className="h-3 w-3 mr-1" />
                           Timeline: <span className={`${isUrgent ? 'text-kar-error' : 'text-kar-slate'} font-medium ml-1`}>{a.timeline}</span>
                         </div>
                         {a.days_remaining !== undefined && (
                           <Badge variant="outline" className={`text-[9px] h-4 py-0 ${isUrgent ? 'border-kar-error text-kar-error' : ''}`}>{a.days_remaining} Days</Badge>
                         )}
                      </div>
                    </div>
                  )})}
                  {actions.length > 2 && (
                    <div className="text-xs text-kar-slate/50 italic text-center">+ {actions.length - 2} more actions</div>
                  )}
                  {actions.length === 0 && (
                    <div className="text-sm border border-dashed border-black/20 p-4 text-center rounded text-kar-slate/50">
                      No specific actions extracted.
                    </div>
                  )}
                </div>
                
                <div className="pt-4 mt-auto border-t border-black/10 flex justify-between items-center">
                  <Button variant="ghost" size="sm" className="text-kar-blue hover:text-kar-blue/80 hover:bg-kar-blue/10 cursor-not-allowed opacity-50" title="Demo mode only">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="border-kar-blue/20 text-kar-slate" onClick={() => navigate(`/case/${c.case.id}`)}>
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredCases.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-black/10 rounded-xl shadow-sm">
            <FileText className="h-12 w-12 text-kar-slate/20 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-kar-slate">No Approved Records</h3>
            <p className="text-sm text-kar-slate/50 mt-1">{searchTerm ? 'No approved records match your search.' : 'There are currently no verified government actions to display.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
