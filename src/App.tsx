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
  ArrowRight,
  Briefcase,
  Rocket,
  Stethoscope,
  Terminal
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

  const [sampleSteps, setSampleSteps] = useState([true, true, false]);
  const [heroSteps, setHeroSteps] = useState(['completed', 'active', 'pending']);

  const toggleSampleStep = (idx: number) => {
    const newSteps = [...sampleSteps];
    newSteps[idx] = !newSteps[idx];
    setSampleSteps(newSteps);
  };

  const toggleHeroStep = (idx: number) => {
    const newSteps = [...heroSteps];
    if (newSteps[idx] === 'completed') newSteps[idx] = 'pending';
    else if (newSteps[idx] === 'active') newSteps[idx] = 'completed';
    else newSteps[idx] = 'active';
    setHeroSteps(newSteps);
  };

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
    <div id="home" className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 p-4 md:p-6 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <a href="#home" className="flex items-center gap-3" aria-label="ClearStep Home">
          <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic font-serif text-white">ClearStep</h1>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest opacity-70" aria-label="Main Navigation">
          <a href="#home" className="hover:text-cyan-400 transition-colors">Home</a>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
          <a href="#use-cases" className="hover:text-cyan-400 transition-colors">Use Cases</a>
          <a href="#vision" className="hover:text-cyan-400 transition-colors">Vision</a>
          <a href="#demo" className="hover:text-cyan-400 transition-colors">Demo</a>
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
          <div className="h-4 w-px bg-slate-800"></div>
          <span className="text-cyan-400">v1.0.0 // Precision Engine</span>
        </nav>
      </header>

      <main className="relative">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {!checklist ? (
            <div className="space-y-16 md:space-y-32 pb-16 md:pb-32">
              {/* Hero Section */}
              <section id="demo" className="max-w-7xl mx-auto px-6 pt-16 md:pt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
                <motion.div 
                  key="hero-text"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 md:space-y-8"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                    </span>
                    AI-Powered Precision
                  </div>
                  
                  <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                    ELIMINATE <br />
                    <span className="text-cyan-400 italic font-serif font-light">Human Error.</span>
                  </h2>
                  
                  <p className="text-base md:text-xl text-slate-400 max-w-xl leading-relaxed">
                    Turn any complex goal into a precise, step‑by‑step checklist with built‑in verification logic. 
                    Designed for zero mistakes in high-stakes environments.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div id="goal-input-label" className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">Interactive Demo</div>
                    <form onSubmit={handleGenerate} className="relative max-w-lg group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
                      <div className="relative flex flex-col sm:flex-row bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                        <label htmlFor="goal-input" className="sr-only">Enter your goal</label>
                        <input 
                          id="goal-input"
                          type="text"
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder="Enter your goal..."
                          className="flex-1 bg-transparent px-6 py-4 md:py-5 text-lg md:text-xl focus:outline-none placeholder:text-slate-600 transition-all"
                          disabled={isLoading}
                          aria-labelledby="goal-input-label"
                        />
                        <button 
                          type="submit"
                          disabled={isLoading || !goal.trim()}
                          className="px-8 py-4 md:py-5 bg-cyan-400 text-slate-950 font-bold uppercase text-xs font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap border-t sm:border-t-0 sm:border-l border-slate-800 sm:border-transparent"
                          aria-label="Generate Checklist"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Generate Checklist
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      Enter a mission-critical objective to begin protocol generation.
                    </p>
                  </div>
                </motion.div>

                {/* Hero Mockup */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative hidden lg:block"
                >
                  <div className="absolute -inset-4 bg-cyan-400/5 rounded-3xl blur-3xl"></div>
                  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden aspect-[4/3]">
                    <div className="bg-slate-800/50 p-4 flex items-center gap-2 border-b border-slate-800">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="inline-block bg-slate-950 px-3 py-1 rounded text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                          Protocol: DB_MIGRATE_V2.sys
                        </div>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      {[
                        { title: 'Verify Backup Integrity', status: heroSteps[0] },
                        { title: 'Lock Write Operations', status: heroSteps[1] },
                        { title: 'Execute Schema Delta', status: heroSteps[2] }
                      ].map((step, i) => (
                        <div 
                          key={i} 
                          onClick={() => toggleHeroStep(i)}
                          className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                            step.status === 'completed' ? 'bg-slate-950/50 border-slate-800/50 opacity-50' :
                            step.status === 'active' ? 'bg-slate-950 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]' :
                            'bg-slate-950/30 border-slate-800/30'
                          }`}
                          role="button"
                          aria-label={`Toggle ${step.title} status`}
                        >
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-green-500 border-green-500' :
                            step.status === 'active' ? 'border-cyan-400' :
                            'border-slate-700'
                          }`}>
                            {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                            {step.status === 'active' && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-bold uppercase tracking-tight">{step.title}</div>
                            {step.status === 'active' && (
                              <div className="text-[9px] font-mono text-cyan-400/70 italic">
                                &gt; Verify: Run "pg_restore --list" on dump...
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Decorative Code */}
                    <div className="absolute bottom-4 right-4 text-[8px] font-mono text-slate-700 text-right leading-tight">
                      SYS_LOG: 0x4492A... <br />
                      VERIFY_ENGINE: ONLINE <br />
                      ERROR_PROBABILITY: 0.0001%
                    </div>
                  </div>
                </motion.div>
              </section>

              {/* Sample Output Section (Moved up for context) */}
              <section className="max-w-7xl mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                  <div className="p-1 bg-gradient-to-r from-slate-800 via-cyan-400/20 to-slate-800 rounded-3xl">
                    <div className="bg-slate-950 rounded-[22px] overflow-hidden">
                      <div className="p-4 md:p-6 bg-slate-900/50 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Sample Output: Database Migration</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">03 Steps Generated</div>
                      </div>
                      <div className="divide-y divide-slate-800">
                        {[
                          { 
                            title: 'Verify Backup Integrity', 
                            desc: 'Ensure the latest database snapshot is restorable.',
                            criteria: 'Run "pg_restore --list" on the latest dump and confirm exit code 0.'
                          },
                          { 
                            title: 'Lock Write Operations', 
                            desc: 'Prevent data drift during the migration window.',
                            criteria: 'Execute "SET TRANSACTION READ ONLY" and verify application logs for 403 errors.'
                          },
                          { 
                            title: 'Execute Schema Delta', 
                            desc: 'Apply the SQL migration script to the production instance.',
                            criteria: 'Query "information_schema.columns" to confirm new columns exist.'
                          }
                        ].map((step, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => toggleSampleStep(idx)}
                            className={`p-4 md:p-6 space-y-3 hover:bg-slate-900/30 transition-colors cursor-pointer ${sampleSteps[idx] ? 'opacity-50' : ''}`}
                            role="button"
                            aria-label={`Toggle sample step ${idx + 1}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sampleSteps[idx] ? 'bg-green-500 border-green-500' : 'border-slate-700'}`}>
                                {sampleSteps[idx] && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                              </div>
                              <div className="text-cyan-400 font-mono text-xs">0{idx+1}</div>
                              <h5 className={`font-bold uppercase text-sm tracking-tight ${sampleSteps[idx] ? 'line-through text-slate-500' : ''}`}>{step.title}</h5>
                            </div>
                            <p className="text-xs text-slate-500 ml-10 md:ml-12">{step.desc}</p>
                            <div className="ml-10 md:ml-12 p-4 bg-slate-900 border-l-2 border-cyan-400 text-[10px] font-mono italic text-cyan-400/80">
                              VERIFY: {step.criteria}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Feature Cards Section */}
              <section id="how-it-works" className="max-w-7xl mx-auto px-6 space-y-12 md:space-y-16">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Engineered for Reliability</h3>
                  <div className="h-1 w-20 bg-cyan-400 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {[
                    { 
                      title: 'Zero Mistakes', 
                      desc: "Every protocol includes mandatory 'Proof-of-Execution' criteria. Instead of a simple check, you verify against objective outputs—like specific log entries or system states—ensuring tasks are actually complete, not just marked.",
                      icon: <ShieldCheck className="w-6 h-6" />,
                      color: 'cyan'
                    },
                    { 
                      title: 'AI Powered', 
                      desc: "ClearStep utilizes Gemini 3 Flash for sub-second reasoning across 100+ domains. It identifies hidden dependencies and edge cases that humans often miss, generating context-aware protocols with expert-level technical accuracy.",
                      icon: <RefreshCw className="w-6 h-6" />,
                      color: 'blue'
                    },
                    { 
                      title: 'MVP Ready', 
                      desc: "The current core engine supports real-time generation and verification tracking. Coming soon: Team collaboration, PDF audit logs, and direct API hooks to verify system states automatically.",
                      icon: <Target className="w-6 h-6" />,
                      color: 'purple'
                    }
                  ].map((item, i) => (
                    <div key={i} className="group p-8 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-cyan-400/50 transition-all hover:-translate-y-1">
                      <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:border-cyan-400/30 group-hover:text-cyan-400 transition-all">
                        {item.icon}
                      </div>
                      <h4 className="text-xl font-bold uppercase mb-4 tracking-tight">{item.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Real Use Cases Section */}
              <section id="use-cases" className="max-w-7xl mx-auto px-6 space-y-16 py-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Mission Profiles</div>
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Real-World Protocols</h3>
                    <p className="text-slate-500 text-sm md:text-base max-w-xl">
                      From high-stakes engineering to career milestones, ClearStep provides the structure for success.
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-slate-800 hidden md:block mb-4"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[
                    {
                      title: "Prepare for a Job Interview",
                      desc: "Systematic preparation for senior-level technical or leadership roles.",
                      icon: <Briefcase />,
                      steps: ["Research company roadmap", "Prepare 3 STAR-method stories", "Verify technical environment"]
                    },
                    {
                      title: "Launch a Product",
                      desc: "Zero-error deployment protocol for software or physical products.",
                      icon: <Rocket />,
                      steps: ["Final QA sign-off", "Verify CDN propagation", "Enable monitoring alerts"]
                    },
                    {
                      title: "Plan a Medical Procedure",
                      desc: "Pre-operative checklists for patients and caregivers.",
                      icon: <Stethoscope />,
                      steps: ["Verify fasting window", "Confirm medication pause", "Arrange post-op transport"]
                    },
                    {
                      title: "Safety-Critical Task",
                      desc: "Industrial or technical protocols where error is not an option.",
                      icon: <AlertTriangle />,
                      steps: ["Lock-out/Tag-out verification", "PPE integrity check", "Secondary observer sync"]
                    }
                  ].map((useCase, i) => (
                    <div key={i} className="group relative bg-slate-900/30 border border-slate-800 rounded-2xl p-8 hover:bg-slate-900/50 transition-all">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-cyan-400/50 transition-colors">
                          {React.cloneElement(useCase.icon as React.ReactElement, { className: "w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" })}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xl font-bold uppercase tracking-tight">{useCase.title}</h4>
                            <p className="text-xs text-slate-500">{useCase.desc}</p>
                          </div>
                          <div className="space-y-2">
                            {useCase.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                                <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                                {step}
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => {
                              setGoal(useCase.title);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 hover:text-white transition-colors flex items-center gap-2 pt-2"
                          >
                            Try this protocol <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Feature Comparison Table */}
              <section className="max-w-7xl mx-auto px-6 space-y-8 py-8 md:py-16">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">System Specifications</div>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30 backdrop-blur-sm">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                          <th className="p-4 md:p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Feature</th>
                          <th className="p-4 md:p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">What It Means</th>
                          <th className="p-4 md:p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500">Why It Matters</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {[
                          { f: 'Zero Mistakes', m: 'Step-by-step verification logic', w: 'Ensures tasks are completed correctly' },
                          { f: 'Gemini 3 Flash', m: 'AI generates expert-level checklists', w: 'Saves time and reduces cognitive load' },
                          { f: 'MVP Ready', m: 'Core functionality available now', w: 'Users can try it immediately' }
                        ].map((row, i) => (
                          <tr key={i} className="group hover:bg-cyan-400/5 transition-colors">
                            <td className="p-4 md:p-6 font-bold uppercase text-xs tracking-tight text-cyan-400 group-hover:text-white transition-colors">{row.f}</td>
                            <td className="p-4 md:p-6 text-sm text-slate-400 leading-relaxed">{row.m}</td>
                            <td className="p-4 md:p-6 text-sm text-slate-300 leading-relaxed">{row.w}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
              {/* Trust & Credibility Section */}
              <section id="about" className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 py-16 md:py-24 border-t border-slate-800">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-tight">About ClearStep</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    ClearStep was born from a simple observation: most failures in complex systems aren't caused by lack of knowledge, but by a failure in execution. Our mission is to provide a "Mission Control" for every individual and team, turning high-stakes goals into bulletproof protocols.
                  </p>
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Data Integrity</div>
                    <p className="text-xs text-slate-400">
                      Your goals are processed in real-time by Gemini 3 Flash. We do not store your mission-critical data on our servers beyond the current session. Your protocols are yours to keep.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center border border-blue-400/20">
                      <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-tight">System Roadmap</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { v: 'v0.1.0', t: 'Core Engine Launch', s: 'Active', d: 'Real-time protocol generation and verification tracking.' },
                      { v: 'v0.2.0', t: 'Audit Export', s: 'Upcoming', d: 'Generate signed PDF audit logs for compliance and review.' },
                      { v: 'v0.3.0', t: 'Team Sync', s: 'In Development', d: 'Collaborative protocol execution with multi-user verification.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full ${item.s === 'Active' ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
                          {i !== 2 && <div className="w-px h-full bg-slate-800"></div>}
                        </div>
                        <div className="pb-4 space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[10px] font-mono text-slate-500">{item.v}</span>
                            <span className="text-xs font-bold uppercase tracking-tight">{item.t}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded border ${item.s === 'Active' ? 'border-cyan-400/30 text-cyan-400' : 'border-slate-800 text-slate-600'}`}>{item.s}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Future Vision Section */}
              <section id="vision" className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-cyan-400/5 skew-y-3 origin-left"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                        The Horizon
                      </div>
                      <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Universal <br />
                        <span className="text-cyan-400">Precision</span> <br />
                        Task Engine.
                      </h3>
                      <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                        ClearStep aims to become the world’s first universal precision task engine—reducing human error across industries from aviation to healthcare. We are building the infrastructure for a world where "mistake" is no longer a variable.
                      </p>
                      <div className="grid grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                          <div className="text-2xl font-black text-white">0%</div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Error Tolerance</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-black text-white">∞</div>
                          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Domain Scaling</div>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-10 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="relative bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
                        <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Roadmap v2.0</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Secure Protocol</span>
                          </div>
                          <div className="space-y-6">
                            {[
                              { label: 'Autonomous Verification', status: 'In Development', progress: 65 },
                              { label: 'Biometric Sync', status: 'Research Phase', progress: 30 },
                              { label: 'Neural-Link Protocols', status: 'Conceptual', progress: 10 }
                            ].map((item, i) => (
                              <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                  <div className="text-xs font-bold uppercase tracking-tight">{item.label}</div>
                                  <div className="text-[9px] font-mono text-slate-500">{item.status}</div>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${item.progress}%` }}
                                    className="h-full bg-cyan-400"
                                  ></motion.div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4 text-center">
                            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em]">
                              &gt; Initializing Global Safety Layer...
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <motion.div 
              key="checklist"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto p-4 sm:p-6 md:p-12 space-y-8 md:space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6 md:pb-12">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                    Active Protocol
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-tight md:leading-none">{checklist.goal}</h2>
                </div>
                <button 
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all w-full md:w-auto"
                  aria-label="Start New Goal"
                >
                  <RefreshCw className="w-3 h-3" /> New Goal
                </button>
              </div>

              <div className="space-y-4">
                {checklist.steps.map((step, index) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleStep(step.id)}
                    className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer ${
                      step.isCompleted 
                        ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                        : 'bg-slate-900 border-slate-800 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-400/5'
                    }`}
                    role="button"
                    aria-label={`Step ${index + 1}: ${step.title}. ${step.isCompleted ? 'Completed' : 'Mark as complete'}`}
                    aria-pressed={step.isCompleted}
                  >
                    {step.isCompleted && (
                      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none"></div>
                    )}
                    
                    <div className="p-4 sm:p-6 md:p-8 flex gap-4 sm:gap-6">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          step.isCompleted 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-slate-700 group-hover:border-cyan-400'
                        }`}>
                          {step.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-slate-950" />
                          ) : (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs text-slate-600">{(index + 1).toString().padStart(2, '0')}</span>
                          <h3 className={`text-xl font-bold uppercase tracking-tight ${step.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                            {step.title}
                          </h3>
                          {step.criticality === 'high' && !step.isCompleted && (
                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] px-2 py-0.5 rounded font-mono uppercase tracking-widest">Critical</span>
                          )}
                        </div>

                        <p className={`text-sm leading-relaxed ${step.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {step.description}
                        </p>
                        
                        {!step.isCompleted && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-4"
                          >
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                              <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                                <Target className="w-3 h-3" /> Verification Criteria
                              </div>
                              <p className="text-xs font-mono italic text-slate-300 leading-relaxed">
                                {step.verificationCriteria}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 md:pt-12 border-t border-slate-800">
                <div className="flex items-center gap-4 w-full md:w-auto" aria-label="Checklist Progress">
                  <div className="flex-1 md:w-48 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800" role="progressbar" aria-valuenow={(checklist.steps.filter(s => s.isCompleted).length / checklist.steps.length) * 100} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(checklist.steps.filter(s => s.isCompleted).length / checklist.steps.length) * 100}%` }}
                      className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    ></motion.div>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    {checklist.steps.filter(s => s.isCompleted).length} / {checklist.steps.length} Verified
                  </div>
                </div>
                
                {checklist.steps.every(s => s.isCompleted) && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 font-bold uppercase text-xs tracking-widest"
                  >
                    <ShieldCheck className="w-4 h-4" /> Protocol Complete
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-slate-900 py-12 md:py-16 bg-slate-950" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12" aria-label="Footer Navigation">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-400 rounded-sm flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-slate-950"></div>
                </div>
                <span className="font-bold uppercase tracking-tighter text-xl">ClearStep</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Precision protocol engine for high-stakes environments. Built for zero-error execution and mission-critical reliability.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">System Status</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Legal & Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-900 gap-6">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              © 2026 ClearStep Precision Systems. All rights reserved.
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Encrypted Session</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
