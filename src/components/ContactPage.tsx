import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Globe, 
  Clock,
  CheckCircle2,
  ArrowLeft,
  Shield
} from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to transmit message');
      }

      setFormState('success');
    } catch (err) {
      console.error("Contact Error:", err);
      alert("Failed to transmit message. Please try again later.");
      setFormState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-cyan-400/30 font-sans overflow-x-hidden">
      {/* Background Grid & Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 dark:opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to System
          </button>
          <Logo className="w-8 h-8" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side: Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-[10px] font-mono text-cyan-400 uppercase tracking-widest"
              >
                <MessageSquare className="w-3 h-3" /> Support Command
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic font-serif leading-none text-slate-900 dark:text-white"
              >
                Get in <span className="text-cyan-400">Touch.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-600 dark:text-slate-400 text-lg max-w-md leading-relaxed"
              >
                Our technical specialists are standing by to assist with system integration, custom protocols, or enterprise licensing.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                {
                  icon: Mail,
                  label: 'Official Email',
                  value: 'info@mixxd.org',
                  desc: 'Primary support channel'
                },
                {
                  icon: Globe,
                  label: 'Global Support',
                  value: '24/7 Availability',
                  desc: 'For Elite Tier members'
                },
                {
                  icon: Clock,
                  label: 'Response Time',
                  value: '< 2 Hours',
                  desc: 'Average technical response'
                },
                {
                  icon: Shield,
                  label: 'Security Office',
                  value: 'Verified Secure',
                  desc: 'End-to-end encrypted'
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm dark:shadow-none"
                >
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.value}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-600 italic">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-[2.5rem] blur opacity-50"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              {formState === 'success' ? (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Message Transmitted</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-mono uppercase tracking-widest">Reference ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-500 text-sm">Our specialists will review your inquiry and respond shortly.</p>
                  <button 
                    onClick={() => setFormState('idle')}
                    className="px-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all text-slate-900 dark:text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-cyan-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-cyan-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-cyan-400 outline-none transition-all appearance-none"
                    >
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Enterprise Licensing</option>
                      <option>Security Report</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Message</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      placeholder="Describe your inquiry in detail..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-cyan-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none"
                    />
                  </div>

                  <button 
                    disabled={formState === 'submitting'}
                    className="w-full py-4 bg-cyan-400 text-slate-950 rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {formState === 'submitting' ? 'Transmitting...' : (
                      <>
                        Transmit Message <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
