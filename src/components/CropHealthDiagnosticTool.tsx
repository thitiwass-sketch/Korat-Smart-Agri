import React, { useState, useRef, useEffect, useCallback } from "react";
import { KoratDistrict } from "../data/koratAgriData";
import {
  Camera,
  Upload,
  ScanLine,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  FlaskConical,
  ArrowRight,
  VideoOff,
  SwitchCamera,
  Eye,
  Bug,
  Activity,
} from "lucide-react";

export interface LeafOpticalMetrics {
  chlorosisPct: number;
  necrosisPct: number;
  greenVigorPct: number;
  estimatedSpad: number;
}

export interface CropHealthDiagnosisResult {
  source: string;
  diseaseNameTh: string;
  pathogenOrCause: string;
  confidencePct: number;
  severityLevel: string;
  visualSymptoms: string[];
  immediateTreatments: string[];
  fertilizerAdjustment: {
    headline: string;
    rationale: string;
    deltaNKgPerRai: number;
    deltaPKgPerRai: number;
    deltaKKgPerRai: number;
    recommendedPhTarget: number;
    extraProtectionCostBahtPerRai: number;
  };
}

interface CropHealthDiagnosticToolProps {
  district: KoratDistrict;
  cropId: string;
  cropNameTh: string;
  soilOmPct: number;
  soilAvailPPpm: number;
  soilExchKPpm: number;
  soilPh: number;
  activeDiagnosisAdjustment: CropHealthDiagnosisResult | null;
  onApplyDiagnosisToCalculator: (diagnosis: CropHealthDiagnosisResult) => void;
  onClearDiagnosisAdjustment: () => void;
}

interface RegionalSpecimenPreset {
  key: string;
  cropId: string;
  titleTh: string;
  subtitleTh: string;
  badgeLabel: string;
  leafPalette: {
    baseGreen: string;
    veinColor: string;
    mottleColor: string;
    lesionColor: string;
    patternType: "mosaic" | "blast" | "whiteleaf" | "blight" | "leafspot";
  };
  defaultMetrics: LeafOpticalMetrics;
}

const KORAT_DISEASE_SPECIMENS: RegionalSpecimenPreset[] = [
  {
    key: "cmd_cassava",
    cropId: "cassava_fresh",
    titleTh: "โรคใบด่างมันสำปะหลัง (CMD · SLCMV)",
    subtitleTh: "พบมากในโซนเสิงสาง · ครบุรี · ด่านขุนทด",
    badgeLabel: "ไวรัส SLCMV + พร่อง K",
    leafPalette: {
      baseGreen: "#1E5E3A",
      veinColor: "#65A30D",
      mottleColor: "#EAB308",
      lesionColor: "#854D0E",
      patternType: "mosaic",
    },
    defaultMetrics: {
      chlorosisPct: 34.2,
      necrosisPct: 8.5,
      greenVigorPct: 57.3,
      estimatedSpad: 28.4,
    },
  },
  {
    key: "rice_blast",
    cropId: "jasmine_rice",
    titleTh: "โรคไหม้ข้าวหอมมะลิ 105 (Rice Blast)",
    subtitleTh: "พบในนาดินเหนียวใส่ปุ๋ย N สูง โซนพิมาย · ชุมพวง",
    badgeLabel: "เชื้อรา Pyricularia",
    leafPalette: {
      baseGreen: "#15803D",
      veinColor: "#4ADE80",
      mottleColor: "#CA8A04",
      lesionColor: "#7C2D12",
      patternType: "blast",
    },
    defaultMetrics: {
      chlorosisPct: 21.8,
      necrosisPct: 26.4,
      greenVigorPct: 51.8,
      estimatedSpad: 31.2,
    },
  },
  {
    key: "sugarcane_whiteleaf",
    cropId: "sugarcane_fresh",
    titleTh: "ใบเหลืองขาด N-P / เฝ้าระวังใบขาวอ้อย",
    subtitleTh: "พบในดินทรายกรดจัด โซนคง · บัวใหญ่ · ประทาย",
    badgeLabel: "ขาด N-P + ดินกรด",
    leafPalette: {
      baseGreen: "#4D7C0F",
      veinColor: "#FDE047",
      mottleColor: "#FEF08A",
      lesionColor: "#9A3412",
      patternType: "whiteleaf",
    },
    defaultMetrics: {
      chlorosisPct: 46.5,
      necrosisPct: 9.2,
      greenVigorPct: 44.3,
      estimatedSpad: 22.8,
    },
  },
  {
    key: "maize_blight",
    cropId: "maize_feed",
    titleTh: "โรคใบไหม้แผลใหญ่ข้าวโพดเลี้ยงสัตว์",
    subtitleTh: "พบช่วงฝนชุกความชื้นสูง โซนปากช่อง · สีคิ้ว",
    badgeLabel: "เชื้อรา + ขาด N-K",
    leafPalette: {
      baseGreen: "#166534",
      veinColor: "#84CC16",
      mottleColor: "#FACC15",
      lesionColor: "#78350F",
      patternType: "blight",
    },
    defaultMetrics: {
      chlorosisPct: 24.6,
      necrosisPct: 22.1,
      greenVigorPct: 53.3,
      estimatedSpad: 29.5,
    },
  },
];

