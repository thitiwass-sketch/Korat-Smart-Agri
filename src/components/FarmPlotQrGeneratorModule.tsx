import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import {
  KORAT_DISTRICTS,
  KORAT_COMMODITIES,
  KoratDistrict,
  KoratGeoPlotPin,
} from "../data/koratAgriData";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  MapPin,
  ShieldCheck,
  FileText,
  Smartphone,
  UserCheck,
  Sprout,
  RefreshCw,
  CheckCircle2,
  Eye,
} from "lucide-react";

interface FarmPlotQrGeneratorModuleProps {
  selectedDistrict: KoratDistrict;
  plots: KoratGeoPlotPin[];
  onSelectDistrict?: (districtId: string) => void;
}

type QrReportType = "coop_delivery" | "ks01_drought" | "gi_traceability";
type QrPayloadFormat = "readable_text" | "deeplink_url" | "coop_json";

const REPORT_TYPE_META: Record<
  QrReportType,
  {
    labelTh: string;
    badgeTh: string;
    recipientOfficerTh: string;
    descriptionTh: string;
  }
> = {
  coop_delivery: {
    labelTh: "บัตรส่งมอบผลผลิต & โควตาสหกรณ์",
    badgeTh: "COOP DELIVERY PASS",
    recipientOfficerTh: "เจ้าหน้าที่สหกรณ์การเกษตร / จุดรวบรวมผลผลิต",
    descriptionTh:
      "ใช้สแกนหน้าลานสหกรณ์เพื่อยืนยันทะเบียนแปลง พิกัด GPS ปริมาณผลผลิตประเมิน และรับสิทธิ์ส่วนลดค่าขนส่ง/น้ำมันเครื่องจักรกลหนัก",
  },
  ks01_drought: {
    labelTh: "รายงานสถานะภัยแล้ง & ยื่นสิทธิ์ กษ.01",
    badgeTh: "DOAE KS.01 VERIFICATION",
    recipientOfficerTh: "เจ้าหน้าที่เกษตรอำเภอ / คณะกรรมการตรวจสอบภัยพิบัติ",
    descriptionTh:
      "แนบค่าดัชนีภัยแล้ง SPI-30d ความชื้นดินดาวเทียม GISTDA และดัชนีพืช NDVI รายแปลง เพื่อประกอบการพิจารณาเงินเยียวยา กษ.01",
  },
  gi_traceability: {
    labelTh: "ใบรับรองผลไม้ GI & สูตรปุ๋ยสั่งตัดประจำแปลง",
    badgeTh: "GI & SOIL TRACEABILITY",
    recipientOfficerTh: "สหกรณ์ผู้ปลูกไม้ผล GI / ผู้บริโภคระบบ Pre-order",
    descriptionTh:
      "แสดงแหล่งกำเนิดผลไม้พรีเมียมโซนเขาโคราช ค่าวิเคราะห์ดิน N-P-K และมาตรฐานการผลิตปลอดภัยสำหรับติดหน้ากล่องผลไม้",
  },
};

export const FarmPlotQrGeneratorModule: React.FC<
  FarmPlotQrGeneratorModuleProps
