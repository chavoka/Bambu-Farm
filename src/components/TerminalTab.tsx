import React, { useState } from 'react';
import { Terminal, Send, Trash2, ShieldCheck, Copy, Check } from 'lucide-react';

interface TerminalTabProps {
  logs: string[];
  onSendGCode: (command: string) => void;
  onClearLogs: () => void;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({
  logs,
  onSendGCode,
  onClearLogs,
}) => {
  const [inputCommand, setInputCommand] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    onSendGCode(inputCommand);
    setInputCommand('');
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-xs text-slate-300">
      
      {/* TERMINAL HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-extrabold text-sm text-white">
            Поток пакетов Bambu LAN MQTT (порт 8883)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            TLS ШИФРОВАНИЕ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Копировать логи"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition"
            title="Очистить терминал"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* LOG STREAM OUTPUT AREA */}
      <div className="h-96 overflow-y-auto bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-1.5 font-mono text-[11px] leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">Ожидание локальных топиков MQTT JSON (device/+/report)...</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`${
                log.includes('M112') || log.includes('ERROR')
                  ? 'text-rose-400 font-bold'
                  : log.includes('SENT:')
                  ? 'text-amber-300 font-bold'
                  : log.includes('CONNECTED')
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-300'
              }`}
            >
              {log}
            </div>
          ))
        )}
      </div>

      {/* MANUAL GCODE COMMAND INPUT */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
        <span className="self-center font-bold text-emerald-400">$</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="Отправить сырой G-Code или пакет MQTT (напр. M105, G28 X Y, M106 S255)..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Отправить</span>
        </button>
      </form>
    </div>
  );
};
