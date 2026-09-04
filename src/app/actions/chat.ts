'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as googleTTS from 'google-tts-api';

export async function sendMessage(message: string, context: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    let text = `That's an interesting thought! Let's explore that together.`;

    if (apiKey && apiKey !== 'your_venice_api_key_here') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a helpful, human-like AI teacher. Evaluate the student's answer for misconceptions based on this context: "${context}". 
      Keep your response concise, conversational, and encouraging (1-3 sentences maximum). Make it sound natural to be spoken aloud.
      Student says: "${message}"`;

      const result = await model.generateContent(prompt);
      text = result.response.text();
    } else {
      // Mock response for local dev without key
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Generate Audio URL using google-tts-api
    const audioUrl = googleTTS.getAudioUrl(text, {
      lang: 'en-US',
      slow: false,
      host: 'https://translate.google.com',
    });

    return {
      text,
      audioUrl,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      text: "I'm sorry, I'm having trouble thinking right now. Let's try again.",
      audioUrl: null,
    };
  }
}
