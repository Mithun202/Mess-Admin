import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client helper to avoid crashes during startup if key is not configured
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini Analysis Endpoint
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { prompt, contextData, lang } = req.body;
    
    // Verify key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: 'Missing GEMINI_API_KEY. Please configure your Gemini API Key in the Settings > Secrets panel of Google AI Studio.'
      });
    }

    const ai = getGeminiClient();
    const isBn = lang === 'bn';
    
    const systemPrompt = isBn
      ? `আপনি মেসঅ্যাডমিন এআই, মেসের ডাইনিং, মিল, বাজার খরচ এবং মেসের সদস্যদের বাজেট হিসাব ও সমাধান দেওয়ার একজন দক্ষ এআই সহকারী।
আপনাকে মেসের সদস্যদের রিয়াল-টাইম তথ্য, মিল রেকর্ড এবং খরচের বিবরণী দেওয়া হবে।
আপনার কাজ হচ্ছে সহজ, সংক্ষিপ্ত এবং কার্যকর পরামর্শ দেওয়া। আপনার পুরো বিশ্লেষণ এবং মন্তব্য অবশ্যই বাংলা ভাষায় (বাংলা বর্ণমালায়) হতে হবে।
উত্তরটি সুন্দরভাবে সাজানোর জন্য মার্কডাউন হেডার (## বা ###) এবং বুলেট পয়েন্ট ব্যবহার করুন। বর্ণনামূলক বড় প্যারাগ্রাফ পরিহার করুন।`
      : `You are MessAdmin AI, an expert advisor for shared house dining, flat cooking, hostel messes, and communal budget planning. 
You will be provided with real-time financial stats, meal records, and active ledger logs of a communal eating mess.
Your goal is to offer objective, highly scannable, practical, and friendly advice.
Use clean markdown elements (bullet points, bold key numbers, headers) to format your response. Avoid dense paragraphs. Keep explanations conversational but professional.`;

    const modelInputPrompt = isBn
      ? `
এখানে আমাদের মেসের রিয়েল-টাইম হিসাবের তথ্য দেওয়া হলো:
${JSON.stringify(contextData, null, 2)}

ব্যবহারকারীর জিজ্ঞাসা:
"${prompt}"

দয়া করে এই তথ্যগুলো বিশ্লেষণ করে নীচের বিষয়গুলো প্রদান করুন (সম্পূর্ণ উত্তরটি বাংলায় হতে হবে):
১. মেসের সামগ্রিক বিবরণী ও প্রধান পর্যবেক্ষণসমূহ (Executive Summary & Observations)
২. মেসের উন্নয়ন বা খরচ কমানোর জন্য বাস্তবসম্মত সুপারিশ বা করণীয়সমূহ (Actionable recommendations)
৩. মেসের ডাইনিং পরিচালনা ও হিসাব নিষ্পত্তির কৌশলসমূহ (Strategic tips)
`
      : `
Here is the context data about our communal mess:
${JSON.stringify(contextData, null, 2)}

User Request:
"${prompt}"

Please analyze this data and provide:
1. Executive Summary/Key Observations
2. Highly actionable recommendations or items
3. Strategic tips (e.g. optimizing shopping schedules, meal adjustments, or settlement paths)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: modelInputPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const reply = response.text || (isBn ? "আমি বিশ্লেষণটি প্রস্তুত করতে পারিনি। অনুগ্রহ করে আপনার মেসের হিসাবের ডাটা যাচাই করে আবার চেষ্টা করুন।" : "I was unable to compile the analysis. Please check your mess metrics and try again.");
    res.json({ result: reply });
  } catch (error: any) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during Gemini AI analysis.' 
    });
  }
});

// Vite Middleware integration for local development vs static asset serving in production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MessAdmin] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
});
