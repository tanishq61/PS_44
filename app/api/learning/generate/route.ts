import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_PATH = {
  learning_path: [
    {
      title: "Core Fundamentals Crash Course",
      description: "Focus on understanding the underlying concepts of your chosen domain.",
      duration: "2 Weeks",
      type: "Concept"
    },
    {
      title: "Practical Hands-on Project",
      description: "Apply your newly acquired knowledge to build a real-world project.",
      duration: "3 Weeks",
      type: "Application"
    },
    {
      title: "Advanced System Design & Trade-offs",
      description: "Learn how to architect solutions at scale and understand the pros and cons.",
      duration: "2 Weeks",
      type: "Architecture"
    }
  ]
};

async function generateWithRetry(model: any, prompt: string, retries = 3, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("All retries failed");
}

export async function POST(req: Request) {
  try {
    const { gaps } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log("No Gemini API key, using fallback learning path.");
      return NextResponse.json(FALLBACK_PATH);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite', 
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.5
      } 
    });

    const prompt = `Generate a personalized learning path consisting of 3 to 5 logical steps to help a student overcome the following skill gaps: ${gaps.join(', ')}. 
Return strict JSON in this format: 
{"learning_path": [{"title": "Step Title", "description": "Actionable description of what to do/learn", "duration": "Estimated time (e.g. 2 Weeks)", "type": "Theory/Project/Tool"}]}`;

    const text = await generateWithRetry(model, prompt, 2, 1000);
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(FALLBACK_PATH);
  }
}
