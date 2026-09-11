import React, { useState, useEffect } from 'react';
import {
  BambuPrinter,
  GCodeFile,
  QueueJobItem,
  SpeedMode,
  AMSSlot
} from './types/printer';
import {
  INITIAL_BAMBU_PRINTERS,
  INITIAL_GCODE_FILES,
  INITIAL_QUEUE
} from './data/mockData';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { AMSMatrixTab } from './components/AMSMatrixTab';
import { FarmQueueTab } from './components/FarmQueueTab';
import { CameraWallTab } from './components/CameraWallTab';
import { LanScannerTab } from './components/LanScannerTab';
import { HMSDoctorTab } from './components/HMSDoctorTab';
import { ControlMotionTab } from './components/ControlMotionTab';
import { TerminalTab } from './components/TerminalTab';
import {
  Grid,
  Disc,
  ListOrdered,
  Video,
  Wifi,
  Bot,
  Compass,
  Terminal as TerminalIcon,
  Zap,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export function App() {
  const [printers, setPrinters] = useState<BambuPrinter[]>(INITIAL_BAMBU_PRINTERS);
  const [selectedPrinter, setSelectedPrinter] = useState<BambuPrinter>(INITIAL_BAMBU_PRINTERS[0]);
  const [files, setFiles] = useState<GCodeFile[]>(INITIAL_GCODE_FILES);
  const [queue, setQueue] = useState<QueueJobItem[]>(INITIAL_QUEUE);
  const [activeTab, setActiveTab] = useState<
    'fleet' | 'ams' | 'queue' | 'cams' | 'lan' | 'hms' | 'motion' | 'logs'
  >('fleet');

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Подключено к локальному брокеру MQTT по адресу 192.168.1.1 (TLS порт 8883)`,
    `[${new Date().toLocaleTimeString()}] Режим LAN-Only: облачная синхронизация отключена. Весь трафик изолирован в локальной подсети.`,
    `[${new Date().toLocaleTimeString()}] Оформлена подписка на 5 принтеров Bambu Lab (X1C, X1E, P1S, A1, A1-Mini).`,
  ]);

  // Handle Dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keep selected printer reference synced
  useEffect(() => {
    const updated = printers.find((p) => p.id === selectedPrinter.id);
    if (updated) setSelectedPrinter(updated);
  }, [printers]);

  // Simulated LAN MQTT Tick Timer (Simulates printing progress & sensor updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setPrinters((prevPrinters) =>
        prevPrinters.map((p) => {
          if (p.status === 'printing' && p.currentJob) {
            const nextElapsed = p.currentJob.elapsedSeconds + 2;
            const totalSecs = p.currentJob.file.estimatedTimeSeconds;
            const nextProgress = Math.min(100, Math.round((nextElapsed / totalSecs) * 100));
            const nextLayer = Math.min(
              p.currentJob.totalLayers,
              Math.ceil((nextProgress / 100) * p.currentJob.totalLayers)
            );

            // Complete print job
            if (nextProgress >= 100) {
              addLog(`[MQTT] ${p.name}: Print completed for '${p.currentJob.file.name}'. Hotend cooling down.`);
              return {
                ...p,
                status: 'idle',
                currentJob: undefined,
                nozzleTarget: 0,
                bedTarget: 0,
              };
            }

            return {
              ...p,
              currentJob: {
                ...p.currentJob,
                elapsedSeconds: nextElapsed,
                progressPercent: nextProgress,
                currentLayer: nextLayer,
              },
            };
          }
          return p;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 100)]);
  };

  // ACTIONS
  const handleEmergencyStopAll = () => {
    setPrinters((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'error',
        nozzleTarget: 0,
        bedTarget: 0,
        fanSpeed: 0,
        currentJob: undefined,
      }))
    );
    addLog(`🚨 EMERGENCY HALT (M112) SENT TO ALL ${printers.length} BAMBU PRINTERS! STEPPERS & HEATERS KILLED.`);
  };

  const handleBatchPreheat = (preset: { nozzle: number; bed: number }) => {
    setPrinters((prev) =>
      prev.map((p) => ({
        ...p,
        nozzleTarget: preset.nozzle,
        bedTarget: preset.bed,
        nozzleTemp: preset.nozzle > 0 ? Math.max(p.nozzleTemp, 180) : p.nozzleTemp,
        bedTemp: preset.bed > 0 ? Math.max(p.bedTemp, 50) : p.bedTemp,
      }))
    );
    addLog(`[BATCH] Pre-heating nozzle to ${preset.nozzle}°C and bed to ${preset.bed}°C across all printers.`);
  };

  const handleBatchToggleLights = () => {
    setPrinters((prev) =>
      prev.map((p) => ({
        ...p,
        chamberLight: !p.chamberLight,
      }))
    );
    addLog(`[BATCH] Toggled chamber illumination LEDs on all Bambu units.`);
  };

  const handleSetNozzleTarget = (printerId: string, temp: number) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === printerId ? { ...p, nozzleTarget: temp } : p))
    );
    addLog(`[MQTT] ${printerId}: Set nozzle target to ${temp}°C`);
  };

  const handleSetBedTarget = (printerId: string, temp: number) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === printerId ? { ...p, bedTarget: temp } : p))
    );
    addLog(`[MQTT] ${printerId}: Set bed target to ${temp}°C`);
  };

  const handleSetSpeedMode = (printerId: string, mode: SpeedMode) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === printerId ? { ...p, speedMode: mode } : p))
    );
    addLog(`[MQTT] ${printerId}: Changed speed profile to '${mode.toUpperCase()}'`);
  };

  const handleToggleChamberLight = (printerId: string) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === printerId ? { ...p, chamberLight: !p.chamberLight } : p))
    );
    addLog(`[MQTT] ${printerId}: Toggled chamber light`);
  };

  const handlePausePrint = (printerId: string) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === printerId ? { ...p, status: 'paused' } : p))
    );
    addLog(`[MQTT] ${printerId}: Print job paused via LAN.`);
  };

  const handleResumePrint = (printerId: string) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === printerId ? { ...p, status: 'printing' } : p))
    );
    addLog(`[MQTT] ${printerId}: Print job resumed.`);
  };

  const handleCancelPrint = (printerId: string) => {
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === printerId
          ? { ...p, status: 'idle', currentJob: undefined, nozzleTarget: 0, bedTarget: 0 }
          : p
      )
    );
    addLog(`[MQTT] ${printerId}: Print job cancelled.`);
  };

  const handleStartPrintJob = (printerId: string, file: GCodeFile) => {
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === printerId
          ? {
              ...p,
              status: 'printing',
              nozzleTarget: 220,
              bedTarget: 60,
              nozzleTemp: 220,
              bedTemp: 60,
              currentJob: {
                id: `job-${Date.now()}`,
                assignedPrinterId: printerId,
                file,
                startTime: Date.now(),
                elapsedSeconds: 0,
                progressPercent: 0,
                currentLayer: 1,
                totalLayers: file.totalLayers,
                speedMode: 'standard' as SpeedMode,
                status: 'printing',
              },
            }
          : p
      )
    );
    addLog(`[FTPS + MQTT] Dispatched GCode '${file.name}' to ${printerId}`);
  };

  const handleUpdateAMSSlot = (
    printerId: string,
    amsId: string,
    slotId: number,
    newSlotData: Partial<AMSSlot>
  ) => {
    setPrinters((prev) =>
      prev.map((p) => {
        if (p.id !== printerId) return p;
        return {
          ...p,
          amsUnits: p.amsUnits.map((u) => {
            if (u.id !== amsId) return u;
            return {
              ...u,
              slots: u.slots.map((s) => (s.slotId === slotId ? { ...s, ...newSlotData } : s)),
            };
          }),
        };
      })
    );
    addLog(`[AMS] Updated Spool configuration in AMS Slot #${slotId} on ${printerId}`);
  };

  const handleSyncRFIDAll = () => {
    addLog(`[RFID] Synchronizing all Bambu RFID Spools across connected AMS units...`);
  };

  const handleDispatchNextQueueJob = () => {
    if (queue.length === 0) return;
    const idlePrinter = printers.find((p) => p.status === 'idle');
    if (!idlePrinter) {
      alert('В данный момент нет свободных принтеров Bambu для принятия задания.');
      return;
    }

    const nextJob = queue[0];
    handleStartPrintJob(idlePrinter.id, nextJob.file);
    setQueue((prev) => prev.slice(1));
    addLog(`[ДИСПЕТЧЕР] Задание из очереди '${nextJob.file.name}' автоматически назначено на свободный принтер '${idlePrinter.name}'.`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      
      {/* HEADER */}
      <Header
        printers={printers}
        activePrinter={selectedPrinter}
        onSelectPrinter={setSelectedPrinter}
        onEmergencyStop={handleEmergencyStopAll}
        onBatchPreheat={handleBatchPreheat}
        onBatchToggleLights={handleBatchToggleLights}
        onOpenAddPrinterModal={() => setActiveTab('lan')}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* NAVIGATION TABS BAR */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'fleet'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Панель фермы</span>
            </button>

            <button
              onClick={() => setActiveTab('ams')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'ams'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span>Матрица AMS</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'queue'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Очередь печати ({queue.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cams')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'cams'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Камеры RTSP</span>
            </button>

            <button
              onClick={() => setActiveTab('lan')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'lan'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>Сканер LAN</span>
            </button>

            <button
              onClick={() => setActiveTab('hms')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'hms'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>HMS и ИИ-доктор</span>
            </button>

            <button
              onClick={() => setActiveTab('motion')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'motion'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Управление осями</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TerminalIcon className="w-4 h-4" />
              <span>Терминал MQTT</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'fleet' && (
          <DashboardTab
            printers={printers}
            selectedPrinter={selectedPrinter}
            onSelectPrinter={setSelectedPrinter}
            files={files}
            onSetNozzleTarget={handleSetNozzleTarget}
            onSetBedTarget={handleSetBedTarget}
            onSetSpeedMode={handleSetSpeedMode}
            onToggleChamberLight={handleToggleChamberLight}
            onPausePrint={handlePausePrint}
            onResumePrint={handleResumePrint}
            onCancelPrint={handleCancelPrint}
            onStartPrintJob={handleStartPrintJob}
            onOpenPrinterDetails={(p) => {
              setSelectedPrinter(p);
              setActiveTab('motion');
            }}
          />
        )}

        {activeTab === 'ams' && (
          <AMSMatrixTab
            printers={printers}
            onUpdateAMSSlot={handleUpdateAMSSlot}
            onSyncRFIDAll={handleSyncRFIDAll}
          />
        )}

        {activeTab === 'queue' && (
          <FarmQueueTab
            files={files}
            queue={queue}
            printers={printers}
            onAddQueueItem={(item) => setQueue([...queue, item])}
            onRemoveQueueItem={(id) => setQueue(queue.filter((q) => q.id !== id))}
            onDispatchNextJob={handleDispatchNextQueueJob}
            onUploadFile={(newFile) => setFiles([newFile, ...files])}
            onDeleteFile={(id) => setFiles(files.filter((f) => f.id !== id))}
            onStartPrintDirect={handleStartPrintJob}
          />
        )}

        {activeTab === 'cams' && (
          <CameraWallTab
            printers={printers}
            onToggleChamberLight={handleToggleChamberLight}
          />
        )}

        {activeTab === 'lan' && (
          <LanScannerTab
            printers={printers}
            onAddPrinter={(np) => setPrinters([...printers, np])}
            onRemovePrinter={(id) => setPrinters(printers.filter((p) => p.id !== id))}
            onVerifyConnection={(id) => addLog(`[PING] Verified MQTT TLS handshake on ${id}`)}
          />
        )}

        {activeTab === 'hms' && <HMSDoctorTab printers={printers} />}

        {activeTab === 'motion' && (
          <ControlMotionTab
            printer={selectedPrinter}
            onJogAxis={(pId, axis, dist) => addLog(`[GCODE] ${pId}: G91 G0 ${axis}${dist}`)}
            onHomeAxis={(pId, axis) => addLog(`[GCODE] ${pId}: G28 ${axis === 'ALL' ? '' : axis}`)}
            onExtrude={(pId, amt) => addLog(`[GCODE] ${pId}: G1 E${amt} F300`)}
            onRetract={(pId, amt) => addLog(`[GCODE] ${pId}: G1 E-${amt} F1800`)}
            onSetFanSpeed={(pId, type, spd) => addLog(`[MQTT] ${pId}: Fan ${type} set to ${spd}%`)}
            onSetSpeedMode={handleSetSpeedMode}
            onDisableMotors={(pId) => addLog(`[GCODE] ${pId}: M84 (Disable Steppers)`)}
          />
        )}

        {activeTab === 'logs' && (
          <TerminalTab
            logs={logs}
            onSendGCode={(cmd) => addLog(`SENT: ${cmd}`)}
            onClearLogs={() => setLogs([])}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Диспетчер фермы Bambu • Активен режим только локальной сети (LAN-Only)</span>
          </div>
          <div>
            Локальный MQTT SSL • FTPS • Центр потоков RTSP
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
