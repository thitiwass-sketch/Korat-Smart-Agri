import React, { useState, useMemo, useEffect } from "react";
import { KoratDistrict, KORAT_DISTRICTS, formatDistrictName } from "../data/koratAgriData";
import {
  TargetCropKey,
  CropPestProfile,
  OutbreakSeverity,
  TARGET_CROP_CONFIGS,
  KORAT_CROP_PEST_PROFILES,
  getDistrictPestOutbreak,
} from "../data/koratCropPestAlertData";
import {
  ShieldAlert,
  AlertTriangle,
  Bug,
  Sprout,
  CheckCircle2,
  Search,
  Filter,
  Phone,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  MapPin,
  ThermometerSun,
  Droplets,
  CloudRain,
  Download,
  Printer,
  Bell,
  BellRing,
  FlaskConical,
  X,
  Send,
  Sparkles,
  Flame,
  Layers,
  FileText,
} from "lucide-react";

interface CropPestAlertModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  onNavigateToClinic?: () => void;
}

export interface FarmerOutbreakIncidentReport {
  id: string;
  districtId: string;
  districtNameTh: string;
  cropKey: TargetCropKey;
  threatNameTh: string;
  affectedRai: number;
  contactName: string;
  contactPhone: string;
  reportedAt: string;
  symptomsObserved: string;
}

const STORAGE_KEY_INCIDENT_REPORTS = "korat_farmer_pest_reports_v1";
const STORAGE_KEY_WATCH_PREFS = "korat_crop_pest_watch_prefs_v1";

