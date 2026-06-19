import React, { useState, useEffect } from 'react';
import { ADBConnectionState, ADBDevice } from '../types';
import { Terminal, Cpu, Play, CheckCircle, AlertTriangle, Usb, RefreshCw, Power, Lock, Zap } from 'lucide-react';

export const ADBAutomationPanel: React.FC<{ isPro: boolean; openUpgradeModal: () => void }> = ({ isPro, openUpgradeModal }) => {
  const [connState, setConnState] = useState<ADBConnectionState>('IDLE');
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'cmd' | 'info' | 'warn' | 'success' | 'err' }>>([]);
  const [device, setDevice] = useState<ADBDevice | null>(null);

  const addLog = (message: string, type: 'cmd' | 'info' | 'warn' | 'success' | 'err' = 'info') => {
    setLogs((prev) => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        type,
        msg: message
      },
      ...prev
    ]);
  };

  const startAutoSetup = async () => {
    setLogs([]);
    setConnState('SCANNING');
    addLog("Executing: adb devices -l", "cmd");
    addLog("ইউএসবি পোর্টে কানেক্টেড অ্যান্ড্রয়েড ডিভাইস স্ক্যান করা হচ্ছে...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated unauthorized device detected
    setConnState('UNAUTHORIZED');
    setDevice({ id: '9888a4454535055', state: 'unauthorized' });
    addLog("ডিভাইস পাওয়া গেছে! ID: [9888a4454535055] -> State: UNAUTHORIZED", "warn");
    addLog("সতর্কতা: আপনার মোবাইলের স্ক্রিনে 'Allow USB Debugging' প্রম্পটটি ভেসে উঠেছে।", "warn");
    addLog("যেহেতু মোবাইলের ডিসপ্লে নষ্ট, তাই একটি ওটিজি (OTG) মাউস ব্লাইন্ডলি কানেক্ট করে আনুমানিক জায়গায় ক্লিক করতে পারেন অথবা নিচে সিমুলেটেড প্রমাণীকরণ সম্পন্ন করুন।", "info");
  };

  const handleBypassAuthorization = async () => {
    setConnState('CONNECTING');
    addLog("ইউজার কর্তৃক সিমুলেটেড ইউএসবি ডিবাগিং অনুমোদন সফল!", "success");
    addLog("Executing: adb forward tcp:8081 localabstract:scrcpy", "cmd");
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    addLog("scrcpy-server.jar ফাইলটি /data/local/tmp/ পাথে পুশ করা হচ্ছে...", "info");
    addLog("Executing: adb shell CLASSPATH=/data/local/tmp/scrcpy-server.jar app_process / com.genymobile.scrcpy.Server 1.24", "cmd");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setConnState('CONNECTED');
    if (device) {
      setDevice({ ...device, state: 'device', model: 'Galaxy S20 (Android-Cabled Mirror Active)' });
    }
    addLog("[+] সফল সংযোগ! ৬০ FPS-এ Scrcpy স্ক্রিন ক্যাস্পচারিং মিরর শুরু হয়েছে!", "success");
    addLog("পিসির পাইথন ক্লায়েন্ট এখন tcp:8081 পোর্টে ডেটা রিসিভ করতে পারবে।", "info");
  };

  const resetConnection = () => {
    setConnState('IDLE');
    setDevice(null);
    setLogs([]);
    addLog("সেশন রিসেট করা হয়েছে। One-Click Auto-Setup এর জন্য প্রস্তুত।", "info");
  };

  return (
    <div className="bg-[#0b0b0b] border border-[#222]/80 rounded-xl p-5 lg:p-6 shadow-xl font-sans relative overflow-hidden">
      {/* Decorative background grid flare */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

      {!isPro && (
        <div className="absolute inset-0 z-30 bg-[#08080c]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl mb-4 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            ওয়ান-ক্লিক অটো সেটআপ (PRO Feature)
          </h3>
          <p className="text-xxs text-slate-400 mt-2 max-w-sm leading-relaxed font-sans">
            অটোমেটেড ওটিজি রেসিপি, এডিবি বাইপাস অথরাইজেশন ইঞ্জিন এবং ব্যাকগ্রাউন্ড সার্ভার সিঙ্ক করতে <strong>DroidLink PRO</strong> সাবস্ক্রিপশন প্রয়োজন।
          </p>
          
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md text-left text-xxxxs sm:text-xxs text-gray-400 font-sans">
            <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40">
              ⚡ <strong>ওয়ান-ক্লিক সকেট ব্রিজ:</strong> এডিবি টিসিপি পোর্ট ফরওয়ার্ড্ডিং এবং লুপ অটো লাইভ কানেক্ট।
            </div>
            <div className="p-2.5 rounded-lg border border-slate-900 bg-slate-950/40">
              🛠️ <strong>কোড বাইপাস মেকানিজম:</strong> নষ্ট টাচস্ক্রিনের নিরাপত্তা সকেট আউটে রেডিমেড বাইপাস কোড ইনজেকশন।
            </div>
          </div>

          <button
            onClick={openUpgradeModal}
            className="mt-6 px-5 py-2.5 rounded bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/35 cursor-pointer uppercase tracking-tight"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-current animate-pulse" />
            Upgrade to PRO ($4.99/mo)
          </button>
        </div>
      )}

      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 pb-4 border-b border-[#222]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connState === 'CONNECTED' ? 'bg-emerald-400' : connState === 'UNAUTHORIZED' ? 'bg-amber-500' : 'bg-cyan-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                connState === 'CONNECTED' ? 'bg-emerald-500' : connState === 'UNAUTHORIZED' ? 'bg-amber-500' : 'bg-cyan-500'
              }`}></span>
            </span>
            One-Click ADB Control Simulator
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 font-sans">
            ভাঙা স্ক্রিনের মোবাইলে কীবোর্ড, মাউস ও সকেট ফরওয়ার্ড মেকানিজম দিয়ে ওয়ান-ক্লিক এডিবি কনফিগারেশন সিমুলেটর।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#141414] rounded border border-[#222] text-cyan-400 shrink-0">
            CONNECT_STATE: {connState}
          </span>
          {connState !== 'IDLE' && (
            <button 
              onClick={resetConnection}
              className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors"
              title="রিসেট কানেকশন"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Connection flow indicator */}
      <div className="mb-6 p-4 bg-[#141414]/50 border border-[#222]/60 rounded-lg">
        <div className="w-full flex justify-between px-2 text-[10px] font-mono text-gray-500 mb-2.5 uppercase tracking-wider">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> PC CLIENT</span>
          <span>ADB CHANNEL</span>
          <span className="flex items-center gap-1"><Usb className="w-3 h-3 text-cyan-400" /> BROKEN PHONE</span>
        </div>
        
        {/* Connection pipeline line animation */}
        <div className="w-full h-2 bg-neutral-900 rounded-full relative overflow-hidden border border-neutral-950">
          {connState === 'SCANNING' && (
            <div className="h-full bg-cyan-500 animate-pulse w-full"></div>
          )}
          {connState === 'UNAUTHORIZED' && (
            <div className="h-full bg-amber-500 w-full animate-ping opacity-35"></div>
          )}
          {connState === 'CONNECTING' && (
            <div className="h-full bg-cyan-400 absolute left-0 top-0 animate-infinite-scroll w-1/3 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
          )}
          {connState === 'CONNECTED' && (
            <div className="h-full bg-emerald-500 w-full shadow-[0_0_10px_#10b981]"></div>
          )}
          {connState === 'IDLE' && (
            <div className="h-full bg-neutral-800 w-2 shrink-0"></div>
          )}
        </div>

        {/* Status Text explanation */}
        <div className="mt-3 text-center text-xxs font-mono text-gray-400 select-none">
          {connState === 'IDLE' && "সংযোগ করার পূর্বে উপরে 'START AUTO SETUP' এ চাপুন।"}
          {connState === 'SCANNING' && "ইউএসবি বাস (USB Bus) স্ক্যান করা হচ্ছে... ডিভাইস সনাক্তের চেষ্টা চলছে।"}
          {connState === 'UNAUTHORIZED' && "⚠️ ডিভাইস পাওয়া গেছে কিন্তু ফোনের এডিবি চাবি আনঅথরাইজড! পারমিশন দিন।"}
          {connState === 'CONNECTING' && "সকেটে লুপ ফরওয়ার্ড কনফিগার ও scrcpy-server প্রসেস শুরু হচ্ছে..."}
          {connState === 'CONNECTED' && "✔️ সফলভাবে লিঙ্কড! পিসি ও মোবাইল ১১২৩ সকেট চ্যানেলে সিঙ্কড।"}
        </div>
      </div>

      {/* Control Actions Column */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <button 
          onClick={startAutoSetup}
          disabled={connState === 'SCANNING' || connState === 'CONNECTING' || connState === 'CONNECTED'}
          className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-semibold text-white tracking-wide shadow-md hover:shadow-cyan-900/10 transition-all duration-200 disabled:opacity-40 select-none active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          START AUTO SETUP (এডিবি স্ক্যান)
        </button>

        {connState === 'UNAUTHORIZED' && (
          <button 
            onClick={handleBypassAuthorization}
            className="flex-1 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-neutral-950 shadow-md hover:shadow-amber-500/20 transition-all duration-200 animate-bounce select-none flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            সিমুলেট স্ক্রিন 'ALLOW' (ডিবাগিং বাইপাস)
          </button>
        )}
      </div>

      {/* Terminal log logs console with beautiful outputs */}
      <div className="bg-[#050505] rounded-lg border border-[#222]/80 p-3 h-52 overflow-y-auto font-mono text-xxs sm:text-xs text-gray-350 shadow-inner flex flex-col-reverse justify-end">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic mt-auto text-center py-8">
            কমান্ড ইনিশিয়েট করার নির্দেশনাবলী এখানে লাইভ প্রদর্শিত হবে...
          </div>
        ) : (
          <div className="space-y-1.5 w-full">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2.5 items-start leading-relaxed animate-fadeIn">
                <span className="text-gray-600 shrink-0 text-[10px] mt-0.5">{log.time}</span>
                <span className={`block break-words ${
                  log.type === 'cmd' ? "text-cyan-400 font-medium" :
                  log.type === 'info' ? "text-slate-350" :
                  log.type === 'warn' ? "text-amber-400 bg-amber-950/20 px-1 rounded border border-amber-950/50" :
                  log.type === 'success' ? "text-emerald-400" :
                  log.type === 'err' ? "text-rose-400 bg-rose-950/20 px-1 rounded border border-rose-950/50" : "text-white"
                }`}>
                  {log.type === 'cmd' ? "$ " : ""}
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
