import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize, Play, Scale, ShieldCheck, FileSearch, Building, AlertTriangle, ArrowRight, BrainCircuit, Users, CheckCircle2, Lock, Activity, TrendingUp, Layers, MousePointerClick, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  { id: 1, component: Slide1 },
  { id: 2, component: Slide2 },
  { id: 3, component: Slide3 },
  { id: 4, component: Slide4 },
  { id: 5, component: Slide5 },
  { id: 6, component: Slide6 },
  { id: 7, component: Slide7 },
  { id: 8, component: Slide8 },
  { id: 9, component: Slide9 },
  { id: 10, component: Slide10 },
  { id: 11, component: Slide11 },
  { id: 12, component: Slide12 },
  { id: 13, component: Slide13 },
  { id: 14, component: Slide14 },
  { id: 15, component: Slide15 },
  { id: 16, component: Slide16 },
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter') {
        setCurrentSlide(s => Math.min(SLIDES.length - 1, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(s => Math.max(0, s - 1));
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const Slide = SLIDES[currentSlide].component;

  return (
    <div className="fixed inset-0 bg-[#12355B] text-white flex flex-col overflow-hidden z-50 font-sans selection:bg-[#A51E22] selection:text-white">
      <div className="flex-1 relative bg-[#F8F4EC] text-[#1F2937]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-12 overflow-hidden"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-16 bg-[#12355B] flex items-center justify-between px-6 border-t border-white/10 shrink-0">
        <div className="flex items-center space-x-2 text-white/50 text-sm">
          <Scale className="h-5 w-5 mr-2" />
          <span>JusticeTrack</span>
          <span className="mx-2">•</span>
          <span>Karnataka Government Hackathon</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
            disabled={currentSlide === 0}
            className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium w-12 text-center text-white/80">
            {currentSlide + 1} / {SLIDES.length}
          </span>
          <button 
            onClick={() => setCurrentSlide(s => Math.min(SLIDES.length - 1, s + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex space-x-2">
           <button onClick={() => navigate('/')} className="px-4 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 rounded transition">
             Exit Presentation
           </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SLIDE COMPONENTS
// ---------------------------------------------------------

function Slide1() {
  return (
    <div className="flex flex-col items-center text-center w-full max-w-5xl">
       <div className="mb-10 text-[#12355B]/20">
         <Scale className="w-32 h-32 mx-auto" />
       </div>
       <h1 className="text-6xl font-bold tracking-tight text-[#12355B] mb-6">
         JusticeTrack
       </h1>
       <p className="text-3xl text-[#A51E22] font-semibold mb-8">
         AI-Powered Court Judgment to Verified Action Plan System
       </p>
       <div className="w-24 h-1 bg-[#A51E22] mx-auto mb-8 rounded-full"></div>
       <p className="text-xl text-[#1F2937]/70 italic mb-16">
         “From Court Judgments to Verified Government Action.”
       </p>
       <div className="flex items-center justify-between w-full max-w-2xl text-sm font-medium text-[#1F2937]/50 mt-12 bg-white p-4 rounded-lg shadow-sm border border-black/5">
         <div>Government of Karnataka</div>
         <div>Evaluation Panel Deck</div>
         <div>Team Code: [PLACEHOLDER]</div>
       </div>
    </div>
  );
}

function Slide2() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2 leading-tight">Critical Government Actions Are Buried<br/>Inside Lengthy Legal PDFs.</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="grid grid-cols-2 gap-12 items-center">
         <div className="bg-white p-8 rounded-xl shadow-md border border-black/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-[#A51E22]/20"></div>
           <p className="font-mono text-xs text-slate-400 mb-4 whitespace-pre">
             IN THE HIGH COURT OF KARNATAKA AT BENGALURU\n
             DATED THIS THE 14TH DAY OF AUGUST 2025\n
             ...\n
             [Page 47]\n
             Therefore, the Respondent No. 3 is hereby directed to\n
             ensure compensation is disbursed within 60 days...
           </p>
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-end justify-center pb-8">
             <div className="px-4 py-2 bg-[#A51E22] text-white font-semibold rounded-full shadow-lg flex items-center text-sm">
               <AlertTriangle className="w-4 h-4 mr-2" />
               Deadlines Hidden in Text
             </div>
           </div>
         </div>
         
         <div className="space-y-8">
           <div className="flex items-start">
             <div className="w-12 h-12 rounded-full bg-[#12355B]/10 flex items-center justify-center shrink-0 mr-4">
               <FileSearch className="w-6 h-6 text-[#12355B]" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1F2937] mb-2">Massive Manual Reading</h3>
               <p className="text-[#1F2937]/70">Officials spend hours reading 100+ page verdicts to extract a single 2-line directive.</p>
             </div>
           </div>
           <div className="flex items-start">
             <div className="w-12 h-12 rounded-full bg-[#A51E22]/10 flex items-center justify-center shrink-0 mr-4">
               <AlertTriangle className="w-6 h-6 text-[#A51E22]" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1F2937] mb-2">Missed Compliance</h3>
               <p className="text-[#1F2937]/70">Hidden deadines lead to Contempt of Court cases against government officials.</p>
             </div>
           </div>
           <div className="flex items-start">
             <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mr-4">
               <Activity className="w-6 h-6 text-orange-600" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-[#1F2937] mb-2">Administrative Bottleneck</h3>
               <p className="text-[#1F2937]/70">Decision-making is delayed entirely due to the slow extraction of actionable information.</p>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
}

function Slide3() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">A Serious Governance Issue</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="flex justify-between items-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="text-center w-1/4">
          <div className="text-5xl font-bold text-[#A51E22] mb-2">40%</div>
          <p className="text-sm font-medium text-slate-600">Of legal operational time<br/>spent reading unstructured text</p>
        </div>
        <div className="w-px h-24 bg-slate-200"></div>
        <div className="text-center w-1/4">
          <div className="text-5xl font-bold text-[#12355B] mb-2">1,000+</div>
          <p className="text-sm font-medium text-slate-600">New judgments monthly<br/>in Karnataka alone</p>
        </div>
        <div className="w-px h-24 bg-slate-200"></div>
        <div className="text-center w-1/4">
          <div className="text-5xl font-bold text-orange-500 mb-2">High</div>
          <p className="text-sm font-medium text-slate-600">Risk of contempt due to<br/>missed administrative deadlines</p>
        </div>
      </div>
      
      <div className="mt-12 bg-white rounded-xl shadow-inner border border-slate-200 p-8">
        <h3 className="text-lg font-bold text-[#1F2937] mb-6 text-center">The Current Consequence Chain</h3>
        <div className="flex items-center justify-between">
          <div className="bg-slate-100 px-6 py-4 rounded-lg text-center flex-1">
            <span className="font-semibold text-slate-700">Complex PDF Judgment</span>
          </div>
          <ArrowRight className="text-slate-400 mx-4 w-6 h-6" />
          <div className="bg-slate-100 px-6 py-4 rounded-lg text-center flex-1">
            <span className="font-semibold text-slate-700">Delayed Routing</span>
          </div>
          <ArrowRight className="text-slate-400 mx-4 w-6 h-6" />
          <div className="bg-slate-100 px-6 py-4 rounded-lg text-center flex-1 border border-[#A51E22]/30">
            <span className="font-semibold text-[#A51E22]">Missed Deadline</span>
          </div>
          <ArrowRight className="text-slate-400 mx-4 w-6 h-6" />
          <div className="bg-[#A51E22] px-6 py-4 rounded-lg text-center flex-1 shadow-lg">
            <span className="font-bold text-white">Contempt of Court</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide4() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Transforming Judgments into<br/>Verified Government Action Plans.</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow border-t-4 border-[#12355B]">
          <BrainCircuit className="w-12 h-12 text-[#12355B] mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-3">AI-Powered Extraction</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Automatically reads scanned and digital PDFs using specialized Legal LLMs to pinpoint directives, deadlines, and parties instantly.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow border-t-4 border-[#A51E22]">
          <ShieldCheck className="w-12 h-12 text-[#A51E22] mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-3">Source-Grounded Explainability</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every extracted data point links directly back to the original PDF line with highlight overlays. Black-box AI is eliminated.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow border-t-4 border-[#12355B]">
          <Users className="w-12 h-12 text-[#12355B] mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-3">Human-in-the-Loop</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Generates a structured action plan that an authorized department officer verifies, modifies, and approves before it becomes official.
          </p>
        </div>
      </div>
      
      <div className="text-center mt-12 bg-[#12355B]/5 p-6 rounded-lg border border-[#12355B]/10">
        <p className="text-xl font-semibold text-[#12355B]">AI Assists. Government Officers Decide.</p>
      </div>
    </div>
  );
}

function Slide5() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">The Complete AI Workflow</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
        
        {[
          { icon: FileSearch, title: "1. Ingest & OCR", desc: "Upload PDF & structure text", color: "bg-[#12355B]" },
          { icon: BrainCircuit, title: "2. Deep Extraction", desc: "Gemini 2.5 Pro reasoning", color: "bg-[#A51E22]" },
          { icon: MousePointerClick, title: "3. Action Gen", desc: "Routing & timelines created", color: "bg-[#12355B]" },
          { icon: ShieldCheck, title: "4. Human Verify", desc: "Officer approves workflow", color: "bg-[#A51E22]" },
          { icon: Activity, title: "5. Dispatch", desc: "Tracked in CCMS dashboard", color: "bg-green-700" },
        ].map((step, i) => (
          <div key={i} className="flex flex-col items-center w-48 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
            <div className={`w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center mb-4 shadow-md`}>
              <step.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1 text-center text-sm">{step.title}</h4>
            <p className="text-xs text-slate-500 text-center">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide6() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Intelligent Extraction Engine</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-8 rounded-full"></div>
      
      <div className="flex gap-8 items-stretch">
        <div className="w-1/3 bg-[#12355B] text-white p-8 rounded-xl shadow-xl">
          <h3 className="text-xl font-bold mb-6">Pipeline Layers</h3>
          <ul className="space-y-6">
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">LayoutLMv3</p>
                <p className="text-white/70 text-sm">Spatial document understanding</p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">InLegalBERT</p>
                <p className="text-white/70 text-sm">Indian legal entity recognition</p>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gemini 2.5 Pro</p>
                <p className="text-white/70 text-sm">Structured JSON extraction & reasoning</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="flex-1 bg-white p-8 rounded-xl shadow border border-slate-200">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800">Source-Grounded Extraction Output</h3>
             <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded text-xs uppercase tracking-wide">Explainable</span>
           </div>
           
           <div className="space-y-4 font-mono text-sm">
             <div className="p-3 bg-slate-50 border border-slate-100 rounded flex justify-between">
               <span className="text-[#12355B] font-bold">"case_number"</span>
               <span className="text-slate-600">"WP/10452/2025"</span>
               <span className="text-green-600">99%</span>
             </div>
             <div className="p-3 bg-slate-50 border border-slate-100 rounded flex justify-between">
               <span className="text-[#12355B] font-bold">"responsible_department"</span>
               <span className="text-slate-600">"Revenue Department"</span>
               <span className="text-green-600">95%</span>
             </div>
             <div className="p-3 bg-orange-50 border border-orange-200 rounded flex justify-between">
               <span className="text-[#A51E22] font-bold">"deadline_days"</span>
               <span className="text-slate-600">60</span>
               <span className="text-orange-600 font-bold text-xs">AMBIGUOUS (72%)</span>
             </div>
             
             <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg text-xs font-sans">
               <p className="font-bold text-blue-800 mb-1">Source Trace:</p>
               <p className="italic text-slate-700">"The Revenue Department shall clear the pending file within 60 days, barring unforeseen administrative delays." (Page 14)</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Slide7() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-[#12355B] mb-2">Action Plan Generation</h2>
          <div className="w-16 h-1 bg-[#A51E22] rounded-full"></div>
        </div>
        <div className="bg-[#A51E22] text-white px-4 py-2 rounded font-bold text-sm">
          Core Engine
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 flex gap-8">
        <div className="w-1/2 space-y-6">
          <h3 className="text-2xl font-bold text-slate-800">Transforming "Information" into "Governance Operation"</h3>
          <p className="text-slate-600">The platform automatically translates complex directives into actionable departmental tasks.</p>
          
          <ul className="space-y-4 mt-8">
            <li className="flex items-center text-slate-700 bg-slate-50 p-3 rounded border border-slate-100"><CheckCircle2 className="text-green-600 mr-3"/> Department Routing Inference</li>
            <li className="flex items-center text-slate-700 bg-slate-50 p-3 rounded border border-slate-100"><CheckCircle2 className="text-green-600 mr-3"/> Automated Task Summarization</li>
            <li className="flex items-center text-slate-700 bg-slate-50 p-3 rounded border border-slate-100"><CheckCircle2 className="text-green-600 mr-3"/> Urgency Detection Matrix</li>
          </ul>
        </div>
        
        <div className="w-1/2">
          {/* Card Mock */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#12355B] p-4 text-white">
              <div className="flex justify-between items-center">
                <span className="font-bold">Generated Action Plan</span>
                <span className="text-xs bg-red-500 px-2 py-1 rounded font-bold">URGENT</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Target Department</p>
                <p className="font-bold text-slate-800 text-lg flex items-center"><Building className="w-5 h-5 mr-2 text-slate-400"/> BBMP Town Planning</p>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-800 font-bold uppercase tracking-wider mb-1">Appeal Limitation Deadline</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-[#A51E22]">12</span>
                  <span className="font-bold text-slate-700">Days Remaining</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Countdown expires on: 26 May 2026</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-white border border-slate-300 rounded py-2 text-sm font-bold text-slate-600">Reject</button>
                <button className="flex-1 bg-[#12355B] rounded py-2 text-sm font-bold text-white">Approve Flow</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide8() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Human-in-the-Loop Verification</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-4 rounded-full"></div>
      <h3 className="text-2xl font-semibold text-[#A51E22] mb-8">AI Assists. Government Officers Decide.</h3>
      
      <div className="border border-slate-200 rounded-xl shadow-lg bg-white overflow-hidden flex h-96">
        {/* Left: Fake PDF */}
        <div className="w-1/2 bg-neutral-100 border-r border-slate-200 p-8 overflow-hidden relative">
          <div className="bg-white shadow h-full w-full p-8 font-serif text-[10px] leading-relaxed text-slate-400 relative">
            <h1 className="text-lg text-black text-center font-bold mb-4">ORDER</h1>
            <p>1. The petitioner has approached this court seeking a writ of mandamus.</p>
            <p className="mt-2 text-black bg-yellow-200/50 outline outline-2 outline-yellow-400">2. Having heard the parties, we direct the Transport Department to issue the NOC within 30 days from the date of receipt of this order.</p>
            <p className="mt-2">3. The writ petition is disposed of accordingly.</p>
            
            {/* Highlight Box Overlay */}
            <div className="absolute top-1/2 left-4 right-4 bg-white shadow-xl border border-blue-200 p-4 rounded-lg flex items-start z-10 animate-bounce">
              <MousePointerClick className="w-6 h-6 text-blue-500 mr-3 shrink-0" />
              <div>
                <p className="font-bold text-blue-900 text-sm">Reviewer clicks extracted field.</p>
                <p className="text-xs text-slate-600 mt-1">The system instantly scrolls to Page 12 and highlights the exact legal phrase confirming the AI's extraction.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Verification Area */}
        <div className="w-1/2 bg-slate-50 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <h4 className="font-bold text-slate-800">Extraction Verification</h4>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-mono">Reviewing Officer View</span>
          </div>
          
          <div className="space-y-4 flex-1">
             <div className="bg-white p-3 rounded border border-slate-200 border-l-4 border-l-green-500 shadow-sm cursor-pointer hover:bg-slate-50">
               <p className="text-xs text-slate-500 font-bold mb-1">Extracted Directive</p>
               <p className="text-sm font-medium text-slate-800">"Issue NOC within 30 days"</p>
             </div>
             
             <div className="bg-slate-200/50 p-4 rounded-lg">
               <p className="text-sm font-bold text-slate-700 mb-2">Officer Action Details</p>
               <div className="flex items-center space-x-2">
                 <button className="flex-1 bg-green-600 text-white font-bold py-2 rounded text-sm hover:bg-green-700">Approve & Dispatch</button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide9() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Trusted Government Dashboard</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-8 rounded-full"></div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-orange-400">
          <p className="text-slate-500 text-sm font-bold">Pending Review</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">14</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-[#12355B]">
          <p className="text-slate-500 text-sm font-bold">Active Appeals</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">6</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-[#A51E22]">
          <p className="text-slate-500 text-sm font-bold">Overdue Compliance</p>
          <p className="text-4xl font-bold text-[#A51E22] mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-green-600">
          <p className="text-slate-500 text-sm font-bold">Resolved Workflows</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">142</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">High-Priority Directives</h3>
          <button className="text-sm text-[#12355B] font-semibold">View All</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
            <tr>
              <th className="py-3 px-4">Case Number</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Appeal Timeline</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-4 px-4 font-bold text-[#12355B]">WP-10452/2026</td>
              <td className="py-4 px-4 text-slate-700">Revenue Dept</td>
              <td className="py-4 px-4 text-[#A51E22] font-semibold">12 Days Rem.</td>
              <td className="py-4 px-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Awaiting Dept</span></td>
            </tr>
            <tr>
              <td className="py-4 px-4 font-bold text-[#12355B]">WA-88/2026</td>
              <td className="py-4 px-4 text-slate-700">BBMP</td>
              <td className="py-4 px-4 text-slate-600 font-semibold">45 Days Rem.</td>
              <td className="py-4 px-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Pending Review</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Slide10() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Multi-Agent AI Architecture</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="flex items-center justify-center space-x-4 h-64 relative bg-slate-50 border border-slate-200 rounded-xl p-8">
         {/* Agents */}
         <div className="flex flex-col space-y-4 z-10 w-1/4">
            <div className="bg-white p-3 rounded shadow border-l-4 border-l-blue-500 font-bold text-sm flex items-center justify-between">OCR Agent <CheckCircle2 className="w-4 h-4 text-green-500"/></div>
            <div className="bg-white p-3 rounded shadow border-l-4 border-l-blue-500 font-bold text-sm flex items-center justify-between">Structure Agent <CheckCircle2 className="w-4 h-4 text-green-500"/></div>
            <div className="bg-white p-3 rounded shadow border-l-4 border-l-blue-500 font-bold text-sm flex items-center justify-between">Extraction Agent <CheckCircle2 className="w-4 h-4 text-green-500"/></div>
         </div>
         
         <ArrowRight className="w-8 h-8 text-slate-400 z-10" />
         
         <div className="flex flex-col justify-center bg-[#12355B] text-white p-6 rounded-xl shadow-lg z-10 w-1/3 min-h-full">
            <ShieldCheck className="w-10 h-10 mb-4 opacity-80" />
            <h3 className="font-bold text-xl mb-2">Orchestration Layer</h3>
            <p className="text-sm text-white/70">LangChain handles agent messaging, cross-checks, and builds the unified JSON state.</p>
         </div>
         
         <ArrowRight className="w-8 h-8 text-slate-400 z-10" />

         <div className="flex flex-col space-y-4 z-10 w-1/4">
            <div className="bg-white p-3 rounded shadow border-l-4 border-l-[#A51E22] font-bold text-sm flex items-center justify-between">Action Plan Agent <BrainCircuit className="w-4 h-4 text-slate-500"/></div>
            <div className="bg-white p-3 rounded shadow border-l-4 border-l-[#A51E22] font-bold text-sm flex items-center justify-between">Routing Agent <Users className="w-4 h-4 text-slate-500"/></div>
            <div className="bg-white p-3 rounded shadow border-l-4 border-l-[#A51E22] font-bold text-sm flex items-center justify-between">Verification Agent <Lock className="w-4 h-4 text-slate-500"/></div>
         </div>
         
         {/* Background connecting lines */}
         <div className="absolute top-1/2 left-0 w-full h-px bg-slate-300 border-dashed border-t"></div>
      </div>
    </div>
  );
}

function Slide11() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Why JusticeTrack is Different</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-[#12355B] text-white">
            <tr>
              <th className="py-4 px-6 font-semibold w-1/3">Feature</th>
              <th className="py-4 px-6 font-semibold w-1/3 border-x border-white/20">Generic Legal Chatbots</th>
              <th className="py-4 px-6 font-bold w-1/3 bg-[#0d2745]">JusticeTrack Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="py-4 px-6 font-medium text-slate-800">Source Explainability</td>
              <td className="py-4 px-6 text-slate-500"><X className="w-5 h-5 text-red-400 inline mr-2"/> "Black box" answers</td>
              <td className="py-4 px-6 font-semibold text-[#12355B]"><CheckCircle2 className="w-5 h-5 text-green-500 inline mr-2"/> Highlight overlays in PDF</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-800">Operational Alignment</td>
              <td className="py-4 px-6 text-slate-500"><X className="w-5 h-5 text-red-400 inline mr-2"/> Generates conversational text</td>
              <td className="py-4 px-6 font-semibold text-[#12355B]"><CheckCircle2 className="w-5 h-5 text-green-500 inline mr-2"/> Generates state action tasks</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-800">Verification Requirement</td>
              <td className="py-4 px-6 text-slate-500"><X className="w-5 h-5 text-red-400 inline mr-2"/> Takes action automatically</td>
              <td className="py-4 px-6 font-semibold text-[#12355B]"><CheckCircle2 className="w-5 h-5 text-green-500 inline mr-2"/> Strict Human-in-Loop approval</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-800">Appeal Intelligence</td>
              <td className="py-4 px-6 text-slate-500"><X className="w-5 h-5 text-red-400 inline mr-2"/> Ignored</td>
              <td className="py-4 px-6 font-semibold text-[#12355B]"><CheckCircle2 className="w-5 h-5 text-green-500 inline mr-2"/> Automated deadline countdowns</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium text-slate-800">CCMS Readiness</td>
              <td className="py-4 px-6 text-slate-500"><X className="w-5 h-5 text-red-400 inline mr-2"/> Standalone app</td>
              <td className="py-4 px-6 font-semibold text-[#12355B]"><CheckCircle2 className="w-5 h-5 text-green-500 inline mr-2"/> Exportable JSON APIs</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Slide12() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Enterprise Security & Trust</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="grid grid-cols-2 gap-12">
         <div className="space-y-6">
           <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-slate-200">
             <div className="p-3 bg-blue-100 rounded-lg text-blue-700 mr-4"><Lock className="w-6 h-6"/></div>
             <div>
               <h4 className="font-bold text-slate-800">Role-Based Access Control</h4>
               <p className="text-sm text-slate-600 mt-1">Super Admin, Dept Admin, Reviewer roles via JWT tokenization.</p>
             </div>
           </div>
           <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-slate-200">
             <div className="p-3 bg-red-100 rounded-lg text-red-700 mr-4"><FileSearch className="w-6 h-6"/></div>
             <div>
               <h4 className="font-bold text-slate-800">Immutable Audit Logs</h4>
               <p className="text-sm text-slate-600 mt-1">Every verification, edit, and click is logged with Officer IDs and timestamps.</p>
             </div>
           </div>
           <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-slate-200">
             <div className="p-3 bg-green-100 rounded-lg text-green-700 mr-4"><ShieldCheck className="w-6 h-6"/></div>
             <div>
               <h4 className="font-bold text-slate-800">Cloud & Data Sovereignity</h4>
               <p className="text-sm text-slate-600 mt-1">Deployable entirely within authorized Government cloud environments.</p>
             </div>
           </div>
         </div>
         
         <div className="bg-[#1F2937] text-white rounded-xl p-8 font-mono text-sm shadow-2xl relative overflow-hidden">
            <p className="text-slate-400 mb-4">// System Audit Trail Output</p>
            <p className="text-green-400">{'['}2026-05-07 10:24:12{']'} <span className="text-blue-300">USER_AUTH</span>: token_validated (ID: GovKa-901)</p>
            <p className="text-green-400">{'['}2026-05-07 10:25:01{']'} <span className="text-purple-300">CASE_VIEW</span>: WP-10452/2026 accessed</p>
            <p className="text-yellow-400">{'['}2026-05-07 10:27:14{']'} <span className="text-orange-300">CONF_OVERRIDE</span>: extraction_field 'deadline' modified by GovKa-901</p>
            <p className="text-green-400">{'['}2026-05-07 10:28:11{']'} <span className="text-blue-300">WORKFLOW_APR</span>: case_approved, dispatched to Revenue Dept</p>
            
            <div className="absolute bottom-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">Tamper-Proof</div>
         </div>
      </div>
    </div>
  );
}

function Slide13() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Real-World Operational Impact</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-center font-bold text-xl text-slate-800 mb-8 w-full border-b pb-4">Workflow Comparison: 100-Page Judgment Resolution</h3>
        
        <div className="flex">
          {/* Before */}
          <div className="w-1/2 pr-8 border-r border-slate-200 relative">
            <h4 className="font-bold text-[#A51E22] text-xl mb-6 text-center">Current Process</h4>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded border border-slate-200 flex justify-between"><span>Manual Reading</span> <span className="font-bold text-slate-600">3-5 Days</span></div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 flex justify-between"><span>Identify Dept.</span> <span className="font-bold text-slate-600">2 Days</span></div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 flex justify-between"><span>Determine Appeal Window</span> <span className="font-bold text-[#A51E22]">High Error Risk</span></div>
            </div>
            <div className="mt-6 text-center border-t border-slate-200 pt-4">
              <span className="text-sm font-bold text-slate-500">Average Turnaround: </span>
              <span className="text-2xl font-bold text-[#A51E22] ml-2">7+ Days</span>
            </div>
          </div>
          
          {/* After */}
          <div className="w-1/2 pl-8 font-bold">
            <h4 className="font-bold text-[#12355B] text-xl mb-6 text-center">JusticeTrack Process</h4>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded border border-blue-200 flex justify-between"><span>AI Extraction & Routing</span> <span className="font-bold text-blue-700">14 Seconds</span></div>
              <div className="bg-blue-50 p-4 rounded border border-blue-200 flex justify-between"><span>Human Verification</span> <span className="font-bold text-blue-700">10 Minutes</span></div>
              <div className="bg-blue-50 p-4 rounded border border-blue-200 flex justify-between"><span>Appeal Clock Initiated</span> <span className="font-bold text-green-600">Immediate</span></div>
            </div>
            <div className="mt-6 text-center border-t border-slate-200 pt-4">
              <span className="text-sm font-bold text-slate-500">Average Turnaround: </span>
              <span className="text-2xl font-bold text-[#12355B] ml-2">&lt; 15 Mins</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide14() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col justify-center">
      <h2 className="text-4xl font-bold text-[#12355B] mb-2">Scalability & Future Roadmap</h2>
      <div className="w-16 h-1 bg-[#A51E22] mb-12 rounded-full"></div>
      
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#12355B]/10 -translate-y-1/2 z-0"></div>
        
        <div className="grid grid-cols-4 gap-6 relative z-10">
           <div className="bg-white border-2 border-[#12355B] p-6 rounded-xl shadow-lg relative">
             <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#12355B] text-white flex items-center justify-center font-bold">1</div>
             <h4 className="font-bold text-slate-800 mb-2">Pilot Deployment</h4>
             <p className="text-sm text-slate-600">Deployment within singular department (e.g., Revenue) with 100 historical cases for A/B testing.</p>
           </div>
           
           <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative pt-12">
             <div className="absolute top-4 left-4 font-bold text-slate-400">Phase 2</div>
             <h4 className="font-bold text-slate-800 mb-2">District Integration</h4>
             <p className="text-sm text-slate-600">Expanding intake pipeline to lower court rulings affecting state departments.</p>
           </div>
           
           <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative pt-12">
             <div className="absolute top-4 left-4 font-bold text-slate-400">Phase 3</div>
             <h4 className="font-bold text-slate-800 mb-2">Multilingual Processing</h4>
             <p className="text-sm text-slate-600">Native Kannada OCR and translation engine integration for localized orders.</p>
           </div>
           
           <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative pt-12">
             <div className="absolute top-4 left-4 font-bold text-slate-400">Phase 4</div>
             <h4 className="font-bold text-slate-800 mb-2">CCMS Unification</h4>
             <p className="text-sm text-slate-600">Direct API integration into the unified Court Case Monitoring System database.</p>
           </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-[#12355B] font-semibold">
        A future-ready platform built on modular principles.
      </div>
    </div>
  );
}

function Slide15() {
  return (
    <div className="w-full max-w-6xl h-full flex flex-col items-center justify-center text-center">
      <Layers className="w-24 h-24 text-[#A51E22] mb-8" />
      <h2 className="text-5xl font-bold text-[#12355B] mb-6">Live System Preview</h2>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
        See the real dashboard, upload processing, and verification workspace in action.
      </p>
      <button 
        className="px-8 py-4 bg-[#12355B] hover:bg-[#0d2745] text-white font-bold rounded-lg shadow-lg text-lg flex items-center transition"
        onClick={() => window.open('/', '_blank')}
      >
        <Play className="w-6 h-6 mr-3" />
        Exit to Application Demo
      </button>
    </div>
  );
}

function Slide16() {
  return (
    <div className="flex flex-col items-center text-center w-full max-w-4xl h-full justify-center">
       <div className="mb-8">
         <Scale className="w-24 h-24 mx-auto text-[#12355B]" />
       </div>
       <p className="text-4xl leading-relaxed text-[#1F2937] font-serif italic mb-12">
         "India’s courts issue thousands of orders daily. JusticeTrack ensures they are actually implemented."
       </p>
       
       <h1 className="text-4xl font-bold tracking-tight text-[#12355B] mb-2">
         Thank You.
       </h1>
       <p className="text-[#A51E22] font-bold text-xl mb-12">Open for Q&A</p>
       
       <div className="text-sm font-medium text-[#1F2937]/50 border-t border-black/10 pt-8 w-full max-w-md">
         Karnataka Government Hackathon Evaluation
       </div>
    </div>
  );
}
