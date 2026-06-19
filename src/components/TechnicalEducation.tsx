import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  Play, 
  CheckCircle, 
  HelpCircle, 
  Lock, 
  FileText, 
  Video, 
  Monitor, 
  Download, 
  Check, 
  Sparkles, 
  Zap, 
  Share2, 
  Bookmark,
  Users,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface CourseModule {
  id: string;
  title: string;
  duration: string;
  isUnlocked: boolean;
  lessons: string[];
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export default function TechnicalEducation({ isPro, openUpgradeModal }: { isPro: boolean; openUpgradeModal: () => void }) {
  const [activeTab, setActiveTab] = useState<'courses' | 'ebooks' | 'quiz' | 'certificate'>('courses');
  
  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Certificate State
  const [studentName, setStudentName] = useState('');
  const [generatedCertId, setGeneratedCertId] = useState<string | null>(null);

  const modules: CourseModule[] = [
    {
      id: 'mod-1',
      title: 'মডিউল ১: অ্যান্ড্রয়েড আর্কিটেকচার ও এডিবি পরিবেশ',
      duration: '১ ঘণ্টা ৪৫ মিনিট',
      isUnlocked: true,
      lessons: [
        'কিভাবে অ্যান্ড্রয়েড ডিবাগিং পোর্ট (TCP: 5037) ও এডিবি ডেমো এনভায়রনমেন্ট কাজ করে।',
        'উইন্ডোজ, ম্যাক এবং লিনাক্স কম্পিউটারে এডিবি এনভায়রনমেন্ট পাথ সেটআপ পদ্ধতি।',
        'সাইলেন্ট এডিবি ড্রাইভার ইনিশিয়ালাইজেশন এবং সকেট হ্যান্ডশেক।'
      ]
    },
    {
      id: 'mod-2',
      title: 'মডিউল ২: ব্লাইন্ড নেভিগেশন ও কী-স্ট্রোক অটোমেশন',
      duration: '২ ঘণ্টা ৩০ মিনিট',
      isUnlocked: true,
      lessons: [
        'ফোনের স্ক্রিন ছাড়াই মাউস/কীবোর্ড অনুকরণে কীভেন্ট (KeyEvent) প্রোটোকল।',
        'নির্দিষ্ট পাসকোড বা পিন টাইপ করার ব্লাইন্ড স্ক্রিপ્ટ ফরম্যাটিং।',
        'স্লাইড জেসচার কো-অর্ডিনেট ম্যাপিং মেথডোলজি।'
      ]
    },
    {
      id: 'mod-3',
      title: 'মডিউল ৩: এক্সপার্ট ওটিজি অ্যান্ড ক্যাপচার কার্ড সেটআপ (PRO)',
      duration: '৩ ঘণ্টা ১৫ মিনিট',
      isUnlocked: isPro,
      lessons: [
        'HDMI ডক ব্রিজের মাধ্যমে যেকোনো মনিটরে স্যামসাং ডেক্স চালু করা।',
        'USB Capture Card এবং OBS Studio দিয়ে নষ্ট ডিসপ্লে ল্যাপটপে কাস্ট করা।',
        'কমপ্লিট হার্ডওয়্যার কানেকশন ও ডাবল-পাথ ক্যাবল ডিজাইন।'
      ]
    },
    {
      id: 'mod-4',
      title: 'মডিউল ৪: হোয়াটসঅ্যাপ ও লোকাল ডেটাবেজ ডিক্রিপশন (PRO)',
      duration: '৪ ঘণ্টা ১০ মিনিট',
      isUnlocked: isPro,
      lessons: [
        'অ্যান্ড্রয়েড ফাইল সিস্টেম অ্যাডমিন অ্যাক্সেস নিয়ে SQLite ডেটাবেজ পার্সিং।',
        'বার্তা ও যোগাযোগ ফোল্ডার থেকে .db ফাইল উদ্ধার চেইন।',
        'জেমিনি এআই দিয়ে ডিক্রিপ্ট করা ডেটা প্রম্পট অটোমেশন।'
      ]
    }
  ];

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "ফোনের স্ক্রিন সম্পূর্ণ ব্রোকেন বা ব্ল্যাক হলে সাইলেন্টলি লক স্ক্রিনে ৪ ডিজিটের '১২৩৪' পিন ইনপুট দেয়ার এডিবি কমান্ড কোনটি?",
      options: [
        "adb shell keyevent 1234",
        "adb shell input text 1234 && adb shell input keyevent 66",
        "adb input passcode 1234",
        "adb reboot recovery"
      ],
      correctIdx: 1,
      explanation: "সঠিক কমান্ড হচ্ছে 'adb shell input text 1234' এবং এরপর এন্টার হিসেবে 'keyevent 66' পাঠানো হয়।"
    },
    {
      id: 2,
      question: "অ্যান্ড্রয়েড ফোনের ইউএসবি ওটিজি কীবোর্ড ব্রিজ করে ব্লাইন্ড লক বাইপাস করতে নিচের কোন গ্যাজেটটি অপরিহার্য?",
      options: [
        "শুধুমাত্র ইউএসবি মাউস",
        "একটি হাইপার চার্জার",
        "টাইপ-সি ওটিজি অ্যাডাপ্টার বা ডকিং স্টেশন",
        "ব্লুটুথ স্পিকার"
      ],
      correctIdx: 2,
      explanation: "টাচ কাজ না করলে কীবোর্ড ও মাউস ফোনের সাথে যুক্ত করার প্রথম ও অন্যতম প্রধান মাধ্যম হলো টাইপ-সি ওটিজি অ্যাডাপ্টার।"
    },
    {
      id: 3,
      question: "সরাসরি মনিটরে স্যামসাং ফ্ল্যাগশিপের ডিসপ্লে লাইভ কাস্ট আউট করতে ক্যাবলে কোন মোড থাকা আবশ্যক?",
      options: [
        "DP Alt Mode (DisplayPort Alternate Mode)",
        "Fast USB Tethering Mode",
        "Bluetooth Cast Mode",
        "Super Power Delivery Only"
      ],
      correctIdx: 0,
      explanation: "DP Alt Mode থাকলেই কেবল টাইপ-সি পোর্ট সরাসরি এইচডিএমআই সিগন্যালে ডিসপ্লে ভিডিও রেন্ডার করতে পারে।"
    }
  ];

  const handleOptionSelect = (qId: number, optIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers({ ...userAnswers, [qId]: optIdx });
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIdx) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    
    // Create random professional validation serial hash identifier
    const randomSerial = `CERT-DL-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedCertId(randomSerial);
  };

  const allQuestionsAnswered = Object.keys(userAnswers).length === quizQuestions.length;

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-sans">
      
      {/* Academy Premium Banner */}
      <div className="bg-gradient-to-r from-[#11182d] to-[#070b13] p-4.5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-600 text-white font-extrabold tracking-wide uppercase shadow">
            ACADEMY EDUCATION & CERTIFICATION
          </span>
          <h2 className="text-sm font-bold text-white mt-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            ড্রয়েডলিংক টেকনিক্যাল সায়েন্স ও রিপেয়ারিং একাডেমি
          </h2>
          <p className="text-xxxxs sm:text-xxs text-slate-400 mt-0.5">
            অ্যান্ড্রয়েড এডিবি অটোমেশন, ভাঙা স্ক্রিন রিকভারি এবং ওটিজি স্ক্রিপ্ট রাইটিং শিখে লাভ করুন আপনার প্রফেশনাল টেকনিশিয়ান সার্টিফিকেট।
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-[#03060c] border border-slate-805 rounded-lg p-1 w-full md:w-auto overflow-x-auto gap-0.5 select-none text-xxs font-sans font-bold">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded text-xxxxs sm:text-xxs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'courses' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            অনলাইন কোর্স
          </button>
          <button
            onClick={() => setActiveTab('ebooks')}
            className={`px-3 py-1.5 rounded text-xxxxs sm:text-xxs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'ebooks' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            রিসোর্স ই-বুকস
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded text-xxxxs sm:text-xxs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'quiz' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            টেকনিক্যাল কুইজ
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-3 py-1.5 rounded text-xxxxs sm:text-xxs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'certificate' ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/40 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            সার্টিফিকেট টেস্ট ও ট্র্যাকার
          </button>
        </div>
      </div>

      {/* Main Educational Pane */}
      <div className="flex-1 p-5 overflow-y-auto bg-[#070b14]">
        
        {/* SUBTAB 1: ONLINE VIDEO INSTRUCTION MASTERCLASS */}
        {activeTab === 'courses' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Top Showcase Promo banner */}
            <div className="p-4 bg-gradient-to-r from-indigo-955/20 via-[#10101a] to-transparent border border-indigo-950/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="text-[10px] bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded tracking-wider uppercase font-mono">ENROLL NOW</span>
                <h3 className="text-xs font-extrabold text-white font-sans mt-1">অ্যান্ড্রয়েড এডিবি রিকভারি ও হার্ডওয়্যার স্ক্রিপ্টিং বুটক্যাম্প (Masterclass 2026)</h3>
                <p className="text-gray-400 text-xxs font-sans leading-relaxed">
                  মোবাইল ফোনের টাচ নষ্ট হলে কিভাবে ক্যাবল নেটওয়ার্ক ও এডিবি সিগন্যাল বাইপাস ব্যবহার করে সফলভাবে কাস্টমারের সকল ছবি, হোয়াটসঅ্যাপ ও ডেটা ফেরত আনবেন তা সম্পূর্ণ বাস্তব কেস-স্টাডির মাধ্যমে শেখানো হবে।
                </p>
              </div>

              <div className="text-left md:text-right shrink-0">
                <div className="text-[10px] text-gray-500">বিশেষ অফার প্রাইস:</div>
                <div className="text-sm font-black text-amber-400">৳৯৯৯ / <span className="text-xs font-medium text-slate-350">$৮.৯৯</span></div>
                
                {isPro ? (
                  <button className="mt-2 px-3 py-1.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center gap-1 leading-none cursor-default shadow">
                    <CheckCircle className="w-3.5 h-3.5" />
                    প্রো এক্সেস সচল
                  </button>
                ) : (
                  <button
                    onClick={openUpgradeModal}
                    className="mt-2 px-3 py-1.5 rounded bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 active:scale-[0.98] transition-all text-slate-950 font-black text-[10px] flex items-center gap-1.5 leading-none cursor-pointer uppercase shadow"
                  >
                    <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                    Unlock Course Buy PRO
                  </button>
                )}
              </div>
            </div>

            {/* Curriculum modular listing */}
            <div className="space-y-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold block">বুটক্যাম্প মডিউলসমূহ ও সিলেবাস সূচী:</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod) => (
                  <div key={mod.id} className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between gap-3.5 relative overflow-hidden">
                    {!mod.isUnlocked && (
                      <div className="absolute inset-0 bg-[#080c16]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
                        <Lock className="w-6 h-6 text-amber-500 mb-1.5 animate-bounce" />
                        <span className="text-xxs font-bold text-slate-100 font-sans">মডিউলটি লকড রয়েছে (Requires PRO)</span>
                        <p className="text-[9px] text-gray-500 mt-0.5 leading-tight max-w-xs font-sans">উন্নত থ্রি-স্টেজ হার্ডওয়্যার ব্লাইন্ডিং ও ভিডিও স্ক্রিপ্টের স্পেশাল ভিডিও অ্যাক্সেস পেতে প্রো সংস্করণ আনলক করুন।</p>
                        <button
                          onClick={openUpgradeModal}
                          className="mt-3 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-black rounded cursor-pointer transition-all uppercase"
                        >
                          Unlock with PRO
                        </button>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center text-xxs font-sans border-b border-slate-900/40 pb-2 mb-2.5">
                        <span className="font-extrabold text-slate-200">{mod.title}</span>
                        <span className="text-gray-500 text-[10px] font-mono font-bold tracking-tight">{mod.duration}</span>
                      </div>

                      <ul className="space-y-2 text-xxxxs sm:text-xxs text-gray-400 font-sans text-left relative pl-3.5">
                        {mod.lessons.map((less, lIdx) => (
                          <li key={lIdx} className="relative">
                            <span className="absolute -left-3.5 top-1 w-1.5 h-1.5 bg-indigo-500/85 rounded-full" />
                            {less}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-900/40 flex justify-between items-center font-sans text-xxxxs sm:text-xxs">
                      <span className="text-gray-500 text-[9px]">লেকচার সংখ্যা: ৩টি ডেডিকেটেড সেশন</span>
                      
                      <button
                        onClick={() => {
                          alert(`ভিডিও প্লেয়ার সংযোগ সিমুলেটর: "${mod.title}" সেশনের জন্য লেকচার ১ চালু হচ্ছে...`);
                        }}
                        disabled={!mod.isUnlocked}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-[#1a1a1a] border border-slate-800 text-slate-300 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                        সেশন লেকচার প্লে
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: RESOURCE E-BOOKS & TRUBLSHOOTING GUIDES */}
        {activeTab === 'ebooks' && (
          <div className="space-y-5 animate-fadeIn">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card Ebook 1 */}
              <div className="bg-slate-950/50 border border-slate-900 p-4.5 rounded-xl flex flex-col md:flex-row gap-4 items-start select-none hover:border-slate-800 transition-all">
                <div className="p-4 bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 rounded-xl font-mono shrink-0 font-extrabold w-24 h-28 text-center flex flex-col justify-between">
                  <span className="text-[10px] bg-indigo-500 text-white rounded font-mono p-0.5 tracking-tight uppercase">BOOK</span>
                  <div className="text-[9px] -mt-2 leading-relaxed">ANDROID ADB MANUAL</div>
                  <span className="text-[7px] text-gray-400 block font-mono">v1.2-PDF</span>
                </div>

                <div className="space-y-3 font-sans relative flex-1">
                  <div>
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">BEST SELLER</span>
                    <h4 className="text-xs font-bold text-slate-100 font-sans mt-0.5">অ্যান্ড্রয়েড এডিবি অটোমেশন এবং ব্লাইন্ড ডিবাগিং সিক্রেট ম্যানুয়াল</h4>
                    <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">লেখক: ড্রয়েডলিংক টেক টিম (PDF + কোড স্ক্রিপ্ট স্লট)</span>
                  </div>

                  <p className="text-gray-400 text-xxxxs sm:text-xxs leading-relaxed leading-normal">
                    এই ই-বুকটিতে রয়েছে ১০০+ রেডিমেড এডিবি ব্যাচ ফাইল কমান্ড এবং টাচ ভাঙা যেকোনো ফোনে প্যাচ লক রিমুনালিং ওটিজি কোড হ্যাক। এটি আপনার বুকশেফে থাকা আবশ্যক।
                  </p>
                  
                  <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-300">৳২৯০ / <span className="text-xxs font-mono text-gray-500">$২.৫০</span></span>
                    
                    <a
                      href="https://amzn.to/3z6EbookADBManual"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xxs font-sans rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      বুক ডাউনলোড করুন
                    </a>
                  </div>
                </div>
              </div>

              {/* Card Ebook 2 */}
              <div className="bg-slate-950/50 border border-slate-900 p-4.5 rounded-xl flex flex-col md:flex-row gap-4 items-start select-none hover:border-slate-800 transition-all">
                <div className="p-4 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded-xl font-mono shrink-0 font-extrabold w-24 h-28 text-center flex flex-col justify-between">
                  <span className="text-[10px] bg-emerald-500 text-white rounded font-mono p-0.5 tracking-tight uppercase">GUIDE</span>
                  <div className="text-[9px] -mt-2 leading-relaxed">HARDWARE BRIDGES</div>
                  <span className="text-[7px] text-gray-400 block font-mono">v4.0-PDF</span>
                </div>

                <div className="space-y-3 font-sans relative flex-1">
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">SERVICE LAB ONLY</span>
                    <h4 className="text-xs font-bold text-slate-100 font-sans mt-0.5">স্মার্টফোন হার্ডওয়্যার ওটিজি ও ডিসপ্লে কাস্টিং ডিরেক্টরি বুক</h4>
                    <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">সার্ভিস ল্যাবের জন্য এডভান্সড মাদারবোর্ড কপার ব্রিজ টেকনিক।</span>
                  </div>

                  <p className="text-gray-400 text-xxxxs sm:text-xxs leading-relaxed leading-normal">
                    মনিটর ছাড়া ক্যাপচার কার্ড ওবিএস এবং স্যামসাং ডেক্সের নিখুঁত বাটন সিকোয়েন্স পিন ম্যাপ। প্রফেশনাল মোবাইল টেকনিশিয়ানদের ল্যাব রেফারেন্স গাইড বুক।
                  </p>
                  
                  <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-300">৳৪০০ / <span className="text-xxs font-mono text-gray-500">$৩.৫০</span></span>
                    
                    <a
                      href="https://amzn.to/3z6EbookHardwareBridge"
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-slate-800 text-slate-200 font-extrabold text-xxs font-sans rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      বুক ডাউনলোড
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Resources list footer bonus */}
            <div className="p-4 bg-indigo-950/10 border border-indigo-950/30 rounded-xl space-y-2">
              <span className="text-xxs font-bold text-indigo-400 block uppercase tracking-wide">🎁 প্রফেশনাল ডক বোনাস প্যাক:</span>
              <p className="text-gray-400 text-xxxxs sm:text-xxs leading-snug">
                যেকোনো বুক অর্ডারের সাথে আপনি পাবেন ৫০টি রেডিমেড <strong>OTG Python Automation Recipes</strong> একদম ফ্রী! প্রতিটি রেসপি ফোনের পিক্সেল ও কীবোর্ড লেআউট অনুকরণ করবে চমৎকারভাবে।
              </p>
            </div>

          </div>
        )}

        {/* SUBTAB 3: PRACTICE TECHNICAL QUIZ PRACTICE */}
        {activeTab === 'quiz' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                টেকনিক্যাল এডিবি ও রিপেয়ারিং নলেজ কুইজ টেস্ট
              </h3>
              <p className="text-xxxxs sm:text-xxs text-gray-400 mt-1">
                সার্টিফিকেট টেস্টে অংশগ্রহণ করার পূর্বে আপনার এডিবি কমান্ড ও ব্লাইন্ড রিকভারি জ্ঞান কেমন রয়েছে তা এই প্র্যাক্টিস কুইজের মাধ্যমে যাচাই করে নিন।
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
              {quizQuestions.map((q, idx) => {
                const selectedOpt = userAnswers[q.id];
                return (
                  <div key={q.id} className="p-4.5 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3 text-xxs font-sans text-left">
                    <span className="font-bold text-slate-100 block">প্রশ্ন {idx + 1}: {q.question}</span>

                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        let optBg = "bg-black/40 border-slate-900 hover:border-slate-800 text-slate-300";
                        
                        if (quizSubmitted) {
                          if (optIdx === q.correctIdx) {
                            optBg = "bg-emerald-950/30 border-emerald-500 text-emerald-400 font-bold";
                          } else if (isSelected) {
                            optBg = "bg-rose-955/20 border-rose-900 text-rose-400 font-bold";
                          }
                        } else if (isSelected) {
                          optBg = "bg-indigo-955/20 border-indigo-500 text-indigo-300 font-bold";
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleOptionSelect(q.id, optIdx)}
                            disabled={quizSubmitted}
                            className={`p-2.5 rounded border text-left cursor-pointer transition-colors text-xxxxs sm:text-xxs leading-snug flex items-center gap-2 ${optBg}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-[#111] text-[10px] font-bold font-mono flex items-center justify-center border border-slate-800 shrink-0">
                              {optIdx + 1}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 bg-slate-900/60 text-[10.5px] border-l-2 border-amber-500 rounded text-slate-400 leading-normal">
                        💡 <strong>ব্যাখ্যা:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500 text-[10px]">সবগুলো প্রশ্নের জবাব দেয়া হলে সাবমিট বাটনে চাপুন।</span>
                
                {quizSubmitted ? (
                  <div className="flex gap-3 items-center">
                    <span className="font-extrabold text-slate-100 font-sans">
                      অর্জিত স্কোর: <span className="text-emerald-400 font-mono text-xs">{quizScore} / {quizQuestions.length}</span>
                    </span>
                    <button
                      onClick={() => {
                        setUserAnswers({});
                        setQuizSubmitted(false);
                        setQuizScore(0);
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded font-sans text-xxs cursor-pointer"
                    >
                      আবার টেস্ট দিন
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-650 to-indigo-500 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xxs font-sans rounded-lg cursor-pointer transition-all shadow"
                  >
                    কুইজ সাবমিট করুন
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 4: CERTIFICATE GENERATOR AND DISPATCH */}
        {activeTab === 'certificate' && (
          <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
            
            <div className="bg-slate-950/40 p-4 border border-slate-900 rounded-xl space-y-1">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                <Award className="w-4 h-4 text-yellow-500" />
                অ্যাকাডেমি সার্টিফিকেট ভ্যালিডেশন এবং প্রিন্টার হাব
              </h3>
              <p className="text-xxxxs sm:text-xxs text-gray-400 leading-relaxed font-sans">
                রিপেয়ার একাডেমি কুইজ এবং কোর্স সম্পূর্ণ করার পর আপনার প্রফেশনাল নাম টাইপ করে এডিবি মাস্টারক্লাস ভ্যালিড সার্টিফকেট পোর্টাল জেনারেট করুন। এটি যেকোনো সময় যাচাই করা সম্ভব।
              </p>
            </div>

            {/* Input Form client certificate generator */}
            {!generatedCertId ? (
              <form onSubmit={handleGenerateCertificate} className="bg-slate-950/50 border border-slate-900 p-5 rounded-xl space-y-4">
                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-slate-350 font-bold text-xxs">আপনার পূর্ণ নাম টাইপ করুন (Student Name for Certificate):</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শরিফুল ইসলাম জয়"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-[#03060c] border border-slate-800 text-slate-200 text-xxs p-2.5 rounded focus:border-amber-500 outline-none placeholder-slate-700 font-sans"
                  />
                  <span className="text-gray-500 text-[10px] mt-0.5">সার্টিফিকেটে প্রিন্টের জন্য আপনার অফিশিয়াল নাম টাইপ করুন।</span>
                </div>

                <div className="p-3 bg-amber-955/5 border border-amber-950/20 rounded-lg flex items-start gap-2 text-xxs text-slate-400 font-sans leading-relaxed">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>সার্টিফিকেট পোর্টাল জেনারেশন সফল হতে আপনার এডিবি ডেভেলপমেন্ট ও ওটিজি ট্রাবলশুটিং একাডেমির কুইজে ন্যূনতম ২ পয়েন্ট অর্জন করার পরাবর্তি সুবিধা এটি।</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-xxs font-sans rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 shadow"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  সার্টিফিকেট পোর্টাল জেনারেট করুন
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-scaleUp">
                
                {/* Visual Certificate Frame */}
                <div className="border-[6px] border-amber-950/50 p-6 bg-[#03060c] rounded-xl text-center font-sans space-y-5 relative overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full pointer-events-none" />
                  
                  {/* Certificate Header logo */}
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="p-2.5 rounded-full bg-amber-955/20 text-yellow-500 mb-1 border border-amber-900/40">
                      <Award className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase block">CERTIFICATE OF TRAINING ACHIEVEMENT</span>
                    <span className="text-[8px] text-gray-500 font-mono tracking-wider block mt-0.5">DROIDLINK ACADEMY RESEARCH LABS</span>
                  </div>

                  {/* Body Context */}
                  <div className="space-y-3.5">
                    <p className="text-gray-400 text-xxs italic">এই প্রশংসাপত্রটি অত্যন্ত আগ্রহ ও গর্বের সহিত প্রদান করা হচ্ছে</p>
                    <h4 className="text-sm font-black text-white underline decoration-amber-500 decoration-offset-4 font-sans tracking-wide">{studentName}</h4>
                    <p className="text-slate-350 text-[11px] leading-relaxed max-w-md mx-auto">
                      যিনি সফলভাবে **স্মার্টফোন এডিবি ডিবাগিং, লক বাইপাস স্ট্রোক, এবং ওটিজি হার্ডওয়্যার রিকভারি থিয়োরি ম্যানুয়াল** কোর্স ও একাডেমি সায়েন্স ড্যাশবোর্ড কুইজ সম্পন্ন করেছেন।
                    </p>
                  </div>

                  {/* Valid tracking number and Date footer of certificate */}
                  <div className="grid grid-cols-2 gap-4 text-xxxxs sm:text-xxs border-t border-slate-900/60 pt-4.5 font-mono text-gray-500 text-left pl-4 max-w-sm mx-auto">
                    <div>
                      <span>তারিখ:</span> <span className="text-slate-300 font-sans block mt-0.5">{new Date().toISOString().split('T')[0]}</span>
                    </div>
                    <div>
                      <span>যাচাইকরণ আইডি:</span> <span className="text-amber-400 font-mono block mt-0.5 font-bold">{generatedCertId}</span>
                    </div>
                  </div>

                  {/* Certified Authority sign stamp seal */}
                  <div className="flex justify-center items-center gap-1.5 text-gray-500 text-[9px] pt-1 select-none">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>DroidLink Verified Security Signature Standard</span>
                  </div>
                </div>

                {/* Print button & reset trigger */}
                <div className="flex gap-2.5 justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setStudentName('');
                      setGeneratedCertId(null);
                    }}
                    className="px-3 py-2 bg-slate-950 border border-slate-900 hover:bg-[#111] text-slate-400 hover:text-slate-100 rounded text-xxs cursor-pointer"
                  >
                    নতুন নাম দিয়ে তৈরি করুন
                  </button>

                  <button
                    onClick={() => {
                      alert(`সার্টিফিকেট ডায়েরি প্রিন্টার কন্টাক্ট: পোর্টাল আইডি ${generatedCertId} ডাউনলোড ডিরেক্টরিতে পাঠানো হচ্ছে...`);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xxs rounded flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    অফিসিয়াল কপি ডাউনলোড (.PDF)
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
