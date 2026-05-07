import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadCenter from './pages/UploadCenter';
import VerificationWorkspace from './pages/VerificationWorkspace';
import ApprovedActions from './pages/ApprovedActions';
import AuditLogs from './pages/AuditLogs';
import Presentation from './pages/Presentation';
import CaseDetail from './pages/CaseDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/presentation" element={<Presentation />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadCenter />} />
          <Route path="verification" element={<VerificationWorkspace />} />
          <Route path="case/:id" element={<CaseDetail />} />
          <Route path="approved" element={<ApprovedActions />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

