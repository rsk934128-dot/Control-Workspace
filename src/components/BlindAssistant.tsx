import React, { useState } from "react";
import { 
  Keyboard, 
  VolumeX, 
  Volume2, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  FileText,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Lock,
  Zap
} from "lucide-react";
import { BLIND_STEPS } from "../data";

export default function BlindAssistant({ isPro, openUpgradeModal }: { isPro: boolean; openUpgradeModal: () => void }) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [speakOn, setSpeakOn] = useState(true);
  const [waveActive, setWaveActive] = useState(false);
  const [solvedSteps, setSolvedSteps] = useState<number[]>([]);

  const currentStep = BLIND_STEPS[activeStepIdx];
  const isLocked = currentStep.step >= 4 && !isPro;

  // Simulated button activation
  const handleSimulateKey = () => {
    setWaveActive(true);
    setTimeout(() => setWaveActive(false), 1200);

    // Track completed step
    if (!solvedSteps.includes(currentStep.step)) {
      setSolvedSteps(prev => [...prev, currentStep.step]);
    }
  };

  const handleNext = () => {
    if (activeStepIdx < BLIND_STEPS.length - 1) {
      setActiveStepIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStepIdx > 0) {
      setActiveStepIdx(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header Panel */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0d1425] border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4.5 h-4.5 text-amber-500" />
          <h2 className="text-sm font-semibold text-slate-200">
            নষ্ট ডিসপ্লে এডিবি অন ট্র্যাকিং (Blind-Debugging Wizard)
          </h2>
        </div>
        <button 
          onClick={() => setSpeakOn(!speakOn)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
            speakOn 
              ? "bg-amber-950/20 text-amber-400 border-amber-500/30" 
              : "bg-slate-900 text-slate-500 border-slate-800"
          }`}
          title="ভয়েস ওভার ফিডব্যাক অন/অফ"
        >
          {speakOn ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              ভয়েস চালু
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              ভয়েস অফ
            </>
          )}
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 bg-[#070b14]">
        {/* Intro challenge banner */}
        <div className="p-4 rounded-lg bg-[#cc7a00]/5 border border-[#cc7a00]/20 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xxxxs sm:text-xxs">
            <h4 className="font-semibold text-amber-400 mb-0.5 font-sans">ডিসপ্লে ছাড়া ডিবাগিং অন করার চ্যালেঞ্জ!</h4>
            <p className="text-slate-400 leading-relaxed font-sans">
              ডিসপ্লে নষ্ট থাকলে টাচস্ক্রিন দেখা যায় না। এই জাদুকরী গাইডটি ব্যবহার করে আপনি মাত্র ১টি **OTG এবং কিবোর্ড** কানেক্ট করে পুরোপুরি আন্দাজে অ্যান্ড্রয়েড স্ক্রিন রিডার (Talkback) শোনে শোনে ডেভেলপার অপশন এবং ইউএসবি ডিবাগিং অন করতে পারবেন।
            </p>
          </div>
        </div>

        {/* Step Progress indicators */}
        <div className="flex justify-between items-center gap-2 px-1 py-1 bg-slate-950/40 border border-slate-900 rounded-lg select-none">
          {BLIND_STEPS.map((item, index) => {
            const isCompleted = solvedSteps.includes(item.step);
            const isActive = index === activeStepIdx;
            return (
              <button
                key={index}
                onClick={() => setActiveStepIdx(index)}
                className={`flex-1 py-2 rounded text-xxxxs font-mono font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? "bg-amber-500 text-slate-950 shadow" 
                    : isCompleted 
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                ধাপ {item.step}
              </button>
            );
          })}
        </div>

        {/* Selected Step block */}
        <div className="flex-1 border border-slate-900 rounded-xl bg-[#03060c] p-5 flex flex-col justify-between gap-4 relative">
          {isLocked && (
            <div className="absolute inset-0 z-20 backdrop-blur-md bg-slate-950/85 flex flex-col items-center justify-center p-6 text-center border border-amber-900/30 rounded-xl">
              <Lock className="w-8 h-8 text-amber-500 mb-2.5 animate-bounce" />
              <h4 className="text-xs font-bold text-slate-100 font-sans">অ্যাডভান্সড ব্লাইন্ড রিকভারি কোড (PRO Feature)</h4>
              <p className="text-[10px] text-gray-400 mt-1 lines-relaxed max-w-xs font-sans">
                ডেভেলপার অপশন এনাবল করা এবং ইউএসবি ডিবাগিং চালু করার জন্য এই সাইলেন্ট সিকোয়েন্স কোডটি একটি <strong>PRO</strong> সাবস্ক্রিপশন ফিচার।
              </p>
              <button
                onClick={openUpgradeModal}
                className="mt-4.5 px-4 py-2 rounded bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 text-xxs font-black flex items-center gap-1.5 shadow hover:scale-[1.02] transition-all cursor-pointer uppercase tracking-tight"
              >
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                Upgrade to PRO ($4.99/mo)
              </button>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 text-xxs font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
              <span>ধাপ {currentStep.step} / ৫</span>
              {solvedSteps.includes(currentStep.step) && (
                <span className="text-emerald-400 flex items-center gap-1.5 font-sans lowercase">
                  <CheckCircle className="w-3 h-3 block" /> (সম্পন্ন)
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-2 font-sans tracking-tight">
              {currentStep.title}
            </h3>
            <p className="text-xxxxs sm:text-xxs text-slate-400 leading-relaxed font-sans min-h-[50px]">
              {currentStep.instruction}
            </p>
          </div>

          {/* Interactive Keyboard Command Simulator Container */}
          <div className="p-4 rounded-xl border border-slate-900 bg-[#020408] flex flex-col items-center justify-center gap-4 py-6 relative overflow-hidden group">
            
            <div className="text-[10px] font-mono text-slate-600 uppercase flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5 text-slate-500" /> কিবোর্ড কমান্ড প্যাকেট পুশ করুন
            </div>
            
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-xxs font-mono text-slate-500">আপনাকে টাইপ বা প্রেস করতে হবে:</span>
              <span className="px-3.5 py-1.5 rounded-md bg-[#13110d] border border-amber-500/30 font-mono text-xs text-amber-400 font-bold tracking-wide shadow-md shadow-amber-500/5 select-all">
                {currentStep.keyAction}
              </span>
            </div>

            {/* Simulating button trigger */}
            <button 
              onClick={handleSimulateKey}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold tracking-wide flex items-center gap-2 shadow-lg shadow-amber-900/20 hover:scale-[1.02] active:scale-95 transition-all select-none cursor-pointer"
              id="btn-simulate-keypress"
            >
              <Play className="w-4 h-4 fill-current" />
              কিবোর্ড কমান্ড সিমুলেট করুন (Press Key)
            </button>
          </div>

          {/* Simulated talkback voice overlay bubble */}
          <div className={`p-4 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${
            waveActive 
              ? "bg-[#181109] border-amber-500/40 shadow-inner" 
              : "bg-slate-950/60 border-slate-900"
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[9px] font-mono text-slate-500 tracking-wider">
                সহায়ক অডিও ফিডব্যাক (TalkBack Audio Output)
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Volume2 className={`w-4 h-4 text-amber-400 ${waveActive ? "scale-110" : "opacity-40"}`} />
              </div>

              {/* simulated text block */}
              <div className="text-xxxxs sm:text-xxs text-amber-300/90 font-mono italic flex-1 select-text">
                {speakOn ? (
                  waveActive ? currentStep.talkbackFeedback : "কমান্ড বোতাম টিপে অডিও ফিডব্যাক শুনুন..."
                ) : (
                  "ভয়েস অফ করা আছে।"
                )}
              </div>

              {/* Mini voice active sound wave simulation */}
              {waveActive && (
                <div className="flex gap-0.5 items-end h-4 select-none">
                  <span className="w-0.5 h-3 bg-amber-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-0.5 h-4 bg-amber-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  <span className="w-0.5 h-2 bg-amber-400 animate-bounce" style={{ animationDelay: "0.5s" }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation handles */}
        <div className="flex items-center justify-between text-xs select-none">
          <button 
            onClick={handlePrev}
            disabled={activeStepIdx === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            id="btn-blind-prev"
          >
            <ChevronLeft className="w-4 h-4" />
            পূর্ববর্তী
          </button>

          <span className="font-mono text-slate-500 text-xxs">
            {solvedSteps.length} / {BLIND_STEPS.length} শেষ হয়েছে
          </span>

          <button 
            onClick={handleNext}
            disabled={activeStepIdx === BLIND_STEPS.length - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            id="btn-blind-next"
          >
            পরবর্তী
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
