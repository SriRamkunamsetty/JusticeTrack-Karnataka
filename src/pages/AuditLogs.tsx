import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ShieldCheck, User, Activity, Clock, ShieldAlert } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useOutletContext<{ searchTerm: string }>() || { searchTerm: '' };

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/dashboard', { headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } })
      .then(r => r.json())
      .then(data => {
        setLogs(data.recentActivity || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('APPROVE') || action.includes('LOGIN')) return 'text-kar-success bg-kar-success/10 border-kar-success/20';
    if (action.includes('REJECT') || action.includes('DELETE')) return 'text-kar-error bg-kar-error/10 border-kar-error/20';
    return 'text-kar-blue bg-kar-blue/10 border-kar-blue/20';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('APPROVE')) return <ShieldCheck className="h-5 w-5 text-kar-success" />;
    if (action.includes('REJECT')) return <ShieldAlert className="h-5 w-5 text-kar-error" />;
    if (action.includes('LOGIN')) return <User className="h-5 w-5 text-kar-blue" />;
    return <Activity className="h-5 w-5 text-kar-slate" />;
  };

  const filteredLogs = logs.filter(log => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (log.action && log.action.toLowerCase().includes(term)) || 
             (log.details && log.details.toLowerCase().includes(term)) ||
             (log.entity_id && log.entity_id.toLowerCase().includes(term)) ||
             (log.user_id && log.user_id.toLowerCase().includes(term));
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div><div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div><div className="h-4 bg-gray-200 rounded w-1/3"></div></div>
        <Card><CardContent className="h-96 bg-gray-100 rounded-lg mt-6"></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-kar-slate">Audit & Accountability Logs</h1>
        <p className="text-kar-slate/60">Immutable record of system access and workflow modifications.</p>
      </div>

      <Card>
        <CardHeader className="border-b border-black/5 bg-kar-cream/10">
          <CardTitle className="text-lg">System Activity Timeline</CardTitle>
          <CardDescription>All actions are cryptographically logged with timestamps and user identifiers.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-kar-slate">
              <thead className="bg-black/5 border-b border-black/10">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Action</th>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Entity</th>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">Details</th>
                  <th className="px-6 py-4 font-medium uppercase text-xs tracking-wider">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-kar-cream/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-kar-slate/80">
                        <Clock className="h-4 w-4 text-kar-slate/50" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getActionIcon(log.action)}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded text-kar-slate/80">
                        {log.entity_type}-{log.entity_id.substring(0,8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-kar-slate/80 max-w-sm truncate" title={log.details}>
                      {log.details || 'System automatically processed request.'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-kar-slate/60">
                      {log.user_id.substring(0, 12)}...
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Activity className="h-10 w-10 text-kar-slate/20 mb-3" />
                        <span className="text-kar-slate/60 text-sm">{searchTerm ? 'No activity logs match your search.' : 'No activity logs found.'}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-kar-slate/50 text-center bg-white p-3 rounded shadow-sm border border-black/10">
        <ShieldCheck className="inline h-4 w-4 mr-1 text-kar-success" />
        This audit trail complies with Karnataka Government digital operational guidelines. Records cannot be deleted.
      </div>
    </div>
  );
}
