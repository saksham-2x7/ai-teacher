'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as googleTTS from 'google-tts-api';

export async function sendMessage(message: string, context: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    let text = `That's an interesting thought! Let's explore that together.`;

    if (apiKey && apiKey !== 'your_venice_api_key_here') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' });

      const prompt = `You are a helpful, human-like AI teacher. Evaluate the student's answer for misconceptions based on this context: "${context}". 
      Keep your response concise, conversational, and encouraging (1-3 sentences maximum). Make it sound natural to be spoken aloud.
      Student says: "${message}"`;

      const result = await model.generateContent(prompt);
      text = result.response.text();
    } else {
      // Mock response for local dev without key
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Chunk the text into sentences to respect 200 char limits per TTS request
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Fallback if a single sentence is still somehow > 200 chars (extremely rare)
    const chunks: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length <= 190) {
        chunks.push(sentence.trim());
      } else {
        const words = sentence.split(' ');
        let currentChunk = "";
        for (const word of words) {
          if (currentChunk.length + word.length < 190) {
            currentChunk += (currentChunk ? " " : "") + word;
          } else {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());
      }
    }

    const audioUrls = chunks.filter(c => c.length > 0).map(chunk => 
      `/api/tts?text=${encodeURIComponent(chunk)}`
    );

    return {
      text,
      audioUrls,
    };
  } catch (error: any) {
    console.error("Chat error:", error);
    return { text: `Error: ${error.message || "Something went wrong."}`, audioUrls: [] };
  }
}
