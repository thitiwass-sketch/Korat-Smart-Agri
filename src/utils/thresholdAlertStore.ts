import { useState, useEffect, useCallback } from "react";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";

export type ThresholdBreachCategory =
  | "soil_moisture_low"
  | "soil_moisture_high"
  | "rain_prob_high"
  | "rain_14d_high"
  | "rain_14d_low"
  | "spi_drought";

export interface DistrictThresholdConfig {
  districtId: string;
  districtNameTh: string;
  cropFocus: string;
  isActive: boolean;
  // Soil Moisture (%) Thresholds
  enableSoilMoistureLow: boolean;
  soilMoistureMinPct: number; // Trigger when gistdaSoilMoisturePct <= soilMoistureMinPct
  enableSoilMoistureHigh: boolean;
  soilMoistureMaxPct: number; // Trigger when gistdaSoilMoisturePct >= soilMoistureMaxPct
  // Rainfall (% and mm) Thresholds
  enableRainProbHigh: boolean;
  rainProbMaxPct: number; // Trigger when rainProbToday >= rainProbMaxPct
  enableRain14dHigh: boolean;
  rain14dMaxMm: number; // Trigger when forecastRain14dMm >= rain14dMaxMm
  enableRain14dLow: boolean;
  rain14dMinMm: number; // Trigger when forecastRain14dMm <= rain14dMinMm
  // SPI & Temperature
  enableSpiAlert: boolean;
  spiThreshold: number;
  maxTempThresholdC: number;
  // Notification Preferences
  enableSoundAlert: boolean;
  enableBrowserPush: boolean;
  updatedAtIso: string;
}

export interface ThresholdBreachToastItem {
  id: string;
  districtId: string;
  districtNameTh: string;
  cropFocus: string;
  category: ThresholdBreachCategory;
  severity: "critical" | "warning" | "advisory";
  metricLabel: string;
  actualValueText: string;
  thresholdValueText: string;
  deltaText: string;
  title: string;
  message: string;
  remedialAction: string;
  createdAtIso: string;
  autoDismissMs: number;
  isSimulated?: boolean;
}

const STORAGE_KEY_CONFIGS = "korat_smartagri_threshold_configs_v2";
const STORAGE_KEY_HISTORY = "korat_smartagri_threshold_toast_history_v2";

export function createDefaultConfigForDistrict(
  district: KoratDistrict
): DistrictThresholdConfig {
  const isSouthernFruitZone =
    district.id === "pak-chong" ||
    district.id === "wang-nam-khiao" ||
    district.id === "khon-buri" ||
    district.id === "soeng-sang";

  return {
    districtId: district.id,
    districtNameTh: district.nameTh,
    cropFocus: district.primaryCrops[0] || "มันสำปะหลัง",
    isActive: true,
    enableSoilMoistureLow: true,
    soilMoistureMinPct: isSouthernFruitZone ? 38 : 32,
    enableSoilMoistureHigh: isSouthernFruitZone,
    soilMoistureMaxPct: isSouthernFruitZone ? 62 : 68,
    enableRainProbHigh: true,
    rainProbMaxPct: 60,
    enableRain14dHigh: true,
    rain14dMaxMm: isSouthernFruitZone ? 110 : 95,
    enableRain14dLow: true,
    rain14dMinMm: 45,
    enableSpiAlert: true,
    spiThreshold: -1.2,
    maxTempThresholdC: 36,
    enableSoundAlert: true,
    enableBrowserPush: true,
    updatedAtIso: new Date().toISOString(),
  };
}

const INITIAL_PRESET_CONFIGS: Record<string, DistrictThresholdConfig> = (() => {
  const map: Record<string, DistrictThresholdConfig> = {};
  const presetIds = [
    "mueang-nakhon-ratchasima",
    "dan-khun-thot",
    "bua-yai",
    "chum-phuang",
    "pak-chong",
    "wang-nam-khiao",
    "khon-buri",
    "phimai",
  ];
  for (const id of presetIds) {
    const dist = KORAT_DISTRICTS.find((d) => d.id === id);
    if (dist) {
      const cfg = createDefaultConfigForDistrict(dist);
      // Customize specific presets so farmers immediately see realistic threshold monitoring
      if (id === "bua-yai") {
        cfg.soilMoistureMinPct = 30; // Bua Yai is 24% -> breaches low soil moisture!
        cfg.rain14dMinMm = 42;
      } else if (id === "dan-khun-thot") {
        cfg.rainProbMaxPct = 65; // Dan Khun Thot is 75% -> breaches high rain prob!
        cfg.soilMoistureMinPct = 32; // Dan Khun Thot is 28% -> breaches low soil moisture!
      } else if (id === "pak-chong") {
        cfg.rainProbMaxPct = 60;
        cfg.soilMoistureMaxPct = 58;
      }
      map[id] = cfg;
    }
  }
  return map;
})();

