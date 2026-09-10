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

export async function POST(req: Request) {
  try {
    const { qaPairs, roles = ["Software Engineer", "Data Analyst", "Product Manager"] } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("No Gemini API key, using fallback score.");
      return NextResponse.json(FALLBACK_SCORE);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', generationConfig: { responseMimeType: "application/json" } });

    const prompt = `Score these answers 0–100 per skill_tag: ${JSON.stringify(qaPairs)}. Compare against typical requirements for these roles: ${roles.join(', ')}. Return strict JSON: {"skill_profile": {"skillName": score}, "gap_analysis": {"roleName": ["missing_skill_1", "missing_skill_2"]}}.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Score API Error:", error);
    return NextResponse.json(FALLBACK_SCORE);
  }
}
