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
  ChevronDown,
  ChevronUp,
  Loader2, 
  Target, 
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Briefcase,
  Rocket,
  Stethoscope,
  Terminal,
  History as HistoryIcon,
  Volume2,
  Play,
  Download,
  FileText,
  Search,
  GripVertical,
  Share2,
  Link as LinkIcon,
  Filter,
  Calendar as CalendarIcon,
  Brain,
  Info,
  Edit2,
  Save,
  X,
  Zap,
  Shield,
  UserPlus,
  Menu,
  Mail,
  Lock,
  User as UserIcon,
  ArrowLeft,
  TrendingUp,
  Twitter,
  Linkedin,
  MessageCircle,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";
import { jsPDF } from 'jspdf';
import { loadStripe } from '@stripe/stripe-js';
import { TemplateMarketplace } from './components/TemplateMarketplace';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { LandingPage } from './components/LandingPage';
import { PricingModal } from './components/PricingModal';
import { ContactPage } from './components/ContactPage';
import { SystemPage } from './components/SystemPage';
import { ShareModal } from './components/ShareModal';
import { PitchDeck } from './components/PitchDeck';
import { Logo } from './components/Logo';
import { ChatBot } from './components/ChatBot';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification,
  FirebaseUser,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  writeBatch
} from './firebase';

// --- Types ---

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  createdAt: number;
  isPro?: boolean;
  stripeCustomerId?: string;
  generationCount?: number;
  lastGenerationMonth?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

interface Step {
  id: string;
  title: string;
  description: string;
  verificationCriteria: string;
  rationale?: string;
  expectedOutcome?: string;
  potentialPitfalls?: string;
  isCompleted: boolean;
  criticality: 'low' | 'medium' | 'high';
  evidence?: string;
  verificationFeedback?: string;
  verificationStatus?: 'pending' | 'passed' | 'failed';
}

interface DecisionLogic {
  rationale: string;
  outcomes: string;
  pitfalls: string;
}

interface Checklist {
  id: string;
  goal: string;
  steps: Step[];
  createdAt: number;
  tags: string[];
  explanation?: string | DecisionLogic;
  deepExplanation?: string;
  messages?: ChatMessage[];
  criticality: 'low' | 'medium' | 'high';
  createdBy: string;
  collaborators?: string[];
}

// --- AI Service ---

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const isBot = typeof navigator !== 'undefined' && /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora\ link\ preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp/i.test(navigator.userAgent);

const generateChecklist = async (goal: string, criticality: 'low' | 'medium' | 'high'): Promise<{ steps: Step[], tags: string[], explanation: DecisionLogic, deepExplanation: string }> => {
  const prompt = `You are ExactPath, an expert protocol engine for high-stakes environments. 
  Your goal is to turn the following objective into a flawless, step-by-step plan: "${goal}".
  
  The overall criticality for this mission is set to: ${criticality.toUpperCase()}.
  
  Guidelines:
  1. Be precise, confident, and minimal.
  2. Avoid fluff. Use short, directive sentences.
  3. Emphasize clarity and correctness.
  4. For each step, provide:
     - A clear title.
     - A brief description of the action.
     - SPECIFIC verification criteria (how to prove this step was done correctly).
     - Rationale: Why this step is mission-critical.
     - Expected Outcome: The measurable result of success.
     - Potential Pitfalls: Critical risks or common failures for this specific action.
     - Criticality level for THIS SPECIFIC STEP (low, medium, high).
  
  Also:
  - Generate 3-5 relevant tags for this goal.
  - Provide a "Decision Logic" (explanation) which summarizes:
      - Rationale: The core reasoning behind the selected steps.
      - Outcomes: The aggregate success metrics for the entire mission.
      - Pitfalls: The most dangerous systemic risks to mitigate.
  - Provide a "Deep Strategy & Objectives" section (deepExplanation) which is a comprehensive, multi-paragraph guide on how to achieve the goal, covering potential pitfalls, advanced techniques, and the underlying philosophy of the objective.
  
  CRITICAL FORMATTING RULE: For the deepExplanation, do NOT use Markdown formatting. Do NOT use asterisks (*) for bullet points or bolding (**). Use plain text only. For lists, use numbered lines (1., 2., etc.) or simple dashes (-).
  
  Return the response as a JSON object with:
  - steps: An array of objects with the fields above.
  - tags: An array of strings.
  - explanation: An object with fields "rationale", "outcomes", "pitfalls".
  - deepExplanation: A string (detailed guide).`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                verificationCriteria: { type: Type.STRING },
                rationale: { type: Type.STRING },
                expectedOutcome: { type: Type.STRING },
                potentialPitfalls: { type: Type.STRING },
                criticality: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
              },
              required: ['title', 'description', 'verificationCriteria', 'rationale', 'expectedOutcome', 'potentialPitfalls', 'criticality']
            }
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          explanation: {
            type: Type.OBJECT,
            properties: {
              rationale: { type: Type.STRING },
              outcomes: { type: Type.STRING },
              pitfalls: { type: Type.STRING }
            },
            required: ['rationale', 'outcomes', 'pitfalls']
          },
          deepExplanation: { type: Type.STRING }
        },
        required: ['steps', 'tags', 'explanation', 'deepExplanation']
      }
    }
  });

  const data = JSON.parse(response.text || '{"steps": [], "tags": [], "explanation": {"rationale": "", "outcomes": "", "pitfalls": ""}, "deepExplanation": ""}');
  return {
    steps: data.steps.map((s: any, index: number) => ({
      ...s,
      id: `step-${Date.now()}-${index}`,
      isCompleted: false
    })),
    tags: data.tags,
    explanation: data.explanation,
    deepExplanation: data.deepExplanation
  };
};

const playAudio = async (base64Data: string) => {
  try {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = audioContext.createBuffer(1, len / 2, 24000);
    const channelData = audioBuffer.getChannelData(0);
    
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < len / 2; i++) {
      channelData[i] = dataView.getInt16(i * 2, true) / 32768;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (err) {
    console.error("Audio Playback Error:", err);
  }
};

const speakText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await playAudio(base64Audio);
    }
  } catch (err) {
    console.error("TTS Error:", err);
  }
};

const speakStep = async (step: Step) => {
  const text = `Step ${step.title}. ${step.description}. Verification criteria: ${step.verificationCriteria}.`;
  await speakText(text);
};

