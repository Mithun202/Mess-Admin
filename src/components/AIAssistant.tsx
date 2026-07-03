import React, { useState } from 'react';
import { Sparkles, Send, Bot, RefreshCw, Lightbulb, ShoppingCart, HelpCircle, Download, Layers } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { CalculatedSummary, Member, Expense, Deposit } from '../types';
import { LanguageStrings } from '../translations';

interface AIAssistantProps {
  currentMessName: string;
  summary: CalculatedSummary;
  members: Member[];
  expenses: Expense[];
  deposits: Deposit[];
  t: LanguageStrings;
  lang: 'en' | 'bn';
}

export default function AIAssistant({
  currentMessName,
  summary,
  members,
  expenses,
  deposits,
  t,
  lang,
}: AIAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = lang === 'bn' ? [
    {
      label: 'মেসের সামগ্রিক বিবরণী',
      prompt: 'আমাদের মেসের বর্তমান সদস্য সংখ্যা, মোট মিল, বাজার খরচ, ফিক্সড খরচ, মিল রেট এবং সদস্য ব্যালেন্স শিটের উপর ভিত্তি করে একটি সামগ্রিক মেস সামারি বা বিবরণী তৈরি করুন। কার কত টাকা দিতে হবে বা কে কত টাকা পাবে তা সংক্ষেপে বুঝিয়ে বলুন। দয়া করে বাংলায় উত্তর দিন।',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
    },
    {
      label: 'বাজার খরচ অপ্টিমাইজ করুন',
      prompt: 'আমাদের মোট মিল সংখ্যা এবং সদস্য তালিকা বিবেচনা করে, একটি সাপ্তাহিক অপ্টিমাইজড বাজার তালিকা এবং বাজেট সুপারিশ তৈরি করুন। দয়া করে বাংলায় উত্তর দিন।',
      icon: <ShoppingCart className="w-4 h-4 text-emerald-500" />,
    },
    {
      label: 'খরচ কমানোর কৌশল',
      prompt: 'আমাদের বর্তমান মেস খরচের ধরণ এবং মিল রেট বিশ্লেষণ করুন। আমাদের মেস সেটআপের জন্য ৫টি কার্যকরী খরচ কমানোর কৌশল সুপারিশ করুন। দয়া করে বাংলায় উত্তর দিন।',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
    },
    {
      label: 'হিসাব অডিট ও নিষ্পত্তি সমাধান',
      prompt: 'আমাদের নিষ্পত্তি পথ এবং সদস্য ব্যালেন্স শিটগুলো পর্যালোচনা করুন। কেউ কি অতিরিক্ত খরচ করছে বা কম টাকা জমা দিয়েছে? আমাদের আর্থিক অবস্থা সহজ ভাষায় বিশ্লেষণ করুন এবং নিষ্পত্তি পথ বুঝিয়ে দিন। দয়া করে বাংলায় উত্তর দিন।',
      icon: <HelpCircle className="w-4 h-4 text-indigo-500" />,
    }
  ] : [
    {
      label: 'Total Mess Summary',
      prompt: 'Provide a comprehensive total mess summary based on our member count, total meals, bazaar expenses, fixed costs, meal rate, and member balance sheets. Summarize who owes what and who is due to receive refunds clearly.',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
    },
    {
      label: 'Optimize Bazaar Shopping',
      prompt: 'Based on our total meal count and member roster, generate a weekly optimized shopping/grocery list and budget recommendation.',
      icon: <ShoppingCart className="w-4 h-4 text-emerald-500" />,
    },
    {
      label: 'Cost-Reduction Strategies',
      prompt: 'Analyze our current expense categories and meal rates. Recommend 5 actionable cost-reduction strategies specifically for our mess setup.',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
    },
    {
      label: 'Audit & Settling Counsel',
      prompt: 'Review our settlements and member balance sheets. Is anyone contributing disproportionately? Give a smart financial overview and explain our settlement path simply.',
      icon: <HelpCircle className="w-4 h-4 text-indigo-500" />,
    }
  ];

  const downloadPdf = () => {
    if (!aiResponse) return;

    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale for crisp rendering in PDF (Retina style)
    const scale = 2;
    const width = 800 * scale;

    // Prepare line layout
    const rawLines = aiResponse.split('\n');

    // Font family definition: using fallback fonts that are universally available on browsers
    // This allows the browser canvas engine to use standard OS unicode system fonts (e.g. SolaimanLipi, Vrinda, Kohinoor Bangla, Arial)
    const fontStack = '"Kohinoor Bangla", "SolaimanLipi", "Vrinda", "Arial", "Helvetica", sans-serif';
    const titleFont = `bold ${18 * scale}px ${fontStack}`;
    const headerFont = `bold ${13 * scale}px ${fontStack}`;
    const bodyFont = `${10.5 * scale}px ${fontStack}`;
    const footerFont = `italic ${8 * scale}px monospace`;

    const padding = 40 * scale;
    const maxTextWidth = width - (padding * 2);

    // Simple word wrapping helper that supports Bengali
    const wrapText = (text: string, font: string, maxWidth: number): string[] => {
      ctx.font = font;
      const words = text.split(' ');
      const wrappedLines: string[] = [];
      let currentLine = '';

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + (currentLine ? ' ' : '') + words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          wrappedLines.push(currentLine);
          currentLine = words[n];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
      return wrappedLines;
    };

    const processedLines: { text: string; type: 'title' | 'header' | 'bullet' | 'body' | 'empty' }[] = [];

    processedLines.push({ text: `${currentMessName.toUpperCase()} - AI ${lang === 'bn' ? 'মেস রিপোর্ট' : 'REPORT'}`, type: 'title' });
    processedLines.push({ text: `${lang === 'bn' ? 'তৈরি হয়েছে:' : 'Generated on:'} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, type: 'empty' });
    processedLines.push({ text: '', type: 'empty' });

    rawLines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        processedLines.push({ text: '', type: 'empty' });
        return;
      }

      // Clean up markdown bold markers (**text**) for the PDF rendering
      const cleanLine = trimmed.replace(/\*\*/g, '');

      if (cleanLine.startsWith('# ') || cleanLine.startsWith('## ') || cleanLine.startsWith('### ')) {
        const cleanHeader = cleanLine.replace(/^#+\s+/, '');
        processedLines.push({ text: cleanHeader, type: 'header' });
      } else if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        const cleanBullet = cleanLine.replace(/^[\*\-]\s+/, '');
        processedLines.push({ text: cleanBullet, type: 'bullet' });
      } else {
        processedLines.push({ text: cleanLine, type: 'body' });
      }
    });

    const finalRenderLines: { text: string; font: string; color: string; indent: number; height: number }[] = [];
    let totalHeight = padding * 2;

    processedLines.forEach(line => {
      let font = bodyFont;
      let color = '#334155'; // slate-700
      let indent = 0;
      let spacing = 18 * scale;

      if (line.type === 'title') {
        font = titleFont;
        color = '#4f46e5'; // indigo-600
        spacing = 26 * scale;
      } else if (line.type === 'header') {
        font = headerFont;
        color = '#1e1b4b'; // indigo-950
        spacing = 22 * scale;
      } else if (line.type === 'bullet') {
        font = bodyFont;
        color = '#1e293b'; // slate-800
        indent = 12 * scale;
        spacing = 18 * scale;
      } else if (line.type === 'empty') {
        font = bodyFont;
        spacing = 8 * scale;
      }

      if (line.type === 'empty') {
        finalRenderLines.push({ text: '', font, color, indent, height: spacing });
        totalHeight += spacing;
      } else {
        const textToWrap = line.type === 'bullet' ? `•  ${line.text}` : line.text;
        const wrapped = wrapText(textToWrap, font, maxTextWidth - indent);
        wrapped.forEach(wText => {
          finalRenderLines.push({ text: wText, font, color, indent, height: spacing });
          totalHeight += spacing;
        });
      }
    });

    // Extra space for footer
    totalHeight += 40 * scale;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = totalHeight;

    // Render Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, totalHeight);

    // Elegant Outer Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(12 * scale, 12 * scale, width - (24 * scale), totalHeight - (24 * scale));

    // Top Brand Accent bar
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(12 * scale, 12 * scale, width - (24 * scale), 6 * scale);

    // Render Text Lines
    let currentY = padding;
    finalRenderLines.forEach(line => {
      if (line.text) {
        ctx.font = line.font;
        ctx.fillStyle = line.color;
        ctx.textBaseline = 'middle';
        ctx.fillText(line.text, padding + line.indent, currentY + (line.height / 2));
      }
      currentY += line.height;
    });

    // Draw Footer Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.75 * scale;
    ctx.beginPath();
    ctx.moveTo(padding, totalHeight - (40 * scale));
    ctx.lineTo(width - padding, totalHeight - (40 * scale));
    ctx.stroke();

    // Render Footer Text
    ctx.font = footerFont;
    ctx.fillStyle = '#64748b';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${lang === 'bn' ? 'মেসঅ্যাডমিন এআই রিপোর্ট - স্মার্ট মেস সহকারী' : 'Generated by MessAdmin AI - Your Smart Mess Companion'}`, padding, totalHeight - (25 * scale));

    // Convert canvas to image and load into jsPDF
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = width / scale;
    const pdfHeight = totalHeight / scale;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MessAdmin_AI_Report_${currentMessName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleQuery = async (promptText: string) => {
    setLoading(true);
    setError(null);
    setAiResponse(null);

    // Prepare clean contextual data to pass to Gemini
    const contextData = {
      messName: currentMessName,
      membersCount: members.length,
      bazaarExpense: summary.totalBazaarExpense,
      fixedExpense: summary.totalFixedExpense,
      mealRate: summary.mealRate,
      totalMeals: summary.totalMeals,
      memberSummaries: Object.values(summary.memberSummaries).map(m => ({
        name: m.memberName,
        meals: m.totalMeals,
        totalDepositContribution: m.totalDeposit,
        netBalance: m.balance,
      })),
      settlements: summary.settlements,
    };

    // Inject reply-in-language instruction to Gemini
    const systemInstructionPrompt = lang === 'bn' 
      ? `${promptText}\n\nIMPORTANT: Please write the entire analysis and response in Bengali/Bangla language (বাংলা ভাষা) since the user's dashboard is set to Bangla. Keep formatting clean with simple markdown headers and bullets.`
      : `${promptText}\n\nIMPORTANT: Please write the entire analysis and response in English language. Keep formatting clean with simple markdown headers and bullets.`;

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: systemInstructionPrompt,
          contextData,
          lang,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error.');
      }

      setAiResponse(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (lang === 'bn' ? 'মেসঅ্যাডমিন এআই হেল্পারের সাথে সংযুক্ত হওয়া যায়নি। আপনার সার্ভার চালু এবং জেমিনি এপিআই কি সঠিক কিনা নিশ্চিত করুন।' : 'Could not connect to the MessAdmin AI helper. Ensure your server is active and the Gemini API key is configured.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant" className="bg-gradient-to-b from-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden animate-fade-in">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>

      {/* Header */}
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/25 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="inline-block text-[10px] bg-indigo-500/20 text-indigo-300 font-bold tracking-wider px-2 py-0.5 rounded-full uppercase mb-1">
            {t.aiHeaderSubtitle}
          </span>
          <h3 className="font-display text-xl font-bold">{t.aiTitle}</h3>
        </div>
      </div>

      <p className="text-xs text-slate-300 mt-2.5 max-w-2xl">
        {t.aiDesc}
      </p>

      {/* Preset Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 relative">
        {presets.map((p, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleQuery(p.prompt)}
            className="cursor-pointer text-left p-4.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between h-32 group disabled:opacity-50"
          >
            <div className="p-2 bg-white/5 rounded-xl self-start group-hover:scale-105 transition-transform">
              {p.icon}
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-2 block tracking-wide">{p.label}</p>
          </button>
        ))}
      </div>

      {/* Custom prompt input */}
      <div className="mt-6 relative">
        <div className="flex gap-2">
          <input
            type="text"
            disabled={loading}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={t.askAnything}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder-slate-400 text-white disabled:opacity-50 font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customPrompt.trim()) {
                handleQuery(customPrompt.trim());
                setCustomPrompt('');
              }
            }}
          />
          <button
            onClick={() => {
              if (customPrompt.trim()) {
                handleQuery(customPrompt.trim());
                setCustomPrompt('');
              }
            }}
            disabled={loading || !customPrompt.trim()}
            className="cursor-pointer px-5 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-2xl flex items-center justify-center transition-colors text-white"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Response Box */}
      {(loading || aiResponse || error) && (
        <div className="mt-6 bg-white/[0.03] border border-white/10 rounded-2xl p-6 animate-fade-in relative max-h-[500px] overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-indigo-400 mx-auto animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-200">{lang === 'bn' ? 'মেস রেকর্ড ও ভাউচার বিশ্লেষণ করা হচ্ছে...' : 'Analyzing Mess Records & Vouchers...'}</p>
              <p className="text-xs text-slate-400 mt-1">{lang === 'bn' ? `${currentMessName} এর মিল এবং খরচের খাতা বিশ্লেষণ চলছে` : `Checking meals and shared bills for ${currentMessName}`}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-xl text-xs flex items-start gap-2.5">
              <div className="font-bold uppercase tracking-wider shrink-0 bg-rose-500/20 px-2 py-0.5 rounded">API Notice</div>
              <div>{error}</div>
            </div>
          )}

          {aiResponse && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 font-mono">
                  <Bot className="w-4 h-4" /> {lang === 'bn' ? 'এআই রিপোর্ট তৈরি হয়েছে' : 'AI REPORT GENERATED'}
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadPdf}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download PDF'}</span>
                  </button>
                  
                  <button
                    onClick={() => setAiResponse(null)}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'রিপোর্ট মুছুন' : 'Clear Report'}
                  </button>
                </div>
              </div>

              {/* Styled markdown response */}
              <div className="text-sm text-slate-200 leading-relaxed font-sans space-y-3 prose prose-invert select-text">
                {aiResponse.split('\n').map((line, idx) => {
                  // Bold headers
                  if (line.startsWith('### ')) {
                    return <h4 key={idx} className="font-display text-indigo-300 font-bold text-base mt-4">{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('## ')) {
                    return <h3 key={idx} className="font-display text-indigo-200 font-bold text-lg mt-5 border-b border-white/5 pb-1">{line.replace('## ', '')}</h3>;
                  }
                  if (line.startsWith('# ')) {
                    return <h2 key={idx} className="font-display text-indigo-100 font-bold text-xl mt-6">{line.replace('# ', '')}</h2>;
                  }
                  // Bullet points
                  if (line.startsWith('* ') || line.startsWith('- ')) {
                    return (
                      <li key={idx} className="ml-4 list-disc text-slate-200">
                        {renderBoldSpan(line.slice(2))}
                      </li>
                    );
                  }
                  // Numbered points
                  const numMatch = line.match(/^(\d+)\.\s(.*)/);
                  if (numMatch) {
                    return (
                      <div key={idx} className="flex gap-2 text-slate-200 ml-2">
                        <span className="font-mono text-indigo-400 font-semibold">{numMatch[1]}.</span>
                        <span>{renderBoldSpan(numMatch[2])}</span>
                      </div>
                    );
                  }
                  // Regular line
                  return line.trim() ? <p key={idx} className="text-slate-300">{renderBoldSpan(line)}</p> : <div key={idx} className="h-2" />;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple parser to make **text** show up bold inside response paragraphs
function renderBoldSpan(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="text-white font-bold">{part}</strong>;
    }
    return part;
  });
}
