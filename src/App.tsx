/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  Code, 
  EyeOff, 
  HelpCircle, 
  Settings, 
  Terminal, 
  Laptop, 
  Smartphone,
  ChevronRight,
  Info,
  Zap,
  Lock,
  Check,
  X,
  CreditCard,
  Award,
  Sparkles,
  Layers,
  ShoppingBag,
  BookOpen
} from "lucide-react";
import PhoneSimulator from "./components/PhoneSimulator";
import CodeWorkspace from "./components/CodeWorkspace";
import BlindAssistant from "./components/BlindAssistant";
import DiagnosticWizard from "./components/DiagnosticWizard";
import { ADBAutomationPanel } from "./components/ADBAutomationPanel";
import ServiceCenterHub from "./components/ServiceCenterHub";
import RecoveryHardwareStore from "./components/RecoveryHardwareStore";
import TechnicalEducation from "./components/TechnicalEducation";
import AITroubleshooter from "./components/AITroubleshooter";
import { SimulationState } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"code" | "blind" | "diag" | "auto" | "service" | "hardware" | "education" | "ai">("code");

  // Freemium states: persists in browser cookie or localStorage
  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem("droidlink_pro_status") === "true";
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Upgrade Modal Internal Flow
  const [paymentTab, setPaymentTab] = useState<"monthly" | "lifetime">("monthly");
  const [licKey, setLicKey] = useState<string>("");
  const [licError, setLicError] = useState<string>("");
  const [licSuccess, setLicSuccess] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);

  // Card details
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCVC, setCardCVC] = useState<string>("");

  const handleApplyLicense = () => {
    setLicError("");
    setLicSuccess(false);
    if (!licKey.trim()) {
      setLicError("অনুগ্রহ করে একটি সঠিক লাইসেন্স কী টাইপ করুন।");
      return;
    }
    // Validation
    const cleanKey = licKey.trim().toUpperCase();
    if (cleanKey === "DROIDLINK-PRO-2026" || cleanKey === "FREEPRO" || cleanKey === "PRO" || cleanKey === "SHEIKHFARID") {
      setLicSuccess(true);
      setIsPro(true);
      localStorage.setItem("droidlink_pro_status", "true");
      setTimeout(() => {
        setShowUpgradeModal(false);
        setLicSuccess(false);
        setLicKey("");
      }, 2000);
    } else {
      setLicError("ভুল লাইসেন্স স্লট বা সিরিয়াল কী! ট্রাই করুন 'FREEPRO' অথবা 'DROIDLINK-PRO-2026'!");
    }
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicError("");
    if (!cardNumber || !cardExpiry || !cardCVC) {
      setLicError("অনুগ্রহ করে কার্ড পেমেন্টের সকল অপশন পূরণ করুন।");
      return;
    }
    setIsPaying(true);
    // Simulating gateway transaction delay...
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPaying(false);
    setIsPro(true);
    localStorage.setItem("droidlink_pro_status", "true");
    setLicSuccess(true);
    setTimeout(() => {
      setShowUpgradeModal(false);
      setLicSuccess(false);
      setCardNumber("");
      setCardExpiry("");
      setCardCVC("");
    }, 2000);
  };

  const handleCancelSubscription = () => {
    setIsPro(false);
    localStorage.removeItem("droidlink_pro_status");
  };
  
  // Shared simulation environment state
  const [simulation, setSimulation] = useState<SimulationState>({
    isPowerOn: true,
    usbConnected: true,
    scrcpyRunning: true,
    currentCoordinate: null,
    simulatedTap: null,
    latencyMs: 4,
    fps: 60,
    bitrateKbps: 4000,
    systemLogs: [
      {
        id: "1",
        timestamp: new Date().toLocaleTimeString(),
        type: "success",
        message: "এডিবি সাবপ্রসেস সেশন প্রস্তুত। ডিভাইস SM-G98F কানেক্টেড।"
      },
      {
        id: "2",
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        message: "Scrcpy ডিসপ্লে এনকোডার OMX.google.h264 সফলভাবে লোড হয়েছে।"
      }
    ]
  });

  return (
    <div className="min-h-screen bg-[#080808] text-[#e0e0e0] font-sans flex flex-col antialiased">
      {/* Dynamic Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Main Top Header Navigation */}
      <header className="relative z-10 border-b border-[#222] bg-[#0d0d0d]/90 backdrop-blur-md px-6 py-4.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
              <Cpu className="w-5.5 h-4.5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400/80 uppercase">
                  DROIDLINK WORKSPACE
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border font-medium tracking-tight ${
                  isPro 
                    ? "bg-emerald-950/30 border-emerald-500/55 text-emerald-400" 
                    : "bg-cyan-950/30 border-cyan-500/30 text-cyan-400"
                }`}>
                  {isPro ? "v2.4.0-PRO-ACTIVE" : "v2.4.0-FREE"}
                </span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white font-sans sm:text-xl">
                নষ্ট ডিসপ্লে রিমোট স্ক্রিন কপি কন্ট্রোল হাব
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {isPro ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold text-xxs flex items-center gap-1.5 shadow">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  PRO চালু আছে
                </div>
                <button
                  onClick={handleCancelSubscription}
                  className="px-2 py-1.5 rounded text-[9px] font-bold bg-[#141414] border border-[#333] text-gray-500 hover:text-rose-400 hover:border-rose-900 transition-all cursor-pointer"
                  title="ফ্রি মোডে ফেরত যান পরীক্ষার জন্য"
                >
                  Revert to Free
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-500/30 text-white font-bold text-xxs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-950/40 cursor-pointer animate-pulse"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                UPGRADE TO PRO ($4.99/mo)
              </button>
            )}

            <div className="flex items-center gap-2 text-xxs font-mono text-gray-400 bg-[#0d0d0d] px-4 py-2 rounded-lg border border-[#222]">
              <Laptop className="w-3.5 h-3.5 text-gray-500" />
              <span>ADB SERVICE:</span>
              <span className="text-cyan-400 font-semibold font-mono">ACTIVE (127.0.0.1:5037)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Dashboard Content Region */}
      <main className="relative z-10 max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 flex flex-col min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch min-h-0">
          
          {/* LEFT 5 COLS: Interative Phone mirroring controller simulator */}
          <div className="lg:col-span-5 flex flex-col justify-stretch">
            <PhoneSimulator 
              simulation={simulation} 
              setSimulation={setSimulation} 
            />
          </div>

          {/* RIGHT 7 COLS: Modular Tabbed Workbench */}
          <div className="lg:col-span-7 flex flex-col bg-[#0d0d0d]/40 border border-[#222] rounded-2xl overflow-hidden shadow-xl min-h-0">
            
            {/* Workbench Tab Selection Header */}
            <div className="flex bg-[#0d0d0d] border-b border-[#222] px-4 py-2 select-none gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-cyan-500/30 hover:bg-[#141414]/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0 ${
                  activeTab === "code" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-code"
              >
                <Code className="w-4 h-4" />
                কোড গাইড ও এআই (AI Script Studio)
              </button>

              <button
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-cyan-500/30 hover:bg-[#141414]/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0 ${
                  activeTab === "ai" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-ai"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse animate-duration-1000" />
                এ.আই. ট্রাবলশুটার (A.I. Troubleshooter)
              </button>

              <button
                onClick={() => setActiveTab("blind")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "blind" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-blind"
              >
                <EyeOff className="w-4 h-4" />
                ব্লাইন্ড ডিবাগিং গাইড (Blind ADB)
                <span className="ml-1 bg-amber-950/20 text-yellow-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-900/30 font-sans tracking-tight">
                  PRO (4-5)
                </span>
              </button>

              <button
                onClick={() => setActiveTab("diag")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === "diag" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-diag"
              >
                <Settings className="w-4 h-4" />
                ড্রাইভার ও ডায়াগনস্টিকস
                <span className="ml-1 bg-amber-955/20 text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-900/20 font-sans tracking-tight">
                  PRO (Web/OTG)
                </span>
              </button>

              <button
                onClick={() => setActiveTab("auto")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-cyan-500/30 hover:bg-[#141414]/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0 ${
                  activeTab === "auto" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-auto"
              >
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                ওয়ান-ক্লিক অটো সেটআপ
                <span className="ml-1 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow tracking-tight uppercase">
                  PRO
                </span>
              </button>

              <button
                onClick={() => setActiveTab("service")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-cyan-500/30 hover:bg-[#141414]/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0 ${
                  activeTab === "service" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-service"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                সার্ভিস সেন্টার সংস্করণ (Tech Pro)
                <span className="ml-1 bg-emerald-950/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-900/30 font-sans tracking-tight">
                  SERVICE SUITE
                </span>
              </button>

              <button
                onClick={() => setActiveTab("hardware")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-cyan-500/30 hover:bg-[#141414]/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0 ${
                  activeTab === "hardware" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-hardware"
              >
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                হার্ডওয়্যার এক্সেসরিজ (Affiliate Shop)
                <span className="ml-1 bg-amber-950/20 text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-900/20 font-sans tracking-tight">
                  OTG & SCREEN DECK
                </span>
              </button>

              <button
                onClick={() => setActiveTab("education")}
                className={`px-4 py-3 rounded-lg text-xxs font-semibold font-sans flex items-center gap-2 transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-cyan-500/30 hover:bg-[#141414]/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0 ${
                  activeTab === "education" 
                    ? "bg-[#141414] text-cyan-400 shadow-md border-b-[2px] border-cyan-500" 
                    : "text-gray-400 hover:text-white"
                }`}
                id="tab-scrcpy-education"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                টুলস ও ট্রেনিং একাডেমি (ADB School)
                <span className="ml-1 bg-indigo-950/20 text-indigo-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-indigo-900/20 font-sans tracking-tight">
                  CERTIFICATION & COURSE
                </span>
              </button>
            </div>

            {/* Render Active workspace tab with beautiful slide transition */}
            <div className="flex-1 min-h-0 relative p-4 lg:p-5 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {activeTab === "code" && <CodeWorkspace />}
                  {activeTab === "ai" && (
                    <AITroubleshooter 
                      isPro={isPro} 
                      openUpgradeModal={() => setShowUpgradeModal(true)} 
                    />
                  )}
                  {activeTab === "blind" && (
                    <BlindAssistant 
                      isPro={isPro} 
                      openUpgradeModal={() => setShowUpgradeModal(true)} 
                    />
                  )}
                  {activeTab === "diag" && (
                    <DiagnosticWizard 
                      isPro={isPro} 
                      openUpgradeModal={() => setShowUpgradeModal(true)} 
                    />
                  )}
                  {activeTab === "auto" && (
                    <ADBAutomationPanel 
                      isPro={isPro} 
                      openUpgradeModal={() => setShowUpgradeModal(true)} 
                    />
                  )}
                  {activeTab === "service" && (
                    <ServiceCenterHub 
                      isPro={isPro} 
                      openUpgradeModal={() => setShowUpgradeModal(true)} 
                    />
                  )}
                  {activeTab === "hardware" && (
                    <RecoveryHardwareStore />
                  )}
                  {activeTab === "education" && (
                    <TechnicalEducation 
                      isPro={isPro} 
                      openUpgradeModal={() => setShowUpgradeModal(true)} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </main>

      {/* Upgrade Subscription Modal Overlay */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden bg-[#0a0d18] border border-amber-900/30 rounded-2xl shadow-2xl flex flex-col font-sans"
            >
              {/* Header */}
              <div className="relative p-5 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-amber-955/15 flex justify-between items-center">
                <div className="flex gap-2.5 items-center">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Zap className="w-5 h-5 fill-amber-500/30" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      DroidLink PRO সাবস্ক্রিপশন
                    </h3>
                    <p className="text-[10px] text-amber-200/80 mt-0.5">সবগুলো অ্যাডভান্সড ব্লাইন্ড রિકভারি ক্যাবিলিটি আনলক করুন</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setLicError("");
                    setLicSuccess(false);
                  }}
                  className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Benefits Banner */}
              <div className="p-5 bg-amber-950/10 border-b border-amber-950/20 text-xxs font-sans space-y-2">
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block">প্রিমিয়াম ফিচার সেট সমূহ:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-start gap-1.5 leading-snug">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>এক্সপার্ট ওটিজি অটোমেশন স্ক্রিপ্ট (OTG Recipe)</span>
                  </div>
                  <div className="flex items-start gap-1.5 leading-snug">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ইউএসবি স্ক্রিন কাস্টিং টুল (WebUSB)</span>
                  </div>
                  <div className="flex items-start gap-1.5 leading-snug">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>অ্যাডভান্সড ব্লাইন্ড রিকভারি কোড (ধাপ ৪ ও ৫)</span>
                  </div>
                  <div className="flex items-start gap-1.5 leading-snug">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>জেমিনি এআই রিকভারি প্রম্পটিং সাপোর্ট</span>
                  </div>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="flex border-b border-slate-900 bg-black/30 font-sans">
                <button
                  type="button"
                  onClick={() => setPaymentTab("monthly")}
                  className={`flex-1 py-3 text-xxs font-bold text-center border-b transition-all cursor-pointer ${
                    paymentTab === "monthly"
                      ? "border-amber-500 text-amber-300 bg-amber-500/5"
                      : "border-transparent text-gray-500 hover:text-slate-350"
                  }`}
                >
                  মান্থলি সাবস্ক্রিপশন ($৪.৯৯/মাস)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab("lifetime")}
                  className={`flex-1 py-3 text-xxs font-bold text-center border-b transition-all cursor-pointer ${
                    paymentTab === "lifetime"
                      ? "border-amber-500 text-amber-300 bg-amber-500/5"
                      : "border-transparent text-gray-500 hover:text-slate-350"
                  }`}
                >
                  লাইফটাইম লাইসেন্স কি (১-টাইম $১৯.০০)
                </button>
              </div>

              {/* Form and Interaction */}
              <div className="p-5 flex-1 min-h-[220px]">
                {licSuccess ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center h-full animate-fadeIn font-sans">
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-full text-emerald-300 mb-3 animate-bounce">
                      <Award className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">সুপারচার্জড! প্রো এক্টিভেটেড</h4>
                    <p className="text-xxs text-emerald-400 mt-1">সবগুলো এক্সপার্ট ওটিজি টুল এবং ব্লাইন্ড কোড এখন আপনার জন্য উন্মুক্ত!</p>
                  </div>
                ) : paymentTab === "monthly" ? (
                  <form onSubmit={handleCardPayment} className="space-y-4 font-sans text-xxs">
                    <div className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-lg flex items-center justify-between gap-3 text-[10px] text-amber-200 leading-snug font-sans">
                      <span>🔒 <strong>পেমেন্ট গেটওয়ে সিমুলেটর:</strong> কার্ড টাইপ করে পেমেন্ট সম্পূর্ণ করা মাত্রই আপনার লোকাল ব্রাউজার আইডিতে প্রো সাবস্ক্রিপশন চালু হয়ে যাবে।</span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400 font-bold text-[10px]">কার্ড নাম্বার (Card Number):</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="4000 1234 5678 9010"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-black/55 border border-slate-800 rounded p-2.5 pl-9 text-slate-250 font-mono outline-none focus:border-amber-500 text-xxs"
                          />
                          <CreditCard className="w-4 h-4 text-slate-550 absolute left-3 top-3" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 font-bold text-[10px]">তারিখ (Expiry):</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-black/55 border border-slate-800 rounded p-2.5 text-slate-250 font-mono outline-none focus:border-amber-500 text-xxs"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 font-bold text-[10px]">নিরাপত্তা পিন (CVC):</label>
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            value={cardCVC}
                            onChange={(e) => setCardCVC(e.target.value)}
                            className="w-full bg-black/55 border border-slate-800 rounded p-2.5 text-slate-250 font-mono outline-none focus:border-amber-500 text-xxs"
                          />
                        </div>
                      </div>
                    </div>

                    {licError && (
                      <span className="text-rose-400 font-medium tracking-tight block text-[10px] bg-rose-955/20 border border-rose-900/30 p-2 rounded">
                        ⚠️ {licError}
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={isPaying}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.99] text-white font-bold text-xxs rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      {isPaying ? "পেমেন্ট প্রসেস হচ্ছে..." : "নিরাপদ পেমেন্ট সম্পূর্ণ করুন ($৪.৯৯/মাস)"}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 font-sans text-xxs">
                    <div className="bg-[#120a1c]/60 border border-purple-955/20 p-4 rounded-lg text-slate-350 leading-relaxed font-sans text-xxs">
                      আপনি যদি ওটিজি কিবোর্ড লাইসেন্স কি পেয়ে থাকেন, তবে তা নিচে সাবমিট দিন। <br />
                      <strong className="text-amber-400">পরীক্ষার জন্য ফ্রি কোড:</strong> <code className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-yellow-300 font-mono text-[10px] font-bold">FREEPRO</code> বা <code className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-yellow-300 font-mono text-[10px] font-bold">DROIDLINK-PRO-2026</code>।
                    </div>

                    <div className="flex flex-col gap-2 font-sans">
                      <label className="text-slate-400 font-bold text-[10px]">১-টাইম লাইসেন্স এন্ট্রি কি:</label>
                      <input
                        type="text"
                        placeholder="e.g. DROIDLINK-PRO-XXXX"
                        value={licKey}
                        onChange={(e) => setLicKey(e.target.value)}
                        className="w-full bg-black/55 border border-slate-800 rounded p-2.5 text-slate-200 font-mono outline-none focus:border-amber-500 text-xxs uppercase placeholder-gray-600"
                      />
                    </div>

                    {licError && (
                      <span className="text-rose-400 font-medium tracking-tight block text-[10px] bg-rose-955/20 border border-rose-900/30 p-2 rounded">
                        ⚠️ {licError}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleApplyLicense}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-800 to-indigo-850 hover:brightness-115 active:scale-[0.99] text-white font-bold text-xxs rounded cursor-pointer transition-all"
                    >
                      লাইসেন্স কি অ্যাক্টিভেট করুন
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-black/55 border-t border-slate-905 text-center text-xxxxs sm:text-xxs text-gray-500 font-mono">
                DroidLink Checkout Client • SSL Secured Engine
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer copyright and credentials */}
      <footer className="relative z-10 border-t border-[#222] bg-[#0d0d0d]/90 py-4.5 px-6 mt-12 select-none text-xxxxxs sm:text-xxs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 font-sans">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-600 shrink-0" />
            <span className="leading-tight font-sans">
              এই লার্নিং ড্যাশবোর্ডটি ওপেনসোর্স প্রজেক্ট <strong>Scrcpy Screen Copy v2.5</strong> আর্কিটেকচারের উপর ভিত্তি করে তৈরি।
            </span>
          </div>
          <span className="font-mono text-gray-600 block sm:inline">
            Designed for sheikhfaridbangladash@gmail.com © 2026.
          </span>
        </div>
      </footer>
    </div>
  );
}