// --- Components ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [goal, setGoal] = useState('');
  const [selectedCriticality, setSelectedCriticality] = useState<'low' | 'medium' | 'high'>('medium');
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [history, setHistory] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' | 'admin' }>({ isOpen: false, mode: 'login' });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allChecklists, setAllChecklists] = useState<Checklist[]>([]);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [expandedStepIds, setExpandedStepIds] = useState<Set<string>>(new Set());
  const [filterCriticality, setFilterCriticality] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isShared, setIsShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [isLanding, setIsLanding] = useState(!user);
  const [showSystem, setShowSystem] = useState(false);
  const [verifyingStepId, setVerifyingStepId] = useState<string | null>(null);
  const [verificationEvidence, setVerificationEvidence] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [protocolChatInput, setProtocolChatInput] = useState('');
  const [isProtocolChatLoading, setIsProtocolChatLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });
  const protocolChatEndRef = useRef<HTMLDivElement>(null);
  const [editValues, setEditValues] = useState<{ title: string; description: string; verificationCriteria: string }>({
    title: '',
    description: '',
    verificationCriteria: ''
  });

  const [sampleSteps, setSampleSteps] = useState([true, true, false]);
  const [heroSteps, setHeroSteps] = useState(['completed', 'active', 'pending']);

  // Auth Listener
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsLanding(false);
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: firebaseUser.email === 'davidotu@mixxd.org' ? 'admin' : 'user',
            createdAt: Date.now(),
            isPro: false,
            generationCount: 0,
            lastGenerationMonth: new Date().toISOString().slice(0, 7)
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        } else {
          const data = userSnap.data() as UserProfile;
          // Ensure master admin always has admin role
          if (firebaseUser.email === 'davidotu@mixxd.org' && data.role !== 'admin') {
            const updatedProfile = { ...data, role: 'admin' as const };
            await updateDoc(userRef, { role: 'admin' });
            setUserProfile(updatedProfile);
          } else {
            setUserProfile(data);
          }
        }
      } else {
        setIsLanding(true);
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-time Sync for current checklist
  useEffect(() => {
    if (!checklist?.id || !isAuthReady) return;

    if (isBot) {
      getDoc(doc(db, 'checklists', checklist.id)).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Checklist;
          setChecklist(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data)) {
              return data;
            }
            return prev;
          });
          setIsLoading(false);
        }
      }).catch(err => console.error("Bot checklist fetch error:", err));
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'checklists', checklist.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Checklist;
        // Only update if it's actually different to avoid loops
        setChecklist(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
        setIsLoading(false);
      }
    }, (err) => {
      console.error("Firestore Sync Error:", err);
    });

    return () => unsubscribe();
  }, [checklist?.id, isAuthReady]);

  // Load history and shared data
  useEffect(() => {
    if (!isAuthReady) return;

    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('protocol');
    const roomId = params.get('room');

    if (roomId) {
      setIsLoading(true);
      setChecklist({ id: roomId, goal: "Loading Protocol...", steps: [], createdAt: Date.now(), tags: [], criticality: 'medium', createdBy: '' }); 
      setIsShared(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
        setChecklist(decoded);
        setIsShared(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to decode shared protocol", e);
      }
    }

    // Fetch history from Firestore if logged in
    if (user) {
      const q = query(
        collection(db, 'checklists'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      if (isBot) {
        getDocs(q).then(snapshot => {
          const historyData = snapshot.docs.map(doc => doc.data() as Checklist);
          setHistory(historyData);
        }).catch(err => console.error("Bot history fetch error:", err));
        return;
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyData = snapshot.docs.map(doc => doc.data() as Checklist);
        setHistory(historyData);
      });
      
      return () => unsubscribe();
    } else {
      // Fallback to localStorage for guests
      const savedHistory = localStorage.getItem('clearstep_history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    }
  }, [isAuthReady, user]);

  useEffect(() => {
    if (protocolChatEndRef.current) {
      protocolChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [checklist?.messages]);

  // User Profile Listener
  useEffect(() => {
    if (!user?.uid) return;

    if (isBot) {
      getDoc(doc(db, 'users', user.uid)).then(docSnap => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      }).catch(err => console.error("Bot profile fetch error:", err));
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (urlParams.get('upgrade') === 'success' && sessionId) {
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
          const data = await response.json();
          if (data.status === 'success') {
            setSuccess("Payment successful! Your account has been upgraded to Pro.");
          } else {
            setSuccess("Payment processing... Your account will be upgraded shortly.");
          }
        } catch (err) {
          console.error("Verification Error:", err);
          setSuccess("Payment successful! Your account is being upgraded.");
        }
        setTimeout(() => setSuccess(null), 5000);
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      };
      verifySession();
    } else if (urlParams.get('upgrade') === 'cancel') {
      setError("Upgrade cancelled. You can try again whenever you're ready.");
      setTimeout(() => setError(null), 5000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Admin Data Listener
  useEffect(() => {
    if (userProfile?.role !== 'admin') return;

    if (isBot) {
      getDocs(collection(db, 'users')).then(snapshot => {
        const users = snapshot.docs.map(doc => doc.data() as UserProfile);
        setAllUsers(users);
      }).catch(err => console.error("Bot admin users fetch error:", err));

      getDocs(collection(db, 'checklists')).then(snapshot => {
        const checklists = snapshot.docs.map(doc => doc.data() as Checklist);
        setAllChecklists(checklists);
      }).catch(err => console.error("Bot admin checklists fetch error:", err));
      return;
    }

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      setAllUsers(users);
    });

    const checklistsUnsubscribe = onSnapshot(collection(db, 'checklists'), (snapshot) => {
      const checklists = snapshot.docs.map(doc => doc.data() as Checklist);
      setAllChecklists(checklists);
    });

    return () => {
      usersUnsubscribe();
      checklistsUnsubscribe();
    };
  }, [userProfile]);

  // Route Listener
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        // Only intercept if it's not a hash link or external
        const url = new URL(anchor.href);
        if (url.pathname !== window.location.pathname) {
          e.preventDefault();
          window.history.pushState({}, '', anchor.href);
          handleLocationChange();
        }
      }
    };
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLogin = () => {
    if (user) {
      setIsLanding(false);
    } else {
      setAuthModal({ isOpen: true, mode: 'login' });
    }
  };

  const handleUpgradePro = () => {
    if (user) {
      setIsLanding(false);
      setShowPricing(true);
    } else {
      setAuthModal({ isOpen: true, mode: 'signup' });
    }
  };

  const handleSignup = () => {
    setAuthModal({ isOpen: true, mode: 'signup' });
  };

  const handleAdminLogin = () => {
    setAuthModal({ isOpen: true, mode: 'admin' });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setChecklist(null);
      setShowAdmin(false);
      setIsLanding(true);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }
    
    // Check if Stripe is configured
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log("Stripe Key Found:", !!stripeKey);
    
    // Only attempt Stripe if the key is present and not a placeholder
    const isStripeConfigured = stripeKey && 
                             stripeKey !== 'MY_VITE_STRIPE_PUBLISHABLE_KEY' && 
                             stripeKey !== '' && 
                             stripeKey !== 'undefined';

    if (isStripeConfigured) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
        });
        
        const session = await response.json();
        
        if (!response.ok || session.error) {
          throw new Error(session.error || `Server error: ${response.status}`);
        }
        
        if (session.url) {
          window.location.href = session.url;
          return; // Stop here to let the redirect happen
        } else if (session.id) {
          const stripe = await loadStripe(stripeKey);
          if (stripe) {
            const { error } = await (stripe as any).redirectToCheckout({ sessionId: session.id });
            if (error) throw error;
          } else {
            throw new Error("Failed to load Stripe SDK");
          }
        } else {
          throw new Error("Invalid session response from server");
        }
      } catch (err: any) {
        console.error("Stripe Error:", err);
        setError(`Checkout failed: ${err.message || "Please try again later."}`);
        setIsLoading(false);
        return;
      }
    }

    // Fallback to simulation IF AND ONLY IF Stripe is not configured
    // Note: We only reach here if isStripeConfigured is false OR if it failed before fetch
    console.log("Stripe not configured or failed, using simulation mode.");
    try {
      setIsLoading(true);
      await updateDoc(doc(db, 'users', user.uid), { isPro: true });
      setUserProfile(prev => prev ? { ...prev, isPro: true } : null);
      setShowPricing(false);
      setSuccess("Welcome to Pro! You now have unlimited protocol generations. (Simulation Mode)");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Upgrade Error:", err);
      setError("Failed to upgrade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userProfile?.stripeCustomerId) {
      setError("No active subscription found to manage.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeCustomerId: userProfile.stripeCustomerId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create portal session");
      }
    } catch (err: any) {
      console.error("Portal Error:", err);
      setError(`Billing system unavailable: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleVerifyStep = async (stepId: string, evidence: string) => {
    if (!checklist || !evidence.trim()) return;
    
    setIsVerifying(true);
    const step = checklist.steps.find(s => s.id === stepId);
    if (!step) return;

    const prompt = `You are the ExactPath Verification Engine. 
    Your task is to verify if a specific protocol step has been executed correctly based on the provided evidence.
    
    Step Title: ${step.title}
    Step Description: ${step.description}
    Verification Criteria: ${step.verificationCriteria}
    
    User Provided Evidence: ${evidence}
    
    Evaluate the evidence against the criteria. 
    1. Determine if the step is PASSED or FAILED.
    2. Provide specific, constructive feedback on how to improve or what is missing.
    3. Be rigorous but helpful.
    
    Return the response as a JSON object with:
    - status: "passed" or "failed"
    - feedback: "A string explaining your reasoning and improvement areas."`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ['passed', 'failed'] },
              feedback: { type: Type.STRING }
            },
            required: ['status', 'feedback']
          }
        }
      });

      const result = JSON.parse(response.text || '{"status": "failed", "feedback": "Error processing verification."}');
      
      const newSteps = checklist.steps.map(s => {
        if (s.id === stepId) {
          return {
            ...s,
            evidence,
            verificationFeedback: result.feedback,
            verificationStatus: result.status as 'passed' | 'failed',
            isCompleted: result.status === 'passed' ? true : s.isCompleted
          };
        }
        return s;
      });

      const updatedChecklist = { ...checklist, steps: newSteps };
      setChecklist(updatedChecklist);
      
      if (user) {
        await updateDoc(doc(db, 'checklists', checklist.id), { steps: newSteps });
      }
      
      // We keep verifyingStepId set so the user can see the result in the verification UI
      
      if (result.status === 'passed') {
        setSuccess("Step verified successfully.");
      } else {
        setError("Verification failed. Please review the feedback.");
      }
      setTimeout(() => { setSuccess(null); setError(null); }, 5000);

    } catch (err) {
      console.error("Verification Error:", err);
      setError("Failed to verify step. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProtocolChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolChatInput.trim() || !checklist || isProtocolChatLoading) return;

    const userMessageText = protocolChatInput.trim();
    const userMessage: ChatMessage = {
      role: 'user',
      content: userMessageText,
      timestamp: Date.now()
    };

    const updatedMessages = [...(checklist.messages || []), userMessage];
    setChecklist({ ...checklist, messages: updatedMessages });
    setProtocolChatInput('');
    setIsProtocolChatLoading(true);

    try {
      const streamingResponse = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are the ExactPath Strategic Advisor, a deep-thinking engine specialized in high-stakes protocol execution.
          Current Protocol Goal: ${checklist.goal}
          Current Strategy: ${checklist.deepExplanation}
          
          Your task is to provide extremely deep, analytical, and strategic advice to the user regarding this specific protocol. 
          Think through every implication, edge case, and advanced optimization. 
          Be precise, technical, and authoritative.
          
          CRITICAL FORMATTING RULE: Do NOT use Markdown formatting. Do NOT use asterisks (*) for bullet points or bolding (**). Use plain text only. For lists, use numbered lines (1., 2., etc.) or simple dashes (-). For emphasis, use ALL CAPS or clear phrasing instead of bolding.`,
        },
        contents: [
          ...(checklist.messages || []).map(msg => ({
            role: msg.role as 'user' | 'model' | 'system',
            parts: [{ text: msg.content }]
          })),
          { role: 'user', parts: [{ text: userMessageText }] }
        ]
      });

      let responseText = "";
      const modelMessage: ChatMessage = {
        role: 'model',
        content: "",
        timestamp: Date.now()
      };

      // Add placeholder message for streaming
      const finalMessages = [...updatedMessages, modelMessage];
      setChecklist({ ...checklist, messages: finalMessages });

      for await (const chunk of streamingResponse) {
        const chunkText = chunk.text || "";
        responseText += chunkText;
        
        // Update the last message content
        setChecklist(prev => {
          if (!prev || !prev.messages) return prev;
          const updated = [...prev.messages];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: responseText
          };
          return { ...prev, messages: updated };
        });
      }

      // Persist final result to Firestore
      if (user) {
        await updateDoc(doc(db, 'checklists', checklist.id), {
          messages: [...updatedMessages, { ...modelMessage, content: responseText }]
        });
      }
    } catch (err) {
      console.error("Protocol Chat Error:", err);
      setError("The deep thinking engine encountered an error. Please try again.");
    } finally {
      setIsProtocolChatLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!checklist) return;
    const headers = ['Step', 'Title', 'Description', 'Verification Criteria', 'Status', 'Criticality'];
    const rows = checklist.steps.map((s, i) => [
      i + 1,
      s.title,
      s.description,
      s.verificationCriteria,
      s.isCompleted ? 'Completed' : 'Pending',
      s.criticality
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exactpath-${checklist.goal.toLowerCase().replace(/\s+/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateUserRole = async (targetUid: string, newRole: 'admin' | 'user') => {
    try {
      await updateDoc(doc(db, 'users', targetUid), { role: newRole });
    } catch (err) {
      console.error("Role Update Error:", err);
      setError("Failed to update user role.");
    }
  };

  const updateUserPro = async (targetUid: string, isPro: boolean) => {
    try {
      await updateDoc(doc(db, 'users', targetUid), { isPro });
      setSuccess(`User tier updated to ${isPro ? 'Pro' : 'Free'}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Pro Update Error:", err);
      setError("Failed to update user tier.");
    }
  };

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
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }

    if (!isAuthReady || !userProfile) {
      setError("Initializing system... Please wait.");
      return;
    }

    // Check limits
    const currentMonth = new Date().toISOString().slice(0, 7);
    const isNewMonth = userProfile?.lastGenerationMonth !== currentMonth;
    const currentCount = isNewMonth ? 0 : (userProfile?.generationCount || 0);
    
    // Test mode override
    const isTestMode = localStorage.getItem('exactpath_test_limit') === 'true';
    const effectiveCount = isTestMode ? 3 : currentCount;
    const effectiveIsPro = isTestMode ? false : userProfile?.isPro;
    const effectiveRole = isTestMode ? 'user' : userProfile?.role;

    console.log("Limit Check:", {
      isPro: effectiveIsPro,
      role: effectiveRole,
      currentCount: effectiveCount,
      isTestMode,
      lastMonth: userProfile?.lastGenerationMonth,
      currentMonth
    });

    if (!effectiveIsPro && effectiveRole !== 'admin' && effectiveCount >= 3) {
      setShowPricing(true);
      setError("Free tier limit reached (3/3). Upgrade to Pro for unlimited paths.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { steps, tags, explanation, deepExplanation } = await generateChecklist(goal, selectedCriticality);
      const newChecklist: Checklist = {
        id: `checklist-${Date.now()}`,
        goal,
        steps,
        tags,
        explanation,
        deepExplanation,
        messages: [],
        createdAt: Date.now(),
        criticality: selectedCriticality,
        createdBy: user.uid
      };
      
      // Atomic Batch Write
      const batch = writeBatch(db);
      
      // 1. Save Checklist
      const checklistRef = doc(db, 'checklists', newChecklist.id);
      batch.set(checklistRef, newChecklist);
      
      // 2. Update User Usage
      const userRef = doc(db, 'users', user.uid);
      if (isNewMonth) {
        batch.update(userRef, {
          generationCount: 1,
          lastGenerationMonth: currentMonth
        });
      } else {
        batch.update(userRef, {
          generationCount: increment(1),
          lastGenerationMonth: currentMonth
        });
      }

      await batch.commit();

      setChecklist(newChecklist);
      setHistory(prev => [newChecklist, ...prev].slice(0, 20)); // Keep last 20
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('quota') || err?.message?.includes('429')) {
        setError('The AI engine is currently at capacity. Please try again in a few minutes or upgrade to Pro for priority access.');
      } else {
        setError('Failed to generate checklist. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateChecklist = async (updatedChecklist: Checklist) => {
    setChecklist(updatedChecklist);
    if (user && updatedChecklist.id && updatedChecklist.createdBy) {
      try {
        await setDoc(doc(db, 'checklists', updatedChecklist.id), updatedChecklist);
      } catch (err) {
        console.error("Firestore Update Error:", err);
      }
    }
  };

  const toggleStep = (stepId: string) => {
    if (!checklist) return;
    const newSteps = checklist.steps.map(s => 
      s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const updatedChecklist = { ...checklist, steps: newSteps };
    updateChecklist(updatedChecklist);
    
    // Update in history as well
    setHistory(prev => prev.map(h => h.id === checklist.id ? updatedChecklist : h));
  };

  const toggleExpand = (stepId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setExpandedStepIds(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleReorder = (newSteps: Step[]) => {
    if (!checklist || isShared) return;
    const updatedChecklist = { ...checklist, steps: newSteps };
    updateChecklist(updatedChecklist);
    setHistory(prev => prev.map(h => h.id === checklist.id ? updatedChecklist : h));
  };

  const shareChecklist = () => {
    if (!checklist) return;
    setShowShareModal(true);
  };

  const startEditing = (step: Step) => {
    if (isShared) return;
    setEditingStepId(step.id);
    setEditValues({
      title: step.title,
      description: step.description,
      verificationCriteria: step.verificationCriteria
    });
  };

  const saveEdit = () => {
    if (!checklist || !editingStepId) return;
    const newSteps = checklist.steps.map(s => 
      s.id === editingStepId ? { ...s, ...editValues } : s
    );
    const updatedChecklist = { ...checklist, steps: newSteps };
    updateChecklist(updatedChecklist);
    setHistory(prev => prev.map(h => h.id === checklist.id ? updatedChecklist : h));
    setEditingStepId(null);
  };

  const cancelEdit = () => {
    setEditingStepId(null);
  };

  const reset = () => {
    setChecklist(null);
    setGoal('');
    setIsShared(false);
  };

  const exportAsText = () => {
    if (!checklist) return;
    
    let content = `EXACTPATH PROTOCOL: ${checklist.goal.toUpperCase()}\n`;
    content += `Generated: ${new Date(checklist.createdAt).toLocaleString()}\n`;
    content += `--------------------------------------------------\n\n`;
    
    checklist.steps.forEach((step, index) => {
      content += `${index + 1}. ${step.title.toUpperCase()}\n`;
      content += `   STATUS: ${step.isCompleted ? '[VERIFIED]' : '[PENDING]'}\n`;
      content += `   DESCRIPTION: ${step.description}\n`;
      content += `   VERIFICATION: ${step.verificationCriteria}\n`;
      content += `   CRITICALITY: ${step.criticality.toUpperCase()}\n\n`;
    });
    
    content += `--------------------------------------------------\n`;
    content += `© 2026 ExactPath Precision Systems. All rights reserved.\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exactpath-protocol-${checklist.goal.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    if (!checklist) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;
    
    // Header
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('EXACTPATH PRECISION SYSTEMS', margin, y);
    y += 10;
    
    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    const goalTitle = checklist.goal.toUpperCase();
    const splitTitle = doc.splitTextToSize(goalTitle, pageWidth - margin * 2);
    doc.text(splitTitle, margin, y);
    y += (splitTitle.length * 10) + 5;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text(`Generated: ${new Date(checklist.createdAt).toLocaleString()}`, margin, y);
    y += 15;
    
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;
    
    checklist.steps.forEach((step, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      const stepTitle = `${index + 1}. ${step.title.toUpperCase()}`;
      doc.text(stepTitle, margin, y);
      
      const status = step.isCompleted ? 'VERIFIED' : 'PENDING';
      doc.setFontSize(8);
      doc.setTextColor(step.isCompleted ? 0 : 150);
      const statusWidth = doc.getTextWidth(status);
      doc.text(status, pageWidth - margin - statusWidth, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80);
      const desc = doc.splitTextToSize(step.description, pageWidth - margin * 2);
      doc.text(desc, margin, y);
      y += (desc.length * 5) + 5;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(34, 211, 238); // Cyan-400 approx
      const criteria = `VERIFY: ${step.verificationCriteria}`;
      const splitCriteria = doc.splitTextToSize(criteria, pageWidth - margin * 2);
      doc.text(splitCriteria, margin, y);
      y += (splitCriteria.length * 5) + 10;
    });
    
    doc.save(`exactpath-protocol-${checklist.goal.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const loadFromHistory = (item: Checklist) => {
    setChecklist(item);
    setShowHistory(false);
  };

  const filteredHistory = history.filter(item => {
    const query = searchQuery.toLowerCase();
    
    // Search filter
    const matchesSearch = item.goal.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query));
    
    if (!matchesSearch) return false;

    // Criticality filter
    if (filterCriticality !== 'all') {
      const matchesCriticality = item.criticality === filterCriticality || 
        (!item.criticality && item.steps.some(s => s.criticality === filterCriticality));
      if (!matchesCriticality) return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isCompleted = item.steps.every(s => s.isCompleted);
      if (filterStatus === 'completed' && !isCompleted) return false;
      if (filterStatus === 'pending' && isCompleted) return false;
    }

    // Date filter
    if (filterDateRange !== 'all') {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      if (filterDateRange === 'today' && now - item.createdAt > day) return false;
      if (filterDateRange === 'week' && now - item.createdAt > 7 * day) return false;
      if (filterDateRange === 'month' && now - item.createdAt > 30 * day) return false;
    }

    return true;
  });

  if (isLanding) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <LandingPage 
          isAuthenticated={!!user}
          onGetStarted={handleLogin}
          onUpgradePro={handleUpgradePro}
          onTryDemo={() => {
            setGoal("");
            setIsLanding(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onContact={() => setShowContact(true)}
          onPitchDeck={() => setShowPitchDeck(true)}
          onViewSystem={() => setShowSystem(true)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <AuthModal 
          isOpen={authModal.isOpen} 
          onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
          initialMode={authModal.mode} 
        />
        <PricingModal 
          isOpen={showPricing}
          onClose={() => setShowPricing(false)}
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
        />
        <ChatBot ai={ai} />
        {error && (
          <div className="fixed top-20 left-0 right-0 z-[60] px-4">
            <div className="max-w-md mx-auto bg-red-500 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="fixed top-20 left-0 right-0 z-[60] px-4">
            <div className="max-w-md mx-auto bg-emerald-500 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-tight">{success}</span>
              </div>
              <button onClick={() => setSuccess(null)} className="p-1 hover:bg-white/20 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showContact) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <ContactPage onBack={() => setShowContact(false)} />
        <AuthModal 
          isOpen={authModal.isOpen} 
          onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
          initialMode={authModal.mode} 
        />
      </div>
    );
  }

  if (showSystem) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <SystemPage 
          onBack={() => setShowSystem(false)} 
          onTryProtocol={(goal) => {
            if (goal) setGoal(goal);
            setShowSystem(false);
            setIsLanding(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          theme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        />
        <AuthModal 
          isOpen={authModal.isOpen} 
          onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
          initialMode={authModal.mode} 
        />
      </div>
    );
  }

  if (showPitchDeck) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <PitchDeck onClose={() => setShowPitchDeck(false)} />
        <AuthModal 
          isOpen={authModal.isOpen} 
          onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
          initialMode={authModal.mode} 
        />
      </div>
    );
  }

  return (
    <div id="home" className={`min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-cyan-400 selection:text-slate-950 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 p-4 md:px-6 lg:px-12 md:py-6 flex justify-between items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <a href="#home" className="flex items-center gap-3" aria-label="ExactPath Home">
          <Logo className="w-10 h-10" />
          {userProfile?.isPro && (
            <div className="ml-2 px-2 py-0.5 bg-amber-400 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Zap className="w-2 h-2" /> Pro
            </div>
          )}
        </a>
        <nav className="hidden lg:flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest opacity-70" aria-label="Main Navigation">
          <a href="#home" className="hover:text-cyan-400 transition-colors">Home</a>
          <button 
            onClick={() => setIsLanding(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            Landing
          </button>
          <button 
            onClick={() => {
              setShowSystem(true);
              setTimeout(() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-cyan-400 transition-colors uppercase"
          >
            Vision
          </button>
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
          <a href="#use-cases" className="hover:text-cyan-400 transition-colors">Use Cases</a>
          <button 
            onClick={() => setShowSystem(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            Mission
          </button>
          <a href="#demo" className="hover:text-cyan-400 transition-colors">Demo</a>
          <button 
            onClick={() => {
              setShowSystem(true);
              setTimeout(() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => setShowContact(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            Contact
          </button>
          <div className="h-4 w-px bg-slate-800"></div>
          <button 
            onClick={() => setShowMarketplace(true)}
            className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
          >
            <TrendingUp className="w-3 h-3" /> Marketplace
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
          >
            <HistoryIcon className="w-3 h-3" /> History
          </button>
          {(userProfile?.role === 'admin' || user?.email === 'davidotu@mixxd.org') && (
            <>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
              >
                <Shield className="w-3 h-3" /> Admin
              </button>
            </>
          )}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-cyan-400 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
          {user ? (
            <div className="flex items-center gap-6">
              {!userProfile?.isPro && (
                <button 
                  onClick={() => setShowPricing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-lg text-[9px] font-mono text-cyan-400 uppercase tracking-widest hover:bg-cyan-400/20 transition-all"
                >
                  <Zap className="w-3 h-3" /> Upgrade
                </button>
              )}
              <div className="flex items-center gap-4">
                {!userProfile?.isPro && userProfile?.role !== 'admin' && (
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Usage</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (userProfile?.lastGenerationMonth === new Date().toISOString().slice(0, 7) ? (userProfile?.generationCount || 0) : 0) >= 3 ? 'bg-red-500' : 'bg-cyan-400'
                          }`}
                          style={{ 
                            width: `${Math.min(((userProfile?.lastGenerationMonth === new Date().toISOString().slice(0, 7) ? (userProfile?.generationCount || 0) : 0) / 3) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 leading-none">
                        {userProfile?.lastGenerationMonth === new Date().toISOString().slice(0, 7) ? (userProfile?.generationCount || 0) : 0}/3
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700" />
                  <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-white font-bold leading-none">{user.displayName}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[8px] font-mono text-cyan-500 dark:text-cyan-400 uppercase tracking-widest">{userProfile?.role}</span>
                      {userProfile?.isPro && (
                        <span className="text-[7px] font-bold uppercase tracking-widest px-1 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 leading-none">
                          Pro
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {userProfile?.isPro && userProfile?.stripeCustomerId && (
                  <button 
                    onClick={handleManageSubscription}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Billing
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogin}
                className="hover:text-cyan-400 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={handleSignup}
                className="px-4 py-1.5 bg-cyan-400 text-slate-950 rounded-lg font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 lg:hidden z-[60] shadow-2xl"
            >
              <div className="flex flex-col gap-6 text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                <a href="#home" onClick={() => setShowMobileMenu(false)} className="hover:text-cyan-400 transition-colors">Home</a>
                <button 
                  onClick={() => { setIsLanding(true); setShowMobileMenu(false); }}
                  className="text-left hover:text-cyan-400 transition-colors"
                >
                  Landing
                </button>
                <a href="#how-it-works" onClick={() => setShowMobileMenu(false)} className="hover:text-cyan-400 transition-colors">How It Works</a>
                <a href="#use-cases" onClick={() => setShowMobileMenu(false)} className="hover:text-cyan-400 transition-colors">Use Cases</a>
                <button 
                  onClick={() => { setShowSystem(true); setShowMobileMenu(false); }}
                  className="text-left hover:text-cyan-400 transition-colors"
                >
                  Mission
                </button>
                <button 
                  onClick={() => { 
                    setShowSystem(true); 
                    setShowMobileMenu(false);
                    setTimeout(() => {
                      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-left hover:text-cyan-400 transition-colors"
                >
                  About
                </button>
                <a href="#demo" onClick={() => setShowMobileMenu(false)} className="hover:text-cyan-400 transition-colors">Demo</a>
                <button 
                  onClick={() => { setShowContact(true); setShowMobileMenu(false); }}
                  className="text-left hover:text-cyan-400 transition-colors"
                >
                  Contact
                </button>
                <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>
                <button 
                  onClick={() => { setShowMarketplace(true); setShowMobileMenu(false); }}
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                >
                  <TrendingUp className="w-3 h-3" /> Marketplace
                </button>
                <button 
                  onClick={() => { setShowHistory(true); setShowMobileMenu(false); }}
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                >
                  <HistoryIcon className="w-3 h-3" /> History
                </button>
                {(userProfile?.role === 'admin' || user?.email === 'davidotu@mixxd.org') && (
                  <button 
                    onClick={() => { navigate('/admin'); setShowMobileMenu(false); }}
                    className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                  >
                    <Shield className="w-3 h-3" /> Admin
                  </button>
                )}
                <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700" />
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-bold leading-none">{user.displayName}</span>
                        <span className="text-[8px] font-mono text-cyan-500 dark:text-cyan-400 uppercase tracking-widest">{userProfile?.role}</span>
                      </div>
                    </div>
                    {userProfile?.isPro && userProfile?.stripeCustomerId && (
                      <button 
                        onClick={() => { handleManageSubscription(); setShowMobileMenu(false); }}
                        className="text-left hover:text-cyan-400 transition-colors"
                      >
                        Billing & Subscription
                      </button>
                    )}
                    <button 
                      onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                      className="text-left hover:text-cyan-400 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => { handleLogin(); setShowMobileMenu(false); }}
                      className="text-left hover:text-cyan-400 transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => { handleSignup(); setShowMobileMenu(false); }}
                      className="w-full py-3 bg-cyan-400 text-slate-950 rounded-lg font-bold hover:bg-white transition-all text-center"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-3 text-center text-[10px] font-mono uppercase tracking-widest text-red-400 sticky top-[73px] z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <AlertTriangle className="w-3 h-3" />
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-3 text-center text-[10px] font-mono uppercase tracking-widest text-emerald-400 sticky top-[73px] z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <CheckCircle2 className="w-3 h-3" />
            <span>{success}</span>
            <button 
              onClick={() => setSuccess(null)}
              className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {user && !user.emailVerified && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 p-3 text-center text-[10px] font-mono uppercase tracking-widest text-cyan-400 sticky top-[73px] z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <Mail className="w-3 h-3" />
            <span>Please verify your email address to unlock all features.</span>
            <button 
              onClick={async () => {
                try {
                  await sendEmailVerification(user);
                  setSuccess("Verification email resent.");
                  setTimeout(() => setSuccess(null), 5000);
                } catch (e: any) {
                  setError(e.message);
                }
              }}
              className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded transition-colors"
            >
              Resend
            </button>
          </div>
        </div>
      )}

      <main className="relative">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <AnimatePresence>
          {currentPath === '/admin' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white dark:bg-slate-950"
            >
              {userProfile?.role === 'admin' ? (
                <AdminDashboard 
                  allUsers={allUsers}
                  allChecklists={allChecklists}
                  onUpdateRole={updateUserRole}
                  onUpdatePro={updateUserPro}
                  onClose={() => navigate('/')}
                  currentUserUid={user?.uid}
                />
              ) : (
                <AdminLogin 
                  onSuccess={() => {
                    // Role check is handled by the dashboard itself or the listener
                  }}
                  onBack={() => navigate('/')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showExplanation && checklist && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-6 flex items-center justify-center"
            >
              <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">AI Decision Logic</h3>
                  </div>
                  <button 
                    onClick={() => setShowExplanation(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                  </button>
                </div>
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                  {typeof checklist.explanation === 'object' ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                          <Target className="w-3 h-3" /> Core Rationale
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-cyan-400/30 pl-4 py-1 text-sm md:text-base">
                          {checklist.explanation.rationale}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-green-400">
                          <CheckCircle2 className="w-3 h-3" /> Expected Outcomes
                        </div>
                        <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          {checklist.explanation.outcomes}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-red-400">
                          <AlertTriangle className="w-3 h-3" /> Systemic Pitfalls
                        </div>
                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          {checklist.explanation.pitfalls}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-400/10 border border-cyan-400/20 rounded-xl flex items-center justify-center">
                        <Info className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic font-serif text-lg">
                          "{checklist.explanation}"
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-loose">
                      This protocol was synthesized using high-precision logic models to ensure zero human error. 
                      The steps were prioritized based on mission criticality and aggregate risk assessment.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                  <button 
                    onClick={() => {
                      const textToSpeak = typeof checklist.explanation === 'object' 
                        ? `Rationale: ${checklist.explanation.rationale}. Outcomes: ${checklist.explanation.outcomes}. Pitfalls: ${checklist.explanation.pitfalls}`
                        : checklist.explanation || '';
                      speakText(textToSpeak);
                    }}
                    className="flex-1 py-3 bg-cyan-400 text-slate-950 hover:bg-white rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" /> Listen to Logic
                  </button>
                  <button 
                    onClick={() => setShowExplanation(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
                  >
                    Close Explanation
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl p-6 flex items-center justify-center"
            >
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <HistoryIcon className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-bold uppercase tracking-tight">Protocol History</h3>
                  </div>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>
                
                <div className="p-6 bg-slate-950/30 border-b border-slate-800 space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
                      <Search className="w-4 h-4 text-slate-500 mr-3" />
                      <input 
                        type="text"
                        placeholder="Search protocols by goal or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 uppercase tracking-widest"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Advanced Filters
                      </div>
                      {(searchQuery || filterCriticality !== 'all' || filterStatus !== 'all' || filterDateRange !== 'all') && (
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setFilterCriticality('all');
                            setFilterStatus('all');
                            setFilterDateRange('all');
                          }}
                          className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest"
                        >
                          Reset All
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-600 flex items-center gap-2">
                          Criticality
                        </label>
                        <select 
                          value={filterCriticality}
                          onChange={(e) => setFilterCriticality(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-300 outline-none focus:border-cyan-400/50 transition-colors"
                        >
                          <option value="all">All Levels</option>
                          <option value="high">High Risk</option>
                          <option value="medium">Standard</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>

                      <div className="flex-1 min-w-[120px] space-y-2">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-600 flex items-center gap-2">
                          Status
                        </label>
                        <select 
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-300 outline-none focus:border-cyan-400/50 transition-colors"
                        >
                          <option value="all">All Status</option>
                          <option value="completed">Completed</option>
                          <option value="pending">In Progress</option>
                        </select>
                      </div>

                      <div className="flex-1 min-w-[120px] space-y-2">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-slate-600 flex items-center gap-2">
                          Date Range
                        </label>
                        <select 
                          value={filterDateRange}
                          onChange={(e) => setFilterDateRange(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-300 outline-none focus:border-cyan-400/50 transition-colors"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <p className="text-sm">{searchQuery ? 'No matching protocols found.' : 'No protocols generated yet.'}</p>
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="group flex flex-col p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-cyan-400/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-sm font-bold uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{item.goal}</div>
                            <div className="flex items-center gap-3">
                              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                {new Date(item.createdAt).toLocaleDateString()} • {item.steps.length} Steps
                              </div>
                              <div className="flex gap-1.5">
                                {item.steps.every(s => s.isCompleted) ? (
                                  <span className="text-[7px] font-mono uppercase tracking-widest px-1 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded">Verified</span>
                                ) : (
                                  <span className="text-[7px] font-mono uppercase tracking-widest px-1 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded">Active</span>
                                )}
                                {item.criticality === 'high' ? (
                                  <span className="text-[7px] font-mono uppercase tracking-widest px-1 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded">High Risk</span>
                                ) : item.criticality === 'medium' ? (
                                  <span className="text-[7px] font-mono uppercase tracking-widest px-1 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded">Standard</span>
                                ) : item.criticality === 'low' ? (
                                  <span className="text-[7px] font-mono uppercase tracking-widest px-1 py-0.5 bg-slate-500/10 border border-slate-500/20 text-slate-400 rounded">Low Priority</span>
                                ) : item.steps.some(s => s.criticality === 'high') && (
                                  <span className="text-[7px] font-mono uppercase tracking-widest px-1 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded">High Risk</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={(e) => deleteFromHistory(item.id, e)}
                              className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.map((tag, idx) => (
                              <span key={idx} className="text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 rounded group-hover:border-cyan-400/20 group-hover:text-cyan-400/60 transition-colors">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
                  <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    Last 20 protocols stored locally
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!checklist ? (
            <div className="space-y-16 md:space-y-32 pb-16 md:pb-32">
              {/* Hero Section */}
              <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-12 md:pt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
                <motion.div 
                  key="hero-text"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 md:space-y-8 text-center lg:text-left"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                    </span>
                    AI-Powered Precision
                  </div>
                  
                  <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                    FLAWLESS <br />
                    <span className="text-cyan-400 italic font-serif font-light">Execution.</span>
                  </h2>
                  
                  <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
                    ExactPath turns any goal into a flawless, step-by-step plan. Eliminate human error with expert-level verification.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div id="goal-input-label" className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Interactive Demo</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Criticality:</span>
                        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                          {[
                            { id: 'low', label: 'Low Priority' },
                            { id: 'medium', label: 'Standard' },
                            { id: 'high', label: 'High Risk' }
                          ].map((level) => (
                            <button
                              key={level.id}
                              type="button"
                              onClick={() => setSelectedCriticality(level.id as any)}
                              className={`px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded transition-all ${
                                selectedCriticality === level.id 
                                  ? level.id === 'high' ? 'bg-red-500 text-slate-950' : 
                                    level.id === 'medium' ? 'bg-blue-500 text-slate-950' : 
                                    'bg-slate-500 text-slate-950'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
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
                          className="flex-1 bg-transparent px-4 py-4 md:px-6 md:py-5 text-base md:text-xl focus:outline-none placeholder:text-slate-600 transition-all"
                          disabled={isLoading}
                          aria-labelledby="goal-input-label"
                        />
                        <button 
                          type="submit"
                          disabled={isLoading || !goal.trim() || !isAuthReady}
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
                    {!user && (
                      <div className="pt-4 flex items-center gap-4">
                        <button 
                          onClick={handleSignup}
                          className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex items-center gap-2 text-slate-600 dark:text-slate-400"
                        >
                          <UserPlus className="w-4 h-4" /> Create Free Account
                        </button>
                        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">to save your protocols</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Hero Mockup */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative hidden lg:block w-full max-w-full"
                >
                  <div className="absolute -inset-4 bg-cyan-400/5 rounded-3xl blur-3xl"></div>
                    <div className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden aspect-[4/3] max-w-full">
                      <div className="bg-slate-100 dark:bg-slate-800/50 p-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="inline-block bg-white dark:bg-slate-950 px-3 py-1 rounded text-[8px] font-mono text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-transparent">
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
                              step.status === 'completed' ? 'bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/50 opacity-50' :
                              step.status === 'active' ? 'bg-white dark:bg-slate-950 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]' :
                              'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800/30'
                            }`}
                            role="button"
                            aria-label={`Toggle ${step.title} status`}
                          >
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              step.status === 'completed' ? 'bg-green-500 border-green-500' :
                              step.status === 'active' ? 'border-cyan-400' :
                              'border-slate-300 dark:border-slate-700'
                            }`}>
                              {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                              {step.status === 'active' && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>}
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white">{step.title}</div>
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
              <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                  <div className="p-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 via-cyan-400/20 to-slate-200 dark:to-slate-800 rounded-3xl">
                    <div className="bg-white dark:bg-slate-950 rounded-[22px] overflow-hidden">
                      <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">Sample Output: Database Migration</span>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">03 Steps Generated</div>
                      </div>
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {[
                          { 
                            title: 'Verify Backup Integrity', 
                            desc: 'Ensure the latest database snapshot is restorable.',
                            criteria: 'Run "pg_restore --list" on the latest dump and confirm exit code 0.',
                            rationale: 'A migration without a verified backup is a single point of failure.',
                            outcome: '100% restorable snapshot verified via checksum.',
                            pitfalls: 'Stale snapshots or corrupted dump headers.'
                          },
                          { 
                            title: 'Lock Write Operations', 
                            desc: 'Prevent data drift during the migration window.',
                            criteria: 'Execute "SET TRANSACTION READ ONLY" and verify application logs for 403 errors.',
                            rationale: 'Concurrent writes during schema delta cause catastrophic data corruption.',
                            outcome: 'Global write-lock achieved; connection pool stabilized.',
                            pitfalls: 'Zombie processes bypassing transaction locks.'
                          },
                          { 
                            title: 'Execute Schema Delta', 
                            desc: 'Apply the SQL migration script to the production instance.',
                            criteria: 'Query "information_schema.columns" to confirm new columns exist.',
                            rationale: 'The final stage of structural transformation.',
                            outcome: 'New schema live; V2 application compatibility enabled.',
                            pitfalls: 'Deadlocks on high-traffic tables during column addition.'
                          }
                        ].map((step, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => toggleSampleStep(idx)}
                            className={`p-4 md:p-6 space-y-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer ${sampleSteps[idx] ? 'opacity-50' : ''}`}
                            role="button"
                            aria-label={`Toggle sample step ${idx + 1}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sampleSteps[idx] ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-700'}`}>
                                {sampleSteps[idx] && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                              </div>
                              <div className="text-cyan-400 font-mono text-xs">0{idx+1}</div>
                              <h5 className={`font-bold uppercase text-sm tracking-tight text-slate-900 dark:text-white ${sampleSteps[idx] ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>{step.title}</h5>
                            </div>
                            <p className="text-xs text-slate-500 ml-10 md:ml-12">{step.desc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-10 md:ml-12">
                              <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="text-[8px] font-mono uppercase tracking-widest text-cyan-400">Rationale</div>
                                <p className="text-[10px] text-slate-400 italic leading-relaxed">{step.rationale}</p>
                              </div>
                              <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="text-[8px] font-mono uppercase tracking-widest text-green-400">Outcome</div>
                                <p className="text-[10px] text-slate-400 italic leading-relaxed">{step.outcome}</p>
                              </div>
                              <div className="space-y-1 p-3 bg-red-500/5 dark:bg-red-500/5 rounded-lg border border-red-500/10">
                                <div className="text-[8px] font-mono uppercase tracking-widest text-red-400">Pitfalls</div>
                                <p className="text-[10px] text-slate-400 italic leading-relaxed">{step.pitfalls}</p>
                              </div>
                            </div>

                            <div className="ml-10 md:ml-12 p-3 bg-slate-50 dark:bg-slate-900 border-l-2 border-cyan-400 text-[9px] font-mono italic text-cyan-400/80">
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
              <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-12 md:space-y-16">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Engineered for Reliability</h3>
                  <div className="h-1 w-20 bg-cyan-400 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {[
                    { 
                      title: 'Expert Logic', 
                      desc: "Protocols built on mission-critical logic to ensure flawless execution in any scenario. Eliminate human error with zero-fault tolerance.",
                      icon: <ShieldCheck className="w-6 h-6" />,
                      color: 'cyan'
                    },
                    { 
                      title: 'Verification', 
                      desc: "Specific criteria for every step. Confirm success with precision, not guesswork. Verify against objective outputs, not just checkboxes.",
                      icon: <Target className="w-6 h-6" />,
                      color: 'purple'
                    },
                    { 
                      title: 'Rapid Deployment', 
                      desc: "Instant generation of complex workflows. Move from objective to execution in seconds with expert-level technical accuracy.",
                      icon: <Zap className="w-6 h-6" />,
                      color: 'blue'
                    }
                  ].map((item, i) => (
                    <div key={i} className="group p-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-cyan-400/50 transition-all hover:-translate-y-1 shadow-sm dark:shadow-none">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800 group-hover:border-cyan-400/30 group-hover:text-cyan-400 transition-all">
                        {item.icon}
                      </div>
                      <h4 className="text-xl font-bold uppercase mb-4 tracking-tight text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Real Use Cases Section */}
              <section id="use-cases" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-16 py-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">Mission Profiles</div>
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Mission Profiles</h3>
                    <p className="text-slate-500 text-sm md:text-base max-w-xl">
                      Precision protocols for high-stakes engineering, leadership, and safety-critical operations.
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 hidden md:block mb-4"></div>
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
                    <div key={i} className="group relative bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all shadow-sm dark:shadow-none">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-cyan-400/50 transition-colors">
                          {React.cloneElement(useCase.icon as React.ReactElement, { className: "w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-cyan-400 transition-colors" })}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">{useCase.title}</h4>
                            <p className="text-xs text-slate-500">{useCase.desc}</p>
                          </div>
                          <div className="space-y-2">
                            {useCase.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
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
                            className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 pt-2"
                          >
                            Try this protocol <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Home View: Moved Detailed Stats to System Page */}
              {!checklist && !showHistory && !showMarketplace && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20">
                  <div className="p-6 sm:p-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl md:rounded-[3rem] text-center space-y-8 backdrop-blur-md">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                      Mission Control Operational
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic font-serif leading-none text-slate-900 dark:text-white">
                      Execute with <br />
                      <span className="text-cyan-400">Zero Fault</span> Tolerance.
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                      Welcome back, operator. ExactPath is standing by for new mission objectives. We translate high-stakes goals into bulletproof, verifiable protocols.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                      <button 
                        onClick={() => {
                          setGoal('');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          document.getElementById('goal-input')?.focus();
                        }} 
                        className="px-10 py-5 bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                      >
                        New Objective
                      </button>
                      <button 
                        onClick={() => setShowSystem(true)} 
                        className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                      >
                        System Specs
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              key="checklist"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto p-4 sm:p-6 md:p-12 space-y-8 md:space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6 md:pb-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
                      {isShared ? 'Shared Protocol' : 'Active Protocol'}
                    </div>
                    {isShared && (
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Read Only
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-tight md:leading-none">{checklist.goal}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={shareChecklist}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex-1 md:flex-none text-slate-600 dark:text-slate-400"
                    aria-label="Collaborate & Share"
                  >
                    <Share2 className="w-3 h-3" />
                    Collaborate
                  </button>
                  {checklist.explanation && (
                    <button 
                      onClick={() => setShowExplanation(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex-1 md:flex-none text-slate-600 dark:text-slate-400"
                      aria-label="Explain AI Decision"
                    >
                      <Brain className="w-3 h-3" /> Explain
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (checklist) {
                        const allText = checklist.steps.map((s, i) => `Step ${i + 1}: ${s.title}. ${s.description}`).join('. ');
                        speakText(`Protocol for ${checklist.goal}. ${allText}`);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex-1 md:flex-none text-slate-600 dark:text-slate-400"
                    aria-label="Speak Protocol"
                  >
                    <Volume2 className="w-3 h-3" /> Listen
                  </button>
                  <div className="flex items-center gap-2">
                    {userProfile?.isPro && (
                      <div className="flex items-center gap-2 mr-2">
                        <button 
                          onClick={exportAsPDF}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex-1 md:flex-none text-slate-600 dark:text-slate-400"
                          aria-label="Export as PDF"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                        <button 
                          onClick={exportToCSV}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex-1 md:flex-none text-slate-600 dark:text-slate-400"
                          aria-label="Export as CSV"
                        >
                          <Download className="w-3 h-3" /> CSV
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={exportAsText}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex-1 md:flex-none text-slate-600 dark:text-slate-400"
                      aria-label="Export as Text"
                    >
                      <FileText className="w-3 h-3" /> TXT
                    </button>
                    <button 
                      onClick={reset}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:border-cyan-400/50 hover:text-cyan-400 transition-all flex-1 md:flex-none text-slate-600 dark:text-slate-400"
                      aria-label="Start New Objective"
                    >
                      <RefreshCw className="w-3 h-3" /> New Objective
                    </button>
                  </div>
                </div>
              </div>

              {checklist.deepExplanation && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Brain className="w-24 h-24 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                      <Info className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Deep Strategy & Objectives</h3>
                  </div>
                  <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {checklist.deepExplanation.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-sm md:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-800"></div>
                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest italic">
                      &gt; Strategic Analysis Complete
                    </div>
                  </div>

                  {/* Protocol Chat Engine */}
                  <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white">Strategic Prompt Engine</h4>
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                        Powered by Gemini 2.0 Thinking
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {checklist.messages && checklist.messages.length > 0 ? (
                        checklist.messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-800 dark:text-cyan-100' 
                                : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {msg.role === 'user' ? <UserIcon className="w-3 h-3 text-cyan-400" /> : <Brain className="w-3 h-3 text-cyan-400" />}
                                <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500">
                                  {msg.role === 'user' ? 'Operator' : 'Strategic Advisor'}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
                          <p className="text-xs text-slate-600 italic">No strategic inquiries initiated. Ask about edge cases, optimizations, or specific risks.</p>
                        </div>
                      )}
                      {isProtocolChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">Thinking deeply...</span>
                          </div>
                        </div>
                      )}
                      <div ref={protocolChatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleProtocolChat} className="relative">
                      <input 
                        type="text"
                        value={protocolChatInput}
                        onChange={(e) => setProtocolChatInput(e.target.value)}
                        placeholder="Inquire about strategic optimizations..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-6 pr-16 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-all"
                        disabled={isProtocolChatLoading}
                      />
                      <button 
                        type="submit"
                        disabled={!protocolChatInput.trim() || isProtocolChatLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-cyan-400 text-slate-950 rounded-lg hover:bg-slate-900 hover:text-white disabled:opacity-30 transition-all"
                      >
                        {isProtocolChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              <Reorder.Group 
                axis="y" 
                values={checklist.steps} 
                onReorder={handleReorder}
                className="space-y-4"
              >
                {checklist.steps.map((step, index) => (
                  <Reorder.Item 
                    key={step.id}
                    value={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (!isShared) toggleStep(step.id);
                    }}
                    className={`group relative overflow-hidden rounded-2xl border transition-all ${
                      !isShared ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      step.isCompleted 
                        ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-400/5'
                    }`}
                    role="button"
                    aria-label={`Step ${index + 1}: ${step.title}. ${step.isCompleted ? 'Completed' : 'Mark as complete'}`}
                    aria-pressed={step.isCompleted}
                  >
                    {step.isCompleted && (
                      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none"></div>
                    )}
                    
                    <div className="p-4 sm:p-6 md:p-8 flex gap-4 sm:gap-6">
                      <div className="flex flex-col items-center gap-4 mt-1">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isShared) toggleStep(step.id);
                          }}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            step.isCompleted 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-slate-700 group-hover:border-cyan-400'
                          }`}
                        >
                          {step.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-slate-950" />
                          ) : (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          )}
                        </div>
                        {!step.isCompleted && (
                          <div className="cursor-grab active:cursor-grabbing p-1 text-slate-700 hover:text-cyan-400 transition-colors" style={{ touchAction: 'none' }}>
                            <GripVertical className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-4" onClick={() => {
                        if (!isShared && editingStepId !== step.id) toggleStep(step.id);
                      }}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="font-mono text-xs text-slate-600">{(index + 1).toString().padStart(2, '0')}</span>
                            {editingStepId === step.id ? (
                              <input 
                                type="text"
                                value={editValues.title}
                                onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1 text-lg font-bold uppercase tracking-tight text-white focus:border-cyan-400 outline-none"
                              />
                            ) : (
                              <h3 className={`text-xl font-bold uppercase tracking-tight ${step.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                                {step.title}
                              </h3>
                            )}
                            {step.criticality === 'high' && !step.isCompleted && (
                              <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] px-2 py-0.5 rounded font-mono uppercase tracking-widest">Critical</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!isShared && !step.isCompleted && (
                              <>
                                {editingStepId === step.id ? (
                                  <>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        saveEdit();
                                      }}
                                      className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-full text-green-400 transition-colors"
                                      aria-label="Save step"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelEdit();
                                      }}
                                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full text-red-400 transition-colors"
                                      aria-label="Cancel edit"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVerifyingStepId(step.id);
                                      }}
                                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 px-3"
                                      aria-label="Verify step"
                                    >
                                      <ShieldCheck className="w-4 h-4" />
                                      <span className="text-[10px] font-mono uppercase tracking-widest">Verify</span>
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(step);
                                      }}
                                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-cyan-400 transition-colors"
                                      aria-label="Edit step"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                speakStep(step);
                              }}
                              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-cyan-400 transition-colors"
                              aria-label="Speak step"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => toggleExpand(step.id, e)}
                              className={`p-2 rounded-full transition-all ${
                                expandedStepIds.has(step.id) 
                                  ? 'bg-cyan-400 text-slate-950' 
                                  : 'bg-slate-800 text-slate-400 hover:text-cyan-400'
                              }`}
                              aria-label={expandedStepIds.has(step.id) ? "Show less" : "Show more details"}
                            >
                              {expandedStepIds.has(step.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {editingStepId === step.id ? (
                          <textarea 
                            value={editValues.description}
                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none min-h-[80px]"
                          />
                        ) : (
                          <p className={`text-sm leading-relaxed ${step.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                            {step.description}
                          </p>
                        )}

                        {expandedStepIds.has(step.id) && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                              <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Rationale
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                {step.rationale || 'Generating strategic rationale...'}
                              </p>
                            </div>
                            <div className="space-y-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                              <div className="text-[9px] font-mono uppercase tracking-widest text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> Expected Outcome
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                {step.expectedOutcome || 'Analyzing target state...'}
                              </p>
                            </div>
                            <div className="space-y-2 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                              <div className="text-[9px] font-mono uppercase tracking-widest text-red-400 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Potential Pitfalls
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                {step.potentialPitfalls || 'Scanning for mission risks...'}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {verifyingStepId === step.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-6 pt-6 border-t border-slate-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isVerifying ? (
                              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                                <p className="text-sm font-mono text-cyan-400 animate-pulse uppercase tracking-widest">Analyzing Evidence...</p>
                              </div>
                            ) : step.verificationFeedback ? (
                              <div className="space-y-6">
                                <div className={`p-6 rounded-2xl border ${
                                  step.verificationStatus === 'passed' 
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                  <div className="flex items-center gap-3 mb-4">
                                    {step.verificationStatus === 'passed' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                    <h4 className="text-lg font-bold uppercase tracking-tight">
                                      Verification {step.verificationStatus === 'passed' ? 'Successful' : 'Failed'}
                                    </h4>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                      <p className="text-sm leading-relaxed text-slate-300">
                                        {step.verificationFeedback}
                                      </p>
                                    </div>
                                    {step.verificationStatus === 'failed' && (
                                      <div className="flex items-center gap-2 text-[10px] font-mono text-red-400/70 uppercase tracking-widest">
                                        <Info className="w-3 h-3" /> Please address the feedback and resubmit evidence below.
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {step.verificationStatus === 'failed' && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Updated Evidence</label>
                                      <textarea 
                                        value={verificationEvidence}
                                        onChange={(e) => setVerificationEvidence(e.target.value)}
                                        placeholder="Provide updated evidence based on the feedback..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-cyan-400 outline-none min-h-[100px]"
                                      />
                                    </div>
                                    <div className="flex gap-3">
                                      <button 
                                        onClick={() => handleVerifyStep(step.id, verificationEvidence)}
                                        disabled={isVerifying || !verificationEvidence.trim()}
                                        className="flex-1 py-3 bg-cyan-400 text-slate-950 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                      >
                                        <ShieldCheck className="w-4 h-4" />
                                        Resubmit Evidence
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setVerifyingStepId(null);
                                          setVerificationEvidence('');
                                        }}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-700 transition-all"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {step.verificationStatus === 'passed' && (
                                  <button 
                                    onClick={() => {
                                      setVerifyingStepId(null);
                                      setVerificationEvidence('');
                                    }}
                                    className="w-full py-3 bg-cyan-400 text-slate-950 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all"
                                  >
                                    Done
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Evidence of Execution</label>
                                  <textarea 
                                    value={verificationEvidence}
                                    onChange={(e) => setVerificationEvidence(e.target.value)}
                                    placeholder="Describe how you completed this step or provide data/logs as evidence..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-cyan-400 outline-none min-h-[100px]"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => handleVerifyStep(step.id, verificationEvidence)}
                                    disabled={isVerifying || !verificationEvidence.trim()}
                                    className="flex-1 py-3 bg-cyan-400 text-slate-950 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                    <ShieldCheck className="w-4 h-4" />
                                    Submit Evidence
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setVerifyingStepId(null);
                                      setVerificationEvidence('');
                                    }}
                                    className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-700 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {step.verificationFeedback && (
                          <div className={`p-4 rounded-xl border ${
                            step.verificationStatus === 'passed' 
                              ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                              : 'bg-red-500/5 border-red-500/20 text-red-400'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {step.verificationStatus === 'passed' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                                Verification {step.verificationStatus}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed opacity-90">{step.verificationFeedback}</p>
                            {step.evidence && (
                              <div className="mt-3 pt-3 border-t border-current/10">
                                <span className="text-[8px] font-mono uppercase tracking-widest opacity-50 block mb-1">Evidence Provided:</span>
                                <p className="text-[10px] italic opacity-70 line-clamp-2">{step.evidence}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {(expandedStepIds.has(step.id) || !step.isCompleted) && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-4"
                          >
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                              <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Target className="w-3 h-3" /> Verification Criteria
                                </div>
                                {expandedStepIds.has(step.id) && (
                                  <span className="text-[8px] opacity-40">Mandatory Review</span>
                                )}
                              </div>
                              {editingStepId === step.id ? (
                                <textarea 
                                  value={editValues.verificationCriteria}
                                  onChange={(e) => setEditValues({ ...editValues, verificationCriteria: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-mono italic text-slate-300 focus:border-cyan-400 outline-none min-h-[60px]"
                                />
                              ) : (
                                <p className="text-xs font-mono italic text-slate-300 leading-relaxed">
                                  {step.verificationCriteria}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

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
      <footer id="contact" className="border-t border-slate-200 dark:border-slate-900 py-12 md:py-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12" aria-label="Footer Navigation">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <Logo className="w-8 h-8" iconOnly />
                <span className="font-black uppercase tracking-tighter text-xl italic font-serif">ExactPath</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Precision protocol engine for high-stakes environments. Built for flawless execution and mission-critical reliability.
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
                <li><button onClick={handleAdminLogin} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Admin Login
                </button></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-900 gap-6">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              © 2026 ExactPath Precision Systems. All rights reserved.
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

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        initialMode={authModal.mode} 
      />

      <PricingModal 
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
        isLoading={isLoading}
      />

      {checklist && (
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={`${window.location.origin}${window.location.pathname}?room=${checklist.id}`}
          goal={checklist.goal}
        />
      )}

      {showMarketplace && (
        <TemplateMarketplace 
          onClose={() => setShowMarketplace(false)}
          onUpgrade={() => {
            setShowMarketplace(false);
            setShowPricing(true);
          }}
          isPro={userProfile?.isPro || false}
          onImport={async (template) => {
            if (!user) return;
            
            // Check limits for import too
            const currentMonth = new Date().toISOString().slice(0, 7);
            const isNewMonth = userProfile?.lastGenerationMonth !== currentMonth;
            const currentCount = isNewMonth ? 0 : (userProfile?.generationCount || 0);
            
            // Test mode override
            const isTestMode = localStorage.getItem('exactpath_test_limit') === 'true';
            const effectiveCount = isTestMode ? 3 : currentCount;
            const effectiveIsPro = isTestMode ? false : userProfile?.isPro;
            const effectiveRole = isTestMode ? 'user' : userProfile?.role;

            if (!effectiveIsPro && effectiveRole !== 'admin' && effectiveCount >= 3) {
              setShowMarketplace(false);
              setShowPricing(true);
              setError("Free tier limit reached (3/3). Upgrade to Pro to import more protocols.");
              return;
            }

            const importedChecklist: Checklist = {
              id: `checklist-${Date.now()}`,
              goal: template.title,
              steps: Array.from({ length: template.steps }).map((_, i) => ({
                id: `step-${i}`,
                title: `Protocol Step ${i + 1}`,
                description: `Standard operating procedure for ${template.title.toLowerCase()} - Section ${i + 1}.`,
                verificationCriteria: `Verify compliance with ${template.category} standards.`,
                isCompleted: false,
                criticality: 'medium'
              })),
              tags: [template.category, 'Marketplace'],
              explanation: `Imported from ExactPath Marketplace. Author: ${template.author}`,
              deepExplanation: `This protocol was imported from the ExactPath Marketplace. It represents a standard operating procedure for ${template.title}. Follow the steps precisely to ensure compliance with ${template.category} standards.`,
              messages: [],
              createdAt: Date.now(),
              criticality: 'medium',
              createdBy: user.uid
            };

            try {
              const batch = writeBatch(db);
              
              // 1. Save Checklist
              const checklistRef = doc(db, 'checklists', importedChecklist.id);
              batch.set(checklistRef, importedChecklist);
              
              // 2. Update User Usage
              const userRef = doc(db, 'users', user.uid);
              if (isNewMonth) {
                batch.update(userRef, {
                  generationCount: 1,
                  lastGenerationMonth: currentMonth
                });
              } else {
                batch.update(userRef, {
                  generationCount: increment(1),
                  lastGenerationMonth: currentMonth
                });
              }

              await batch.commit();

              setChecklist(importedChecklist);
              setHistory(prev => [importedChecklist, ...prev].slice(0, 20));
              setShowMarketplace(false);
              setSuccess(`Successfully imported ${template.title} protocol.`);
              setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
              console.error("Import Error:", err);
              setError("Failed to import protocol. Please try again.");
            }
          }}
        />
      )}
      <ChatBot ai={ai} />
    </div>
  );
}
