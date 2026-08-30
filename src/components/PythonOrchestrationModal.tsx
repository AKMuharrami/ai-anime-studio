import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Cpu, 
  Server, 
  Layers, 
  FileCode, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { PYTHON_FASTAPI_BACKEND_CODE } from '../data/mockData';

interface PythonOrchestrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonOrchestrationModal: React.FC<PythonOrchestrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_FASTAPI_BACKEND_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_FASTAPI_BACKEND_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animestudio_orchestration_backend.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-['Cinzel',serif]">
                Python FastAPI & Celery Orchestration Blueprint
              </h2>
              <p className="text-xs text-slate-400">
                FastAPI • Celery • RabbitMQ • Seedance 2.5 Volcano SDK • FFmpeg Batch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-950/30 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> Production Ready
            </span>
            <span>•</span>
            <span className="font-mono text-slate-300">python-version &gt;= 3.11</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Code' : 'Copy Python Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm shadow-amber-600/30 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-200/90 overflow-x-auto leading-relaxed shadow-inner">
            <pre>{PYTHON_FASTAPI_BACKEND_CODE}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};
