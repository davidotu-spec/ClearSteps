import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ChevronRight, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile
} from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setUnauthorizedDomain(null);
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    resetState();
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need to show an error message
        resetState();
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        setUnauthorizedDomain(hostname);
        setError("Firebase Auth: Unauthorized Domain detected.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error: Please check your internet connection and ensure no ad-blockers are interfering with Firebase.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user);
      setMode('verify');
    } catch (err: any) {
      console.error("Signup Error:", err);
      if (err.code === 'auth/network-request-failed') {
        setError("Network error: Please check your internet connection and ensure no ad-blockers are interfering with Firebase.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password sign-up is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.");
      } else if (err.code === 'auth/invalid-email') {
        setError("The email address is not valid.");
      } else if (err.code === 'auth/weak-password') {
        setError("The password is too weak. Please use at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/network-request-failed') {
        setError("Network error: Please check your internet connection and ensure no ad-blockers are interfering with Firebase.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later or reset your password.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    resetState();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      console.error("Reset Error:", err);
      if (err.code === 'auth/network-request-failed') {
        setError("Network error: Please check your internet connection and ensure no ad-blockers are interfering with Firebase.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-slate-950/60 dark:bg-slate-950/90 backdrop-blur-xl p-6 flex items-center justify-center"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Logo className="w-6 h-6" iconOnly />
              <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'verify' && 'Verify Email'}
                {mode === 'admin' && 'Admin Access'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {unauthorizedDomain ? (
              <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3 text-amber-500 dark:text-amber-400 text-xs font-mono uppercase tracking-wider">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 animate-pulse" />
                  <span className="font-bold">UNAUTHORIZED DOMAIN DETECTION</span>
                </div>
                <div className="space-y-2 text-[11px] normal-case tracking-normal text-slate-700 dark:text-slate-300">
                  <p>
                    Firebase Auth has blocked this sign-in attempt because the hostname <strong className="font-mono text-cyan-400 select-all">{unauthorizedDomain}</strong> is not listed on your project's <strong>Authorized Domains</strong>.
                  </p>
                  <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2 space-y-2">
                    <p className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">How to resolve:</p>
                    <ol className="list-decimal pl-4 space-y-1.5 font-sans leading-relaxed text-slate-600 dark:text-slate-400">
                      <li>
                        Confirm you are using your <strong>own Firebase Project</strong>. The default <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded text-cyan-400 text-[10px]">gen-lang-client-0690785687</code> is built-in by AI Studio and cannot be custom-configured in the Firebase Console.
                      </li>
                      <li>
                        If using your own project, open the <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline font-semibold font-mono">Firebase Console Auth Tab</a>.
                      </li>
                      <li>
                        Go to <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.
                      </li>
                      <li>
                        Click <strong>Add domain</strong> and add: <br/>
                        <code className="bg-slate-100 dark:bg-slate-950 px-2 py-1 my-1 block rounded text-cyan-400 text-[10px] text-center font-mono font-bold select-all">{unauthorizedDomain}</code>
                      </li>
                    </ol>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => { setUnauthorizedDomain(null); setError(null); }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-mono uppercase tracking-widest text-slate-900 dark:text-white transition-all"
                >
                  Dismiss Guide
                </button>
              </div>
            ) : error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-2 text-red-400 text-xs font-mono uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {error.includes("already registered") && (
                  <button 
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-cyan-400 hover:text-cyan-300 text-[10px] mt-1 text-left underline"
                  >
                    Switch to Sign In
                  </button>
                )}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-xs font-mono uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {mode === 'verify' ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-cyan-400/10 border border-cyan-400/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">Check your email</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    We've sent a verification link to <span className="text-cyan-400 font-mono">{email}</span>. 
                    Please verify your email to continue.
                  </p>
                </div>
                <button 
                  onClick={() => setMode('login')}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all text-slate-900 dark:text-white"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={mode === 'signup' ? handleEmailSignup : mode === 'forgot' ? handlePasswordReset : handleEmailLogin} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-cyan-400/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-cyan-400/50 outline-none transition-all"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Password</label>
                      {mode === 'login' && (
                        <button 
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-widest"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-cyan-400/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-cyan-400 text-slate-950 font-black uppercase text-xs tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                      {mode === 'admin' && 'Admin Login'}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {mode !== 'verify' && mode !== 'admin' && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 dark:text-slate-600">Or continue with</span>
                  </div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-3 text-slate-900 dark:text-white shadow-sm dark:shadow-none"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="" />
                  Google Account
                </button>

                <div className="text-center">
                  {mode === 'login' ? (
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      Don't have an account? {' '}
                      <button onClick={() => setMode('signup')} className="text-cyan-400 hover:text-cyan-300">Sign Up</button>
                    </p>
                  ) : (
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      Already have an account? {' '}
                      <button onClick={() => setMode('login')} className="text-cyan-400 hover:text-cyan-300">Sign In</button>
                    </p>
                  )}
                </div>
              </div>
            )}

            {mode === 'admin' && (
              <div className="text-center">
                <button 
                  onClick={() => setMode('login')}
                  className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to User Login
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
