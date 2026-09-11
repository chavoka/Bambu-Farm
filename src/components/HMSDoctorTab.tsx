import React, { useState } from 'react';
import { BambuPrinter } from '../types/printer';
import {
  Bot,
  Wrench,
  AlertTriangle,
  Send,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';

interface HMSDoctorTabProps {
  printers: BambuPrinter[];
}

export const HMSDoctorTab: React.FC<HMSDoctorTabProps> = ({ printers }) => {
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(printers[0]?.id || '');
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchHmsCode, setSearchHmsCode] = useState('');

  const currentPrinter = printers.find((p) => p.id === selectedPrinterId) || printers[0];

  // Common Bambu HMS error code database
  const hmsDatabase = [
    {
      code: 'HMS_0300_1000_0001_0001',
      title: 'Аномальная температура нагревательного стола',
      solution: 'Проверьте кабель термистора стола под кожухом платформы. Убедитесь в стабильности питания LAN.',
    },
    {
      code: 'HMS_0500_0300_0001_0002',
      title: 'Превышен ресурс угольного воздушного фильтра камеры',
      solution: 'Счетчик фильтра достиг 300 часов печати. Замените картридж угольного фильтра из скорлупы кокоса.',
    },
    {
      code: 'HMS_0700_2000_0002_0001',
      title: 'Предупреждение инспекции первого слоя (AI LiDAR)',
      solution: 'Микро-лидар обнаружил зазор на текстурированной пластине PEI. Очистите стол спиртом (ИПА) или помойте с мылом.',
    },
    {
      code: 'HMS_0500_0100_0001_0002',
      title: 'Сопротивление протяжке филамента в модуле AMS',
      solution: 'Шестерни подачи слота AMS испытывают сопротивление. Проверьте радиус изгиба трубки PTFE или обломок филамента внутри.',
    },
  ];

  const handleSendAiPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/ai-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          printerModel: currentPrinter.model,
          filamentType: currentPrinter.amsUnits[0]?.slots[0]?.material || 'PLA Basic',
          nozzleTemp: currentPrinter.nozzleTemp,
          bedTemp: currentPrinter.bedTemp,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
      } else if (data.error) {
        setAiResponse(`Ошибка системы ИИ-диагностики: ${data.error}`);
      }
    } catch (err: any) {
      setAiResponse('Не удалось связаться с API Gemini AI Doctor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Диагностика HMS и ИИ-доктор фермы
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Дешифратор ошибок Health Management System, регламенты обслуживания и ассистент Gemini AI
            </p>
          </div>
        </div>

        {/* Printer Selector */}
        <select
          value={selectedPrinterId}
          onChange={(e) => setSelectedPrinterId(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-200"
        >
          {printers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.model})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: AI DOCTOR ASSISTANT */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                Специалист Gemini AI по Bambu (режим LAN)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                gemini-2.5-flash
              </span>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setPrompt(`Как устранить ошибку втягивания филамента в слоте AMS 2 на моем ${currentPrinter.model}?`);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition"
              >
                🛠️ Застревание в AMS
              </button>
              <button
                onClick={() => {
                  setPrompt(`Какие настройки скорости в OrcaSlicer лучше для печати PETG HF на ${currentPrinter.model} в режиме Ludicrous?`);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition"
              >
                ⚡ Скоростной профиль PETG
              </button>
              <button
                onClick={() => {
                  setPrompt(`Как устранить ошибку HMS_0300_1000_0001_0001 термистора стола Bambu?`);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition"
              >
                🌡️ Ошибка термистора стола
              </button>
            </div>

            {/* Prompt Form */}
            <form onSubmit={handleSendAiPrompt} className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Спросить ИИ-доктора о ${currentPrinter.name} (${currentPrinter.model})...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Спросить</span>
              </button>
            </form>

            {/* AI Output Response */}
            {aiResponse && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Рекомендации диагностики Gemini AI:
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>

          {/* HMS ERROR DATABASE INSPECTOR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              База знаний и дешифратор кодов Bambu HMS
            </h3>

            <div className="space-y-2">
              {hmsDatabase.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <span>{item.code}</span>
                    <span className="text-[10px] text-slate-400 font-sans">{item.title}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {item.solution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COL: PREVENTIVE MAINTENANCE SCHEDULE */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              График техобслуживания ({currentPrinter.name})
            </h3>

            <div className="space-y-4 text-xs">
              {/* Total Print Hours */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Общее время печати</span>
                  <span className="font-mono text-emerald-500">{currentPrinter.maintenance.totalPrintHours} ч</span>
                </div>
              </div>

              {/* Carbon Air Filter */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Ресурс угольного фильтра</span>
                  <span className="font-mono text-slate-400">{currentPrinter.maintenance.carbonFilterHours} / 300 ч</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      currentPrinter.maintenance.carbonFilterHours > 250 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentPrinter.maintenance.carbonFilterHours / 300) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* PTFE Guide Tube */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Износ трубки PTFE</span>
                  <span className="font-mono text-slate-400">{currentPrinter.maintenance.ptfeTubeHours} / 1000 ч</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (currentPrinter.maintenance.ptfeTubeHours / 1000) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Lead Screw Z Lubrication */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Смазка винтов оси Z</span>
                  <span className="font-mono text-slate-400">{currentPrinter.maintenance.leadScrewHours} / 250 ч</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (currentPrinter.maintenance.leadScrewHours / 250) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
