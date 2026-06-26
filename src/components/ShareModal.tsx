import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { 
  X, 
  Copy, 
  CheckCircle2, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Share2,
  Globe,
  Users,
  Zap,
  QrCode
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  goal: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareUrl, goal }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Collaborate with me on this high-precision protocol for "${goal}" on ExactPath!`;

  const socialLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:text-[#1DA1F2]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:text-[#0A66C2]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:text-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Logo className="w-10 h-10" iconOnly />
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic font-serif text-slate-900 dark:text-white">Collaborate</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-widest">Real-time Team Sync</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Collaboration Link</div>
                  <div className="flex items-center gap-1 text-[8px] font-mono text-green-500 uppercase tracking-widest animate-pulse">
                    <Zap className="w-2 h-2" /> Live Now
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                  <div className="flex-1 px-2 text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                    {shareUrl}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className={`p-2 rounded-lg transition-all ${
                      copied ? 'bg-green-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-400'
                    }`}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 italic px-1">
                  Anyone with this link can view and edit this protocol in real-time.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Viral Distribution</div>
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className={`flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest transition-colors ${showQR ? 'text-cyan-400' : 'text-slate-500 hover:text-cyan-400'}`}
                  >
                    <QrCode className="w-3 h-3" /> {showQR ? 'Hide QR' : 'Show QR'}
                  </button>
                </div>

                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col items-center gap-4 p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl"
                    >
                      <div className="p-4 bg-white rounded-xl shadow-lg">
                        <QRCodeSVG 
                          value={shareUrl} 
                          size={160}
                          level="H"
                          includeMargin={false}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-900 dark:text-white">Scan to Protocol</p>
                        <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Instant mobile transfer</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-3 gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:border-cyan-400/50 group ${social.color} text-slate-600 dark:text-slate-400`}
                    >
                      <social.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                      <span className="text-[9px] font-mono uppercase tracking-widest">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-4 bg-cyan-400/5 border border-cyan-400/10 rounded-2xl">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Invite your team to collaborate. All changes are synchronized instantly across all connected devices.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
