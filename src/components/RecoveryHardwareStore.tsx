import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Keyboard, 
  Tv, 
  Zap, 
  Search, 
  Info, 
  CornerDownRight, 
  HelpCircle,
  TrendingUp,
  Award,
  Link2,
  MousePointer,
  Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface HardwareProduct {
  id: string;
  name: string;
  engName: string;
  icon: React.ReactNode;
  description: string;
  recoveryPurpose: string;
  recomSpecs: string;
  badge: string;
  platforms: {
    name: 'Amazon' | 'AliExpress' | 'Daraz';
    url: string;
    price: string;
    availability: 'In Stock' | 'Fast Shipping' | 'Available';
  }[];
  compatibility: string;
}

export default function RecoveryHardwareStore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  
  // Interactive simulator states
  const [connectedOTG, setConnectedOTG] = useState(false);
  const [connectedHDMI, setConnectedHDMI] = useState(false);
  const [connectedCaptureCard, setConnectedCaptureCard] = useState(false);
  const [connectedKeyboard, setConnectedKeyboard] = useState(false);

  const products: HardwareProduct[] = [
    {
      id: 'otg-cable',
      name: 'প্রিমিয়াম Type-C USB 3.0 OTG অ্যাডাপ্টার',
      engName: 'USB-C to USB-A OTG Cable Adapter',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      description: 'ফোনে কোনো ডিসপ্লে বা টাচ কাজ না করলে কীবোর্ড ও মাউস সরাসরি ফোনে প্লাগ ইন করার একমাত্র মাধ্যম। এটি ব্লাইন্ড রিকভারির জন্য সবচেয়ে সস্তা এবং প্রথম ট্রাবলশুটিং সামগ্রী।',
      recoveryPurpose: 'টাচ স্ক্রিন কাজ না করলে ইউএসবির মাধ্যমে ব্লাইন্ডলি পিন কোড এন্টার বা ব্লাইন্ড রসিপ স্ক্রিপ্ট চালাতে সাহায্য করে।',
      recomSpecs: 'USB 3.0 / 3.1 Gen 1 সাপোর্ট (৫ Gbps), এলুমিনিয়াম অলয় বডি, OTG Active Chipsets.',
      badge: 'অবশ্যই প্রয়োজনীয়',
      compatibility: 'সকল টাইপ-সি অ্যান্ড্রয়েড ডিভাইস (Samsung, Xiaomi, Poco, Motorola)',
      platforms: [
        { name: 'Daraz', price: '৳১২০ - ৳২৫০', url: 'https://www.daraz.com.bd/products/type-c-otg-adapter-i347690184-s1722300109.html?tracking_id=droidlink-aff-21', availability: 'Fast Shipping' },
        { name: 'AliExpress', price: '$০.৯৯ - $২.৫০', url: 'https://s.click.aliexpress.com/e/_DdOtgaffliatelinks?tracking_id=droidlink-aff-21', availability: 'In Stock' },
        { name: 'Amazon', price: '$৫.৯৯ - $৮.৯৯', url: 'https://amzn.to/3z6Otgaffiliate-20', availability: 'Available' }
      ]
    },
    {
      id: 'hdmi-dock',
      name: 'Type-C ৫-ইন-১ মাল্টিপারপাস এইচডিএমআই ডকিং স্টেশন',
      engName: 'USB-C Hub with HDMI & USB Ports',
      icon: <Tv className="w-5 h-5 text-cyan-400" />,
      description: 'ফোনকে চার্জ দেয়ার পাশাপাশি একসাথে এইচডিএমআই আউটপুট, কিবোর্ড ও মাউজ কানেক্ট করার প্রফেশনাল হাব। স্যামসাং ডেক্স বা ডেডিকেটেড ডিসপ্লে লুপ প্রোমোশনের জন্য অপরিহার্য।',
      recoveryPurpose: 'স্যামসাং বা ওয়ানপ্লাস ফ্ল্যাগশিপ ফোনে স্ক্রিন ভাঙা থাকলে ক্যাবল দিয়ে সরাসরি যেকোনো মনিটর বা টিভিতে ফোনের ব্যাকআপ উইন্ডো কাস্ট করা।',
      recomSpecs: 'HDMI 4K @ 30Hz / 60Hz, অন্তত ২টি USB Type-A পোর্ট এবং অন্তত ৬০W USB-C PD ফাস্ট চার্জিং ইনপুট পোর্ট।',
      badge: 'সার্ভিস সেন্টার রিকমেন্ডেড',
      compatibility: 'ডিসপ্লিপোর্ট অল্টারনেট মোড (DP Alt Mode) যুক্ত ইউএসবি-সি পোর্ট বিশিষ্ট ফ্ল্যাগশিপ ফোন সমূহ',
      platforms: [
        { name: 'Daraz', price: '৳৮৫০ - ৳১,৫০০', url: 'https://www.daraz.com.bd/products/5-in-1-usb-c-hub-i342981541-s169992524.html?tracking_id=droidlink-aff-21', availability: 'In Stock' },
        { name: 'AliExpress', price: '$৭.৫০ - $১২.০০', url: 'https://s.click.aliexpress.com/e/_DdHdmiDockAffiliate?tracking_id=droidlink-aff-21', availability: 'Fast Shipping' },
        { name: 'Amazon', price: '$১৪.৯৯ - $২২.৫০', url: 'https://amzn.to/3z6HdmiDockAffid-20', availability: 'Available' }
      ]
    },
    {
      id: 'capture-card',
      name: 'ইউএসবি ৩.০ এইচডিএমআই ভিডিও ক্যাপচার কার্ড (HDMI to USB)',
      engName: 'USB 3.1 HDMI Video Capture Card (OBS Hook)',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      description: 'এইচডিএমআই ডক দিয়ে মনিটরে সংযোগ করার পর, মনিটরের পরিবর্তে সরাসরি আপনার সার্ভিসিং ল্যাপটপের ফ্রি স্ক্রিনে ওবিএস স্টুডিও দিয়ে ফোনের লাইভ ভিউ কাস্ট ও রেকর্ড করার আলটিমেট কার্ড।',
      recoveryPurpose: 'অ্যান্ড্রয়েড ফোনের ভাঙা এলসিডি ভিউ ল্যাপটপ/পিসিতে লাইভ প্রজেক্ট করে মাউস ও কীবোর্ড টাচ নিয়ে ফাইল ট্রান্সফার ও এডিবি অন করা।',
      recomSpecs: 'Input Support Up to 4K, Output resolution 1080p @ 30fps / 60fps, No driver installation required (UVC standard compatible).',
      badge: 'এক্সপার্ট চয়েস',
      compatibility: 'উইন্ডোজ, ম্যাক ও লিনাক্স কম্পিউটার এ ওবিএস/পিসিএম ক্যামেরা অ্যাপের সাথে ১০০% কার্যকরী',
      platforms: [
        { name: 'Daraz', price: '৳৪৫০ - ৳৬৫০', url: 'https://www.daraz.com.bd/products/hdmi-video-capture-card-i224190841-s116120485.html?tracking_id=droidlink-aff-21', availability: 'In Stock' },
        { name: 'AliExpress', price: '$৩.২০ - $৫.৮০', url: 'https://s.click.aliexpress.com/e/_DdCaptureCardAff?tracking_id=droidlink-aff-21', availability: 'Fast Shipping' },
        { name: 'Amazon', price: '$৯.৯৯ - $১৪.০০', url: 'https://amzn.to/3z6CaptureCard-20', availability: 'Available' }
      ]
    },
    {
      id: 'keyboard-combo',
      name: 'ওয়্যারলেস মিনি ব্যাকলিট কীবোর্ড ও মাউস কম্বো',
      engName: 'Mini HTPC Backlit Keyboard & Touchpad Combo',
      icon: <Keyboard className="w-5 h-5 text-emerald-400" />,
      description: 'OTG ক্যাবলের সাথে সংযোগের জন্য অত্যন্ত পাতলা ও হালকা ওয়ান হ্যান্ডেড ট্রলিং টেকনিশিয়ান কীবোর্ড। ফোনের ভাঙা গ্লাসের বিপরীতে কীবোর্ডের ট্র্যাকপ্যাড মাউসের কাজ দ্রুত করে তুলে।',
      recoveryPurpose: 'সরাসরি একটি সিঙ্গেল OTG পোর্টে কীবোর্ড ও ট্র্যাকপ্যাড মাউস বাটন কম্বো চালিয়ে সহজে অ্যান্ড্রয়েড হোমস্ক্রিন পিন পাস করা।',
      recomSpecs: '২.৪ গিগাহার্জ ওয়্যারলেস ডংগল কানেক্টিভিটি, রিচার্জেবল লিথিয়াম ব্যাটারি, মাল্টি-টাচ ট্র্যাকপ্যাড এবং ব্যাকলিট কিজ।',
      badge: 'দ্রুত ট্রাবলশুটিং সামগ্রী',
      compatibility: 'OTG এনাবল্ড যেকোনো অ্যান্ড্রয়েড ট্যাব, স্মার্টফোন ও মিডিয়াবক্স',
      platforms: [
        { name: 'Daraz', price: '৳৩৬০ - ৳৫৫০', url: 'https://www.daraz.com.bd/products/i8-mini-wireless-keyboard-i201847124-s115048255.html?tracking_id=droidlink-aff-21', availability: 'Fast Shipping' },
        { name: 'AliExpress', price: '$৩.৫০ - $৬.০০', url: 'https://s.click.aliexpress.com/e/_DdMiniKeyboardAff?tracking_id=droidlink-aff-21', availability: 'In Stock' },
        { name: 'Amazon', price: '$১০.৯৯ - $১৬.০০', url: 'https://amzn.to/3z6MiniKeybd-20', availability: 'Available' }
      ]
    }
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.engName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedPlatform === 'All') return matchesSearch;
    return matchesSearch && p.platforms.some(pl => pl.name === selectedPlatform);
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-sans text-xs">
      
      {/* Banner and Header */}
      <div className="bg-gradient-to-r from-[#11182d] to-[#070b13] p-4.5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#1d4ed8] text-white font-extrabold tracking-wide uppercase shadow">
            AFFILIATE HARDWARE NETWORK
          </span>
          <h2 className="text-sm font-bold text-white mt-1 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            রিকভারি হার্ডওয়্যার গেজেটস এবং এফিলিয়েট শপ
          </h2>
          <p className="text-xxxxs sm:text-xxs text-slate-400 mt-0.5">
            ডিসপ্লে ভাঙা ফোন থেকে ট্রাবলশুটিং করতে বিশ্বস্ত প্ল্যাটফর্মের এফিলিয়েট পার্টনার লিংক থেকে প্রয়োজনীয় গ্যাজেট কিনুন।
          </p>
        </div>

        {/* Affiliate Info Badge */}
        <div className="p-2 rounded bg-amber-550/10 border border-amber-500/20 text-xxxxs sm:text-xxs text-amber-400 flex items-center gap-1 max-w-sm leading-snug">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>এই লিংকে ক্লিক করে ট্রাস্টেড শপ থেকে আপনার অর্ডার সম্পূর্ণ করলে DroidLink প্রোজেক্ট একটি অল্প শতাংশ কমিশন লাভ করে।</span>
        </div>
      </div>

      {/* Control Grid: Connections & Search Filters */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-900 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <input
            type="text"
            className="w-full bg-[#03060c] border border-slate-800 text-xxs pl-8 pr-3 py-2 rounded outline-none focus:border-cyan-500 text-slate-205 placeholder-slate-600 font-sans"
            placeholder="রিসোর্স সামগ্রী খুঁজুন (যেমন: ওটিজি, ডক, মাউস কীবোর্ড)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
        </div>

        {/* Filter platform tags */}
        <div className="md:col-span-6 flex gap-1.5 items-center justify-end font-sans">
          <span className="text-[10px] text-gray-400 hidden lg:inline">প্ল্যাটফর্ম ফিল্টার:</span>
          {['All', 'Daraz', 'AliExpress', 'Amazon'].map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                selectedPlatform === platform 
                  ? 'bg-amber-500 text-slate-950 shadow' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {platform === 'All' ? 'সব শপ' : platform}
            </button>
          ))}
        </div>
      </div>

      {/* Content Frame */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        
        {/* Interactive connection simulator for broken display mapping */}
        <div className="p-4.5 bg-slate-950 border border-slate-900 rounded-xl space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono bg-emerald-950/50 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-900/30">
                RECIPE SIMULATOR
              </span>
              <h3 className="text-xs font-bold text-slate-100 font-sans">ভাঙা স্ক্রিন ট্রাবলশুটিং ডাইগ্রাম ইমুলেটর (Hardware Bridge)</h3>
            </div>
            <p className="text-gray-400 text-xxs mt-1 leading-relaxed">
              আপনার ফোনের ডিসপ্লে কাজ না করলে কিভাবে হার্ডওয়্যার ওটিজি হাব এবং ক্যাপচার কার্ড ক্যাবল ব্রিজ করে ল্যাপটপ স্ক্রিনকে মনিটর বানাবেন তা লাইভ টেস্ট করে দেখুন:
            </p>
          </div>

          {/* Graphical Representation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center text-center font-sans">
            
            {/* Box 1: Phone */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl relative flex flex-col items-center justify-center min-h-[95px]">
              <span className="text-[10px] font-bold text-white block">ভাঙা অ্যান্ড্রয়েড</span>
              <p className="text-[9px] text-red-400 mt-1">কালো বা স্পর্শহীন স্ক্রিন</p>
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute top-2 right-2" />
              <div className="text-[10px] mt-2 font-mono text-slate-400">Type-C সকেট</div>
            </div>

            {/* Box 2: Type-C OTG Dock */}
            <button
              onClick={() => {
                setConnectedOTG(!connectedOTG);
                if (!connectedOTG) setConnectedHDMI(true);
              }}
              className={`p-3 border rounded-xl text-center min-h-[95px] cursor-pointer transition-colors ${
                connectedOTG 
                  ? 'bg-amber-955/20 border-amber-500 text-amber-300 shadow'
                  : 'bg-[#12111d]/50 border-slate-900 text-gray-500 hover:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold block">১. Type-C OTG হাব</span>
              <p className="text-[9px] mt-1">{connectedOTG ? '✅ কানেক্ট করা হয়েছে ' : '❌ বিচ্ছিন্ন'}</p>
              <span className="text-[9px] text-zinc-500 font-mono block mt-2 text-[8px]">HDMI & USB পোর্ট ব্রিজ</span>
            </button>

            {/* Box 3: USB Capture Card */}
            <button
              onClick={() => setConnectedCaptureCard(!connectedCaptureCard)}
              className={`p-3 border rounded-xl text-center min-h-[95px] cursor-pointer transition-colors ${
                connectedCaptureCard 
                  ? 'bg-[#10b981]/15 border-emerald-500 text-emerald-300 shadow'
                  : 'bg-[#12111d]/50 border-slate-900 text-gray-500 hover:border-emerald-900'
              }`}
            >
              <span className="text-[10px] font-bold block">২. ইউএসবি ক্যাপচার কার্ড</span>
              <p className="text-[9px] mt-1">{connectedCaptureCard ? '✅ কানেক্টেড OBS লুপ' : '❌ ওটিজিতে অফলাইন'}</p>
              <span className="text-[9px] text-zinc-500 font-mono block mt-2 text-[8px]">(HDMI-USB OBS ফিড)</span>
            </button>

            {/* Box 4: Keyboard Mouse */}
            <button
              onClick={() => setConnectedKeyboard(!connectedKeyboard)}
              className={`p-3 border rounded-xl text-center min-h-[95px] cursor-pointer transition-colors ${
                connectedKeyboard 
                  ? 'bg-blue-955/20 border-blue-500 text-blue-300 shadow'
                  : 'bg-[#12111d]/50 border-slate-900 text-gray-500 hover:border-blue-900'
              }`}
            >
              <span className="text-[10px] font-bold block">৩. কীবোর্ড ও মাউস</span>
              <p className="text-[9px] mt-1">{connectedKeyboard ? '✅ সিগন্যাল সচল (USB / 2.4G)' : '❌ অফলাইন'}</p>
              <span className="text-[9px] text-zinc-500 font-mono block mt-2 text-[8px]">পিন পাসিং ও এডিবি টগল</span>
            </button>

          </div>

          {/* Connection Result Summary Panel */}
          <div className="bg-[#12111d] p-3 text-xxxxs sm:text-xxs leading-snug rounded-lg border border-[#2b254c]/30 font-sans">
            <span className="text-amber-400 font-bold block uppercase tracking-wide mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              কানেকশন ডიაগ্রাম ফলাফল:
            </span>
            { (connectedOTG && connectedCaptureCard && connectedKeyboard) ? (
              <span className="text-emerald-400 font-bold">
                🎉 অসাধারণ! আপনার ভাঙা স্ক্রিনের ফোনটি একটি হার্ডওয়্যার মনিটর ব্রিজে পরিণত হয়েছে। ল্যাপটপে OBS বা Camera অ্যাপ খুলে ফোনে মাউস কার্সার চালিয়ে সব ডেটা কোনো রি-রুট বা পাসওয়ার্ড ঝামেলা ছাড়াই উদ্ধার করতে পারবেন!
              </span>
            ) : (
              <span className="text-slate-300">
                উপরের হার্ডওয়্যার বক্সগুলোতে ক্লিক করে কানেক্ট করুন। ওটিজি ক্যাবল, এইচডিএমআই ডক, ক্যাপচার কার্ড এবং মাউস একসাথে ব্রাইন্ডিং করাই হলো ওটিজি রিকভারির সেরা সার্ভিস ল্যাব কৌশল।
              </span>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-slate-800 transition-all font-sans relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none" />
              
              <div className="space-y-3 font-sans">
                {/* Icon & Title */}
                <div className="flex gap-3 justify-between items-start">
                  <div className="flex gap-2.5 items-start">
                    <div className="p-2 bg-slate-900 border border-slate-850 rounded-lg shrink-0">
                      {p.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-xs">{p.name}</h4>
                      <span className="text-[10px] text-cyan-400 font-mono tracking-tight block mt-0.5">{p.engName}</span>
                    </div>
                  </div>

                  <span className="text-[8px] bg-amber-955/20 text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-900/30 whitespace-nowrap">
                    {p.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-xxxxs sm:text-xxs leading-relaxed font-sans">{p.description}</p>

                {/* Why it is needed block */}
                <div className="p-2.5 bg-[#0a0f1d] border border-slate-900 rounded-lg flex gap-1.5 items-start text-xxs font-sans text-slate-300 leading-normal">
                  <span className="text-[9px] bg-indigo-950/50 text-indigo-300 font-mono font-bold px-1 rounded uppercase shrink-0 mt-0.5">ROLE</span>
                  <p className="text-xxxxs sm:text-xxs font-semibold text-slate-350">{p.recoveryPurpose}</p>
                </div>

                {/* Recommended specs */}
                <div className="text-[9.5px]">
                  <span className="text-gray-500 font-bold block mb-0.5">রিকমেন্ডেড স্পেসিফিকেশন:</span>
                  <span className="text-slate-400 font-mono font-sans">{p.recomSpecs}</span>
                </div>

                {/* Compatibility index */}
                <div className="text-[9.5px] border-t border-slate-900/40 pt-2 flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>সামঞ্জস্যতা: {p.compatibility}</span>
                </div>
              </div>

              {/* Affiliate shop links & price card footer */}
              <div className="pt-3 border-t border-slate-900 select-none space-y-2">
                <span className="text-[9px] font-bold text-gray-500 font-sans block">পছন্দসই প্ল্যাটফর্ম ও ডিসকাউন্ট রেট:</span>
                
                <div className="grid grid-cols-3 gap-2">
                  {p.platforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="p-2 bg-slate-900 hover:bg-[#1a1a1a] border border-slate-805 hover:border-slate-700 transition-all rounded shadow-sm text-center font-sans block group active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-center gap-1 text-[10px] font-black">
                        <span className={
                          platform.name === 'Daraz' ? 'text-orange-500' :
                          platform.name === 'AliExpress' ? 'text-red-500' :
                          'text-amber-500'
                        }>
                          {platform.name}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 text-gray-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                      
                      <div className="text-[9px] font-extrabold text-slate-200 mt-1 font-mono">{platform.price}</div>
                      <div className="text-[8px] text-gray-500 mt-0.5 tracking-tight font-sans text-xxxxs">{platform.availability}</div>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Hardware Recovery Tutorial Step checklist */}
        <div className="p-4.5 bg-[#0f0a1d]/25 border border-indigo-950/50 rounded-xl space-y-3.5">
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <Award className="w-4 h-4 text-amber-500" />
            ব্লাইন্ড রিকভারিতে ভিডিও কাস্ট এর কমপ্লিট সায়েন্স (Expert Setup Step)
          </h4>

          <div className="relative pl-4 space-y-3 text-xxxxs sm:text-xxs text-slate-400 leading-relaxed font-sans">
            <div className="absolute left-1 top-1 bottom-1 w-0.5 bg-indigo-900/50" />
            
            <div className="relative">
              <span className="absolute -left-4.5 top-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              <strong>ধাপ ১:</strong> ভাঙা স্ক্রিনের ফোনটিতে চার্জ কম থাকলে একটি HDMI PD OTG ডকিং স্টেশনে সংযুক্ত করে চার্জিং ক্যাবল ইনজেক্ট করুন।
            </div>

            <div className="relative">
              <span className="absolute -left-4.5 top-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              <strong>ধাপ ২:</strong> এইচডিএমআই ককপিতে একটি সাধারণ মনিটর প্লাগ করুন। যদি স্যামসাং ফোন হয় তবে অটোমেটিক স্যামসাং ডেক্স বা মিরর ভিউ কাস্ট হবে।
            </div>

            <div className="relative">
              <span className="absolute -left-4.5 top-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              <strong>ধাপ ৩:</strong> মাউস ও কীবোর্ড ডকের ফাস্ট বা সেকেন্ড ইউএসবি পোর্টে কানেক্ট করে ব্লাইন্ড সহকারী কোড দিয়ে পিন লক খুলে স্ক্রিন এক্সেস করুন।
            </div>

            <div className="relative">
              <span className="absolute -left-4.5 top-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              <strong>ধাপ ৪:</strong> যদি মনিটর হাতের কাছে না থাকে, তবে HDMI আউটপুট ক্যাবলটি <strong>USB HDMI Capture Card</strong> এর ইনপুটে লাগিয়ে তার টাইপ-এ পোর্টটি আপনার ল্যাপটপে প্লাগ-ইন করুন। ওবিএস স্টুডিও-তে "Video Capture Device" অ্যাড করলেই ফোনের ইন্টারনাল ভাঙা পর্দার কপি আপনার ল্যাপটপে লাইভ ফুটে উঠবে!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
