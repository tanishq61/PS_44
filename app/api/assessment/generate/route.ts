import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_QUESTIONS = [
  { question: "Explain the difference between a compiled and an interpreted language.", type: "short-answer", skill_tag: "Computer Science Fundamentals" },
  { question: "Which data structure uses LIFO (Last In First Out)?", type: "MCQ", options: ["Queue", "Stack", "Tree", "Graph"], skill_tag: "Data Structures" },
  { question: "What does the 'S' in SOLID principles stand for?", type: "MCQ", options: ["Single Responsibility", "Static Typing", "Synchronous Processing", "Scalability"], skill_tag: "Software Engineering" },
  { question: "How do you handle a situation where a team member is consistently missing deadlines?", type: "short-answer", skill_tag: "Team Collaboration" },
  { question: "Which of the following is a NoSQL database?", type: "MCQ", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], skill_tag: "Database Management" },
  { question: "Describe a time you had to learn a new technology quickly. How did you approach it?", type: "short-answer", skill_tag: "Adaptability" },
  { question: "What is the primary purpose of version control systems like Git?", type: "MCQ", options: ["To deploy code", "To track changes and collaborate", "To compile code", "To run tests"], skill_tag: "Version Control" },
  { question: "How would you explain a complex technical concept to a non-technical stakeholder?", type: "short-answer", skill_tag: "Communication Skills" }
];

export async function POST(req: Request) {
  try {
    const { field } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log("No Gemini API key, using fallback.");
      return NextResponse.json(FALLBACK_QUESTIONS);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', generationConfig: { responseMimeType: "application/json" } });

    const prompt = `Generate 8 skill-assessment questions for a student interested in the field of '${field || 'Software Engineering'}'. 5 MCQ testing applied understanding (not trivia), 3 short-answer scenario questions testing soft skills and problem solving. Tag each with the skill it tests. Return strict JSON: [{"question": "...", "type": "MCQ", "options": ["...", "..."], "skill_tag": "..."}]. Make sure the type is either 'MCQ' or 'short-answer'.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(FALLBACK_QUESTIONS);
  }
}
