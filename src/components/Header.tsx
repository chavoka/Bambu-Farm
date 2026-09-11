import React, { useState } from 'react';
import {
  Printer,
  Octagon,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Wifi,
  ChevronDown,
  AlertTriangle,
  Radio,
  Layers,
  Flame,
  Zap,
  ShieldCheck,
  Plus,
  Play,
  Pause,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { BambuPrinter, PrinterStatus } from '../types/printer';

interface HeaderProps {
  printers: BambuPrinter[];
  activePrinter: BambuPrinter;
  onSelectPrinter: (printer: BambuPrinter) => void;
  onEmergencyStop: () => void;
  onBatchPreheat: (preset: { nozzle: number; bed: number }) => void;
  onBatchToggleLights: () => void;
  onOpenAddPrinterModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  printers,
  activePrinter,
  onSelectPrinter,
  onEmergencyStop,
  onBatchPreheat,
  onBatchToggleLights,
  onOpenAddPrinterModal,
  soundEnabled,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
}) => {
  const [showPrinterDropdown, setShowPrinterDropdown] = useState(false);
  const [showEstopConfirm, setShowEstopConfirm] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Fleet Statistics
  const totalCount = printers.length;
  const printingCount = printers.filter((p) => p.status === 'printing').length;
  const idleCount = printers.filter((p) => p.status === 'idle').length;
  const errorCount = printers.filter((p) => p.status === 'error' || p.connectionStatus === 'lan_error').length;

  const getStatusBadge = (status: PrinterStatus) => {
    switch (status) {
      case 'printing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            ПЕЧАТЬ
          </span>
        );
      case 'heating':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            НАГРЕВ
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            ПАУЗА
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            ОШИБКА
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            НЕ В СЕТИ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            ГОТОВ
          </span>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Left: Branding & LAN-Only Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Printer className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                    Диспетчер фермы Bambu
                  </h1>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    РЕЖИМ LAN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Локальный MQTT TLS :8883 • FTPS :990 • RTSP Потоки
                </p>
              </div>
            </div>

            {/* Farm Stat Summary Badges */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <div className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                Ферма: <span className="text-emerald-600 dark:text-emerald-400">{totalCount}</span>
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                Печать: {printingCount}
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                Готовы: {idleCount}
              </div>
              {errorCount > 0 && (
                <div className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                  Ошибки: {errorCount}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: Quick Batch, Add Printer, Ping, Audio, Dark Mode, Emergency Stop */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Batch Actions Dropdown trigger */}
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="hidden sm:inline">Групповые действия</span>
            </button>

            {/* Add Printer LAN button */}
            <button
              onClick={onOpenAddPrinterModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline">Добавить принтер</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Звуковые оповещения включены' : 'Звуковые оповещения отключены'}
              className={`p-2 rounded-xl border text-xs transition ${
                soundEnabled
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={darkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Emergency Stop Button M112 */}
            <button
              onClick={() => setShowEstopConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition active:scale-95"
            >
              <Octagon className="w-4 h-4" />
              <span className="hidden xl:inline">АВАРИЙНЫЙ СТОП (M112)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Batch Actions Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Групповые операции фермы
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Применить одну команду ко всем {totalCount} подключенным принтерам Bambu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Batch Heat presets */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Групповой предпрогрев всех нагревателей
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onBatchPreheat({ nozzle: 220, bed: 60 });
                      setShowBatchModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-left transition"
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Пресет PLA</div>
                    <div className="text-[10px] text-slate-500">220°C / 60°C</div>
                  </button>

                  <button
                    onClick={() => {
                      onBatchPreheat({ nozzle: 240, bed: 70 });
                      setShowBatchModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-left transition"
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Пресет PETG HF</div>
                    <div className="text-[10px] text-slate-500">240°C / 70°C</div>
                  </button>

                  <button
                    onClick={() => {
                      onBatchPreheat({ nozzle: 255, bed: 90 });
                      setShowBatchModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-left transition"
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Пресет ABS / ASA</div>
                    <div className="text-[10px] text-slate-500">255°C / 90°C</div>
                  </button>

                  <button
                    onClick={() => {
                      onBatchPreheat({ nozzle: 0, bed: 0 });
                      setShowBatchModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-500/20 text-left transition col-span-2 sm:col-span-3"
                  >
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Охладить все нагреватели</div>
                    <div className="text-[10px] text-rose-500/80">Отключить нагрев сопел и столов на всей ферме</div>
                  </button>
                </div>
              </div>

              {/* Batch Lights Toggle */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Освещение камер
                </label>
                <button
                  onClick={() => {
                    onBatchToggleLights();
                    setShowBatchModal(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Переключить подсветку во всех камерах
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Stop Confirmation Modal */}
      {showEstopConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-600 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                АВАРИЙНАЯ ОСТАНОВКА ФЕРМЫ (M112)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Вы уверены, что хотите отправить команду экстренной остановки M112 на ВСЕ подключенные принтеры Bambu в локальной сети? Приводы и нагрев будут немедленно отключены.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowEstopConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onEmergencyStop();
                  setShowEstopConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition"
              >
                ОСТАНОВИТЬ ВСЕ ПРИНТЕРЫ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
