import React from 'react';
import { Logo } from './Logo';
import { 
  Search, 
  Filter, 
  Download, 
  Star, 
  TrendingUp, 
  Clock, 
  Shield, 
  Zap,
  ArrowUpRight,
  X,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  isPro: boolean;
  author: string;
  steps: number;
}

const TEMPLATES: Template[] = [
  {
    id: 't1',
    title: 'ISO 9001 Quality Audit',
    description: 'Comprehensive internal audit protocol for ISO 9001 compliance.',
    category: 'Compliance',
    rating: 4.9,
    downloads: 1240,
    isPro: true,
    author: 'AuditPro Systems',
    steps: 24
  },
  {
    id: 't2',
    title: 'Emergency Response: Fire',
    description: 'Critical step-by-step evacuation and containment protocol.',
    category: 'Safety',
    rating: 5.0,
    downloads: 850,
    isPro: false,
    author: 'SafetyFirst Inc.',
    steps: 12
  },
  {
    id: 't3',
    title: 'Software Deployment Checklist',
    description: 'Zero-downtime deployment protocol for cloud-native applications.',
    category: 'Technology',
    rating: 4.8,
    downloads: 2100,
    isPro: true,
    author: 'DevOps Elite',
    steps: 18
  },
  {
    id: 't4',
    title: 'Medical Lab Sterilization',
    description: 'High-precision sterilization protocol for clinical environments.',
    category: 'Healthcare',
    rating: 4.9,
    downloads: 620,
    isPro: true,
    author: 'Clinical Standards',
    steps: 32
  },
  {
    id: 't5',
    title: 'Financial Quarter Close',
    description: 'Standardized protocol for end-of-quarter financial reporting.',
    category: 'Finance',
    rating: 4.7,
    downloads: 940,
    isPro: true,
    author: 'FinOps Global',
    steps: 45
  },
  {
    id: 't6',
    title: 'New Hire Onboarding',
    description: 'Standardized onboarding flow for remote-first teams.',
    category: 'HR',
    rating: 4.6,
    downloads: 1500,
    isPro: false,
    author: 'PeopleOps',
    steps: 15
  }
];

interface TemplateMarketplaceProps {
  onClose: () => void;
  onImport: (template: Template) => void;
  isPro: boolean;
  onUpgrade: () => void;
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({ 
  onClose, 
  onImport, 
  isPro,
  onUpgrade
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const categories = ['All', ...new Set(TEMPLATES.map(t => t.category))];

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[150] bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Logo className="w-10 h-10" iconOnly />
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">Protocol Marketplace</h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Industry-Standard Execution Blueprints</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Search & Filter Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
            <input 
              type="text" 
              placeholder="Search industry protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-400/50 transition-all shadow-sm dark:shadow-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-cyan-400 text-slate-950 font-bold' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-6 hover:border-cyan-400/30 transition-all relative overflow-hidden shadow-sm dark:shadow-none"
            >
              {template.isPro && !isPro && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Zap className="w-2 h-2" /> Pro Only
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{template.category}</div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="text-[10px] font-mono font-bold">{template.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">{template.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">{template.description}</p>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Author</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{template.author}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Complexity</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{template.steps} Steps</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (template.isPro && !isPro) {
                    onUpgrade();
                  } else {
                    onImport(template);
                  }
                }}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  template.isPro && !isPro
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-cyan-400 text-slate-950 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                }`}
              >
                {template.isPro && !isPro ? (
                  <>Unlock with Pro <Shield className="w-4 h-4" /></>
                ) : (
                  <>Import Protocol <Download className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer / CTA */}
      {!isPro && (
        <div className="p-8 bg-cyan-400/5 border-t border-cyan-400/20 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Logo className="w-12 h-12" iconOnly />
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Unlock Elite Protocols</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pro users get access to 500+ industry-standard templates.</p>
              </div>
            </div>
            <button 
              onClick={onUpgrade}
              className="px-8 py-4 bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center gap-2"
            >
              Upgrade Now <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
