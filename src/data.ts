import { CodeTemplate, BlindStep, DiagnosticItem } from "./types";

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    title: "পাইথন রিসিভার ও কন্ট্রোলার (Pygame + OpenCV)",
    language: "python",
    filename: "remote_mirror.py",
    description: "এই স্ক্রিপ্টটি মোবাইলের পাঠানো H.264 স্ট্রিম বা এমজেপেগ সকেট রিসিভ করে এবং মাউস-কিবোর্ডের ইভেন্ট এডিবি-তে কনভার্ট করে পুশ করে।",
    code: `import socket
import sys
import subprocess
import cv2  # OpenCV দিয়ে ভিডিও ফ্রেম ডিকোড ও রেন্ডারিং
import numpy as np

# ১. নেটওয়ার্ক কানেশন সেটআপ
PORT = 8080
MOBILE_IP = "127.0.0.1"  # ADB Forward করা থাকলে লোকালহোস্টই আইপি
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

try:
    print("[INFO] এডিবি পোর্ট ফরওয়ার্ড সেট করা হচ্ছে...")
    # পিসির ৮০৮০ পোর্টকে অ্যান্ড্রয়েডের ৮০৮০ সকেট পোর্টে ফরওয়ার্ড করুন
    subprocess.run(["adb", "forward", "tcp:8080", "tcp:8080"], check=True)
    
    print("[INFO] মোবাইলের ব্যাকগ্রাউন্ড সার্ভারে সংযুক্ত হওয়া হচ্ছে...")
    server_socket.connect((MOBILE_IP, PORT))
    print("[SUCCESS] মোবাইল সার্ভারের সাথে সংযোগ সফল!")
except Exception as e:
    print(f"[ERROR] কানেক্ট করা সম্ভব হয়নি: {e}")
    sys.exit(1)

# ২. ওপেনসিভি ভিডিও রেন্ডার ও টাচ ইভেন্ট ট্র্যাকিং উইন্ডো তৈরি
cv2.namedWindow("Android Display Mirror (Scrcpy DIY)", cv2.WINDOW_NORMAL)

# মাউস ইভেন্ট ক্যাচ করে এডিবি-তে সেন্ড করার কলব্যাক
def mouse_callback(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"[INPUT] মাউস ক্লিক কোঅর্ডিনেট: X={x}, Y={y}")
        # ADB Shell Touch injection কমান্ড
        # input tap X Y কমান্ডটি ব্যাকগ্রাউন্ডে পাঠাবে
        cmd = f"adb shell input tap {x} {y}"
        subprocess.Popen(cmd.split(), stdout=subprocess.DEVNULL)
    elif event == cv2.EVENT_MOUSEMOVE and (flags & cv2.EVENT_FLAG_LBUTTON):
        # ড্র্যাগ বা সোয়াইপ হ্যান্ডল করার জন্য
        sys.stdout.write(f"\\r[INPUT] মাউস ড্র্যাগিং: X={x}, Y={y}")
        sys.stdout.flush()

cv2.setMouseCallback("Android Display Mirror (Scrcpy DIY)", mouse_callback)

print("\\n[SUCCESS] রিমোট কন্ট্রোল উইন্ডো চালু হয়েছে!")
print("[HINT] উইন্ডো বন্ধ করতে কিবোর্ডে 'q' বাটন চাপুন।")

# ৩. ভিডিও স্ট্রিম গ্রহণ ও ইমেজ ফ্রেম ডিকোড লুপ
data_stream = b""
while True:
    try:
        packet = server_socket.recv(4096)
        if not packet:
            break
        data_stream += packet
        
        # JPEG ফ্রেম ডিলিমিটার চেক (মার্কার দিয়ে ফ্রেম আলাদা করা)
        start_idx = data_stream.find(b'\\xff\\xd8')
        end_idx = data_stream.find(b'\\xff\\xd9')
        
        if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
            jpg_data = data_stream[start_idx:end_idx+2]
            data_stream = data_stream[end_idx+2:]
            
            # ইমেজ ডিকোড করুন
            img_arr = np.frombuffer(jpg_data, dtype=np.uint8)
            frame = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
            
            if frame is not None:
                cv2.imshow("Android Display Mirror (Scrcpy DIY)", frame)
                
        # কিবোর্ড ইনপুট ক্যাচিং
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == 27:  # ESC Key (আমরা মোবাইলের BACK বাটন ট্রিগার করব)
            subprocess.Popen(["adb", "shell", "input", "keyevent", "4"], stdout=subprocess.DEVNULL)
            print("[INPUT] Android BACK Key Press Sent")
        elif key == 32:  # Space Key (পাওয়ার অন/অফ বা আনলক বা স্পেস)
            subprocess.Popen(["adb", "shell", "input", "keyevent", "62"], stdout=subprocess.DEVNULL)
            print("[INPUT] Android SPACE Sent")
        elif key == 8 or key == 127:  # Backspace (ব্যাকস্পেস)
            subprocess.Popen(["adb", "shell", "input", "keyevent", "67"], stdout=subprocess.DEVNULL)
            print("[INPUT] Android BACKSPACE Sent")
        elif key == 13 or key == 10:  # Enter (এন্টার)
            subprocess.Popen(["adb", "shell", "input", "keyevent", "66"], stdout=subprocess.DEVNULL)
            print("[INPUT] Android ENTER Sent")
        elif 32 < key < 127:  # সাধারণ অক্ষর, সংখ্যা ও চিহ্ন (Dynamic Keyboard mapping)
            char_typed = chr(key)
            # বিশেষ ক্যারেক্টারগুলো হ্যান্ডল করতে এক কোটেশনের ভেতরে এস্কেপ করা
            escaped_char = char_typed.replace("'", "\\'")
            subprocess.Popen(["adb", "shell", "input", "text", escaped_char], stdout=subprocess.DEVNULL)
            print(f"[INPUT] Android Character Typed: {char_typed}")
            
    except KeyboardInterrupt:
        break

server_socket.close()
cv2.destroyAllWindows()
print("\\n[INFO] সেশন সমাপ্ত করা হয়েছে।")
`
  },
  {
    title: "অ্যান্ড্রয়েড সাইড ব্যাকগ্রাউন্ড সার্ভার (Bash Java)",
    language: "bash",
    filename: "start_android_service.sh",
    description: "মোবাইলে কোনো রুট পারমিশন ছাড়া স্ক্রিন ক্যাপচার ও স্ট্রিমিং সার্ভিস চালু করার জন্য app_process ডাইরেক্ট জাভা স্ক্রিপ্ট।",
    code: `# এই স্ক্রিপ্টটি মোবাইলের ভেতরে shell পারমিশন দিয়ে রান করাতে হয়। 
# Scrcpy ও ঠিক এই সিস্টেমে ফোনের ভেতরে একটি মিনি-জাভা সার্ভার অ্যাপ রান করে।

echo "[Android Server] স্ক্রিন ক্যাচিং মডিউল পুশ করা হচ্ছে..."

# ১. ডিভাইস কানেক্টেড আছে কি না ভেরিফাই করুন
adb devices

# ২. সার্ভার কোড জার (app.jar) ফোল্ডারে পুশ করা হচ্ছে
# Scrcpy-র নিজস্ব জার ফাইলটি পিসি থেকে সরাসরি ফোনের ক্যাশে পুশ হয়
adb push scrcpy-server.jar /data/local/tmp/scrcpy-server.jar

# ৩. এডিবি ফরওয়ার্ড সেট করা হচ্ছে যাতে পিসি ৮০৮০ পোর্টে সকেট যুক্ত হতে পারে
adb forward tcp:8080 localabstract:scrcpy

echo "[Android Server] ব্যাকগ্রাউন্ড জাভা প্রসেস চালু করা হচ্ছে..."
# 4. অ্যান্ড্রয়েডের app_process রান করানো হচ্ছে যা ভার্চুয়াল ডিসপ্লে তৈরি করবে
# এবং MediaCodec ব্যবহার করে স্ক্রিন ডেটা এনকোড করে সকেটে পুশ করবে
adb shell CLASSPATH=/data/local/tmp/scrcpy-server.jar \\
    app_process /data/local/tmp/ com.genymobile.scrcpy.Server 1.25 \\
    max_size=1024 bitrate=4000000 max_fps=60 encoder_name=OMX.google.h264.encoder
`
  },
  {
    title: "পাইথন কিবোর্ড ম্যাপার (ADB Keyevent Mapping)",
    language: "python",
    filename: "adb_keyboard_map.py",
    description: "কম্পিউটারের কিবোর্ড কমান্ডগুলোকে অ্যান্ড্রয়েড ইনপুট ইভেন্টে কনভার্ট করার জন্য পাইথন ডাইরেক্ট ইভেন্ট কোড।",
    code: `import sys
import subprocess
try:
    import keyboard  # pip install keyboard
except ImportError:
    print("[INFO] অনুগ্রহ করে প্রথমে ইনস্টল করুন: pip install keyboard")
    sys.exit(1)

print("="*60)
print("  Android Remote Keyboard Controller (ADB Bridge - Bangla)")
print("="*60)
print("পিসিতে টাইপ করা অক্ষর সরাসরি আপনার মোবাইলে টেক্সট ইনপুট হিসেবে যাবে!")
print("বাহিরের উইন্ডোতে থাকলেও চমৎকার কাজ করবে। বন্ধ করতে 'ESC' টিপুন।")

def on_key_event(event):
    if event.event_type == 'down':
        # ESC চাপলে বন্ধ হবে
        if event.name == 'esc':
            sys.exit(0)
            
        # বিশেষ বোতাম ম্যাপিং
        elif event.name == 'backspace':
            subprocess.Popen(["adb", "shell", "input", "keyevent", "67"], stdout=subprocess.DEVNULL)
        elif event.name == 'space':
            subprocess.Popen(["adb", "shell", "input", "keyevent", "62"], stdout=subprocess.DEVNULL)
        elif event.name == 'enter':
            subprocess.Popen(["adb", "shell", "input", "keyevent", "66"], stdout=subprocess.DEVNULL)
        elif event.name == 'home':
            subprocess.Popen(["adb", "shell", "input", "keyevent", "3"], stdout=subprocess.DEVNULL)
        
        # সাধারণ অক্ষর ও সংখ্যা অ্যান্ড্রয়েডে সরাসরি পুশ করুন
        elif len(event.name) == 1:
            char = event.name
            print(f"[KEYBOARD] Sending char: {char}")
            # input text <text> ব্যবহার করে মোবাইলের কার্সারে রিয়েল-টাইমে টাইপ করা
            subprocess.Popen(["adb", "shell", "input", "text", char], stdout=subprocess.DEVNULL)

# গ্লোবাল কিবোর্ড হুক
keyboard.hook(on_key_event)

# লুপ চালু রাখা
keyboard.wait('esc')
`
  },
  {
    title: "সি-শার্প উইন্ডোজ ক্লায়েন্ট (C# WPF Enterprise)",
    language: "csharp",
    filename: "AndroidMirrorClient.xaml.cs",
    description: "উইন্ডোজ ডেক্সটপ অ্যাপ্লিকেশনের জন্য পিওর .NET C# উয়িফি (WPF) সোর্স কোড। এটি ডিভাইস সকেট থেকে ছবি রিসিভ করে এবং মাউস ও কীবোর্ড ইভেন্ট এডিবি-তে পাঠায়।",
    code: `using System;
using System.IO;
using System.Net.Sockets;
using System.Diagnostics;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using System.Threading.Tasks;

namespace AndroidRecoveryClient
{
    public partial class MainWindow : Window
    {
        private TcpClient tcpClient;
        private NetworkStream networkStream;
        private bool isRunning = true;

        public MainWindow()
        {
            InitializeComponent();
            SetupAdbForward();
            Task.Run(() => StartImageReceiver());
        }

        // ১. এডিবি পোর্ট ফরওয়ার্ডিং কনফিগার করা
        private void SetupAdbForward()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("adb", "forward tcp:8080 tcp:8080")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(psi)?.WaitForExit();
            }
            catch (Exception ex)
            {
                MessageBox.Show("ADB ফরওয়ার্ড সেটআপ ব্যর্থ হয়েছে: " + ex.Message);
            }
        }

        // ২. সকেট কানেকশন ও স্ট্রিম রিসিভার লুপ
        private async Task StartImageReceiver()
        {
            try
            {
                tcpClient = new TcpClient("127.0.0.1", 8080);
                networkStream = tcpClient.GetStream();
                MemoryStream frameBuffer = new MemoryStream();

                byte[] buffer = new byte[8192];
                while (isRunning)
                {
                    int bytesRead = await networkStream.ReadAsync(buffer, 0, buffer.Length);
                    if (bytesRead == 0) break;

                    frameBuffer.Write(buffer, 0, bytesRead);
                    byte[] data = frameBuffer.ToArray();

                    // JPEG স্টার্ট এবং এন্ড মার্কার দিয়ে ফ্রেম আলাদা করা
                    int startIdx = FindByteArray(data, new byte[] { 0xFF, 0xD8 });
                    int endIdx = FindByteArray(data, new byte[] { 0xFF, 0xD9 });

                    if (startIdx != -1 && endIdx != -1 && startIdx < endIdx)
                    {
                        int length = (endIdx + 2) - startIdx;
                        byte[] jpgBytes = new byte[length];
                        Array.Copy(data, startIdx, jpgBytes, 0, length);

                        // থ্রেড সেফ উপায়ে ইউআই ইমেজ আপডেট করা
                        Dispatcher.Invoke(() => {
                            BitmapImage bitmap = new BitmapImage();
                            bitmap.BeginInit();
                            bitmap.StreamSource = new MemoryStream(jpgBytes);
                            bitmap.EndInit();
                            MobileDisplayImage.Source = bitmap;
                        });

                        // বাফার অফসেট রিলিজ করা
                        byte[] remaining = new byte[data.Length - (endIdx + 2)];
                        Array.Copy(data, endIdx + 2, remaining, 0, remaining.Length);
                        frameBuffer.SetLength(0);
                        frameBuffer.Write(remaining, 0, remaining.Length);
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("কানেকশন ইরর: " + ex.Message);
            }
        }

        // ৩. ডিসপ্লেতে মাউস ক্লিক ক্যাচ করে adb tap পুশ করা
        private void MobileDisplayImage_MouseDown(object sender, MouseButtonEventArgs e)
        {
            Point position = e.GetPosition(MobileDisplayImage);
            // ইমেজের একচুয়াল ডেনসিটি দিয়ে কনভার্ট করা
            double actualX = position.X * (1080 / MobileDisplayImage.ActualWidth);
            double actualY = position.Y * (1920 / MobileDisplayImage.ActualHeight);

            ExecuteAdbCommand($"shell input tap {(int)actualX} {(int)actualY}");
        }

        // ৪. উইন্ডোজ কিবোর্ড টাইপিং ক্যাচ করে adb text বা keyevent পুশ করা
        protected override void OnKeyDown(KeyEventArgs e)
        {
            base.OnKeyDown(e);
            if (e.Key == Key.Back)
            {
                ExecuteAdbCommand("shell input keyevent 67"); // Backspace
            }
            else if (e.Key == Key.Enter)
            {
                ExecuteAdbCommand("shell input keyevent 66"); // Enter
            }
            else if (e.Key == Key.Space)
            {
                ExecuteAdbCommand("shell input keyevent 62"); // Space
            }
            else if (e.Key >= Key.A && e.Key <= Key.Z)
            {
                string character = e.Key.ToString().ToLower();
                ExecuteAdbCommand($"shell input text {character}");
            }
        }

        private void ExecuteAdbCommand(string arguments)
        {
            Task.Run(() => {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo("adb", arguments)
                    {
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }
                catch { }
            });
        }

        private int FindByteArray(byte[] src, byte[] pattern)
        {
            for (int i = 0; i <= src.Length - pattern.Length; i++)
            {
                bool match = true;
                for (int j = 0; j < pattern.Length; j++)
                {
                    if (src[i + j] != pattern[j]) { match = false; break; }
                }
                if (match) return i;
            }
            return -1;
        }
    }
}
`
  }
];

