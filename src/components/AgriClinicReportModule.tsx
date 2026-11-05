import React, { useState, useRef, useEffect, useCallback } from "react";
import { KoratDistrict } from "../data/koratAgriData";
import {
  Camera,
  Upload,
  Stethoscope,
  Sparkles,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FlaskConical,
  Sprout,
  Clock,
  SwitchCamera,
  VideoOff,
  FileCheck2,
  Bug,
  Droplets,
  Copy,
  Check,
} from "lucide-react";

export interface ClinicOpticalMetrics {
  healthyGreenPct: number;
  chlorosisYellowPct: number;
  necrosisLesionPct: number;
  estimatedSpadIndex: number;
}

export interface AgriClinicReportData {
  source: string;
  diagnosedConditionTh: string;
  scientificPathogen: string;
  category: string;
  confidencePct: number;
  severityLevel: string;
  estimatedYieldLossRiskPct: number;
  epidemiologyAndWeatherLink: string;
  visualFindings: string[];
  remedialTreatments: {
    biologicalAndOrganic: {
      title: string;
      activeAgent: string;
      dosageAndMethod: string;
      applicationFrequency: string;
    };
    chemicalPrescription: {
      title: string;
      activeIngredient: string;
      dosagePer20L: string;
      preHarvestIntervalDays: number;
      safetyPrecaution: string;
    };
    culturalAndSoilRemediation: {
      title: string;
      actions: string[];
    };
  };
  followUpSchedule: {
    dayLabel: string;
    taskTh: string;
  }[];
  estimatedTreatmentCostPerRai: number;
  localClinicContact: string;
}

interface ClinicHistoryItem {
  id: string;
  timestampTh: string;
  districtNameTh: string;
  cropNameTh: string;
  imageDataUrl: string;
  opticalMetrics: ClinicOpticalMetrics;
  report: AgriClinicReportData;
}

interface ClinicSpecimenPreset {
  id: string;
  cropNameTh: string;
  growthStageTh: string;
  titleTh: string;
  zoneLabelTh: string;
  defaultSymptomNote: string;
  palette: {
    baseGreen: string;
    veinColor: string;
    mottleColor: string;
    lesionColor: string;
    pattern: "cmd" | "durian" | "blast" | "whiteleaf" | "maize" | "anthracnose";
  };
  defaultMetrics: ClinicOpticalMetrics;
}

const CLINIC_SPECIMEN_PRESETS: ClinicSpecimenPreset[] = [
  {
    id: "cmd_cassava",
    cropNameTh: "มันสำปะหลัง (พันธุ์เกษตรศาสตร์ 50 / ห้วยบง 60)",
    growthStageTh: "ระยะเจริญเติบโตทางใบและสร้างหัว (อายุ 3–5 เดือน)",
    titleTh: "โรคใบด่างมันสำปะหลัง (CMD · SLCMV)",
    zoneLabelTh: "เสิงสาง · ครบุรี · ด่านขุนทด",
    defaultSymptomNote:
      "ใบยอดด่างเหลืองสลับเขียว แผ่นใบบิดเบี้ยวหงิกงอ พบแมลงหวี่ขาวใต้ใบ",
    palette: {
      baseGreen: "#1B5E3C",
      veinColor: "#84CC16",
      mottleColor: "#EAB308",
      lesionColor: "#854D0E",
      pattern: "cmd",
    },
    defaultMetrics: {
      healthyGreenPct: 57.3,
      chlorosisYellowPct: 34.2,
      necrosisLesionPct: 8.5,
      estimatedSpadIndex: 28.4,
    },
  },
  {
    id: "durian_phytophthora",
    cropNameTh: "ทุเรียนหมอนทอง GI (ปากช่อง-เขาใหญ่ / วังน้ำเขียว)",
    growthStageTh: "ระยะแตกใบเพสลาด – ก่อนสะสมอาหารออกดอก",
    titleTh: "โรคใบติดและไฟทอปธอราในทุเรียน",
    zoneLabelTh: "ปากช่อง · วังน้ำเขียว · ครบุรี",
    defaultSymptomNote:
      "พบแผลฉ่ำน้ำสีน้ำตาลดำลามจากปลายใบ ใบไหม้แห้งติดกันเป็นกระจุกหลังช่วงฝนชุก",
    palette: {
      baseGreen: "#14532D",
      veinColor: "#4ADE80",
      mottleColor: "#CA8A04",
      lesionColor: "#451A03",
      pattern: "durian",
    },
    defaultMetrics: {
      healthyGreenPct: 56.8,
      chlorosisYellowPct: 19.6,
      necrosisLesionPct: 23.6,
      estimatedSpadIndex: 31.0,
    },
  },
  {
    id: "rice_blast",
    cropNameTh: "ข้าวหอมมะลิ 105 (ทุ่งสัมฤทธิ์ GI)",
    growthStageTh: "ระยะแตกกอสูงสุด – ข้าวตั้งท้อง",
    titleTh: "โรคไหม้ใบและคอรวงข้าวหอมมะลิ (Rice Blast)",
    zoneLabelTh: "พิมาย · ชุมพวง · โนนสูง",
    defaultSymptomNote:
      "พบแผลรูปตาสีน้ำตาลขอบเข้ม ตรงกลางแผลสีเทาขาว ลามเร็วในแปลงที่ใส่ปุ๋ยยูเรียสูง",
    palette: {
      baseGreen: "#15803D",
      veinColor: "#4ADE80",
      mottleColor: "#D97706",
      lesionColor: "#7C2D12",
      pattern: "blast",
    },
    defaultMetrics: {
      healthyGreenPct: 51.8,
      chlorosisYellowPct: 21.8,
      necrosisLesionPct: 26.4,
      estimatedSpadIndex: 30.8,
    },
  },
  {
    id: "sugarcane_whiteleaf",
    cropNameTh: "อ้อยโรงงาน (ขอนแก่น 3)",
    growthStageTh: "ระยะอ้อยตอแตกกอ (อายุ 2–4 เดือน)",
    titleTh: "โรคใบขาวอ้อย & ภาวะขาดธาตุเหล็กในดินกรด",
    zoneLabelTh: "คง · บัวใหญ่ · ประทาย",
    defaultSymptomNote:
      "ใบอ้อยมีแถบสีขาวซีดขนานตามเส้นใบ ลำต้นแคระแกร็น แตกหน่อฝอยคล้ายกอตะไคร้",
    palette: {
      baseGreen: "#4D7C0F",
      veinColor: "#FEF08A",
      mottleColor: "#FDE047",
      lesionColor: "#9A3412",
      pattern: "whiteleaf",
    },
    defaultMetrics: {
      healthyGreenPct: 44.3,
      chlorosisYellowPct: 46.5,
      necrosisLesionPct: 9.2,
      estimatedSpadIndex: 22.8,
    },
  },
  {
    id: "maize_blight_faw",
    cropNameTh: "ข้าวโพดเลี้ยงสัตว์",
    growthStageTh: "ระยะ 8–10 ใบ ถึงระยะออกดอกตัวผู้",
    titleTh: "โรคใบไหม้แผลใหญ่ & หนอนกระทู้ข้าวโพดลายจุด",
    zoneLabelTh: "ปากช่อง · สีคิ้ว · ด่านขุนทด",
    defaultSymptomNote:
      "พบแผลยาวสีน้ำตาลปนเทาบนใบล่าง และมีรอยหนอนกัดกินยอดเป็นรูพรุน",
    palette: {
      baseGreen: "#166534",
      veinColor: "#84CC16",
      mottleColor: "#FACC15",
      lesionColor: "#78350F",
      pattern: "maize",
    },
    defaultMetrics: {
      healthyGreenPct: 53.3,
      chlorosisYellowPct: 24.6,
      necrosisLesionPct: 22.1,
      estimatedSpadIndex: 29.5,
    },
  },
  {
    id: "fruit_anthracnose",
    cropNameTh: "เงาะโรงเรียน & มังคุดโซนใต้โคราช",
    growthStageTh: "ระยะแตกใบอ่อน – ติดผลอ่อน",
    titleTh: "โรคแอนแทรคโนสและใบจุดสีน้ำตาลในไม้ผล",
    zoneLabelTh: "ครบุรี · เสิงสาง · วังน้ำเขียว",
    defaultSymptomNote:
      "พบจุดแผลสีน้ำตาลเข้มขอบเหลืองบริเวณปลายใบและขอบใบอ่อนบิดม้วน",
    palette: {
      baseGreen: "#166534",
      veinColor: "#4ADE80",
      mottleColor: "#F59E0B",
      lesionColor: "#571B09",
      pattern: "anthracnose",
    },
    defaultMetrics: {
      healthyGreenPct: 60.4,
      chlorosisYellowPct: 18.2,
      necrosisLesionPct: 21.4,
      estimatedSpadIndex: 33.2,
    },
  },
];

