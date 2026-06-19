import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Terminal, 
  Copy, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  RefreshCw, 
  Bot, 
  User, 
  Cpu, 
  Smartphone, 
  Layers, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  Bookmark, 
  Info,
  Flame,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface BotMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  brand?: string;
  symptom?: string;
  extractedCommands?: string[];
}

interface DefaultSymptom {
  key: string;
  label: string;
  subLabel: string;
  icon: string;
  promptText: string;
}

export default function AITroubleshooter({ isPro, openUpgradeModal }: { isPro: boolean; openUpgradeModal: () => void }) {
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "স্বাগতম! আমি আপনার ড্রয়েডলিংক এআই ট্রাবলশুটার (A.I. Troubleshooter)। আপনার ফোনে কি কালো স্ক্রিন (Black Screen), ভুতুড়ে টাচ (Ghost Touch), বা ওটিজি ডিটেকশন জটিলতা হচ্ছে? নিচে যেকোনো সাধারণ সমস্যা সিলেক্ট করুন অথবা নিচে চ্যাট করুন। আমি আপনাকে তাৎক্ষণিক এডিবি কমান্ড ও রিকভারি নির্দেশিকা দেব।",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Generic');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  
  // Simulated ADB Execution panel state
  const [activeAdbCmd, setActiveAdbCmd] = useState<string | null>(null);
  const [simulatingExecution, setSimulatingExecution] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Predefined interactive symptoms list
  const predefinedSymptoms: DefaultSymptom[] = [
    {
      key: 'black_screen',
      label: 'ব্ল্যাক স্ক্রিন / কালো পর্দা',
      subLabel: 'Black Screen (No display, but phone vibrates)',
      icon: '📱',
      promptText: 'আমার ফোনের পর্দা সম্পূর্ণ কালো কিন্তু ভাইব্রেশন ও সাউন্ড কাজ করছে। এডিবি বা ওটিজি দিয়ে কিভাবে স্ক্রিন মিরর করব বা ডেটা ব্যাকআপ করব?'
    },
    {
      key: 'ghost_touch',
      label: 'ভুতুড়ে টাচ / অকার্যকর স্ক্রিন',
      subLabel: 'Ghost Touch or Unresponsive Touch',
      icon: '👻',
      promptText: 'আমার ফোনে মারাত্মক ঘোস্ট টাচ (ভুতুড়ে ক্লিক) হচ্ছে অথবা টাচ কাজ করছে না। লক পিন বাইপাস করার জন্য কীবোর্ড কমান্ড এবং এডিবি অটোমেশন দরকার।'
    },
    {
      key: 'usb_debugging',
      label: 'ডিবাগিং বন্ধ / USB Debugging Off',
      subLabel: 'How to bypass screen when ADB is disabled',
      icon: '🔌',
      promptText: 'আমার ফোনের স্ক্রিন ভাঙা এবং ইউএসবি ডিবাগিং (USB Debugging) অফ করা আছে। এডিবি বা রিকভারি শেলে ঢুকে কিভাবে তা অ্যাক্টিভ করতে পারব?'
    },
    {
      key: 'bootloop_fix',
      label: 'বুটলুপ বা লোগো হ্যাং',
      subLabel: 'Bootloop or Stuck on Boot Logo',
      icon: '🔄',
      promptText: 'ফোনটি অন করলেই কোম্পানির লোগো এসে রিস্টার্ট নেয় বা রিকভারিতে চলে যায়। ডেটা লস ছাড়া ফাস্টবুট বা এডিবি দিয়ে কিভাবে এটি ঠিক বা ব্যাকআপ করব?'
    }
  ];

  // RegEx helper to pull out ADB commands from returned bot response
  const extractAdbCommands = (responseText: string): string[] => {
    const rawMatches = responseText.match(/adb[^\n`]+/gi) || [];
    return rawMatches.map(cmd => {
      // Clean up common markdown wrapping artifacts
      return cmd.replace(/[`*#]/g, '').trim();
    }).filter(cmd => cmd.toLowerCase().startsWith('adb'));
  };

  const handleSendMessage = async (textToSend: string, symptomKey?: string) => {
    if (!textToSend.trim()) return;

    // Check if user is abusing free tier
    if (!isPro && messages.filter(m => m.sender === 'user').length >= 3) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          text: textToSend,
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: "🔒 **এআই ট্রাবলশুটার ফ্রি ট্রায়াল লিমিট সমাপ্ত!** আপনার ফ্রি সংস্করণে এআই ডায়াগনস্টিক অনুসন্ধানের সীমা ২ বার। কাস্টম ওটিজি স্ক্রিপ্ট, লোকাল ডেক্স কাস্টিং ডিরেক্টরি এবং আনলিমিটেড এআই কমান্ড কুয়েরির অ্যাক্সেস আনলক করতে এখনই আমাদের প্রফেশনাল লাইসেন্সে (PRO Edition) ট্র্যান্সফার করুন।",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setInputText('');
      return;
    }

    const userMsg: BotMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
      brand: selectedBrand,
      symptom: symptomKey
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const steps = [
      'ডিভাইস মডেল ও ব্র্যান্ড কনফিগারেশন রেন্ডার হচ্ছে...',
      'ভার্চুয়াল ওটিজি লেআউটের সিকোয়েন্সিং বিশ্লেষণ করা হচ্ছে...',
      'জেমিনি রিকভারি ক্লাউড থেকে এক্সপার্ট এডিবি কমান্ড হ্যাকস ম্যাপ করা হচ্ছে...',
      'সহজ টেকনিক্যাল বাংলা ভাষায় ফাইল রেডি করা হচ্ছে...'
    ];

    let currentStepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setLoadingStep(steps[currentStepIdx]);
      }
    }, 1200);

    try {
      // Build simple user history format for API
      const conversationHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      // Call express API
      const response = await fetch('/api/gemini/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          brand: selectedBrand,
          history: conversationHistory
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error('সার্ভার থেকে এআই রেসপন্স সংযোগ বিচ্ছিন্ন হয়ে গিয়েছে।');
      }

      const data = await response.json();
      const botText = data.reply || "আফসোস, এআই সিস্টেম উত্তর তৈরিতে ব্যর্থ হয়েছে।";

      // Pull ADB commands out for simulated executing actions
      const codes = extractAdbCommands(botText);

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: botText,
          timestamp: new Date().toLocaleTimeString(),
          extractedCommands: codes.length > 0 ? codes : undefined
        }
      ]);

    } catch (error: any) {
      clearInterval(stepInterval);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'bot',
          text: "⚠️ **এআই নেটওয়ার্ক সকেট ইরর:** " + (error.message || "সার্ভার রেসপন্স কানেকশন পেতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে Settings-এ গিয়ে API Key সেট করুন।"),
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const runSimulatedCommand = (cmd: string) => {
    setActiveAdbCmd(cmd);
    setSimulatingExecution(true);
    setExecutionLogs([`$ ${cmd}`, `Initializing ADB handshake with device (Brand: ${selectedBrand})...`]);

    const steps = [
      'Sending key package payloads to target socker daemon...',
      'Simulating touch inject signals across physical matrix...',
      'Outcome: Command acknowledged! Device reacted successfully. ✔️',
      'Dumped Shell Response: [Success - Screen mapping refreshed]'
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (count < steps.length) {
        setExecutionLogs(prev => [...prev, steps[count]]);
        count++;
      } else {
        clearInterval(interval);
        setSimulatingExecution(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[700px] bg-[#070b14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-sans lg:max-h-[85vh]">
      
      {/* Academy Premium Header Layout */}
      <div className="bg-gradient-to-r from-[#11182d] via-[#070b13] to-[#0a1020] p-4.5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-600 text-white font-extrabold tracking-wide uppercase shadow flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3 text-cyan-300 fill-cyan-300" />
            REAL-TIME GEMINI ENGINE
          </span>
          <h2 className="text-sm font-bold text-white mt-1 flex items-center gap-2">
            <Bot className="w-4.5 h-4.5 text-cyan-400" />
            এ.আই. ট্রাবলশুটার (A.I. Troubleshooter)
          </h2>
          <p className="text-xxxxs sm:text-xxs text-slate-400 mt-0.5">
            ভাঙা ডিসপ্লের ব্যাকআপ, রিকভারি অ্যান্ড কাস্টম ওটিজি কী-ম্যাপিং এর তাত্ক্ষণিক সমাধান পেতে জেমিনি এআই চ্যাট করুন।
          </p>
        </div>

        {/* Brand selection dropdown */}
        <div className="flex gap-2 items-center text-xxs font-sans shrink-0 w-full md:w-auto">
          <span className="text-gray-500 font-medium whitespace-nowrap">ডিভাইস ব্র্যান্ড:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 py-1.5 px-3 rounded outline-none focus:border-cyan-500 font-sans text-xxxxs sm:text-xxs font-bold"
          >
            <option value="Generic">Generic Android (সাধারণ ফোন)</option>
            <option value="Samsung">Samsung (স্যামসাং ডেক্স/লক)</option>
            <option value="Xiaomi">Xiaomi / Poco (এমআই রিকভারি)</option>
            <option value="OnePlus">OnePlus / Oppo (এডভান্সড কাস্ট)</option>
            <option value="Realme">Realme (ওটিজি এনভায়রনমেন্ট)</option>
            <option value="Pixel">Google Pixel (এডিবি বুটলোড)</option>
          </select>
        </div>
      </div>

      {/* Main split Screen Panel: Left-Side Symptoms list & Logs | Right Chat panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0 bg-[#060911]">
        
        {/* Left pane: Prebuilt Symptom selector shortcuts (width 4 columns) */}
        <div className="lg:col-span-4 border-r border-slate-900 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
          <div>
            <span className="text-[10px] font-mono text-cyan-500 font-bold block mb-1 uppercase tracking-wider">🎯 QUICK SELECT SYMPTOMS</span>
            <p className="text-gray-400 text-xxxxs sm:text-xxs leading-snug">
              আপনার ফোনের নির্দিষ্ট সমস্যাটির উপর ক্লিক করুন। এআই তাৎক্ষণিকভাবে আপনার ব্র্যান্ড অনুযায়ী এডিবি স্ক্রিপ্টিং ওটিজি গাইড তৈরি করবে।
            </p>
          </div>

          <div className="space-y-2 select-none">
            {predefinedSymptoms.map((simp) => (
              <button
                key={simp.key}
                onClick={() => handleSendMessage(simp.promptText, simp.key)}
                className="w-full text-left p-3 rounded-lg bg-slate-900/60 border border-slate-850 hover:border-cyan-500/40 hover:bg-[#12111d]/40 transition-all cursor-pointer group flex gap-3 items-start"
              >
                <div className="text-base bg-[#03060c] p-1.5 rounded border border-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                  {simp.icon}
                </div>
                <div className="font-sans">
                  <span className="font-extrabold text-slate-205 text-xxs group-hover:text-cyan-400 transition-colors block">{simp.label}</span>
                  <span className="text-gray-500 text-xxxxs text-[9px] font-mono block mt-0.5">{simp.subLabel}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Simulated Active ADB Live execution logs showing real dynamic response */}
          {activeAdbCmd && (
            <div className="p-3 bg-black border border-slate-900 rounded-lg text-xxs font-mono space-y-2 mt-4">
              <div className="flex justify-between items-center text-[9px] border-b border-slate-900 pb-1.5 text-gray-400">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  LIVE ADB SHELL SIMULATOR
                </span>
                <button 
                  onClick={() => setActiveAdbCmd(null)} 
                  className="hover:text-white"
                >
                  Clear
                </button>
              </div>

              <div className="max-h-[140px] overflow-y-auto space-y-1 text-slate-300 text-xxxxs scrollbar-thin">
                {executionLogs.map((log, lIdx) => (
                  <p key={lIdx} className={log.startsWith('$') ? 'text-cyan-400 font-semibold' : log.includes('Success') ? 'text-emerald-400' : 'text-gray-500'}>
                    {log}
                  </p>
                ))}
              </div>

              {simulatingExecution && (
                <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>সিগন্যাল প্যাকেট ট্রান্সমিট হচ্ছে...</span>
                </div>
              )}
            </div>
          )}

          {/* Tech Tip details */}
          <div className="p-3 bg-amber-955/5 border border-amber-500/10 rounded-lg space-y-1.5 text-xxxxs sm:text-xxs">
            <span className="text-amber-400 font-bold block uppercase tracking-wide flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              টেকনিক ল্যাব সিক্রেট:
            </span>
            <p className="text-gray-400 leading-normal">
              ফোনের স্ক্রিন কালো কিন্তু বুটলুপ নেই? এডিবি ডেমনে <strong>adb shell input keyevent 26</strong> কমান্ড দিয়ে পাওয়ার বাটন সিমুলেট করুন। কীবোর্ডে এডিবি ডিটেক্ট করলেই ফোনের এআই ডায়াগনস্টিক সহজ হয়ে যাবে।
            </p>
          </div>
        </div>

        {/* Right pane: Interactive dynamic scrolling Chat engine (width 8 columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full min-h-0 bg-[#070b14]/35">
          
          {/* Messages Container */}
          <div className="flex-1 p-4.5 overflow-y-auto space-y-4">
            
            <AnimatePresence>
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto text-left'}`}
                  >
                    {/* Chat avatar marker */}
                    <div className={`p-2 rounded-lg border shrink-0 text-white ${
                      isUser 
                        ? 'bg-slate-900 border-slate-800' 
                        : 'bg-indigo-950/20 border-indigo-900/30 text-cyan-400'
                    }`}>
                      {isUser ? (
                        <User className="w-3.5 h-3.5 text-slate-350" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 fill-cyan-450/10 animate-pulse" />
                      )}
                    </div>

                    {/* Chat bubble body */}
                    <div className="space-y-2">
                      <div className={`p-3 rounded-xl border flex flex-col gap-1.5 font-sans whitespace-pre-line text-xxs leading-relaxed ${
                        isUser 
                          ? 'bg-slate-900 border-slate-805 text-white rounded-tr-none' 
                          : 'bg-slate-950/70 border-slate-900 text-slate-200 rounded-tl-none font-sans'
                      }`}>
                        
                        {/* Selected parameters tag */}
                        {!isUser && msg.id !== 'welcome' && (
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="text-[9px] bg-indigo-950 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-900/30 uppercase tracking-tight">
                              GEMINI AI
                            </span>
                            {msg.brand && (
                              <span className="text-[9px] bg-slate-900 text-slate-400 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-800">
                                BRAND: {msg.brand}
                              </span>
                            )}
                          </div>
                        )}

                        <div>{msg.text}</div>
                        <span className="text-[8px] text-gray-500 font-mono block mt-1 self-end">{msg.timestamp}</span>
                      </div>

                      {/* Display extracted active ADB command triggers inside the response bubbles */}
                      {msg.extractedCommands && msg.extractedCommands.length > 0 && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-2 mt-1.5">
                          <span className="text-[9.5px] font-mono text-cyan-400 font-bold block flex items-center gap-1 uppercase">
                            <Terminal className="w-3.5 h-3.5" />
                            রেসপন্সে সনাক্তকৃত কমান্ডসমূহ:
                          </span>
                          
                          <div className="space-y-2">
                            {msg.extractedCommands.map((cmd, cIdx) => (
                              <div key={cIdx} className="bg-black/80 px-2.5 py-2.5 rounded-lg border border-slate-850 flex justify-between items-center gap-3">
                                <code className="text-amber-400 font-mono text-[10px] break-all leading-normal select-all">
                                  {cmd}
                                </code>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => copyToClipboard(cmd)}
                                    className="p-1.5 bg-slate-900 border border-slate-805 text-slate-350 hover:text-white rounded hover:border-slate-700 transition-colors"
                                    title="কমান্ড কপি করুন"
                                  >
                                    {copiedCmd === cmd ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => runSimulatedCommand(cmd)}
                                    className="p-1 px-2.5 bg-cyan-650 hover:bg-cyan-600 text-slate-950 font-black text-[9px] rounded flex items-center gap-1 transition-colors"
                                    title="ফোনে কমান্ড ট্রিগার করুন"
                                  >
                                    <Zap className="w-3 h-3 text-slate-950 fill-current" />
                                    Run
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* AI Response generating Loader overlay state */}
            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto text-left animate-pulse">
                <div className="p-2 rounded-lg bg-indigo-950/20 border border-indigo-900/30 text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
                
                <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl rounded-tl-none text-xxs text-slate-400 space-y-2.5 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span className="font-extrabold text-white">ড্রয়েডলিংক এআই জেনারেট করছে...</span>
                  </div>
                  <p className="font-mono text-xxxxs text-[9px] text-cyan-500 font-bold">{loadingStep}</p>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Form Footer */}
          <div className="p-4 border-t border-slate-900/60 bg-[#05080f]/80 backdrop-blur">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                disabled={loading}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="ফোনে কি সমস্যা হচ্ছে তা লিখুন (যেমন: black screen with vibration বা touch error)..."
                className="flex-1 bg-[#03060c] border border-slate-805 text-xxs rounded px-3 py-2.5 text-slate-100 outline-none placeholder-slate-700 focus:border-cyan-500 font-sans"
              />
              
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-black text-xxs font-sans rounded shadow flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>বিশ্লেষণ</span>
                <Send className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </form>
            
            <div className="flex justify-between items-center mt-2.5 text-[9px] text-gray-500 pl-1 select-none">
              <span>💡 বাংলা বা ইংরেজিতে প্রশ্ন করুন। এআই স্বয়ংক্রিয়ভাবে সঠিক সমাধান বা কমান্ড ডায়াগ্রাম ম্যাপ করবে।</span>
              {!isPro && (
                <button
                  onClick={openUpgradeModal}
                  className="text-amber-400 hover:underline font-bold text-xxs uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3 h-3 text-amber-500 fill-current animate-pulse" />
                  PRO আনলক করুন
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
