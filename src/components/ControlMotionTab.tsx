import React from 'react';
import { BambuPrinter, SpeedMode } from '../types/printer';
import {
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Home,
  Flame,
  Fan,
  Sliders,
  Move,
  RotateCcw,
  Gauge,
  Power
} from 'lucide-react';

interface ControlMotionTabProps {
  printer: BambuPrinter;
  onJogAxis: (printerId: string, axis: 'X' | 'Y' | 'Z', distance: number) => void;
  onHomeAxis: (printerId: string, axis: 'ALL' | 'X' | 'Y' | 'Z') => void;
  onExtrude: (printerId: string, amount: number) => void;
  onRetract: (printerId: string, amount: number) => void;
  onSetFanSpeed: (printerId: string, type: 'part' | 'aux' | 'exhaust', speed: number) => void;
  onSetSpeedMode: (printerId: string, mode: SpeedMode) => void;
  onDisableMotors: (printerId: string) => void;
}

export const ControlMotionTab: React.FC<ControlMotionTabProps> = ({
  printer,
  onJogAxis,
  onHomeAxis,
  onExtrude,
  onRetract,
  onSetFanSpeed,
  onSetSpeedMode,
  onDisableMotors,
}) => {
  const jogDistances = [1, 10, 50, 100];
  const [jogStep, setJogStep] = React.useState<number>(10);

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Управление перемещением и инструментальной головкой ({printer.name})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ручные команды G-code по LAN, тест шагового мотора экструдера и вспомогательные вентиляторы
            </p>
          </div>
        </div>

        <button
          onClick={() => onDisableMotors(printer.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-500 border border-slate-200 dark:border-slate-700 text-xs font-bold transition"
        >
          <Power className="w-3.5 h-3.5" />
          <span>Отключить шаговые двигатели (M84)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* XY JOG DIRECTIONAL D-PAD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-center">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Move className="w-4 h-4 text-emerald-500" />
            Перемещение головки X / Y
          </h3>

          {/* Jog Distance Step Selector */}
          <div className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl max-w-xs mx-auto">
            {jogDistances.map((d) => (
              <button
                key={d}
                onClick={() => setJogStep(d)}
                className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  jogStep === d
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d} мм
              </button>
            ))}
          </div>

          {/* D-Pad Buttons */}
          <div className="w-48 h-48 mx-auto relative flex items-center justify-center my-4">
            <button
              onClick={() => onJogAxis(printer.id, 'Y', jogStep)}
              className="absolute top-0 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-md transition"
              title={`Сдвиг Y +${jogStep}мм`}
            >
              <ArrowUp className="w-5 h-5 mx-auto" />
              <span>+Y</span>
            </button>

            <button
              onClick={() => onJogAxis(printer.id, 'Y', -jogStep)}
              className="absolute bottom-0 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-md transition"
              title={`Сдвиг Y -${jogStep}мм`}
            >
              <span>-Y</span>
              <ArrowDown className="w-5 h-5 mx-auto" />
            </button>

            <button
              onClick={() => onJogAxis(printer.id, 'X', -jogStep)}
              className="absolute left-0 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-md transition"
              title={`Сдвиг X -${jogStep}мм`}
            >
              <ArrowLeft className="w-5 h-5 mx-auto" />
              <span>-X</span>
            </button>

            <button
              onClick={() => onJogAxis(printer.id, 'X', jogStep)}
              className="absolute right-0 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-extrabold text-xs shadow-md transition"
              title={`Сдвиг X +${jogStep}мм`}
            >
              <ArrowRight className="w-5 h-5 mx-auto" />
              <span>+X</span>
            </button>

            <button
              onClick={() => onHomeAxis(printer.id, 'ALL')}
              className="w-14 h-14 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-105 transition"
              title="Домой все оси (G28)"
            >
              <Home className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onHomeAxis(printer.id, 'X')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Домой X
            </button>
            <button
              onClick={() => onHomeAxis(printer.id, 'Y')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Домой Y
            </button>
          </div>
        </div>

        {/* Z-AXIS BED JOG & EXTRUDER TEST */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowUp className="w-4 h-4 text-emerald-500" />
            Высота стола по оси Z
          </h3>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onJogAxis(printer.id, 'Z', jogStep)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition shadow-xs"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Поднять стол +{jogStep}мм</span>
            </button>

            <button
              onClick={() => onJogAxis(printer.id, 'Z', -jogStep)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition shadow-xs"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Опустить стол -{jogStep}мм</span>
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
              Тест подачи филамента (экструдер)
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onExtrude(printer.id, 10)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
              >
                Выдавить 10мм
              </button>
              <button
                onClick={() => onRetract(printer.id, 10)}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs"
              >
                Откатить 10мм
              </button>
            </div>
          </div>
        </div>

        {/* FANS & AUXILIARY CONTROLS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Fan className="w-4 h-4 text-cyan-500" />
            Вентиляторы Bambu (ШИМ)
          </h3>

          <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
            {/* Part Cooling Fan */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Обдув детали</span>
                <span className="font-mono text-cyan-500">{printer.fanSpeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={printer.fanSpeed}
                onChange={(e) => onSetFanSpeed(printer.id, 'part', Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Aux Fan */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Вспомогательный обдув камеры</span>
                <span className="font-mono text-cyan-500">{printer.auxFanSpeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={printer.auxFanSpeed}
                onChange={(e) => onSetFanSpeed(printer.id, 'aux', Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Exhaust Fan */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Вытяжка из камеры</span>
                <span className="font-mono text-cyan-500">{printer.exhaustFanSpeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={printer.exhaustFanSpeed}
                onChange={(e) => onSetFanSpeed(printer.id, 'exhaust', Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
