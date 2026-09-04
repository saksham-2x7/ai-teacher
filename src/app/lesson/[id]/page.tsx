"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessage } from "@/app/actions/chat";

import ThreeAvatar from "@/components/ThreeAvatar";

export default function LessonPage({ params }: { params: { id: string } }) {
// ... existing states
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: "Hello! I'm your AI Teacher. Are you ready to begin our lesson?" }
  ]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Single Audio instance created once to bypass Safari Autoplay restrictions
  const [audioPlayer] = useState(() => typeof window !== 'undefined' ? new Audio() : null);
  const audioQueueRef = useRef<string[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const playNextAudio = () => {
    if (!audioPlayer) return;
    if (audioQueueRef.current.length === 0) {
      setIsSpeaking(false);
      return;
    }
    
    const nextUrl = audioQueueRef.current.shift()!;
    audioPlayer.src = nextUrl;
    
    audioPlayer.onplay = () => setIsSpeaking(true);
    audioPlayer.onended = () => {
      playNextAudio(); // Recursive call for next chunk
    };
    audioPlayer.onerror = () => {
      setIsSpeaking(false);
      audioQueueRef.current = [];
    };
    
    audioPlayer.play().catch(e => {
      console.error("Audio blocked by Safari:", e);
      setIsSpeaking(false);
    });
  };

  const playAudio = (urls: string[]) => {
    if (!urls || urls.length === 0 || !audioPlayer) return;
    
    audioQueueRef.current = [...urls];
    playNextAudio();
  };

  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setIsSpeaking(false);
      audioQueueRef.current = [];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Unlock Audio Context immediately on user click (fixes Safari NotAllowedError)
    if (audioPlayer) {
      audioPlayer.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audioPlayer.play().catch(() => {});
    }

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    const response = await sendMessage(userMsg, "The user wants to learn and explore topics interactively.");
    setMessages(prev => [...prev, { role: 'ai', text: response.text || '' }]);
    setLoading(false);
    
    if (response.audioUrls && response.audioUrls.length > 0) {
      playAudio(response.audioUrls);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="flex w-full h-full max-w-[1600px] mx-auto relative z-10 p-4 gap-4">
        
        {/* Main 3D Stage */}
        <div className="flex-1 flex flex-col relative rounded-[32px] border border-white/[0.05] bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl shadow-black/50">
          
          <div className="absolute top-6 left-8 z-20 pointer-events-none">
            <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">AI Educator</h1>
            <p className="text-sm text-zinc-500 font-medium tracking-wide uppercase mt-1">Live Session Active</p>
          </div>

          <div className="absolute top-6 right-8 z-20 flex space-x-3">
             <Button variant="outline" size="sm" onClick={stopAudio} className="rounded-full bg-white/[0.03] border-white/10 hover:bg-white/10 backdrop-blur-md">
               <span className={`w-2 h-2 rounded-sm mr-2 ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} /> 
               {isSpeaking ? 'Speaking...' : 'Mute'}
             </Button>
          </div>

          {/* 3D Local Canvas */}
          <div className="flex-1 relative w-full h-full">
            <ThreeAvatar isSpeaking={isSpeaking} />
            
            {/* Visualizer overlay when speaking */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 flex space-x-1 pointer-events-none"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-blue-500 rounded-full"
                      animate={{ height: [10, 30, 10] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1, ease: "easeInOut" }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cinematic Subtitles */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center px-12 z-20">
            <motion.div 
              key={messages.length}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="max-w-3xl py-4 px-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-center shadow-2xl"
            >
              <p className="text-xl md:text-2xl font-medium leading-relaxed bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                {messages.length > 0 && messages[messages.length - 1].role === 'ai' 
                  ? messages[messages.length - 1].text 
                  : "..."}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Side Panel: Context & Chat */}
        <div className="w-[480px] flex flex-col gap-4">
          
          {/* Visual Context Box */}
          <div className="h-64 rounded-[32px] border border-white/[0.05] bg-white/[0.01] backdrop-blur-xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" /> Context View
            </h3>
            <div className="flex-1 rounded-2xl border border-white/[0.05] bg-black/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                {/* Decorative Tech Grid */}
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              <p className="text-zinc-500 text-sm italic z-10">Real-time visualizations will appear here</p>
            </div>
          </div>

          {/* Interactive Chat */}
          <div className="flex-1 flex flex-col rounded-[32px] border border-white/[0.05] bg-white/[0.01] backdrop-blur-xl overflow-hidden relative">
            <div className="p-6 border-b border-white/[0.05] bg-white/[0.01]">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" /> Live Dialogue
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${m.role === 'user' ? "items-end" : "items-start"}`}
                >
                  <div className={`max-w-[85%] rounded-3xl px-6 py-4 ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] rounded-br-sm' 
                      : 'bg-white/5 border border-white/10 text-zinc-200 rounded-bl-sm'
                  }`}>
                    <p className="text-[15px] leading-relaxed">{m.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                  <div className="bg-white/5 border border-white/10 rounded-3xl rounded-bl-sm px-6 py-5 flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-black/20">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl pl-5 pr-14 py-5 text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all shadow-inner"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="absolute right-3 top-3 bottom-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white h-auto w-10 disabled:opacity-30 transition-all shadow-md"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.14645 2.14645C7.34171 1.95118 7.65829 1.95118 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
