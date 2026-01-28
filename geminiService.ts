
import { GoogleGenAI } from "@google/genai";
import { SyllabusResult, GeneratedContent, DifficultyLevel, AppLanguage } from "./types";

const API_KEY = process.env.API_KEY || '';

const getDifficultyDescription = (level: DifficultyLevel, lang: AppLanguage) => {
  const descriptions = {
    uz: {
      beginner: "Boshlang'ich daraja (asosiy tushunchalar, sodda tushuntirishlar)",
      intermediate: "O'rta daraja (chuqurroq tahlil, amaliy qo'llanilishi)",
      advanced: "Yuqori daraja (murakkab nazariyalar, ilmiy tadqiqot elementlari, professional darajadagi tahlil)"
    },
    en: {
      beginner: "Beginner level (basic concepts, simple explanations)",
      intermediate: "Intermediate level (deeper analysis, practical application)",
      advanced: "Advanced level (complex theories, scientific research elements, professional analysis)"
    },
    ru: {
      beginner: "Начальный уровень (базовые понятия, простые объяснения)",
      intermediate: "Средний уровень (более глубокий анализ, практическое применение)",
      advanced: "Продвинутый уровень (сложные теории, элементы научных исследований, профессиональный анализ)"
    }
  };
  return descriptions[lang][level] || descriptions[lang].intermediate;
};

export const generateSyllabus = async (subject: string, topicCount: number, difficulty: DifficultyLevel, lang: AppLanguage): Promise<SyllabusResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Top universities (like MIT, Harvard, Stanford, Oxford) are known for their high-quality syllabuses.
    Create a detailed educational syllabus for the subject: "${subject}".
    Target Difficulty Level: ${getDifficultyDescription(difficulty, lang)}.
    The syllabus must contain exactly ${topicCount} topics/weeks.
    
    For each topic, provide:
    1. A clear Title.
    2. A short description of what is covered, tailored to the ${difficulty} level.
    
    CRITICAL: Use the googleSearch tool to find real-world syllabuses from top universities and reference them.
    Provide the source links as 'groundingMetadata'.
    
    The final output should be strictly JSON format matching this structure:
    {
      "subject": "${subject}",
      "difficulty": "${difficulty}",
      "topics": [
        { "id": "1", "title": "Topic 1", "description": "...", "week": 1 },
        ...
      ],
      "sources": [
        { "university": "MIT", "url": "...", "title": "Syllabus Name" }
      ]
    }
    Output language: ${lang === 'uz' ? 'Uzbek' : lang === 'ru' ? 'Russian' : 'English'}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    },
  });

  try {
    const data = JSON.parse(response.text || '{}');
    if (!data.sources || data.sources.length === 0) {
       const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
       if (chunks) {
         data.sources = chunks.map((c: any) => ({
           university: c.web?.title || "Top University",
           url: c.web?.uri || "#",
           title: "Original Syllabus"
         })).slice(0, 3);
       }
    }
    return data;
  } catch (e) {
    console.error("Failed to parse syllabus JSON", e);
    throw new Error("Syllabus yaratishda xatolik yuz berdi.");
  }
};

export const generateDetailedContent = async (topicTitle: string, subject: string, difficulty: DifficultyLevel, lang: AppLanguage): Promise<GeneratedContent> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const languageName = lang === 'uz' ? 'O\'zbek' : lang === 'ru' ? 'Russian' : 'English';
  
  const prompt = `
    Subject: ${subject}
    Topic: ${topicTitle}
    Target Difficulty Level: ${getDifficultyDescription(difficulty, lang)}
    
    Task: Prepare high-quality academic and professional educational materials for this topic in ${languageName}. 
    The complexity must strictly match the ${difficulty} level.
    
    REQUIREMENTS:
    
    1. LECTURE_NOTE: 
       - At least 3000 words.
       - Logical flow, historical context, interesting facts, theoretical and practical foundations.
       - Use Markdown and LaTeX for formulas.

    2. EDUCATIONAL_CASE:
       - Problem statement, scope, consequences if not solved, step-by-step solution.

    3. KAZUS:
       - Detailed situational problem.

    4. QUESTIONS:
       - At least 20 questions for comprehension.

    5. TESTS:
       - At least 30 multiple-choice questions (A, B, C, D) with the correct answer.

    Return ONLY this JSON format:
    {
      "lectureNote": "Detailed markdown lecture text...",
      "educationalCase": "Detailed case text...",
      "kazus": "Detailed kazus text...",
      "questions": ["1...", "2...", ...],
      "tests": [
        { "question": "...", "options": ["A...", "B...", "C...", "D..."], "correctAnswer": "A" },
        ...
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 16000 }
    },
  });

  return JSON.parse(response.text || '{}');
};
