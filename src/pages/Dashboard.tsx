import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, Building2, Loader2, BarChart2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ pendingReview: 0, approved: 0, urgentCases: 0 });
  const [recentAction, setRecentAction] = useState([]);
  const [priorityCases, setPriorityCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [dateRange, setDateRange] = useState('all');

  const navigate = useNavigate();
  const { searchTerm } = useOutletContext<{ searchTerm: string }>() || { searchTerm: '' };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isExecutive = user?.role === 'Super Admin' || user?.role === 'Department Admin' || user?.role === 'Legal Officer';
  const canViewQueue = user?.role !== 'Read-only Viewer';

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch('/api/dashboard', { headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } }).then(r => r.json()),
      fetch('/api/cases', { headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } }).then(r => r.json())
    ]).then(([dashData, casesData]) => {
      setStats(dashData.stats);
      setRecentAction(dashData.recentActivity);
      
      const sorted = casesData.sort((a: any, b: any) => {
        const uA = JSON.parse(a.extractedData?.raw_json || '{}').urgency === 'High' ? -1 : 1;
        const uB = JSON.parse(b.extractedData?.raw_json || '{}').urgency === 'High' ? -1 : 1;
        return uA - uB;
      });
      setPriorityCases(sorted);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const filteredCases = priorityCases.filter(c => {
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
    const exData = JSON.parse(c.extractedData?.raw_json || '{}');
    const parties = (Array.isArray(exData.parties) ? exData.parties.join(' ') : exData.parties || '').toLowerCase();
    const depts = (Array.isArray(exData.responsible_departments) ? exData.responsible_departments.join(' ') : exData.responsible_departments || '').toLowerCase();
    return caseNum.includes(term) || parties.includes(term) || depts.includes(term);
  });

  const displayCases = filteredCases.slice(0, 5);

  const hasNearingDeadline = priorityCases.some(c => {
    const ex = JSON.parse(c.extractedData?.raw_json || '{}');
    return ex.urgency === 'High' && ex.appeal_window?.remaining_days != null && ex.appeal_window.remaining_days <= 7;
  });

  const departmentWorkload: Record<string, number> = {};
  priorityCases.forEach(c => {
    const ex = JSON.parse(c.extractedData?.raw_json || '{}');
    if (Array.isArray(ex.responsible_departments)) {
      ex.responsible_departments.forEach((dept: string) => {
        departmentWorkload[dept] = (departmentWorkload[dept] || 0) + 1;
      });
    }
  });

  const topDepartments = Object.entries(departmentWorkload).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const chartData = Object.entries(departmentWorkload).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  const colors = ['#285b84', '#3b78a8', '#5095cc', '#7aaadb', '#9dbfe5', '#bed3ed'];

  const confidenceData = [
    { name: 'Mon', score: 85 },
    { name: 'Tue', score: 88 },
    { name: 'Wed', score: 87 },
    { name: 'Thu', score: 92 },
    { name: 'Fri', score: 94 },
    { name: 'Sat', score: 96 },
    { name: 'Sun', score: 95 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="border-l-4 border-gray-200">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <Card>
               <CardHeader><div className="h-6 bg-gray-200 rounded w-1/3"></div></CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>)}
                 </div>
               </CardContent>
             </Card>
          </div>
          <Card><CardHeader><div className="h-6 bg-gray-200 rounded w-1/2"></div></CardHeader></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-kar-blue">
          <CardHeader className="pb-2">
            <CardDescription>Total Cases Uploaded</CardDescription>
            <CardTitle className="text-3xl">{stats.pendingReview + stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-l-4 border-l-kar-warning bg-kar-warning/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-kar-warning font-medium">Pending Verification</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl text-kar-warning">{stats.pendingReview}</CardTitle>
              <Clock className="h-6 w-6 text-kar-warning/50" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-kar-error relative">
          <CardHeader className="pb-2">
            <CardDescription className="text-kar-error font-medium">High Urgency</CardDescription>
            <div className="flex items-center justify-between">
              <div className="flexItems-center space-x-2 flex">
                <CardTitle className="text-3xl text-kar-error">{stats.urgentCases}</CardTitle>
                {hasNearingDeadline && (
                  <div className="flex bg-kar-error text-white text-[10px] px-2 py-1 rounded-full items-center font-bold tracking-wider animate-pulse uppercase shadow-[0_0_10px_rgba(165,30,34,0.5)]">
                     <AlertTriangle className="h-3 w-3 mr-1"/> Deadline {'<'} 7 Days
                  </div>
                )}
              </div>
              <AlertTriangle className="h-6 w-6 text-kar-error/50" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-kar-success bg-kar-success/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-kar-success font-medium">Verified Actions</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl text-kar-success">{stats.approved}</CardTitle>
              <CheckCircle2 className="h-6 w-6 text-kar-success/50" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {canViewQueue && (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Priority Action Queue</CardTitle>
                            <CardDescription>Records requiring immediate department attention</CardDescription>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select 
                                className="text-xs p-1 border border-black/10 rounded focus:ring-1 focus:ring-kar-blue"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="all">All Dates</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                            <select 
                                className="text-xs p-1 border border-black/10 rounded focus:ring-1 focus:ring-kar-blue"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending_review">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button onClick={() => navigate('/verification')} className="text-sm text-kar-blue hover:underline flex items-center ml-2">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {displayCases.map((c, i) => {
                          const ex = JSON.parse(c.extractedData?.raw_json || '{}');
                          const isHigh = ex.urgency === 'High';
                          return (
                            <div key={i} className="flex items-start justify-between p-4 border border-black/5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer" onClick={() => navigate('/verification')}>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <Badge className={`border-transparent ${isHigh ? 'bg-kar-error/10 text-kar-error' : 'bg-kar-slate/10 text-kar-slate'}`}>
                                          {isHigh ? 'High Priority' : 'Standard'}
                                        </Badge>
                                        <span className="text-sm font-semibold text-kar-slate border-l border-black/10 pl-2">{c.case?.case_number || 'Unknown'}</span>
                                    </div>
                                    <p className="text-sm text-kar-slate/80 font-medium pt-1 line-clamp-1">{ex.parties ? (Array.isArray(ex.parties) ? ex.parties.join(' vs ') : ex.parties) : 'Unknown Parties'}</p>
                                    <p className="text-xs text-kar-slate/50">
                                      {Array.isArray(ex.responsible_departments) ? ex.responsible_departments.join(', ') : 'Unknown'} • 
                                      {ex.appeal_window?.remaining_days != null ? ` Expiring in ${ex.appeal_window.remaining_days} days` : ' No deadline extracted'}
                                    </p>
                                </div>
                                {isHigh ? <AlertTriangle className="h-5 w-5 text-kar-error mt-1" /> : <Clock className="h-5 w-5 text-kar-slate/50 mt-1" />}
                            </div>
                          );
                        })}
                        {displayCases.length === 0 && (
                          <div className="text-center py-6 text-kar-slate/50 bg-black/5 rounded-lg">
                            {searchTerm ? 'No priority cases match your search.' : 'No priority items in the queue.'}
                          </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            )}

            {chartData.length > 0 && isExecutive && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <div>
                     <CardTitle>Department Workload</CardTitle>
                     <CardDescription>Pending verifications</CardDescription>
                   </div>
                   <BarChart2 className="h-5 w-5 text-kar-slate/50" />
                 </CardHeader>
                 <CardContent>
                   <div className="h-64 w-full mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} />
                         <Tooltip 
                           cursor={{fill: 'rgba(0,0,0,0.05)'}}
                           contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         />
                         <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                           {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                           ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <div>
                     <CardTitle>AI Confidence Trends</CardTitle>
                     <CardDescription>Extraction accuracy over time (7D)</CardDescription>
                   </div>
                   <div className="text-right">
                      <span className="text-2xl font-bold text-kar-success">92%</span>
                      <p className="text-xs text-kar-slate/60">Avg Score</p>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <div className="h-64 w-full mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={confidenceData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#285b84" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#285b84" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                         <YAxis domain={['auto', 100]} hide />
                         <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                         <Area type="monotone" dataKey="score" stroke="#285b84" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>
              </div>
            )}
        </div>

        {isExecutive && (
        <div className="">
            <Card className="h-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Audit Trail</CardTitle>
                            <CardDescription>Latest system activities</CardDescription>
                        </div>
                        <button onClick={() => navigate('/audit')} className="text-sm text-kar-blue hover:underline flex items-center">
                            Logs <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                      {recentAction.slice(0, 5).map((log: any, i) => (
                          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-kar-blue text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-md border border-black/5 bg-white shadow-sm">
                                  <div className="flex items-center justify-between space-x-2 mb-1">
                                      <div className={`font-medium text-[10px] uppercase tracking-wide ${log.action.includes('ERROR') ? 'text-kar-error' : 'text-kar-blue'}`}>{log.action}</div>
                                      <time className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleDateString()}</time>
                                  </div>
                                  <div className="text-slate-600 font-medium text-xs truncate" title={log.details}>{log.details || 'System log'}</div>
                              </div>
                          </div>
                      ))}
                      {recentAction.length === 0 && (
                          <div className="text-sm text-slate-500 text-center py-4">No recent activity</div>
                      )}
                    </div>
                </CardContent>
            </Card>
        </div>
        )}
      </div>
    </div>
  );
}