export const BLIND_STEPS: BlindStep[] = [
  {
    step: 1,
    title: "লক স্ক্রিন আনলক (Blind Unlock)",
    instruction: "মোবাইলে পিসি কিবোর্ড যুক্ত করুন (OTG ক্যাবল ব্যবহার করে বা ব্লুটুথ)। এরপর Spacebar প্রেস করে লক স্ক্রিন জ্বালিয়ে পিন কোডটি আন্দাজে টাইপ করে Enter চাপুন।",
    talkbackFeedback: "TalkBack অফ আছে। পিসির কিবোর্ডে [Space], তারপর [1234] এবং [Enter] টাইপ করুন। ডিভাইস আনলক হওয়ার শব্দ হবে।",
    keyAction: "Spaceবার চাপুন → পিন 1234 এন্টার করুন",
    successCondition: "ডিভাইস আনলক টোন বাজবে এবং হোমস্ক্রিনে ফোকাস যাবে।"
  },
  {
    step: 2,
    title: "টকব্যাক স্ক্রিন ব্যাকগ্রাউন্ড সাউন্ড অন (TalkBack Setup)",
    instruction: "এখন কিবোর্ডে কিছু দেখা যাবে না। তাই শব্দ পেতে মোবাইলের Volume Up (+) ও Volume Down (-) বোতাম দুটি একসাথে ৩ সেকেন্ড চেপে ধরে রাখুন। টকব্যাক অ্যাক্টিভেট হবে এবং যেকোনো ক্লিক স্পিকার বা হেডফোন দিয়ে শুনাবে!",
    talkbackFeedback: "[TalkBack Screen Reader on.] \"Home, Clock Widget, Double tap to activate, Triple tap to settings.\"",
    keyAction: "ভলিউম আপ + ডাউন চেপে ধরুন",
    successCondition: "TalkBack এর ভয়েস ফিডব্যাক চালু হবে।"
  },
  {
    step: 3,
    title: "সেটিংস নেভিগেশন (Blind Settings)",
    instruction: "কিবোর্ডে [Win + N] চেপে নোটিফিকেশন বার নামান। এরপর [Tab] চেপে 'Settings' বোতামের উপর ফোকাস নিয়ে আসুন এবং [Enter] চাপুন। টকব্যাক ভয়েস বলবে 'Settings'.",
    talkbackFeedback: "Notification shade open. Settings button selected. Double tap to open Settings.",
    keyAction: "Win + N, তারপর Tab এবং Enter চাপুন",
    successCondition: "সেটিংস উইন্ডো ওপেন হয়েছে।"
  },
  {
    step: 4,
    title: "বিল্ড নাম্বার ট্যাপ (Enable Developer Options)",
    instruction: "সার্চ অপশন পেতে কিবোর্ড দিয়ে [Tab] চাপুন। এবার 'build' লিখে সার্চ দিন। টকব্যাক বলবে 'About phone - Build number'. সেখানে গিয়ে ৭ বার [Enter] চাপুন ডেভেলপার অপশন অন করার জন্য।",
    talkbackFeedback: "Searching... 'Build Number' selected. Tapping: 5, 4, 3, 2, 1... You are now a Developer!",
    keyAction: "Tab চাপুন, build লিখে সার্চ করুন, ৭ বার Enter চাপুন",
    successCondition: "Developer Options এনাবল হওয়ার অডিও আসবে।"
  },
  {
    step: 5,
    title: "ইউএসবি ডিবাগিং অন (Enable USB Debugging)",
    instruction: "আবার সেটিংসে সার্চ করুন 'USB Debugging'। রেজাল্ট অপশনে গিয়ে Spaceবার চাপুন তা অন করার জন্য। টকব্যাক পারমিশন চাইলে Space বা Enter চাপুন। রিমোট অ্যাক্সেস পুরোপুরি ওপেন!",
    talkbackFeedback: "USB Debugging turned on. Allow USB Debugging? Pressed 'OK'. Connection allowed.",
    keyAction: "Search 'USB Debugging', Space চেপে অন করুন, OK চাপুন",
    successCondition: "USB Debugging সক্রিয় এবং এডিবি সকেট ওপেন!"
  }
];

