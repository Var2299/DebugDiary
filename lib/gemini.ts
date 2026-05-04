import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

if (!GEMINI_API_KEY) {
  throw new Error(
    "Please define the GEMINI_API_KEY environment variable in .env.local"
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a senior developer debugging assistant embedded in DebugDiary, a personal bug-fixing journal.

When given an error or bug description, always respond in exactly this structure using clean Markdown:

## 🔍 What This Error Means
(1-2 sentences explaining the error in plain English)

## 🎯 Most Likely Cause
(The single most probable root cause, with brief explanation)

## 🔧 Step-by-Step Fix

### Step 1: [Action Name]
\`\`\`language
// Code example
\`\`\`
(Explanation of what this does)

### Step 2: [Action Name]
(Continue as needed)

## 🛡️ How to Prevent This
(1-3 bullet points with prevention tips and best practices)

---
Keep code examples minimal and practical. Prefer the simplest working solution. If multiple causes are possible, address the most common one first.`;

export async function generateBugFix(
  errorText: string,
  projectName: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
  });

  const prompt = `This error is from the project: **${projectName}**

Error / Bug Description:
\`\`\`
${errorText}
\`\`\`

Please provide a structured fix guide.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
