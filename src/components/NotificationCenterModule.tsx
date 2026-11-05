import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  db,
  auth,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from "../firebase";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import { DistrictThresholdConfiguratorCard } from "./ThresholdAlertSystem";
import { thresholdAlertStore } from "../utils/thresholdAlertStore";
import { ServiceWorkerPushControlPanel } from "./ServiceWorkerPushControlPanel";
import { swPushManager } from "../utils/serviceWorkerPushManager";
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  ThermometerSun,
  ShieldAlert,
  LogIn,
  LogOut,
  Globe,
  MapPin,
  ExternalLink,
  RefreshCw,
  Volume2,
  X,
} from "lucide-react";

export interface AlertSubscriptionItem {
  id: string;
  ownerId: string;
  districtId: string;
  districtNameTh: string;
  spiThreshold: number;
  rainProbThreshold: number;
  maxTempThresholdC: number;
  enableExtremeWeather: boolean;
  enableSpiAlert: boolean;
  isActive: boolean;
  cropFocus: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface AlertLogItem {
  id: string;
  ownerId: string;
  districtId: string;
  districtNameTh: string;
  alertType: "spi_drought" | "extreme_weather" | "heavy_rain" | "heat_stress";
  severity: "critical" | "warning" | "advisory";
  title: string;
  message: string;
  metricSummary: string;
  isRead: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

interface NotificationCenterModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

const DEFAULT_LOCAL_SUBSCRIPTIONS: AlertSubscriptionItem[] = [
  {
    id: "sub_dan_khun_thot",
    ownerId: "local_farmer",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    spiThreshold: -1.2,
    rainProbThreshold: 65,
    maxTempThresholdC: 35,
    enableExtremeWeather: true,
    enableSpiAlert: true,
    isActive: true,
    cropFocus: "มันสำปะหลัง",
  },
  {
    id: "sub_bua_yai",
    ownerId: "local_farmer",
    districtId: "bua-yai",
    districtNameTh: "อ.บัวใหญ่",
    spiThreshold: -1.4,
    rainProbThreshold: 60,
    maxTempThresholdC: 36,
    enableExtremeWeather: true,
    enableSpiAlert: true,
    isActive: true,
    cropFocus: "ข้าวหอมมะลิ",
  },
  {
    id: "sub_chum_phuang",
    ownerId: "local_farmer",
    districtId: "chum-phuang",
    districtNameTh: "อ.ชุมพวง",
    spiThreshold: -1.0,
    rainProbThreshold: 70,
    maxTempThresholdC: 36,
    enableExtremeWeather: true,
    enableSpiAlert: true,
    isActive: true,
    cropFocus: "ข้าวหอมมะลิทุ่งสัมฤทธิ์ GI",
  },
];

const DEFAULT_LOCAL_LOGS: AlertLogItem[] = [
  {
    id: "log_init_1",
    ownerId: "local_farmer",
    districtId: "bua-yai",
    districtNameTh: "อ.บัวใหญ่",
    alertType: "spi_drought",
    severity: "critical",
    title: "แจ้งเตือนวิกฤตภัยแล้ง: ค่า SPI-30d ต่ำกว่าเกณฑ์ที่ตั้งไว้ (อ.บัวใหญ่)",
    message:
      "ดรรชนีความแห้งแล้ง SPI-30 วัน อยู่ที่ -1.64 (ต่ำกว่าเกณฑ์แจ้งเตือน -1.40) ความชื้นดิน GISTDA เหลือ 24% แนะนำงดใส่ปุ๋ยเคมีแต่งหน้าและเตรียมบันทึกภาพพิกัดแปลงเพื่อยื่นแบบ กษ.01",
    metricSummary: "SPI-30d: -1.64 (เกณฑ์ -1.40) · ความชื้นดิน 24%",
    isRead: false,
  },
  {
    id: "log_init_2",
    ownerId: "local_farmer",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
    alertType: "extreme_weather",
    severity: "warning",
    title: "แจ้งเตือนฝนทิ้งช่วงสะสมและพายุฝนฟ้าคะนอง (อ.ด่านขุนทด)",
    message:
      "ดรรชนี SPI-30d อยู่ที่ -1.35 (ต่ำกว่าเกณฑ์ -1.20) และมีโอกาสเกิดฝนฟ้าคะนอง 75% วันนี้ แนะนำขุดร่องระบายน้ำรอบแปลงมันสำปะหลังเพื่อป้องกันหัวมันเน่าหลังดินแห้งจัด",
    metricSummary: "SPI-30d: -1.35 · โอกาสฝนวันนี้ 75%",
    isRead: false,
  },
];

export const NotificationCenterModule: React.FC<NotificationCenterModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onUnreadCountChange,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string>("");

  // Subscriptions & Logs state
  const [subscriptions, setSubscriptions] = useState<AlertSubscriptionItem[]>(
    DEFAULT_LOCAL_SUBSCRIPTIONS
  );
  const [alertLogs, setAlertLogs] = useState<AlertLogItem[]>(DEFAULT_LOCAL_LOGS);

  // Live Push Banner Toast state
  const [activeToast, setActiveToast] = useState<AlertLogItem | null>(null);

  // New Trigger Form State
  const [formDistrictId, setFormDistrictId] = useState<string>(selectedDistrict.id);
  const [formCropFocus, setFormCropFocus] = useState<string>(
    selectedDistrict.primaryCrops[0] || "มันสำปะหลัง"
  );
  const [formSpiThreshold, setFormSpiThreshold] = useState<number>(-1.2);
  const [formRainThreshold, setFormRainThreshold] = useState<number>(65);
  const [formMaxTempC, setFormMaxTempC] = useState<number>(36);
  const [formEnableSpi, setFormEnableSpi] = useState<boolean>(true);
  const [formEnableExtreme, setFormEnableExtreme] = useState<boolean>(true);
  const [savingTrigger, setSavingTrigger] = useState<boolean>(false);

  // Google Search & Google Maps Grounding State
  const [groundingTab, setGroundingTab] = useState<"search" | "maps">("search");
  const [searchQueryInput, setSearchQueryInput] = useState<string>("");
  const [searchResult, setSearchResult] = useState<{
    text: string;
    sources: { title: string; uri: string }[];
  } | null>(null);
  const [mapsResult, setMapsResult] = useState<{
    text: string;
    places: { title: string; uri: string }[];
  } | null>(null);
  const [groundingLoading, setGroundingLoading] = useState<boolean>(false);

  // Sync form district & pre-populate Grounding Results when global district changes
  useEffect(() => {
    setFormDistrictId(selectedDistrict.id);
    setFormCropFocus(selectedDistrict.primaryCrops[0] || "มันสำปะหลัง");
    setSearchResult({
      text: `สรุปสถานการณ์การเกษตรและภูมิอากาศ ${selectedDistrict.nameTh} จ.นครราชสีมา: โอกาสเกิดฝนวันนี้ ${selectedDistrict.rainProbToday}%, ปริมาณฝนคาดการณ์ 14 วัน ${selectedDistrict.forecastRain14dMm} มม., ดรรชนีความแห้งแล้ง SPI-30 วัน อยู่ที่ ${selectedDistrict.spi30d} (${selectedDistrict.droughtRiskLevel}) เกษตรกรผู้ปลูก ${selectedDistrict.primaryCrops.join(", ")} ควรติดตามประกาศแจ้งเตือนจากสำนักงานเกษตรอำเภอและชลประทานที่ 8 อย่างใกล้ชิด`,
      sources: [
        {
          title: `สำนักงานเกษตรจังหวัดนครราชสีมา (${selectedDistrict.nameTh})`,
          uri: "https://korat.doae.go.th/",
        },
        {
          title: "ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนล่าง",
          uri: "https://www.tmd.go.th/",
        },
      ],
    });
    setMapsResult({
      text: `พิกัดหน่วยงานช่วยเหลือเกษตรกรและจุดรับซื้อผลผลิตการเกษตรสำคัญในพื้นที่ ${selectedDistrict.nameTh} จังหวัดนครราชสีมา (พิกัดศูนย์กลาง ${selectedDistrict.lat.toFixed(4)}°N, ${selectedDistrict.lon.toFixed(4)}°E):`,
      places: [
        {
          title: `สำนักงานเกษตรอำเภอ (${selectedDistrict.nameTh})`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `สำนักงานเกษตรอำเภอ ${selectedDistrict.nameTh} นครราชสีมา`
          )}`,
        },
        {
          title: `สหกรณ์การเกษตรและจุดรับซื้อพืชผล (${selectedDistrict.nameTh})`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `สหกรณ์การเกษตร ${selectedDistrict.nameTh} นครราชสีมา`
          )}`,
        },
        {
          title: `ศูนย์บริการข้อมูลภัยแล้งและแหล่งน้ำชลประทาน (${selectedDistrict.nameTh})`,
          uri: `https://www.google.com/maps/search/?api=1&query=${selectedDistrict.lat},${selectedDistrict.lon}`,
        },
      ],
    });
  }, [selectedDistrict]);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (!user) {
        setSubscriptions(DEFAULT_LOCAL_SUBSCRIPTIONS);
        setAlertLogs(DEFAULT_LOCAL_LOGS);
      }
    });
    return () => unsubAuth();
  }, []);

  // Attach Firestore real-time listeners when authenticated
  useEffect(() => {
    if (!authReady || !currentUser) return;

    const subsPath = "alertSubscriptions";
    const subsQuery = query(
      collection(db, subsPath),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubSubs = onSnapshot(
      subsQuery,
      (snapshot) => {
        const items: AlertSubscriptionItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<AlertSubscriptionItem, "id">),
        }));
        setSubscriptions(items);
      },
      (error) => {
        console.warn("Firestore alertSubscriptions onSnapshot offline/permission error:", error.message);
      }
    );

    const logsPath = "alertLogs";
    const logsQuery = query(
      collection(db, logsPath),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const items: AlertLogItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<AlertLogItem, "id">),
        }));
        setAlertLogs(items);
      },
      (error) => {
        console.warn("Firestore alertLogs onSnapshot offline/permission error:", error.message);
      }
    );

    return () => {
      unsubSubs();
      unsubLogs();
    };
  }, [authReady, currentUser]);

  // Report unread count to parent
  useEffect(() => {
    const unread = alertLogs.filter((l) => !l.isRead).length;
    onUnreadCountChange?.(unread);
  }, [alertLogs, onUnreadCountChange]);

  const handleGoogleSignIn = async () => {
    setAuthErrorMsg("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้";
      setAuthErrorMsg(`การเข้าสู่ระบบด้วย Google ขัดข้อง: ${msg}`);
    }
  };

  const handleGoogleSignOut = async () => {
    setAuthErrorMsg("");
    try {
      await signOut(auth);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error";
      setAuthErrorMsg(msg);
    }
  };

  // Helper to sanitize ID to match ^[a-zA-Z0-9_\-]+$ and maxLength 128
  const makeSafeDocId = (prefix: string, raw: string) => {
    const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
    return `${prefix}_${cleaned}_${Date.now()}`.slice(0, 120);
  };

  // Create or Update District Alert Trigger
  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTrigger(true);

    const targetDistrict =
      KORAT_DISTRICTS.find((d) => d.id === formDistrictId) || selectedDistrict;

    const clampedSpi = Math.max(-4.0, Math.min(4.0, Number(formSpiThreshold.toFixed(2))));
    const clampedRain = Math.max(0, Math.min(100, Math.round(formRainThreshold)));
    const clampedTemp = Math.max(20, Math.min(50, Math.round(formMaxTempC)));
    const safeCrop = (formCropFocus.trim() || "มันสำปะหลัง").slice(0, 110);

    if (currentUser) {
      const docId = makeSafeDocId("sub", `${currentUser.uid.slice(0, 12)}_${targetDistrict.id}`);
      const path = `alertSubscriptions/${docId}`;
      try {
        await setDoc(doc(db, "alertSubscriptions", docId), {
          ownerId: currentUser.uid,
          districtId: targetDistrict.id,
          districtNameTh: targetDistrict.nameTh.slice(0, 110),
          spiThreshold: clampedSpi,
          rainProbThreshold: clampedRain,
          maxTempThresholdC: clampedTemp,
          enableExtremeWeather: Boolean(formEnableExtreme),
          enableSpiAlert: Boolean(formEnableSpi),
          isActive: true,
          cropFocus: safeCrop,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      } finally {
        setSavingTrigger(false);
      }
    } else {
      const newLocal: AlertSubscriptionItem = {
        id: makeSafeDocId("local_sub", targetDistrict.id),
        ownerId: "local_farmer",
        districtId: targetDistrict.id,
        districtNameTh: targetDistrict.nameTh,
        spiThreshold: clampedSpi,
        rainProbThreshold: clampedRain,
        maxTempThresholdC: clampedTemp,
        enableExtremeWeather: Boolean(formEnableExtreme),
        enableSpiAlert: Boolean(formEnableSpi),
        isActive: true,
        cropFocus: safeCrop,
      };
      setSubscriptions((prev) => [
        newLocal,
        ...prev.filter((item) => item.districtId !== targetDistrict.id),
      ]);
      setSavingTrigger(false);
    }
  };

  const handleToggleSubscriptionActive = async (sub: AlertSubscriptionItem) => {
    const nextState = !sub.isActive;
    if (currentUser && sub.ownerId === currentUser.uid) {
      const path = `alertSubscriptions/${sub.id}`;
      try {
        await updateDoc(doc(db, "alertSubscriptions", sub.id), {
          isActive: nextState,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      setSubscriptions((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, isActive: nextState } : item))
      );
    }
  };

  const handleDeleteSubscription = async (sub: AlertSubscriptionItem) => {
    if (currentUser && sub.ownerId === currentUser.uid) {
      const path = `alertSubscriptions/${sub.id}`;
      try {
        await deleteDoc(doc(db, "alertSubscriptions", sub.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      setSubscriptions((prev) => prev.filter((item) => item.id !== sub.id));
    }
  };

  // Dispatch a Push-Like Notification (Toast + Browser Notification + Firestore Log)
  const dispatchPushAlert = useCallback(
    async (sub: AlertSubscriptionItem) => {
      const dist =
        KORAT_DISTRICTS.find((d) => d.id === sub.districtId) || selectedDistrict;

      const isSpiBreached = sub.enableSpiAlert && dist.spi30d <= sub.spiThreshold;
      const isHeavyRainBreached = dist.rainProbToday >= sub.rainProbThreshold;
      const isHeatBreached = dist.maxTempC >= sub.maxTempThresholdC;

      let alertType: AlertLogItem["alertType"] = "extreme_weather";
      let severity: AlertLogItem["severity"] = "warning";
      let title = `แจ้งเตือนสภาพอากาศสุดขั้ว: ${dist.nameTh} (${sub.cropFocus})`;
      let message = `${dist.extremeAlertTitle} — ${dist.extremeAlertDetail} (${dist.affectedCropStage})`;

      if (isSpiBreached) {
        alertType = "spi_drought";
        severity = dist.spi30d <= -1.5 ? "critical" : "warning";
        title = `แจ้งเตือนดรรชนีภัยแล้ง SPI เกินเกณฑ์: ${dist.nameTh} (SPI ${dist.spi30d})`;
        message = `ค่าดรรชนีความแห้งแล้ง SPI-30 วันของ ${dist.nameTh} อยู่ที่ ${dist.spi30d} ซึ่งต่ำกว่าเกณฑ์ที่ท่านตั้งไว้ (${sub.spiThreshold}) ความชื้นดิน GISTDA ${dist.gistdaSoilMoisturePct}% กระทบแปลง${sub.cropFocus} แนะนำชะลอการใส่ปุ๋ยเคมีและตรวจสอบสิทธิ กษ.01`;
      } else if (isHeavyRainBreached) {
        alertType = "heavy_rain";
        severity = dist.rainProbToday >= 75 ? "critical" : "warning";
        title = `แจ้งเตือนโอกาสเกิดพายุฝนสูง ${dist.rainProbToday}% ในพื้นที่ ${dist.nameTh}`;
        message = `วันนี้พื้นที่ ${dist.nameTh} มีโอกาสเกิดฝนตก ${dist.rainProbToday}% (เกินเกณฑ์แจ้งเตือน ${sub.rainProbThreshold}%) แนะนำเปิดทางระบายน้ำในแปลง${sub.cropFocus} และหลีกเลี่ยงการพ่นสารชีวภัณฑ์ก่อนฝนตก`;
      } else if (isHeatBreached) {
        alertType = "heat_stress";
        severity = "warning";
        title = `แจ้งเตือนอุณหภูมิสูง ${dist.maxTempC}°C กระทบแปลง${sub.cropFocus} (${dist.nameTh})`;
        message = `อุณหภูมิสูงสุดคาดการณ์ ${dist.maxTempC}°C เกินเกณฑ์เฝ้าระวัง (${sub.maxTempThresholdC}°C) ระวังภาวะชะงักการผสมเกสรและการคายระเหยน้ำสูง`;
      }

      const metricSummary = `SPI-30d: ${dist.spi30d} (เกณฑ์ ${sub.spiThreshold}) · โอกาสฝน ${dist.rainProbToday}% · สูงสุด ${dist.maxTempC}°C`;

      const logId = makeSafeDocId("log", sub.districtId);
      const toastItem: AlertLogItem = {
        id: logId,
        ownerId: currentUser?.uid || "local_farmer",
        districtId: dist.id,
        districtNameTh: dist.nameTh.slice(0, 110),
        alertType,
        severity,
        title: title.slice(0, 195),
        message: message.slice(0, 580),
        metricSummary: metricSummary.slice(0, 135),
        isRead: false,
      };

      // Show in-app Push Notification Toast Banner immediately
      setActiveToast(toastItem);

      // Also push to Global Browser Toast Stack
      thresholdAlertStore.pushToasts([
        {
          id: logId,
          districtId: dist.id,
          districtNameTh: dist.nameTh,
          cropFocus: sub.cropFocus,
          category: isSpiBreached
            ? "soil_moisture_low"
            : isHeavyRainBreached
            ? "rain_prob_high"
            : "spi_drought",
          severity: toastItem.severity,
          metricLabel: isSpiBreached
            ? "ดรรชนีภัยแล้ง SPI & ความชื้นดิน"
            : "โอกาสเกิดพายุฝนวันนี้",
          actualValueText: isSpiBreached
            ? `SPI ${dist.spi30d} · ดิน ${dist.gistdaSoilMoisturePct}%`
            : `ฝน ${dist.rainProbToday}%`,
          thresholdValueText: isSpiBreached
            ? `เกณฑ์ SPI ≤ ${sub.spiThreshold}`
            : `เกณฑ์ฝน ≥ ${sub.rainProbThreshold}%`,
          deltaText: "เข้าเกณฑ์แจ้งเตือน",
          title: toastItem.title,
          message: toastItem.message,
          remedialAction: `ตรวจสอบแปลง${sub.cropFocus}ในพื้นที่ ${dist.nameTh} และเตรียมรับมือตามคำแนะนำเกษตรอำเภอ`,
          createdAtIso: new Date().toISOString(),
          autoDismissMs: 9000,
        },
      ]);

      // Trigger Service Worker Push Notification & IndexedDB persistence (works when app is closed/backgrounded)
      swPushManager.triggerServiceWorkerAlertForDistrict(
        dist,
        isSpiBreached ? "spi_drought" : "heavy_rain",
        0
      );

      // Trigger Web Notification API if granted
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(toastItem.title, {
            body: toastItem.message,
          });
        } catch {
          // Ignore browser notification errors in restricted iframes
        }
      }

      if (currentUser) {
        const path = `alertLogs/${logId}`;
        try {
          await setDoc(doc(db, "alertLogs", logId), {
            ownerId: currentUser.uid,
            districtId: toastItem.districtId,
            districtNameTh: toastItem.districtNameTh,
            alertType: toastItem.alertType,
            severity: toastItem.severity,
            title: toastItem.title,
            message: toastItem.message,
            metricSummary: toastItem.metricSummary,
            isRead: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      } else {
        setAlertLogs((prev) => [toastItem, ...prev]);
      }
    },
    [currentUser, selectedDistrict]
  );

  // Scan all active subscriptions and fire alerts for all threshold breaches
  const handleScanAllSavedDistricts = async () => {
    const activeSubs = subscriptions.filter((s) => s.isActive);
    for (const sub of activeSubs) {
      const dist = KORAT_DISTRICTS.find((d) => d.id === sub.districtId);
      if (!dist) continue;
      const breached =
        (sub.enableSpiAlert && dist.spi30d <= sub.spiThreshold) ||
        dist.rainProbToday >= sub.rainProbThreshold ||
        dist.maxTempC >= sub.maxTempThresholdC ||
        sub.enableExtremeWeather;

      if (breached) {
        await dispatchPushAlert(sub);
      }
    }
  };

  const handleMarkLogRead = async (log: AlertLogItem) => {
    if (currentUser && log.ownerId === currentUser.uid) {
      const path = `alertLogs/${log.id}`;
      try {
        await updateDoc(doc(db, "alertLogs", log.id), {
          isRead: !log.isRead,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      setAlertLogs((prev) =>
        prev.map((item) => (item.id === log.id ? { ...item, isRead: !item.isRead } : item))
      );
    }
  };

  const handleDeleteLog = async (log: AlertLogItem) => {
    if (currentUser && log.ownerId === currentUser.uid) {
      const path = `alertLogs/${log.id}`;
      try {
        await deleteDoc(doc(db, "alertLogs", log.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      setAlertLogs((prev) => prev.filter((item) => item.id !== log.id));
    }
  };

  // Run Google Search or Google Maps Grounding
  const handleRunGrounding = async () => {
    setGroundingLoading(true);
    try {
      if (groundingTab === "search") {
        const res = await fetch("/api/ai/search-grounding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            districtName: selectedDistrict.nameTh,
            query:
              searchQueryInput.trim() ||
              `ประกาศแจ้งเตือนสภาพอากาศ ภัยแล้ง SPI และสถานการณ์เกษตรกรรมล่าสุดใน ${selectedDistrict.nameTh} จังหวัดนครราชสีมา`,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResult(data);
        }
      } else {
        const res = await fetch("/api/ai/maps-grounding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            districtId: selectedDistrict.id,
            query:
              searchQueryInput.trim() ||
              `สำนักงานเกษตรอำเภอ สหกรณ์การเกษตร และจุดรับซื้อผลผลิตใน ${selectedDistrict.nameTh} จังหวัดนครราชสีมา`,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMapsResult(data);
        }
      }
    } catch {
      // Handled gracefully
    } finally {
      setGroundingLoading(false);
    }
  };

  const unreadCount = alertLogs.filter((l) => !l.isRead).length;

  return (
    <div className="space-y-8 relative">
      {/* Live Push-Like Alert Toast Banner */}
      {activeToast && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#0F172A] text-white border-2 border-amber-400 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-2.5 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <BellRing className="w-4 h-4 animate-bounce text-amber-400 shrink-0" />
              <span>KORAT SMART AGRI · PUSH ALERT TRIGGERED</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm font-bold text-white leading-snug">
            {activeToast.title}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeToast.message}
          </p>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-sky-300">
            <span>{activeToast.metricSummary}</span>
            <button
              type="button"
              onClick={() => {
                onSelectDistrict(activeToast.districtId);
                setActiveToast(null);
              }}
              className="text-emerald-400 font-sans font-semibold hover:underline"
            >
              ดูพื้นที่แปลง →
            </button>
          </div>
        </div>
      )}

      {/* Section Header & Firebase Google Auth Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
              Real-Time Push Alert Engine &amp; Cloud Sync
            </span>
            <span aria-hidden="true">·</span>
            <span>ระบบตั้งค่าแจ้งเตือนดรรชนีภัยแล้ง (SPI Threshold) และภัยธรรมชาติรายอำเภอ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ศูนย์แจ้งเตือนภัยอัจฉริยะ (Notification Center) และตั้งค่าเกณฑ์เฝ้าระวังรายแปลง
          </h2>
        </div>

        {/* Firebase Auth Status & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleScanAllSavedDistricts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>ทดสอบสแกนและส่ง Push Alert ทันที</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <div className="text-xs">
                <span className="text-slate-500">ซิงค์ฐานข้อมูล: </span>
                <strong className="text-slate-900">
                  {currentUser.displayName || currentUser.email}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignOut}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>เข้าสู่ระบบด้วย Google เพื่อบันทึกการแจ้งเตือนลง Cloud</span>
            </button>
          )}
        </div>
      </div>

      {authErrorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3.5 flex items-center justify-between">
          <span>{authErrorMsg}</span>
          <button
            type="button"
            onClick={() => setAuthErrorMsg("")}
            className="text-red-700 font-semibold"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Service Worker Background Web Push & Periodic Sync Control Panel */}
      <ServiceWorkerPushControlPanel
        selectedDistrict={selectedDistrict}
        onSelectDistrict={onSelectDistrict}
      />

      {/* Custom District Rainfall & Soil Moisture Threshold Configurator */}
      <DistrictThresholdConfiguratorCard
        selectedDistrict={selectedDistrict}
        onSelectDistrict={onSelectDistrict}
      />

      {/* Main Grid: Left 5 Cols = Trigger Configuration Builder | Right 7 Cols = Saved Districts & Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 5 COLS: Push Alert Trigger Builder */}
        <form
          onSubmit={handleSaveSubscription}
          className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 flex flex-col justify-between space-y-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  ตั้งค่าเงื่อนไขการแจ้งเตือนใหม่ (Alert Trigger Rule)
                </h3>
              </div>
              <span className="text-xs text-emerald-800 font-semibold">
                {currentUser ? "Firestore Cloud Sync" : "โหมดทดลองใช้งาน"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกอำเภอที่ต้องการเฝ้าระวัง
                </label>
                <select
                  value={formDistrictId}
                  onChange={(e) => {
                    setFormDistrictId(e.target.value);
                    const found = KORAT_DISTRICTS.find((d) => d.id === e.target.value);
                    if (found && found.primaryCrops[0]) {
                      setFormCropFocus(found.primaryCrops[0]);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                >
                  {KORAT_DISTRICTS.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.nameTh} (SPI ปัจจุบัน: {dist.spi30d})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  พืชเศรษฐกิจหลักในแปลง
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={formCropFocus}
                  onChange={(e) => setFormCropFocus(e.target.value)}
                  placeholder="เช่น มันสำปะหลัง, อ้อย, ข้าวหอมมะลิ"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>

            {/* SPI Threshold Slider */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>เกณฑ์แจ้งเตือนดรรชนีความแห้งแล้ง (SPI-30d Threshold)</span>
                </span>
                <span className="font-mono tabular-nums font-bold text-sm text-red-700">
                  ≤ {formSpiThreshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={-2.5}
                max={-0.5}
                step={0.05}
                value={formSpiThreshold}
                onChange={(e) => setFormSpiThreshold(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>-2.50 (วิกฤตแล้งจัด)</span>
                <span>-1.50 (แล้งรุนแรง)</span>
                <span>-1.00 (ฝนทิ้งช่วง)</span>
                <span>-0.50 (เริ่มแห้ง)</span>
              </div>
            </div>

            {/* Heavy Rain / Storm Probability Slider */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  <span>เกณฑ์แจ้งเตือนพายุฝนฟ้าคะนอง (โอกาสเกิดฝน %)</span>
                </span>
                <span className="font-mono tabular-nums font-bold text-sm text-sky-700">
                  ≥ {formRainThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={90}
                step={5}
                value={formRainThreshold}
                onChange={(e) => setFormRainThreshold(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>40% (ฝนปานกลาง)</span>
                <span>65% (ฝนตกหนัก)</span>
                <span>90% (พายุฝนรุนแรง)</span>
              </div>
            </div>

            {/* Crop Heat Stress Max Temp Slider */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ThermometerSun className="w-3.5 h-3.5 text-amber-600" />
                  <span>เกณฑ์อุณหภูมิสูงสุดกระทบระยะออกดอก/ผสมเกสร (°C)</span>
                </span>
                <span className="font-mono tabular-nums font-bold text-sm text-amber-700">
                  ≥ {formMaxTempC}°C
                </span>
              </div>
              <input
                type="range"
                min={32}
                max={42}
                step={1}
                value={formMaxTempC}
                onChange={(e) => setFormMaxTempC(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-1 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formEnableSpi}
                  onChange={(e) => setFormEnableSpi(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700"
                />
                <span>แจ้งเตือนทันทีเมื่อดรรชนี SPI-30 วันลดต่ำกว่าเกณฑ์ที่กำหนด</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formEnableExtreme}
                  onChange={(e) => setFormEnableExtreme(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700"
                />
                <span>แจ้งเตือนภัยสภาวะอากาศสุดขั้ว (พายุฤดูร้อน · ฝนทิ้งช่วง · โรคใบด่างมันฯ)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingTrigger}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-xl transition-colors shadow-2xs"
          >
            {savingTrigger
              ? "กำลังบันทึกเงื่อนไขการแจ้งเตือน..."
              : "บันทึกอำเภอและเปิดใช้งาน Push Alert Trigger"}
          </button>
        </form>

        {/* RIGHT 7 COLS: Saved District Triggers & Real-Time Dispatched Notification Feed */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Saved Districts Watchlist */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  รายการอำเภอที่บันทึกและสถานะเงื่อนไขแจ้งเตือน ({subscriptions.length} พื้นที่)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  เปรียบเทียบค่าจริงจากดาวเทียมและเรดาร์วันนี้กับเกณฑ์แจ้งเตือนที่ท่านตั้งไว้
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const dist =
                  KORAT_DISTRICTS.find((d) => d.id === sub.districtId) || selectedDistrict;
                const spiTriggered = sub.enableSpiAlert && dist.spi30d <= sub.spiThreshold;
                const rainTriggered = dist.rainProbToday >= sub.rainProbThreshold;
                const anyTriggered = sub.isActive && (spiTriggered || rainTriggered);

                return (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      anyTriggered
                        ? "bg-red-50/50 border-red-200"
                        : "bg-slate-50/70 border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {sub.districtNameTh}
                          </span>
                          <span className="text-xs text-slate-600">
                            · แปลง{sub.cropFocus}
                          </span>
                          {anyTriggered ? (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-100 text-red-800 rounded-md">
                              เข้าเกณฑ์แจ้งเตือนด่วน
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-800 rounded-md">
                              เฝ้าระวังปกติ
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-2.5 text-xs font-mono tabular-nums">
                          <div>
                            <span className="text-slate-500 font-sans">SPI-30d: </span>
                            <strong className={spiTriggered ? "text-red-700" : "text-slate-900"}>
                              {dist.spi30d}
                            </strong>{" "}
                            <span className="text-slate-400">(เกณฑ์ ≤ {sub.spiThreshold})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-sans">โอกาสฝน: </span>
                            <strong className={rainTriggered ? "text-sky-700" : "text-slate-900"}>
                              {dist.rainProbToday}%
                            </strong>{" "}
                            <span className="text-slate-400">(≥ {sub.rainProbThreshold}%)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-sans">อุณหภูมิ: </span>
                            <strong className="text-slate-900">{dist.maxTempC}°C</strong>{" "}
                            <span className="text-slate-400">(≥ {sub.maxTempThresholdC}°C)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => dispatchPushAlert(sub)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                        >
                          ส่ง Push Alert
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleSubscriptionActive(sub)}
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            sub.isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {sub.isActive ? "เปิดอยู่" : "หยุดชั่วคราว"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubscription(sub)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="ลบการตั้งค่าอำเภอนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Dispatched Push Notifications Inbox */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  ประวัติการแจ้งเตือนภัยพิบัติและสภาพอากาศ (Notification Feed)
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800">
                ยังไม่ได้อ่าน {unreadCount} รายการ
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {alertLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    log.isRead
                      ? "bg-white border-slate-200 opacity-80"
                      : log.severity === "critical"
                      ? "bg-red-50/70 border-red-200"
                      : "bg-amber-50/60 border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 shrink-0 ${
                            log.severity === "critical" ? "text-red-600" : "text-amber-600"
                          }`}
                        />
                        <span className="text-sm font-bold text-slate-900">
                          {log.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {log.message}
                      </p>
                      <div className="text-[11px] font-mono text-slate-500 pt-1">
                        {log.metricSummary}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMarkLogRead(log)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        {log.isRead ? "อ่านแล้ว" : "รับทราบ"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="ลบรายการแจ้งเตือน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grounded Intelligence Bar: Google Search Grounding + Google Maps Grounding */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Live Grounding Verification (Google Search &amp; Google Maps)
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              ตรวจสอบข่าวสารเตือนภัยล่าสุดและค้นหาพิกัดหน่วยงานช่วยเหลือเกษตรกรใน {selectedDistrict.nameTh}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setGroundingTab("search")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  groundingTab === "search"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>Google Search ข่าวเตือนภัยเกษตร</span>
              </button>
              <button
                type="button"
                onClick={() => setGroundingTab("maps")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  groundingTab === "maps"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google Maps พิกัดหน่วยงาน/จุดรับซื้อ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={searchQueryInput}
            onChange={(e) => setSearchQueryInput(e.target.value)}
            placeholder={
              groundingTab === "search"
                ? `ค้นหาข่าวเตือนภัยกรมอุตุฯ สถานการณ์น้ำ หรือราคาพืชใน ${selectedDistrict.nameTh}...`
                : `ค้นหาสำนักงานเกษตรอำเภอ สหกรณ์ หรือลานมันใน ${selectedDistrict.nameTh}...`
            }
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
          />
          <button
            type="button"
            onClick={handleRunGrounding}
            disabled={groundingLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-xl transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${groundingLoading ? "animate-spin" : ""}`} />
            <span>
              {groundingTab === "search"
                ? "ค้นหาข้อมูลจริงด้วย Google Search"
                : "ค้นหาพิกัดด้วย Google Maps"}
            </span>
          </button>
        </div>

        {groundingTab === "search" && searchResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
              {searchResult.text}
            </p>
            {searchResult.sources.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-600">แหล่งอ้างอิง Google Search:</span>
                {searchResult.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-800 hover:underline"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {groundingTab === "maps" && mapsResult && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
            <p className="text-slate-800 leading-relaxed whitespace-pre-line">
              {mapsResult.text}
            </p>
            {mapsResult.places.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-600">พิกัดสถานที่บน Google Maps:</span>
                {mapsResult.places.map((pl, idx) => (
                  <a
                    key={idx}
                    href={pl.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-800 hover:underline"
                  >
                    <MapPin className="w-3 h-3 text-emerald-700" />
                    <span>{pl.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
