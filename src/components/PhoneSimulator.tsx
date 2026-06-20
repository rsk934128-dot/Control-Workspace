import React, { useState, useRef, useEffect } from "react";
import { 
  Laptop, 
  Smartphone, 
  Usb, 
  Power, 
  Terminal, 
  RotateCcw, 
  Play, 
  Square,
  ChevronRight,
  Sparkles,
  Wifi,
  Battery
} from "lucide-react";
import { SimulationState, LogEntry } from "../types";

// Beautiful generated Redmi 5 pictures
const redmiHomeImg = "/src/assets/images/redmi_5_home_1781939850716.jpg";
const redmiRecoveryImg = "/src/assets/images/redmi_5_recovery_1781939867128.jpg";
const redmiHardwareImg = "/src/assets/images/redmi_5_hardware_1781939883178.jpg";

interface PhoneSimulatorProps {
  simulation: SimulationState;
  setSimulation: React.Dispatch<React.SetStateAction<SimulationState>>;
}

export default function PhoneSimulator({ simulation, setSimulation }: PhoneSimulatorProps) {
  const [selectedDevice, setSelectedDevice] = useState<"s20" | "redmi5">("redmi5");
  const [redmiTab, setRedmiTab] = useState<"home" | "recovery" | "hardware">("home");
  const [selectedSimApp, setSelectedSimApp] = useState<"home" | "settings" | "developer_options">("home");
  const [developerActivated, setDeveloperActivated] = useState(false);
  const [usbDebugActive, setUsbDebugActive] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [lastAction, setLastAction] = useState<string>("");
  const monitorScreenRef = useRef<HTMLDivElement>(null);

  // Quick logging helper
  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const newEntry: LogEntry = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setSimulation(prev => ({
      ...prev,
      systemLogs: [newEntry, ...prev.systemLogs].slice(0, 30) // Limit to 30 logs
    }));
  };

  // Pulse animation on action
  const triggerUsbPulse = () => {
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 800);
  };

  // Toggle USB Connection
  const toggleUsb = () => {
    const newState = !simulation.usbConnected;
    setSimulation(prev => ({
      ...prev,
      usbConnected: newState,
      scrcpyRunning: newState ? prev.scrcpyRunning : false
    }));
    
    if (newState) {
      addLog("ইউএসবি কেবল সংযুক্ত করা হয়েছে। [USB STATUS: CONNECTED]", "success");
      addLog("ADB ডেমন চালু হচ্ছে... পোর্ট ফরওয়ার্ডিং সচল।", "adb");
    } else {
      addLog("ইউএসবি সংযোগ বিচ্ছিন্ন করা হয়েছে।", "warning");
      addLog("Scrcpy রিমোট সেশন সমাপ্ত। [Socket connection closed]", "error");
    }
    triggerUsbPulse();
  };

  // Toggle Scrcpy service
  const toggleScrcpy = () => {
    if (!simulation.usbConnected) {
      addLog("এরোর: ইউএসবি ক্যাবল সংযুক্ত নেই! Scrcpy চালানো সম্ভব নয়।", "error");
      return;
    }
    
    const newState = !simulation.scrcpyRunning;
    setSimulation(prev => ({
      ...prev,
      scrcpyRunning: newState
    }));

    if (newState) {
      addLog("Scrcpy রিমোট সেশন শুরু হচ্ছে...", "info");
      addLog("[SOCKET] android_process background service started.", "adb");
      addLog("[TCP] Connected to port 127.0.0.1:8080. Display mirroring is live!", "success");
    } else {
      addLog("Scrcpy উইন্ডো বন্ধ করা হয়েছে।", "info");
    }
    triggerUsbPulse();
  };

  // Reset Simulator
  const resetSimulator = () => {
    setSelectedSimApp("home");
    setDeveloperActivated(false);
    setUsbDebugActive(false);
    setSimulation({
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
          id: "init",
          timestamp: new Date().toLocaleTimeString(),
          type: "success",
          message: "Scrcpy সিমুলেটর লোড হয়েছে। এডিবি কানেকশন প্রস্তুত।"
        }
      ]
    });
    addLog("সিমুলেটরের সকল সেটিংস রিসেট করা হয়েছে।", "warning");
  };

  // Simulated click on PC monitor
  const handleMonitorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!simulation.scrcpyRunning) {
      addLog("সিমুলেশন সতর্কবার্তা: স্ক্রিন এখন বন্ধ। স্ক্রিন কন্ট্রোল করতে প্রথমে ডানপাশের 'Scrcpy চালু করুন' বোতামে ক্লিক করুন।", "warning");
      return;
    }

    if (!monitorScreenRef.current) return;
    const rect = monitorScreenRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Coordinate mapping (scale to virtual 1080x1920)
    const scaleX = Math.round((x / rect.width) * 1080);
    const scaleY = Math.round((y / rect.height) * 1920);

    setSimulation(prev => ({
      ...prev,
      currentCoordinate: { x: scaleX, y: scaleY },
      simulatedTap: { x, y, id: Math.random() }
    }));
    
    setLastAction(`Tap: (${scaleX}, ${scaleY})`);
    
    // Clear tap visual ripple
    setTimeout(() => {
      setSimulation(prev => ({ ...prev, simulatedTap: null }));
    }, 450);

    // Simulated application inside screen routing logic
    addLog(`[Mouse Click] Coordinate captured: PC (${x}, ${y}) → Mobile (${scaleX}, ${scaleY})`, "info");
    addLog(`[ADB Cmd] Executing: adb shell input tap ${scaleX} ${scaleY}`, "adb");
    triggerUsbPulse();

    // Check what was clicked inside the simulated interface
    if (selectedSimApp === "home") {
      // Clicked on Settings icon (roughly coordinates near center right)
      if (scaleX > 350 && scaleX < 730 && scaleY > 700 && scaleY < 1000) {
        setSelectedSimApp("settings");
        addLog("[Android OS] 'Settings' অ্যাপ্লিকেশন ওপেন হয়েছে।", "success");
      } else {
        addLog("[Android OS] ফিজিক্যাল টাচ রেজিস্টার হয়েছে। (হোম স্ক্রীন)", "info");
      }
    } else if (selectedSimApp === "settings") {
      // Clicked Back (Header region or phone Back Button)
      if (scaleY < 180) {
        setSelectedSimApp("home");
        addLog("[Android OS] হোমে ফেরত যাওয়া হলো।", "info");
      } 
      // Clicked on About Phone option (towards bottom)
      else if (scaleY > 1100 && scaleY < 1400) {
        setSelectedSimApp("developer_options");
        addLog("[Settings] 'About Phone' অপশনে ফোকাস করা হয়েছে।", "info");
      }
    } else if (selectedSimApp === "developer_options") {
      if (scaleY < 180) {
        setSelectedSimApp("settings");
        addLog("[Settings] ব্যাক মেনু।", "info");
      }
      // Click Code for build-number taps (middle area)
      else if (scaleY > 500 && scaleY < 1100) {
        if (!developerActivated) {
          setDeveloperActivated(true);
          setUsbDebugActive(true);
          addLog("[Developer Tool] ইউএসবি ডিবাগিং (USB Debugging) এবং ডেভেলপার অপশন সচল করা হয়েছে!", "success");
        } else {
          addLog("ডেভেলপার অপশন ইতোমধ্যে সচল আছে।", "info");
        }
      }
    }
  };

  // Hardware Key Press Simulation
  const handleHardwareKey = (key: string, label: string) => {
    if (!simulation.usbConnected) {
      addLog("কানেকশন এরোর: কমান্ড পাঠানো ব্যর্থ, ইউএসবি যুক্ত করুন।", "error");
      return;
    }
    addLog(`[Hardware Key] ${label} কী প্রেস করা হয়েছে।`, "info");
    addLog(`[ADB Cmd] Executing: adb shell input keyevent ${key}`, "adb");
    triggerUsbPulse();

    if (key === "26") { // Power Key Toggle
      setSimulation(prev => ({ ...prev, isPowerOn: !prev.isPowerOn }));
      addLog(simulation.isPowerOn ? "মোবাইলের স্ক্রিন স্ট্যান্ডবাই মোডে পাঠানো হয়েছে।" : "মোবাইল ডিসপ্লে জাগ্রত হয়েছে।", "warning");
    } else if (key === "3") { // Home key
      setSelectedSimApp("home");
      addLog("[Android API] হোম পেজ লোড সফল।", "success");
    } else if (key === "4") { // Back Key
      if (selectedSimApp === "developer_options") setSelectedSimApp("settings");
      else if (selectedSimApp === "settings") setSelectedSimApp("home");
      addLog("[Android API] ব্যাক অ্যাকশন এক্সিকিউট করা হয়েছে।", "info");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
      {/* Header Panel */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0a0a0a] border-b border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-sans">
            রিয়েল-টাইম কন্ট্রোল ও আর্কিটেকচার সিমুলেটর
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={resetSimulator}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-gray-400 border border-[#222] rounded bg-[#141414] hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
            id="btn-scrcpy-reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            রিসেট
          </button>
        </div>
      </div>

      {/* Connection metrics bar */}
      <div className="grid grid-cols-4 px-5 py-2.5 bg-[#050505] border-b border-[#222] text-xxs font-mono text-gray-400 gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">কানেকশন:</span> 
          <span className={simulation.usbConnected ? "text-cyan-400 font-semibold" : "text-amber-500"}>
            {simulation.usbConnected ? "USB ACTIVE" : "DISCONNECTED"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">এনকোডার:</span> 
          <span className="text-cyan-400/90">H.264 (OMXVic)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">লেটেন্সি:</span> 
          <span className="font-semibold text-cyan-400">{simulation.latencyMs} ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">ফ্রেমরেট:</span> 
          <span className="text-cyan-400">{simulation.fps} FPS</span>
        </div>
      </div>

      {/* Simulator Interface Container */}
      <div className="flex flex-col lg:flex-row flex-1 p-5 gap-6 justify-center items-center bg-[#050505] overflow-y-auto">
        
        {/* Computer Screen Panel */}
        <div className="flex flex-col items-center flex-1 w-full max-w-[320px]">
          {/* Device Selector tabs */}
          <div className="flex bg-[#0a0a0a] border border-[#222] p-1 rounded-lg gap-1.5 mb-2.5 w-full select-none">
            <button
              onClick={() => {
                setSelectedDevice("redmi5");
                addLog("সিমুলেশন ডিভাইস সক্রিয় করা হয়েছে: Xiaomi Redmi 5 (রেডমি ৫)", "success");
              }}
              className={`flex-1 py-1 px-2 text-[10px] font-sans font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedDevice === "redmi5"
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-950/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              রেডমি ৫ (Redmi 5)
            </button>
            <button
              onClick={() => {
                setSelectedDevice("s20");
                addLog("সিমুলেশন ডিভাইস সক্রিয় করা হয়েছে: Samsung Galaxy S20", "warning");
              }}
              className={`flex-1 py-1 px-2 text-[10px] font-sans font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedDevice === "s20"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              গ্যালাক্সি S20
            </button>
          </div>

          <span className="text-xxxxs sm:text-xxs font-mono text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-1">
            <Laptop className="w-3.5 h-3.5 text-cyan-400" /> পিসি মনিটর উইন্ডো (PC Client)
          </span>

          {/* PC Monitor Frame */}
          <div className="relative w-full aspect-[9/16] bg-[#0a0a0a] border-[6px] border-[#252525] rounded-[18px] shadow-2xl overflow-hidden flex flex-col group transition-all duration-300">
            {/* Scrcpy Status Overlay */}
            {!simulation.scrcpyRunning && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center bg-black/95">
                <Laptop className="w-12 h-12 text-slate-700 mb-4 stroke-1 animate-bounce" />
                <h3 className="text-sm font-semibold text-slate-300 mb-1">
                  ডিসপ্লে মিরর অফল্যাইন
                </h3>
                <p className="text-xxs text-slate-500 max-w-[200px] mb-5">
                  কম্পিউটার উইন্ডোতে রিমোট স্ক্রিন দেখতে Scrcpy লোডারটি রান করুন।
                </p>
                <button 
                  onClick={toggleScrcpy}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-500 rounded-md transition-all active:scale-95 shadow-md hover:shadow-cyan-900/30 cursor-pointer"
                  id="btn-scrcpy-start"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Scrcpy চালু করুন
                </button>
              </div>
            )}

            {/* PC Client Active Scrcpy Title bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#141414] border-b border-[#222] text-[10px] font-mono select-none">
              <span className="text-gray-400 truncate max-w-[150px]">scrcpy_mirror: {selectedDevice === "redmi5" ? "Xiaomi Redmi 5" : "SM-G98F"}</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              </div>
            </div>

            {/* Simulated Android Screen Frame */}
            <div 
              ref={monitorScreenRef}
              onClick={handleMonitorClick}
              className={`relative flex-1 bg-black overflow-hidden cursor-crosshair select-none transition-all ${
                !simulation.isPowerOn ? "brightness-[0.05]" : ""
              }`}
            >
              {/* Dynamic Coordinate Hover Stats */}
              <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black/70 border border-[#222] rounded text-[9px] font-mono text-cyan-400">
                X: {simulation.currentCoordinate?.x || 0} | Y: {simulation.currentCoordinate?.y || 0}
              </div>

              {selectedDevice === "redmi5" ? (
                <div className="absolute inset-0 flex flex-col bg-black text-[#e0e0e0] relative">
                  {/* The actual beautifully generated picture of Redmi 5 screen! */}
                  <img 
                    src={
                      redmiTab === "home" ? redmiHomeImg :
                      redmiTab === "recovery" ? redmiRecoveryImg :
                      redmiHardwareImg
                    } 
                    alt="Redmi 5 Display View"
                    className="w-full h-full object-cover transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Interactive floating HUD overlay */}
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 via-black/50 to-transparent p-3 pt-4 flex justify-between items-center z-10 select-none">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-amber-400 tracking-wider font-sans uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                        {redmiTab === "home" && "রেডমি ৫ হোম স্ক্রীন"}
                        {redmiTab === "recovery" && "এডিবি রিকভারী মোড"}
                        {redmiTab === "hardware" && "ইন্টারনাল আর্কিটেকচার"}
                      </span>
                      <span className="text-[8px] text-gray-400 font-mono">Redmi 5 (MDG1) Live Session</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[9px] bg-black/50 border border-[#222] px-2 py-0.5 rounded text-cyan-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      SECURE_LINK
                    </div>
                  </div>

                  {/* Interactive Bottom action bar inside Redmi 5 */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 pb-4 flex flex-col gap-2 z-10 select-none">
                    <div className="flex justify-around gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRedmiTab("home");
                          addLog("[Redmi 5] হোম স্ক্রীন গ্যালারী ভিউ লোড করা হয়েছে।", "success");
                        }}
                        className={`flex-1 py-1 px-1.5 text-[8px] font-medium rounded transition-all cursor-pointer ${
                          redmiTab === "home"
                            ? "bg-amber-600 text-white font-bold border border-amber-500/30"
                            : "bg-black/60 border border-[#222] text-gray-400 hover:text-white"
                        }`}
                      >
                        হোম স্ক্রীন
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRedmiTab("recovery");
                          addLog("[Redmi 5] এডিবি ডায়াগনস্টিকস রিকভারী মোড অ্যাক্টিভ।", "adb");
                        }}
                        className={`flex-1 py-1 px-1.5 text-[8px] font-medium rounded transition-all cursor-pointer ${
                          redmiTab === "recovery"
                            ? "bg-amber-600 text-white font-bold border border-amber-500/30"
                            : "bg-black/60 border border-[#222] text-gray-400 hover:text-white"
                        }`}
                      >
                        রিকভারী মোড
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRedmiTab("hardware");
                          addLog("[Redmi 5] মাদারবোর্ড ও ইলেকট্রনিক্স ডায়াগ্রাম ভিউ।", "info");
                        }}
                        className={`flex-1 py-1 px-1.5 text-[8px] font-medium rounded transition-all cursor-pointer ${
                          redmiTab === "hardware"
                            ? "bg-amber-600 text-white font-bold border border-amber-500/30"
                            : "bg-black/60 border border-[#222] text-gray-400 hover:text-white"
                        }`}
                      >
                        হার্ডওয়্যার
                      </button>
                    </div>
                    
                    <span className="text-[7.5px] leading-tight text-gray-450 font-sans text-center">
                      {redmiTab === "home" && "মিইউআই ১১ ইন্টারফেস এবং ডাইনামিক উইজেট গ্যালারি।"}
                      {redmiTab === "recovery" && "সিস্টেম রিস্টোরেশনের জন্য এডিবি টার্মিনাল ডাটা ফ্লো সংকেত।"}
                      {redmiTab === "hardware" && "ভাঙা স্ক্রিন ট্রাবলশুটিং মেমোরী ডকিং চিপ ডায়াগ্রাম।"}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Simulated OS Screens */}
                  {selectedSimApp === "home" && (
                    <div className="absolute inset-0 flex flex-col p-4 bg-gradient-to-b from-[#111111] to-[#222222] text-[#e0e0e0]">
                      {/* StatusBar */}
                      <div className="flex justify-between items-center text-[10px] font-sans opacity-85 mb-3">
                        <span className="font-semibold text-xxs font-mono text-white">11:58</span>
                        <div className="flex items-center gap-1 text-gray-300">
                          <Wifi className="w-3 h-3 text-cyan-400" />
                          <Battery className="w-3.5 h-3 text-cyan-400" />
                        </div>
                      </div>

                      {/* Widget */}
                      <div className="my-5 text-center">
                        <span className="text-3xl font-light tracking-tight text-white">11:58</span>
                        <span className="text-[10px] block text-gray-400 mt-1 uppercase font-mono">Friday, June 19</span>
                      </div>

                      {/* App Grid */}
                      <div className="grid grid-cols-3 gap-y-7 gap-x-3 mt-10">
                        {/* Settings App Icon (Simulated TARGET) */}
                        <div className="flex flex-col items-center group/app">
                          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-[#222] flex items-center justify-center p-2.5 shadow-md shadow-black/30 group-hover/app:scale-105 active:scale-90 transition-all">
                            <Smartphone className="w-full h-full text-slate-300" />
                          </div>
                          <span className="text-[9px] mt-1.5 text-center text-gray-300 truncate w-14 font-medium filter drop-shadow">ফোন বুক</span>
                        </div>

                        <div className="flex flex-col items-center group/app">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center p-2.5 shadow-md shadow-black/30 group-hover/app:scale-105 active:scale-90 transition-all">
                            <Sparkles className="w-full h-full text-white" />
                          </div>
                          <span className="text-[9px] mt-1.5 text-center text-gray-300 truncate w-14 font-medium filter drop-shadow">সহায়ক মডিউল</span>
                        </div>

                        {/* TARGET SETTINGS ICON */}
                        <div className="flex flex-col items-center group/settings relative">
                          <div className="absolute -top-1 -right-1 z-10 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                          <div className="absolute -top-1 -right-1 z-10 w-3 h-3 rounded-full bg-rose-500 border border-white/40 flex items-center justify-center text-[7px] text-white font-bold font-mono">
                            !
                          </div>
                          
                          <div className="w-11 h-11 rounded-xl bg-neutral-950 border-2 border-cyan-500/80 flex items-center justify-center p-2.5 shadow-md shadow-cyan-500/10 group-hover/settings:scale-105 active:scale-90 transition-all ring-4 ring-cyan-950/40">
                            <Terminal className="w-full h-full text-cyan-400 rotate-12" />
                          </div>
                          <span className="text-[9px] mt-1.5 text-center text-cyan-300 font-semibold truncate w-14 filter drop-shadow">Settings (ট্যাপ করুন)</span>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div className="mt-auto px-2 py-1 bg-black/40 border border-white/5 rounded-md text-[8px] leading-relaxed text-center font-mono text-gray-300">
                        <span className="font-semibold text-cyan-400 text-[9px] block mb-0.5">Scrcpy Live Mirror</span>
                        উইনডোতে ক্লিক করে মাউস ক্লিক কনভার্শন মেকানিজম দেখুন।
                      </div>
                    </div>
                  )}

                  {selectedSimApp === "settings" && (
                    <div className="absolute inset-0 flex flex-col bg-[#080808] text-gray-200 p-3.5">
                      {/* Custom Header */}
                      <div className="flex items-center gap-2 pb-2.5 border-b border-[#222] text-xs font-semibold">
                        <span className="text-gray-500 cursor-pointer">←</span>
                        <span className="text-white font-sans">Android Settings</span>
                      </div>

                      {/* Menu Options */}
                      <div className="flex flex-col gap-1.5 mt-4 text-xxxxs sm:text-[10px]">
                        <div className="p-2 border border-[#222] rounded bg-neutral-900/40 flex items-center justify-between text-gray-400 opacity-65">
                          <span>Network & WiFi</span>
                          <span>Connected</span>
                        </div>
                        <div className="p-2 border border-[#222] rounded bg-neutral-900/40 flex items-center justify-between text-gray-400 opacity-65">
                          <span>Connected Devices (USB)</span>
                          <span>ADB forward</span>
                        </div>
                        <div className="p-2 border border-[#222] rounded bg-neutral-900/40 flex items-center justify-between text-gray-400 opacity-65">
                          <span>Display & Theme</span>
                          <span>Dark Theme</span>
                        </div>

                        {/* About Phone Target Option */}
                        <div className="relative group/about">
                          <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                          <div className="p-2.5 border border-cyan-500/30 rounded bg-cyan-950/20 text-cyan-300 font-medium hover:bg-cyan-950/40 cursor-pointer flex justify-between items-center transition-all">
                            <span>About Phone (ডেভেলপার পেতে)</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSimApp === "developer_options" && (
                    <div className="absolute inset-0 flex flex-col bg-[#050505] text-[#e0e0e0] p-3.5">
                      {/* Custom Header */}
                      <div className="flex items-center gap-2 pb-2.5 border-b border-[#222] text-[11px] font-semibold text-white font-sans">
                        <span className="text-gray-500 cursor-pointer">← About Phone</span>
                      </div>

                      {/* Build Number Box */}
                      <div className="flex flex-col gap-2 mt-4 text-xxxxs sm:text-[9px]">
                        <div className="p-2 border border-[#222] rounded bg-neutral-900/20 text-gray-400">
                          <span className="block text-gray-600">Model Name</span>
                          <span className="text-[#e0e0e0]">SM-G98F (Galaxy S20)</span>
                        </div>
                        
                        {/* BUILD NUMBER ACTIVATE TARGET */}
                        <div className="relative">
                          {!developerActivated ? (
                            <div className="absolute -top-1 right-0 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                          ) : null}
                          <div 
                            className={`p-2.5 border rounded cursor-pointer transition-all ${
                              developerActivated 
                                ? "border-cyan-500/40 bg-cyan-950/10 text-cyan-400" 
                                : "border-cyan-500 border-dashed bg-cyan-950/20 text-cyan-300"
                            }`}
                          >
                            <span className="block text-xxxxs text-slate-500 uppercase font-mono tracking-wider">Build Number</span>
                            <span className="font-semibold block text-white font-mono">RP1A.200720.012</span>
                            <span className="text-xxxxs block text-gray-400 mt-1">
                              {!developerActivated 
                                ? "👉 ৭ বার ক্লিক করুন ডেভেলপার মুড অন করতে" 
                                : "✔ ডেভেলপার মুড এবং এডিবি ডিবাগিং অ্যাক্টিভেটেড!"
                              }
                            </span>
                          </div>
                        </div>

                        <div className="p-2 border border-[#222] rounded bg-neutral-900/20 text-gray-500">
                          <span className="block text-gray-600 font-sans">Android Version</span>
                          <span className="text-gray-300 font-mono">11.0 (R)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Click Ripple Indicator */}
              {simulation.simulatedTap && (
                <div 
                  className="absolute pointer-events-none z-30 w-10 h-10 border border-cyan-500 rounded-full animate-ping opacity-60 flex items-center justify-center -ml-5 -mt-5"
                  style={{ left: simulation.simulatedTap.x, top: simulation.simulatedTap.y }}
                >
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
                </div>
              )}
            </div>

            {/* Simulated Scrcpy Footer controllers */}
            {simulation.scrcpyRunning && (
              <div className="px-3 py-2 bg-[#0a0a0a] border-t border-[#222] text-xxs flex justify-around gap-2">
                <button 
                  onClick={() => handleHardwareKey("4", "BACK")}
                  className="flex-1 py-1 font-mono hover:bg-[#141414] rounded text-slate-300 active:text-cyan-400 border border-[#222] cursor-pointer"
                >
                  BACK
                </button>
                <button 
                  onClick={() => handleHardwareKey("3", "HOME")}
                  className="flex-1 py-1 font-mono hover:bg-[#141414] rounded text-slate-300 active:text-cyan-400 border border-[#222] cursor-pointer"
                >
                  HOME
                </button>
                <button 
                  onClick={toggleScrcpy}
                  className="flex items-center justify-center p-1 font-mono hover:bg-rose-950/50 hover:text-rose-400 border border-[#222] rounded text-slate-400 transition-all cursor-pointer"
                  title="মিরর ক্লোজ"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pulsing Cable Visualizer Column */}
        <div className="flex flex-row lg:flex-col items-center justify-center py-2 lg:py-10">
          <div className="flex flex-col items-center">
            <span className="text-xxxxs font-mono text-gray-500 mb-1">ADB USB</span>
            <button 
              onClick={toggleUsb}
              className={`p-3 rounded-full border transition-all cursor-pointer shadow-lg active:scale-90 ${
                simulation.usbConnected 
                  ? "bg-[#141414] border-cyan-500/40 text-cyan-400 shadow-cyan-900/10" 
                  : "bg-[#0a0a0a] border-[#222] text-gray-500"
              }`}
              id="btn-scrcpy-usb"
            >
              <Usb className={`w-6 h-6 ${simulation.usbConnected ? "animate-pulse" : ""}`} />
            </button>
          </div>

          {/* Animated Connecting cable */}
          <div className="relative w-16 h-1 lg:w-1 lg:h-20 bg-neutral-900 flex items-center justify-center overflow-hidden my-2 lg:my-3">
            {simulation.usbConnected && (
              <div 
                className={`absolute bg-cyan-400 shadow-md shadow-cyan-500 rounded-full ${
                  pulseActive 
                    ? "w-4 h-4" 
                    : "w-2.5 h-2.5"
                } ${
                  "top-0 animate-bounce duration-500"
                }`}
              />
            )}
          </div>
        </div>

        {/* Broken SmartPhone Panel */}
        <div className="flex flex-col items-center flex-1 w-full max-w-[190px]">
          <span className="text-xxxxs sm:text-xxs font-mono text-gray-500 mb-2 uppercase tracking-widest flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-rose-500" /> ফিজিক্যাল মোবাইল (Dead Display)
          </span>

          {/* Physical Phone Frame */}
          <div className="relative w-full aspect-[9/18] bg-[#0d0d0d] border-[8px] border-neutral-800 rounded-[28px] shadow-2xl flex flex-col overflow-hidden ring-4 ring-neutral-900 ring-offset-2 ring-offset-[#050505]">
            
            {/* Ear Piece and Sensor speaker dot */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 w-12 h-1 bg-slate-805 rounded-full" />
            <div className="absolute top-2 right-12 z-20 w-1.5 h-1.5 rounded-full bg-slate-900" />

            {/* LED Blink Indicator */}
            <div className="absolute top-2 left-10 z-20 w-1 h-1 rounded-full bg-blue-500 animate-ping" />

            {/* Cracked LCD / Glass Texture Overlay - representing dead display */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-45 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center origin-center" />

            {/* Internal phone screen display (Fully BLACK, screen is broken!) */}
            <div className="flex-1 bg-black flex flex-col justify-center items-center p-3 text-center text-slate-600 select-none">
              
              {/* Display Status indicators */}
              <div className="w-3 h-3 rounded-full bg-neutral-950 border border-neutral-900 mb-2" />
              <span className="text-[10px] font-sans text-amber-500 font-bold tracking-tight uppercase px-1.5 py-0.5 border border-dashed border-amber-950/40 rounded bg-amber-950/10">
                হার্ডওয়্যার ডেড স্ক্রিন
              </span>
              <p className="text-xxxxs text-gray-500 font-mono mt-3 max-w-[140px] leading-relaxed">
                মোবাইলের ভেতরের টাচ এলসিডি ক্ষতিগ্রস্ত হয়েছে। এটি পুরোপুরি অন্ধকার কিন্তু মাদারবোর্ড সচল আছে।
              </p>

              {/* Glowing Indicator of Input Injection */}
              {simulation.simulatedTap && (
                <div 
                  className="absolute z-20 w-12 h-12 bg-cyan-500/20 shadow-lg shadow-cyan-400 rounded-full animate-ping flex items-center justify-center"
                >
                  <span className="text-[#e2f9ff] text-[8px] font-mono">INJECTED</span>
                </div>
              )}
            </div>

            {/* Virtual Navigation keys (representing hardware/bottom margin keys) */}
            <div className="h-6 bg-[#0a0a0a] flex justify-around items-center px-4 relative border-t border-[#1a1a1a]">
              <span className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
              <div className="w-10 h-0.5 bg-neutral-800 rounded-full" />
              <span className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
            </div>

            {/* Volume and Power hardware keys */}
            <div className="absolute right-[-10px] top-12 z-20 flex flex-col gap-2">
              <button 
                onClick={() => handleHardwareKey("24", "VOL_UP")}
                className="w-1.5 h-6 bg-neutral-600 rounded-l hover:bg-cyan-500 active:scale-95 transition-all text-transparent cursor-pointer"
                title="Vol Up"
              >
                +
              </button>
              <button 
                onClick={() => handleHardwareKey("25", "VOL_DOWN")}
                className="w-1.5 h-6 bg-neutral-600 rounded-l hover:bg-cyan-500 active:scale-95 transition-all text-transparent cursor-pointer"
                title="Vol Down"
              >
                -
              </button>
              <button 
                onClick={() => handleHardwareKey("26", "POWER")}
                className="w-1.5 h-8 bg-red-800 rounded-l hover:bg-cyan-500 active:scale-95 transition-all mt-4 text-transparent cursor-pointer"
                title="Power button (input keyevent 26)"
              >
                P
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Embedded Terminal Log panel */}
      <div className="h-[140px] bg-[#050505] border-t border-[#222] flex flex-col">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0d0d0d] border-b border-[#222] select-none">
          <Terminal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">
            এডিবি কন্সোল ও সকেট ট্রেইস (Live Log Trace)
          </span>
          <span className="ml-auto text-xxxxs font-mono text-gray-600">
            {lastAction ? `শেষ অ্যাকশন: ${lastAction}` : "কমান্ড ওয়েটিং"}
          </span>
        </div>
        <div className="flex-1 p-3 font-mono text-xxxxs sm:text-xxs text-slate-300 overflow-y-auto leading-relaxed flex flex-col-reverse gap-1 select-text">
          {simulation.systemLogs.map((log) => (
            <div key={log.id} className="flex gap-2.5 items-start">
              <span className="text-gray-500 block shrink-0">{log.timestamp}</span>
              <span className={`block tracking-tight font-medium ${
                log.type === "success" ? "text-cyan-400" :
                log.type === "error" ? "text-rose-400" :
                log.type === "warning" ? "text-amber-400" :
                log.type === "adb" ? "text-blue-400" : "text-slate-300"
              }`}>
                {log.type === "adb" ? "[ADB cmd] " : ""}
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
