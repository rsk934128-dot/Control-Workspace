import React, { useState } from "react";
import { 
  FileCode, 
  Copy, 
  Check, 
  Bot, 
  Send, 
  Sparkles, 
  Code,
  AlertCircle
} from "lucide-react";
import { CodeTemplate } from "../types";
import { CODE_TEMPLATES } from "../data";

export default function CodeWorkspace() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aiChats, setAiChats] = useState<{ role: "user" | "bot"; text: string }[]>([
    {
      role: "bot",
      text: "আসসালামু আলাইকুম! আমি আপনার রিমোট স্ক্রিন মিররিং কোডিং সহকারী। আপনি এই কোডটি পরিবর্তন করতে চান, যেমন: কীবোর্ড ম্যাপিং সংযোগ করা বা সি# (C#) রেডি করা? আমাকে বাংলায় যেকোনো প্রশ্ন করুন!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const activeTemplate = CODE_TEMPLATES[selectedIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAISend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsg = prompt.trim();
    setPrompt("");
    setApiError(null);
    setAiChats(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMsg,
          currentCode: activeTemplate.code,
          type: activeTemplate.title,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gemini API সার্ভারে ব্যর্থ হয়েছে।");
      }

      const data = await response.json();
      setAiChats(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch (error: any) {
      console.error("Error communicating with backend Gemini:", error);
      setApiError(error.message || "সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে নিশ্চিত হোন যে API কি-টি সঠিকভাবে সেট করা হয়েছে।");
      setAiChats(prev => [
        ...prev, 
        { 
          role: "bot", 
          text: "দুঃখিত, সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে মডিউলটি রিফ্রেশ করে আবার চেষ্টা করুন।" 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Code selections header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 bg-[#0d1425] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-4.5 h-4.5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            রিমোট মিররিং সোর্স কোড রিপোজিটরি
          </h2>
        </div>
        
        {/* Dropdown template selector */}
        <div className="flex items-center gap-1">
          <span className="text-xxs font-mono text-slate-500 uppercase mr-1">স্ক্রিপ্ট:</span>
          <select 
            value={selectedIdx} 
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="px-2.5 py-1 text-xs font-medium font-sans bg-slate-900 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-emerald-500"
            id="select-scrcpy-template"
          >
            {CODE_TEMPLATES.map((item, index) => (
              <option key={index} value={index}>
                {item.filename} ({item.language})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main split work region: Upper Code, Lower Assistant */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Template code container */}
        <div className="flex-1 flex flex-col bg-[#050811] p-5 min-h-0 border-b border-slate-800/85">
          <div className="flex items-start justify-between mb-3 text-xxs">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-emerald-400 font-bold">{activeTemplate.title}</span>
              <p className="text-slate-500 max-w-[420px] tracking-tight text-xxxxs sm:text-xxs">{activeTemplate.description}</p>
            </div>
            
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xxs bg-slate-900/40 border border-slate-800/80 rounded hover:text-emerald-400 hover:border-emerald-500/30 text-slate-300 transition-all cursor-pointer"
              id="btn-copy-code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  কপি হয়েছে
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  কোড কপি
                </>
              )}
            </button>
          </div>

          {/* Actual Code View with nice scroller */}
          <div className="flex-1 min-h-0 rounded-lg border border-slate-900/60 bg-[#02050b] overflow-hidden flex flex-col">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#070b14] border-b border-slate-950 font-mono text-[9px] text-slate-500">
              <Code className="w-3 h-3 text-slate-600" />
              <span>{activeTemplate.filename}</span>
            </div>
            <pre className="flex-1 p-4 font-mono text-xxxxs sm:text-xxs text-slate-300 leading-relaxed overflow-y-auto whitespace-pre select-text">
              <code>{activeTemplate.code}</code>
            </pre>
          </div>
        </div>

        {/* Gemini AI Assisting Terminal */}
        <div className="h-[210px] bg-[#070b14] flex flex-col">
          {/* Section banner */}
          <div className="px-4 py-2 bg-[#090e1b] border-b border-slate-900 flex items-center gap-2 select-none">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-300">
              Gemini AI কোড সহকারী ও মডিউলার এডিটর (Bangla Coding AI)
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-slate-500">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> Gemini SDK v2
            </span>
          </div>

          {/* Chat log displays */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 bg-[#04070d] text-xxxxs sm:text-xxs font-sans">
            {aiChats.map((chat, i) => (
              <div 
                key={i} 
                className={`flex gap-2.5 max-w-[90%] items-start rounded-xl p-2.5 ${
                  chat.role === "user" 
                    ? "bg-[#16122d]/60 border border-[#271d47] text-slate-200 ml-auto flex-row-reverse" 
                    : "bg-[#0c1220]/75 border border-slate-900/70 text-slate-300"
                }`}
              >
                <div className={`p-1 rounded-full shrink-0 ${chat.role === "user" ? "bg-purple-950 text-purple-300" : "bg-emerald-950 text-emerald-400"}`}>
                  {chat.role === "user" ? <Code className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div className="whitespace-pre-line leading-relaxed text-xxxxs sm:text-xxs select-text">
                  {chat.text}
                </div>
              </div>
            ))}
            
            {/* Spinning load state */}
            {isLoading && (
              <div className="flex gap-2 p-2.5 bg-slate-900/30 border border-slate-900/60 rounded-xl max-w-[50%] items-center text-slate-400 italic">
                <div className="w-3 h-3 rounded-full border border-t-transparent border-emerald-400 animate-spin" />
                <span>Gemini টাইপ করছে...</span>
              </div>
            )}

            {/* Error notifications */}
            {apiError && (
              <div className="flex gap-2 p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-tight text-xxs font-mono">{apiError}</span>
              </div>
            )}
          </div>

          {/* Prompt Entry Box */}
          <form 
            onSubmit={handleAISend}
            className="p-2.5 bg-[#03060c] border-t border-slate-900/80 flex gap-2"
          >
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="যেমন: 'এই কোড সি ইউনিটের মতো সি++ (C++) এ কীভাবে লিখব?'"
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-sans"
              id="input-scrcpy-ai-prompt"
            />
            <button 
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-sans flex items-center justify-center disabled:opacity-40 select-none cursor-pointer transition-all active:scale-95"
              id="btn-scrcpy-ai-send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