export function evaluateDistrictThresholdBreaches(
  district: KoratDistrict,
  config: DistrictThresholdConfig,
  liveOverrides?: {
    soilMoisturePct?: number;
    rainProbTodayPct?: number;
    forecastRain14dMm?: number;
    isSimulated?: boolean;
  }
): ThresholdBreachToastItem[] {
  if (!config.isActive) return [];

  const soilMoisture =
    liveOverrides?.soilMoisturePct ?? district.gistdaSoilMoisturePct;
  const rainProb =
    liveOverrides?.rainProbTodayPct ?? district.rainProbToday;
  const rain14d =
    liveOverrides?.forecastRain14dMm ?? district.forecastRain14dMm;
  const isSimulated = Boolean(liveOverrides?.isSimulated);
  const nowIso = new Date().toISOString();
  const breaches: ThresholdBreachToastItem[] = [];

  // 1. Soil Moisture Low Breach (Drought / Root Zone Water Deficit)
  if (
    config.enableSoilMoistureLow &&
    soilMoisture <= config.soilMoistureMinPct
  ) {
    const diff = Math.max(0, config.soilMoistureMinPct - soilMoisture);
    const isCritical = soilMoisture <= 25 || diff >= 6;
    breaches.push({
      id: `toast_sm_low_${district.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      districtId: district.id,
      districtNameTh: district.nameTh,
      cropFocus: config.cropFocus,
      category: "soil_moisture_low",
      severity: isCritical ? "critical" : "warning",
      metricLabel: "ความชื้นดิน GISTDA (ต่ำกว่าเกณฑ์)",
      actualValueText: `${soilMoisture}%`,
      thresholdValueText: `เกณฑ์ขั้นต่ำ ≤ ${config.soilMoistureMinPct}%`,
      deltaText:
        diff > 0 ? `ต่ำกว่าเกณฑ์ -${diff.toFixed(0)}%` : "แตะระดับวิกฤตที่ตั้งไว้",
      title: `แจ้งเตือนความชื้นดินต่ำกว่าเกณฑ์: ${district.nameTh} (${soilMoisture}%)`,
      message: `ความชื้นดินระดับรากพืชใน ${district.nameTh} ลดลงอยู่ที่ ${soilMoisture}% (เกณฑ์เฝ้าระวังของคุณ ≤ ${config.soilMoistureMinPct}%) เสี่ยงกระทบแปลง${config.cropFocus}`,
      remedialAction: `แนะนำเดินระบบน้ำหยด/ให้น้ำเสริมช่วงเช้าตรู่ งดหว่านปุ๋ยเคมีเม็ดยูเรียกลางแจ้ง และคลุมโคนต้นด้วยฟางหรือใบอ้อยเพื่อลดการระเหยน้ำ`,
      createdAtIso: nowIso,
      autoDismissMs: 9000,
      isSimulated,
    });
  }

  // 2. Soil Moisture High Breach (Waterlogging / Root Rot Warning)
  if (
    config.enableSoilMoistureHigh &&
    soilMoisture >= config.soilMoistureMaxPct
  ) {
    const diff = Math.max(0, soilMoisture - config.soilMoistureMaxPct);
    breaches.push({
      id: `toast_sm_high_${district.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      districtId: district.id,
      districtNameTh: district.nameTh,
      cropFocus: config.cropFocus,
      category: "soil_moisture_high",
      severity: soilMoisture >= 70 ? "critical" : "warning",
      metricLabel: "ความชื้นดินสะสมสูง (เสี่ยงดินแฉะ/รากเน่า)",
      actualValueText: `${soilMoisture}%`,
      thresholdValueText: `เกณฑ์สูงสุด ≥ ${config.soilMoistureMaxPct}%`,
      deltaText:
        diff > 0 ? `สูงเกินเกณฑ์ +${diff.toFixed(0)}%` : "แตะระดับดินอิ่มตัว",
      title: `แจ้งเตือนความชื้นดินสูงเกินเกณฑ์: ${district.nameTh} (${soilMoisture}%)`,
      message: `ความชื้นดินใน ${district.nameTh} สูงถึง ${soilMoisture}% (เกินเกณฑ์สูงสุด ≥ ${config.soilMoistureMaxPct}%) เสี่ยงเกิดภาวะน้ำขังระดับรากในแปลง${config.cropFocus}`,
      remedialAction: `แนะนำเปิดร่องระบายน้ำรอบแปลงทันที งดให้น้ำเพิ่ม และเฝ้าระวังเชื้อราไฟทอปธอรา (รากเน่า-โคนเน่า) หรือหัวมันสำปะหลังเน่าด้วยเชื้อไตรโคเดอร์มา`,
      createdAtIso: nowIso,
      autoDismissMs: 9000,
      isSimulated,
    });
  }

  // 3. Daily Rain Probability High Breach
  if (config.enableRainProbHigh && rainProb >= config.rainProbMaxPct) {
    const diff = Math.max(0, rainProb - config.rainProbMaxPct);
    const isCritical = rainProb >= 75;
    breaches.push({
      id: `toast_rain_prob_${district.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      districtId: district.id,
      districtNameTh: district.nameTh,
      cropFocus: config.cropFocus,
      category: "rain_prob_high",
      severity: isCritical ? "critical" : "warning",
      metricLabel: "โอกาสเกิดฝนวันนี้ (TMD Radar)",
      actualValueText: `${rainProb}%`,
      thresholdValueText: `เกณฑ์แจ้งเตือน ≥ ${config.rainProbMaxPct}%`,
      deltaText:
        diff > 0 ? `สูงกว่าเกณฑ์ +${diff.toFixed(0)}%` : "ถึงเกณฑ์แจ้งเตือนฝนตกหนัก",
      title: `แจ้งเตือนโอกาสเกิดฝนสูงเกินเกณฑ์: ${district.nameTh} (${rainProb}%)`,
      message: `เรดาร์พยากรณ์อากาศ ${district.nameTh} รายงานโอกาสเกิดฝนวันนี้ ${rainProb}% ซึ่งเกินเกณฑ์ที่คุณกำหนดไว้ (≥ ${config.rainProbMaxPct}%)`,
      remedialAction: `แนะนำเลื่อนการฉีดพ่นปุ๋ยทางใบและสารชีวภัณฑ์ในแปลง${config.cropFocus} ออกไปก่อน เพื่อป้องกันการชะล้าง และตรวจสอบคันดิน/ร่องระบายน้ำ`,
      createdAtIso: nowIso,
      autoDismissMs: 9000,
      isSimulated,
    });
  }

  // 4. 14-Day Cumulative Rainfall High Breach
  if (config.enableRain14dHigh && rain14d >= config.rain14dMaxMm) {
    const diff = Math.max(0, rain14d - config.rain14dMaxMm);
    breaches.push({
      id: `toast_rain14_high_${district.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      districtId: district.id,
      districtNameTh: district.nameTh,
      cropFocus: config.cropFocus,
      category: "rain_14d_high",
      severity: rain14d >= 120 ? "critical" : "warning",
      metricLabel: "ปริมาณฝนสะสมล่วงหน้า 14 วัน (สูงเกินเกณฑ์)",
      actualValueText: `${rain14d.toFixed(1)} มม.`,
      thresholdValueText: `เกณฑ์สูงสุด ≥ ${config.rain14dMaxMm} มม.`,
      deltaText: `เกินเกณฑ์ +${diff.toFixed(1)} มม.`,
      title: `เตือนปริมาณฝนสะสม 14 วันสูงเกินเกณฑ์: ${district.nameTh} (${rain14d.toFixed(1)} มม.)`,
      message: `ปริมาณฝนคาดการณ์ 14 วันของ ${district.nameTh} อยู่ที่ ${rain14d.toFixed(1)} มม. เกินเพดานเฝ้าระวัง (≥ ${config.rain14dMaxMm} มม.)`,
      remedialAction: `เตรียมขุดลอกร่องระบายน้ำในแปลง${config.cropFocus} เสริมคันกั้นน้ำและสำรองเมล็ดพันธุ์/ท่อนพันธุ์ในที่ดอน`,
      createdAtIso: nowIso,
      autoDismissMs: 9000,
      isSimulated,
    });
  }

  // 5. 14-Day Cumulative Rainfall Low Breach (Dry Spell Warning)
  if (config.enableRain14dLow && rain14d <= config.rain14dMinMm) {
    const diff = Math.max(0, config.rain14dMinMm - rain14d);
    breaches.push({
      id: `toast_rain14_low_${district.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      districtId: district.id,
      districtNameTh: district.nameTh,
      cropFocus: config.cropFocus,
      category: "rain_14d_low",
      severity: rain14d <= 30 ? "critical" : "advisory",
      metricLabel: "ปริมาณฝนสะสมล่วงหน้า 14 วัน (ต่ำกว่าเกณฑ์)",
      actualValueText: `${rain14d.toFixed(1)} มม.`,
      thresholdValueText: `เกณฑ์ขั้นต่ำ ≤ ${config.rain14dMinMm} มม.`,
      deltaText: `ต่ำกว่าเกณฑ์ -${diff.toFixed(1)} มม.`,
      title: `เฝ้าระวังฝนสะสม 14 วันต่ำกว่าเกณฑ์: ${district.nameTh} (${rain14d.toFixed(1)} มม.)`,
      message: `ปริมาณฝนรวม 14 วันข้างหน้าใน ${district.nameTh} คาดการณ์เพียง ${rain14d.toFixed(1)} มม. ต่ำกว่าเกณฑ์ขั้นต่ำที่คุณตั้งไว้ (≤ ${config.rain14dMinMm} มม.)`,
      remedialAction: `วางแผนสำรองน้ำในสระจิ๋ว/บ่อบาดาลสำหรับแปลง${config.cropFocus} และพิจารณาพ่นสารลดการคายน้ำช่วงอากาศร้อนจัด`,
      createdAtIso: nowIso,
      autoDismissMs: 9000,
      isSimulated,
    });
  }

  return breaches;
}

// Gentle Web Audio Chime for Browser Toast Alert
export function playThresholdAlertChime(severity: "critical" | "warning" | "advisory") {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === "critical") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.14); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.start(now);
      osc.stop(now + 0.42);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Ignore audio context autoplay restriction errors
  }
}

// Singleton event bus so App.tsx, WeatherForecastModule.tsx, and NotificationCenterModule.tsx stay 100% synced
type StoreListener = () => void;

class ThresholdAlertStoreManager {
  private configs: Record<string, DistrictThresholdConfig> = {};
  private activeToasts: ThresholdBreachToastItem[] = [];
  private toastHistory: ThresholdBreachToastItem[] = [];
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const rawCfg = localStorage.getItem(STORAGE_KEY_CONFIGS);
      if (rawCfg) {
        const parsed = JSON.parse(rawCfg);
        this.configs = { ...INITIAL_PRESET_CONFIGS, ...parsed };
      } else {
        this.configs = { ...INITIAL_PRESET_CONFIGS };
      }
    } catch {
      this.configs = { ...INITIAL_PRESET_CONFIGS };
    }

    try {
      const rawHist = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (rawHist) {
        this.toastHistory = JSON.parse(rawHist);
      }
    } catch {
      this.toastHistory = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(this.configs));
      localStorage.setItem(
        STORAGE_KEY_HISTORY,
        JSON.stringify(this.toastHistory.slice(0, 40))
      );
    } catch {
      // Ignore storage quota errors
    }
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getConfigForDistrict(district: KoratDistrict): DistrictThresholdConfig {
    return (
      this.configs[district.id] || createDefaultConfigForDistrict(district)
    );
  }

  public getAllConfigs(): DistrictThresholdConfig[] {
    return Object.values(this.configs);
  }

  public getActiveToasts(): ThresholdBreachToastItem[] {
    return this.activeToasts;
  }

  public getToastHistory(): ThresholdBreachToastItem[] {
    return this.toastHistory;
  }

  public saveDistrictConfig(
    config: DistrictThresholdConfig,
    district: KoratDistrict,
    triggerToastOnBreach = true
  ): ThresholdBreachToastItem[] {
    const updated: DistrictThresholdConfig = {
      ...config,
      updatedAtIso: new Date().toISOString(),
    };
    this.configs = {
      ...this.configs,
      [config.districtId]: updated,
    };
    this.saveToStorage();

    const breaches = evaluateDistrictThresholdBreaches(district, updated);
    if (triggerToastOnBreach && breaches.length > 0) {
      this.pushToasts(breaches, updated);
    } else {
      this.emit();
    }
    return breaches;
  }

  public pushToasts(
    items: ThresholdBreachToastItem[],
    config?: DistrictThresholdConfig
  ) {
    if (items.length === 0) return;

    // Play gentle audio chime once for the highest severity item
    const shouldPlaySound = config ? config.enableSoundAlert : true;
    if (shouldPlaySound) {
      const hasCritical = items.some((i) => i.severity === "critical");
      playThresholdAlertChime(hasCritical ? "critical" : "warning");
    }

    // Trigger Web Notification API if granted and enabled
    const shouldBrowserNotify = config ? config.enableBrowserPush : true;
    if (
      shouldBrowserNotify &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const primary = items[0];
        new Notification(primary.title, {
          body: `${primary.message} (${primary.actualValueText} vs ${primary.thresholdValueText})`,
        });
      } catch {
        // Ignore restricted iframe notification error
      }
    }

    // Deduplicate by districtId + category in activeToasts
    const incomingKeys = new Set(
      items.map((item) => `${item.districtId}_${item.category}`)
    );
    const filteredExisting = this.activeToasts.filter(
      (t) => !incomingKeys.has(`${t.districtId}_${t.category}`)
    );

    this.activeToasts = [...items, ...filteredExisting].slice(0, 4);
    this.toastHistory = [...items, ...this.toastHistory].slice(0, 40);
    this.saveToStorage();
    this.emit();
  }

  public dismissToast(id: string) {
    this.activeToasts = this.activeToasts.filter((t) => t.id !== id);
    this.emit();
  }

  public clearAllActiveToasts() {
    this.activeToasts = [];
    this.emit();
  }

  public clearHistory() {
    this.toastHistory = [];
    this.saveToStorage();
    this.emit();
  }
}

export const thresholdAlertStore = new ThresholdAlertStoreManager();

export function useThresholdAlertStore(selectedDistrict: KoratDistrict) {
  const [, setTick] = useState(0);

  useEffect(() => {
    return thresholdAlertStore.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const currentConfig = thresholdAlertStore.getConfigForDistrict(selectedDistrict);
  const allConfigs = thresholdAlertStore.getAllConfigs();
  const activeToasts = thresholdAlertStore.getActiveToasts();
  const toastHistory = thresholdAlertStore.getToastHistory();

  const currentBreaches = evaluateDistrictThresholdBreaches(
    selectedDistrict,
    currentConfig
  );

  const saveConfig = useCallback(
    (newConfig: DistrictThresholdConfig, triggerToast = true) => {
      return thresholdAlertStore.saveDistrictConfig(
        newConfig,
        selectedDistrict,
        triggerToast
      );
    },
    [selectedDistrict]
  );

  const triggerDistrictCheck = useCallback(
    (district: KoratDistrict, customOverrides?: {
      soilMoisturePct?: number;
      rainProbTodayPct?: number;
      forecastRain14dMm?: number;
      isSimulated?: boolean;
    }) => {
      const cfg = thresholdAlertStore.getConfigForDistrict(district);
      const breaches = evaluateDistrictThresholdBreaches(
        district,
        cfg,
        customOverrides
      );
      if (breaches.length > 0) {
        thresholdAlertStore.pushToasts(breaches, cfg);
      }
      return breaches;
    },
    []
  );

  return {
    currentConfig,
    allConfigs,
    activeToasts,
    toastHistory,
    currentBreaches,
    saveConfig,
    triggerDistrictCheck,
    dismissToast: (id: string) => thresholdAlertStore.dismissToast(id),
    clearAllActiveToasts: () => thresholdAlertStore.clearAllActiveToasts(),
    clearHistory: () => thresholdAlertStore.clearHistory(),
  };
}
