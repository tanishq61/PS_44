import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_SCORE = {
  skill_profile: {
    "Computer Science Fundamentals": 85,
    "Data Structures": 75,
    "Software Engineering": 80,
    "Team Collaboration": 90,
    "Database Management": 70,
    "Adaptability": 85,
    "Version Control": 95,
    "Communication Skills": 88
  },
  gap_analysis: {
    "Software Engineer": ["Advanced System Design", "Cloud Infrastructure"],
    "Data Analyst": ["Statistical Modeling", "Data Visualization Tools"]
  }
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

import { z } from 'zod';

const ScoreSchema = z.object({
  qaPairs: z.array(z.object({
    question: z.string(),
    answer: z.string().optional(),
    correctOption: z.string().optional()
  })).min(1).max(20),
  roles: z.array(z.string()).max(10).optional()
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const result = ScoreSchema.safeParse(json);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    
    const { qaPairs, roles = ["Software Engineer", "Data Analyst", "Product Manager"] } = result.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("No Gemini API key, using fallback score.");
      return NextResponse.json(FALLBACK_SCORE);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite', 
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.3
      } 
    });

    const prompt = `Evaluate the student's assessment answers and score each of these 8 predefined skills from 0 to 100:
"Version Control", "Team Collaboration", "Communication Skills", "Adaptability", "Computer Science Fundamentals", "Software Engineering", "Data Structures", "Database Management".
For any skill not directly tested, calculate a realistic baseline score (65-80) based on their overall technical and problem-solving level.
Student responses:
${JSON.stringify(qaPairs)}

Target roles for gap analysis: ${roles.join(', ')}.
Identify 2-3 genuine skill gaps per role based on their performance.

Return strict JSON format:
{
  "skill_profile": {
    "Version Control": 85,
    "Team Collaboration": 80,
    "Communication Skills": 75,
    "Adaptability": 70,
    "Computer Science Fundamentals": 75,
    "Software Engineering": 80,
    "Data Structures": 70,
    "Database Management": 85
  },
  "gap_analysis": {
    "Software Engineer": ["Skill Gap 1", "Skill Gap 2"],
    "Data Analyst": ["Skill Gap 1", "Skill Gap 2"],
    "Product Manager": ["Skill Gap 1", "Skill Gap 2"]
  }
}`;

    const text = await generateWithRetry(model, prompt, 2, 1000);
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Score API Error:", error);
    return NextResponse.json(FALLBACK_SCORE);
  }
}
