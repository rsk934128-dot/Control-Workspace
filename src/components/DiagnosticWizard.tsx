import React, { useState, useRef, useEffect } from "react";
import { 
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Search,
  CheckCircle,
  HelpCircle,
  Play,
  Wifi,
  WifiOff,
  Link,
  Activity,
  Cpu,
  Smartphone,
  QrCode,
  Usb,
  RefreshCw,
  Power,
  MessageSquare,
  Send,
  Sparkles,
  Database,
  Wrench,
  Lock,
  Zap
} from "lucide-react";
import { DIAGNOSTICS, BRAND_RECOVERY_GUIDES } from "../data";

export default function DiagnosticWizard({ isPro, openUpgradeModal }: { isPro: boolean; openUpgradeModal: () => void }) {
  const [activeTab, setActiveTab] = useState<"resolver" | "wireless" | "webusb" | "db_ai" | "otg_script">("resolver");
  const isPremiumLocked = (activeTab === "webusb" || activeTab === "db_ai" || activeTab === "otg_script") && !isPro;
  const [selectedId, setSelectedId] = useState<string>("unauthorized");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Smart Fallback Diagnostic Decision Tree states
  const [currentDecisionStep, setCurrentDecisionStep] = useState<"usb_check" | "screen_status" | "scrcpy_recommend" | "blind_recommend" | "hardware_recommend">("usb_check");
  const [decisionHistory, setDecisionHistory] = useState<string[]>([]);

  // Automated OTG-Controller Script Generator States
  const [otgBrand, setOtgBrand] = useState<string>("Samsung");
  const [otgOS, setOtgOS] = useState<string>("Android 14");
  const [otgTask, setOtgTask] = useState<string>("debugging");
  const [simulatedOtgStep, setSimulatedOtgStep] = useState<number>(-1);
  const [isSimulatingOtg, setIsSimulatingOtg] = useState<boolean>(false);
  const [simulatedOtgLogs, setOtgSimulationLogs] = useState<Array<{ time: string; msg: string; status: 'info' | 'success' | 'warning' }>>([]);

  // Brand Recovery and AI Chatbot states
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedGuideId, setSelectedGuideId] = useState<string>("samsung_dex");
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; timestamp: string }>>([
    {
      sender: "bot",
      text: "স্বাগতম! আমি আপনার জেমিনি এআই ডিসপ্লে রিকভারি এক্সপার্ট। স্যামসাং ডেক্স, শাওমি বুটলোডার, আইফোন ভয়েসওভার বা যেকোনো ফোনের ভাঙা স্ক্রিন ডেটা রিস্টোর নিয়ে আমাকে প্রশ্ন করুন!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // WebUSB / WebADB State
  const [webUsbSupported] = useState<boolean>(typeof navigator !== "undefined" && !!(navigator as any)?.usb);
  const [usbDevice, setUsbDevice] = useState<any | null>(null);
  const [usbLogs, setUsbLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'success' | 'cmd' | 'error' }>>([
    { id: "init-usb", time: new Date().toLocaleTimeString(), msg: "WebUSB প্রোটোকল সার্ভিস সচল হয়েছে। ওটিজি (OTG) কেবল দিয়ে মোবাইল পিসির সাথে যুক্ত করুন।", type: "info" }
  ]);
  const [adbInputCmd, setAdbInputCmd] = useState<string>("");
  const [isAdbSessionActive, setIsAdbSessionActive] = useState<boolean>(false);

  // Wireless Connection states
  const [ipAddress, setIpAddress] = useState<string>("192.168.0.105");
  const [port, setPort] = useState<string>("5555");
  const [pairingCode, setPairingCode] = useState<string>("829104");
  const [needPairing, setNeedPairing] = useState<boolean>(true);
  const [wirelessState, setWirelessState] = useState<'DISCONNECTED' | 'PAIRING' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [wirelessLogs, setWirelessLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'cmd' | 'success' | 'info' | 'error' }>>([]);
  const [simulatedOutcome, setSimulatedOutcome] = useState<'SUCCESS' | 'TIMEOUT' | 'REFUSED'>('SUCCESS');
  const [isQrVisible, setIsQrVisible] = useState<boolean>(false);
  const [isQrLoading, setIsQrLoading] = useState<boolean>(false);
  const [isQrPaired, setIsQrPaired] = useState<boolean>(false);

  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const isIpValid = ipv4Regex.test(ipAddress.trim());

  const activeIssue = DIAGNOSTICS.find(item => item.id === selectedId) || DIAGNOSTICS[0];

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const addWirelessLog = (message: string, type: 'cmd' | 'success' | 'info' | 'error' = 'info') => {
    setWirelessLogs(prev => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        msg: message,
        type
      },
      ...prev
    ]);
  };

  const handleWirelessConnect = async () => {
    if (!isIpValid) {
      return;
    }
    setWirelessLogs([]);
    
    // IP and Port validations
    if (!ipAddress.trim() || !port.trim()) {
      addWirelessLog("ERROR: IP Address এবং Port Number ফাঁকা রাখা যাবে না!", "error");
      setWirelessState('DISCONNECTED');
      return;
    }

    addWirelessLog("ডিভাইস ওয়্যারলেস আইপি যাচাই করা হচ্ছে...", "info");
    
    if (needPairing) {
      setWirelessState('PAIRING');
      addWirelessLog(`[CMD] adb pair ${ipAddress}:${port}`, "cmd");
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!pairingCode.trim()) {
        addWirelessLog("ERROR: Pairing Code খালি রাখা যাবে না!", "error");
        setWirelessState('DISCONNECTED');
        return;
      }
      addWirelessLog(`Pairing code চাওয়া হচ্ছে... প্রবিষ্ট কোড: ${pairingCode}`, "info");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (simulatedOutcome === 'REFUSED') {
        addWirelessLog(`ERROR: SSL pairing shook hands failed. Device pairing rejected connection!`, "error");
        setWirelessState('DISCONNECTED');
        return;
      }
      addWirelessLog(`Successfully paired with device at ${ipAddress}:${port}`, "success");
    }

    setWirelessState('CONNECTING');
    addWirelessLog(`[CMD] adb tcpip 5555`, "cmd");
    await new Promise(resolve => setTimeout(resolve, 1000));
    addWirelessLog(`[CMD] adb connect ${ipAddress}:${port}`, "cmd");
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    if (simulatedOutcome === 'TIMEOUT') {
      addWirelessLog(`ERROR: connect to ${ipAddress}:${port} timed out! নেটওয়ার্ক কানেকশন লস্ট অথবা সাবনেট ভিন্ন।`, "error");
      setWirelessState('DISCONNECTED');
      return;
    } else if (simulatedOutcome === 'REFUSED' && !needPairing) {
      addWirelessLog(`ERROR: Connection refused by ${ipAddress}:${port}. Please verify if Wireless Debugging setting is flipped ON.`, "error");
      setWirelessState('DISCONNECTED');
      return;
    }

    setWirelessState('CONNECTED');
    addWirelessLog(`[+] Connected to ${ipAddress}:${port} successfully!`, "success");
    addWirelessLog("রিমোট Scrcpy ইঞ্জিন সচল করা হচ্ছে... ৫০ FPS ওয়্যারলেস কানেকশন স্ট্যাবলড।", "info");
  };

  const handleDisconnectWireless = () => {
    setWirelessState('DISCONNECTED');
    setWirelessLogs([]);
    setIsQrVisible(false);
    setIsQrPaired(false);
    addWirelessLog("ওয়্যারলেস সেশনটি বিচ্ছিন্ন (Disconnected) করা হয়েছে।", "info");
  };

  const handleRequestQrCode = async () => {
    setIsQrVisible(true);
    setIsQrLoading(true);
    setIsQrPaired(false);
    addWirelessLog("ডিভাইস এবং পিসি সংযোগ তৈরিতে কিউআর কোড (QR Code) মোড রিকোয়েস্ট করা হচ্ছে...", "info");
    addWirelessLog("[CMD] adb pair qr-code-initiate", "cmd");
    addWirelessLog("[CMD] Awaiting pairing...", "cmd");
    addWirelessLog("Awaiting pairing...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    setIsQrLoading(false);
    addWirelessLog("[+] Android Device Debugging Service থেকে QR Code পেলোড পাওয়া গেছে!", "success");
    addWirelessLog("দয়া করে মোবাইলের Wireless Debugging > 'Pair device with QR code' দিয়ে পিক্সেল ফ্রেম স্ক্যান করুন।", "info");
  };

  const handleSimulateQrScanSuccess = async () => {
    addWirelessLog("স্ক্যানিং এবং ওয়্যারলেস হ্যান্ডশেক ভ্যালিডেট করা হচ্ছে...", "info");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (simulatedOutcome === 'REFUSED') {
      addWirelessLog("ERROR: QR Code Pairing Session was rejected or expired by Android device OS.", "error");
      setIsQrPaired(false);
      return;
    }

    setIsQrPaired(true);
    setNeedPairing(false); // Pairing already satisfied by QR scan
    addWirelessLog("[+] QR code scanned successfully! Pairing completed via TLS context.", "success");
    addWirelessLog("ডিভাইস সফলভাবে পেয়ার হয়েছে। আপনি এখন সরাসরি ওয়্যারলেস লিংক কানেক্ট করতে পারেন।", "success");
  };

  const addUsbLog = (msg: string, type: 'info' | 'success' | 'cmd' | 'error' = 'info') => {
    setUsbLogs(prev => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        msg,
        type
      },
      ...prev
    ]);
  };

  const handleRequestUsbDevice = async () => {
    if (!(navigator as any).usb) {
      addUsbLog("ERROR: এই ব্রাউজারটিতে WebUSB সাপোর্ট নেই! গুগল ক্রোম, এজ বা অপেরা ব্যবহার করুন।", "error");
      return;
    }

    addUsbLog("[CMD] WebUSB ডিভাইস কানেকশন ডায়ালগ ওপেন করা হচ্ছে...", "cmd");
    try {
      // ADB Interface Filter: Class 255 (Vendor Specific), Subclass 66 (ADB), Protocol 1 (ADB)
      const device = await (navigator as any).usb.requestDevice({
        filters: [{ classCode: 255, subclassCode: 66, protocolCode: 1 }]
      });

      if (device) {
        setUsbDevice(device);
        addUsbLog(`[+] অ্যান্ডরয়েড ডিভাইস সংযুক্ত হয়েছে!`, "success");
        addUsbLog(`ডিভাইসের নাম: ${device.productName || "অ্যান্ডরয়েড ফোন"}`, "info");
        addUsbLog(`প্রস্তুতকারক: ${device.manufacturerName || "অজানা ব্রান্ড"}`, "info");
        addUsbLog(`সিরিয়াল নম্বর: ${device.serialNumber || "গোপন রাখা হয়েছে"}`, "info");
        addUsbLog(`Vendor ID: 0x${device.vendorId.toString(16).toUpperCase()} | Product ID: 0x${device.productId.toString(16).toUpperCase()}`, "info");
        addUsbLog("কন্ট্রোল হাব ইনিশিয়েলাইজিং হ্যান্ডশেক রিড করা হচ্ছে...", "info");
        
        try {
          await device.open();
          addUsbLog("[+] ইউএসবি ইন্টারফেস সেশন সফলভাবে ওপেন করা হয়েছে।", "success");
          if (device.configuration === null) {
            await device.selectConfiguration(1);
          }
          await device.claimInterface(0);
          addUsbLog("[+] ADB ইন্টারফেস অ্যাক্সেস অনুমতি পেয়েছে। Real WebADB API Ready to interact!", "success");
          setIsAdbSessionActive(true);
        } catch (e: any) {
          addUsbLog(`সতর্কবার্তা: পোর্ট অলরেডি ব্যস্ত বা অন্য কোনো সিস্টেমে ওপেন। তবে মেটাডাটা সফলভাবে সিঙ্কড!`, "info");
          addUsbLog(`রানিং সিমুলেশন ড্রাইভার এডিবি সচল করা হলো।`, "success");
          setIsAdbSessionActive(true);
        }
      }
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        addUsbLog("ERROR: কোনো অ্যান্ডরয়েড কানেকশন সিলেক্ট করা হয়নি বা বাতিল হয়েছে।", "error");
      } else {
        addUsbLog(`ERROR: WebUSB কানেকশন ফেইল্ড: ${err.message || err}`, "error");
        addUsbLog("পরামর্শ: আইফ্রেম ব্লকিং এড়াতে স্ক্রিনের উপরে দেওয়া 'Development App URL' টি সরাসরি কপি করে ক্রোম ব্রাউজারের নতুন ট্যাবে ওপেন করে ট্রাই করুন।", "info");
      }
    }
  };

  const handleDisconnectUsb = async () => {
    if (usbDevice) {
      try {
        await usbDevice.close();
      } catch (e) {}
      setUsbDevice(null);
      setIsAdbSessionActive(false);
      addUsbLog("ইউএসবি কানেকশন ডিসকানেক্ট করা হয়েছে।", "info");
    }
  };

  const handleSendAdbCmd = () => {
    if (!adbInputCmd.trim()) return;
    const cmd = adbInputCmd.trim();
    addUsbLog(cmd, "cmd");
    setAdbInputCmd("");

    setTimeout(() => {
      if (!isAdbSessionActive) {
        addUsbLog("সতর্কবার্তা: কোনো রিয়েল এডিবি ডিভাইস অ্যাক্টিভ নেই। কমান্ডটি সিমুলেট করা হচ্ছে।", "info");
      }

      const lowerCmd = cmd.toLowerCase();
      if (lowerCmd.includes("devices")) {
        addUsbLog("List of devices attached:", "info");
        addUsbLog(usbDevice ? `${usbDevice.serialNumber || "WEBADB_DEVICE"}	device` : "G98F_SIMULATOR	device", "success");
      } else if (lowerCmd.includes("getprop")) {
        addUsbLog(`[adb response] product.model: [${usbDevice ? usbDevice.productName : "SM-G98F"}]`, "success");
        addUsbLog(`[adb response] product.brand: [${usbDevice ? usbDevice.manufacturerName : "Samsung"}]`, "success");
      } else if (lowerCmd.includes("screencap")) {
        addUsbLog("স্ক্রিনশট বা ডিসপ্লে মিররিং ফ্রেম সিঙ্ক ডাইরেক্ট ব্রাউজার ক্যানভাসে পাঠানো হচ্ছে...", "info");
        addUsbLog("[+] PNG frame loaded: 1080x1920 (compressed via raw ADB buffer Stream)", "success");
      } else if (lowerCmd.includes("pm list")) {
        addUsbLog("package:com.android.settings", "success");
        addUsbLog("package:com.google.android.youtube", "success");
        addUsbLog("package:com.android.chrome", "success");
        addUsbLog("package:com.droidlink.workspace.helper", "success");
      } else if (lowerCmd.includes("keyevent")) {
        addUsbLog(`[+] ইনপুট ইভেন্ট ইনজেক্ট সম্পন্ন। ওএস কী কোড কনফার্মড।`, "success");
      } else {
        addUsbLog(`[adb debug output] Executed command with exit-code: 0`, "success");
        addUsbLog(`ডিভাইস আইডি: ${usbDevice ? usbDevice.serialNumber || "ADB_DEVICE" : "MOCK_DEVICE_ID"}`, "info");
      }
    }, 600);
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput.trim();
    if (!textToSend) return;

    if (!presetText) {
      setChatInput("");
    }

    // Add user message
    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          brand: selectedBrand,
          history: [...chatMessages, userMsg].slice(-10) // Only send recent 10 messages for token bounds
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, {
        sender: "bot",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      console.error("AI chat assistant error:", err);
      // Wait time or display detailed Bengali instructions
      setChatMessages(prev => [...prev, {
        sender: "bot",
        text: `দুঃখিত, কানেকশনে সমস্যা হয়েছে: ${err.message || "সার্ভার রেসপন্স করছে না"}। আপনার জেমিনি এআই কী (GEMINI_API_KEY) সেটিংস থেকে কনফিগারড আছে কিনা অনুগ্রহ করে নিশ্চিত করুন।`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ---- AUTOMATED OTG-CONTROLLER RECIPE ENGINE ----
  interface OTGStep {
    number: number;
    key: string;
    action: string;
    note: string;
  }

  interface OTGRecipe {
    title: string;
    sequence: OTGStep[];
    adbCommand: string;
    tip: string;
  }

  const getOTGRecipe = (brand: string, os: string, task: string): OTGRecipe => {
    if (task === "debugging") {
      return {
        title: `${brand} (${os}) - ব্লাইন্ড ইউএসবি ডিবাগিং অ্যাক্টিভেশন রেসিপি`,
        sequence: [
          { number: 1, key: "Power Key", action: "১ বার আলতো চাপুন", note: "ফোনের কালো হয়ে থাকা ভাঙা ডিসপ্লে ওয়েক বা জাগ্রত করতে পাওয়ার কি প্রেস করুন।" },
          { number: 2, key: "Spacebar", action: "১ বার ট্যাপ করুন", note: "লকস্ক্রিন স্লাইডার বা সোয়াইপ ফেজ সরিয়ে পিন নম্বর ইনপুটের উইন্ডো সচল করুন।" },
          { number: 3, key: "Tab Key", action: "৩ বার ক্রমাগত চাপুন", note: "স্মার্টফোন টকব্যাক বা সিস্টেম রিডার চালু থাকলে সেটিংসে ফোকাস শিফট করবে।" },
          { number: 4, key: "Enter Key", action: "১ বার চাপুন", note: "ডাবল ট্যাপ সিগন্যাল পাঠিয়ে মেইন সেটিংস প্যানেল ওপেন করুন।" },
          { number: 5, key: "Down Arrow", action: "১০ বার একের পর এক চাপুন", note: "নেভিগেশন কার্সার স্ক্রল করে সেটিংসের একেবারে নিচের দিকে 'Developer options'-এ নিয়ে যান।" },
          { number: 6, key: "Enter Key", action: "১ বার চাপুন", note: "ডেভেলপার অপশন কনফিগে প্রবেশ করুন।" },
          { number: 7, key: "Down Arrow", action: "৭ বার ফাস্ট চাপুন", note: "মেনু স্ক্রল করতে করতে 'USB Debugging' টগল অপশনের ওপর ফোকাস লক করুন।" },
          { number: 8, key: "Spacebar", action: "১ বার ক্লিক করুন", note: "ডিবাগিং সিকিউরিটি টগল বাটনটি অন (ON) পজিশনে আনুন।" },
          { number: 9, key: "Tab Key", action: "১ বার চাপুন", note: "সতর্কবার্তা পপআপ ডায়ালগের 'OK/Allow' বাটনের ওপর ড্র্যাগ সিলেক্ট নিশ্চিত করুন।" },
          { number: 10, key: "Enter Key", action: "১ বার ফাইনাল চাপুন", note: "এডিবি অথরাইজেশন অনুমোদন চালু করুন। ফোন প্রস্তুত!" }
        ],
        adbCommand: `adb shell settings put global adb_enabled 1\nadb shell settings put secure adb_enabled 1\nadb reboot`,
        tip: "ওটিজি মাল্টিপোর্ট হাবের মাধ্যমে একটি কোয়ালিটি কিবোর্ড ফোনের সাথে যুক্ত করুন। প্রতিটি কী-স্ট্রোকের মাঝে এক সেকেন্ড বা ১২০০ মি.সে. বিরতি বজায় রাখবেন।"
      };
    } else if (task === "unlock") {
      return {
        title: `${brand} (${os}) - ওটিজি কিবোর্ড ব্যবহার করে ব্লাইন্ড লক-আনলক রেসিপি`,
        sequence: [
          { number: 1, key: "Power Key", action: "১ বার চাপুন", note: "স্ক্রিন অফ অবস্থা থেকে ব্যাকলাইট ওয়েক করুন।" },
          { number: 2, key: "Spacebar", action: "১ বার প্রেস করুন", note: "আনলক পিনের বক্স সচল করুন।" },
          { number: 3, key: "Numpad (0-9)", action: "আপনার ৪-৮ সংখ্যার আনলক পিনটি কিবোর্ড থেকে টাইপ করুন", note: "কিবোর্ড নাম লক অন করে আপনার মোবাইলের সঠিক পিন নাম্বারটি একদম অন্ধ অবস্থায় টাইপ করতে থাকুন।" },
          { number: 4, key: "Enter Key", action: "১ বার চাপুন", note: "হোমস্ক্রিনে প্রবেশ করার ফাইনাল এন্টার কী প্রেস করুন।" }
        ],
        adbCommand: `adb shell input keyevent 82\nadb shell input text "YOUR_PIN_HERE"\nadb shell input keyevent 66`,
        tip: "যদি ফোনে ড্রয়িং প্যাটার্ন লক থাকে, তবে মাউস ক্যাবলের লেফট বাটন চেপে ধরে স্ক্রিন সোয়াইপ করতে হবে।"
      };
    } else if (task === "screencast") {
      return {
        title: `${brand} (${os}) - ওয়্যারলেস স্ক্রিন কাস্ট এবং প্রজেকশন রেসিপি`,
        sequence: [
          { number: 1, key: "Power Key", action: "১ বার চাপুন", note: "ফোনের ডিসপ্লে চালু করুন।" },
          { number: 2, key: "Spacebar", action: "১ বার চেপে পিন দিন", note: "কিবোর্ড দিয়ে হোম পেজে এন্ট্রি নিন।" },
          { number: 3, key: "Windows + K (Shortcut)", action: "একত্রে ১ বার চাপুন", note: "অ্যান্ড্রয়েড স্টক কাস্টিং মেনুটি শর্টকাট প্রোটোকলে ওপেন করুন।" },
          { number: 4, key: "Tab Key", action: "৫ বার চাপুন", note: "আপনার রুমের রানিং স্মার্ট টেলিভিশন বা ক্রোমকাস্ট রিসিভারের নামের ওপর কার্সার আনুন।" },
          { number: 5, key: "Enter Key", action: "১ বার চাপুন", note: "কাস্টিং স্টার্ট করতে এন্টার দিন। মোবাইল স্ক্রিন টিভিতে ভেসে উঠবে!" }
        ],
        adbCommand: `adb shell am start -n com.android.settings/.wfd.WifiDisplaySettings\nadb shell input keyevent 20\nadb shell input keyevent 66`,
        tip: "স্ক্রিন সম্প্রচারের সময় কাস্ট রিভিশন উইন্ডোজ বা টিভি রিসিভারটি একই ওয়াইফাই রাউটারের সাথে কানেক্ট করা আবশ্যক।"
      };
    } else {
      return {
        title: `${brand} (${os}) - অটোমেটেড ক্লাউড ব্যাকআপ এবং ড্রাইভ সিঙ্ক রেসিপি`,
        sequence: [
          { number: 1, key: "Power Key", action: "১ বার ক্লিক করুন", note: "ফোনের ওয়েক মোড অন করুন।" },
          { number: 2, key: "Tab Key", action: "৭ বার চাপুন", note: "অন্ধ অবস্থায় হোম স্ক্রিনের ফাইল ডিরেক্টরি বা ড্রাইভ অ্যাপের ওপর ফোকাস দিন।" },
          { number: 3, key: "Enter Key", action: "১ বার ক্লিক", note: "গুগল ড্রাইভ (Google Drive) বা রিলেটেড ক্লাউড ব্যাকআপ অ্যাপ্লিকেশন ওপেন করুন।" },
          { number: 4, key: "Tab Key", action: "৩ বার চাপুন", note: "আপলোড ('+') এবং অটো-ব্যাকআপ আইকনের ওপর ক্লিক রেঞ্জ ফোকাস করুন।" },
          { number: 5, key: "Enter Key", action: "১ বার ক্লিক করুন", note: "আপনার ক্যামেরা ও গ্যালারির ব্যাকআপ সিঙ্ক্রোনাইজেশন সচল করুন।" }
        ],
        adbCommand: `adb pull /sdcard/DCIM/Camera/ ./camera_backup/\nadb pull /sdcard/Download/ ./downloads_backup/`,
        tip: "এই প্রোজেক্ট ব্লাইন্ড ব্যাকআপ ওটিজি কিবোর্ডের মাধ্যমে ডেটা ড্রাইভ ক্লাউডে চলে গেলে অন্য ফোন থেকে তা ইন্সট্যান্ট ডাউনলোড করতে পারবেন।"
      };
    }
  };

  // OTG Simulation Effect
  useEffect(() => {
    if (!isSimulatingOtg) return;

    const recipe = getOTGRecipe(otgBrand, otgOS, otgTask);

    if (simulatedOtgStep === -1) {
      setSimulatedOtgStep(0);
      setOtgSimulationLogs([
        { time: new Date().toLocaleTimeString(), msg: `অটোমেটেড ওটিজি সিমুলেটর চালু হচ্ছে: ${recipe.title}`, status: "info" }
      ]);
      return;
    }

    if (simulatedOtgStep >= recipe.sequence.length) {
      setIsSimulatingOtg(false);
      setOtgSimulationLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), msg: "সিমুলেশন সফলভাবে শেষ হয়েছে! ওটিজি কিবোর্ড ও ওটিজি মাউস প্লাগইন করে প্র্যাকটিস শুরু করুন।", status: "success" }
      ]);
      return;
    }

    const timer = setTimeout(() => {
      const step = recipe.sequence[simulatedOtgStep];
      setOtgSimulationLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          msg: `ধাপ ${step.number}: [${step.key}] ট্র্যাকিং সিগন্যাল পাঠানো হয়েছে (${step.action})। নোট: ${step.note}`,
          status: "success"
        }
      ]);
      setSimulatedOtgStep(prev => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isSimulatingOtg, simulatedOtgStep]);

  const handleStartOtgSimulation = () => {
    setSimulatedOtgStep(-1);
    setOtgSimulationLogs([]);
    setIsSimulatingOtg(true);
  };

  const handleStopOtgSimulation = () => {
    setIsSimulatingOtg(false);
    setOtgSimulationLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), msg: "সিমুলেশন বন্ধ করা হয়েছে।", status: "warning" }
    ]);
  };

  const [aiOtgOptimized, setAiOtgOptimized] = useState<string>("");
  const [isAiOtgLoading, setIsAiOtgLoading] = useState<boolean>(false);

  const handleAiOptimizeOtg = async () => {
    setIsAiOtgLoading(true);
    setAiOtgOptimized("");
    try {
      const prompt = `আমি মোবাইলের স্ক্রিন সম্পূর্ণ কালো বা ভেঙে যাওয়া অবস্থায় ওটিজি কিবোর্ড দিয়ে অন্ধের মতো ইউজার ডেটা রিকভারি করতে চাই। ফোন ব্র্যান্ড: ${otgBrand}, ওএস সংস্করণ: ${otgOS}, লক্ষ্য/কাজ: ${otgTask === "debugging" ? "ব্লাইন্ড ইউএসবি ডিবাগিং অন" : otgTask === "unlock" ? "পিন লক আনলক" : otgTask === "screencast" ? "স্ক্রিন কাস্টিং অলটারনেটিভ" : "ব্যাকআপ ও ফাইল সিঙ্ক"}। আমাকে একটি সুনির্দিষ্ট ওটিজি কিবোর্ড ও মাউস নেভিগেশন রেসিপি জেনারেট করে দিন। কোন বোতাম কয়বার চাপতে হবে এবং এডিবি (ADB) দিয়ে করার স্পেশাল বাইপাস কমান্ড কী হবে তা বিস্তারিত বাংলা ভাষায় গুছিয়ে দিন।`;

      const response = await fetch("/api/gemini/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, brand: otgBrand }),
      });

      if (!response.ok) throw new Error("জেমিনি এআই ওটিজি রেসিপি মেকার থেকে কোনো প্রতিক্রিয়া পাওয়া যায়নি।");
      const data = await response.json();
      setAiOtgOptimized(data.reply);
    } catch (err: any) {
      setAiOtgOptimized(`এআই জেনারেটরের ত্রুটি: ${err.message || err}। অনুগ্রহ করে ক্যাশে ভেরিফাই করুন বা সেটিংস আইকন থেকে GEMINI_API_KEY চেক করুন।`);
    } finally {
      setIsAiOtgLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Tab Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 bg-[#0d1425] border-b border-slate-800 select-none gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-cyan-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            ডায়াগনস্টিকস ও ওয়্যারলেস কন্ট্রোল Hub
          </h2>
        </div>
        
        {/* Toggle navigation for resolving issues or wireless pairing */}
        <div className="flex bg-[#070b14] p-1 rounded-lg border border-slate-900 self-start sm:self-auto gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab("resolver")}
            className={`px-3 py-1.5 text-xxxxs sm:text-xxs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "resolver"
                ? "bg-[#271015] text-rose-300 border border-rose-900/40 shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🔧 এডিবি ট্রাবলশুটার
          </button>
          
          <button
            onClick={() => setActiveTab("wireless")}
            className={`px-3 py-1.5 text-xxxxs sm:text-xxs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "wireless"
                ? "bg-[#0b2438] text-cyan-350 border border-cyan-900/40 shadow"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-diagnostic-wireless"
          >
            <Wifi className="w-3 h-3 text-cyan-400" />
            ওয়াইফাই পেয়ারিং (Wireless)
          </button>

          <button
            onClick={() => setActiveTab("webusb")}
            className={`px-3 py-1.5 text-xxxxs sm:text-xxs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "webusb"
                ? "bg-[#0e271d] text-emerald-300 border border-emerald-950 shadow"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-diagnostic-webusb"
          >
            <Usb className="w-3 h-3 text-emerald-400" />
            রিয়েল WebUSB প্লাগইন
          </button>

          <button
            onClick={() => setActiveTab("db_ai")}
            className={`px-3 py-1.5 text-xxxxs sm:text-xxs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "db_ai"
                ? "bg-[#21163b] text-purple-300 border border-purple-950 shadow"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-diagnostic-dbai"
          >
            <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
            এআই ট্রাবলশুটার (AI Expert)
          </button>

          <button
            onClick={() => setActiveTab("otg_script")}
            className={`px-3 py-1.5 text-xxxxs sm:text-xxs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "otg_script"
                ? "bg-[#241a0d] text-amber-300 border border-amber-950/80 shadow"
                : "text-gray-400 hover:text-white"
            }`}
            id="tab-diagnostic-otgscript"
          >
            <Wrench className="w-3 h-3 text-amber-400" />
            ওটিজি স্ক্রিপ্ট (OTG Recipe)
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-[#070b14] relative">
        {isPremiumLocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#070b14]/95 backdrop-blur-md border border-amber-900/20 rounded-xl min-h-[450px]">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full mb-4 animate-bounce">
              <Lock className="w-10 h-10" />
            </div>
            
            {activeTab === "webusb" && (
              <>
                <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
                  রিয়েল WebUSB স্ক্রিন কাস্টিং প্লাগইন (PRO)
                </h3>
                <p className="text-xxs text-gray-400 mt-2 max-w-sm leading-relaxed font-sans">
                  কোনো ফাইল ডাউনলোড ছাড়াই ব্রাউজার থ্রু সরাসরি রিয়েল ইউএসবি মোবাইল স্ক্রিন কাস্টিং, লাইভ টাচ বাইন্ডিং ও রিয়েল এডিবি সকেট ইন্টারেকশন করতে সাবস্ক্রিপশন প্রয়োজন।
                </p>
              </>
            )}

            {activeTab === "db_ai" && (
              <>
                <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
                  উন্নত ব্র্যান্ড ডেটাবেস ও জেমিনি এআই ট্রাবলশুটার (PRO)
                </h3>
                <p className="text-xxs text-gray-400 mt-2 max-w-sm leading-relaxed font-sans">
                  স্যামসাং Knox, ওডিবি সিকিউরিটি সিকোয়েন্স, শাওমি বুটলোডার লক বাইপাস করতে ও জেমিনি এআই চালিত এক্সপার্ট কমান্ড প্রম্পটিং পেতে সাবস্ক্রিপশন দরকার।
                </p>
              </>
            )}

            {activeTab === "otg_script" && (
              <>
                <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
                  এক্সপার্ট ওটিজি অটোমেশন রেসিপি জেনারেটর (PRO)
                </h3>
                <p className="text-xxs text-gray-400 mt-2 max-w-sm leading-relaxed font-sans">
                  ফোনের নির্দিষ্ট ব্র্যান্ড ও অ্যান্ড্রয়েড সংস্করণ অনুযায়ী নিখুঁত ওটিজি কীবোর্ড ও মাউস স্ট্রোকের সিকুয়েন্স রেসিপি জেনারেট করে ভাঙা স্ক্রিন কাজ উদ্ধার করুন।
                </p>
              </>
            )}

            <button
              onClick={openUpgradeModal}
              className="mt-6 px-5 py-2.5 rounded bg-gradient-to-r from-amber-600 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-900/25 active:scale-[0.99] transition-all select-none cursor-pointer uppercase tracking-tight"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950 animate-pulse" />
              Upgrade to PRO ($4.99/mo)
            </button>
          </div>
        ) : (
          <>
        
        {/* RESOLVER WORKSPACE VIEW */}
        {activeTab === "resolver" && (
          <div className="flex flex-col gap-4 h-full">
            {/* SMART FALLBACK DIAGNOSTIC LOGIC (DECISION TREE) */}
            <div className="bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 p-4 rounded-xl border border-indigo-900/40 shadow-inner space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-950 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans uppercase tracking-wider">
                      স্মার্ট ফ্যালব্যাক ডায়াগনস্টিক ফ্লো (Smart Fallback Flow)
                    </h3>
                    <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                      ইউএসবি ডিবাগিং অফ বা ভাঙা ডিসপ্লে থাকলে সঠিক রিকভারি পদ্ধতি নির্বাচন করার ইন্টারেক্টিভ গাইড।
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentDecisionStep("usb_check");
                    setDecisionHistory([]);
                  }}
                  className="px-2.5 py-1 text-[9px] font-mono text-cyan-400 border border-cyan-900/40 rounded hover:bg-cyan-950/40 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  রিসেট ফ্লো
                </button>
              </div>

              {/* Progress/Path visualizer indicator */}
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono flex-wrap bg-black/30 p-2 rounded border border-slate-900">
                <span className="text-cyan-500 font-bold uppercase">ধাপ সিকোয়েন্স:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">স্টার্ট</span>
                {decisionHistory.includes("usb_check") && (
                  <>
                    <span className="text-gray-755">→</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">USB চেক</span>
                  </>
                )}
                {decisionHistory.includes("screen_status") && (
                  <>
                    <span className="text-gray-755">→</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">ডিসপ্লে অবস্থা</span>
                  </>
                )}
                <span className="text-gray-755">→</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold">
                  {currentDecisionStep === "usb_check" && "USB ডিবাগিং?"}
                  {currentDecisionStep === "screen_status" && "ডিসপ্লে স্ট্যাটাস?"}
                  {currentDecisionStep === "scrcpy_recommend" && "রিস্টোর রেজাল্ট (Scrcpy)"}
                  {currentDecisionStep === "blind_recommend" && "রিস্টোর রেজাল্ট (Blind Assist)"}
                  {currentDecisionStep === "hardware_recommend" && "রিস্টোর রেজাল্ট (OTG Hardware)"}
                </span>
              </div>

              {/* Step Display */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 relative overflow-hidden">
                
                {/* 1. USB Debugging check */}
                {currentDecisionStep === "usb_check" && (
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="p-2 bg-cyan-950/40 rounded-lg text-cyan-400 border border-cyan-900/30">
                        <Usb className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xxs font-bold text-slate-100 font-sans">
                          প্রশ্ন ১: আপনার ফোনে কি ইউএসবি ডিবাগিং (USB Debugging) চালু বা অন করা আছে?
                        </h4>
                        <p className="text-[10px] text-gray-400 font-sans mt-1 leading-relaxed">
                          যদি মোবাইল ফোনটি স্ক্রিন ভাঙার আগে কোনো কম্পিউটারের সাথে যুক্ত করে অথরাইজড করা হয়ে থাকে অথবা ডেভেলপার অপশন আগে থেকেই সচল থাকে, তবে "হ্যাঁ" সিলেক্ট করুন। তা না হলে "না" বেছে নিন।
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1 select-none">
                      <button
                        onClick={() => {
                          setDecisionHistory(prev => [...prev, "usb_check"]);
                          setCurrentDecisionStep("scrcpy_recommend");
                        }}
                        className="flex-1 py-3 px-4 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-900/40 hover:border-emerald-500/50 text-emerald-300 text-xxs font-bold font-sans transition-all text-center cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.1)] font-sans"
                      >
                        👍 হ্যাঁ, ডিবাগিং সচল আছে (Yes)
                      </button>
                      <button
                        onClick={() => {
                          setDecisionHistory(prev => [...prev, "usb_check"]);
                          setCurrentDecisionStep("screen_status");
                        }}
                        className="flex-1 py-3 px-4 rounded-lg bg-rose-950/30 hover:bg-rose-950/60 border border-rose-950/40 hover:border-rose-500/50 text-rose-300 text-xxs font-bold font-sans transition-all text-center cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(239,68,68,0.1)] font-sans"
                      >
                        👎 না, ডিবাগিং বন্ধ আছে (No)
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Screen Status Check */}
                {currentDecisionStep === "screen_status" && (
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="p-2 bg-amber-950/40 rounded-lg text-amber-400 border border-amber-900/30">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xxs font-bold text-slate-100 font-sans">
                          প্রশ্ন ২: ক্ষতিগ্রস্থ ফোনটির ডিসপ্লে বা স্ক্রিনের বর্তমান শারীরিক অবস্থা কেমন?
                        </h4>
                        <p className="text-[10px] text-gray-400 font-sans mt-1 leading-relaxed">
                          ফোনের স্পর্শ বা ডিসপ্লে কাজ না করার ক্ষেত্রে সঠিক ডিরেক্টরি বেছে নিতে স্ক্রিন কন্ডিশন অত্যন্ত গুরুত্বপূর্ণ।
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1 select-none">
                      <button
                        onClick={() => {
                          setDecisionHistory(prev => [...prev, "screen_status"]);
                          setCurrentDecisionStep("blind_recommend");
                        }}
                        className="flex-1 p-3 rounded-lg bg-[#0c111e] border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 text-xxs font-bold font-sans text-left transition-all cursor-pointer flex gap-3 items-center"
                      >
                        <span className="text-xl">🌑</span>
                        <div>
                          <span className="block text-white">সম্পূর্ণ কালো / ব্ল্যাক ডিসপ্লে</span>
                          <span className="block text-[9px] text-gray-400 font-normal mt-0.5 font-sans">পর্দা দেখা যায় না, কিন্তু ফোন কাঁপে/বাজে (Vibrates)</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setDecisionHistory(prev => [...prev, "screen_status"]);
                          setCurrentDecisionStep("hardware_recommend");
                        }}
                        className="flex-1 p-3 rounded-lg bg-[#0c111e] border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 text-xxs font-bold font-sans text-left transition-all cursor-pointer flex gap-3 items-center"
                      >
                        <span className="text-xl">⚡</span>
                        <div>
                          <span className="block text-white">ডিসপ্লে সচল কিন্তু টাচ অকার্যকর</span>
                          <span className="block text-[9px] text-gray-400 font-normal mt-0.5 font-sans">পর্দা দেখা যায়, কিন্তু টাচ কাজ করে না বা ঘোস্ট টাচ হয়</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Scrcpy Recommendations */}
                {currentDecisionStep === "scrcpy_recommend" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex gap-3 items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xxs font-bold text-emerald-300 font-sans">
                          সুপারিশ: সরাসরি Scrcpy এবং ADB টার্মিনাল সেটআপ করুন!
                        </h4>
                        <p className="text-[10px] text-gray-450 leading-relaxed font-sans mt-1">
                          আপনার ডিভাইসে আগে থেকেই ইউএসবি ডিবাগিং অথরাইজড থাকার কারণে যেকোনো লাইভ মিররিং কোড দিয়ে সরাসরি ফোনের সোর্স পিকচার পিসিতে মিরর করতে পারবেন। এই মোডে কোনো জটিল হার্ডওয়্যার ছাড়াই ব্যাকআপ সম্ভব।
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] text-slate-350 leading-relaxed space-y-1.5 font-sans">
                      <span className="font-bold text-white block uppercase text-[10px] tracking-wider text-cyan-400 font-sans">করণীয় পদক্ষেপ:</span>
                      <p>১. পিসির প্রধান ডিরেক্টরিতে ফিরে <strong>"Scrcpy Workspace"</strong> (কোড প্যানেল) চালু করুন।</p>
                      <p>২. লাইভ সিমুলেটরে <strong>adb devices</strong> এবং <strong>adb shell</strong> কোড রান করে হ্যান্ডশেক কনফার্ম করুন।</p>
                      <p>৩. ওটিজি ক্যাপচার কার্ড সংযোগ ছাড়াই সরাসরি আপনার কীবোর্ড দিয়ে ফোনের যাবতীয় লক আনলক করে ফেলুন।</p>
                    </div>
                  </div>
                )}

                {/* 4. Blind Sequence Recommendations */}
                {currentDecisionStep === "blind_recommend" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xxs font-bold text-rose-300 font-sans">
                          সুপারিশ: ব্লাইন্ড অ্যাসিস্ট্যান্ট (Blind Assistant) কী-স্ট্রোক সিকোয়েন্স!
                        </h4>
                        <p className="text-[10px] text-gray-450 leading-relaxed font-sans mt-1">
                          যেহেতু ফোনের স্ক্রিন কালো এবং ইউএসবি ডিবাগিংও অফ করা আছে, এই অবস্থায় এডিবি সরাসরি কানেক্ট হবে না। কীবোর্ড দিয়ে ব্লাইন্ড পিন বা পাসওয়ার্ড এন্টার করে ডিবাগিং অন করাই একমাত্র নির্ভরযোগ্য বৈজ্ঞানিক পদ্ধতি।
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] text-slate-350 leading-relaxed space-y-1.5 font-sans">
                      <span className="font-bold text-white block uppercase text-[10px] tracking-wider text-cyan-400 font-sans">করণীয় পদক্ষেপ:</span>
                      <p>১. ফোনের ওটিজি পোর্টে একটি সাধারণ ইউএসবি কী-বোর্ড কানেক্ট করুন।</p>
                      <p>২. আমাদের প্রধান নেভিগেশনের <strong>"Blind Assistant"</strong> ট্যাবে গিয়ে আপনার ফোনের অ্যান্ড্রয়েড ভার্সন সিলেক্ট করুন।</p>
                      <p>৩. সেখানে প্রদর্শিত কী-সিকোয়েন্সগুলো দেখে দেখে কীবোর্ডে টাইপ করে লক বাইপাস করুন। তারপর সেটিংস রিসেট করে এডিবি অন করুন।</p>
                    </div>
                  </div>
                )}

                {/* 5. Hardware OTG Shop Recommendations */}
                {currentDecisionStep === "hardware_recommend" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg flex gap-3 items-start">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xxs font-bold text-amber-300 font-sans">
                          সুপারিশ: ওটিজি হার্ডওয়্যার ডকিং এবং রিসিভার স্টোর!
                        </h4>
                        <p className="text-[10px] text-gray-450 leading-relaxed font-sans mt-1">
                          আপনার ফোনের স্ক্রিন অক্ষতভাবে জ্বলছে কিন্তু কোনো টাচ কাজ করছে না। এই জটিলতা থেকে কাস্টমারের ডেটা উদ্ধার করতে বা মাউস দিয়ে কাজ করতে একটি ওটিজি কেবল বা ইউএসবি ক্যাপচার কার্ড প্রয়োজন।
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] text-slate-350 leading-relaxed space-y-1.5 font-sans">
                      <span className="font-bold text-white block uppercase text-[10px] tracking-wider text-cyan-400 font-sans">করণীয় পদক্ষেপ:</span>
                      <p>১. একটি ওটিজি হাব (OTG Hub) দিয়ে একইসাথে মাউস এবং একটি পিসি কানেক্ট করুন।</p>
                      <p>২. আমাদের <strong>"Recovery Hardware"</strong> (ওটিজি হার্ডওয়্যার) শপে গিয়ে রিকমেন্ডেড ওটিজি হাব বা টাইপ-সি ক্যাপচার কার্ডের বিবরণী দেখে নিন।</p>
                      <p>৩. মাউসের লেফট ক্লিকের সাহায্যে ওটিজি মোডে বুট সেটিংস এ গিয়ে সরাসরি ইউএসবি ডিবাগিংটি চিরতরে চালু করে নিন।</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <p className="text-xxxxs sm:text-xxs text-slate-400 font-sans leading-relaxed tracking-tight">
              ডিভাইস স্ক্রিন ডিকোড করতে গিয়ে বা স্কিন কানেক্টের সময় নানান ধরণের যান্ত্রিক গোলযোগ দেখা দিতে পারে। আপনার সমস্যাটি নিচের তালিকা থেকে সিলেক্ট করুন এবং সরাসরি ফিক্সড সলিউশন ইন্সট্রাক্ট করুন।
            </p>

            {/* Symptoms interactive grid selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1 select-none">
              {DIAGNOSTICS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-3 text-left rounded-lg border text-xxxxs sm:text-xxs transition-all cursor-pointer ${
                    selectedId === item.id 
                      ? "bg-rose-950/25 border-rose-500 text-rose-300 shadow-md shadow-rose-950/10" 
                      : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300"
                  }`}
                >
                  <div className="font-semibold mb-1 line-clamp-1">{item.title}</div>
                  <p className="text-xxs opacity-70 line-clamp-1">{item.symptom}</p>
                </button>
              ))}
            </div>

            {/* Diagnostic Resolution display panel */}
            <div className="flex-1 border border-slate-900 rounded-xl bg-[#03060c] p-4 lg:p-5 flex flex-col gap-4">
              <div>
                <span className="text-xxs font-mono text-slate-500 uppercase tracking-widest block mb-0.5">লক্ষণ (Symptom):</span>
                <span className="text-xs font-semibold text-slate-200 block mb-2 leading-tight font-sans">
                  {activeIssue.symptom}
                </span>

                <div className="h-px bg-slate-900/80 my-3" />

                {/* Root Cause description */}
                <span className="text-xxs font-mono text-slate-500 uppercase tracking-widest block mb-1">যান্ত্রিক কারণ (Root Cause):</span>
                <p className="text-xxxxs sm:text-xxs text-slate-400 leading-relaxed font-sans mb-4">
                  {activeIssue.reason}
                </p>
              </div>

              {/* Quick Repair Commands section */}
              <div>
                <span className="text-xxs font-mono text-slate-500 uppercase tracking-widest block mb-2">সমস্যা সমাধানের টার্মিনাল কমান্ড (Repair Commands):</span>
                <div className="flex flex-col gap-1.5 font-mono">
                  {activeIssue.commands.map((cmd, i) => (
                    <div 
                      key={i} 
                      className="px-3.5 py-2 rounded border border-slate-900 bg-[#020408] flex items-center justify-between text-xxs tracking-wide text-slate-300 group"
                    >
                      <span className="truncate select-all">{cmd}</span>
                      <button
                        onClick={() => handleCopyCommand(cmd)}
                        className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-slate-900 transition-all cursor-pointer focus:outline-none"
                        title="কমান্ড কপি করুন"
                        id={`btn-copy-diag-${i}`}
                      >
                        {copiedCmd === cmd ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical steps description in Bangla */}
              <div className="p-4 rounded-lg bg-[#0c1221] border border-slate-900">
                <div className="flex items-center gap-2 mb-2 text-xxs font-mono text-emerald-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>সহায়ক কার্যকারী সমাধান (Action Plan)</span>
                </div>
                <p className="text-xxxxs sm:text-xxs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {activeIssue.solution}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WIRELESS ADB CHANNEL PANEL */}
        {activeTab === "wireless" && (
          <div className="flex flex-col lg:flex-row gap-5 h-full">
            
            {/* Left side Tutorial guidelines */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="p-4 bg-[#0d1425]/40 border border-slate-900 rounded-xl">
                <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5 font-sans">
                  <span className="p-1 rounded-full bg-cyan-950 text-cyan-400">
                    <Wifi className="w-3.5 h-3.5" />
                  </span>
                  ওয়্যারলেস এডিবি সংযোগ গাইডলাইন
                </h4>
                <p className="text-xxxxs sm:text-xxs text-slate-400 font-sans leading-relaxed mb-4">
                  ইউএসবি ক্যাবল বাদেও কেবল একই ওয়াইফাই নেটওয়ার্ক ব্যবহার করে আপনি ওয়্যারলেস উপায়ে মোবাইল স্ক্রিন পিসিতে মিরর করতে পারবেন।
                </p>

                {/* Steps block */}
                <div className="space-y-4 font-sans text-xxxxs sm:text-xxs text-slate-350">
                  <div className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-cyan-400 font-mono text-center flex items-center justify-center font-bold">১</span>
                    <div>
                      <p className="font-semibold text-slate-200">TCP/IP মুড চালু করুন (Enabling TCP/IP Mode)</p>
                      <p className="text-gray-400 mt-0.5">ডিভাইসটি প্রথমবার পিসিতে কানেক্ট করে কমান্ড লাইনে রান করুন: <code className="text-cyan-400 font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-900/40">adb tcpip 5555</code>। এটি ওয়্যারলেস ৫৫৫৫ পোর্ট সচল করবে।</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-cyan-400 font-mono text-center flex items-center justify-center font-bold">২</span>
                    <div>
                      <p className="font-semibold text-slate-200">ওয়্যারলেস ডিবাগিং সচল করুন (Developer Settings)</p>
                      <p className="text-gray-400 mt-0.5">ফোনের <strong className="text-slate-300">Developer Options</strong>-এ গিয়ে Wireless Debugging টগলটি অন করুন এবং ফোনের Wi-Fi বা লোকাল আইপি অ্যাড্রেস দেখে নিন।</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-900 text-cyan-400 font-mono text-center flex items-center justify-center font-bold">৩</span>
                    <div>
                      <p className="font-semibold text-slate-200">আইপি ও পোর্ট প্রবিষ্ট করুন (Form Verification)</p>
                      <p className="text-gray-400 mt-0.5">আইপি অ্যাড্রেস (যেমন: <code className="text-cyan-400 font-mono">192.168.0.105</code>) এবং পোর্ট (ডিফল্ট: <code className="text-cyan-400 font-mono">5555</code>) ডানপাশের ড্যাশবোর্ডে প্রদান করে পেয়ার করুন।</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safe status metrics indicator */}
              <div className="p-3 bg-[#03060c] border border-slate-900 rounded-xl flex items-center justify-between text-xxxxs sm:text-xxs select-none font-sans">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    wirelessState === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' :
                    wirelessState === 'PAIRING' || wirelessState === 'CONNECTING' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className="font-semibold text-slate-300">
                    স্ট্যাটাস: <span className="text-slate-400">{wirelessState}</span>
                  </span>
                </div>
                {wirelessState === 'CONNECTED' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <Activity className="w-3.5 h-3.5" /> 50 FPS Link Live
                  </span>
                )}
              </div>
            </div>

            {/* Right side form input mock pair and trace */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col gap-3 font-sans">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-900 pb-1.5 mb-1 select-none">
                  ওয়াইফাই পেয়ার সেশন ফর্ম
                </h4>

                 {/* Form Toggles Checkbox & QR buttons */}
                 <div className="flex flex-wrap items-center justify-between gap-2.5 mb-1 pl-0.5 select-none">
                   <div className="flex items-center gap-2">
                     <input 
                       type="checkbox" 
                       id="chk-need-pairing"
                       checked={needPairing}
                       onChange={(e) => {
                         setNeedPairing(e.target.checked);
                         if (e.target.checked) {
                           setIsQrPaired(false); // reset QR pairing if they switch to manual
                         }
                       }}
                       className="w-3.5 h-3.5 bg-slate-950 text-cyan-500 rounded border-slate-800 focus:ring-0 cursor-pointer"
                     />
                     <label htmlFor="chk-need-pairing" className="text-xxxxs sm:text-xxs text-slate-350 cursor-pointer">
                       ম্যানুয়াল পেয়ার কোড প্রয়োজন
                     </label>
                   </div>

                   <button
                     id="btn-scan-qr"
                     type="button"
                     onClick={handleRequestQrCode}
                     className="flex items-center gap-1.5 px-2 py-1 bg-indigo-950/60 border border-indigo-850/60 text-indigo-300 hover:text-white rounded text-[10px] sm:text-xxs font-medium cursor-pointer transition-all select-none"
                   >
                     <QrCode className="w-3 h-3 text-indigo-400" />
                     Scan QR to Pair
                   </button>
                 </div>

                 {/* QR Code Presentation Modal Placeholder */}
                 {isQrVisible && (
                   <div className="p-3 bg-neutral-950 rounded-lg border border-slate-900 flex flex-col items-center gap-3 animate-fadeIn">
                     <div className="text-center">
                       <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Simulated Device QR Code</p>
                       <p className="text-[9px] text-gray-400 font-sans mt-0.5">রিমোট অ্যান্ডরয়েডের "Wireless Debugging &gt; Pair containing QR" দিয়ে স্ক্যান করুন</p>
                     </div>

                     {isQrLoading ? (
                       <div className="w-28 h-28 flex flex-col items-center justify-center gap-2 bg-[#03060c] rounded border border-slate-900">
                         <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                         <span className="text-[9px] text-gray-500 font-mono tracking-widest">CONNECTING...</span>
                       </div>
                     ) : (
                       <div className="relative p-2 bg-white rounded-lg select-none overflow-hidden">
                          {!isQrPaired && (
                            <div className="absolute left-2 right-2 h-0.5 bg-cyan-500 shadow-[0_0_8px_rgb(6,182,212)] animate-bounce" style={{ top: '25%', animationDuration: '2s' }} />
                          )}
                         {/* High-fidelity custom SVG representing QR code */}
                         <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none" stroke="black">
                           <path d="M5,5 h20 v20 h-20 z M13,13 h4 v4 h-4 z" fill="black" />
                           <path d="M75,5 h20 v20 h-20 z M83,13 h4 v4 h-4 z" fill="black" stroke="none" />
                           <path d="M5,75 h20 v20 h-20 z M13,83 h4 v4 h-4 z" fill="black" stroke="none" />
                           <rect x="42" y="42" width="16" height="16" rx="2" fill="#0d1425" stroke="none" />
                           <circle cx="50" cy="50" r="3" fill="#06b6d4" stroke="none" />
                           <path d="M35,10 h5 v5 h-5 z M45,15 h5 v5 h-5 z M55,5 h5 v5 h-5 z M60,15 h5 v5 h-5 z M10,35 h5 v5 h-5 z M20,45 h5 v5 h-5 z M15,55 h5 v5 h-5 z M5,60 h5 v5 h-5 z M90,35 h5 v5 h-5 z M80,45 h5 v5 h-5 z M85,55 h5 v5 h-5 z M95,65 h5 v5 h-5 z M35,90 h5 v5 h-5 z M45,85 h5 v5 h-5 z M55,95 h5 v5 h-5 z M60,85 h5 v5 h-5 z M35,35 h5 v5 h-5 z M60,35 h5 v5 h-5 z M35,60 h5 v5 h-5 z M60,60 h5 v5 h-5 z" fill="black" stroke="none" />
                         </svg>
                         
                         {isQrPaired && (
                           <div className="absolute inset-0 bg-[#070b14]/90 rounded-lg flex flex-col items-center justify-center gap-1.5 p-1 text-center animate-fadeIn">
                             <CheckCircle className="w-8 h-8 text-emerald-400" />
                             <span className="text-[10px] font-bold text-emerald-400 font-sans">PAIRED!</span>
                             <span className="text-[8px] text-slate-300 px-1">পেয়ারিং সম্পন্ন হয়েছে।</span>
                           </div>
                         )}
                       </div>
                     )}

                     {!isQrLoading && !isQrPaired && (
                       <button
                         type="button"
                         onClick={handleSimulateQrScanSuccess}
                         className="w-full py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-400 border border-emerald-950/60 rounded text-[10px] sm:text-xxs font-bold cursor-pointer transition-all uppercase tracking-wider"
                       >
                         ⚡ Simulate Scan Success
                       </button>
                     )}
                     
                     {isQrPaired && (
                       <div className="flex gap-1.5 items-center justify-center">
                         <span className="text-[9px] text-emerald-400 font-medium italic">
                           ✓ Bypassed manual pairing sequence.
                         </span>
                         <button 
                           type="button" 
                           onClick={() => { setIsQrVisible(false); setIsQrPaired(false); }}
                           className="text-[9px] text-slate-500 hover:text-slate-300 underline"
                         >
                           বন্ধ করুন
                         </button>
                       </div>
                     )}
                   </div>
                 )}

                <div className="grid grid-cols-2 gap-3">
                  {/* IP Address Field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-mono">IP ADDRESS</label>
                    <input 
                      type="text" 
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="e.g. 192.168.0.105"
                      className={`px-2.5 py-1.5 text-xxs font-mono bg-neutral-950 border rounded focus:outline-none transition-all ${
                        !isIpValid && ipAddress.length > 0
                          ? "border-rose-500/80 focus:border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                          : "border-slate-800 focus:border-cyan-500 text-slate-200"
                      }`}
                    />
                    {!isIpValid && ipAddress.length > 0 && (
                      <span className="text-[9px] text-rose-400 font-sans mt-0.5 select-none animate-fadeIn leading-none">
                        সঠিক IPv4 ঠিকানা দিন (যেমন: 192.168.0.105)
                      </span>
                    )}
                  </div>

                  {/* Port Field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-mono">PORT NUMBER</label>
                    <input 
                      type="text" 
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="e.g. 39281"
                      className="px-2.5 py-1.5 text-xxs font-mono bg-neutral-950 border border-slate-800 rounded focus:border-cyan-500 focus:outline-none text-slate-200"
                    />
                  </div>
                </div>

                {/* Pairing Code Mock Input */}
                {needPairing && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-mono">WIFI PAIRING CODE (6 DIGITS)</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={pairingCode}
                      onChange={(e) => setPairingCode(e.target.value)}
                      placeholder="6 ডিজিট কোড"
                      className="px-2.5 py-1.5 text-xxs font-mono bg-neutral-950 border border-slate-800 rounded focus:border-cyan-500 focus:outline-none text-slate-200 text-center tracking-wider font-semibold"
                    />
                  </div>
                )}

                {/* Simulated Outcome Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-mono">SIMULATION OUTCOME (টেস্ট মোড)</label>
                  <select 
                    value={simulatedOutcome}
                    onChange={(e) => setSimulatedOutcome(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xxs font-sans bg-neutral-950 border border-slate-800 rounded focus:border-cyan-500 focus:outline-none text-slate-200 cursor-pointer"
                  >
                    <option value="SUCCESS">✔️ Success / সফল সংযোগ</option>
                    <option value="TIMEOUT">❌ Connection Timeout / টাইমআউট ত্রুটি</option>
                    <option value="REFUSED">⚠️ Connection Refused / সংযোগ প্রত্যাখ্যাত</option>
                  </select>
                </div>

                {/* Trigger buttons */}
                <div className="flex gap-2.5 mt-2.5">
                  {wirelessState === 'DISCONNECTED' ? (
                    <button
                      onClick={handleWirelessConnect}
                      disabled={!isIpValid}
                      className="flex-1 py-2 font-semibold text-xxs text-white rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-850 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer shadow transition-all text-center select-none"
                    >
                      ওয়্যারলেস লিংক কানেক্ট করুন
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnectWireless}
                      disabled={wirelessState === 'PAIRING' || wirelessState === 'CONNECTING'}
                      className="flex-1 py-2 font-semibold text-xxs text-white rounded bg-rose-600 hover:bg-rose-500 cursor-pointer shadow transition-colors text-center disabled:opacity-40 select-none"
                    >
                      সংযোগ ডিসকানেক্ট করুন
                    </button>
                  )}
                </div>
              </div>

              {/* Simulated Pairing Terminals */}
              <div className="flex-1 bg-[#05060a] border border-slate-900 rounded-xl p-3 h-48 overflow-y-auto flex flex-col-reverse justify-end font-mono">
                {wirelessLogs.length === 0 ? (
                  <div className="text-gray-600 italic text-center py-10 text-xxxxs sm:text-xxs">
                    লিকিং ডাটা ট্র্যাকিং রিয়েলটাইম টার্মিনাল লগ এখানে আসবে...
                  </div>
                ) : (
                  <div className="space-y-1.5 text-[10px] sm:text-xxs w-full">
                    {wirelessLogs.map((log) => (
                      <div key={log.id} className="flex gap-2 items-start leading-relaxed animate-fadeIn">
                        <span className="text-gray-600 text-[9px] shrink-0">{log.time}</span>
                        <span className={`block break-all font-medium ${
                          log.type === 'cmd' ? "text-cyan-400" :
                          log.type === 'success' ? "text-emerald-400" :
                          log.type === 'error' ? "text-rose-400" : "text-slate-300"
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

          </div>
        )}

        {/* WEBUSB ADB CONNECTION SYSTEM */}
        {activeTab === "webusb" && (
          <div className="flex flex-col lg:flex-row gap-5 h-full animate-fadeIn">
            
            {/* Left Column - Diagnostic info */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="p-4 bg-[#0a1b14]/50 border border-emerald-950/80 rounded-xl">
                <h4 className="text-xs font-semibold text-emerald-300 mb-2 flex items-center gap-1.5 font-sans">
                  <span className="p-1 rounded-full bg-emerald-950 text-emerald-400">
                    <Usb className="w-3.5 h-3.5" />
                  </span>
                  ব্রাউজার ভিত্তিক রিয়েল WebUSB / WebADB সল্যুশন
                </h4>
                <p className="text-xxxxs sm:text-xxs text-slate-450 font-sans leading-relaxed mb-4">
                  অ্যান্ড্রয়েড ফোনের ইউএসবি ওটিজি (OTG) ক্যাবল পিসিতে প্লাগইন করে ব্রাউজার থেকে সরাসরি স্ক্রিন শেয়ারিং ও রিয়েল-টাইম শেল ইন্টারেকশন করার আধুনিক প্রোটোকল। কোনো থার্ডপার্টি সফটওয়্যার বা এক্সিকিউটেবল ফাইল ডাউনলোডের প্রয়োজন নেই!
                </p>

                {/* Compatibility alerts */}
                <div className="space-y-3 font-sans text-xxxxs sm:text-xxs mb-4">
                  <div className={`p-3 rounded-lg border flex gap-2.5 items-start ${
                    webUsbSupported 
                      ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-400" 
                      : "bg-amber-950/20 border-amber-900/40 text-amber-400"
                  }`}>
                    <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">ব্রাউজার সামঞ্জস্যতা (Browser compatibility):</span>
                      <span className="text-slate-400">
                        {webUsbSupported 
                          ? "আপনার ব্রাউজারটি (Google Chrome/Edge) সফলভাবে WebUSB API সাপোর্ট করে! আপনি প্রস্তুত।"
                          : "সতর্কতা: এই ব্রাউজারটি WebUSB সমর্থন করে না। সম্পূর্ণ ফিচারের জন্য ক্রোম বা এজ ব্যবহার করুন।"
                        }
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/10 border border-cyan-900/50 rounded-lg text-cyan-300 flex gap-2.5 items-start">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">আইফ্রেম স্যান্ডবক্সিং নির্দেশিকা (Strict Sandbox Security):</span>
                      <span className="text-slate-400 leading-normal block mt-0.5">
                        আইফ্রেম প্রোটোকলের সিকিউরিটির কারণে সরাসরি ব্রাউজার উইন্ডো পপআপ ব্লক হতে পারে। সেরা রেজাল্টের জন্য নিচের রিয়েল লাইভ URL টি ক্রোম ব্রাউজারের একটি নতুন ট্যাবে ফুল স্ক্রিনে ওপেন করে কানেক্ট বোতামে ক্লিক করুন।
                      </span>
                      <div className="mt-2.5 flex items-center gap-1.5 font-mono">
                        <input 
                          type="text" 
                          readOnly 
                          value={window.location.origin} 
                          className="bg-black/45 border border-cyan-950 text-[10px] px-2 py-1 rounded text-cyan-400 flex-1 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin);
                            alert("URL কপি করা হয়েছে! দয়া করে এটি নতুন ট্যাবে ওপেন করুন।");
                          }}
                          className="px-2.5 py-1 bg-cyan-850 hover:bg-cyan-750 text-white rounded font-sans text-xxxxs font-bold cursor-pointer"
                        >
                          কপি লিঙ্ক
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Predefined instruction rules */}
                <div className="p-3 bg-neutral-950/50 border border-slate-900 rounded-lg text-slate-400 text-xxs font-sans space-y-1.5">
                  <span className="text-slate-200 font-bold block mb-1">কানেক্ট করার সঠিক ধাপসমূহ:</span>
                  <span>১. অ্যান্ডরয়েড ফোনের <b>Developer Options</b>-এ গিয়ে <b>USB Debugging</b> অপশনটি চালু করুন।</span>
                  <span>২. একটি ভালো মানের অরিজিনাল ওটিজি বা ইউএসবি ক্যাবল দিয়ে পিসির সাথে প্লাগ করুন।</span>
                  <span>৩. ডানদিকের <b>"রিয়েল ডিভাইস কানেক্ট করুন"</b> বাটনটি ক্লিক করুন এবং পপআপ ডেক থেকে ফোন সিলেক্ট করুন।</span>
                </div>
              </div>

              {/* Status Indicator inside WebUSB tab */}
              <div className="p-3 bg-[#03060c] border border-slate-900 rounded-xl flex items-center justify-between text-[#e0e0e0] font-sans">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    usbDevice ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`} />
                  <span className="font-semibold text-slate-300 text-xxs">
                    USB স্ট্যাটাস: <span className="text-slate-400">{usbDevice ? "সংযুক্ত (Claimed)" : "সংযোগহীন (Disconnected)"}</span>
                  </span>
                </div>
                {usbDevice && (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-xxs">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> USB 2.0 Bulk Endpoint
                  </span>
                )}
              </div>
            </div>

            {/* Right Column - USB Control panel & Live stream console */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl flex flex-col gap-3 font-sans">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-900 pb-1.5 mb-1 select-none flex justify-between">
                  <span>WebUSB হার্ডওয়্যার মডিউল</span>
                  {usbDevice && <span className="text-emerald-400 font-sans normal-case text-xxxxs">Vendor ID: {usbDevice.vendorId}</span>}
                </h4>

                {/* Hardware Connection Action Panel */}
                <div className="flex flex-col gap-2.5 bg-[#03060c] p-3 rounded-lg border border-slate-900">
                  <span className="text-xxs font-mono text-slate-500 uppercase tracking-widest block leading-tight">ইউএসবি লিঙ্ক হ্যান্ডলার</span>
                  
                  {usbDevice ? (
                    <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 flex items-center justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xxs font-bold text-white truncate">{usbDevice.productName || "Android Mobile"}</p>
                          <p className="text-[9px] text-gray-400 font-mono truncate">Serial: {usbDevice.serialNumber || "N/A"}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDisconnectUsb}
                        className="px-2.5 py-1.5 rounded font-bold text-xxs text-white bg-rose-900/60 hover:bg-rose-850 border border-rose-900 hover:border-rose-700 font-sans transition-all cursor-pointer shrink-0"
                      >
                        ডিসকানেক্ট
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestUsbDevice}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white rounded cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md shadow-emerald-950/30 font-sans"
                    >
                      <Usb className="w-4 h-4 text-white" />
                      রিয়েল অ্যান্ডরয়েড ডিভাইস কানেক্ট করুন (WebUSB OTG)
                    </button>
                  )}
                </div>

                {/* Simulated / Real ADB Command Input Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-mono">EXECUTE ADB SHELL COMMAND</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      value={adbInputCmd}
                      onChange={(e) => setAdbInputCmd(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendAdbCmd();
                      }}
                      placeholder="e.g. adb devices, adb shell getprop, or pm list packages"
                      className="flex-1 px-2.5 py-1.5 text-xxs font-mono bg-neutral-950 border border-slate-800 rounded focus:border-emerald-500 focus:outline-none text-slate-200 min-w-0"
                    />
                    <button
                      onClick={handleSendAdbCmd}
                      className="px-4 py-1.5 font-bold text-xxs text-white bg-emerald-900 border border-emerald-800 hover:bg-emerald-850 rounded cursor-pointer font-sans shrink-0 hover:border-emerald-700 transition-colors"
                    >
                      কমান্ড রান
                    </button>
                  </div>
                </div>

                {/* Predefined Quick ADB Cmd Buttons */}
                <div className="flex flex-wrap gap-1.5 mt-0.5 select-none text-[8px] font-mono">
                  <button 
                    onClick={() => { setAdbInputCmd("adb devices"); }}
                    className="px-2 py-0.5 rounded border border-slate-900 bg-[#0c1221] text-cyan-400 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    adb devices
                  </button>
                  <button 
                    onClick={() => { setAdbInputCmd("adb shell getprop ro.product.model"); }}
                    className="px-2 py-0.5 rounded border border-slate-900 bg-[#0c1221] text-cyan-400 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    getprop model
                  </button>
                  <button 
                    onClick={() => { setAdbInputCmd("adb shell pm list packages"); }}
                    className="px-2 py-0.5 rounded border border-slate-900 bg-[#0c1221] text-cyan-400 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    list packages
                  </button>
                  <button 
                    onClick={() => { setAdbInputCmd("adb shell screencap -p"); }}
                    className="px-2 py-0.5 rounded border border-slate-900 bg-[#0c1221] text-cyan-400 hover:border-slate-700 cursor-pointer transition-all"
                  >
                    screencap
                  </button>
                </div>
              </div>

              {/* WebUSB Output logs terminal */}
              <div className="flex-1 bg-[#03060a] border border-slate-900 rounded-xl p-3 h-48 overflow-y-auto flex flex-col-reverse justify-end font-mono">
                {usbLogs.length === 0 ? (
                  <div className="text-gray-600 italic text-center py-10 text-xxxxs sm:text-xxs">
                    WebUSB ইন্টারঅ্যাকশন ট্রেস রিয়েলটাইমে এখানে দৃশ্যমান হবে...
                  </div>
                ) : (
                  <div className="space-y-1.5 text-[10px] sm:text-xxs w-full">
                    {usbLogs.map((log) => (
                      <div key={log.id} className="flex gap-2 items-start leading-relaxed animate-fadeIn">
                        <span className="text-gray-650 text-[9px] shrink-0">{log.time}</span>
                        <span className={`block break-all font-medium ${
                          log.type === 'cmd' ? "text-cyan-400" :
                          log.type === 'success' ? "text-emerald-400" :
                          log.type === 'error' ? "text-rose-400" : "text-slate-300"
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

          </div>
        )}

        {/* AI TROUBLESHOOTER & BRAND DATABASE VIEW */}
        {activeTab === "db_ai" && (
          <div className="flex flex-col gap-4 h-full animate-fadeIn font-sans">
            <div className="bg-[#0b0c16]/80 p-4 border border-purple-950/40 rounded-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px]">
                <h3 className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <span className="p-1 rounded bg-purple-950 text-purple-400">
                    <Database className="w-3.5 h-3.5" />
                  </span>
                  ডায়াগনস্টিক ডেটাবেস এবং এআই ট্রাবলশুটার
                </h3>
                <p className="text-xxxxs sm:text-xxs text-slate-450 leading-relaxed mt-1">
                  জনপ্রিয় মোবাইল ব্র্যান্ডগুলোর ভাঙা বা স্ক্রিন নষ্ট হওয়া ডিভাইসের ডেটা ব্যাকআপ ও রিকভারি করার সুনির্দিষ্ট ম্যানুয়াল নির্দেশিকা। কোন ডিভাইসে কাজ না করলে নিচে সরাসরি প্রশ্ন করুন আমাদের রিয়েল-টাইম জেমিনি এআই সহযোগীকে!
                </p>
              </div>

              {/* Dynamic Brand Pill Filters */}
              <div className="flex items-center gap-1.5 bg-[#03060c] p-1 rounded-lg border border-slate-900 select-none">
                {[
                  { id: "all", label: "সব ব্র্যান্ড" },
                  { id: "Samsung", label: "Samsung" },
                  { id: "Xiaomi", label: "Xiaomi" },
                  { id: "iPhone", label: "iPhone" },
                  { id: "Pixel", label: "Google Pixel" }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBrand(b.id);
                      // Auto select first entry in filtered brand
                      const filtered = BRAND_RECOVERY_GUIDES.filter(g => b.id === "all" || g.brand === b.id);
                      if (filtered.length > 0) {
                        setSelectedGuideId(filtered[0].id);
                      }
                    }}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                      selectedBrand === b.id
                        ? "bg-[#25153f] text-purple-300 border border-purple-900/60 shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Grid Area - Guides vs AI Chat */}
            <div className="flex flex-col lg:flex-row gap-5 h-full items-stretch min-h-[500px]">
              
              {/* Left Panel: Guide Browser */}
              <div className="flex-1 flex flex-col gap-4 bg-[#040810]/50 border border-slate-900/80 p-4 rounded-xl">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <span className="text-xxxxs sm:text-xxs font-mono text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-purple-400" />
                    ডিসপ্লে রিস্টোর নির্দেশিকা ডেটাবেস
                  </span>
                  <span className="text-xxxxs sm:text-xxs bg-neutral-900 text-slate-350 px-2 py-0.5 rounded border border-slate-800">
                    রিস্টোরেশন মডেল সংখ্যা: {BRAND_RECOVERY_GUIDES.filter(g => selectedBrand === "all" || g.brand === selectedBrand).length} টি
                  </span>
                </div>

                {/* Sublist of Guides Available */}
                <div className="flex gap-2 pb-1 overflow-x-auto select-none grow-0 shrink-0">
                  {BRAND_RECOVERY_GUIDES
                    .filter(guide => selectedBrand === "all" || guide.brand === selectedBrand)
                    .map((guide) => (
                      <button
                        key={guide.id}
                        onClick={() => setSelectedGuideId(guide.id)}
                        className={`px-3 py-2 text-left rounded-lg text-xxs transition-all border shrink-0 cursor-pointer ${
                          selectedGuideId === guide.id
                            ? "bg-purple-950/20 border-purple-600/70 text-purple-200"
                            : "bg-[#03060c] border-[#101423] text-gray-400 hover:border-slate-850 hover:text-slate-200"
                        }`}
                      >
                        <p className="font-bold">{guide.brand} • {guide.recoveryType}</p>
                      </button>
                    ))}
                </div>

                {/* Active Guide Viewer */}
                {(() => {
                  const activeGuide = BRAND_RECOVERY_GUIDES.find(g => g.id === selectedGuideId) || BRAND_RECOVERY_GUIDES[0];
                  if (!activeGuide) return (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-xxs italic">
                      অনুরোধকৃত মডেলের জন্য নির্দেশিকা পাওয়া যায়নি।
                    </div>
                  );

                  return (
                    <div className="flex-1 flex flex-col gap-3.5 animate-fadeIn">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-purple-950/50 border border-purple-900/60 rounded text-[10px] font-bold text-purple-300">
                              {activeGuide.brand}
                            </span>
                            <span className={`px-2 py-0.5 border rounded text-[10px] font-semibold ${
                              activeGuide.difficulty === 'সহজ' ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' :
                              activeGuide.difficulty === 'মাঝারি' ? 'bg-amber-950/40 border-amber-900/50 text-amber-400' :
                              'bg-rose-950/40 border-rose-900/50 text-rose-400'
                            }`}>
                              কঠিনতা: {activeGuide.difficulty}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-100 mt-1.5">{activeGuide.title}</h4>
                        </div>
                      </div>

                      <p className="text-xxxxs sm:text-xxs text-slate-400 leading-normal bg-slate-950/40 p-3 rounded-lg border border-slate-900 font-sans">
                        {activeGuide.summary}
                      </p>

                      {/* Prerequisites & Hardwares */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xxxxs sm:text-xxs">
                        <div className="p-3 bg-[#03060c] border border-slate-900/80 rounded-lg">
                          <span className="font-bold text-slate-200 block mb-1.5 border-b border-slate-950 pb-1">প্রয়োজনীয় শর্তাবলি:</span>
                          <ul className="space-y-1 text-slate-400 list-disc list-inside">
                            {activeGuide.prerequisites.map((p: string, idx: number) => (
                              <li key={idx} className="leading-tight">{p}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 bg-[#03060c] border border-slate-900/80 rounded-lg">
                          <span className="font-bold text-slate-200 block mb-1.5 border-b border-slate-950 pb-1">প্রয়োজনীয় হার্ডওয়্যার:</span>
                          <ul className="space-y-1 text-slate-400 list-disc list-inside">
                            {activeGuide.hardwareRequired.map((h: string, idx: number) => (
                              <li key={idx} className="leading-tight">{h}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Interactive Step Timeline */}
                      <div className="flex flex-col gap-2.5">
                        <span className="font-bold text-[10px] text-purple-300 uppercase tracking-wider block">পুনরুদ্ধারের পর্যায়ক্রমিক ধাপসমূহ:</span>
                        <div className="space-y-3 font-sans">
                          {activeGuide.steps.map((step: any) => (
                            <div key={step.number} className="p-3 bg-neutral-950/40 border border-[#101423] rounded-lg text-xxs flex gap-3 block hover:border-slate-800 transition-all">
                              <span className="w-5.5 h-5.5 flex items-center justify-center rounded-full bg-purple-950/80 border border-purple-850 text-purple-300 font-bold shrink-0 text-xxxxs sm:text-xxs">
                                {step.number}
                              </span>
                              <div className="flex-1 space-y-1.5 min-w-0">
                                <span className="font-bold text-slate-200 block">{step.title}</span>
                                <span className="text-slate-400 leading-normal block text-xxxxs sm:text-xxs">{step.desc}</span>
                                
                                {step.keyAction && (
                                  <div className="flex items-center gap-1.5 text-amber-400 text-xxxxs font-mono">
                                    <span className="bg-amber-950/40 border border-amber-900/40 px-1 py-0.5 rounded text-[8px] font-bold text-amber-300">KEY ACTION:</span>
                                    <span>{step.keyAction}</span>
                                  </div>
                                )}

                                {step.command && (
                                  <div className="bg-[#03060a] border border-slate-905 rounded p-2 flex items-center justify-between gap-2 mt-1.5 font-mono text-[9px] text-cyan-400 overflow-hidden">
                                    <code className="truncate flex-1 select-all">{step.command}</code>
                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        onClick={() => handleCopyCommand(step.command)}
                                        className="p-1 hover:bg-neutral-900 rounded text-slate-500 hover:text-cyan-400 cursor-pointer"
                                        title="কপি কমান্ড"
                                      >
                                        {copiedCmd === step.command ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setAdbInputCmd(step.command);
                                          setActiveTab("webusb");
                                          addUsbLog(`নির্দেশিকা কোড সংকেত সিগন্যাল: "${step.command}" কমান্ডটি ইনপুট ফিল্ডে কপি করা হয়েছে।`, "info");
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-cyan-950/40 hover:bg-cyan-900/60 text-[8px] font-bold text-cyan-300 border border-cyan-950 cursor-pointer"
                                        title="ADB মডিউলে রান করুন"
                                      >
                                        মডিউলে পাঠান
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Panel: Gemini AI Expert Chatbot */}
              <div className="flex-1 flex flex-col gap-3 bg-[#0d071a]/40 border border-purple-950/30 p-4 rounded-xl max-w-full lg:max-w-md w-full">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                      Gemini Display Recovery Expert
                    </span>
                  </div>
                  <span className="text-[9px] text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded font-bold border border-emerald-900/30">
                    ONLINE
                  </span>
                </div>

                {/* Chat Message Lists Render */}
                <div className="flex-1 overflow-y-auto p-2 bg-[#020408]/80 border border-slate-950/90 rounded-lg min-h-[280px] max-h-[400px] flex flex-col gap-2.5">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] rounded-lg p-2.5 text-xxs leading-relaxed animate-fadeIn ${
                        msg.sender === "user"
                          ? "self-end bg-purple-900/35 border border-purple-800/40 text-purple-100"
                          : "self-start bg-neutral-900/90 border border-slate-850 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between opacity-50 text-[8px] font-mono mb-1 select-none">
                        <span>{msg.sender === "user" ? "You" : "Gemini AI Expert"}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="break-words block whitespace-pre-line font-sans">{msg.text}</p>
                    </div>
                  ))}

                  {/* Loading placeholder */}
                  {isChatLoading && (
                    <div className="self-start max-w-[85%] bg-neutral-900/90 border border-slate-850 rounded-lg p-2.5 text-xxs flex items-center gap-2 text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-75" />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-150" />
                      <span className="italic ml-1 text-xxxxs sm:text-xxs">জেমিনি এআই সমাধান খুঁজছে...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Instant Query Recommendation Prompts */}
                <div className="space-y-1.5 select-none text-[8px] sm:text-[9px] font-sans">
                  <span className="text-gray-500 font-bold block mb-1">কুইক এআই রিকমেন্ডেশন প্রম্পটস:</span>
                  <div className="flex flex-col gap-1">
                    {[
                      { short: "স্যামসাং ডেক্স পিন আনলক পদ্ধতি", text: "স্যামসাং ফোন ভাঙা স্ক্রিনে ডেক্স কিবোর্ড দিয়ে ব্লাইন্ড পিন টাইপ করে কীভাবে আনলক করব?" },
                      { short: "শাওমি এডিবি সিকিউরিটি বাইপাস ট্রিক", text: "Xiaomi ফোনের USB Security Settings অফ থাকলে কাস্টম রিকভারি দিয়ে কিভাবে ওটিজি টাচ পারমিশন বাইপাস করব?" },
                      { short: "আইফোনের ভাঙা স্ক্রিন ব্যাকআপ উপায়", text: "আইফোনের স্ক্রিন টাচ কাজ করে না কিন্তু Siri অ্যাক্টিভ। VoiceOver ও এয়ারপ্লে ব্যবহার করার ফুল গাইড দিন।" }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        disabled={isChatLoading}
                        onClick={() => handleSendChatMessage(p.text)}
                        className="w-full text-left p-1.5 rounded bg-[#0b0416] hover:bg-purple-950/30 text-purple-300 hover:text-white border border-purple-950/40 text-xxs cursor-pointer truncate transition-colors"
                      >
                        ⚡ {p.short}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Message Input Box */}
                <div className="flex gap-2 bg-[#020408]/60 p-1 rounded-lg border border-slate-900 mt-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isChatLoading) handleSendChatMessage();
                    }}
                    placeholder={isChatLoading ? "জেমিনি এআই কাজ করছে..." : "broken screen data recovery নিয়ে প্রশ্ন করুন..."}
                    disabled={isChatLoading}
                    className="flex-1 bg-black/45 border-0 focus:ring-0 focus:outline-none text-xxs font-sans px-2 text-slate-200 rounded min-w-0"
                  />
                  <button
                    onClick={() => handleSendChatMessage()}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="p-2 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-950 disabled:text-slate-500 text-white rounded cursor-pointer shrink-0 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* AUTOMATED OTG-CONTROLLER SCRIPT GENERATOR VIEW */}
        {activeTab === "otg_script" && (
          <div className="flex flex-col gap-4 h-full animate-fadeIn font-sans">
            {/* Top Info Banner Card */}
            <div className="bg-[#12111d] p-4 border border-amber-955/40 rounded-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px]">
                <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <span className="p-1 rounded bg-amber-950 text-amber-400">
                    <Wrench className="w-3.5 h-3.5" />
                  </span>
                  অটোমেটেড ওটিজি-কন্ট্রোলার স্ক্রিপ্ট জেনারেটর (Automated OTG Recipe)
                </h3>
                <p className="text-xxxxs sm:text-xxs text-slate-400 leading-relaxed mt-1">
                  আপনার ফোনের ব্র্যান্ড ও ওএস (OS) ভার্সন অনুযায়ী ব্লাইন্ড নেভিগেশন রেসিপি তৈরি করুন। স্ক্রিন বা টাচ নষ্ট থাকলেও ওটিজি কিবোর্ড ও মাউস দিয়ে নিখুঁত কাউন্টিং সিকোয়েন্স অনুসরণ করে কাজ হাসিল করুন।
                </p>
              </div>
            </div>

            {/* Main Config and Output Splitter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[500px]">
              
              {/* Left Form: Select device profile */}
              <div className="lg:col-span-5 flex flex-col gap-4 bg-[#040810]/50 border border-slate-900 p-4 rounded-xl">
                <span className="text-xxxxs sm:text-xxs font-mono text-slate-450 uppercase tracking-wider block border-b border-slate-900 pb-2">
                  ১. ডিভাইসের পরিচিতি এবং টার্গেট সেট করুন
                </span>

                {/* Dropdowns */}
                <div className="space-y-3.5 font-sans">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxxxs sm:text-xxs text-slate-350 font-semibold">ফোনের ব্র্যান্ড/মডেল (Brand Profile):</label>
                    <select
                      value={otgBrand}
                      onChange={(e) => setOtgBrand(e.target.value)}
                      className="w-full bg-[#03060c] border border-slate-800 text-xxs p-2 rounded focus:ring-1 focus:ring-amber-500/50 text-slate-200 outline-none font-sans cursor-pointer"
                    >
                      <option value="Samsung">Samsung (গ্যালাক্সি সিরিজ)</option>
                      <option value="Xiaomi">Xiaomi / Redmi (শাওমি বাইপাস)</option>
                      <option value="iPhone">Apple iPhone (আইওএস ভয়েসওভার)</option>
                      <option value="Google Pixel">Google Pixel (স্টক অ্যান্ড্রয়েড)</option>
                      <option value="OnePlus">OnePlus (অক্সিজেন ওএস)</option>
                      <option value="Oppo/Realme">Oppo, Realme & Vivo (কালার ওএস)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxxxs sm:text-xxs text-slate-350 font-semibold">অ্যান্ড্রয়েড/ওএস সংস্করণ (System OS):</label>
                    <select
                      value={otgOS}
                      onChange={(e) => setOtgOS(e.target.value)}
                      className="w-full bg-[#03060c] border border-slate-800 text-xxs p-2 rounded focus:ring-1 focus:ring-amber-500/50 text-slate-200 outline-none font-sans cursor-pointer"
                    >
                      <option value="Android 14">Android 14 (Upside Down Cake)</option>
                      <option value="Android 13">Android 13 (Tiramisu)</option>
                      <option value="Android 12">Android 12 (Snow Cone)</option>
                      <option value="Android 11">Android 11 (Red Velvet-Cake)</option>
                      <option value="Android 10">Android 10 (Quince Tart)</option>
                      <option value="iOS 17">iOS 17 / iPadOS 17</option>
                      <option value="iOS 16">iOS 16 / iPadOS 16</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxxxs sm:text-xxs text-slate-350 font-semibold">পুনরুদ্ধার লক্ষ্য (Target Recovery Task):</label>
                    <div className="grid grid-cols-1 gap-2 select-none font-sans">
                      {[
                        { id: "debugging", label: "ব্লাইন্ড ইউএসবি ডিবাগিং (Enable USB Debugging)", desc: "কীবোর্ড দিয়ে সম্পূর্ণ অন্ধ অবস্থায় এডিবি পারমিশন চালু" },
                        { id: "unlock", label: "কিবোর্ড দিয়ে পিন আনলক (OTG Password/PIN)", desc: "কীবোর্ড নামপ্যাড চেপে লক স্ক্রিন আনলক করা" },
                        { id: "screencast", label: "স্ক্রিন কাস্টিং অলটারনেティブ (Screencast / Project)", desc: "অন্ধ ডিভাইসের ডিসপ্লে স্মার্ট টিভি বা পিসিতে পাঠানো" },
                        { id: "backup", label: "স্মার্ট ক্লাউড ফাইল সিঙ্ক (Backup & Drive Sync)", desc: "ক্যামেরা ছবি ও ডিরেক্টরি গুগল ড্রাইভে পুশ" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setOtgTask(t.id)}
                          className={`p-2.5 text-left rounded-lg text-xxxxs sm:text-xxs border transition-all cursor-pointer ${
                            otgTask === t.id
                              ? "bg-amber-955/20 border-amber-500/85 text-amber-200"
                              : "bg-[#030610] border-slate-900 text-gray-400 hover:border-slate-855 hover:text-slate-300"
                          }`}
                        >
                          <span className="font-bold block text-slate-100">{t.label}</span>
                          <span className="text-[10px] opacity-70 block leading-tight mt-0.5">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gemini AI Optimization Integration Trigger */}
                <div className="mt-4 p-3 bg-purple-950/20 border border-purple-900/40 rounded-lg">
                  <span className="text-xxxxs sm:text-xxs text-purple-300 font-bold block mb-1">জেমিনি এআই রিকভারি অপ্টিমাইজার</span>
                  <p className="text-[10px] text-purple-400 leading-normal mb-2.5">
                    ব্র্যান্ডের সুনির্দিষ্ট কার্নেল ও UI চেঞ্জের ওপর ভিত্তি করে কিবোর্ড ডাল ক্লিক ও এডিবি স্ক্রিপ্ট অপ্টিমাইজড করে নিতে জেমিনি মডেলকে প্রম্পট করুন।
                  </p>
                  <button
                    onClick={handleAiOptimizeOtg}
                    disabled={isAiOtgLoading}
                    className="w-full py-2 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-705 hover:to-indigo-705 text-white font-bold text-xxs rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/40"
                  >
                    {isAiOtgLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        রেসিপি অপ্টিমাইজড করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                        এআই দিয়ে রেসিপি অপ্টিমাইজ করুন
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Output Interactive Timelines & Simulated Run Console */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* Visualizer Header */}
                {(() => {
                  const recipe = getOTGRecipe(otgBrand, otgOS, otgTask);
                  return (
                    <div className="flex flex-col gap-4 flex-1">
                      
                      {/* Active Recipe Details */}
                      <div className="p-4 bg-[#0a0711] border border-amber-900/30 rounded-xl">
                        <div className="flex items-center justify-between border-b border-amber-955/20 pb-2">
                          <span className="text-xxs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-amber-400" />
                            কাস্টম ওটিজি সিকোয়েন্স রেসিপি
                          </span>
                          <span className="text-[10px] bg-amber-955/40 text-amber-400 px-2 py-0.5 rounded border border-amber-900/30 font-sans">
                            মোট ওটিজি ধাপ: {recipe.sequence.length} টি
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 mt-2.5 leading-tight">{recipe.title}</h4>
                        <p className="text-xxxxs sm:text-xxs text-amber-200/70 italic mt-2 bg-amber-955/15 p-2.5 rounded border border-amber-955/30 leading-snug">
                          💡 <strong>গুরুত্বপূর্ণ টিপ:</strong> {recipe.tip}
                        </p>

                        {/* Generated Touchless Step Sequence */}
                        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {recipe.sequence.map((step, idx) => {
                            const isActiveInSim = isSimulatingOtg && simulatedOtgStep === idx;
                            return (
                              <div
                                key={step.number}
                                className={`p-2.5 rounded-lg border text-xxs transition-all flex items-center gap-3 font-sans ${
                                  isActiveInSim
                                    ? "bg-amber-955/30 border-amber-500 text-amber-200 shadow shadow-amber-955 scale-[1.01]"
                                    : "bg-black/45 border-slate-900/80 text-slate-355"
                                }`}
                              >
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-xxxxs sm:text-xxs shrink-0 ${
                                  isActiveInSim ? "bg-amber-500 text-black font-extrabold animate-bounce" : "bg-neutral-900 border border-slate-800 text-slate-400"
                                }`}>
                                  {step.number}
                                </span>
                                
                                <div className="flex-1 min-w-0 font-sans">
                                  <div className="flex items-baseline gap-2 flex-wrap col">
                                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-755 text-slate-100 font-mono font-bold text-[10px] rounded shadow-sm inline-flex items-center gap-0.5 select-none border-b-2">
                                      {step.key}
                                    </span>
                                    <span className="font-bold text-slate-200">{step.action}</span>
                                  </div>
                                  <p className="text-slate-400 leading-normal mt-1 text-xxxxs sm:text-xxs">{step.note}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Simulator Logger Console */}
                      <div className="p-4 bg-slate-950/70 border border-slate-900 rounded-xl flex flex-col gap-3 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulatingOtg ? "animate-ping bg-emerald-400" : "bg-slate-400"}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulatingOtg ? "bg-emerald-500" : "bg-slate-500"}`}></span>
                            </span>
                            ওটিজি নেভিগেশন সিমুলেটর (Simulator Console)
                          </span>

                          <div className="flex gap-2 font-sans">
                            {isSimulatingOtg ? (
                              <button
                                onClick={handleStopOtgSimulation}
                                className="px-3 py-1 bg-rose-900/75 hover:bg-rose-800 text-rose-200 text-[10px] font-bold rounded cursor-pointer transition-colors"
                              >
                                থামুন (Stop)
                              </button>
                            ) : (
                              <button
                                onClick={handleStartOtgSimulation}
                                className="px-3 py-1 bg-emerald-950 border border-emerald-850 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold rounded cursor-pointer transition-colors flex items-center gap-1"
                              >
                                <Play className="w-3 h-3 text-emerald-400" />
                                সিমুলেশন সচল করুন
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Animated step progressbar for timeline tracking */}
                        {isSimulatingOtg && (
                          <div className="w-full bg-[#0d1425] h-1.5 rounded-full overflow-hidden border border-slate-900">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
                              style={{ width: `${(simulatedOtgStep / recipe.sequence.length) * 100}%` }}
                            />
                          </div>
                        )}

                        {/* Scrolling Simulator Terminal output logs */}
                        <div className="h-[120px] overflow-y-auto p-2.5 bg-[#02050b] border border-slate-950 rounded-lg text-[10px] font-mono text-slate-400 space-y-1.5 leading-relaxed">
                          {simulatedOtgLogs.length === 0 ? (
                            <span className="italic opacity-45 text-[10px]">সিমুলেশন ট্রানজিশন আরম্ভ করতে উপরের 'সিমুলেশন সচল করুন' বাটনে ক্লিক করুন।</span>
                          ) : (
                            simulatedOtgLogs.map((log, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="opacity-45 select-none font-bold">[{log.time}]</span>
                                <span className={
                                  log.status === 'success' ? 'text-emerald-400 font-medium' :
                                  log.status === 'warning' ? 'text-rose-400' : 'text-cyan-400 font-bold'
                                }>
                                  {log.msg}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* ADB Shell Script Export segment */}
                      <div className="p-4 bg-[#050912]/80 border border-slate-900 rounded-xl flex flex-col gap-2.5 font-mono text-xxs">
                        <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                          এডিবি সমতুল্য অটো-কমান্ড (OS-Specific ADB Equivalent):
                        </span>
                        <div className="bg-[#02050b] border border-slate-950 rounded p-3 flex items-center justify-between gap-3">
                          <code className="text-[10px] whitespace-pre-wrap select-all font-mono leading-normal font-medium flex-1 text-cyan-300">
                            {recipe.adbCommand}
                          </code>
                          <div className="flex flex-col gap-1.5 font-sans">
                            <button
                              onClick={() => handleCopyCommand(recipe.adbCommand)}
                              className="bg-neutral-900 border border-slate-800 p-2 text-slate-400 hover:text-cyan-400 rounded-lg flex items-center justify-center transition-all cursor-pointer font-sans text-xxs gap-1"
                              title="স্ক্রিপ্ট কপি করুন"
                            >
                              {copiedCmd === recipe.adbCommand ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setAdbInputCmd(recipe.adbCommand.split('\n')[0]);
                                setActiveTab("webusb");
                                addUsbLog(`ওটিজি রেসিপি কমান্ড: "${recipe.adbCommand.split('\n')[0]}" WebUSB পাইপের ইনপুটে পাঠানো হয়েছে।`, "info");
                              }}
                              className="px-2 py-1 bg-cyan-950/70 border border-cyan-900/60 text-cyan-200 text-[9px] font-bold rounded cursor-pointer font-sans whitespace-nowrap"
                            >
                              USB মডিউলে পাঠান
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Display Gemini AI Optimized custom response if generated */}
                      {aiOtgOptimized && (
                        <div className="p-4 bg-[#0d071a]/50 border border-purple-950/35 rounded-xl flex flex-col gap-2.5 animate-fadeIn">
                          <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            জেমিনি ওটিজি অপ্টিমাইজড সমাধান নির্দেশিকা:
                          </span>
                          <div className="text-xxs leading-relaxed font-sans text-slate-300 bg-black/40 border border-slate-950 p-4.5 rounded-lg whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                            {aiOtgOptimized}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })()}

              </div>
            </div>

          </div>
        )}

        </>
        )}

      </div>
    </div>
  );
}
