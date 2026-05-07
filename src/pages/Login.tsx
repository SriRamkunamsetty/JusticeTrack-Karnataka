import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('admin@karnataka.gov.in');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // JWT
      
      const evt = new Event('storage');
      window.dispatchEvent(evt);
      
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#204060] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center text-white mb-8">
          <Building className="h-10 w-10 mx-auto text-kar-cream mb-3 opacity-90" />
          <h1 className="text-3xl font-bold tracking-tight mb-1">JusticeTrack</h1>
          <p className="text-sm text-kar-cream/80">Government Action Plans from Court Judgments</p>
        </div>

        <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden text-left">
          <div className="bg-slate-50 border-b border-black/5 p-5">
            <h2 className="text-lg font-bold text-[#12355B]">Government Portal Login</h2>
            <p className="text-xs text-slate-500 mt-0.5">Secure access for authorized government officers</p>
          </div>

          <div className="p-6 space-y-6">
            {!showForm ? (
              <>
                <div className="bg-slate-100 border-l-4 border-[#12355B] p-3 rounded-r text-sm text-slate-800">
                  Welcome to <strong>JusticeTrack</strong>, the official government system for managing High Court judgment directives and compliance tracking.
                </div>

                <div>
                  <h3 className="font-semibold text-[#12355B] mb-3 text-sm">System Features:</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start"><Check className="h-4 w-4 text-slate-500 mr-2 shrink-0 mt-0.5" /> AI-powered judgment analysis and extraction</li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-slate-500 mr-2 shrink-0 mt-0.5" /> Automated action plan generation</li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-slate-500 mr-2 shrink-0 mt-0.5" /> Human verification and approval workflows</li>
                    <li className="flex items-start"><Check className="h-4 w-4 text-slate-500 mr-2 shrink-0 mt-0.5" /> Comprehensive audit logging and compliance tracking</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button 
                    className="w-full bg-[#12355B] hover:bg-[#0c243e] font-medium text-white" 
                    onClick={() => setShowForm(true)}
                  >
                    Sign In with Government Portal
                  </Button>
                  <p className="text-[10px] text-center text-slate-500 mt-4 leading-tight">
                    This is a secure government system.<br/>
                    Authorized users only. All activities are logged.
                  </p>
                </div>
              </>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-200">
                    {error}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Official ID / Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#12355B]/50 focus:border-[#12355B]/50 outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-kar-slate/50 mt-1">Demo: admin@karnataka.gov.in or legal@karnataka.gov.in</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#12355B]/50 focus:border-[#12355B]/50 outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-kar-slate/50 mt-1">Demo: any password is accepted</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-[#12355B] hover:bg-[#0c243e] text-white mt-2">
                  {loading ? 'Authenticating...' : 'Secure Login'}
                </Button>
                <button type="button" onClick={() => setShowForm(false)} className="text-xs text-slate-500 hover:text-[#12355B] w-full text-center mt-2">
                  Back to features
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center mt-8 text-white/50 text-xs">
          <p>Government of Karnataka | High Court Judgment Management System</p>
          <p className="mt-1">&copy; 2026 All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
