import React, { useState } from 'react';
import {
  BambuPrinter,
  BambuModel,
  SpeedMode,
  GCodeFile,
  PrinterStatus
} from '../types/printer';
import {
  Play,
  Pause,
  XCircle,
  Thermometer,
  Zap,
  Lightbulb,
  Radio,
  Clock,
  Layers,
  ChevronRight,
  Gauge,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Filter,
  Eye,
  RotateCcw,
  Sparkles,
  Flame,
  ShieldAlert,
  Disc
} from 'lucide-react';

interface DashboardTabProps {
  printers: BambuPrinter[];
  selectedPrinter: BambuPrinter;
  onSelectPrinter: (printer: BambuPrinter) => void;
  files: GCodeFile[];
  onSetNozzleTarget: (printerId: string, temp: number) => void;
  onSetBedTarget: (printerId: string, temp: number) => void;
  onSetSpeedMode: (printerId: string, mode: SpeedMode) => void;
  onToggleChamberLight: (printerId: string) => void;
  onPausePrint: (printerId: string) => void;
  onResumePrint: (printerId: string) => void;
  onCancelPrint: (printerId: string) => void;
  onStartPrintJob: (printerId: string, file: GCodeFile) => void;
  onOpenPrinterDetails: (printer: BambuPrinter) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  printers,
  selectedPrinter,
  onSelectPrinter,
  files,
  onSetNozzleTarget,
  onSetBedTarget,
  onSetSpeedMode,
  onToggleChamberLight,
  onPausePrint,
  onResumePrint,
  onCancelPrint,
  onStartPrintJob,
  onOpenPrinterDetails,
}) => {
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rackFilter, setRackFilter] = useState<string>('all');
  const [selectedFileForAssign, setSelectedFileForAssign] = useState<GCodeFile | null>(null);
  const [assigningPrinterId, setAssigningPrinterId] = useState<string | null>(null);

  // Filtered printers list
  const filteredPrinters = printers.filter((p) => {
    if (modelFilter !== 'all' && p.model !== modelFilter) return false;
    if (statusFilter === 'printing' && p.status !== 'printing') return false;
    if (statusFilter === 'idle' && p.status !== 'idle') return false;
    if (statusFilter === 'error' && (p.status !== 'error' && p.connectionStatus !== 'lan_error')) return false;
    if (rackFilter !== 'all' && p.rackGroup !== rackFilter) return false;
    return true;
  });

  // Extract unique racks
  const uniqueRacks = Array.from(new Set(printers.map((p) => p.rackGroup)));

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getSpeedModeBadge = (mode: SpeedMode) => {
    switch (mode) {
      case 'silent':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">ТИХИЙ (50%)</span>;
      case 'sport':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">СПОРТ (124%)</span>;
      case 'ludicrous':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">ТУРБО (166%)</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20">СТАНДАРТ (100%)</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4 text-emerald-500" />
            <span>Фильтры фермы:</span>
          </div>

          {/* Model Filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Все модели</option>
            <option value="X1-Carbon">X1-Carbon</option>
            <option value="X1-E">X1-E Enterprise</option>
            <option value="P1S">P1S</option>
            <option value="P1P">P1P</option>
            <option value="A1">A1</option>
            <option value="A1-Mini">A1 Mini</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Все статусы</option>
            <option value="printing">Идет печать</option>
            <option value="idle">Готов / Ожидание</option>
            <option value="error">Ошибки и предупреждения</option>
          </select>

          {/* Rack Location Filter */}
          <select
            value={rackFilter}
            onChange={(e) => setRackFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Все стойки / зоны</option>
            {uniqueRacks.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Показано <span className="font-bold text-slate-900 dark:text-white">{filteredPrinters.length}</span> из {printers.length} принтеров Bambu
        </div>
      </div>

      {/* PRINTER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrinters.map((printer) => {
          const isPrinting = printer.status === 'printing';
          const isPaused = printer.status === 'paused';
          const job = printer.currentJob;
          const activeAms = printer.amsUnits[0];

          return (
            <div
              key={printer.id}
              className={`group bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all hover:shadow-lg flex flex-col justify-between ${
                selectedPrinter.id === printer.id
                  ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                        {printer.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                        {printer.model}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>{printer.ipAddress}</span>
                      <span>•</span>
                      <span>{printer.rackGroup}</span>
                      <span>•</span>
                      <span className="text-emerald-500 font-semibold">{printer.pingMs}мс</span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {printer.connectionStatus === 'lan_error' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        ОШИБКА LAN
                      </span>
                    ) : isPrinting ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        ПЕЧАТЬ
                      </span>
                    ) : isPaused ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        ПАУЗА
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                        ГОТОВ
                      </span>
                    )}
                  </div>
                </div>

                {/* Print Progress Section if printing */}
                {isPrinting && job ? (
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="truncate max-w-[180px]" title={job.file.name}>
                        {job.file.name}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {job.progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${job.progressPercent}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Слой {job.currentLayer} / {job.totalLayers}</span>
                      <span>Осталось: {formatTime(Math.max(0, job.file.estimatedTimeSeconds - job.elapsedSeconds))}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 mb-4 text-center text-xs text-slate-400">
                    Принтер готов к отправке нового задания печати
                  </div>
                )}

                {/* Temperatures Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Сопло</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                      {printer.nozzleTemp}°C
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Цель: {printer.nozzleTarget}°C
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Стол</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                      {printer.bedTemp}°C
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Цель: {printer.bedTarget}°C
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Камера</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                      {printer.chamberTemp}°C
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Обдув: {printer.fanSpeed}%
                    </div>
                  </div>
                </div>

                {/* AMS Slot Matrix Preview */}
                {activeAms && activeAms.slots.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Disc className="w-3 h-3 text-emerald-500" />
                        Слоты AMS ({activeAms.slots.length})
                      </span>
                      <span className="text-[10px] font-normal text-slate-400">
                        Влажность: Уровень {activeAms.humidityScore} (Сухо)
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {activeAms.slots.map((slot) => (
                        <div
                          key={slot.slotId}
                          className={`p-1.5 rounded-lg border text-center transition ${
                            slot.active
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-center mb-1">
                            <span
                              className="w-3 h-3 rounded-full border border-slate-400/50 shadow-2xs"
                              style={{ backgroundColor: slot.colorHex }}
                            ></span>
                          </div>
                          <div className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate">
                            {slot.material}
                          </div>
                          <div className="text-[8px] font-mono text-slate-400">
                            {slot.remainingPercent}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speed Mode Bar */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Скорость:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['silent', 'standard', 'sport', 'ludicrous'] as SpeedMode[]).map((mode) => {
                      const modeLabels: Record<SpeedMode, string> = {
                        silent: 'Тих',
                        standard: 'Станд',
                        sport: 'Спорт',
                        ludicrous: 'Турбо',
                      };
                      return (
                        <button
                          key={mode}
                          onClick={() => onSetSpeedMode(printer.id, mode)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            printer.speedMode === mode
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                          }`}
                        >
                          {modeLabels[mode]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {/* Chamber Light Toggle */}
                <button
                  onClick={() => onToggleChamberLight(printer.id)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                    printer.chamberLight
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                  title="Переключить подсветку камеры"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold hidden sm:inline">Свет</span>
                </button>

                {/* Print Control Buttons */}
                <div className="flex items-center gap-1.5">
                  {isPrinting ? (
                    <>
                      <button
                        onClick={() => onPausePrint(printer.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Пауза</span>
                      </button>
                      <button
                        onClick={() => onCancelPrint(printer.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Отмена</span>
                      </button>
                    </>
                  ) : isPaused ? (
                    <>
                      <button
                        onClick={() => onResumePrint(printer.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Продолжить</span>
                      </button>
                      <button
                        onClick={() => onCancelPrint(printer.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Стоп</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setAssigningPrinterId(printer.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Печать</span>
                    </button>
                  )}

                  {/* Open Details Drawer */}
                  <button
                    onClick={() => onOpenPrinterDetails(printer)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                    title="Открыть панель управления осями и печатью"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK ASSIGN FILE MODAL */}
      {assigningPrinterId && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                Отправка G-Code на принтер
              </h3>
              <button
                onClick={() => setAssigningPrinterId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Выберите нарезанный файл 3MF / GCODE из локальной библиотеки для запуска печати по сети:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileForAssign(file)}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                    selectedFileForAssign?.id === file.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold">{file.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {file.size} • {file.requiredMaterial} • Около {Math.round(file.estimatedTimeSeconds / 60)} мин
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {file.filamentUsedGrams}г
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAssigningPrinterId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Отмена
              </button>
              <button
                disabled={!selectedFileForAssign}
                onClick={() => {
                  if (selectedFileForAssign && assigningPrinterId) {
                    onStartPrintJob(assigningPrinterId, selectedFileForAssign);
                    setAssigningPrinterId(null);
                    setSelectedFileForAssign(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition"
              >
                Начать печать по LAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
