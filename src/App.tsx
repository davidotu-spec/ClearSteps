/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  Target, 
  ShieldCheck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

interface Step {
  id: string;
  title: string;
  description: string;
  verificationCriteria: string;
  isCompleted: boolean;
  criticality: 'low' | 'medium' | 'high';
}

interface Checklist {
  id: string;
  goal: string;
  steps: Step[];
  createdAt: number;
}

// --- AI Service ---

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const generateChecklist = async (goal: string): Promise<Step[]> => {
  const prompt = `Generate a high-precision, error-proof checklist for the following goal: "${goal}". 
  The goal is to ensure NO MISTAKES are made. 
  For each step, provide:
  1. A clear title.
  2. A brief description of the action.
  3. SPECIFIC verification criteria (how to prove this step was done correctly).
  4. Criticality level (low, medium, high).
  
  Return the response as a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            verificationCriteria: { type: Type.STRING },
            criticality: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
          },
          required: ['title', 'description', 'verificationCriteria', 'criticality']
        }
      }
    }
  });

  const data = JSON.parse(response.text || '[]');
  return data.map((s: any, index: number) => ({
    ...s,
    id: `step-${Date.now()}-${index}`,
    isCompleted: false
  }));
};

// --- Components ---

export default function App() {
  const [goal, setGoal] = useState('');
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const steps = await generateChecklist(goal);
      setChecklist({
        id: `checklist-${Date.now()}`,
        goal,
        steps,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate checklist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (stepId: string) => {
    if (!checklist) return;
    setChecklist({
      ...checklist,
      steps: checklist.steps.map(s => 
        s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
      )
    });
  };

  const reset = () => {
    setChecklist(null);
    setGoal('');
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-bottom border-[#141414] p-6 flex justify-between items-center bg-[#E4E3E0] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">ClearStep</h1>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">
          Precision Task Navigator // v1.0.0
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {!checklist ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                  ELIMINATE <br />
                  <span className="italic font-serif font-light text-6xl md:text-8xl">Human Error.</span>
                </h2>
                <p className="text-lg opacity-70 max-w-xl">
                  Enter a complex goal. Our AI generates a precision-engineered checklist with verification criteria to ensure zero mistakes.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="relative group">
                <input 
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., Deploy a production database migration"
                  className="w-full bg-transparent border-b-2 border-[#141414] py-4 text-2xl md:text-3xl focus:outline-none placeholder:opacity-20 transition-all"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !goal.trim()}
                  className="absolute right-0 bottom-4 p-2 hover:translate-x-1 transition-transform disabled:opacity-30"
                >
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ArrowRight className="w-8 h-8" />}
                </button>
              </form>

              {error && (
                <div className="flex items-center gap-2 text-red-600 font-mono text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-[#141414]/10">
                {[
                  { title: 'Zero Mistakes', desc: 'Step-by-step verification logic.' },
                  { title: 'AI Powered', desc: 'Gemini 3 Flash for expert guidance.' },
                  { title: 'MVP Ready', desc: 'Focus on core utility and precision.' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">0{i+1}</div>
                    <div className="font-bold uppercase text-sm">{item.title}</div>
                    <div className="text-xs opacity-60">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="checklist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414] pb-8">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Active Protocol</div>
                  <h2 className="text-4xl font-bold tracking-tighter uppercase">{checklist.goal}</h2>
                </div>
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest hover:opacity-50 transition-opacity"
                >
                  <RefreshCw className="w-3 h-3" /> New Goal
                </button>
              </div>

              <div className="space-y-px border border-[#141414] bg-[#141414]">
                {checklist.steps.map((step, index) => (
                  <div 
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={`group relative flex flex-col md:flex-row gap-6 p-6 transition-all cursor-pointer ${
                      step.isCompleted ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-[#E4E3E0] hover:bg-[#D4D3D0]'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {step.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] opacity-50">{(index + 1).toString().padStart(2, '0')}</span>
                          <h3 className={`text-xl font-bold uppercase tracking-tight ${step.isCompleted ? 'line-through opacity-50' : ''}`}>
                            {step.title}
                          </h3>
                          {step.criticality === 'high' && !step.isCompleted && (
                            <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 font-mono uppercase tracking-tighter">Critical</span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${step.isCompleted ? 'opacity-30' : 'opacity-70'}`}>
                          {step.description}
                        </p>
                        
                        {!step.isCompleted && (
                          <div className="mt-4 p-4 border border-[#141414]/10 bg-[#141414]/5 space-y-2">
                            <div className="text-[9px] font-mono uppercase tracking-widest opacity-50 flex items-center gap-1">
                              <Target className="w-3 h-3" /> Verification Criteria
                            </div>
                            <p className="text-xs font-mono italic">
                              {step.verificationCriteria}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-[#141414]/10">
                <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">
                  Progress: {checklist.steps.filter(s => s.isCompleted).length} / {checklist.steps.length} Verified
                </div>
                {checklist.steps.every(s => s.isCompleted) && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 text-green-600 font-bold uppercase text-xs tracking-widest"
                  >
                    <ShieldCheck className="w-4 h-4" /> Protocol Complete
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full p-4 pointer-events-none opacity-20">
        <div className="flex justify-between items-end">
          <div className="text-[8px] font-mono uppercase vertical-rl rotate-180">System.Status: Nominal</div>
          <div className="text-[8px] font-mono uppercase">© 2026 ClearStep Precision Systems</div>
        </div>
      </footer>
    </div>
  );
}
