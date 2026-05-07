import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, File, Loader2, CheckCircle2, ScanText, BrainCircuit, Network, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils'; // Make sure cn is exported correctly

export default function UploadCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [caseNumber, setCaseNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const navigate = useNavigate();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !caseNumber) return;
    setUploading(true);
    setAgentStep(0);
    
    // Mock user
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { id: 'demo' };
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);
    formData.append('caseNumber', caseNumber);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/cases/upload', {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: formData
      });
      const data = await res.json();
      
      setUploading(false);
      setProcessing(true);
      
      // Simulate Agent Pipeline UX progress locally while the actual request runs
      const stepsTimers = [
          setTimeout(() => setAgentStep(1), 1000), // OCR
          setTimeout(() => setAgentStep(2), 2500), // Document Structure
          setTimeout(() => setAgentStep(3), 4500), // Extraction Agent
          setTimeout(() => setAgentStep(4), 7000), // Department Routing
          setTimeout(() => setAgentStep(5), 9000), // Confidence
      ];

      // Trigger processing
      await fetch(`/api/cases/${data.id}/process`, {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      
      // Clear timers and go to verification
      stepsTimers.forEach(clearTimeout);
      setAgentStep(6);
      setTimeout(() => navigate('/verification'), 500);

    } catch (err) {
      console.error(err);
      setUploading(false);
      setProcessing(false);
    }
  };

  const pipelineSteps = [
    { icon: Upload, title: "Secure Uploading", desc: "Ingesting PDF to local vault" },
    { icon: ScanText, title: "OCR Validation Agent", desc: "Digital & scanned document detection" },
    { icon: File, title: "Layout Mapping Agent", desc: "Identifying headings, parties, and orders" },
    { icon: BrainCircuit, title: "Deep Legal Extraction", desc: "Processing directives & computing deadlines" },
    { icon: Network, title: "Government Routing Agent", desc: "Inferring target departments & prioritization" },
    { icon: ClipboardCheck, title: "Confidence Scoring", desc: "Identifying hallucination risks & generating traces" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kar-slate">Upload Judgment Document</h1>
        <p className="text-kar-slate/60">Securely ingest High Court judgments for multi-agent intelligence processing.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {!uploading && !processing && (
            <div className="space-y-2">
              <label htmlFor="caseNumber" className="text-sm font-medium text-kar-slate">Case Number <span className="text-kar-red">*</span></label>
              <input
                id="caseNumber"
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. WP-10452/2026"
                className="w-full h-10 px-3 rounded-md border border-kar-blue/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kar-blue/50"
              />
            </div>
          )}

          <div 
            className={`border-2 border-dashed ${uploading || processing ? 'border-transparent pointer-events-none' : 'border-kar-blue/30 cursor-pointer hover:bg-[#A51E22]/5 hover:border-[#A51E22]/40'} rounded-xl p-12 text-center transition-colors relative`}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => { if(!uploading && !processing) document.getElementById('file-upload')?.click(); }}
          >
            <input 
              id="file-upload" 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            
            {!(uploading || processing) && (
              <>
                <div className="mx-auto bg-white border border-black/5 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Upload className="h-8 w-8 text-kar-blue" />
                </div>
                
                <h3 className="text-lg font-semibold text-kar-slate">Click to upload or drag and drop</h3>
                <p className="text-sm text-kar-slate/50 mt-1">PDF documents only (Max: 10MB)</p>
              </>
            )}

            {(uploading || processing) && (
              <div className="flex flex-col items-center justify-center space-y-6 py-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-kar-blue/20 border-t-kar-blue rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="h-6 w-6 text-kar-blue animate-pulse" />
                  </div>
                </div>
                
                <div className="text-left w-full max-w-md space-y-4">
                  {pipelineSteps.map((step, idx) => (
                    <div key={idx} className={`flex items-center space-x-4 p-2 rounded-lg transition-all duration-500 ${agentStep > idx ? 'opacity-100' : agentStep === idx ? 'opacity-100 bg-kar-blue/5 border border-kar-blue/20' : 'opacity-30'}`}>
                      <div className={`p-2 rounded-full ${agentStep > idx ? 'bg-kar-success/20 text-kar-success' : agentStep === idx ? 'bg-kar-blue/20 text-kar-blue' : 'bg-black/5 text-kar-slate/50'}`}>
                        {agentStep > idx ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className={`h-4 w-4 ${agentStep === idx ? 'animate-pulse' : ''}`} />}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${agentStep === idx ? 'text-kar-blue' : 'text-kar-slate'}`}>{step.title}</p>
                        <p className="text-xs text-kar-slate/60">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {file && !uploading && !processing && (
            <div className="mt-6 p-4 bg-white border border-black/10 rounded-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-kar-red/10 p-2 rounded">
                  <File className="h-6 w-6 text-kar-red" />
                </div>
                <div>
                  <p className="font-medium text-sm text-kar-slate">{file.name}</p>
                  <p className="text-xs text-kar-slate/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</Button>
            </div>
          )}

          {!uploading && !processing && (
            <div className="flex justify-end">
              <Button 
                  disabled={!file || !caseNumber} 
                  className="w-full sm:w-auto"
                  onClick={handleUpload}
              >
                  Process Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-kar-blue/5 border-kar-blue/20">
        <CardContent className="p-4 text-sm text-kar-slate">
            <strong>System Note:</strong> The uploaded document will be processed by the legal extraction engine using layout understanding and OCR. Extracted data will require human verification before being marked as actionable.
        </CardContent>
      </Card>
    </div>
  );
}