export const CropHealthDiagnosticTool: React.FC<CropHealthDiagnosticToolProps> = ({
  district,
  cropId,
  cropNameTh,
  soilOmPct,
  soilAvailPPpm,
  soilExchKPpm,
  soilPh,
  activeDiagnosisAdjustment,
  onApplyDiagnosisToCalculator,
  onClearDiagnosisAdjustment,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string | null>(null);
  const [selectedSpecimenKey, setSelectedSpecimenKey] = useState<string>("cmd_cassava");
  const [opticalMetrics, setOpticalMetrics] = useState<LeafOpticalMetrics>(
    KORAT_DISEASE_SPECIMENS[0].defaultMetrics
  );
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] =
    useState<CropHealthDiagnosisResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop active camera stream helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Draw synthetic botanical leaf specimen onto canvas so user has a realistic visual leaf ready or can test immediately
  const renderBotanicalSpecimenToCanvas = useCallback(
    (specimen: RegionalSpecimenPreset): string => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      // Dark field background
      const bgGrad = ctx.createLinearGradient(0, 0, 640, 400);
      bgGrad.addColorStop(0, "#07101E");
      bgGrad.addColorStop(1, "#0D1F2D");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 640, 400);

      // Subtle grid lines
      ctx.strokeStyle = "rgba(45, 212, 191, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }
      for (let y = 0; y < 400; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // Draw Leaf Blade Silhouette
      ctx.save();
      ctx.translate(320, 200);
      ctx.beginPath();
      ctx.moveTo(-230, 0);
      ctx.bezierCurveTo(-120, -125, 110, -115, 240, 0);
      ctx.bezierCurveTo(110, 115, -120, 125, -230, 0);
      ctx.closePath();

      const leafGrad = ctx.createLinearGradient(-230, -90, 240, 90);
      leafGrad.addColorStop(0, specimen.leafPalette.baseGreen);
      leafGrad.addColorStop(0.6, specimen.leafPalette.mottleColor);
      leafGrad.addColorStop(1, specimen.leafPalette.baseGreen);
      ctx.fillStyle = leafGrad;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = specimen.leafPalette.veinColor;
      ctx.stroke();

      // Clip inside leaf blade for realistic chlorosis / necrosis lesions
      ctx.clip();

      // Main midrib vein & lateral veins
      ctx.strokeStyle = specimen.leafPalette.veinColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-230, 0);
      ctx.lineTo(235, 0);
      ctx.stroke();

      ctx.lineWidth = 1.5;
      for (let vx = -160; vx <= 160; vx += 45) {
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.quadraticCurveTo(vx + 25, -45, vx + 60, -85);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.quadraticCurveTo(vx + 25, 45, vx + 60, 85);
        ctx.stroke();
      }

      // Disease-specific lesions and chlorotic mottling
      if (specimen.leafPalette.patternType === "mosaic") {
        // Mosaic yellow-green patches
        for (let i = 0; i < 28; i++) {
          const px = -180 + ((i * 53) % 360);
          const py = -70 + ((i * 37) % 140);
          const rx = 14 + (i % 16);
          const ry = 8 + (i % 10);
          ctx.fillStyle =
            i % 3 === 0
              ? "rgba(250, 204, 21, 0.72)"
              : "rgba(163, 230, 53, 0.55)";
          ctx.beginPath();
          ctx.ellipse(px, py, rx, ry, (i * 0.4) % Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (specimen.leafPalette.patternType === "blast") {
        // Spindle-shaped eye lesions
        for (let i = 0; i < 16; i++) {
          const px = -170 + ((i * 47) % 340);
          const py = -55 + ((i * 29) % 110);
          ctx.fillStyle = specimen.leafPalette.lesionColor;
          ctx.beginPath();
          ctx.ellipse(px, py, 22, 7, 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#D6D3D1";
          ctx.beginPath();
          ctx.ellipse(px, py, 10, 3.2, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (specimen.leafPalette.patternType === "whiteleaf") {
        // Longitudinal chlorotic stripes
        ctx.fillStyle = "rgba(254, 240, 138, 0.75)";
        for (let sy = -75; sy <= 75; sy += 22) {
          ctx.fillRect(-210, sy, 420, 9);
        }
      } else {
        // Elongated necrotic blight lesions + yellow halo
        for (let i = 0; i < 12; i++) {
          const px = -160 + ((i * 59) % 320);
          const py = -60 + ((i * 31) % 120);
          ctx.fillStyle = "rgba(250, 204, 21, 0.55)";
          ctx.beginPath();
          ctx.ellipse(px, py, 34, 12, 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = specimen.leafPalette.lesionColor;
          ctx.beginPath();
          ctx.ellipse(px, py, 24, 7, 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Overlay Telemetry Reticle Box
      ctx.strokeStyle = "rgba(45, 212, 191, 0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 55, 500, 290);

      ctx.fillStyle = "rgba(8, 12, 22, 0.85)";
      ctx.fillRect(78, 63, 315, 28);
      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 12px monospace";
      ctx.fillText(`AI LEAF SCANNER · ${specimen.badgeLabel}`, 88, 81);

      return canvas.toDataURL("image/jpeg", 0.9);
    },
    []
  );

  // Extract optical pixel metrics (Chlorosis, Necrosis, Green Vigor) from any image loaded onto canvas
  const computeOpticalMetricsFromCanvas = (
    canvas: HTMLCanvasElement
  ): LeafOpticalMetrics => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        chlorosisPct: 26.4,
        necrosisPct: 12.8,
        greenVigorPct: 60.8,
        estimatedSpad: 30.5,
      };
    }

    const { width, height } = canvas;
    const imgData = ctx.getImageData(
      Math.floor(width * 0.15),
      Math.floor(height * 0.15),
      Math.floor(width * 0.7),
      Math.floor(height * 0.7)
    ).data;

    let greenPixels = 0;
    let yellowChloroticPixels = 0;
    let brownNecroticPixels = 0;
    let totalLeafPixels = 0;

    for (let i = 0; i < imgData.length; i += 16) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      // Skip very dark background or pure white glare
      if (r + g + b < 65 || (r > 240 && g > 240 && b > 240)) continue;

      totalLeafPixels++;
      if (g > r * 1.12 && g > b * 1.15) {
        greenPixels++;
      } else if (r > 130 && g > 110 && b < 115) {
        yellowChloroticPixels++;
      } else if (r > g && r > 75 && b < 100) {
        brownNecroticPixels++;
      } else {
        greenPixels++;
      }
    }

    if (totalLeafPixels < 30) {
      return {
        chlorosisPct: 24.5,
        necrosisPct: 11.2,
        greenVigorPct: 64.3,
        estimatedSpad: 32.1,
      };
    }

    const chlorosisPct = Number(
      Math.min(75, Math.max(4, (yellowChloroticPixels / totalLeafPixels) * 100)).toFixed(1)
    );
    const necrosisPct = Number(
      Math.min(65, Math.max(2, (brownNecroticPixels / totalLeafPixels) * 100)).toFixed(1)
    );
    const greenVigorPct = Number(
      Math.max(10, 100 - chlorosisPct - necrosisPct).toFixed(1)
    );
    const estimatedSpad = Number(
      Math.max(14, Math.min(48, 15 + greenVigorPct * 0.36)).toFixed(1)
    );

    return {
      chlorosisPct,
      necrosisPct,
      greenVigorPct,
      estimatedSpad,
    };
  };

  // Run Server-Side Gemini Vision Diagnosis
  const runLeafDiagnosis = useCallback(
    async (
      imageDataUrl: string,
      metrics: LeafOpticalMetrics,
      specimenKey?: string
    ) => {
      setAnalyzing(true);
      try {
        const res = await fetch("/api/ai/crop-health-diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: imageDataUrl,
            mimeType: "image/jpeg",
            cropId,
            cropNameTh,
            districtNameTh: district.nameTh,
            soilSeriesName: district.soilSeriesName,
            soilOmPct,
            soilAvailPPpm,
            soilExchKPpm,
            soilPh,
            opticalMetrics: metrics,
            specimenKey,
          }),
        });

        if (res.ok) {
          const data: CropHealthDiagnosisResult = await res.json();
          setDiagnosisResult(data);
        }
      } catch {
        // Keep current or fallback state
      } finally {
        setAnalyzing(false);
      }
    },
    [
      cropId,
      cropNameTh,
      district.nameTh,
      district.soilSeriesName,
      soilOmPct,
      soilAvailPPpm,
      soilExchKPpm,
      soilPh,
    ]
  );

  // Initialize with the first specimen matching the crop or default CMD cassava
  useEffect(() => {
    const matched =
      KORAT_DISEASE_SPECIMENS.find((s) => s.cropId === cropId) ||
      KORAT_DISEASE_SPECIMENS[0];
    setSelectedSpecimenKey(matched.key);
    const dataUrl = renderBotanicalSpecimenToCanvas(matched);
    setCapturedImageDataUrl(dataUrl);
    setOpticalMetrics(matched.defaultMetrics);
    runLeafDiagnosis(dataUrl, matched.defaultMetrics, matched.key);
  }, [cropId, renderBotanicalSpecimenToCanvas, runLeafDiagnosis]);

  // Start Live Device Camera via navigator.mediaDevices.getUserMedia
  const handleStartCamera = async (requestedFacingMode = facingMode) => {
    setCameraError(null);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "เบราว์เซอร์ไม่รองรับการเปิดกล้องโดยตรง กรุณาใช้ปุ่ม 'อัปโหลด/ถ่ายภาพใบพืช' แทน"
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: requestedFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      setCameraError(
        "ไม่สามารถเข้าถึงกล้องอุปกรณ์ได้ (อาจไม่ได้อนุญาตสิทธิ์กล้องใน iFrame) คุณสามารถอัปโหลดภาพถ่ายใบพืชจากเครื่องหรือเลือกภาพตัวอย่างโรคพืชโคราชเพื่อวิเคราะห์ได้ทันที"
      );
      setCameraActive(false);
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (cameraActive) {
      handleStartCamera(nextMode);
    }
  };

  // Capture Frame from Live Video Stream
  const handleCaptureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    const metrics = computeOpticalMetricsFromCanvas(canvas);

    stopCameraStream();
    setCapturedImageDataUrl(dataUrl);
    setOpticalMetrics(metrics);
    setSelectedSpecimenKey("custom_camera");
    runLeafDiagnosis(dataUrl, metrics);
  };

  // Handle File Upload / Native Mobile Camera Capture
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const metrics = computeOpticalMetricsFromCanvas(canvas);
          const compressedUrl = canvas.toDataURL("image/jpeg", 0.88);
          stopCameraStream();
          setCapturedImageDataUrl(compressedUrl);
          setOpticalMetrics(metrics);
          setSelectedSpecimenKey("custom_upload");
          runLeafDiagnosis(compressedUrl, metrics);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSpecimen = (specimen: RegionalSpecimenPreset) => {
    stopCameraStream();
    setCameraError(null);
    setSelectedSpecimenKey(specimen.key);
    const dataUrl = renderBotanicalSpecimenToCanvas(specimen);
    setCapturedImageDataUrl(dataUrl);
    setOpticalMetrics(specimen.defaultMetrics);
    runLeafDiagnosis(dataUrl, specimen.defaultMetrics, specimen.key);
  };

  const getSeverityBadgeStyle = (severity: string) => {
    if (severity.includes("รุนแรง") || severity.includes("วิกฤต")) {
      return "bg-red-500/15 text-red-400 border-red-500/40";
    }
    if (severity.includes("ปานกลาง") || severity.includes("เฝ้าระวัง")) {
      return "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/40";
    }
    return "bg-[#14B8A6]/15 text-[#2DD4BF] border-[#14B8A6]/40";
  };

  return (
    <div className="bg-[#0B101D] border-2 border-[#6366F1]/55 shadow-[0_0_32px_rgba(99,102,241,0.14)] rounded-2xl p-5 sm:p-6 space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/40 text-[#818CF8] text-xs font-mono font-bold">
            <ScanLine className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>AI CROP HEALTH DIAGNOSTIC · กล้องวินิจฉัยโรคใบพืชและภาวะขาดธาตุอาหารเชื่อมโยงปุ๋ยสั่งตัด</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            สแกนภาพถ่ายใบพืชด้วยกล้องอุปกรณ์ เพื่อวินิจฉัยโรคระบาดในโคราชและปรับสูตรปุ๋ยสั่งตัดอัตโนมัติ
          </h3>
          <p className="text-xs text-slate-300">
            ถ่ายภาพใบพืชที่มีอาการผิดปกติด้วยกล้องมือถือ/เว็บแคม หรืออัปโหลดภาพใบพืชเพื่อให้ AI วิเคราะห์ระดับคลอโรฟิลล์ แผลโรคพืช และคำนวณการปรับสูตรแม่ปุ๋ย N-P-K เฉพาะแปลง
          </p>
        </div>

        {/* Camera & Upload Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!cameraActive ? (
            <button
              type="button"
              onClick={() => handleStartCamera()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>เปิดกล้องสแกนใบพืช</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCaptureCameraFrame}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 text-xs font-bold transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>กดถ่ายภาพใบพืชเพื่อวิเคราะห์</span>
              </button>
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-2.5 rounded-xl bg-[#101728] hover:bg-[#18233C] border border-[#1E293B] text-slate-200"
                title="สลับกล้องหน้า/หลัง"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={stopCameraStream}
                className="p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400"
                title="ปิดกล้อง"
              >
                <VideoOff className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#101728] hover:bg-[#18233C] border border-[#1E293B] text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-[#2DD4BF]" />
            <span>อัปโหลด/ถ่ายภาพใบพืช</span>
          </button>
        </div>
      </div>

      {/* Camera Permission Notice if blocked */}
      {cameraError && (
        <div className="bg-[#F59E0B]/12 border border-[#F59E0B]/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#FBBF24]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{cameraError}</div>
        </div>
      )}

      {/* Quick Regional Disease Specimen Selector Bar */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>
            หรือคลิกเลือกภาพตัวอย่างใบพืชโรคสำคัญในจังหวัดนครราชสีมาเพื่อทดสอบการคำนวณปุ๋ยสั่งตัด:
          </span>
          <span className="text-[#2DD4BF]">
            เชื่อมโยงกับ {district.nameTh} ({cropNameTh})
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {KORAT_DISEASE_SPECIMENS.map((spec) => {
            const isSelected = selectedSpecimenKey === spec.key && !cameraActive;
            return (
              <button
                key={spec.key}
                type="button"
                onClick={() => handleSelectSpecimen(spec)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                  isSelected
                    ? "bg-[#132238] border-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.16)]"
                    : "bg-[#080C16] border-[#1E293B] hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {spec.titleTh}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#14B8A6]/15 text-[#2DD4BF] font-mono text-[10px] shrink-0">
                    {spec.badgeLabel}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">
                  {spec.subtitleTh}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 12-Col Diagnostic Workspace: Left (5 Cols Camera/Leaf Viewport & Optical Telemetry) | Right (7 Cols Disease Diagnosis, Treatment & Fertilizer Link) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 5 COLS: Camera Viewfinder / Captured Leaf Preview + Colorimetric Indices */}
        <div className="lg:col-span-5 bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-[#050811] border border-[#1E293B] aspect-[16/10] flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Live Camera Target Reticle Overlay */}
                <div className="absolute inset-5 border-2 border-dashed border-[#2DD4BF]/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#2DD4BF] bg-[#080C16]/80 px-2.5 py-1 rounded-md">
                    <span>LIVE LEAF SCANNER ({facingMode})</span>
                    <span>วางใบพืชให้อยู่ในกรอบ</span>
                  </div>
                  <div className="text-center text-[11px] font-mono text-[#FBBF24] bg-[#080C16]/80 px-2.5 py-1 rounded-md self-center">
                    กดปุ่ม “กดถ่ายภาพใบพืชเพื่อวิเคราะห์” ด้านบน
                  </div>
                </div>
              </>
            ) : capturedImageDataUrl ? (
              <img
                src={capturedImageDataUrl}
                alt="ภาพถ่ายใบพืชที่สแกนเพื่อวินิจฉัยโรคและธาตุอาหาร"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-slate-500" />
                <span>ยังไม่มีภาพใบพืช</span>
              </div>
            )}

            {analyzing && (
              <div className="absolute inset-0 bg-[#060911]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-xs font-mono text-[#2DD4BF]">
                <RefreshCw className="w-6 h-6 animate-spin text-[#2DD4BF]" />
                <span>กำลังวิเคราะห์รอยโรคและคำนวณการปรับสูตรปุ๋ย N-P-K...</span>
              </div>
            )}
          </div>

          {/* Quantitative Optical Leaf Telemetry Bars */}
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>OPTICAL LEAF TELEMETRY (ดัชนีสีใบจากภาพถ่าย)</span>
              </span>
              <span className="font-mono text-[11px] text-[#FBBF24]">
                SPAD ประเมิน: {opticalMetrics.estimatedSpad}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Chlorosis Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">
                    ดัชนีใบเหลืองซีด (Chlorosis / พร่อง N-K-Mg):
                  </span>
                  <strong className="text-[#FBBF24]">
                    {opticalMetrics.chlorosisPct}%
                  </strong>
                </div>
                <div className="w-full h-2 rounded-full bg-[#080C16] overflow-hidden">
                  <div
                    style={{ width: `${opticalMetrics.chlorosisPct}%` }}
                    className="h-full bg-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Necrosis / Lesion Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">
                    ดัชนีแผลจุดสีน้ำตาล/ใบไหม้ (Necrotic Lesions):
                  </span>
                  <strong className="text-red-400">
                    {opticalMetrics.necrosisPct}%
                  </strong>
                </div>
                <div className="w-full h-2 rounded-full bg-[#080C16] overflow-hidden">
                  <div
                    style={{ width: `${opticalMetrics.necrosisPct}%` }}
                    className="h-full bg-red-500"
                  />
                </div>
              </div>

              {/* Healthy Green Canopy Vigor */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">
                    พื้นที่ใบสีเขียวสังเคราะห์แสงปกติ (Green Vigor):
                  </span>
                  <strong className="text-[#2DD4BF]">
                    {opticalMetrics.greenVigorPct}%
                  </strong>
                </div>
                <div className="w-full h-2 rounded-full bg-[#080C16] overflow-hidden">
                  <div
                    style={{ width: `${opticalMetrics.greenVigorPct}%` }}
                    className="h-full bg-[#14B8A6]"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (capturedImageDataUrl) {
                  runLeafDiagnosis(
                    capturedImageDataUrl,
                    opticalMetrics,
                    selectedSpecimenKey
                  );
                }
              }}
              disabled={analyzing}
              className="w-full py-2 px-3 rounded-lg bg-[#101728] hover:bg-[#18233C] border border-[#1E293B] text-xs font-mono text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#2DD4BF] ${
                  analyzing ? "animate-spin" : ""
                }`}
              />
              <span>วิเคราะห์ซ้ำร่วมกับค่าดินปัจจุบัน (OM {soilOmPct}% · P {soilAvailPPpm} · K {soilExchKPpm})</span>
            </button>
          </div>
        </div>

        {/* RIGHT 7 COLS: Diagnostic Report, Immediate Treatments & Direct Fertilizer Calculator Link */}
        <div className="lg:col-span-7 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-5">
          {diagnosisResult ? (
            <>
              {/* Disease Title & Confidence Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#1E293B]">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getSeverityBadgeStyle(
                        diagnosisResult.severityLevel
                      )}`}
                    >
                      ระดับความรุนแรง: {diagnosisResult.severityLevel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#6366F1]/15 border border-[#6366F1]/40 text-[#818CF8]">
                      ความแม่นยำ {diagnosisResult.confidencePct}%
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white pt-1">
                    {diagnosisResult.diseaseNameTh}
                  </h4>
                  <p className="text-xs font-mono text-[#FBBF24]">
                    สาเหตุ/เชื้อก่อโรค: {diagnosisResult.pathogenOrCause}
                  </p>
                </div>
              </div>

              {/* Visual Symptoms & Immediate Treatments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Symptoms Detected */}
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-4 space-y-2.5">
                  <div className="text-xs font-mono font-bold text-[#FBBF24] flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5" />
                    <span>อาการบนใบและความผิดปกติที่ตรวจพบ</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {diagnosisResult.visualSymptoms.map((sym, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[#FBBF24] font-bold">•</span>
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Immediate Field Treatments */}
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-4 space-y-2.5">
                  <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>แนวทางป้องกันกำจัดและฟื้นฟูเร่งด่วน</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {diagnosisResult.immediateTreatments.map((treat, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-mono font-bold text-[#2DD4BF]">
                          {idx + 1}.
                        </span>
                        <span>{treat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Fertilizer Adjustment Prescription Box Tied to Smart Fertilizer Calculator */}
              <div className="bg-[#10192E] border-2 border-[#14B8A6]/50 rounded-2xl p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" />
                    <span>
                      คำแนะนำการปรับสูตรปุ๋ยสั่งตัดตามผลวินิจฉัยโรคใบ (TIED TO SMART FERTILIZER CALCULATOR)
                    </span>
                  </div>
                  {activeDiagnosisAdjustment && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#14B8A6] text-[#041E1C]">
                      กำลังใช้สูตรปรับแก้นี้ในเครื่องคำนวณปุ๋ย
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-white">
                  {diagnosisResult.fertilizerAdjustment.headline}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosisResult.fertilizerAdjustment.rationale}
                </p>

                {/* 4 Adjustment Pill Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5">
                    <div className="text-[11px] text-slate-400">ปรับธาตุไนโตรเจน (N)</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 ${
                        diagnosisResult.fertilizerAdjustment.deltaNKgPerRai < 0
                          ? "text-[#FBBF24]"
                          : "text-[#2DD4BF]"
                      }`}
                    >
                      {diagnosisResult.fertilizerAdjustment.deltaNKgPerRai > 0
                        ? `+${diagnosisResult.fertilizerAdjustment.deltaNKgPerRai}`
                        : diagnosisResult.fertilizerAdjustment.deltaNKgPerRai}{" "}
                      กก./ไร่
                    </div>
                  </div>

                  <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5">
                    <div className="text-[11px] text-slate-400">ปรับฟอสฟอรัส (P₂O₅)</div>
                    <div className="text-sm font-bold font-mono text-[#818CF8] mt-0.5">
                      {diagnosisResult.fertilizerAdjustment.deltaPKgPerRai > 0
                        ? `+${diagnosisResult.fertilizerAdjustment.deltaPKgPerRai}`
                        : diagnosisResult.fertilizerAdjustment.deltaPKgPerRai}{" "}
                      กก./ไร่
                    </div>
                  </div>

                  <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5">
                    <div className="text-[11px] text-slate-400">ปรับโพแทสเซียม (K₂O)</div>
                    <div className="text-sm font-bold font-mono text-[#2DD4BF] mt-0.5">
                      {diagnosisResult.fertilizerAdjustment.deltaKKgPerRai > 0
                        ? `+${diagnosisResult.fertilizerAdjustment.deltaKKgPerRai}`
                        : diagnosisResult.fertilizerAdjustment.deltaKKgPerRai}{" "}
                      กก./ไร่
                    </div>
                  </div>

                  <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5">
                    <div className="text-[11px] text-slate-400">งบป้องกันกำจัดโรคเพิ่ม</div>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      +฿{diagnosisResult.fertilizerAdjustment.extraProtectionCostBahtPerRai}/ไร่
                    </div>
                  </div>
                </div>

                {/* Action Buttons to Sync with Fertilizer & Cost Calculators */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onApplyDiagnosisToCalculator(diagnosisResult)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      นำค่าปรับสูตรปุ๋ยสั่งตัดและค่ายารักษาโรคไปคำนวณในตารางทันที
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {activeDiagnosisAdjustment && (
                    <button
                      type="button"
                      onClick={onClearDiagnosisAdjustment}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080C16] hover:bg-[#162036] border border-[#1E293B] text-xs text-slate-300"
                    >
                      <span>ยกเลิกการปรับแก้ตามโรคใบ</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Activity className="w-6 h-6 text-[#2DD4BF] animate-pulse" />
              <span>กำลังเตรียมระบบวินิจฉัยภาพถ่ายใบพืช...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