export const DIAGNOSTICS: DiagnosticItem[] = [
  {
    id: "unauthorized",
    title: "১. 'Device Unauthorized' এরোর",
    symptom: "পিসিতে adb devices টাইপ করলে 'device unauthorized' লেখা দেখাচ্ছে কিন্তু স্ক্রিন মিরর হচ্ছে না।",
    reason: "মোবাইল ডিসপ্লে নষ্ট থাকার কারণে আপনি অন-স্ক্রিন 'Allow USB Debugging' রিকোয়েস্ট এক্সেপ্ট করতে পারছেন না।",
    commands: [
      "adb kill-server",
      "adb start-server",
      "adb devices"
    ],
    solution: "মোবাইলটিকে ইউএসবি থেকে খুলে পিসির adb config কী ডিলিট করুন যাতে পুশ হয়ে যায়। অথবা একটি OTG ক্যাবল দিয়ে ফিজিক্যাল মাউস কানেক্ট করুন। স্ক্রিনের একদম মাঝ বরাবর থেকে কিছুটা নিচে আন্দাজে মাউস মাউস নিয়ে লেফট ক্লিক করুন, কারণ সাধারনত পপ-আপ মেসেজটি স্ক্রিনের মাঝের নিচ অংশে 'Allow/OK' অপশন নিয়ে হাসে।"
  },
  {
    id: "no_device",
    title: "২. 'No Device Detected' সমস্যা",
    symptom: "ইউএসবি ক্যাবল লাগানো সত্ত্বেও adb বা Scrcpy বলছে 'error: no devices/emulators found'।",
    reason: "ইউএসবি ক্যাবলটি ডেটা-ট্রান্সফার সাপোর্ট করে না (শুধুমাত্র চার্জিং ক্যাবল) অথবা ডিবাগিং আগে অফ করা হয়েছিল বা ড্রাইভ ইনস্টল নেই।",
    commands: [
      "adb usb",
      "adb reconnect offline"
    ],
    solution: "১. নিশ্চিত হোন যে আপনি একটি ডেটা ক্যাবল ব্যবহার করছেন। \n২. উইন্ডোজে Device Manager খুলুন এবং Android Composite Interface ড্রাইভটি আপডেট হয়েছে কি না চেক করুন। \n৩. পোর্ট পরিবর্তন করে কম্পিউটারের পেছনের পোর্টে ইউএসবিটি ইনসার্ট করুন।"
  },
  {
    id: "black_mirror",
    title: "৩. Scrcpy উইন্ডো অন-কালো ও ব্ল্যাক হওয়া",
    symptom: "Scrcpy উইন্ডো ওপেন হয়েছে কিন্তু ডিসপ্লে পুরোপুরি কালো (সবুজ বা সাদা ফ্লিকার করে)।",
    reason: "ফোনের জিপিইউ এনকোডিং প্রসেস ক্র্যাশ করেছে অথবা ফোনের ডিসপ্লে প্রোটেক্টেড কন্টেন্ট (যেমন নেটফ্লিক্স বা ব্যাংকিং অ্যাপ) ওপেন আছে যা এডিবি স্ট্রিমিং ব্লক করছে।",
    commands: [
      "scrcpy --max-size 1024 --no-audio --crop 1080:1920:0:0",
      "scrcpy --video-codec=h264"
    ],
    solution: "১. কোডেক পরিবর্তন করুন --video-codec=h264 বা --video-codec=h265 দিয়ে।\n২. কোনো ব্যাংকিং অ্যাপ ব্যাকগ্রাউন্ডে থাকলে তা হোম বাটন প্রেস করে ক্লোজ করতে adb shell input keyevent 3 ব্যবহার করুন।"
  }
];

