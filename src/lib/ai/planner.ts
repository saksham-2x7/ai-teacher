import { GoogleGenerativeAI } from '@google/generative-ai';

type LessonPlanParams = {
  topic?: string;
  materialId?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  timeMinutes: number;
  language: string;
};

export async function generateLessonPlan(params: LessonPlanParams) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing Gemini API Key');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `You are an expert AI teacher. Create a structured lesson plan for a ${params.level} student on the topic: "${params.topic || 'General Topic'}".
The lesson should take approximately ${params.timeMinutes} minutes. The language of instruction should be ${params.language}.
Output the lesson plan in strict JSON format matching this schema (DO NOT include markdown block markers):
{
  "title": "String",
  "introduction": "String",
  "sections": [
    { "title": "String", "explanation": "String", "visuals": "String (e.g., diagram, code)", "question": "String" }
  ],
  "assessment": [
    { "question": "String", "options": ["String"], "answer": "String" }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    // Remove markdown json markers if present
    const cleanJson = result.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return cleanJson;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate lesson plan');
  }
}
