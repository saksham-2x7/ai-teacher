"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessage } from "@/app/actions/chat";
import ThreeAvatar from "@/components/ThreeAvatar";

const CONTRIBUTORS = [
  { username: "saksham-2x7", url: "https://github.com/saksham-2x7" },
  { username: "Kaustubh-Negi-01", url: "https://github.com/Kaustubh-Negi-01" },
  { username: "AsteroidHH", url: "https://github.com/AsteroidHH" },
];

export default function LessonPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: "Hello! I'm your AI Teacher. Are you ready to begin our lesson?" }
  ]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const playNextAudio = () => {
    if (audioQueueRef.current.length === 0) {
      setIsSpeaking(false);
      return;
    }
    const nextUrl = audioQueueRef.current.shift()!;
    const audio = new Audio(nextUrl);
    audioRef.current = audio;
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => playNextAudio();
    audio.onerror = () => {
      setIsSpeaking(false);
      audioQueueRef.current = [];
    };
    audio.play().catch(() => setIsSpeaking(false));
  };

  const playAudio = (urls: string[]) => {
    if (!urls || urls.length === 0 || isMuted) return;
    audioQueueRef.current = [...urls];
    playNextAudio();
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const nowMuted = !prev;
      if (nowMuted && audioRef.current) {
        audioRef.current.pause();
        audioQueueRef.current = [];
        setIsSpeaking(false);
      }
      return nowMuted;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    const response = await sendMessage(userMsg, "The user wants to learn and explore topics interactively.");
    setMessages(prev => [...prev, { role: 'ai', text: response.text || '' }]);
    setLoading(false);

    if (!isMuted && response.audioUrls && response.audioUrls.length > 0) {
      playAudio(response.audioUrls);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="flex w-full h-full max-w-[1600px] mx-auto relative z-10 p-4 gap-4">

        {/* Main 3D Stage */}
        <div className="flex-1 flex flex-col relative rounded-[32px] border border-white/[0.05] bg-white/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl shadow-black/50">

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 pt-6">
            <div className="pointer-events-none">
              <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">AI Educator</h1>
              <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase mt-1">Live Session Active</p>
            </div>
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium backdrop-blur-md transition-all ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                  : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-400' : isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-zinc-500'}`} />
              {isMuted ? 'Unmute' : isSpeaking ? 'Speaking...' : 'Mute'}
            </button>
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 relative w-full h-full">
            <ThreeAvatar isSpeaking={isSpeaking && !isMuted} />

            <AnimatePresence>
              {isSpeaking && !isMuted && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 flex space-x-1 pointer-events-none"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div key={i} className="w-1.5 bg-blue-500 rounded-full"
                      animate={{ height: [10, 30, 10] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cinematic Subtitles */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center px-12 z-20 pointer-events-none">
            <motion.div
              key={messages.length}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="max-w-3xl py-4 px-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-center"
            >
              <p className="text-xl md:text-2xl font-medium leading-relaxed bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                {messages.length > 0 && messages[messages.length - 1].role === 'ai'
                  ? messages[messages.length - 1].text
                  : "..."}
              </p>
            </motion.div>
          </div>

          {/* Contributors Footer */}
          <div className="absolute bottom-4 left-8 z-20 flex items-center gap-3">
            <span className="text-xs text-zinc-600 uppercase tracking-widest">Built by</span>
            <div className="flex -space-x-2">
              {CONTRIBUTORS.map((c) => (
                <a
                  key={c.username}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={c.username}
                  className="group relative"
                >
                  <img
                    src={`https://github.com/${c.username}.png?size=40`}
                    alt={c.username}
                    className="w-8 h-8 rounded-full border-2 border-[#030303] transition-transform group-hover:-translate-y-1"
                  />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-xs bg-black/80 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    @{c.username}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-[480px] flex flex-col gap-4">

          {/* Context Box */}
          <div className="h-56 rounded-[32px] border border-white/[0.05] bg-white/[0.01] backdrop-blur-xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" /> Context View
            </h3>
            <div className="flex-1 rounded-2xl border border-white/[0.05] bg-black/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                  </pattern></defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              <p className="text-zinc-600 text-sm italic z-10">Real-time visualizations will appear here</p>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col rounded-[32px] border border-white/[0.05] bg-white/[0.01] backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.05]">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" /> Live Dialogue
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${m.role === 'user' ? "items-end" : "items-start"}`}
                >
                  <div className={`max-w-[85%] rounded-3xl px-5 py-3.5 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white/5 border border-white/10 text-zinc-200 rounded-bl-sm'
                  }`}>
                    <p className="text-[14px] leading-relaxed">{m.text}</p>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                  <div className="bg-white/5 border border-white/10 rounded-3xl rounded-bl-sm px-6 py-4 flex space-x-1.5">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/[0.03]">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl pl-5 pr-14 py-4 text-[14px] text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 flex items-center justify-center transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                    <path d="M7.14645 2.14645C7.34171 1.95118 7.65829 1.95118 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
