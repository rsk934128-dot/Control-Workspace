import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  FileText, 
  FolderDown, 
  Plus, 
  Trash2, 
  Database, 
  Play, 
  Package, 
  PhoneCall, 
  MessageSquare, 
  Settings, 
  Search, 
  Filter, 
  Lock, 
  Zap,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';

// Interfaces
interface JobTicket {
  id: string;
  clientName: string;
  phoneModel: string;
  imei: string;
  status: 'Received' | 'Extracting' | 'Completed' | 'Delivered';
  date: string;
  notes: string;
}

interface ExtractionToggles {
  contacts: boolean;
  messages: boolean;
  photos: boolean;
  whatsapp: boolean;
  recordings: boolean;
}

export default function ServiceCenterHub({ isPro, openUpgradeModal }: { isPro: boolean; openUpgradeModal: () => void }) {
  // Service Center Subscription flag (requires "PRO" or is treated as an upgraded Service Center license tier)
  // Let's allow users to unlock it if they have the PRO license activated, but highlight a high-end Tech Plan
  const [activeSubTab, setActiveSubTab] = useState<'bulk_devices' | 'extractor' | 'job_ledger'>('bulk_devices');

  // Bulk devices state
  const [devices, setDevices] = useState([
    { serial: 'SM-G998B-72120', brand: 'Samsung', model: 'Galaxy S21 Ultra', status: 'Online', auth: 'Authorized', adbVersion: '1.0.41', temperature: '36°C' },
    { serial: 'M2101K6G-4458A', brand: 'Xiaomi', model: 'Redmi Note 10 Pro', status: 'Online', auth: 'Authorized', adbVersion: '1.0.41', temperature: '38°C' },
    { serial: 'PIXEL-6PRO-112B', brand: 'Google', model: 'Pixel 6 Pro', status: 'Online', auth: 'Unauthorized', adbVersion: '1.0.41', temperature: '34°C' }
  ]);

  const [bulkLog, setBulkLog] = useState<string[]>([
    'সার্ভিস সেন্টার বাল্ক এডিবি লিসেনার সচল হয়েছে...',
    'ডিভাইস সংযুক্ত: SAMSUNG [SM-G998B-72120] - পোর্ট: ৫0৩৭',
    'ডিভাইস সংযুক্ত: XIAOMI [M2101K6G-4458A] - পোর্ট: ৫0৩৭',
    'ডিভাইস লক সনাক্তকরণ সিগন্যাল: PIXEL-6PRO ওয়েকআপ সম্পন্ন'
  ]);

  const [busyCmd, setBusyCmd] = useState<string | null>(null);

  // Extractor Toolkit states
  const [targetDevice, setTargetDevice] = useState<string>('SM-G998B-72120');
  const [extractOptions, setExtractOptions] = useState<ExtractionToggles>({
    contacts: true,
    messages: true,
    photos: false,
    whatsapp: true,
    recordings: false
  });
  
  const [extractProgress, setExtractProgress] = useState<number>(-1);
  const [extractLogs, setExtractLogs] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  // Job Ledger States
  const [jobs, setJobs] = useState<JobTicket[]>(() => {
    const saved = localStorage.getItem('droidlink_service_jobs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'JOB-9092', clientName: 'আরিফুল ইসলাম', phoneModel: 'Samsung Galaxy A54 5G', imei: '358744110025471', status: 'Completed', date: '2026-06-18', notes: 'ডিসপ্লে ৯০% ভাঙা। ব্লাইন্ড ওটিজি স্ক্রিপ্ট দিয়ে সব কন্টাক্ট এবং গ্যালারির ছবি ব্যাকআপ নেয়া হয়েছে।' },
      { id: 'JOB-9093', clientName: 'ফারুক আহমেদ (রনি)', phoneModel: 'Xiaomi Redmi Note 12', imei: '864215993351240', status: 'Received', date: '2026-06-19', notes: 'কালো স্ক্রিন, ফোন সচল। কাস্টমার হোয়াটসঅ্যাপ ও এসএমএস চ্যাট রিকভারি চান।' }
    ];
  });

  // New Ticket Form States
  const [newClient, setNewClient] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newImei, setNewImei] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist jobs to localstorage
  useEffect(() => {
    localStorage.setItem('droidlink_service_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newModel) return;
    const ticket: JobTicket = {
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: newClient,
      phoneModel: newModel,
      imei: newImei || 'N/A',
      status: 'Received',
      date: new Date().toISOString().split('T')[0],
      notes: newNotes
    };
    setJobs([ticket, ...jobs]);
    setNewClient('');
    setNewModel('');
    setNewImei('');
    setNewNotes('');
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleUpdateStatus = (id: string, nextStatus: 'Received' | 'Extracting' | 'Completed' | 'Delivered') => {
    setJobs(jobs.map(j => {
      if (j.id === id) {
        return { ...j, status: nextStatus };
      }
      return j;
    }));
  };

  // Bulk actions commands
  const handleBulkAction = async (action: string) => {
    setBusyCmd(action);
    setBulkLog(prev => [...prev, `[কমান্ড প্যাকেট] বাল্ক অপারেশন শুরু: ${action}...`]);
    
    await new Promise(r => setTimeout(r, 1500));
    
    if (action === 'unlock') {
      setBulkLog(prev => [
        ...prev,
        'SAMSUNG-G998: লক বাইপাস প্যাকেট প্যাচ সফল!',
        'XIAOMI-M2101: সিস্টেমে পিন পাসের কি-স্ট্রোক ইনজেক্ট করা হয়েছে।',
        'PIXEL-6PRO: অপেক্ষা করছে (ইউজার কিবোর্ড অথরাইজেশন রিজেক্টেড)'
      ]);
    } else if (action === 'screen_on') {
      setBulkLog(prev => [
        ...prev,
        'সকল কোয়ারিড ডিভাইসে পাওয়ার কি সিগন্যাল (KEYCODE_POWER) প্রেরণ করা হয়েছে।'
      ]);
    } else if (action === 'unzip') {
      setBulkLog(prev => [
        ...prev,
        'বাল্ক ডাম্পার প্রোটোকল: ডিভাইস ড্রাইভের অ্যাপ ডেটা কম্প্রেস করা হচ্ছে...',
        'SAMSUNG [SM-G998B] - camera_dump.zip প্যাকেজ সম্পন্ন!',
        'XIAOMI [M2101K6G] - internal_db.tar.gz তৈরি করা হয়েছে।'
      ]);
    }
    setBusyCmd(null);
  };

  // Automated Data Extraction Flow
  const handleStartExtraction = async () => {
    if (extractProgress >= 0) return;
    setExtractProgress(0);
    setExtractLogs([]);
    setExtractedData(null);

    const logSteps = [
      { p: 10, msg: `টার্গেট ডিভাইস সংযোগ নিশ্চিত করা হচ্ছে: ${targetDevice}...` },
      { p: 25, msg: 'ডেটা পাইপলাইন সেটআপ করা হচ্ছে... এডিবি রুট প্রিভিলেজ যাচাই করা হচ্ছে।' },
      { p: 40, msg: 'ডিভাইস ফাইল-সিস্টেম মাউন্ট করা হচ্ছে এবং ইউজার স্পেস স্ক্যান শুরু...' },
      { p: 60, msg: 'এসকিউলাইট ডেটাবেস রিডার সচল করা হয়েছে।' },
      { p: 80, msg: 'কন্টাক্ট এবং মেসেজ পার্স করে JSON ডেটা স্কিমায় রূপান্তর করা হচ্ছে...' },
      { p: 95, msg: 'হোয়াটসঅ্যাপ ডিক্রিপশন প্রোটোকল জেনারেট হচ্ছে এবং কি ফোল্ডার সিঙ্ক হচ্ছে...' },
      { p: 100, msg: 'এক্সট্রাক্ট প্রসেস সম্পূর্ণ! প্যাকেজ ডাউনলোডের জন্য প্রস্তুত।' }
    ];

    for (let i = 0; i < logSteps.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setExtractProgress(logSteps[i].p);
      setExtractLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logSteps[i].msg}`]);
    }

    // Generate simulated DB dump
    setExtractedData({
      device: targetDevice,
      timestamp: new Date().toLocaleString('bn-BD'),
      contactsCount: extractOptions.contacts ? 418 : 0,
      messagesCount: extractOptions.messages ? 1547 : 0,
      whatsappChats: extractOptions.whatsapp ? '২৮ টি গ্রুপ, ১৬২ টি চ্যাট থ্রেড ডিক্রিপ্ট করা হয়েছে' : 'Not Requested',
      totalSize: '৫৮.৭ এমবি',
      downloadHash: 'D-LINK-RECOVERED-2026-SECURE'
    });
  };

  const handleDownloadBackup = () => {
    alert('অভিনন্দন! আপনার ডিক্রিপ্ট করা ডেটা ডাম্প টেকনিশিয়ান ফাইল ফরম্যাটে জিপ (.zip) ফাইল হিসেবে ডাউনলোড হচ্ছে।');
  };

  const filteredJobs = jobs.filter(j => 
    j.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.phoneModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-sans">
      
      {/* Top Banner and Brand Mode identifier */}
      <div className="bg-gradient-to-r from-[#11182d] to-[#070b13] p-4.5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500 text-black font-extrabold tracking-wide uppercase shadow">
            TECHNICIAN SERVICE SUITE v4.5
          </span>
          <h2 className="text-sm font-bold text-white mt-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            সার্ভিস সেন্টার প্রফেশনাল কন্ট্রোল হাব-টিকেট প্যানেল
          </h2>
          <p className="text-xxxxs sm:text-xxs text-slate-400 mt-0.5">
            মোবাইল রিপেয়ারিং ল্যাব এবং টেকনিশিয়ানদের জন্য ডেডিকেটেড এক্সপার্ট ডেটা উইজার্ড, সার্ভিস লেজার এবং মাল্টি-ডিভাইস কমান্ডার।
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex bg-[#03060c] border border-slate-805 rounded-lg p-1 w-full md:w-auto overflow-x-auto gap-0.5">
          <button
            onClick={() => setActiveSubTab('bulk_devices')}
            className={`px-3 py-1.5 rounded text-xxxxs sm:text-xxs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'bulk_devices' ? 'bg-amber-955/20 text-amber-300 border border-amber-950/80 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            বাল্ক কানেকশন ল্যাব
          </button>
          <button
            onClick={() => setActiveSubTab('extractor')}
            className={`px-3 py-1.5 rounded text-xxxxs sm:text-xxs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'extractor' ? 'bg-amber-955/20 text-amber-300 border border-amber-950/80 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            ডিপ পার্সিং এক্সট্রাক্টর
          </button>
          <button
            onClick={() => setActiveSubTab('job_ledger')}
            className={`px-3 py-1.5 rounded text-xxxxs sm:text-xxs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === 'job_ledger' ? 'bg-amber-955/20 text-amber-300 border border-amber-950/80 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            সার্ভিস টিকেট ডায়েরি
          </button>
        </div>
      </div>

      {/* Main Panel Frame */}
      <div className="flex-1 p-5 overflow-y-auto bg-[#070b14] relative">
        
        {/* TAB 1: BULK ADB CONNECTIONS AND COMMANDER */}
        {activeSubTab === 'bulk_devices' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-950/50 border border-slate-900 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono">সক্রিয় ডিশ-পোর্ট সংযোগ</span>
                  <div className="text-xs font-bold text-emerald-400 mt-1">৩টি মাল্টি-সংযোগ সচল</div>
                </div>
                <div className="p-2 rounded bg-emerald-950/20 text-emerald-400 font-mono text-[9px] font-bold">ADB LIVE</div>
              </div>
              <div className="p-3.5 bg-slate-950/50 border border-slate-900 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono">টোটাল এক্সপোর্টেবল স্টোরেজ</span>
                  <div className="text-xs font-bold text-cyan-400 mt-1">৫১২ জিবি ক্লাউড ক্যাচ</div>
                </div>
                <div className="p-2 rounded bg-cyan-950/20 text-cyan-400 font-mono text-[9px] font-bold">D-LINK DISK</div>
              </div>
              <div className="p-3.5 bg-slate-950/50 border border-slate-900 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono">সার্ভিস ল্যাব তাপমাত্রা</span>
                  <div className="text-xs font-bold text-amber-400 mt-1">৩৭°C (স্ট্যাবল থার্মাল)</div>
                </div>
                <div className="p-2 rounded bg-amber-950/20 text-amber-400 font-mono text-[9px] font-bold">MONITOR</div>
              </div>
            </div>

            {/* Layout Split: Connected devices (List) & Bulk terminal logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Left Box: Device Grid List */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">Active Shop Devices:</span>
                  <span className="text-xxxxs sm:text-xxs text-amber-400 italic">পর্দা ছাড়া ফোনেই কাজ করবে</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {devices.map((dev) => (
                    <div key={dev.serial} className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3.5 hover:border-slate-800 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center font-bold">
                          {dev.brand[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{dev.brand} {dev.model}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-[#1e293b] text-slate-300 border border-[#334155] font-mono">{dev.serial}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-1.5 text-xxxxs sm:text-xxs text-gray-400 font-sans">
                            <div>এডিবি পোর্ট: <span className="text-slate-300 font-mono">5037</span></div>
                            <div>থার্মাল: <span className="text-amber-400 font-mono">{dev.temperature}</span></div>
                            <div>ভার্সন: <span className="text-slate-300 font-mono">ADB v{dev.adbVersion}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-1 font-mono shrink-0">
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/15 border border-emerald-900/30 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                          {dev.status}
                        </span>
                        <span className={`text-[9px] mt-1 ${dev.auth === 'Authorized' ? 'text-cyan-400' : 'text-rose-400'}`}>
                          • {dev.auth}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bulk Operation Quick Deck */}
                <div className="p-4 bg-gradient-to-br from-amber-955/5 to-transparent border border-amber-955/25 rounded-xl space-y-3.5">
                  <span className="text-[10px] text-amber-300 font-bold tracking-widest uppercase flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    সার্ভিস শপ বাল্ক কুয়িক প্রোটোকল জেনারেটর (Bulk Control panel)
                  </span>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => handleBulkAction('screen_on')}
                      disabled={!!busyCmd}
                      className="py-2.5 px-3 bg-neutral-900 hover:bg-[#1a1a1a] border border-slate-800 hover:border-slate-755 text-slate-205 text-xxxxs sm:text-xxs font-bold rounded cursor-pointer transition-colors text-center"
                    >
                      পাওয়ার কি জেগে উঠুন (Screen Wake)
                    </button>
                    <button
                      onClick={() => handleBulkAction('unlock')}
                      disabled={!!busyCmd}
                      className="py-2.5 px-3 bg-emerald-950 border border-emerald-850 hover:bg-emerald-900 text-emerald-300 text-xxxxs sm:text-xxs font-bold rounded cursor-pointer transition-colors text-center"
                    >
                      লক বাইপাস সিগন্যাল (Simulate Unlock)
                    </button>
                    <button
                      onClick={() => handleBulkAction('unzip')}
                      disabled={!!busyCmd}
                      className="py-2.5 px-3 bg-cyan-950/70 border border-cyan-850 hover:bg-cyan-900 text-cyan-200 text-xxxxs sm:text-xxs font-bold rounded cursor-pointer transition-colors text-center"
                    >
                      বাল্ক জিপ ডাম্প (Bulk Dump Recovery)
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Box: Live Terminal Console Log */}
              <div className="lg:col-span-5 flex flex-col gap-3.5">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 animate-pulse" />
                  এডিবি মাল্টি-ডিভাইস পাইপলাইন লগ:
                </span>

                <div className="flex-1 min-h-[280px] bg-black border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between">
                  {/* Log list */}
                  <div className="space-y-1.5 font-mono text-[9px] text-slate-300 overflow-y-auto max-h-[220px] scrollbar-thin">
                    {bulkLog.map((log, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-gray-500 font-bold">[{idx + 1}]</span>
                        <span className={log.includes('সফল') || log.includes('সম্পন্ন') ? 'text-emerald-400' : 'text-slate-350'}>{log}</span>
                      </div>
                    ))}
                    {busyCmd && (
                      <div className="flex gap-2 text-cyan-400 font-bold animate-pulse">
                        <span>&gt;</span>
                        <span>অটো-কমান্ড প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                      </div>
                    )}
                  </div>

                  {/* Manual fast serial command dispatch */}
                  <div className="mt-3.5 pt-3.5 border-t border-slate-900/60 flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. adb -s SAMSUNG inputs keyevent 26"
                      className="flex-1 bg-[#050912] border border-slate-800 text-xxs px-2.5 py-1.5 rounded outline-none focus:border-cyan-500 font-mono text-cyan-300 placeholder-slate-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if (val.trim()) {
                            setBulkLog(prev => [...prev, `${val.trim()}`]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        setBulkLog(prev => [...prev, 'adb devices -l (ম্যানুয়াল রিফ্রেস করা হয়েছে)']);
                      }}
                      className="px-3 bg-neutral-900 hover:bg-[#1a1a1a] border border-slate-800 hover:border-slate-755 text-slate-400 hover:text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      রিফ্রেশ
                    </button>
                  </div>
                </div>

                {/* Secure warning badge */}
                <div className="bg-[#12111d] p-3 text-slate-400 text-xxxxs sm:text-xxs leading-snug rounded-lg border border-[#2b254c]/30">
                  ⚠️ <strong>টেকনিশিয়ান ড্যাশবোর্ড নিরাপত্তা:</strong> এই মডিউলের মাধ্যমে এডিবি রুট ইউজার রাইটস বাইপাস সিকিউরিটিতে ডাটা এক্সট্রাক্ট করা হচ্ছে। ভুল এডিবি কমান্ড ব্যবহারের জন্য ডয়েডলিংক দায়ী থাকবে না।
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: DEEP PARSING EXTRACOR TOOLKIT */}
        {activeSubTab === 'extractor' && (
          <div className="space-y-4 animate-fadeIn">
            
            <div className="bg-slate-950/40 border border-slate-900/80 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Database className="w-4 h-4 text-amber-500" />
                  এক্সপার্ট ডেটা এক্সট্রাকশন উইজার্ড (Database Decryptor)
                </h3>
                <p className="text-xxxxs sm:text-xxs text-gray-400 mt-0.5 leading-relaxed font-sans">
                  সংযুক্ত অ্যান্ড্রয়েড স্ক্রিনলেস পিসির ইন্টারনাল ডিস্ক ফোল্ডার স্ক্যান করে ডিক্রিপ্ট ফরম্যাটে এসএমএস, কন্ট্যাক্ট ডেটাবেজ, হোয়াটসঅ্যাপ চ্যাট ডিলিংক এবং কল লগ উদ্ধার করুন।
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex gap-2">
                <span className="text-[10px] bg-slate-900 border border-slate-850 text-cyan-400 font-mono font-bold px-3 py-1 rounded">
                  Status: ENGINE IDLE
                </span>
              </div>
            </div>

            {/* Config Panels split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[400px]">
              
              {/* Configuration panel */}
              <div className="lg:col-span-5 bg-slate-950/70 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block border-b border-slate-900 pb-2 mb-3.5">
                    ধাপ ১: এক্সট্রাকশন প্যারামিটার কনফিগার করুন
                  </span>

                  <div className="space-y-3.5 font-sans">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xxxxs sm:text-xxs text-slate-350 font-bold">টার্গেট ড্রাইভ ডিভাইস স্লট:</label>
                      <select
                        value={targetDevice}
                        onChange={(e) => setTargetDevice(e.target.value)}
                        className="w-full bg-[#03060c] border border-slate-800 text-xxs p-2 rounded focus:ring-1 focus:ring-amber-500 outline-none text-slate-200 cursor-pointer font-sans"
                      >
                        <option value="SM-G998B-72120">Samsung (SM-G998B) - Galaxy S21 Ultra</option>
                        <option value="M2101K6G-4458A">Xiaomi (M2101K6G) - Redmi Note 10 Pro</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <label className="text-xxxxs sm:text-xxs text-slate-350 font-bold mb-1 block">টার্গেট ডেটা পার্টস (Select Databases to Parse):</label>
                      
                      <div className="space-y-2 text-xxs font-sans select-none">
                        <label className="flex items-center gap-2.5 p-2 bg-black/40 rounded border border-slate-900 cursor-pointer hover:border-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={extractOptions.contacts}
                            onChange={(e) => setExtractOptions({ ...extractOptions, contacts: e.target.checked })}
                            className="accent-amber-500 w-3.5 h-3.5 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-250 flex items-center gap-1 text-[11px]">
                              <Users className="w-3.5 h-3.5 text-cyan-400" />
                              Secure Contacts VCF
                            </span>
                            <span className="text-[9px] text-gray-500 block leading-tight">সিস্টেম কন্টাক্ট বুক রিকভারি এবং .vcf ডাম্প জেনারেশন।</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-2 bg-black/40 rounded border border-slate-900 cursor-pointer hover:border-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={extractOptions.messages}
                            onChange={(e) => setExtractOptions({ ...extractOptions, messages: e.target.checked })}
                            className="accent-amber-500 w-3.5 h-3.5 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-250 flex items-center gap-1 text-[11px]">
                              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                              SMS Chats Dump (sms.xml)
                            </span>
                            <span className="text-[9px] text-gray-500 block leading-tight">ইনবক্স, সেন্ট ও ড্রাফট মেসেজ হিস্ট্রি রিকভারি।</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-2 bg-black/40 rounded border border-slate-900 cursor-pointer hover:border-slate-800 transition-colors">
                          <input
                            type="checkbox"
                            checked={extractOptions.whatsapp}
                            onChange={(e) => setExtractOptions({ ...extractOptions, whatsapp: e.target.checked })}
                            className="accent-amber-500 w-3.5 h-3.5 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-250 flex items-center gap-1 text-[11px]">
                              <Database className="w-3.5 h-3.5 text-cyan-400" />
                              WhatsApp Database (.db) Decryptor
                            </span>
                            <span className="text-[9px] text-gray-500 block leading-tight">হোয়াটসঅ্যাপের স্কিড ফাইল রিডিং ও লোকাল ডেটাবেস পার্সিং।</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 font-sans border-t border-slate-900/60 mt-4">
                  <button
                    onClick={handleStartExtraction}
                    disabled={extractProgress >= 0 && extractProgress < 100}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xxs font-sans rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    {extractProgress >= 0 && extractProgress < 100 ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        ডেটা নিষ্কাশন হচ্ছে ({extractProgress}%)...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-slate-950 fill-current" />
                        নিষ্কাশন শুরু করুন (Extract Selected)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Extraction progress terminal tracker output */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Console list output */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 tracking-wider flex items-center gap-1 border-b border-slate-900 pb-2 mb-3">
                      <Terminal className="w-3.5 h-3.5 animate-pulse" />
                      লাইভ এক্সট্রাক্ট প্রসেসর টার্মিনাল:
                    </span>

                    <div className="text-[9.5px] font-mono text-cyan-300 space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
                      {extractLogs.length === 0 ? (
                        <span className="text-gray-600 italic block">ডিপ এক্সট্রাকশন শুরু করতে বা কন্টাক্ট মেসেজের পার্সিং এনাবল করতে বামের 'নিষ্কাশন শুরু করুন' বাটনে চাপ দিন।</span>
                      ) : (
                        extractLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span>[SYSTEM-DB]</span>
                            <span className="text-slate-300">{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Progress bar tracking */}
                  {extractProgress >= 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-900/60 font-sans">
                      <div className="flex justify-between text-xxxxs sm:text-xxs text-slate-400 mb-1 font-sans">
                        <span>Database pipeline progress:</span>
                        <span>{extractProgress}%</span>
                      </div>
                      <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-cyan-500 h-full transition-all duration-300"
                          style={{ width: `${extractProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Final extracted result summary bundle ready box */}
                {extractedData && (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl animate-scaleUp flex justify-between items-center gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="text-xxs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        ডেটা রিকভারি সম্পূর্ণ! ডাম্প ফাইল প্রস্তুত
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xxxxs sm:text-xxs text-gray-300 font-sans">
                        <div>উদ্ধারকৃত কন্টাক্ট: <span className="text-white font-mono">{extractedData.contactsCount}টি (.vcf)</span></div>
                        <div>উদ্ধারকৃত মেসেজ: <span className="text-white font-mono">{extractedData.messagesCount}টি (.xml)</span></div>
                        <div>হোয়াটসঅ্যাপ ডিক্রিপ্ট: <span className="text-white font-sans">{extractedData.whatsappChats}</span></div>
                        <div>টোটাল ফাইল-সাইজ: <span className="text-amber-300 font-mono">{extractedData.totalSize}</span></div>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadBackup}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded cursor-pointer text-xxs transition-colors flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      জিপ ডাম্প ডাউনলোড
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: REPAIR & RECOVERY TICKET LOGGER (Job Ledger) */}
        {activeSubTab === 'job_ledger' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Quick overview of jobs list */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Left Column: Create new repair ticket card */}
              <div className="lg:col-span-4 bg-slate-950/60 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block border-b border-slate-900 pb-2 mb-3.5 font-semibold">
                    ১. নতুন রিকভারি টিকেট তৈরি করুন:
                  </span>

                  <form onSubmit={handleAddJob} className="space-y-3.5 font-sans justify-between">
                    <div className="flex flex-col gap-1">
                      <label className="text-xxxxs sm:text-xxs text-slate-350 font-bold">কাস্টমারের নাম (Client Name):</label>
                      <input
                        type="text"
                        placeholder="যেমন: শরিফুল ইসলাম"
                        required
                        value={newClient}
                        onChange={(e) => setNewClient(e.target.value)}
                        className="w-full bg-[#03060c] border border-slate-800 text-xxs p-2 rounded focus:ring-1 focus:ring-amber-500 outline-none text-slate-200 placeholder-slate-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xxxxs sm:text-xxs text-slate-350 font-bold">ফোনের মডেল (Phone Model Name):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Poco X3 Pro"
                        required
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full bg-[#03060c] border border-slate-800 text-xxs p-2 rounded focus:ring-1 focus:ring-amber-500 outline-none text-slate-200 placeholder-slate-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xxxxs sm:text-xxs text-slate-350 font-bold">IMEI নম্বর (ঐচ্ছিক):</label>
                      <input
                        type="text"
                        placeholder="১৫ সংখ্যার ইউনিক IMEI"
                        value={newImei}
                        onChange={(e) => setNewImei(e.target.value)}
                        className="w-full bg-[#03060c] border border-slate-800 text-xxs p-2 rounded focus:ring-1 focus:ring-amber-500 outline-none text-slate-200 placeholder-slate-605"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xxxxs sm:text-xxs text-slate-350 font-bold">নেভিগেশন হিস্ট্রি বা ডেসক্রিপ্টিভ নোটস:</label>
                      <textarea
                        rows={2}
                        placeholder="ফোনের কন্ডিশন ও অন্যান্য ডেমো বিবরণ..."
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="w-full bg-[#03060c] border border-slate-800 text-xxs p-2 rounded focus:ring-1 focus:ring-amber-500 outline-none text-slate-200 placeholder-slate-605"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xxs rounded cursor-pointer transition-all flex items-center justify-center gap-1 mt-2.5"
                    >
                      <Plus className="w-4 h-4 text-slate-950" />
                      টিকেটটি সেভ করুন
                    </button>
                  </form>
                </div>

                <div className="bg-[#12111d] p-3 text-slate-400 text-xxxxs sm:text-xxs leading-snug rounded-lg border border-[#2b254c]/30 mt-4">
                  💡 <strong>ব্রাউজার স্মৃতি তথ্য:</strong> রিকভারি টিকিট ডায়রিটি আপনার লোকাল ব্রাউজারে সেভ থাকবে। আপনি পেজ রিলোড করলেও টিকিট লগের কোনো তথ্য মুছে যাবে না।
                </div>
              </div>

              {/* Right Column: Active tickets directory list view with filters */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Search Bar filter */}
                <div className="flex items-center gap-3 bg-slate-955/40 border border-slate-900 p-3 rounded-xl">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full bg-[#03060c] border border-slate-800 text-xxs pl-8 pr-3 py-2 rounded outline-none focus:border-cyan-500 text-slate-200 placeholder-slate-600"
                      placeholder="কাস্টমার নাম, টিকিট আইডি বা মোবাইল মডেল দিয়ে খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                  </div>
                  
                  <span className="text-xxs font-mono text-slate-500 whitespace-nowrap hidden sm:inline">
                    টোটাল টিকিট: {filteredJobs.length}টি
                  </span>
                </div>

                {/* List Container */}
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredJobs.length === 0 ? (
                    <div className="p-10 text-center bg-slate-950/50 border border-slate-900 rounded-xl">
                      <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <span className="text-xxs text-slate-400 font-medium block">কোনো রিপেয়ার বা রিকভারি টিকিট খুঁজে পাওয়া যায়নি!</span>
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <div key={job.id} className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between gap-3.5 hover:border-slate-800 transition-all font-sans">
                        
                        {/* Ticket meta info */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-slate-900/40 pb-2.5 text-xxs font-sans">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold bg-[#1e293b] text-cyan-305 px-2 py-0.5 rounded border border-[#334155]">{job.id}</span>
                              <h4 className="font-bold text-slate-200 text-xxs flex items-center gap-1">
                                {job.clientName}
                              </h4>
                            </div>
                            <p className="text-slate-400 mt-1">IMEI: <span className="font-mono text-slate-300">{job.imei}</span> • তারিখ: <span className="font-sans text-slate-300">{job.date}</span></p>
                          </div>

                          <div className="flex items-center gap-2 font-sans select-none shrink-0 text-xxs">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              job.status === 'Completed' ? 'bg-emerald-950/30 border border-emerald-900 text-emerald-400' :
                              job.status === 'Extracting' ? 'bg-cyan-955/30 border border-cyan-900 text-cyan-300 animate-pulse' :
                              job.status === 'Delivered' ? 'bg-blue-955/30 border border-blue-900 text-blue-300' :
                              'bg-amber-955/30 border border-amber-900 text-amber-300'
                            }`}>
                              {job.status === 'Received' ? 'Received (প্রাপ্ত)' :
                               job.status === 'Extracting' ? 'Extracting (নিষ্কাশন চেইন)' :
                               job.status === 'Completed' ? 'Recovery Completed' : 'Delivered (হস্তান্তরিত)'}
                            </span>
                          </div>
                        </div>

                        {/* Middle info content */}
                        <div className="space-y-1.5 text-xxs font-sans">
                          <div className="text-slate-150 font-bold">ডিভাইস প্রোফাইল: <span className="text-amber-300">{job.phoneModel}</span></div>
                          <p className="text-slate-400 leading-normal text-xxxxs sm:text-xxs">{job.notes}</p>
                        </div>

                        {/* Action buttons footer inside card */}
                        <div className="flex justify-between items-center gap-2 pt-2.5 border-t border-slate-900/30 select-none">
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[9px] text-gray-500 font-mono">চেঞ্জ স্ট্যাটাস:</span>
                            <div className="flex gap-1">
                              {['Received', 'Extracting', 'Completed', 'Delivered'].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleUpdateStatus(job.id, st as any)}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                    job.status === st 
                                      ? 'bg-amber-500 text-slate-950 font-black' 
                                      : 'bg-slate-900 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {st === 'Received' ? 'Rec' : st === 'Extracting' ? 'Ext' : st === 'Completed' ? 'Comp' : 'Deliv'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1 text-slate-500 hover:text-rose-450 hover:bg-rose-955/10 rounded cursor-pointer transition-all"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                        
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
