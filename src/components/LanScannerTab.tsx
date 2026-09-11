import React, { useState } from 'react';
import { BambuPrinter, BambuModel } from '../types/printer';
import {
  Wifi,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ShieldCheck,
  KeyRound,
  Server,
  Radio,
  Sliders,
  Cpu,
  Trash2
} from 'lucide-react';

interface LanScannerTabProps {
  printers: BambuPrinter[];
  onAddPrinter: (newPrinter: BambuPrinter) => void;
  onRemovePrinter: (printerId: string) => void;
  onVerifyConnection: (printerId: string) => void;
}

export const LanScannerTab: React.FC<LanScannerTabProps> = ({
  printers,
  onAddPrinter,
  onRemovePrinter,
  onVerifyConnection,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<
    { name: string; model: BambuModel; ip: string; sn: string; detected: boolean }[]
  >([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [model, setModel] = useState<BambuModel>('P1S');
  const [ipAddress, setIpAddress] = useState('192.168.1.188');
  const [accessCode, setAccessCode] = useState('8f2a91b4');
  const [serialNumber, setSerialNumber] = useState('01P00A990100123');
  const [rackGroup, setRackGroup] = useState('Rack 02 - Top');

  const handleScanSubnet = () => {
    setIsScanning(true);
    setDiscoveredDevices([]);

    setTimeout(() => {
      setDiscoveredDevices([
        {
          name: 'Обнаружен Bambu P1S',
          model: 'P1S',
          ip: '192.168.1.189',
          sn: '01P00C990200888',
          detected: true,
        },
        {
          name: 'Обнаружен Bambu A1 Mini',
          model: 'A1-Mini',
          ip: '192.168.1.192',
          sn: '03M00B990400441',
          detected: true,
        },
      ]);
      setIsScanning(false);
    }, 2500);
  };

  const handleSubmitAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress || !accessCode) return;

    const newP: BambuPrinter = {
      id: `bambu-custom-${Date.now()}`,
      name,
      model,
      serialNumber,
      ipAddress,
      accessCode,
      connectionStatus: 'connected',
      status: 'idle',
      rackGroup,
      nozzleTemp: 24,
      nozzleTarget: 0,
      bedTemp: 23,
      bedTarget: 0,
      chamberTemp: 24,
      chamberTarget: 0,
      nozzleSize: 0.4,
      buildPlateType: 'Textured PEI Plate',
      speedMode: 'standard',
      chamberLight: false,
      logoLight: true,
      fanSpeed: 0,
      auxFanSpeed: 0,
      exhaustFanSpeed: 0,
      pingMs: 4,
      firmwareVersion: '01.07.00.00',
      amsUnits: [
        {
          id: `ams-${Date.now()}`,
          unitNumber: 1,
          humidityScore: 1,
          temperature: 24,
          slots: [
            {
              slotId: 1,
              colorName: 'Bambu PLA Basic Black',
              colorHex: '#18181b',
              material: 'PLA Basic',
              brand: 'Bambu Lab',
              remainingPercent: 100,
              weightGrams: 1000,
              active: true,
              rfidSynced: true,
            },
          ],
        },
      ],
      maintenance: {
        totalPrintHours: 0,
        ptfeTubeHours: 0,
        carbonFilterHours: 0,
        leadScrewHours: 0,
        nozzleWearPercent: 0,
      },
      hmsAlerts: [],
      cameraUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      fps: 15,
    };

    onAddPrinter(newP);
    setShowAddForm(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              Сканер локальной сети LAN и доступ
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Управление ключами MQTT TLS, точками FTPS и обнаружением mDNS / SSDP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleScanSubnet}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Сканирование 192.168.1.0/24...' : 'Сканировать подсеть LAN'}</span>
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить принтер (LAN)</span>
          </button>
        </div>
      </div>

      {/* DISCOVERED DEVICES ALERT IF ANY */}
      {discoveredDevices.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Автоматически обнаружено принтеров в локальной сети: {discoveredDevices.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {discoveredDevices.map((dev, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs font-medium"
              >
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{dev.name} ({dev.model})</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    IP: {dev.ip} • SN: {dev.sn}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setName(dev.name);
                    setModel(dev.model);
                    setIpAddress(dev.ip);
                    setSerialNumber(dev.sn);
                    setShowAddForm(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                >
                  Настроить ключ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONNECTED PRINTERS CONNECTION INSPECTOR MATRIX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Активные подключения LAN и ключи доступа ({printers.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 px-2">Имя принтера</th>
                <th className="pb-3 px-2">Модель</th>
                <th className="pb-3 px-2">IP адрес</th>
                <th className="pb-3 px-2">Код доступа LAN</th>
                <th className="pb-3 px-2">MQTT TLS (8883)</th>
                <th className="pb-3 px-2">FTPS (990)</th>
                <th className="pb-3 px-2">Пинг</th>
                <th className="pb-3 px-2 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {printers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-2 font-extrabold text-slate-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-500">{p.model}</td>
                  <td className="py-3 px-2 font-mono text-slate-800 dark:text-slate-200">{p.ipAddress}</td>
                  <td className="py-3 px-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ••••{p.accessCode.slice(-4)}
                  </td>
                  <td className="py-3 px-2">
                    {p.connectionStatus === 'lan_error' ? (
                      <span className="text-rose-500 font-bold text-[10px]">ОШИБКА РУКОПОЖАТИЯ</span>
                    ) : (
                      <span className="text-emerald-500 font-bold text-[10px]">ПОДКЛЮЧЕНО</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-emerald-500 font-bold text-[10px]">ГОТОВ</td>
                  <td className="py-3 px-2 font-mono text-slate-400">{p.pingMs} мс</td>
                  <td className="py-3 px-2 text-right space-x-2">
                    <button
                      onClick={() => onVerifyConnection(p.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                    >
                      Проверить
                    </button>
                    <button
                      onClick={() => onRemovePrinter(p.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                      title="Удалить принтер"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRINTER FORM MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitAddPrinter}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Добавить принтер Bambu (режим LAN)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Название принтера
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="напр. X1C-Дзета (Стойка 3)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Модель Bambu Lab
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="X1-Carbon">X1-Carbon</option>
                  <option value="X1-E">X1-E Enterprise</option>
                  <option value="P1S">P1S</option>
                  <option value="P1P">P1P</option>
                  <option value="A1">A1</option>
                  <option value="A1-Mini">A1 Mini</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    IP-адрес в LAN
                  </label>
                  <input
                    type="text"
                    required
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.xxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    8-значный код доступа LAN
                  </label>
                  <input
                    type="text"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="напр. 8f2a91b4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Стойка / Локация группы
                </label>
                <input
                  type="text"
                  value={rackGroup}
                  onChange={(e) => setRackGroup(e.target.value)}
                  placeholder="напр. Стойка 01 - Верх"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20"
              >
                Подключить принтер по LAN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
