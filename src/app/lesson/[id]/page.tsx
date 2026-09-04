"use client";

import { useState, useRef, useEffect } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { sendMessage } from "@/app/actions/chat";

export default function LessonPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: "Can you explain this concept in your own words?" }
  ]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    
    audio.play().catch(e => console.error("Audio play blocked by browser:", e));
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
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    const response = await sendMessage(userMsg, "The current lesson concept");
    setMessages(prev => [...prev, { role: 'ai', text: response.text || '' }]);
    setLoading(false);
    
    if (response.audioUrl) {
      playAudio(response.audioUrl);
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-white">
      {/* AI Avatar / Video Section */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center border-r border-zinc-800 relative">
        <div className="w-full max-w-lg aspect-video bg-zinc-900 rounded-lg overflow-hidden relative shadow-xl">
          {/* Mock Video Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div 
                className="h-32 w-32 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-zinc-700"
                animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: isSpeaking ? Infinity : 0, duration: 1, ease: "easeInOut" }}
              >
                <span>AI</span>
              </motion.div>
              <p className="text-zinc-400">{isSpeaking ? "AI Teacher is speaking..." : "AI Teacher is listening..."}</p>
            </div>
          </div>
          {/* Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button variant="secondary" size="sm" onClick={stopAudio}>Stop Audio</Button>
          </div>
        </div>
        
        {/* Subtitles */}
        <div className="mt-8 max-w-2xl text-center text-lg leading-relaxed text-zinc-300">
          {messages.length > 0 && messages[messages.length - 1].role === 'ai' 
            ? messages[messages.length - 1].text 
            : "..."}
        </div>
      </div>

      {/* Visual Explanations & Interaction Panel */}
      <div className="w-[450px] p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Visual Explanations</h2>
        
        <Card className="flex-1 bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 h-full flex flex-col justify-center items-center">
             <div className="text-zinc-500 italic border border-dashed border-zinc-700 w-full h-48 flex items-center justify-center rounded">
               [ Interactive Diagram Appears Here ]
             </div>
          </CardContent>
        </Card>

        {/* Chat / Interaction */}
        <div className="mt-6 flex flex-col h-72">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? "text-right" : "text-left"}>
                <p className={`text-sm font-semibold ${m.role === 'user' ? 'text-green-400' : 'text-blue-400'}`}>
                  {m.role === 'user' ? 'You' : 'AI Teacher'}
                </p>
                <p className="text-sm">{m.text}</p>
              </div>
            ))}
            {loading && <div className="text-sm text-zinc-500 italic">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex space-x-2">
            <input 
              type="text" 
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your answer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
