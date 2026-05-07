import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Scale, 
  LayoutDashboard, 
  UploadCloud, 
  CheckSquare, 
  FileText, 
  History, 
  LogOut,
  Menu,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Mock user from local storage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard, roles: ['Super Admin', 'Department Admin', 'Reviewing Officer', 'Legal Officer', 'Read-only Viewer'] },
    { title: "Upload Judgment", path: "/upload", icon: UploadCloud, roles: ['Super Admin', 'Department Admin', 'Legal Officer'] },
    { title: "Pending Verification", path: "/verification", icon: CheckSquare, roles: ['Super Admin', 'Department Admin', 'Reviewing Officer', 'Legal Officer'] },
    { title: "Approved Actions", path: "/approved", icon: FileText, roles: ['Super Admin', 'Department Admin', 'Reviewing Officer', 'Legal Officer', 'Read-only Viewer'] },
    { title: "Audit Logs", path: "/audit", icon: History, roles: ['Super Admin', 'Department Admin', 'Legal Officer'] },
  ].filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-kar-cream bg-opacity-30">
      <nav className={`fixed inset-y-0 left-0 z-50 w-64 bg-kar-blue text-white shadow-lg transition-transform transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:flex flex-col`}>
        <div className="flex items-center space-x-3 px-6 py-5 border-b border-white/10">
          <div className="bg-kar-red p-2 rounded-full">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">JusticeTrack</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold mt-0.5">Govt of Karnataka</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-white/10 text-white font-medium" : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-kar-cream text-kar-blue flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-white/50">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5" onClick={() => setLogoutDialogOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white border-b border-black/5 shadow-sm px-6 py-4 flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5 text-kar-blue" />
              </Button>
              <span className="font-semibold text-kar-blue ml-4">JusticeTrack</span>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-xl px-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kar-slate/40" />
                <input 
                  type="text" 
                  placeholder="Search case numbers, parties, departments..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-kar-blue/20 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/presentation')} className="text-[#12355B] border-[#12355B]/20 hover:bg-[#12355B]/5">
                  <span className="mr-2 hidden sm:inline">Hackathon Deck</span>
                  <div className="h-4 w-4 rounded-sm bg-[#A51E22] flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  </div>
                </Button>
                <Button variant="ghost" size="icon" className="relative text-kar-slate/60 hover:text-kar-blue">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-kar-error"></span>
                </Button>
            </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet context={{ searchTerm }} />
        </main>
      </div>

      <Dialog 
        isOpen={logoutDialogOpen} 
        onClose={() => setLogoutDialogOpen(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to sign out of the JusticeTrack platform?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleLogout}
      />
    </div>
  );
}

export { Layout };
