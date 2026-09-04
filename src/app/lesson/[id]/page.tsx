'use client';

import { useState, useRef, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { sendMessage } from '@/app/actions/chat';

export default function LessonPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Can you explain this concept in your own words?' },
  ]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle playing audio from URL
  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.onerror = () => setIsSpeaking(false);

    audio.play().catch((e) => console.error('Audio play blocked by browser:', e));
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const response = await sendMessage(userMsg, 'The current lesson concept');
    setMessages((prev) => [...prev, { role: 'ai', text: response.text || '' }]);
    setLoading(false);

    if (response.audioUrl) {
      playAudio(response.audioUrl);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] font-sans text-white">
      {/* AI Avatar / Video Section */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        <div className="relative flex aspect-[4/3] w-full max-w-2xl items-center justify-center overflow-hidden rounded-3xl border border-white/[0.05] bg-black/40 shadow-[0_0_100px_rgba(120,119,198,0.05)] backdrop-blur-3xl">
          {/* Advanced Siri-style Orb */}
          <div className="relative flex items-center justify-center">
            {/* Outer Glow */}
            <motion.div
              className="absolute h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]"
              animate={{ scale: isSpeaking ? [1, 1.5, 1] : 1, opacity: isSpeaking ? 1 : 0.3 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            {/* Inner Waves */}
            <motion.div
              className="absolute h-40 w-40 rounded-full bg-gradient-to-tr from-violet-600/40 to-blue-500/40 blur-xl"
              animate={{ rotate: 360, scale: isSpeaking ? [1, 1.2, 1] : 1 }}
              transition={{
                rotate: { repeat: Infinity, duration: 8, ease: 'linear' },
                scale: { repeat: Infinity, duration: 1, ease: 'easeInOut' },
              }}
            />
            {/* Core */}
            <motion.div
              className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_40px_rgba(99,102,241,0.4)]"
              animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-full bg-black/10 backdrop-blur-sm" />
              <span className="relative z-10 text-sm font-semibold tracking-wider text-white drop-shadow-md">
                AI
              </span>
            </motion.div>
          </div>

          <p className="absolute bottom-10 text-sm font-medium tracking-widest text-white/40 uppercase">
            {isSpeaking ? 'Synthesizing response...' : 'Awaiting input...'}
          </p>

          {/* Controls */}
          <div className="absolute right-6 bottom-6 flex justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={stopAudio}
              className="rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10"
            >
              <span className="mr-2 h-2 w-2 rounded-sm bg-red-400" /> Stop Audio
            </Button>
          </div>
        </div>

        {/* Subtitles */}
        <div className="mt-12 max-w-3xl text-center">
          <motion.p
            key={messages.length}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-2xl leading-relaxed font-medium text-transparent"
          >
            {messages.length > 0 && messages[messages.length - 1].role === 'ai'
              ? `"${messages[messages.length - 1].text}"`
              : '...'}
          </motion.p>
        </div>
      </div>

      {/* Visual Explanations & Interaction Panel */}
      <div className="z-10 flex w-[450px] flex-col border-l border-white/[0.05] bg-black/20 p-6 backdrop-blur-xl">
        <h2 className="mb-6 flex items-center text-xl font-semibold">
          <span className="mr-3 h-6 w-1.5 rounded-full bg-blue-500" />
          Visual Context
        </h2>

        <div className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <p className="z-10 text-sm text-white/30 italic">Diagram generation paused</p>
        </div>

        {/* Chat / Interaction */}
        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <h2 className="mb-4 text-sm font-medium tracking-widest text-white/50 uppercase">
            Live Session
          </h2>
          <div className="custom-scrollbar mb-4 flex-1 space-y-6 overflow-y-auto pr-2">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)]'
                      : 'border border-white/10 bg-white/5 text-zinc-200'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{m.text}</p>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start"
              >
                <div className="flex space-x-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="relative mt-auto">
            <input
              type="text"
              className="w-full rounded-full border border-white/[0.08] bg-white/[0.03] py-4 pr-14 pl-5 text-sm text-white placeholder-white/30 transition-all focus:border-white/20 focus:bg-white/[0.05] focus:outline-none"
              placeholder="Ask a question or explain..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="absolute top-2 right-2 bottom-2 h-auto w-10 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              ↑
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
