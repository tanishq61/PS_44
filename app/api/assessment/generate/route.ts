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
    const { field } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log("No Gemini API key, using fallback.");
      return NextResponse.json(FALLBACK_QUESTIONS);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite', 
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.95
      } 
    });

    const sessionSeed = Math.random().toString(36).substring(2, 9) + Date.now();
    const skills = [
      "Version Control", 
      "Team Collaboration", 
      "Communication Skills", 
      "Adaptability", 
      "Computer Science Fundamentals", 
      "Software Engineering", 
      "Data Structures", 
      "Database Management"
    ];

    // Pick a random skill to be the short-answer scenario question
    const scenarioSkill = skills[Math.floor(Math.random() * skills.length)];
    const mcqSkills = skills.filter(s => s !== scenarioSkill);

    const prompt = `You are an expert technical interviewer. Generate exactly 8 fresh, creative, and non-repeating skill-assessment questions for a candidate in '${field || 'Software Engineering'}'.
Random Session Seed: ${sessionSeed}

Requirements:
- Never repeat standard textbook questions. Use real-world scenarios, code review puzzles, architecture trade-offs, and practical dilemmas.
- Exactly 7 Multiple Choice Questions (type: "MCQ") with 4 plausible options each. Each MCQ must map to one of these skills: ${JSON.stringify(mcqSkills)}.
- Exactly 1 short-answer scenario question (type: "short-answer") testing problem solving or soft skills, mapped to: "${scenarioSkill}".
- Ensure the questions appear in a randomized order.

Return strict JSON array:
[
  {"question": "...", "type": "MCQ", "options": ["...", "...", "...", "..."], "skill_tag": "..."},
  {"question": "...", "type": "short-answer", "skill_tag": "..."}
]`;

    const text = await generateWithRetry(model, prompt, 2, 1000);
    const parsed = JSON.parse(text);

    // Shuffle array of questions and shuffle MCQ options (Fisher-Yates)
    function shuffle<T>(array: T[]): T[] {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    const randomized = shuffle(parsed).map((item: any) => {
      if (item.type === 'MCQ' && Array.isArray(item.options)) {
        return { ...item, options: shuffle(item.options) };
      }
      return item;
    });
    
    return NextResponse.json(randomized);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(FALLBACK_QUESTIONS);
  }
}
