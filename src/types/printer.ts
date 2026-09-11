export type BambuModel = 'X1-Carbon' | 'X1-E' | 'P1S' | 'P1P' | 'A1' | 'A1-Mini' | 'H1-Series';

export type SpeedMode = 'silent' | 'standard' | 'sport' | 'ludicrous';

export type PrinterStatus = 'idle' | 'heating' | 'homing' | 'printing' | 'paused' | 'error' | 'offline' | 'clearing_bed';

export type ConnectionStatus = 'connected' | 'connecting' | 'lan_error' | 'offline';

export interface AMSSlot {
  slotId: number; // 1..4
  colorName: string;
  colorHex: string;
  material: 'PLA Basic' | 'PLA Matte' | 'PLA Support' | 'PETG HF' | 'ABS' | 'ASA' | 'TPU 95A' | 'PC' | 'PPA-CF';
  brand: string;
  remainingPercent: number; // 0..100
  weightGrams: number;
  active: boolean;
  rfidSynced: boolean;
  trayInfoKey?: string;
}

export interface AMSUnit {
  id: string;
  unitNumber: number; // 1, 2, 3, 4
  slots: AMSSlot[];
  humidityScore: number; // 1 (Dry) to 5 (Damp)
  temperature: number; // Ambient in AMS
}

export interface HMSAlert {
  id: string;
  code: string; // e.g. "HMS_0300_1000_0001_0001"
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
}

export interface MaintenanceMetric {
  totalPrintHours: number;
  ptfeTubeHours: number; // max ~1000h
  carbonFilterHours: number; // max ~300h
  leadScrewHours: number; // max ~250h for lube
  nozzleWearPercent: number;
}

export interface BambuPrinter {
  id: string;
  name: string;
  model: BambuModel;
  serialNumber: string;
  ipAddress: string;
  accessCode: string; // LAN Access Code (8-digit key)
  connectionStatus: ConnectionStatus;
  status: PrinterStatus;
  rackGroup: string; // e.g., "Rack 1 - Top", "Rack 2 - Main", "A1 Station"
  nozzleTemp: number;
  nozzleTarget: number;
  bedTemp: number;
  bedTarget: number;
  chamberTemp: number;
  chamberTarget: number;
  nozzleSize: number; // 0.2, 0.4, 0.6, 0.8
  buildPlateType: 'Textured PEI Plate' | 'Smooth PEI Plate' | 'Engineering Plate' | 'Cool Plate' | 'High Temp Plate';
  speedMode: SpeedMode;
  chamberLight: boolean;
  logoLight: boolean;
  fanSpeed: number; // Part fan 0-100%
  auxFanSpeed: number; // Aux fan 0-100%
  exhaustFanSpeed: number; // Chamber exhaust 0-100%
  amsUnits: AMSUnit[];
  activeAmsUnit?: number;
  activeAmsSlot?: number;
  maintenance: MaintenanceMetric;
  hmsAlerts: HMSAlert[];
  cameraUrl: string; // LAN RTSP / Local Snapshot URL
  fps: number;
  currentJob?: ActiveJob;
  pingMs: number;
  firmwareVersion: string;
}

export interface GCodeFile {
  id: string;
  name: string;
  size: string; // e.g. "18.4 MB"
  uploadDate: string;
  estimatedTimeSeconds: number;
  filamentUsedGrams: number;
  filamentUsedMeters: number;
  layerHeight: number;
  totalLayers: number;
  requiredMaterial: string;
  requiredColorHex: string;
  dimensions: { x: number; y: number; z: number };
  plateIndex?: number;
  thumbnailUrl?: string;
}

export interface ActiveJob {
  id: string;
  file: GCodeFile;
  startTime: number;
  elapsedSeconds: number;
  currentLayer: number;
  totalLayers: number;
  progressPercent: number;
  speedMode: SpeedMode;
  assignedPrinterId: string;
  status: PrinterStatus;
}

export interface QueueJobItem {
  id: string;
  file: GCodeFile;
  targetModel?: BambuModel | 'Any';
  requiredMaterial: string;
  requiredColorHex: string;
  copiesCount: number;
  copiesCompleted: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedPrinterId?: string;
  status: 'queued' | 'dispatching' | 'printing' | 'completed' | 'cancelled';
  addedAt: string;
}

export interface TemperaturePoint {
  time: string;
  nozzleActual: number;
  nozzleTarget: number;
  bedActual: number;
  bedTarget: number;
  chamberActual: number;
  chamberTarget: number;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'sent' | 'received' | 'warning' | 'error' | 'info';
  printerId?: string;
  printerName?: string;
  message: string;
}
