import React, { useState } from 'react';
import { BambuPrinter, AMSSlot, AMSUnit } from '../types/printer';
import {
  Disc,
  RefreshCw,
  Plus,
  Layers,
  Sparkles,
  Droplets,
  Zap,
  Info,
  CheckCircle2,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface AMSMatrixTabProps {
  printers: BambuPrinter[];
  onUpdateAMSSlot: (printerId: string, amsId: string, slotId: number, newSlotData: Partial<AMSSlot>) => void;
  onSyncRFIDAll: () => void;
}

export const AMSMatrixTab: React.FC<AMSMatrixTabProps> = ({
  printers,
  onUpdateAMSSlot,
  onSyncRFIDAll,
}) => {
  const [selectedPrinterFilter, setSelectedPrinterFilter] = useState<string>('all');
  const [editingSlot, setEditingSlot] = useState<{ printerId: string; amsId: string; slot: AMSSlot } | null>(null);

  // Calculate total material stats
  let totalSpools = 0;
  let activeInUse = 0;
  let totalMaterialWeightKg = 0;

  printers.forEach((p) => {
    p.amsUnits.forEach((u) => {
      u.slots.forEach((s) => {
        totalSpools++;
        if (s.active) activeInUse++;
        totalMaterialWeightKg += s.weightGrams / 1000;
      });
    });
  });

  const filteredPrinters = printers.filter((p) => {
    if (selectedPrinterFilter !== 'all' && p.id !== selectedPrinterFilter) return false;
    return p.amsUnits.length > 0;
  });

  return (
    <div className="space-y-6">
      
      {/* AMS HEADER STATS & SYNC BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Матрица материалов Bambu AMS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Управление слотами филамента, синхронизация RFID и контроль влажности сухих боксов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats summary pills */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Всего катушек: <span className="text-purple-600 dark:text-purple-400">{totalSpools}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              В работе: {activeInUse}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              Запас: {totalMaterialWeightKg.toFixed(1)} кг
            </div>
          </div>

          <button
            onClick={onSyncRFIDAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/20 transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-once" />
            <span>Синхронизировать RFID</span>
          </button>
        </div>
      </div>

      {/* PRINTER FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPrinterFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            selectedPrinterFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Все модули AMS ({printers.reduce((acc, p) => acc + p.amsUnits.length, 0)})
        </button>
        {printers.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPrinterFilter(p.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
              selectedPrinterFilter === p.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{p.name}</span>
            <span className="text-[10px] font-mono opacity-70">({p.model})</span>
          </button>
        ))}
      </div>

      {/* AMS CARDS LIST */}
      <div className="space-y-6">
        {filteredPrinters.map((printer) => (
          <div
            key={printer.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
          >
            {/* Printer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  {printer.model.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {printer.name}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      {printer.ipAddress}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Локация: {printer.rackGroup} • Прошивка {printer.firmwareVersion}
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-slate-500">
                Модулей AMS: {printer.amsUnits.length}
              </div>
            </div>

            {/* AMS Units Grid for this printer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {printer.amsUnits.map((ams) => (
                <div
                  key={ams.id}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Disc className="w-4 h-4 text-purple-500" />
                      Модуль AMS #{ams.unitNumber}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                      Влажность: Уровень {ams.humidityScore} (Сухо)
                    </span>
                  </div>

                  {/* 4 Slots Display */}
                  <div className="grid grid-cols-4 gap-2">
                    {ams.slots.map((slot) => (
                      <div
                        key={slot.slotId}
                        onClick={() => setEditingSlot({ printerId: printer.id, amsId: ams.id, slot })}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition hover:scale-[1.02] ${
                          slot.active
                            ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold text-slate-400">СЛОТ {slot.slotId}</span>
                          {slot.rfidSynced && (
                            <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded">
                              RFID
                            </span>
                          )}
                        </div>

                        {/* Color Swatch Circle */}
                        <div className="flex justify-center my-1.5">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-300/50"
                            style={{ backgroundColor: slot.colorHex }}
                          ></div>
                        </div>

                        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                          {slot.material}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {slot.colorName}
                        </div>

                        {/* Remaining Filament Bar */}
                        <div className="mt-2 space-y-1">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-500 h-full rounded-full"
                              style={{ width: `${slot.remainingPercent}%` }}
                            ></div>
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between">
                            <span>{slot.weightGrams}г</span>
                            <span>{slot.remainingPercent}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT SPOOL MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-500" />
                Настройка слота AMS #{editingSlot.slot.slotId}
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Профиль материала
                </label>
                <select
                  value={editingSlot.slot.material}
                  onChange={(e) => {
                    const mat = e.target.value as any;
                    setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, material: mat },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="PLA Basic">Bambu PLA Basic</option>
                  <option value="PLA Matte">Bambu PLA Matte</option>
                  <option value="PLA Support">Bambu Support For PLA</option>
                  <option value="PETG HF">Bambu PETG HF</option>
                  <option value="ABS">Bambu ABS</option>
                  <option value="ASA">Bambu ASA</option>
                  <option value="TPU 95A">Bambu TPU 95A</option>
                  <option value="PC">Bambu PC</option>
                  <option value="PPA-CF">Bambu PPA-CF</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Цвет филамента (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingSlot.slot.colorHex}
                    onChange={(e) =>
                      setEditingSlot({
                        ...editingSlot,
                        slot: { ...editingSlot.slot, colorHex: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingSlot.slot.colorName}
                    onChange={(e) =>
                      setEditingSlot({
                        ...editingSlot,
                        slot: { ...editingSlot.slot, colorName: e.target.value },
                      })
                    }
                    placeholder="Название цвета (напр. Изумрудный)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Остаток веса: {editingSlot.slot.weightGrams}г ({editingSlot.slot.remainingPercent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={editingSlot.slot.weightGrams}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    const pct = Math.round((w / 1000) * 100);
                    setEditingSlot({
                      ...editingSlot,
                      slot: { ...editingSlot.slot, weightGrams: w, remainingPercent: pct },
                    });
                  }}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingSlot(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onUpdateAMSSlot(
                    editingSlot.printerId,
                    editingSlot.amsId,
                    editingSlot.slot.slotId,
                    editingSlot.slot
                  );
                  setEditingSlot(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md shadow-purple-600/20"
              >
                Сохранить катушку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