> = ({ selectedDistrict, plots, onSelectDistrict }) => {
  // Match plot in selected district or fallback to first plot
  const defaultPlotForDistrict = useMemo(() => {
    return (
      plots.find((p) => p.districtId === selectedDistrict.id) || plots[0]
    );
  }, [plots, selectedDistrict.id]);

  const [selectedPlotId, setSelectedPlotId] = useState<string>(
    defaultPlotForDistrict?.id || "custom"
  );
  const [reportType, setReportType] = useState<QrReportType>("coop_delivery");
  const [payloadFormat, setPayloadFormat] =
    useState<QrPayloadFormat>("readable_text");

  // Editable plot/report fields synced with selected plot
  const [plotCode, setPlotCode] = useState<string>(
    defaultPlotForDistrict?.plotCode || "NMA-DKT-101"
  );
  const [farmerName, setFarmerName] = useState<string>(
    defaultPlotForDistrict?.farmerName || "นายสมชาย ใจดี"
  );
  const [coopMemberId, setCoopMemberId] = useState<string>("COOP-NMA-30148");
  const [subdistrictTh, setSubdistrictTh] = useState<string>(
    defaultPlotForDistrict?.subdistrictTh || "ต.หนองบัวตะเกียด"
  );
  const [cropName, setCropName] = useState<string>(
    defaultPlotForDistrict?.cropName || "มันสำปะหลัง (พันธุ์เกษตรศาสตร์ 50)"
  );
  const [areaRai, setAreaRai] = useState<number>(
    defaultPlotForDistrict?.areaRai || 18
  );
  const [lat, setLat] = useState<number>(
    defaultPlotForDistrict?.lat || selectedDistrict.lat
  );
  const [lon, setLon] = useState<number>(
    defaultPlotForDistrict?.lon || selectedDistrict.lon
  );
  const [officerNotes, setOfficerNotes] = useState<string>(
    "ขึ้นทะเบียนเกษตรกร Digital DOAE เรียบร้อยแล้ว พร้อมส่งมอบผลผลิตตามโควตาสหกรณ์"
  );

  // Generated QR Data URL & UI feedback state
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [showOfficerPreview, setShowOfficerPreview] = useState<boolean>(false);
  const [isDownloadingCard, setIsDownloadingCard] = useState<boolean>(false);

  // Sync form fields when user picks a plot from the dropdown
  const handleSelectPlot = (plotId: string) => {
    setSelectedPlotId(plotId);
    const found = plots.find((p) => p.id === plotId);
    if (found) {
      setPlotCode(found.plotCode);
      setFarmerName(found.farmerName);
      setSubdistrictTh(found.subdistrictTh);
      setCropName(found.cropName);
      setAreaRai(found.areaRai);
      setLat(found.lat);
      setLon(found.lon);
      if (onSelectDistrict) {
        onSelectDistrict(found.districtId);
      }
    }
  };

  // Sync when selectedDistrict changes externally and has a matching plot
  useEffect(() => {
    const match = plots.find((p) => p.districtId === selectedDistrict.id);
    if (match) {
      setSelectedPlotId(match.id);
      setPlotCode(match.plotCode);
      setFarmerName(match.farmerName);
      setSubdistrictTh(match.subdistrictTh);
      setCropName(match.cropName);
      setAreaRai(match.areaRai);
      setLat(match.lat);
      setLon(match.lon);
    } else {
      setLat(selectedDistrict.lat);
      setLon(selectedDistrict.lon);
    }
  }, [selectedDistrict.id, selectedDistrict.lat, selectedDistrict.lon, plots]);

  // Estimate Ks01 compensation & yield value
  const estimatedKs01Baht = useMemo(() => {
    const rate =
      cropName.includes("ทุเรียน") ||
      cropName.includes("เงาะ") ||
      cropName.includes("มังคุด") ||
      cropName.includes("ไม้ผล")
        ? 4048
        : cropName.includes("ข้าวหอมมะลิ") || cropName.includes("ข้าวนา")
        ? 1340
        : 1980;
    return Math.min(30, areaRai) * rate;
  }, [cropName, areaRai]);

  const verificationCode = useMemo(() => {
    const hashSeed = `${plotCode}-${selectedDistrict.id}-${areaRai}`;
    let sum = 0;
    for (let i = 0; i < hashSeed.length; i++) {
      sum = (sum * 31 + hashSeed.charCodeAt(i)) % 999999;
    }
    return `KSA-${String(sum).padStart(6, "0")}`;
  }, [plotCode, selectedDistrict.id, areaRai]);

  // Build QR Code Payload String based on selected format and report type
  const qrPayloadString = useMemo(() => {
    const reportMeta = REPORT_TYPE_META[reportType];
    const timestampTh = new Date().toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (payloadFormat === "deeplink_url") {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://korat-smartagri.app";
      const params = new URLSearchParams({
        verify: verificationCode,
        plot: plotCode,
        district: selectedDistrict.id,
        farmer: farmerName,
        crop: cropName,
        rai: String(areaRai),
        spi: String(selectedDistrict.spi30d),
        moisture: String(selectedDistrict.gistdaSoilMoisturePct),
        type: reportType,
      });
      return `${origin}/?${params.toString()}`;
    }

    if (payloadFormat === "coop_json") {
      return JSON.stringify(
        {
          system: "Korat SmartAgri",
          verifyCode: verificationCode,
          reportType: reportMeta.badgeTh,
          date: timestampTh,
          plotCode,
          coopMemberId,
          farmerName,
          location: {
            district: selectedDistrict.nameTh,
            subdistrict: subdistrictTh,
            lat: Number(lat.toFixed(5)),
            lon: Number(lon.toFixed(5)),
          },
          crop: {
            name: cropName,
            areaRai,
            soilSeries: selectedDistrict.soilSeriesName,
          },
          telemetry: {
            soilMoisturePct: selectedDistrict.gistdaSoilMoisturePct,
            spi30d: selectedDistrict.spi30d,
            rainProbPct: selectedDistrict.rainProbToday,
            droughtRisk: selectedDistrict.droughtRiskLevel,
            estimatedKs01Baht,
          },
        },
        null,
        2
      );
    }

    // Default: Human-readable official Thai summary text when scanned by phone/LINE
    return [
      `[Korat SmartAgri · ${reportMeta.labelTh}]`,
      `รหัสอ้างอิง: ${verificationCode} (${timestampTh})`,
      `ทะเบียนแปลง: ${plotCode} | สมาชิกสหกรณ์: ${coopMemberId}`,
      `เกษตรกร: ${farmerName}`,
      `ที่ตั้ง: ${subdistrictTh} ${selectedDistrict.nameTh} จ.นครราชสีมา`,
      `พิกัด GPS: ${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`,
      `พืชที่ปลูก: ${cropName} (พื้นที่ ${areaRai} ไร่)`,
      `ความชื้นดิน GISTDA: ${selectedDistrict.gistdaSoilMoisturePct}% | SPI-30d: ${selectedDistrict.spi30d} (${selectedDistrict.droughtRiskLevel})`,
      `ประเมินสิทธิ์ กษ.01 สูงสุด: ฿${estimatedKs01Baht.toLocaleString("th-TH")}`,
      `หมายเหตุ: ${officerNotes}`,
    ].join("\n");
  }, [
    reportType,
    payloadFormat,
    verificationCode,
    plotCode,
    selectedDistrict,
    farmerName,
    cropName,
    areaRai,
    coopMemberId,
    subdistrictTh,
    lat,
    lon,
    estimatedKs01Baht,
    officerNotes,
  ]);

  // Generate Scannable QR Code Data URL whenever qrPayloadString changes
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(qrPayloadString, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#041E1C",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (active) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        // Fallback ignored
      });
    return () => {
      active = false;
    };
  }, [qrPayloadString]);

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(qrPayloadString);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2500);
    } catch {
      setCopiedPayload(false);
    }
  };

  // Generate & Download High-Resolution Official Cooperative QR Plot Card PNG
  const handleDownloadOfficialQrPassCard = async () => {
    if (!qrDataUrl) return;
    setIsDownloadingCard(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 920;
      canvas.height = 540;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background Dark Obsidian Card
      ctx.fillStyle = "#080C16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer Teal Border
      ctx.strokeStyle = "#14B8A6";
      ctx.lineWidth = 4;
      ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

      // Header Banner
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(16, 16, canvas.width - 32, 86);

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(
        "KORAT SMARTAGRI · บัตรประจำแปลงเกษตรและรายงานผลผลิตดิจิทัล",
        40,
        54
      );

      ctx.fillStyle = "#FBBF24";
      ctx.font = "bold 16px monospace";
      ctx.fillText(
        `${REPORT_TYPE_META[reportType].labelTh}  |  REF: ${verificationCode}`,
        40,
        84
      );

      // Left Details Column
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(`เกษตรกร: ${farmerName}`, 40, 145);

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 18px monospace";
      ctx.fillText(
        `รหัสแปลง: ${plotCode}   |   รหัสสมาชิกสหกรณ์: ${coopMemberId}`,
        40,
        180
      );

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "17px sans-serif";
      ctx.fillText(
        `พื้นที่ตั้ง: ${subdistrictTh} ${selectedDistrict.nameTh} จ.นครราชสีมา`,
        40,
        220
      );
      ctx.fillText(
        `พิกัด GPS: ${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`,
        40,
        252
      );
      ctx.fillText(
        `พืชเศรษฐกิจที่ปลูก: ${cropName} (พื้นที่ ${areaRai} ไร่)`,
        40,
        284
      );
      ctx.fillText(
        `ชุดดินประจำอำเภอ: ${selectedDistrict.soilSeriesName}`,
        40,
        316
      );

      // Telemetry Box
      ctx.fillStyle = "#111A2E";
      ctx.fillRect(40, 342, 510, 110);
      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 342, 510, 110);

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 16px monospace";
      ctx.fillText(
        `ความชื้นดิน GISTDA: ${selectedDistrict.gistdaSoilMoisturePct}%   |   SPI-30d: ${selectedDistrict.spi30d} (${selectedDistrict.droughtRiskLevel})`,
        58,
        376
      );
      ctx.fillStyle = "#FBBF24";
      ctx.fillText(
        `โอกาสเกิดฝนวันนี้: ${selectedDistrict.rainProbToday}%   |   วงเงินประเมิน กษ.01: ฿${estimatedKs01Baht.toLocaleString("th-TH")}`,
        58,
        408
      );
      ctx.fillStyle = "#94A3B8";
      ctx.font = "14px sans-serif";
      ctx.fillText(`หมายเหตุ: ${officerNotes.slice(0, 62)}`, 58, 436);

      // Footer Attribution
      ctx.fillStyle = "#94A3B8";
      ctx.font = "13px sans-serif";
      ctx.fillText(
        "สแกน QR Code ด้านขวาด้วยสมาร์ทโฟนหรือเครื่องสแกนสหกรณ์การเกษตรจังหวัดนครราชสีมา",
        40,
        495
      );

      // Draw QR Image on Right Side
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => reject();
        qrImg.src = qrDataUrl;
      });

      // White Frame for QR
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(590, 125, 280, 280);
      ctx.drawImage(qrImg, 600, 135, 260, 260);

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 15px monospace";
      ctx.fillText(`SCAN TO VERIFY: ${plotCode}`, 620, 435);
      ctx.fillStyle = "#FBBF24";
      ctx.font = "13px sans-serif";
      ctx.fillText(REPORT_TYPE_META[reportType].recipientOfficerTh, 595, 460);

      const cardUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = cardUrl;
      link.download = `Korat_SmartAgri_QR_Pass_${plotCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloadingCard(false);
    }
  };

  return (
    <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0B1324] to-[#080C16] px-6 py-5 border-b border-[#1E293B]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#2DD4BF]">
              <QrCode className="w-4 h-4 text-[#FBBF24]" />
              <span>FARM PLOT &amp; CROP REPORT QR GENERATOR · ระบบสร้าง QR Code ประจำแปลงเกษตร</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FBBF24]">
                รหัสยืนยัน: {verificationCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              สร้าง QR Code ข้อมูลแปลงเกษตรและใบรายงานผลผลิตดิจิทัลสำหรับสหกรณ์การเกษตรและเจ้าหน้าที่ กษ.01
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
              ช่วยให้เกษตรกรสร้างบัตร QR Code ประจำแปลงเพื่อยื่นให้เจ้าหน้าที่สหกรณ์การเกษตร ลานรับซื้อ หรือคณะกรรมการตรวจสอบภัยพิบัติสแกนอ่านข้อมูลพิกัดแปลง ความชื้นดิน GISTDA ดัชนี SPI และปริมาณผลผลิตได้ทันทีด้วยสมาร์ทโฟน
            </p>
          </div>

          {/* 3 Report Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#080C16] p-1.5 rounded-xl border border-[#1E293B] self-start">
            {(
              [
                { id: "coop_delivery", label: "บัตรส่งผลผลิตสหกรณ์" },
                { id: "ks01_drought", label: "รายงานภัยแล้ง กษ.01" },
                { id: "gi_traceability", label: "ใบรับรองผลไม้ GI" },
              ] as { id: QrReportType; label: string }[]
            ).map((tab) => {
              const active = reportType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReportType(tab.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[#14B8A6] text-[#041E1C] shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-[#111A2E]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Plot Selection & Report Customization Form */}
          <div className="lg:col-span-7 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-[#FBBF24]">
                  1. เลือกหมุดแปลงเกษตรในระบบ หรือปรับแต่งข้อมูลก่อนสร้าง QR Code
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {REPORT_TYPE_META[reportType].descriptionTh}
                </p>
              </div>
            </div>

            {/* Plot Quick Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  ดึงข้อมูลจากหมุดแปลงที่ปักไว้ ({plots.length} แปลง)
                </label>
                <select
                  value={selectedPlotId}
                  onChange={(e) => handleSelectPlot(e.target.value)}
                  aria-label="เลือกหมุดแปลงเกษตรเพื่อสร้าง QR Code"
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plotCode} · {p.farmerName} ({p.districtNameTh} · {p.areaRai} ไร่)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  รูปแบบข้อมูลเมื่อเจ้าหน้าที่สแกน QR Code
                </label>
                <select
                  value={payloadFormat}
                  onChange={(e) =>
                    setPayloadFormat(e.target.value as QrPayloadFormat)
                  }
                  aria-label="เลือกรูปแบบข้อมูลใน QR Code"
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2DD4BF]"
                >
                  <option value="readable_text">
                    ข้อความรายงานมาตรฐานสหกรณ์ (สแกนอ่านได้ทันทีไม่ต้องต่อเน็ต)
                  </option>
                  <option value="deeplink_url">
                    ลิงก์เปิดหน้าเว็บรายงานแปลงดิจิทัล (Shareable Deep-Link URL)
                  </option>
                  <option value="coop_json">
                    ข้อมูล JSON มาตรฐานสหกรณ์การเกษตร / Digital DOAE
                  </option>
                </select>
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  รหัสทะเบียนแปลงเกษตร
                </label>
                <input
                  type="text"
                  value={plotCode}
                  onChange={(e) => setPlotCode(e.target.value)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-[#FBBF24] font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ชื่อ-นามสกุล เกษตรกร
                </label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  รหัสสมาชิกสหกรณ์การเกษตร
                </label>
                <input
                  type="text"
                  value={coopMemberId}
                  onChange={(e) => setCoopMemberId(e.target.value)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-[#2DD4BF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">
                  ชนิดพืชและพันธุ์ที่เพาะปลูกในแปลง
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ขนาดพื้นที่แปลง (ไร่)
                </label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={areaRai}
                  onChange={(e) =>
                    setAreaRai(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ตำบล / พื้นที่ตั้งแปลง
                </label>
                <input
                  type="text"
                  value={subdistrictTh}
                  onChange={(e) => setSubdistrictTh(e.target.value)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ละติจูด (Latitude °N)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value) || 14.97)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ลองจิจูด (Longitude °E)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lon}
                  onChange={(e) => setLon(Number(e.target.value) || 102.09)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                บันทึกเพิ่มเติมสำหรับเจ้าหน้าที่สหกรณ์ / เกษตรอำเภอ
              </label>
              <input
                type="text"
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            {/* Live Encoded Payload Inspector */}
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#2DD4BF]">
                  ข้อมูลที่ถูกเข้ารหัสอยู่ใน QR Code ขณะนี้ (Real-Time Encoded Payload):
                </span>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#FBBF24] hover:underline cursor-pointer"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกข้อความรายงาน</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-[#080C16] border border-[#1E293B] rounded-lg p-3 max-h-[150px] overflow-y-auto">
                {qrPayloadString}
              </pre>
            </div>
          </div>

          {/* Right 5 Cols: Live Scannable QR Code Pass Card & Officer Verification Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-[#10192D] via-[#0B1222] to-[#080C16] border-2 border-[#14B8A6]/65 rounded-2xl p-5 space-y-4 shadow-[0_0_28px_rgba(20,184,166,0.14)]">
              <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                <div>
                  <div className="text-[11px] font-mono font-bold text-[#2DD4BF]">
                    {REPORT_TYPE_META[reportType].badgeTh} · {verificationCode}
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {REPORT_TYPE_META[reportType].labelTh}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#14B8A6]/20 border border-[#14B8A6]/50 text-[#2DD4BF] text-xs font-mono font-bold">
                  พร้อมสแกน
                </span>
              </div>

              {/* Scannable QR Code Canvas Display */}
              <div className="flex flex-col items-center justify-center bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-3">
                {qrDataUrl ? (
                  <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-[#2DD4BF]">
                    <img
                      src={qrDataUrl}
                      alt={`QR Code ข้อมูลแปลงเกษตร ${plotCode} ของ ${farmerName}`}
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-52 h-52 rounded-2xl bg-[#0B101D] flex items-center justify-center text-xs text-slate-400">
                    กำลังสร้าง QR Code...
                  </div>
                )}

                <div className="text-center space-y-0.5">
                  <div className="text-sm font-bold text-white">
                    {farmerName} · <span className="font-mono text-[#FBBF24]">{plotCode}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {subdistrictTh} {selectedDistrict.nameTh} · พื้นที่ {areaRai} ไร่
                  </div>
                  <div className="text-[11px] font-mono text-[#2DD4BF]">
                    สำหรับ: {REPORT_TYPE_META[reportType].recipientOfficerTh}
                  </div>
                </div>
              </div>

              {/* Embedded Telemetry Summary Badges */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 font-sans">ความชื้นดิน</div>
                  <div className="text-sm font-bold text-[#2DD4BF]">
                    {selectedDistrict.gistdaSoilMoisturePct}%
                  </div>
                </div>
                <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 font-sans">ดัชนีแล้ง SPI</div>
                  <div className="text-sm font-bold text-[#FBBF24]">
                    {selectedDistrict.spi30d}
                  </div>
                </div>
                <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-slate-400 font-sans">ประเมิน กษ.01</div>
                  <div className="text-sm font-bold text-emerald-400">
                    ฿{estimatedKs01Baht.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Download Official Card PNG + Officer Scan Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadOfficialQrPassCard}
                  disabled={isDownloadingCard}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>
                    {isDownloadingCard
                      ? "กำลังสร้างบัตร..."
                      : "ดาวน์โหลดบัตร QR (PNG)"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowOfficerPreview((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>
                    {showOfficerPreview
                      ? "ซ่อนมุมมองเจ้าหน้าที่"
                      : "จำลองมุมมองเมื่อสหกรณ์สแกน"}
                  </span>
                </button>
              </div>
            </div>

            {/* Cooperative Officer Scan Verification Simulation Panel */}
            {showOfficerPreview && (
              <div className="bg-[#080C16] border border-[#F59E0B]/60 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#FBBF24] font-mono font-bold">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#2DD4BF]" />
                    <span>หน้าจอตรวจสอบของเจ้าหน้าที่สหกรณ์ (Officer Scan View)</span>
                  </span>
                  <span className="text-emerald-400">✓ ยืนยันพิกัดแปลงสำเร็จ</span>
                </div>
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1.5 text-slate-200">
                  <div>
                    <strong className="text-white">ผู้ยื่นรายงาน:</strong> {farmerName} (รหัสสมาชิก{" "}
                    <span className="font-mono text-[#2DD4BF]">{coopMemberId}</span>)
                  </div>
                  <div>
                    <strong className="text-white">แปลงเกษตร:</strong> {plotCode} · {cropName} ({areaRai} ไร่)
                  </div>
                  <div>
                    <strong className="text-white">ชุดดิน &amp; ความชื้น:</strong>{" "}
                    {selectedDistrict.soilSeriesName} · ความชื้นดิน{" "}
                    {selectedDistrict.gistdaSoilMoisturePct}% · SPI {selectedDistrict.spi30d}
                  </div>
                  <div className="text-emerald-400 font-semibold pt-1 border-t border-[#1E293B]">
                    สถานะอนุมัติสหกรณ์: อนุมัติโควตารับซื้อผลผลิตและส่วนลดปัจจัยการผลิตเรียบร้อยแล้ว
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
