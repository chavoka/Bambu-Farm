import React, { useState } from 'react';
import { BambuPrinter } from '../types/printer';
import {
  Camera,
  Grid,
  Maximize2,
  Lightbulb,
  Radio,
  RefreshCw,
  Video,
  Download,
  AlertTriangle,
  Play
} from 'lucide-react';

interface CameraWallTabProps {
  printers: BambuPrinter[];
  onToggleChamberLight: (printerId: string) => void;
}

export const CameraWallTab: React.FC<CameraWallTabProps> = ({
  printers,
  onToggleChamberLight,
}) => {
  const [gridCols, setGridCols] = useState<1 | 2 | 3>(2);
  const [fullscreenPrinterId, setFullscreenPrinterId] = useState<string | null>(null);

  const handleTakeSnapshot = (printerName: string) => {
    alert(`Снимок с камеры принтера ${printerName} сохранен на SD-карту`);
  };

  return (
    <div className="space-y-6">
      
      {/* CAMERA WALL HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Стена RTSP-камер фермы
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Потоковое видео RTSP с низкой задержкой по локальной сети (:554)
            </p>
          </div>
        </div>

        {/* Grid Layout Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Сетка:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setGridCols(1)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                gridCols === 1
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              1x1 Фокус
            </button>
            <button
              onClick={() => setGridCols(2)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                gridCols === 2
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2x2 Сетка
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                gridCols === 3
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3x3 Стена
            </button>
          </div>
        </div>
      </div>

      {/* CAMERA GRID */}
      <div
        className={`grid gap-5 ${
          gridCols === 1
            ? 'grid-cols-1 max-w-4xl mx-auto'
            : gridCols === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {printers.map((printer) => {
          const isPrinting = printer.status === 'printing';
          const job = printer.currentJob;

          return (
            <div
              key={printer.id}
              className="group bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative flex flex-col justify-between"
            >
              {/* Camera Feed Image Header Overlay */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                {printer.connectionStatus === 'lan_error' ? (
                  <div className="text-center p-4 space-y-2">
                    <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
                    <div className="text-xs font-bold text-rose-400">
                      RTSP поток камеры отключен
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Проверьте код доступа LAN для {printer.ipAddress}
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={printer.cameraUrl}
                      alt={printer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Live Badge Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      RTSP 1080P ({printer.fps} кадр/с)
                    </div>

                    {/* Printer Name Overlay */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-xs font-bold text-white border border-slate-800">
                      {printer.name}
                    </div>

                    {/* Progress Bar Overlay if printing */}
                    {isPrinting && job && (
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md p-2.5 border-t border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                          <span className="truncate max-w-[200px]">{job.file.name}</span>
                          <span className="text-emerald-400 font-mono">{job.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${job.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Camera Controls Bar */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="text-[11px] font-mono text-slate-400">
                  Сопло: <span className="text-amber-400 font-bold">{printer.nozzleTemp}°C</span> • Стол: <span className="text-rose-400 font-bold">{printer.bedTemp}°C</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleChamberLight(printer.id)}
                    className={`p-1.5 rounded-lg border text-xs transition ${
                      printer.chamberLight
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                    title="Подсветка камеры"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleTakeSnapshot(printer.name)}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition"
                    title="Сделать снимок"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setFullscreenPrinterId(printer.id)}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition"
                    title="На весь экран"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULLSCREEN CAMERA MODAL */}
      {fullscreenPrinterId && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-4 sm:p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-extrabold text-lg text-white">
                {printers.find((p) => p.id === fullscreenPrinterId)?.name} (Поток RTSP)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {printers.find((p) => p.id === fullscreenPrinterId)?.ipAddress} • Доступ по LAN активен
              </p>
            </div>
            <button
              onClick={() => setFullscreenPrinterId(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Закрыть ✕
            </button>
          </div>

          {/* Video Container */}
          <div className="flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 relative">
            <img
              src={printers.find((p) => p.id === fullscreenPrinterId)?.cameraUrl}
              alt="Fullscreen RTSP Feed"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Bottom Telemetry Overlay */}
          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              Сопло: <span className="font-mono font-bold text-amber-400">{printers.find((p) => p.id === fullscreenPrinterId)?.nozzleTemp}°C</span> • Стол: <span className="font-mono font-bold text-rose-400">{printers.find((p) => p.id === fullscreenPrinterId)?.bedTemp}°C</span>
            </div>
            <button
              onClick={() => handleTakeSnapshot(printers.find((p) => p.id === fullscreenPrinterId)?.name || '')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Сохранить снимок
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
