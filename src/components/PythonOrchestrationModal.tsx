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
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { PYTHON_FASTAPI_BACKEND_CODE } from '../data/mockData';

const MANGA_TASKS_PYTHON_CODE = `import os
import requests
import json
from celery import Celery
from PIL import Image, ImageDraw, ImageFont

# Initialize your Redis-free RabbitMQ task distributor
celery_app = Celery("manga_tasks", broker=os.getenv("RABBITMQ_URL"))

SILICONFLOW_API_URL = "https://siliconflow.cn"

@celery_app.task
def generate_manga_panel(panel_prompt: str, char_sheet_url: str, bg_layout_url: str, speech_text: str, output_path: str):
    """
    Utilizes Qwen-Image-Edit via SiliconFlow's prepaid gateway to blend a
    consistent character sheet into an established environment backdrop frame,
    then automatically overlays clean vector speech bubbles locally.
    """
    headers = {
        "Authorization": f"Bearer {os.getenv('SILICONFLOW_API_KEY')}",
        "Content-Type": "application/json"
    }
    # 1. Dispatch multi-reference payload to protect character identity
    payload = {
        "model": "Qwen/Qwen-Image-Edit",
        "prompt": f"Black and white manga illustration style, clean line art, screentone shading. Action: {panel_prompt}",
        "image": bg_layout_url, # Base background layout anchor
        "reference_image": char_sheet_url, # Immutable character turnaround anchor
        "num_inference_steps": 25,
        "cfg": 5.0
    }
    response = requests.post(SILICONFLOW_API_URL, json=payload, headers=headers).json()
    generated_img_url = response['images'][0]['url']
    
    # 2. Download the completed panel fragment image to local Hostinger cache
    img_data = requests.get(generated_img_url).content
    local_temp_img = "temp_panel.png"
    with open(local_temp_img, "wb") as f:
        f.write(img_data)
        
    # 3. Vector Speech Bubble Overlay via Pillow (PIL)
    # Fully avoids AI text hallucination by processing typography locally
    img = Image.open(local_temp_img)
    draw = ImageDraw.Draw(img)
    # Define coordinate positions for the bubble placement
    bubble_box = [50, 50, 350, 180]
    # Draw clean white dialogue container background with a crisp black boundary line
    draw.ellipse(bubble_box, fill="white", outline="black", width=3)
    # Overlay the script dialogue string fetched from the DeepSeek script
    font = ImageFont.load_default() # Swap out for a proper comic .ttf font file in production
    draw.text((80, 90), speech_text, fill="black", font=font)
    
    # Save the polished, consistent, text-perfect panel straight to your Garage storage container
    img.save(output_path)
    os.remove(local_temp_img)
    return {"status": "SUCCESS", "saved_panel_path": output_path}
`;

interface PythonOrchestrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonOrchestrationModal: React.FC<PythonOrchestrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');

  if (!isOpen) return null;

  const currentCode = activeTab === 'anime' ? PYTHON_FASTAPI_BACKEND_CODE : MANGA_TASKS_PYTHON_CODE;
  const currentFileName = activeTab === 'anime' ? 'animestudio_orchestration_backend.py' : 'manga_tasks.py';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
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
                FastAPI • Celery • RabbitMQ • Seedance 2.5 Volcano SDK • Pillow Overlays • SiliconFlow Qwen-Image-Edit
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

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          <button
            onClick={() => setActiveTab('anime')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'anime'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Anime Video Engine (FastAPI & Celery)</span>
          </button>

          <button
            onClick={() => setActiveTab('manga')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'manga'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Manga Studio Engine (manga_tasks.py)</span>
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
            <span>•</span>
            <span className="font-mono text-slate-300 font-bold text-amber-400">{currentFileName}</span>
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
            <pre>{currentCode}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};