export const BRAND_RECOVERY_GUIDES: any[] = [
  {
    id: "samsung_dex",
    brand: "Samsung",
    title: "স্যামসাং ডেক্স এবং ইউএসবি হাব দিয়ে ব্লাইন্ড ডিসপ্লে রিকভারি",
    recoveryType: "Samsung DeX & USB OTG Keyboard",
    difficulty: "মাঝারি",
    summary: "স্যামসাং এর ফ্ল্যাগশিপ ফোনগুলোর স্ক্রিন সম্পূর্ণ ভেঙে কালো হয়ে গেলেও 'Samsung DeX' ব্যবহার করে কোনো অ্যাপ ছাড়াই পিসি বা ডাইরেক্ট মনিটরে পুরো মোবাইল স্ক্রিন মিররিং ও ডেটা ব্যাকআপ নেওয়া যায়।",
    prerequisites: [
      "ফোনে স্যামসাং ডেক্স মোড সাপোর্ট থাকতে হবে (S-сеriеѕ, Note-series, বা Fold)",
      "ইউএসবি ক্যাবল বা ওটিজি মাল্টিপোর্ট হাব প্রয়োজন"
    ],
    hardwareRequired: [
      "HDMI ক্যাবল এবং যেকোনো টিভি বা ডেক্সটপ মনিটর",
      "ইউএসবি মাউস ও কিবোর্ড",
      "১টি USB-C Multiport OTG Hub (যাতে HDMI ও USB পোর্ট আছে)"
    ],
    steps: [
      {
        number: 1,
        title: "হাব কানেকশন এবং পাওয়ার অন",
        desc: "ইউএসবি-সি পোর্ট হাবটি আপনার স্যামসাং ফোনের সাথে প্লাগ করুন। এরপর হাবের HDMI পোর্টের সাথে মনিটর/টিভি এবং USB পোর্টে মাউস বা কিবোর্ডটি কানেক্ট করুন।",
        keyAction: "হাব প্লাগ করুন"
      },
      {
        number: 2,
        title: "স্বয়ংক্রিয় ডেক্স এন্ট্রি ভেরিফিকেশন",
        desc: "হাব কানেক্ট করা মাত্র মনিটরে স্যামসাং ডেক্স লোগো ভেসে উঠবে। যদি স্ক্রিন লক থাকে তবে কিবোর্ডে Spaceবার চাপুন, এরপর আপনার পিন/পাসওয়ার্ড টাইপ করে Enter টিপুন। ব্লাইন্ড বা অন্ধ অবস্থাতেই ফোনটি আনলক হয়ে ডেক্স চালু হয়ে যাবে।",
        keyAction: "কিবোর্ডে Space → পিন নম্বর → Enter"
      },
      {
        number: 3,
        title: "স্মার্ট সুইচ দিয়ে ব্যাকআপ গ্রহণ",
        desc: "ডেক্স এর ভেতরের ড্রয়ার ওপেন করে 'Smart Switch' অ্যাপটি চালু করুন অথবা পিসিতে ক্যাবল কানেক্ট করে 'Smart Switch for PC' দিয়ে এক ক্লিকে আপনার সমস্ত মেসেজ, ছবি, কন্টাক্ট ও সেটিংস ব্যাকআপ ফাইল হিসেবে সেভ করুন।",
        keyAction: "ডেক্স স্ক্রিনে ডেটা ব্যাকআপ আইকন সিলেক্ট করুন"
      },
      {
        number: 4,
        title: "এডিবি অটো- অথরাইজেশন সেটিংস (বিকল্প)",
        desc: "যদি পিসির সাথে ক্যাবল যুক্ত করে Scrcpy চালাতে চান, তবে ডেক্স এর রানিং সেটিংস মডিউল এ সার্চ বক্সে গিয়ে 'USB Debugging' এ গিয়ে টার্ন অন করুন। ডেক্স স্ক্রিন থেকে মাউস দিয়ে সরাসরি পারমিশন ডায়ালগে 'Allow' এ ক্লিক করতে পারবেন।",
        command: "adb devices"
      }
    ]
  },
  {
    id: "xiaomi_bypass",
    brand: "Xiaomi",
    title: "শাওমি এডিবি সিকিউরিটি বাইপাস ও কাস্টম রিকভারি ফ্ল্যাশিং",
    recoveryType: "Xiaomi Fastboot & TWRP Recovery",
    difficulty: "কঠিন",
    summary: "শাওমি ডিভাইসে সাধারণত 'USB Debugging (Security Settings)' অন না থাকলে এডিবি কমান্ড দিয়ে টাচ বা ক্লিক কন্ট্রোল করা ব্লক করে দেয়। এই গাইডটিতে ফাস্টবুট বা TWRP মোড ব্যবহার করে এই প্রোটোকল বাইপাসের উপায় দেখানো হয়েছে।",
    prerequisites: [
      "ডিভাইসটির বুটলোডার আনলক থাকতে হবে (অথবা ফাস্টবুট মোডে যাওয়ার অনুমতি থাকতে হবে)",
      "পিসিতে Xiaomi ADB Drivers ইনস্টল থাকা আবশ্যক"
    ],
    hardwareRequired: [
      "পিসি ও একটি অরিজিনাল ইউএসবি ডেটা ক্যাবল",
      "ভলিউম ডাউন ও পাওয়ার বাটন ফাংশনাল হতে হবে"
    ],
    steps: [
      {
        number: 1,
        title: "ফাস্টবুট বা ডায়াগনস্টিক মোডে ডিভাইস বুট করা",
        desc: "ফোনটি সম্পূর্ণ বন্ধ করে ভলিউম ডাউন (-) এবং পাওয়ার বাটন একসাথে ৫ সেকেন্ড চেপে ধরে রাখুন। স্ক্রিনে 'FASTBOOT' লোগো বা ভাইব্রেশন টের পেলে পিসির সাথে প্লাগ করুন।",
        keyAction: "Vol Down + Power বাটন চেপে ধরুন",
        command: "fastboot devices"
      },
      {
        number: 2,
        title: "TWRP বা কাস্টম রিকভারি বুট করা",
        desc: "পিসির কমান্ড প্রম্পট থেকে সাময়িকভাবে একটি কাস্টম রিকভারি ইমেজ ফোনের র্যামে বুট করান। কাস্টম রিকভারিতে ডিফল্টভাবে ফোনের ভেতরের স্টোরেজ আনলক থাকে এবং এডিবি কোনো সিকিউরিটি পারমিশন ছাড়াই রুট অ্যাক্সেস পেয়ে যায়।",
        command: "fastboot boot twrp-recovery.img"
      },
      {
        number: 3,
        title: "ব্লাইন্ড ফাইল পুল বা ডেটা ক্লোনিং",
        desc: "ফোনটি রিকভারি মোডে অন হওয়ার পর পিসির সিএমডি থেকে নিচের কমান্ডটি দিয়ে ইন্টারনাল স্টোরেজের সমস্ত ছবি ও প্রয়োজনীয় ইউজার ফাইল এক ক্লিকে পিসিতে 'backup_folder' এ কপি নিয়ে নিন।",
        command: "adb pull /sdcard/ sdmc_backup/"
      },
      {
        number: 4,
        title: "এডিবি সিকিউরিটি বাইপাস সেটিংস আপডেট",
        desc: "যদি আপনি ওএস রানিং অবস্থাতেই স্ক্রিন মিরর করতে চান, তবে রিকভারি শেল ব্যবহার করে সরাসরি শাওমি ডেটাবেস ফাইলে সিকিউরিটি সেটিংস ভ্যালু আপডেট করে দিনঃ",
        command: "adb shell settings put global adb_notify_indicator 0 && adb shell settings put secure adb_user_consent_system_values 1"
      }
    ]
  },
  {
    id: "iphone_mirror",
    brand: "iPhone",
    title: "আইফোন ভয়েস-ওভার অ্যাসিস্টেন্ট ও এয়ারপ্লে মিররিং রিকভারি",
    recoveryType: "iPhone VoiceOver & AirPlay Broadcast",
    difficulty: "সহজ",
    summary: "আইফোনের স্ক্রিন কালো হয়ে গেলেও 'VoiceOver' ব্লুটুথ কিবোর্ড অথবা সিরি (Siri) স্ক্রিন রিডার ব্যবহার করে এয়ারপ্লে (AirPlay) প্রোটোকলের মাধ্যমে অ্যাপল টিভি বা স্মার্ট টিভিতে লাইভ ডিসপ্লে সিঙ্ক নেওয়া সম্ভব।",
    prerequisites: [
      "সিরি অ্যাক্টিভ থাকতে হবে অথবা ফোনের পাওয়ার কি ওকে থাকতে হবে",
      "একটি অ্যাপল টিভি, ম্যাক অথবা এয়ারপ্লে সমর্থিত স্মার্ট টিভি থাকতে হবে"
    ],
    hardwareRequired: [
      "অ্যাক্টিভ সিরি কানেকশন",
      "পিসি বা ম্যাক (iTunes / Finder ব্যাকআপের জন্য)"
    ],
    steps: [
      {
        number: 1,
        title: "সিরির মাধ্যমে ভয়েস-ওভার ট্র্যাকিং অন করা",
        desc: "আইফোনের পাওয়ার বাটন চেপে সিরি ওয়েক করুন এবং বলুন: 'Turn on VoiceOver'। ভয়েসওভার চালু হলে প্রতিটি টাচ এবং বাটন ক্লিকের বিপরীতে ফোনটি বাংলায়/ইংরেজিতে সাউন্ড করে বলে দেবে স্ক্রিনে বর্তমানে কী ভেসে আছে।",
        keyAction: "Hi Siri! Turn on VoiceOver"
      },
      {
        number: 2,
        title: "এয়ারপ্লে সংযোগ স্থাপন (AirPlay Projection)",
        desc: "কন্ট্রোল সেন্টারটি ব্লাইন্ড সোয়াইপ দিয়ে নামিয়ে এয়ারপ্লে বা স্ক্রিন মিররিং সিলেক্ট করুন। ভয়েসওভারের অডিও শুনে কিবোর্ড বা টাচ দিয়ে মনিটর/টিভির নাম সিলেক্ট করে কানেক্ট করুন। পুরো আইফোন ডিসপ্লে পিসি বা টিভিতে ভেসে উঠবে!",
        keyAction: "AirPlay Connect"
      },
      {
        number: 3,
        title: "আইটিউনস বা ক্লাউড ব্যাকআপ রিকোয়েস্ট",
        desc: "যদি আপনি পুরো আইফোনের ফুল ব্যাকআপ পিসিতে নিতে চান, তবে ফোনটি ইউএসবি ক্যাবল দিয়ে পিসির উইন্ডোজ আইটিউনস বা ম্যাক ফাইন্ডারের সাথে প্লাগ ইন করুন। 'Trust This Computer' এর পপ-আপ মেসেজে ব্লাইন্ড ডাবল ট্যাপ করে পাসকোড টাইপ করে ট্রাস্ট অন করুন এবং 'Back Up Now' সিলেক্ট করুন।",
        keyAction: "Trust Computer অ্যান্ড কিপ ব্যাকআপ"
      }
    ]
  },
  {
    id: "pixel_backup",
    brand: "Pixel",
    title: "গুগল পিক্সেল এবং স্টক অ্যান্ড্রয়েডে গুগল ক্লাউড ডেটা রিকোভারিগাইড",
    recoveryType: "Pixel Cloud Restorations",
    difficulty: "সহজ",
    summary: "গুগল পিক্সেল বা মটোরোলা স্টক ডিভাইসে ডিসপ্লে নষ্ট হলে গুগল ড্রাইভ ক্লাউড ব্যাকআপ প্রোটোকল ব্যবহার করে নতুন আরেকটি ফোনে হুবহু অ্যাপ ডেটা সহ সমস্ত কনফিগারেশন রিস্টোর করা যায় অতি সহজে।",
    prerequisites: [
      "অ্যান্ড্রয়েডে ব্যাকআপ অটোমেটিক অন ছিল (সাধারনত ট্র্যাকিং মডিউলে জিমেইল অ্যাড করলেই অন হয়ে থাকে)",
      "নতুন অ্যান্ড্রয়েড বা ওএস ডিভাইস"
    ],
    hardwareRequired: [
      "আপনার পুরানো পিক্সেল ফোনের জিমেইল এবং পাসওয়ার্ড",
      "একটি সচল ওয়াইফাই কানেকশন"
    ],
    steps: [
      {
        number: 1,
        title: "গুগল ড্রাইভ ড্যাশবোর্ড থেকে ব্যাকআপ স্ট্যাটাস চেক",
        desc: "যেকোনো কম্পিউটার থেকে drive.google.com এ যান, বামদিকের মেনু থেকে 'Backups' বাটনে ক্লিক করে ভেরিফাই করুন আপনার পিক্সেল ডিভাইসের সাম্প্রতিক ব্যাকআপটি ক্লাউডে সংরক্ষিত আছে কিনা।",
        keyAction: "গুগল ড্রাইভ ব্যাকআপ ড্যাশবোর্ড চেক"
      },
      {
        number: 2,
        title: "নতুন ফোনে ওয়াইফাই দিয়ে সাইন-ইন",
        desc: "নতুন যেকোনো অ্যান্ড্রয়েড ফোন প্রথম চালুর সময় সেটআপ উইজার্ডে আপনার পূর্বের জিমেইল অ্যাকাউন্টটি অ্যাকাউন্টে কনেক্ট করুন। ওয়াইফাই পাসওয়ার্ড সঠিকভাবে প্রদান করুন।",
        keyAction: "সাইন-ইন করুন"
      },
      {
        number: 3,
        title: "ক্লাউড ডেটা ব্লাইন্ড সিঙ্ক্রোনাইজেশন",
        desc: "সিস্টেম স্বয়ংক্রিয়ভাবে ক্লাউড ব্যাকআপ ফাইলটি ডিটেক্ট করবে। 'Restore from Cloud' সিলেক্ট করুন। অ্যাপস, কন্টাক্টস, কল লগ, মেসেজ ও ওয়ালপেপার সহ সবকিছু নতুন ফোনে চলে আসতে শুরু করবে।",
        keyAction: "'Restore All Data' বাটনে ক্লিক"
      }
    ]
  }
];