export const CropPestAlertModule: React.FC<CropPestAlertModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onNavigateToClinic,
}) => {
  // Navigation tabs within module
  const [activeTab, setActiveTab] = useState<
    "advisory_cards" | "district_matrix" | "symptom_differentiator" | "emergency_reporting"
  >("advisory_cards");

  // Filter states
  const [selectedCropFilter, setSelectedCropFilter] = useState<TargetCropKey | "all">("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    "all" | "disease_virus" | "disease_fungus" | "disease_bacteria" | "pest_insect"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedThreatId, setExpandedThreatId] = useState<string>("cmd_slcmv");
  const [selectedThreatForModal, setSelectedThreatForModal] = useState<CropPestProfile | null>(null);

  // Watch & Notification preferences (localStorage)
  const [pestAlertWatchActive, setPestAlertWatchActive] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_WATCH_PREFS);
        if (saved) {
          const parsed = JSON.parse(saved);
          return Boolean(parsed.active);
        }
      } catch (e) {
        console.warn("Could not read watch prefs", e);
      }
    }
    return true;
  });

  const [notificationToast, setNotificationToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    severity: OutbreakSeverity;
  }>({
    visible: false,
    title: "",
    message: "",
    severity: "safe",
  });

  // Outbreak incident reports state (localStorage)
  const [incidentReports, setIncidentReports] = useState<FarmerOutbreakIncidentReport[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_INCIDENT_REPORTS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Could not read incident reports", e);
      }
    }
    return [
      {
        id: "rep-001",
        districtId: "dan-khun-thot",
        districtNameTh: "อ.ด่านขุนทด",
        cropKey: "cassava",
        threatNameTh: "โรคใบด่างมันสำปะหลัง (SLCMV)",
        affectedRai: 18,
        contactName: "นายสมศักดิ์ ปลูกสุข (กลุ่มแปลงใหญ่มันสำปะหลัง)",
        contactPhone: "081-998-XXXX",
        reportedAt: "13 ต.ค. 2569 09:30 น.",
        symptomsObserved: "พบใบยอดหงิกงอด่างเหลืองกระจาย 40% ในแปลงอายุ 3 เดือน ท่อนพันธุ์ซื้อจากนอกเขต",
      },
      {
        id: "rep-002",
        districtId: "phimai",
        districtNameTh: "อ.พิมาย",
        cropKey: "rice",
        threatNameTh: "โรคไหม้ข้าวหอมมะลิ (Rice Blast)",
        affectedRai: 25,
        contactName: "นางบัวลอย สัมฤทธิ์ (วิสาหกิจชุมชนข้าวหอม)",
        contactPhone: "089-772-XXXX",
        reportedAt: "14 ต.ค. 2569 07:15 น.",
        symptomsObserved: "พบแผลรูปกระสวยลามเข้าคอรวงข้าวหอมมะลิ 105 ระยะแทงรวง หมอกลงจัดยามเช้า",
      },
    ];
  });

  // Form state for reporting new outbreak incident
  const [reportForm, setReportForm] = useState({
    districtId: selectedDistrict.id,
    cropKey: "cassava" as TargetCropKey,
    threatNameTh: "โรคใบด่างมันสำปะหลัง (SLCMV)",
    affectedRai: 10,
    contactName: "",
    contactPhone: "",
    symptomsObserved: "",
  });
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string>("");

  // Get current district outbreak status
  const currentDistrictOutbreak = useMemo(() => {
    return getDistrictPestOutbreak(
      selectedDistrict.id,
      selectedDistrict.nameTh,
      selectedDistrict.zone,
      selectedDistrict.primaryCrops
    );
  }, [selectedDistrict]);

  // Sync report form district when selectedDistrict changes
  useEffect(() => {
    setReportForm((prev) => ({ ...prev, districtId: selectedDistrict.id }));
  }, [selectedDistrict.id]);

  // Check if current district has critical or high severity threats for notification
  const highestDistrictSeverity = useMemo<OutbreakSeverity>(() => {
    const severities = currentDistrictOutbreak.cropThreats.map((t) => t.status);
    if (severities.includes("critical")) return "critical";
    if (severities.includes("high")) return "high";
    if (severities.includes("moderate")) return "moderate";
    return "safe";
  }, [currentDistrictOutbreak]);

  // Trigger alert notification when district changes and alert watch is active
  useEffect(() => {
    if (!pestAlertWatchActive) return;

    const criticalThreats = currentDistrictOutbreak.cropThreats.filter(
      (t) => t.status === "critical" || t.status === "high"
    );

    if (criticalThreats.length > 0) {
      const topThreat = criticalThreats[0];
      const threatProfile = KORAT_CROP_PEST_PROFILES.find((p) => p.id === topThreat.primaryThreatId);
      const threatTitle = threatProfile?.nameTh || "โรค/แมลงศัตรูพืช";

      setNotificationToast({
        visible: true,
        title: `🚨 แจ้งเตือนระดับ${topThreat.status === "critical" ? "วิกฤตระบาดรุนแรง" : "เฝ้าระวังสูง"}: ${selectedDistrict.nameTh}`,
        message: `${threatTitle} ใน${TARGET_CROP_CONFIGS[topThreat.cropKey].nameTh} — ${topThreat.advisoryNote}`,
        severity: topThreat.status,
      });

      const timer = setTimeout(() => {
        setNotificationToast((prev) => ({ ...prev, visible: false }));
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [selectedDistrict.id, pestAlertWatchActive, currentDistrictOutbreak]);

  const handleToggleWatch = () => {
    const nextVal = !pestAlertWatchActive;
    setPestAlertWatchActive(nextVal);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY_WATCH_PREFS,
          JSON.stringify({ active: nextVal, updatedAt: new Date().toISOString() })
        );
      } catch (e) {
        console.warn("Could not save watch prefs", e);
      }
    }
  };

  // Filtered pest profiles
  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return KORAT_CROP_PEST_PROFILES.filter((profile) => {
      // Crop filter
      if (selectedCropFilter !== "all" && profile.cropKey !== selectedCropFilter) {
        return false;
      }
      // Category filter
      if (selectedCategoryFilter !== "all" && profile.category !== selectedCategoryFilter) {
        return false;
      }
      // Search query filter
      if (!q) return true;
      return (
        profile.nameTh.toLowerCase().includes(q) ||
        profile.nameEn.toLowerCase().includes(q) ||
        profile.cropNameTh.toLowerCase().includes(q) ||
        profile.scientificName.toLowerCase().includes(q) ||
        profile.vectorOrCause.toLowerCase().includes(q) ||
        profile.keySymptoms.some((s) => s.toLowerCase().includes(q)) ||
        profile.treatmentOptions.chemicalControl.some(
          (c) =>
            c.activeIngredient.toLowerCase().includes(q) ||
            c.tradeExample.toLowerCase().includes(q)
        )
      );
    });
  }, [selectedCropFilter, selectedCategoryFilter, searchQuery]);

  // Handle new incident report submission
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.contactName.trim() || !reportForm.symptomsObserved.trim()) {
      alert("กรุณาระบุชื่อผู้รายงานและลักษณะอาการที่พบในแปลง");
      return;
    }

    const distObj = KORAT_DISTRICTS.find((d) => d.id === reportForm.districtId) || selectedDistrict;

    const newReport: FarmerOutbreakIncidentReport = {
      id: `rep-${Date.now()}`,
      districtId: reportForm.districtId,
      districtNameTh: distObj.nameTh,
      cropKey: reportForm.cropKey,
      threatNameTh: reportForm.threatNameTh,
      affectedRai: Number(reportForm.affectedRai) || 1,
      contactName: reportForm.contactName.trim(),
      contactPhone: reportForm.contactPhone.trim() || "-",
      reportedAt: new Date().toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      symptomsObserved: reportForm.symptomsObserved.trim(),
    };

    const updated = [newReport, ...incidentReports];
    setIncidentReports(updated);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY_INCIDENT_REPORTS, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save incident report", err);
      }
    }

    setReportSuccessMessage(
      `บันทึกรายงานจุดระบาดสำเร็จ! ข้อมูลถูกส่งเข้าฐานข้อมูลเฝ้าระวัง อ. ${distObj.nameTh} เรียบร้อยแล้ว`
    );
    setReportForm({
      districtId: selectedDistrict.id,
      cropKey: "cassava",
      threatNameTh: "โรคใบด่างมันสำปะหลัง (SLCMV)",
      affectedRai: 10,
      contactName: "",
      contactPhone: "",
      symptomsObserved: "",
    });

    setTimeout(() => {
      setReportSuccessMessage("");
    }, 6000);
  };

  const handlePrintActionPlan = () => {
    window.print();
  };

  // Weather risk correlation explanation
  const weatherRiskInsight = useMemo(() => {
    const t = selectedDistrict.maxTempC;
    const hum = selectedDistrict.gistdaSoilMoisturePct;
    const rain = selectedDistrict.rainProbToday;

    if (t >= 35 && hum <= 35) {
      return {
        title: "สภาพอากาศแห้งแล้ง อุณหภูมิสูงจัด (เสี่ยงแมลงศัตรูปากดูด & ไรแดง)",
        desc: `อุณหภูมิ ${t}°C และความชื้นดินเพียง ${hum}% เร่งวงจรชีวิตของเพลี้ยแป้งสีชมพู ไรแดงมันสำปะหลัง และการแพร่กระจายของแมลงหวี่ขาวพาหะโรคใบด่าง SLCMV`,
        colorClass: "text-amber-400 border-amber-500/40 bg-amber-500/10",
      };
    }
    if (rain >= 55 || hum >= 50) {
      return {
        title: "สภาพฝนชุก ดินชื้นสะสมสูง (เสี่ยงโรคเชื้อรา & รากเน่า)",
        desc: `โอกาสฝนตก ${rain}% และความชื้นดิน ${hum}% เอื้อต่อการงอกของสปอร์เชื้อราโรคไหม้ข้าวหอมมะลิ (Rice Blast), รากเน่าโคนเน่ามันสำปะหลัง Phytophthora, และโรคราน้ำค้างข้าวโพด`,
        colorClass: "text-sky-400 border-sky-500/40 bg-sky-500/10",
      };
    }
    return {
      title: "สภาพอากาศช่วงเปลี่ยนผ่าน (เฝ้าระวังหนอนกระทู้และหนอนเจาะ)",
      desc: `อุณหภูมิ ${t}°C ความชื้นดิน ${hum}% ควรเฝ้าระวังหนอนกระทู้ข้าวโพดลายจุด FAW ในระยะยอดอ่อน และหนอนกออ้อย`,
      colorClass: "text-teal-400 border-teal-500/40 bg-teal-500/10",
    };
  }, [selectedDistrict]);

  return (
    <div className="space-y-6">
      {/* Toast Notification for Critical District Outbreaks */}
      {notificationToast.visible && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-5 duration-200 ${
            notificationToast.severity === "critical"
              ? "bg-[#1A0B10]/95 border-rose-500/70 text-rose-100"
              : notificationToast.severity === "high"
              ? "bg-[#1E1206]/95 border-amber-500/70 text-amber-100"
              : "bg-[#08151D]/95 border-sky-500/70 text-sky-100"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  notificationToast.severity === "critical"
                    ? "text-rose-400"
                    : notificationToast.severity === "high"
                    ? "text-amber-400"
                    : "text-sky-400"
                }`}
              />
              <div className="space-y-1">
                <div className="text-xs font-bold font-mono tracking-tight text-white">
                  {notificationToast.title}
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-200">
                  {notificationToast.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationToast((prev) => ({ ...prev, visible: false }))}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Module Header & Telemetry Control Bar */}
      <div className="bg-[#0B101D] border border-[#14B8A6]/45 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>ศูนย์เตือนภัยโรคและศัตรูพืช 4 พืชหลักโคราช</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111827] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>พื้นที่โฟกัส: {selectedDistrict.nameTh} ({selectedDistrict.zone})</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                  highestDistrictSeverity === "critical"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                    : highestDistrictSeverity === "high"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                    : highestDistrictSeverity === "moderate"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                }`}
              >
                {highestDistrictSeverity === "critical"
                  ? "🔴 วิกฤตระบาดรุนแรง"
                  : highestDistrictSeverity === "high"
                  ? "🟠 เฝ้าระวังสูง"
                  : highestDistrictSeverity === "moderate"
                  ? "🟡 ตรวจพบประปราย"
                  : "🟢 ปกติ/ความเสี่ยงต่ำ"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>ระบบเฝ้าระวัง แจ้งเตือน และควบคุมโรคแมลงศัตรูพืช</span>
              <span className="text-[#2DD4BF] text-sm sm:text-base font-normal font-mono hidden sm:inline">
                (Crop Disease &amp; Pest Alert System)
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              ติดตามสถานการณ์ระบาดของโรคใบด่างมันสำปะหลัง (SLCMV), โรคใบขาวอ้อย, หนอนกระทู้ข้าวโพดลายจุด (FAW), และโรคไหม้ข้าวหอมมะลิ 105 
              พร้อมคำแนะนำทางวิชาการจากกรมวิชาการเกษตรและสำนักงานเกษตรจังหวัดนครราชสีมา ครบทั้งชีววิธี สารเคมีตามมาตรฐาน IRAC/FRAC และระเบียบเขตกรรม
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* District Selector Dropdown */}
            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">อำเภอ:</span>
              <select
                value={selectedDistrict.id}
                onChange={(e) => onSelectDistrict(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {KORAT_DISTRICTS.map((dist) => (
                  <option key={dist.id} value={dist.id} className="bg-[#0B101D] text-white">
                    {dist.nameTh}
                  </option>
                ))}
              </select>
            </div>

            {/* Alert Watch Toggle */}
            <button
              type="button"
              onClick={handleToggleWatch}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                pestAlertWatchActive
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                  : "bg-[#111827] text-slate-400 border-[#1E293B] hover:text-white"
              }`}
              title="เปิด/ปิดการแจ้งเตือนอัตโนมัติเมื่อพบการระบาดในอำเภอที่เลือก"
            >
              {pestAlertWatchActive ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                  <span>ระบบเฝ้าระวัง: เปิด (Active)</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>ระบบเฝ้าระวัง: ปิด</span>
                </>
              )}
            </button>

            {/* Print Action Guide */}
            <button
              type="button"
              onClick={handlePrintActionPlan}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="พิมพ์คู่มือมาตรการควบคุมโรคพืช"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">พิมพ์คู่มือ</span>
            </button>

            {/* Open AI Clinic Link */}
            {onNavigateToClinic && (
              <button
                type="button"
                onClick={onNavigateToClinic}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>สแกนใบพืช AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-Time Climate Outbreak Linkage Bar */}
        <div
          className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${weatherRiskInsight.colorClass}`}
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <ThermometerSun className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="font-bold">{weatherRiskInsight.title}</div>
              <div className="text-[11.5px] opacity-90">{weatherRiskInsight.desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] shrink-0 border-t sm:border-t-0 sm:border-l border-current/20 pt-2 sm:pt-0 sm:pl-3">
            <span>🌡️ ผิวดิน {selectedDistrict.maxTempC}°C</span>
            <span>💧 ดิน {selectedDistrict.gistdaSoilMoisturePct}%</span>
            <span>🌧️ ฝน {selectedDistrict.rainProbToday}%</span>
          </div>
        </div>

        {/* 4 Key Crop Focus Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {(
            [
              { key: "cassava", icon: "🍠", note: "ระวังใบด่าง SLCMV & เพลี้ยแป้ง" },
              { key: "sugarcane", icon: "🎋", note: "ระวังโรคใบขาว & หนอนกออ้อย" },
              { key: "corn", icon: "🌽", note: "ระวังหนอนกระทู้ FAW & ราน้ำค้าง" },
              { key: "rice", icon: "🌾", note: "ระวังโรคไหม้ & เพลี้ยกระโดดสีน้ำตาล" },
            ] as { key: TargetCropKey; icon: string; note: string }[]
          ).map((c) => {
            const cfg = TARGET_CROP_CONFIGS[c.key];
            const threatStatus = currentDistrictOutbreak.cropThreats.find((t) => t.cropKey === c.key);
            const isSelected = selectedCropFilter === c.key;

            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCropFilter(isSelected ? "all" : c.key)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-[#111A2E] border-[#2DD4BF] shadow-[0_0_16px_rgba(45,212,191,0.2)]"
                    : "bg-[#080C16] border-[#1E293B] hover:border-slate-700 hover:bg-[#0D1527]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{cfg.nameTh}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cfg.annualAreaRai}</div>
                    </div>
                  </div>
                  {threatStatus && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        threatStatus.status === "critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : threatStatus.status === "high"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : threatStatus.status === "moderate"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {threatStatus.status === "critical"
                        ? "วิกฤต"
                        : threatStatus.status === "high"
                        ? "เสี่ยงสูง"
                        : threatStatus.status === "moderate"
                        ? "ประปราย"
                        : "ปกติ"}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
                  <span className="truncate">{c.note}</span>
                  <span className="text-[10px] font-mono text-[#2DD4BF] shrink-0">
                    {isSelected ? "✕ ล้างตัวกรอง" : "เลือกกรอง →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-2 flex flex-wrap items-center gap-2">
        {(
          [
            {
              id: "advisory_cards",
              label: "📋 คำแนะนำป้องกันและรักษาโรค/ศัตรูพืช (Actionable Advisory)",
              badge: `${filteredProfiles.length} รายการ`,
            },
            {
              id: "district_matrix",
              label: "🗺️ สถานการณ์ระบาด 32 อำเภอ (32-District Surveillance)",
              badge: "เรียลไทม์",
            },
            {
              id: "symptom_differentiator",
              label: "🔍 แยกแยะอาการคล้ายคลึง (Symptom Differentiator)",
              badge: "เปรียบเทียบ",
            },
            {
              id: "emergency_reporting",
              label: "📢 ศูนย์แจ้งเหตุระบาดฉุกเฉิน & เกษตรอำเภอ (Reporting Hub)",
              badge: `${incidentReports.length} บันทึก`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-[#14B8A6] text-[#041E1C] shadow-[0_0_14px_rgba(20,184,166,0.35)]"
                : "text-slate-300 hover:text-white hover:bg-[#111827]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                activeTab === tab.id ? "bg-[#041E1C] text-[#2DD4BF]" : "bg-[#1E293B] text-slate-400"
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: ADVISORY CARDS & DIAGNOSTIC DIRECTORY ================= */}
      {activeTab === "advisory_cards" && (
        <div className="space-y-5">
          {/* Search & Quick Filter Controls */}
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อโรค, แมลงศัตรูพืช, อาการใบหงิก/ไหม้, สารกำจัด (เช่น อิมิดาโคลพริด, ไตรไซคลาโซล)..."
                className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Filter className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>หมวดหมู่:</span>
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
                className="bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
              >
                <option value="all">ทั้งหมด (All Categories)</option>
                <option value="disease_virus">โรคเกิดจากไวรัส (Virus)</option>
                <option value="disease_fungus">โรคเกิดจากเชื้อรา (Fungus)</option>
                <option value="disease_bacteria">โรคเกิดจากแบคทีเรีย/ไฟโตพลาสมา (Bacteria)</option>
                <option value="pest_insect">แมลงศัตรูพืช (Insect Pests)</option>
              </select>

              {(selectedCropFilter !== "all" || selectedCategoryFilter !== "all" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCropFilter("all");
                    setSelectedCategoryFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>
          </div>

          {/* List of Profiles */}
          <div className="space-y-4">
            {filteredProfiles.length === 0 ? (
              <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-8 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="text-sm font-bold text-white">ไม่พบข้อมูลโรคหรือแมลงศัตรูพืชที่ตรงกับเงื่อนไข</div>
                <p className="text-xs text-slate-400">
                  ลองล้างคำค้นหาหรือเปลี่ยนการเลือกพืชเศรษฐกิจ
                </p>
              </div>
            ) : (
              filteredProfiles.map((threat) => {
                const isExpanded = expandedThreatId === threat.id;
                const cropCfg = TARGET_CROP_CONFIGS[threat.cropKey];
                const isHotspot = threat.koratHotspotDistricts.some((d) =>
                  selectedDistrict.nameTh.includes(d)
                );

                return (
                  <div
                    key={threat.id}
                    className={`bg-[#080C16] border rounded-2xl transition-all overflow-hidden ${
                      isHotspot
                        ? "border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.12)]"
                        : isExpanded
                        ? "border-[#14B8A6]/60 shadow-lg"
                        : "border-[#1E293B] hover:border-slate-700"
                    }`}
                  >
                    {/* Card Header Accordion Trigger */}
                    <div
                      onClick={() => setExpandedThreatId(isExpanded ? "" : threat.id)}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#0D1322] transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                            threat.severityLevel === "critical"
                              ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                              : threat.severityLevel === "high"
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                              : "bg-teal-500/15 border-teal-500/40 text-teal-400"
                          }`}
                        >
                          {threat.highlightedIcon === "virus" ? (
                            <ShieldAlert className="w-5 h-5" />
                          ) : threat.highlightedIcon === "bug" ? (
                            <Bug className="w-5 h-5" />
                          ) : (
                            <FlaskConical className="w-5 h-5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cropCfg.badgeBg} ${cropCfg.badgeBorder} ${cropCfg.badgeText}`}
                            >
                              {cropCfg.nameTh}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                              {threat.categoryLabelTh}
                            </span>
                            {isHotspot && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold animate-pulse">
                                ⚠️ พื้นที่เสี่ยงสูงของ {selectedDistrict.nameTh}
                              </span>
                            )}
                          </div>

                          <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                            <span>{threat.nameTh}</span>
                            <span className="text-xs text-slate-400 font-normal font-mono hidden sm:inline">
                              ({threat.nameEn})
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                            <span>🔬 สาเหตุ: {threat.vectorOrCause}</span>
                            <span>·</span>
                            <span className="text-rose-400 font-semibold">
                              ความเสียหายสูงสุด: {threat.estimatedLossRiskPct}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <div className="text-right hidden sm:block">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              threat.severityLevel === "critical"
                                ? "bg-rose-500/20 text-rose-300"
                                : threat.severityLevel === "high"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-teal-500/20 text-teal-300"
                            }`}
                          >
                            {threat.severityLevel === "critical"
                              ? "ระดับวิกฤต (Critical)"
                              : threat.severityLevel === "high"
                              ? "ระดับเฝ้าระวังสูง (High)"
                              : "ระดับควบคุมได้ (Moderate)"}
                          </span>
                          <div className="text-[11px] text-slate-400 font-mono mt-1">
                            ระยะเสี่ยง: {threat.vulnerableStageTh.split(" ")[0]}
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detailed Actionable Content */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 border-t border-[#1E293B] space-y-6 bg-[#070A14]">
                        {/* 1. Key Symptoms & Diagnostic Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#0B101D] border border-slate-800 rounded-xl p-4 space-y-2.5">
                            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase font-mono">
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                              <span>อาการเด่นที่พบในแปลง (Characteristic Symptoms)</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {threat.keySymptoms.map((sym, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                                  <span>{sym}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-[#0B101D] border border-slate-800 rounded-xl p-4 space-y-2.5">
                            <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 uppercase font-mono">
                              <CheckCircle2 className="w-4 h-4 text-sky-400" />
                              <span>ขั้นตอนสำรวจแปลง (Diagnostic Checklist)</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {threat.diagnosticChecklist.map((chk, cIdx) => (
                                <li key={cIdx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                                  <span>{chk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* 2. Preventative Measures (มาตรการป้องกันก่อนเกิดโรค) */}
                        <div className="bg-[#0B101D] border border-[#14B8A6]/30 rounded-xl p-4 sm:p-5 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF] uppercase font-mono">
                            <Sprout className="w-4 h-4 text-[#14B8A6]" />
                            <span>1. มาตรการป้องกันล่วงหน้าและการจัดการเขตกรรม (Preventative Measures)</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="bg-[#080C16] p-3 rounded-lg border border-slate-800 space-y-1.5">
                              <div className="font-semibold text-white">🌱 การคัดเลือกพันธุ์</div>
                              <ul className="space-y-1 text-slate-300 text-[11px]">
                                {threat.preventativeMeasures.varietySelection.map((v, vIdx) => (
                                  <li key={vIdx} className="flex items-start gap-1.5">
                                    <span className="text-[#14B8A6]">✔</span>
                                    <span>{v}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-[#080C16] p-3 rounded-lg border border-slate-800 space-y-1.5">
                              <div className="font-semibold text-white">🚜 การจัดการแปลง &amp; ดิน</div>
                              <ul className="space-y-1 text-slate-300 text-[11px]">
                                {threat.preventativeMeasures.culturalPractices.map((c, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-1.5">
                                    <span className="text-[#14B8A6]">✔</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-[#080C16] p-3 rounded-lg border border-slate-800 space-y-1.5">
                              <div className="font-semibold text-white">🛡️ การเตรียมเมล็ด/ท่อนพันธุ์</div>
                              <ul className="space-y-1 text-slate-300 text-[11px]">
                                {threat.preventativeMeasures.quarantineAndSeedPrep.map((q, qIdx) => (
                                  <li key={qIdx} className="flex items-start gap-1.5">
                                    <span className="text-[#14B8A6]">✔</span>
                                    <span>{q}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* 3. Actionable Treatment Options (ชีววิธี & เคมีตามมาตรฐาน DOA) */}
                        <div className="bg-[#0B101D] border border-rose-500/30 rounded-xl p-4 sm:p-5 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase font-mono">
                            <FlaskConical className="w-4 h-4 text-rose-400" />
                            <span>2. แนวทางการควบคุมและรักษาเมื่อพบการระบาด (Actionable Treatment Options)</span>
                          </div>

                          {/* Emergency Sanitation */}
                          <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3.5 space-y-1.5 text-xs">
                            <div className="font-bold text-rose-300 flex items-center gap-1.5">
                              <Flame className="w-3.5 h-3.5 text-rose-400" />
                              <span>มาตรการกำจัดทำลายด่วน (Emergency Sanitation):</span>
                            </div>
                            <ul className="space-y-1 text-slate-300 text-[11.5px]">
                              {threat.treatmentOptions.emergencySanitation.map((san, sanIdx) => (
                                <li key={sanIdx} className="flex items-start gap-2">
                                  <span className="text-rose-400 font-bold">•</span>
                                  <span>{san}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Biological Control (ชีววิธี) */}
                          {threat.treatmentOptions.biologicalControl.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                                <span>🌿 การควบคุมทางชีววิธี (Biological Control - ปลอดภัย ไม่ดื้อยา):</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {threat.treatmentOptions.biologicalControl.map((bio, bIdx) => (
                                  <div
                                    key={bIdx}
                                    className="bg-[#080C16] border border-emerald-500/30 rounded-xl p-3 space-y-1.5 text-xs"
                                  >
                                    <div className="font-bold text-emerald-300">{bio.title}</div>
                                    <div className="text-slate-200">
                                      สิ่งมีชีวิตควบคุม: <strong className="text-white">{bio.agentName}</strong>
                                    </div>
                                    <div className="text-slate-300 text-[11px]">
                                      อัตราปล่อย/พ่น: <span className="font-mono text-[#2DD4BF]">{bio.dosageOrRate}</span>
                                    </div>
                                    <div className="text-slate-400 text-[11px]">
                                      ช่วงเวลา: {bio.bestApplicationTime}
                                    </div>
                                    <div className="text-emerald-400/90 text-[11px] italic">
                                      ข้อดี: {bio.advantage}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chemical Prescriptions (สารเคมีมาตรฐาน DOA) */}
                          {threat.treatmentOptions.chemicalControl.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 font-mono">
                                <span>🧪 การใช้สารเคมีที่แนะนำตามมาตรฐานกรมวิชาการเกษตร (Chemical Prescriptions):</span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-300">
                                  <thead className="bg-[#080C16] text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                                    <tr>
                                      <th className="py-2.5 px-3">ชื่อสารออกฤทธิ์ (Active Ingredient)</th>
                                      <th className="py-2.5 px-3">กลุ่มกลไก IRAC/FRAC</th>
                                      <th className="py-2.5 px-3">อัตราการใช้ต่อน้ำ 20 ลิตร</th>
                                      <th className="py-2.5 px-3">วันหยุดพ่นก่อนเก็บ (PHI)</th>
                                      <th className="py-2.5 px-3">ข้อควรระวัง/ความปลอดภัย</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/80 bg-[#060912]">
                                    {threat.treatmentOptions.chemicalControl.map((chem, cIdx) => (
                                      <tr key={cIdx} className="hover:bg-slate-800/30">
                                        <td className="py-2.5 px-3 font-semibold text-white">
                                          <div>{chem.activeIngredient}</div>
                                          <div className="text-[10px] text-slate-400">
                                            ตัวอย่างการค้า: {chem.tradeExample}
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[#2DD4BF] text-[11px]">
                                          {chem.iracFracGroup}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-amber-300 font-bold">
                                          {chem.dosagePer20L}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-rose-300">
                                          {chem.phiDays} วัน
                                        </td>
                                        <td className="py-2.5 px-3 text-[11px] text-slate-300 max-w-xs">
                                          {chem.safetyCaution}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. Look-Alike Differentiator Callout */}
                        <div className="bg-[#0F172A] border border-yellow-500/30 rounded-xl p-4 text-xs space-y-1.5">
                          <div className="font-bold text-yellow-300 flex items-center gap-1.5 font-mono">
                            <Info className="w-4 h-4 text-yellow-400" />
                            <span>จุดสังเกตแยกแยะอาการคล้ายคลึง: {threat.lookAlikeDifferentiator.similarIssueName}</span>
                          </div>
                          <p className="text-slate-300 text-[11.5px] leading-relaxed">
                            {threat.lookAlikeDifferentiator.keyDifference}
                          </p>
                          <div className="text-[#2DD4BF] text-[11px] font-mono">
                            💡 เคล็ดลับการตรวจในแปลง: {threat.lookAlikeDifferentiator.fieldTestTip}
                          </div>
                        </div>

                        {/* 5. Local Korat Extension Advisory & Hotspots */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800">
                          <div className="space-y-1">
                            <div className="text-slate-400 font-mono text-[11px]">
                              📍 อำเภอที่มีประวัติการระบาดสะสมในโคราช:
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {threat.koratHotspotDistricts.map((d, dIdx) => (
                                <span
                                  key={dIdx}
                                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] ${
                                    selectedDistrict.nameTh.includes(d)
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                                      : "bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {formatDistrictName(d)}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setReportForm((prev) => ({
                                  ...prev,
                                  cropKey: threat.cropKey,
                                  threatNameTh: threat.nameTh,
                                }));
                                setActiveTab("emergency_reporting");
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>แจ้งพบจุดระบาดในแปลง</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: 32 DISTRICTS OUTBREAK SURVEILLANCE MATRIX ================= */}
      {activeTab === "district_matrix" && (
        <div className="space-y-5">
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2DD4BF]" />
                  <span>ตารางสถานการณ์เฝ้าระวังโรคและศัตรูพืช 32 อำเภอ จังหวัดนครราชสีมา</span>
                </h3>
                <p className="text-xs text-slate-400">
                  สำรวจและอัปเดตข้อมูลภาคสนามร่วมกับสำนักงานเกษตรอำเภอและศูนย์จัดการศัตรูพืชชุมชน (ศจช.)
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>วิกฤต</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>เฝ้าระวังสูง</span>
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                  <span>ประปราย</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>ปลอดภัย</span>
                </span>
              </div>
            </div>

            {/* 32 District Surveillance Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0F172A] text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">อำเภอ / โซนเกษตร</th>
                    <th className="py-3 px-3">มันสำปะหลัง (Cassava)</th>
                    <th className="py-3 px-3">อ้อยโรงงาน (Sugarcane)</th>
                    <th className="py-3 px-3">ข้าวโพด (Corn)</th>
                    <th className="py-3 px-3">ข้าวหอมมะลิ (Rice)</th>
                    <th className="py-3 px-3">คำแนะนำเร่งด่วน / เบอร์เกษตรอำเภอ</th>
                    <th className="py-3 px-3 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#060912]">
                  {KORAT_DISTRICTS.map((dist) => {
                    const outbreak = getDistrictPestOutbreak(
                      dist.id,
                      dist.nameTh,
                      dist.zone,
                      dist.primaryCrops
                    );
                    const isSelected = dist.id === selectedDistrict.id;

                    const cassavaThreat = outbreak.cropThreats.find((t) => t.cropKey === "cassava");
                    const sugarThreat = outbreak.cropThreats.find((t) => t.cropKey === "sugarcane");
                    const cornThreat = outbreak.cropThreats.find((t) => t.cropKey === "corn");
                    const riceThreat = outbreak.cropThreats.find((t) => t.cropKey === "rice");

                    const renderBadge = (status?: OutbreakSeverity) => {
                      if (!status) return <span className="text-slate-600">-</span>;
                      if (status === "critical")
                        return (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/40">
                            วิกฤต (SLCMV/FAW)
                          </span>
                        );
                      if (status === "high")
                        return (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                            เฝ้าระวังสูง
                          </span>
                        );
                      if (status === "moderate")
                        return (
                          <span className="px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-300 font-mono border border-yellow-500/30">
                            ประปราย
                          </span>
                        );
                      return (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-mono">
                          ปลอดภัย
                        </span>
                      );
                    };

                    return (
                      <tr
                        key={dist.id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[#14B8A6]/10 border-l-4 border-l-[#2DD4BF]"
                            : "hover:bg-slate-800/30"
                        }`}
                      >
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => onSelectDistrict(dist.id)}
                            className="font-bold text-white hover:text-[#2DD4BF] transition-colors cursor-pointer text-left"
                          >
                            {dist.nameTh}
                          </button>
                          <div className="text-[10px] text-slate-400 font-mono">{dist.zone}</div>
                        </td>
                        <td className="py-3 px-3">{renderBadge(cassavaThreat?.status)}</td>
                        <td className="py-3 px-3">{renderBadge(sugarThreat?.status)}</td>
                        <td className="py-3 px-3">{renderBadge(cornThreat?.status)}</td>
                        <td className="py-3 px-3">{renderBadge(riceThreat?.status)}</td>
                        <td className="py-3 px-3 text-[11px] max-w-xs text-slate-300">
                          <div>{cassavaThreat?.advisoryNote || riceThreat?.advisoryNote}</div>
                          <div className="text-[#2DD4BF] font-mono text-[10px] mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>โทร {outbreak.extensionOfficePhone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDistrict(dist.id);
                              setActiveTab("advisory_cards");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#14B8A6] hover:text-[#041E1C] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                          >
                            โฟกัส
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SYMPTOM DIFFERENTIATOR MATRIX ================= */}
      {activeTab === "symptom_differentiator" && (
        <div className="space-y-5">
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-[#2DD4BF]" />
                <span>เครื่องมือแยกแยะอาการคล้ายคลึงระหว่างโรคพืชกับการขาดธาตุอาหาร (Symptom Differentiator)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ป้องกันการวินิจฉัยผิดพลาด เช่น การเข้าใจผิดว่าโรคใบด่างคืออาการขาดธาตุสังกะสี หรือโรคใบขาวอ้อยคือการขาดธาตุเหล็ก
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Diff Card 1: Cassava Mosaic vs Zinc Deficiency */}
              <div className="bg-[#0B101D] border border-amber-500/35 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono">
                  <span>🍠 มันสำปะหลัง: ใบด่าง SLCMV vs ขาดสังกะสี</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <strong className="text-rose-300">🚨 โรคใบด่าง SLCMV (ไวรัส):</strong>
                    <div className="text-[11px]">
                      • ใบยอดหงิกงอบิดเบี้ยว รอยด่างสีเขียวเข้มสลับเขียวอมเหลือง
                    </div>
                    <div className="text-[11px]">• ยอดหดสั้นเป็นพุ่ม ข้อถี่ พลอยมีแมลงหวี่ขาวใต้ใบ</div>
                    <div className="text-[11px] text-rose-400 font-mono">• อันตราย: สูญเสียผลผลิต 80-100%</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                    <strong className="text-emerald-300">🌿 อาการขาดสังกะสี (Zn Deficiency):</strong>
                    <div className="text-[11px]">
                      • ใบเหลืองซีดระหว่างเส้นใบ แต่ใบไม่หงิกบิดเบี้ยว
                    </div>
                    <div className="text-[11px]">• เกิดสม่ำเสมอทั่วทั้งแปลงในดินด่างจัด</div>
                    <div className="text-[11px] text-emerald-400 font-mono">• วิธีแก้: ฉีดพ่นสังกะสีคีเลตทางใบ 2-3 ครั้ง</div>
                  </div>
                </div>
              </div>

              {/* Diff Card 2: Sugarcane White Leaf vs Iron Chlorosis */}
              <div className="bg-[#0B101D] border border-teal-500/35 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF] font-mono">
                  <span>🎋 อ้อยโรงงาน: ใบขาว SCWL vs ขาดธาตุเหล็ก</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <strong className="text-rose-300">🚨 โรคใบขาวอ้อย (Phytoplasma):</strong>
                    <div className="text-[11px]">
                      • เส้นใบและเนื้อใบขาวบริสุทธิ์ทั้งใบ ไร้คลอโรฟิลล์
                    </div>
                    <div className="text-[11px]">• หน่อแตกฝอยถี่คล้ายกอหญ้า กออ้อยแคระแกร็นไม่ย่างปล้อง</div>
                    <div className="text-[11px] text-rose-400 font-mono">• อันตราย: ไถทิ้งทั้งแปลง ห้ามไว้ตอ</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                    <strong className="text-emerald-300">🌿 อาการขาดธาตุเหล็ก (Fe Chlorosis):</strong>
                    <div className="text-[11px]">
                      • ใบยอดเหลืองซีด แต่เส้นใบยังคงเห็นสีเขียวชัดเจน
                    </div>
                    <div className="text-[11px]">• หน่อไม่แตกฝอย ลำต้นยังคงสร้างปล้องตามปกติ</div>
                    <div className="text-[11px] text-emerald-400 font-mono">• วิธีแก้: พ่นธาตุเหล็กคีเลต Fe-EDDHA</div>
                  </div>
                </div>
              </div>

              {/* Diff Card 3: Rice Blast vs Bacterial Leaf Blight */}
              <div className="bg-[#0B101D] border border-sky-500/35 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300 font-mono">
                  <span>🌾 ข้าวหอมมะลิ: โรคไหม้ vs ขอบใบแห้ง</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/30 space-y-1">
                    <strong className="text-rose-300">🚨 โรคไหม้ข้าว (Rice Blast - เชื้อรา):</strong>
                    <div className="text-[11px]">
                      • แผลรูปกระสวย ปลายแหลมสองด้าน กลางแผลสีเทาเงิน
                    </div>
                    <div className="text-[11px]">• ถ้าเกิดที่คอรวง คอรวงจะเน่าหักพับ เมล็ดลีบทั้งรวง</div>
                    <div className="text-[11px] text-rose-400 font-mono">• รักษา: ไตรไซคลาโซล 75% WP</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                    <strong className="text-emerald-300">🌿 โรคขอบใบแห้ง (BLB - แบคทีเรีย):</strong>
                    <div className="text-[11px]">
                      • แผลเริ่มจากริมขอบใบเป็นทางยาว ขอบแผลเป็นคลื่นหยัก
                    </div>
                    <div className="text-[11px]">• ช่วงเช้าตรู่มีหยดน้ำเมือกสีส้มเหลืองที่ปลายแผล</div>
                    <div className="text-[11px] text-emerald-400 font-mono">• รักษา: คอปเปอร์ไฮดรอกไซด์ / แบคทีเรีย BS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: EMERGENCY REPORTING & EXTENSION DIRECTORY ================= */}
      {activeTab === "emergency_reporting" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 6 Cols: Farmer Incident Submission Form */}
            <div className="lg:col-span-6 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>แจ้งพบจุดระบาดในแปลงเกษตรกรรม</span>
                </div>
                <h4 className="text-base font-bold text-white">แบบฟอร์มรายงานจุดระบาดโรคและศัตรูพืช</h4>
                <p className="text-xs text-slate-400">
                  ข้อมูลจะถูกบันทึกลงในระบบสารสนเทศเพื่อประสานเจ้าหน้าที่เกษตรตำบล/อำเภอลงตรวจพื้นที่
                </p>
              </div>

              {reportSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
                  {reportSuccessMessage}
                </div>
              )}

              <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">อำเภอที่เกิดเหตุ:</label>
                    <select
                      value={reportForm.districtId}
                      onChange={(e) => setReportForm({ ...reportForm, districtId: e.target.value })}
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    >
                      {KORAT_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameTh}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ชนิดพืชที่ระบาด:</label>
                    <select
                      value={reportForm.cropKey}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, cropKey: e.target.value as TargetCropKey })
                      }
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    >
                      <option value="cassava">มันสำปะหลัง (Cassava)</option>
                      <option value="sugarcane">อ้อยโรงงาน (Sugarcane)</option>
                      <option value="corn">ข้าวโพดเลี้ยงสัตว์ (Corn)</option>
                      <option value="rice">ข้าวหอมมะลิ 105 (Rice)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">ชื่อโรคหรือศัตรูพืชที่สงสัย:</label>
                    <input
                      type="text"
                      value={reportForm.threatNameTh}
                      onChange={(e) => setReportForm({ ...reportForm, threatNameTh: e.target.value })}
                      placeholder="เช่น โรคใบด่าง SLCMV, หนอนกระทู้ลายจุด..."
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ประมาณพื้นที่ระบาด (ไร่):</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={reportForm.affectedRai}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, affectedRai: Number(e.target.value) })
                      }
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">ชื่อ-สกุล เกษตรกรผู้รายงาน:</label>
                    <input
                      type="text"
                      value={reportForm.contactName}
                      onChange={(e) => setReportForm({ ...reportForm, contactName: e.target.value })}
                      placeholder="เช่น นายมานะ เกษตรโคราช..."
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">เบอร์โทรศัพท์ติดต่อกลับ:</label>
                    <input
                      type="tel"
                      value={reportForm.contactPhone}
                      onChange={(e) => setReportForm({ ...reportForm, contactPhone: e.target.value })}
                      placeholder="เช่น 081-234-5678"
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    ลักษณะอาการที่สังเกตพบในแปลง / พิกัดตำบล:
                  </label>
                  <textarea
                    rows={3}
                    value={reportForm.symptomsObserved}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, symptomsObserved: e.target.value })
                    }
                    placeholder="ระบุอาการ เช่น ใบยอดด่างเหลืองม้วนงอ 20 ต้น, พบหนอนในกรวยยอดพร้อมขี้เลื่อย ต.ห้วยบง..."
                    className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2DD4BF]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งรายงานจุดระบาดเข้าสู่ระบบเฝ้าระวัง</span>
                </button>
              </form>
            </div>

            {/* Right 6 Cols: Recent Reports Feed & Hotline Directory */}
            <div className="lg:col-span-6 space-y-4">
              {/* Emergency Hotline Directory */}
              <div className="bg-[#080C16] border border-[#14B8A6]/35 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF] font-mono uppercase">
                  <Phone className="w-4 h-4 text-[#14B8A6]" />
                  <span>สายด่วนและศูนย์ประสานงานเกษตรโคราช</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-[#0B101D] p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-400 text-[10px]">สำนักงานเกษตรจังหวัดนครราชสีมา:</div>
                    <div className="font-bold text-white font-mono text-sm">044-242061</div>
                    <div className="text-[10px] text-slate-400">กลุ่มอารักขาพืชและควบคุมศัตรูพืช</div>
                  </div>

                  <div className="bg-[#0B101D] p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-400 text-[10px]">
                      เกษตรอำเภอ{selectedDistrict.nameTh}:
                    </div>
                    <div className="font-bold text-[#2DD4BF] font-mono text-sm">
                      {currentDistrictOutbreak.extensionOfficePhone}
                    </div>
                    <div className="text-[10px] text-slate-400">พร้อมลงตรวจแปลงและรับเรื่องร้องเรียน</div>
                  </div>

                  <div className="bg-[#0B101D] p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-400 text-[10px]">สายด่วนกรมส่งเสริมการเกษตร:</div>
                    <div className="font-bold text-amber-300 font-mono text-sm">1170</div>
                    <div className="text-[10px] text-slate-400">โทรฟรีในวันและเวลาราชการ</div>
                  </div>

                  <div className="bg-[#0B101D] p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-400 text-[10px]">ศทอ. นครราชสีมา (ศัตรูธรรมชาติ):</div>
                    <div className="font-bold text-emerald-300 font-mono text-sm">044-315180</div>
                    <div className="text-[10px] text-slate-400">ขอรับแตนเบียน / บิวเวอเรีย / ไตรโคเดอร์มา</div>
                  </div>
                </div>
              </div>

              {/* Recent Incident Reports Feed */}
              <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>รายงานจุดระบาดล่าสุด ({incidentReports.length} บันทึก)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">บันทึกลงในเบราว์เซอร์</span>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {incidentReports.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#0B101D] border border-slate-800 rounded-xl p-3 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                        <span className="text-[#2DD4BF] font-semibold">{item.districtNameTh}</span>
                        <span>{item.reportedAt}</span>
                      </div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{item.threatNameTh}</span>
                        <span className="text-rose-400 font-mono text-[11px]">{item.affectedRai} ไร่</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {item.symptomsObserved}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        ผู้รายงาน: {item.contactName} ({item.contactPhone})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
