import React, { useState } from 'react';
import {
  GCodeFile,
  QueueJobItem,
  BambuPrinter,
  BambuModel
} from '../types/printer';
import {
  FileCode,
  Plus,
  Play,
  Trash2,
  Clock,
  Layers,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ListOrdered,
  Cpu,
  Zap
} from 'lucide-react';

interface FarmQueueTabProps {
  files: GCodeFile[];
  queue: QueueJobItem[];
  printers: BambuPrinter[];
  onAddQueueItem: (item: QueueJobItem) => void;
  onRemoveQueueItem: (id: string) => void;
  onDispatchNextJob: () => void;
  onUploadFile: (file: GCodeFile) => void;
  onDeleteFile: (id: string) => void;
  onStartPrintDirect: (printerId: string, file: GCodeFile) => void;
}

export const FarmQueueTab: React.FC<FarmQueueTabProps> = ({
  files,
  queue,
  printers,
  onAddQueueItem,
  onRemoveQueueItem,
  onDispatchNextJob,
  onUploadFile,
  onDeleteFile,
  onStartPrintDirect,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [copiesCount, setCopiesCount] = useState<number>(1);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [targetModel, setTargetModel] = useState<BambuModel | 'Any'>('Any');

  const idlePrintersCount = printers.filter((p) => p.status === 'idle').length;

  const handleCreateQueueItem = (e: React.FormEvent) => {
    e.preventDefault();
    const file = files.find((f) => f.id === selectedFileId);
    if (!file) return;

    const newItem: QueueJobItem = {
      id: `q-${Date.now()}`,
      file,
      targetModel,
      requiredMaterial: file.requiredMaterial,
      requiredColorHex: file.requiredColorHex,
      copiesCount,
      copiesCompleted: 0,
      priority,
      status: 'queued',
      addedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    onAddQueueItem(newItem);
    setShowAddModal(false);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      const newGCodeFile: GCodeFile = {
        id: `f-${Date.now()}`,
        name: uploadedFile.name,
        size: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        estimatedTimeSeconds: 5400, // 1h 30m default estimate
        filamentUsedGrams: 85,
        filamentUsedMeters: 28.5,
        layerHeight: 0.2,
        totalLayers: 200,
        requiredMaterial: 'PLA Basic',
        requiredColorHex: '#0284c7',
        dimensions: { x: 120, y: 120, z: 45 },
      };
      onUploadFile(newGCodeFile);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & SMART DISPATCH BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/20">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Очередь печати фермы и диспетчер
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Автоматическое распределение заданий печати на свободные принтеры Bambu в локальной сети
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Свободных принтеров: <span className="font-bold text-emerald-500">{idlePrintersCount}</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>Добавить задание</span>
          </button>

          <button
            onClick={onDispatchNextJob}
            disabled={queue.length === 0 || idlePrintersCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Авто-запуск следующего задания</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: ACTIVE QUEUE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              Ожидающие задания в очереди ({queue.length})
            </h3>
            <span className="text-xs text-slate-400">
              Сортировка по приоритету и времени
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <ListOrdered className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Очередь печати пуста
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Нажмите «Добавить задание» или выберите файл из библиотеки G-Code для автоматического распределения по принтерам фермы Bambu.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-extrabold text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {item.file.name}
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                          item.priority === 'urgent'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : item.priority === 'high'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                        }`}>
                          {item.priority === 'urgent' ? 'Срочный' : item.priority === 'high' ? 'Высокий' : item.priority === 'normal' ? 'Обычный' : 'Низкий'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                        <span>Цель: {item.targetModel === 'Any' ? 'Любой принтер' : item.targetModel}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-slate-400"
                            style={{ backgroundColor: item.requiredColorHex }}
                          ></span>
                          {item.requiredMaterial}
                        </span>
                        <span>•</span>
                        <span>Копии: {item.copiesCompleted} / {item.copiesCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRemoveQueueItem(item.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition"
                      title="Удалить из очереди"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COL: LOCAL GCODE FILE LIBRARY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              Пул файлов 3MF / GCODE ({files.length})
            </h3>

            {/* Upload Button */}
            <label className="cursor-pointer px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition">
              <Upload className="w-3.5 h-3.5 text-cyan-500" />
              <span>Загрузить 3MF</span>
              <input
                type="file"
                accept=".gcode,.3mf"
                onChange={handleSimulateUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[200px]">
                    {file.name}
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="text-slate-400 hover:text-rose-500 text-xs"
                    title="Удалить файл"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
                  <span>Размер: {file.size}</span>
                  <span>Время: ~{Math.round(file.estimatedTimeSeconds / 60)} мин</span>
                  <span>Вес: {file.filamentUsedGrams}г</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADD QUEUE JOB MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateQueueItem}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Добавить задание в очередь фермы
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Выберите файл 3MF
                </label>
                <select
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {files.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.requiredMaterial})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Целевая модель Bambu
                </label>
                <select
                  value={targetModel}
                  onChange={(e) => setTargetModel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="Any">Любой свободный принтер Bambu</option>
                  <option value="X1-Carbon">X1-Carbon</option>
                  <option value="X1-E">X1-E Enterprise</option>
                  <option value="P1S">P1S</option>
                  <option value="A1">A1</option>
                  <option value="A1-Mini">A1 Mini</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Количество копий
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={copiesCount}
                    onChange={(e) => setCopiesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Приоритет
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="low">Низкий</option>
                    <option value="normal">Обычный</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20"
              >
                Отправить в очередь
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