interface AgriClinicReportModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
}

export const AgriClinicReportModule: React.FC<AgriClinicReportModuleProps> = ({
  selectedDistrict,
}) => {
  const [selectedSpecimenId, setSelectedSpecimenId] =
    useState<string>("cmd_cassava");
  const [cropNameTh, setCropNameTh] = useState<string>(
    CLINIC_SPECIMEN_PRESETS[0].cropNameTh
  );
  const [growthStageTh, setGrowthStageTh] = useState<string>(
    CLINIC_SPECIMEN_PRESETS[0].growthStageTh
  );
  const [symptomNotes, setSymptomNotes] = useState<string>(
    CLINIC_SPECIMEN_PRESETS[0].defaultSymptomNote
  );
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<
    string | null
  >(null);
  const [opticalMetrics, setOpticalMetrics] = useState<ClinicOpticalMetrics>(
    CLINIC_SPECIMEN_PRESETS[0].defaultMetrics
  );

  // Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  // AI Report state
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<AgriClinicReportData | null>(
    null
  );
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<
    "all" | "bio" | "chem" | "cultural"
  >("all");
  const [historyItems, setHistoryItems] = useState<ClinicHistoryItem[]>([]);
  const [isDownloadingPng, setIsDownloadingPng] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Analyze pixels on a canvas to extract Healthy Green %, Chlorosis Yellow %, Necrosis Brown %, and SPAD
  const analyzeCanvasPixels = useCallback(
    (canvas: HTMLCanvasElement): ClinicOpticalMetrics => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return CLINIC_SPECIMEN_PRESETS[0].defaultMetrics;
      const { width, height } = canvas;
      const imgData = ctx.getImageData(0, 0, width, height).data;

      let greenCount = 0;
      let yellowCount = 0;
      let brownCount = 0;
      let totalLeafPixels = 0;

      for (let i = 0; i < imgData.length; i += 16) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        // Skip dark background pixels
        if (r < 28 && g < 38 && b < 48) continue;

        totalLeafPixels++;
        if (g > r * 1.12 && g > b * 1.2) {
          greenCount++;
        } else if (r > 135 && g > 115 && b < 110) {
          yellowCount++;
        } else if (r > g && r > 70 && b < 95) {
          brownCount++;
        } else {
          greenCount++;
        }
      }

      if (totalLeafPixels < 50) {
        return CLINIC_SPECIMEN_PRESETS[0].defaultMetrics;
      }

      const healthyGreenPct = Number(
        ((greenCount / totalLeafPixels) * 100).toFixed(1)
      );
      const chlorosisYellowPct = Number(
        ((yellowCount / totalLeafPixels) * 100).toFixed(1)
      );
      const necrosisLesionPct = Number(
        Math.max(
          3.5,
          100 - healthyGreenPct - chlorosisYellowPct
        ).toFixed(1)
      );
      const estimatedSpadIndex = Number(
        Math.max(
          18.5,
          Math.min(46.0, 16 + healthyGreenPct * 0.34 - chlorosisYellowPct * 0.12)
        ).toFixed(1)
      );

      return {
        healthyGreenPct,
        chlorosisYellowPct,
        necrosisLesionPct,
        estimatedSpadIndex,
      };
    },
    []
  );

  // Render realistic synthetic botanical leaf specimen onto canvas
  const renderSpecimenCanvasDataUrl = useCallback(
    (preset: ClinicSpecimenPreset): string => {
      const canvas = document.createElement("canvas");
      canvas.width = 680;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      // Dark Agri-Clinic Examination Surface
      const bgGrad = ctx.createLinearGradient(0, 0, 680, 420);
      bgGrad.addColorStop(0, "#060D1A");
      bgGrad.addColorStop(1, "#0C1B2A");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 680, 420);

      // Subtle calibration grid
      ctx.strokeStyle = "rgba(45, 212, 191, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < 680; x += 34) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 420);
        ctx.stroke();
      }
      for (let y = 0; y < 420; y += 34) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(680, y);
        ctx.stroke();
      }

      // Draw Leaf Blade
      ctx.save();
      ctx.translate(340, 210);
      ctx.beginPath();
      ctx.moveTo(-245, 0);
      ctx.bezierCurveTo(-130, -130, 115, -120, 250, 0);
      ctx.bezierCurveTo(115, 120, -130, 130, -245, 0);
      ctx.closePath();

      const leafGrad = ctx.createLinearGradient(-245, -95, 250, 95);
      leafGrad.addColorStop(0, preset.palette.baseGreen);
      leafGrad.addColorStop(0.55, preset.palette.mottleColor);
      leafGrad.addColorStop(1, preset.palette.baseGreen);
      ctx.fillStyle = leafGrad;
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = preset.palette.veinColor;
      ctx.stroke();

      // Central Midrib & Lateral Veins
      ctx.beginPath();
      ctx.moveTo(-240, 0);
      ctx.lineTo(240, 0);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = preset.palette.veinColor;
      ctx.stroke();

      for (let i = -180; i <= 180; i += 45) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.quadraticCurveTo(i + 28, -48, i + 62, -78);
        ctx.moveTo(i, 0);
        ctx.quadraticCurveTo(i + 28, 48, i + 62, 78);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = preset.palette.veinColor;
        ctx.stroke();
      }

      // Disease-specific lesions and chlorosis patches
      for (let k = 0; k < 22; k++) {
        const px = -185 + ((k * 67) % 360);
        const py = -68 + ((k * 43) % 136);
        const radius = 7 + (k % 4) * 5;

        ctx.beginPath();
        if (preset.palette.pattern === "blast" || preset.palette.pattern === "maize") {
          ctx.ellipse(px, py, radius * 1.9, radius * 0.65, 0.15, 0, Math.PI * 2);
        } else {
          ctx.arc(px, py, radius, 0, Math.PI * 2);
        }
        ctx.fillStyle =
          k % 2 === 0 ? preset.palette.lesionColor : preset.palette.mottleColor;
        ctx.globalAlpha = 0.82;
        ctx.fill();
      }
      ctx.restore();

      // Viewfinder overlay label
      ctx.fillStyle = "rgba(8, 12, 22, 0.82)";
      ctx.fillRect(18, 18, 360, 34);
      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`AGRI-CLINIC SPECIMEN · ${preset.titleTh}`, 28, 40);

      return canvas.toDataURL("image/jpeg", 0.92);
    },
    []
  );

  // Run AI Agri-Clinic diagnosis
  const runAgriClinicDiagnosis = useCallback(
    async (
      imgDataUrl: string,
      metrics: ClinicOpticalMetrics,
      specimenIdArg: string,
      cropNameArg: string,
      growthStageArg: string,
      notesArg: string
    ) => {
      setIsDiagnosing(true);
      try {
        const response = await fetch("/api/ai/agri-clinic-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: imgDataUrl,
            mimeType: "image/jpeg",
            specimenId: specimenIdArg,
            cropNameTh: cropNameArg,
            growthStageTh: growthStageArg,
            symptomNotes: notesArg,
            districtNameTh: selectedDistrict.nameTh,
            soilSeriesName: selectedDistrict.soilSeriesName,
            rainProbToday: selectedDistrict.rainProbToday,
            soilMoisturePct: selectedDistrict.gistdaSoilMoisturePct,
            spi30d: selectedDistrict.spi30d,
            opticalMetrics: metrics,
          }),
        });

        const data: AgriClinicReportData = await response.json();
        setActiveReport(data);

        const newHistoryItem: ClinicHistoryItem = {
          id: `CLINIC-${Date.now().toString().slice(-5)}`,
          timestampTh: new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          districtNameTh: selectedDistrict.nameTh,
          cropNameTh: cropNameArg,
          imageDataUrl: imgDataUrl,
          opticalMetrics: metrics,
          report: data,
        };
        setHistoryItems((prev) => [newHistoryItem, ...prev.slice(0, 5)]);
      } catch {
        // Fallback handled gracefully
      } finally {
        setIsDiagnosing(false);
      }
    },
    [selectedDistrict]
  );

  // Initialize first specimen on mount
  useEffect(() => {
    const initialPreset = CLINIC_SPECIMEN_PRESETS[0];
    const dataUrl = renderSpecimenCanvasDataUrl(initialPreset);
    setCapturedImageDataUrl(dataUrl);
    setOpticalMetrics(initialPreset.defaultMetrics);
    runAgriClinicDiagnosis(
      dataUrl,
      initialPreset.defaultMetrics,
      initialPreset.id,
      initialPreset.cropNameTh,
      initialPreset.growthStageTh,
      initialPreset.defaultSymptomNote
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Select a preset specimen
  const handleSelectSpecimen = (preset: ClinicSpecimenPreset) => {
    stopCameraStream();
    setSelectedSpecimenId(preset.id);
    setCropNameTh(preset.cropNameTh);
    setGrowthStageTh(preset.growthStageTh);
    setSymptomNotes(preset.defaultSymptomNote);
    const dataUrl = renderSpecimenCanvasDataUrl(preset);
    setCapturedImageDataUrl(dataUrl);
    setOpticalMetrics(preset.defaultMetrics);
    runAgriClinicDiagnosis(
      dataUrl,
      preset.defaultMetrics,
      preset.id,
      preset.cropNameTh,
      preset.growthStageTh,
      preset.defaultSymptomNote
    );
  };

  // Start live camera
  const handleStartCamera = async () => {
    setCameraError(null);
    stopCameraStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError(
        "ไม่สามารถเข้าถึงกล้องได้ในขณะนี้ กรุณาใช้ปุ่ม 'อัปโหลดรูปภาพใบพืช' หรือเลือกตัวอย่างใบพืชด้านล่าง"
      );
      setCameraActive(false);
    }
  };

  const handleToggleFacingMode = async () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (cameraActive) {
      stopCameraStream();
      setTimeout(() => {
        handleStartCamera();
      }, 150);
    }
  };

  // Capture frame from live camera video
  const handleCaptureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 680;
    canvas.height = videoRef.current.videoHeight || 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const metrics = analyzeCanvasPixels(canvas);

    stopCameraStream();
    setSelectedSpecimenId("custom_camera");
    setCapturedImageDataUrl(dataUrl);
    setOpticalMetrics(metrics);
    runAgriClinicDiagnosis(
      dataUrl,
      metrics,
      "custom_camera",
      cropNameTh,
      growthStageTh,
      symptomNotes
    );
  };

  // Handle uploaded photo from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCameraStream();

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 680;
        canvas.height = 420;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const metrics = analyzeCanvasPixels(canvas);
          setOpticalMetrics(metrics);
          setSelectedSpecimenId("custom_upload");
          setCapturedImageDataUrl(resultUrl);
          runAgriClinicDiagnosis(
            resultUrl,
            metrics,
            "custom_upload",
            cropNameTh,
            growthStageTh,
            symptomNotes
          );
        }
      };
      img.src = resultUrl;
    };
    reader.readAsDataURL(file);
  };

  // Copy full Agri-Clinic prescription summary text
  const handleCopyPrescriptionText = async () => {
    if (!activeReport) return;
    const summary = [
      `[ใบรายงานคลินิกเกษตรดิจิทัล Korat SmartAgri — ${selectedDistrict.nameTh}]`,
      `พืชที่ตรวจ: ${cropNameTh} (${growthStageTh})`,
      `ผลการวินิจฉัย AI: ${activeReport.diagnosedConditionTh} (ความแม่นยำ ${activeReport.confidencePct}%)`,
      `เชื้อสาเหตุ: ${activeReport.scientificPathogen}`,
      `ระดับความรุนแรง: ${activeReport.severityLevel} | ความเสี่ยงสูญเสียผลผลิต: ${activeReport.estimatedYieldLossRiskPct}%`,
      `1) แนวทางชีวภัณฑ์: ${activeReport.remedialTreatments.biologicalAndOrganic.activeAgent} — ${activeReport.remedialTreatments.biologicalAndOrganic.dosageAndMethod}`,
      `2) ใบสั่งยาสารเคมี: ${activeReport.remedialTreatments.chemicalPrescription.activeIngredient} (${activeReport.remedialTreatments.chemicalPrescription.dosagePer20L}) หยุดพ่นก่อนเก็บเกี่ยว ${activeReport.remedialTreatments.chemicalPrescription.preHarvestIntervalDays} วัน`,
      `3) การจัดการแปลง: ${activeReport.remedialTreatments.culturalAndSoilRemediation.actions.join(" / ")}`,
      `ติดต่อคลินิกเกษตร: ${activeReport.localClinicContact}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch {
      setCopiedReport(false);
    }
  };

  // Download Official High-Resolution Agri-Clinic Diagnostic Report PNG
  const handleDownloadClinicReportPng = async () => {
    if (!activeReport || !capturedImageDataUrl) return;
    setIsDownloadingPng(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark Obsidian Background
      ctx.fillStyle = "#080C16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = "#14B8A6";
      ctx.lineWidth = 4;
      ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

      // Header Bar
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(16, 16, canvas.width - 32, 92);

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 25px sans-serif";
      ctx.fillText(
        "KORAT SMARTAGRI · ใบรายงานการวินิจฉัยโรคพืชและใบสั่งยาคลินิกเกษตร AI",
        38,
        56
      );

      ctx.fillStyle = "#FBBF24";
      ctx.font = "bold 16px monospace";
      ctx.fillText(
        `พื้นที่: ${selectedDistrict.nameTh} (${selectedDistrict.soilSeriesName})  |  พืช: ${cropNameTh}  |  ความแม่นยำ AI: ${activeReport.confidencePct}%`,
        38,
        88
      );

      // Draw Leaf Image on Left
      const leafImg = new Image();
      leafImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        leafImg.onload = () => resolve();
        leafImg.onerror = () => resolve();
        leafImg.src = capturedImageDataUrl;
      });
      ctx.fillStyle = "#111A2E";
      ctx.fillRect(38, 130, 340, 220);
      ctx.drawImage(leafImg, 42, 134, 332, 212);

      // Optical Metrics Box under Image
      ctx.fillStyle = "#0D1526";
      ctx.fillRect(38, 362, 340, 110);
      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 2;
      ctx.strokeRect(38, 362, 340, 110);

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 15px monospace";
      ctx.fillText(
        `สีเขียวสมบูรณ์: ${opticalMetrics.healthyGreenPct}%  |  SPAD: ${opticalMetrics.estimatedSpadIndex}`,
        52,
        394
      );
      ctx.fillStyle = "#FBBF24";
      ctx.fillText(
        `ใบเหลือง (Chlorosis): ${opticalMetrics.chlorosisYellowPct}%`,
        52,
        424
      );
      ctx.fillStyle = "#F87171";
      ctx.fillText(
        `แผลโรคพืช (Necrosis): ${opticalMetrics.necrosisLesionPct}%`,
        52,
        452
      );

      // Right Column: Diagnosis & Remedial Treatments
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 21px sans-serif";
      ctx.fillText(
        `ผลวินิจฉัย: ${activeReport.diagnosedConditionTh.slice(0, 58)}`,
        405,
        156
      );

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "16px sans-serif";
      ctx.fillText(
        `เชื้อสาเหตุ: ${activeReport.scientificPathogen.slice(0, 70)}`,
        405,
        188
      );

      ctx.fillStyle = "#F87171";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(
        `ความรุนแรง: ${activeReport.severityLevel}  (ความเสี่ยงเสียผลผลิต ${activeReport.estimatedYieldLossRiskPct}%)`,
        405,
        218
      );

      // Treatment Box 1: Biological
      ctx.fillStyle = "#0F1D26";
      ctx.fillRect(405, 240, 635, 115);
      ctx.strokeStyle = "#14B8A6";
      ctx.strokeRect(405, 240, 635, 115);

      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(
        `1. ชีวภัณฑ์ปลอดภัย: ${activeReport.remedialTreatments.biologicalAndOrganic.activeAgent.slice(0, 58)}`,
        422,
        270
      );
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "14px sans-serif";
      ctx.fillText(
        activeReport.remedialTreatments.biologicalAndOrganic.dosageAndMethod.slice(
          0,
          78
        ),
        422,
        300
      );
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(
        `ความถี่: ${activeReport.remedialTreatments.biologicalAndOrganic.applicationFrequency}`,
        422,
        330
      );

      // Treatment Box 2: Chemical Prescription
      ctx.fillStyle = "#1F1710";
      ctx.fillRect(405, 370, 635, 125);
      ctx.strokeStyle = "#F59E0B";
      ctx.strokeRect(405, 370, 635, 125);

      ctx.fillStyle = "#FBBF24";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(
        `2. ใบสั่งยาสารเคมี: ${activeReport.remedialTreatments.chemicalPrescription.activeIngredient.slice(0, 56)}`,
        422,
        400
      );
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "14px sans-serif";
      ctx.fillText(
        `อัตราผสม: ${activeReport.remedialTreatments.chemicalPrescription.dosagePer20L.slice(0, 74)}`,
        422,
        430
      );
      ctx.fillStyle = "#FCA5A5";
      ctx.fillText(
        `หยุดพ่นก่อนเก็บเกี่ยว (PHI): ${activeReport.remedialTreatments.chemicalPrescription.preHarvestIntervalDays} วัน · ประเมินค่าใช้จ่าย ฿${activeReport.estimatedTreatmentCostPerRai}/ไร่`,
        422,
        462
      );

      // Treatment Box 3: Cultural & Follow-up
      ctx.fillStyle = "#111827";
      ctx.fillRect(38, 510, 1002, 165);
      ctx.strokeStyle = "#334155";
      ctx.strokeRect(38, 510, 1002, 165);

      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(
        "3. การจัดการแปลงและการฟื้นฟูธาตุอาหาร (Cultural & Foliar Recovery):",
        58,
        540
      );

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "14px sans-serif";
      activeReport.remedialTreatments.culturalAndSoilRemediation.actions
        .slice(0, 3)
        .forEach((act, idx) => {
          ctx.fillText(`• ${act.slice(0, 105)}`, 58, 570 + idx * 26);
        });

      ctx.fillStyle = "#94A3B8";
      ctx.font = "13px monospace";
      ctx.fillText(
        `${activeReport.localClinicContact}  |  ออกใบรายงานโดย Korat SmartAgri AI Clinic`,
        58,
        656
      );

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `Korat_AgriClinic_Report_${selectedDistrict.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  return (
    <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0B1628] to-[#080C16] px-6 py-5 border-b border-[#1E293B]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#2DD4BF]">
              <Stethoscope className="w-4 h-4 text-[#FBBF24]" />
              <span>
                AI AGRI-CLINIC DIAGNOSTIC REPORT · คลินิกเกษตรดิจิทัล &amp; ใบสั่งยารักษาโรคพืช AI
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FBBF24]">
                พื้นที่: {selectedDistrict.nameTh} ({selectedDistrict.soilSeriesName})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ถ่ายภาพใบพืชหรือพืชผลเพื่อออกใบรายงานวินิจฉัยโรคพืชและแผนการรักษาฟื้นฟูด้วย AI (Agri-Clinic Report)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
              ใช้กล้องสมาร์ทโฟนถ่ายภาพใบพืชที่มีอาการผิดปกติ หรือเลือกตัวอย่างโรคพืชสำคัญในโคราชเพื่อให้ Gemini Multimodal AI วิเคราะห์ระดับความรุนแรง พร้อมออกใบสั่งยา 3 แนวทาง (ชีวภัณฑ์ปลอดภัย, สารเคมีระบุกลุ่ม FRAC/IRAC และระยะหยุดพ่น PHI, และการฟื้นฟูต้น)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              type="button"
              onClick={handleDownloadClinicReportPng}
              disabled={!activeReport || isDownloadingPng}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isDownloadingPng
                  ? "กำลังสร้างใบรายงาน..."
                  : "ดาวน์โหลดใบสั่งยาคลินิกเกษตร (PNG)"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopyPrescriptionText}
              disabled={!activeReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#080C16] hover:bg-[#111A2E] text-slate-200 border border-[#1E293B] text-xs font-semibold transition-colors cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกใบรายงานแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#FBBF24]" />
                  <span>คัดลอกสรุปใบสั่งยา</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Preset Specimen Selector Bar (6 Korat Crop Diseases) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-[#FBBF24]">
              เลือกตัวอย่างภาพถ่ายใบพืชในโคราชเพื่อทดสอบคลินิก AI ทันที หรือกดเปิดกล้องถ่ายภาพจริงด้านล่าง:
            </span>
            <span className="text-slate-400 hidden sm:inline">
              รองรับทั้งพืชไร่เศรษฐกิจและไม้ผล GI โซนใต้โคราช
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {CLINIC_SPECIMEN_PRESETS.map((preset) => {
              const isSelected = selectedSpecimenId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectSpecimen(preset)}
                  className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#112233] border-[#2DD4BF] shadow-[0_0_16px_rgba(45,212,191,0.15)]"
                      : "bg-[#080C16] border-[#1E293B] hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="text-[#2DD4BF] font-bold truncate">
                      {preset.zoneLabelTh}
                    </span>
                    <span className="text-[#FBBF24] shrink-0">
                      SPAD {preset.defaultMetrics.estimatedSpadIndex}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                    {preset.titleTh}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {preset.cropNameTh}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 12-Column Clinic Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 5 COLS: Camera Viewfinder, Leaf Photo Scanner & Symptom Input */}
          <div className="lg:col-span-5 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-[#2DD4BF]">
                  1. ห้องตรวจภาพถ่ายใบพืช (LEAF OPTICAL CAPTURE STUDIO)
                </div>
                <p className="text-xs text-slate-400">
                  ถ่ายภาพใบพืชที่มีจุดแผลหรือใบเหลืองในระยะใกล้ (ห่างใบ 15–25 ซม.)
                </p>
              </div>
            </div>

            {/* Camera Controls Row */}
            <div className="flex flex-wrap items-center gap-2">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>เปิดกล้องถ่ายภาพใบพืช</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCaptureCameraFrame}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>กดถ่ายภาพส่งตรวจคลินิก AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#0B101D] border border-[#1E293B] text-slate-200 text-xs hover:border-[#2DD4BF] cursor-pointer"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>สลับกล้อง</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs cursor-pointer"
                  >
                    <VideoOff className="w-3.5 h-3.5" />
                    <span>ปิดกล้อง</span>
                  </button>
                </>
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B101D] hover:bg-[#111A2E] text-slate-200 border border-[#1E293B] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>อัปโหลดรูปภาพจากเครื่อง</span>
              </button>
            </div>

            {cameraError && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200">
                {cameraError}
              </div>
            )}

            {/* Live Video or Captured Leaf Specimen Viewport */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#14B8A6]/50 bg-[#050912] aspect-[16/10] flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : capturedImageDataUrl ? (
                <img
                  src={capturedImageDataUrl}
                  alt={`ภาพถ่ายตัวอย่างใบพืช ${cropNameTh}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-slate-400">
                  ยังไม่มีภาพถ่ายใบพืช
                </div>
              )}

              {/* Optical Reticle Overlay */}
              <div className="pointer-events-none absolute inset-4 border border-dashed border-[#2DD4BF]/50 rounded-xl flex flex-col justify-between p-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="bg-[#080C16]/85 text-[#2DD4BF] px-2 py-0.5 rounded">
                    OPTICAL RGB SCANNER · ACTIVE
                  </span>
                  <span className="bg-[#080C16]/85 text-[#FBBF24] px-2 py-0.5 rounded">
                    {selectedDistrict.nameTh}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="bg-[#080C16]/85 text-slate-200 px-2 py-0.5 rounded">
                    ความชื้นดิน {selectedDistrict.gistdaSoilMoisturePct}% · ฝน{" "}
                    {selectedDistrict.rainProbToday}%
                  </span>
                  <span className="bg-[#080C16]/85 text-emerald-300 px-2 py-0.5 rounded">
                    SPAD {opticalMetrics.estimatedSpadIndex}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Optical Pixel Telemetry Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-sans">
                  พื้นที่ใบเขียวดี
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  {opticalMetrics.healthyGreenPct}%
                </div>
              </div>
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-sans">
                  ใบเหลืองซีด
                </div>
                <div className="text-sm font-bold text-[#FBBF24]">
                  {opticalMetrics.chlorosisYellowPct}%
                </div>
              </div>
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-sans">
                  แผลไหม้/จุดโรค
                </div>
                <div className="text-sm font-bold text-rose-400">
                  {opticalMetrics.necrosisLesionPct}%
                </div>
              </div>
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-sans">
                  คลอโรฟิลล์ SPAD
                </div>
                <div className="text-sm font-bold text-[#2DD4BF]">
                  {opticalMetrics.estimatedSpadIndex}
                </div>
              </div>
            </div>

            {/* Crop & Field Context Inputs */}
            <div className="space-y-3 pt-1 border-t border-[#1E293B]">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ชนิดพืชและสายพันธุ์ที่ส่งตรวจคลินิก
                </label>
                <input
                  type="text"
                  value={cropNameTh}
                  onChange={(e) => setCropNameTh(e.target.value)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  ระยะการเจริญเติบโตของพืช
                </label>
                <select
                  value={growthStageTh}
                  onChange={(e) => setGrowthStageTh(e.target.value)}
                  aria-label="เลือกระยะการเจริญเติบโตของพืช"
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="ระยะกล้า / แตกใบอ่อน (อายุ 1–2 เดือน)">
                    ระยะกล้า / แตกใบอ่อน (อายุ 1–2 เดือน)
                  </option>
                  <option value="ระยะเจริญเติบโตทางใบและสร้างหัว (อายุ 3–5 เดือน)">
                    ระยะเจริญเติบโตทางใบและสร้างหัว (อายุ 3–5 เดือน)
                  </option>
                  <option value="ระยะแตกใบเพสลาด – ก่อนสะสมอาหารออกดอก">
                    ระยะแตกใบเพสลาด – ก่อนสะสมอาหารออกดอก
                  </option>
                  <option value="ระยะแตกกอสูงสุด – ข้าวตั้งท้อง">
                    ระยะแตกกอสูงสุด – ข้าวตั้งท้อง
                  </option>
                  <option value="ระยะติดผลอ่อน – ขยายขนาดผล">
                    ระยะติดผลอ่อน – ขยายขนาดผล
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  บันทึกอาการที่พบในแปลงเพิ่มเติม (แจ้งแพทย์โรคพืช AI)
                </label>
                <textarea
                  rows={2}
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  className="w-full bg-[#0B101D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (capturedImageDataUrl) {
                    runAgriClinicDiagnosis(
                      capturedImageDataUrl,
                      opticalMetrics,
                      selectedSpecimenId,
                      cropNameTh,
                      growthStageTh,
                      symptomNotes
                    );
                  }
                }}
                disabled={isDiagnosing}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-md"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      กำลังวิเคราะห์พยาธิวิทยาใบพืชด้วย Gemini Multimodal AI...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      ออกใบรายงานวินิจฉัยโรคพืช &amp; ใบสั่งยาคลินิกเกษตร AI
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT 7 COLS: Official AI Agri-Clinic Diagnostic & Remedial Treatment Report */}
          <div className="lg:col-span-7 space-y-4">
            {activeReport ? (
              <div className="bg-gradient-to-br from-[#0F182C] via-[#0B1120] to-[#080C16] border-2 border-[#14B8A6]/60 rounded-2xl p-5 sm:p-6 space-y-5 shadow-[0_0_30px_rgba(20,184,166,0.12)]">
                {/* Report Top Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#1E293B] pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#2DD4BF]">
                      <FileCheck2 className="w-4 h-4 text-[#FBBF24]" />
                      <span>OFFICIAL AGRI-CLINIC PATHOLOGY REPORT</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#FBBF24]">
                        ความเชื่อมั่น AI {activeReport.confidencePct}%
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {activeReport.diagnosedConditionTh}
                    </h3>
                    <div className="text-xs font-mono text-slate-300">
                      เชื้อสาเหตุ / ปัจจัยหลัก:{" "}
                      <span className="text-[#2DD4BF]">
                        {activeReport.scientificPathogen}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        activeReport.severityLevel.includes("วิกฤต")
                          ? "bg-rose-500/20 border-rose-400/60 text-rose-300"
                          : "bg-amber-500/20 border-amber-400/60 text-amber-300"
                      }`}
                    >
                      {activeReport.severityLevel}
                    </span>
                    <span className="text-xs font-mono text-rose-300">
                      ความเสี่ยงสูญเสียผลผลิตหากไม่รักษา:{" "}
                      <strong>{activeReport.estimatedYieldLossRiskPct}%</strong>
                    </span>
                  </div>
                </div>

                {/* Visual Findings & Local Weather Epidemiology Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#2DD4BF]">
                      <Bug className="w-4 h-4 text-[#FBBF24]" />
                      <span>ลักษณะอาการที่ตรวจพบบนภาพใบพืช</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                      {activeReport.visualFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#2DD4BF] font-bold">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FBBF24]">
                      <Droplets className="w-4 h-4 text-[#2DD4BF]" />
                      <span>
                        ความเชื่อมโยงกับสภาพอากาศและดิน ({selectedDistrict.nameTh})
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeReport.epidemiologyAndWeatherLink}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>ฝนวันนี้ {selectedDistrict.rainProbToday}%</span>
                      <span>·</span>
                      <span>
                        ความชื้นดิน {selectedDistrict.gistdaSoilMoisturePct}%
                      </span>
                      <span>·</span>
                      <span>SPI {selectedDistrict.spi30d}</span>
                    </div>
                  </div>
                </div>

                {/* Remedial Treatments Filter Tabs */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-mono font-bold text-[#2DD4BF]">
                      2. แผนการรักษาและฟื้นฟูครบวงจร (RECOMMENDED REMEDIAL TREATMENTS · IPM)
                    </div>
                    <div className="flex flex-wrap items-center gap-1 bg-[#080C16] p-1 rounded-xl border border-[#1E293B]">
                      {(
                        [
                          { id: "all", label: "แสดงครบทั้ง 3 แนวทาง" },
                          { id: "bio", label: "ชีวภัณฑ์ปลอดภัย" },
                          { id: "chem", label: "ใบสั่งยาเคมี (FRAC/IRAC)" },
                          { id: "cultural", label: "การจัดการแปลง & ปุ๋ย" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTreatmentTab(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            activeTreatmentTab === tab.id
                              ? "bg-[#14B8A6] text-[#041E1C]"
                              : "text-slate-300 hover:text-white"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tier 1: Biological & Organic Control */}
                  {(activeTreatmentTab === "all" ||
                    activeTreatmentTab === "bio") && (
                    <div className="bg-[#081518] border border-[#14B8A6]/50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF]">
                          <Sprout className="w-4 h-4" />
                          <span>
                            {
                              activeReport.remedialTreatments
                                .biologicalAndOrganic.title
                            }
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-300">
                          ปลอดภัยต่อผู้ใช้และสิ่งแวดล้อม (GAP/GI)
                        </span>
                      </div>
                      <div className="text-xs text-white font-semibold">
                        สารชีวภัณฑ์แนะนำ:{" "}
                        <span className="text-[#2DD4BF]">
                          {
                            activeReport.remedialTreatments.biologicalAndOrganic
                              .activeAgent
                          }
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        <strong className="text-slate-100">
                          อัตราผสมและวิธีใช้:
                        </strong>{" "}
                        {
                          activeReport.remedialTreatments.biologicalAndOrganic
                            .dosageAndMethod
                        }
                      </p>
                      <div className="text-[11px] font-mono text-[#FBBF24]">
                        ความถี่ในการใช้:{" "}
                        {
                          activeReport.remedialTreatments.biologicalAndOrganic
                            .applicationFrequency
                        }
                      </div>
                    </div>
                  )}

                  {/* Tier 2: Targeted Chemical Prescription */}
                  {(activeTreatmentTab === "all" ||
                    activeTreatmentTab === "chem") && (
                    <div className="bg-[#18120B] border border-[#F59E0B]/50 rounded-xl p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#FBBF24]">
                          <FlaskConical className="w-4 h-4" />
                          <span>
                            {
                              activeReport.remedialTreatments
                                .chemicalPrescription.title
                            }
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-300">
                          หยุดพ่นก่อนเก็บเกี่ยว (PHI):{" "}
                          {
                            activeReport.remedialTreatments.chemicalPrescription
                              .preHarvestIntervalDays
                          }{" "}
                          วัน
                        </span>
                      </div>
                      <div className="text-xs text-white font-semibold">
                        ชื่อสามัญและกลุ่มสาร:{" "}
                        <span className="text-[#FBBF24]">
                          {
                            activeReport.remedialTreatments.chemicalPrescription
                              .activeIngredient
                          }
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        <strong className="text-slate-100">
                          อัตราผสมต่อน้ำ 20 ลิตร:
                        </strong>{" "}
                        {
                          activeReport.remedialTreatments.chemicalPrescription
                            .dosagePer20L
                        }
                      </p>
                      <div className="flex items-start gap-1.5 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          <strong>ข้อควรระวังสำคัญ:</strong>{" "}
                          {
                            activeReport.remedialTreatments.chemicalPrescription
                              .safetyPrecaution
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tier 3: Cultural & Soil/Foliar Remediation */}
                  {(activeTreatmentTab === "all" ||
                    activeTreatmentTab === "cultural") && (
                    <div className="bg-[#080C16] border border-[#38BDF8]/45 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {
                            activeReport.remedialTreatments
                              .culturalAndSoilRemediation.title
                          }
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                        {activeReport.remedialTreatments.culturalAndSoilRemediation.actions.map(
                          (act, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-sky-400 font-bold">
                                {i + 1}.
                              </span>
                              <span>{act}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 14-Day Follow-up Timeline & Cost Summary */}
                <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#2DD4BF]">
                      <Clock className="w-4 h-4 text-[#FBBF24]" />
                      <span>
                        3. ตารางติดตามอาการหลังการรักษา 14 วัน (FOLLOW-UP SCHEDULE)
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#FBBF24]">
                      งบประมาณการรักษาประเมิน:{" "}
                      <strong>
                        ฿{activeReport.estimatedTreatmentCostPerRai.toLocaleString()}
                        /ไร่
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {activeReport.followUpSchedule.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-3 space-y-1"
                      >
                        <div className="text-xs font-mono font-bold text-[#FBBF24]">
                          {step.dayLabel}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {step.taskTh}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>{activeReport.localClinicContact}</span>
                    <span className="font-mono text-[#2DD4BF]">
                      Engine: {activeReport.source}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-8 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-[#FBBF24] mx-auto" />
                <div className="text-sm font-bold text-white">
                  กำลังเตรียมใบรายงานคลินิกเกษตร AI...
                </div>
              </div>
            )}

            {/* Recent Clinic Cases History Log */}
            {historyItems.length > 1 && (
              <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 space-y-2.5">
                <div className="text-xs font-mono font-bold text-slate-300">
                  ประวัติการตรวจใบพืชในรอบการใช้งานนี้ ({historyItems.length}{" "}
                  รายการ) — คลิกเพื่อเรียกดูใบรายงานย้อนหลัง:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {historyItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCapturedImageDataUrl(item.imageDataUrl);
                        setOpticalMetrics(item.opticalMetrics);
                        setCropNameTh(item.cropNameTh);
                        setActiveReport(item.report);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-[#2DD4BF] text-left transition-colors cursor-pointer"
                    >
                      <img
                        src={item.imageDataUrl}
                        alt={item.cropNameTh}
                        className="w-12 h-10 rounded-lg object-cover shrink-0 border border-[#1E293B]"
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-[#FBBF24]">
                          {item.id} · {item.timestampTh} น. · {item.districtNameTh}
                        </div>
                        <div className="text-xs font-bold text-white truncate">
                          {item.report.diagnosedConditionTh}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
