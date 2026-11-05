import React, { useState, useMemo } from "react";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import {
  KORAT_IRRIGATION_CANALS,
  KORAT_WATER_SOURCE_NODES,
  KoratIrrigationCanalLine,
  KoratWaterSourceNode,
} from "../data/koratIrrigationData";
import {
  Droplets,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Users,
  Calendar,
  ArrowRight,
  Gauge,
  Waves,
  Sparkles,
} from "lucide-react";

interface IrrigationZoneManagementModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
  onJumpToGisMap?: () => void;
}

type IrrigationMethodKey =
  | "drip"
  | "mini_sprinkler"
  | "furrow"
  | "flood";

interface PumpingQueueBooking {
  id: string;
  farmerName: string;
  districtNameTh: string;
  canalCode: string;
  canalReach: "ต้นคลอง" | "กลางคลอง" | "ปลายคลอง";
  areaRai: number;
  cropLabel: string;
  methodLabel: string;
  allocatedVolumeM3: number;
  assignedSlot: string;
}

const IRRIGATION_METHODS: Record<
  IrrigationMethodKey,
  {
    labelTh: string;
    efficiencyPct: number;
    waterUseFactor: number; // relative to baseline crop water requirement
    savingBadge: string;
  }
> = {
  drip: {
    labelTh: "ระบบน้ำหยด (Drip Irrigation)",
    efficiencyPct: 90,
    waterUseFactor: 0.62,
    savingBadge: "ประหยัดน้ำสูงสุด -38%",
  },
  mini_sprinkler: {
    labelTh: "มินิสปริงเกลอร์ (Mini-Sprinkler)",
    efficiencyPct: 80,
    waterUseFactor: 0.76,
    savingBadge: "ประหยัดน้ำ -24%",
  },
  furrow: {
    labelTh: "สูบปล่อยเข้า沟ร่อง (Furrow)",
    efficiencyPct: 62,
    waterUseFactor: 1.0,
    savingBadge: "เกณฑ์ใช้น้ำมาตรฐาน",
  },
  flood: {
    labelTh: "ปล่อยน้ำท่วมแปลง (Flooding)",
    efficiencyPct: 45,
    waterUseFactor: 1.35,
    savingBadge: "ใช้น้ำสูง (+35% เสี่ยงเกินโควตา)",
  },
};

const CROP_WATER_DEMAND_M3_PER_RAI_WEEK: Record<
  string,
  { labelTh: string; baseM3PerRaiWeek: number; criticalStageTh: string }
> = {
  cassava_drip: {
    labelTh: "มันสำปะหลัง (ระยะลงหัว 3–6 เดือน)",
    baseM3PerRaiWeek: 24,
    criticalStageTh: "ระยะสะสมแป้งและขยายหัว",
  },
  sugarcane: {
    labelTh: "อ้อยโรงงาน (ระยะย่างปล้อง)",
    baseM3PerRaiWeek: 32,
    criticalStageTh: "ระยะแตกกอและย่างปล้อง",
  },
  jasmine_rice: {
    labelTh: "ข้าวหอมมะลิ 105 (ระยะตั้งท้อง–ออกรวง)",
    baseM3PerRaiWeek: 45,
    criticalStageTh: "ระยะตั้งท้อง-ออกรวง (ห้ามขาดน้ำ)",
  },
  maize: {
    labelTh: "ข้าวโพดเลี้ยงสัตว์ (ระยะออกดอก–ติดฝัก)",
    baseM3PerRaiWeek: 28,
    criticalStageTh: "ระยะออกไหมและผสมเกสร",
  },
  durian_orchard: {
    labelTh: "ทุเรียน GI / ไม้ผลโซนใต้ (ระยะขยายพู)",
    baseM3PerRaiWeek: 38,
    criticalStageTh: "ระยะติดผลอ่อน-ขยายพู",
  },
};

export const IrrigationZoneManagementModule: React.FC<
  IrrigationZoneManagementModuleProps
> = ({ selectedDistrict, onSelectDistrict, onJumpToGisMap }) => {
  // Find canal serving the selected district or default to the first matching/drought canal
  const matchedCanalForDistrict = useMemo(() => {
    return (
      KORAT_IRRIGATION_CANALS.find((c) =>
        c.districtIds.includes(selectedDistrict.id)
      ) ||
      (selectedDistrict.spi30d <= -1.2
        ? KORAT_IRRIGATION_CANALS[4]
        : KORAT_IRRIGATION_CANALS[0])
    );
  }, [selectedDistrict.id, selectedDistrict.spi30d]);

  const [selectedCanalId, setSelectedCanalId] = useState<string>(
    matchedCanalForDistrict.id
  );
  const [selectedCropKey, setSelectedCropKey] =
    useState<string>("cassava_drip");
  const [irrigationMethod, setIrrigationMethod] =
    useState<IrrigationMethodKey>("drip");
  const [canalReach, setCanalReach] = useState<
    "ต้นคลอง" | "กลางคลอง" | "ปลายคลอง"
  >("ปลายคลอง");
  const [farmAreaRai, setFarmAreaRai] = useState<number>(15);
  const [farmerNameInput, setFarmerNameInput] = useState<string>(
    "กลุ่มเกษตรกรผู้ใช้น้ำบ้านโนนสมบูรณ์"
  );

  const [bookings, setBookings] = useState<PumpingQueueBooking[]>([
    {
      id: "q-01",
      farmerName: "นายสมศักดิ์ เกษตรพัฒนา",
      districtNameTh: "อ.ด่านขุนทด",
      canalCode: "DRT-LCK-05",
      canalReach: "ปลายคลอง",
      areaRai: 18,
      cropLabel: "มันสำปะหลัง (ระยะลงหัว)",
      methodLabel: "ระบบน้ำหยด (Drip Irrigation)",
      allocatedVolumeM3: 268,
      assignedSlot: "ศุกร์–เสาร์ (06:00–10:30 น.) · โซน C ปลายคลอง",
    },
    {
      id: "q-02",
      farmerName: "นางสาวสุดารัตน์ ทุ่งสัมฤทธิ์",
      districtNameTh: "อ.พิมาย",
      canalCode: "RMC-PMY-02",
      canalReach: "กลางคลอง",
      areaRai: 25,
      cropLabel: "ข้าวหอมมะลิ 105 (ระยะตั้งท้อง)",
      methodLabel: "สูบปล่อยเข้า沟ร่อง (Furrow)",
      allocatedVolumeM3: 1125,
      assignedSlot: "จันทร์–พุธ (07:00–16:00 น.) · คลองซอย 4R",
    },
  ]);

  const activeCanal: KoratIrrigationCanalLine = useMemo(() => {
    return (
      KORAT_IRRIGATION_CANALS.find((c) => c.id === selectedCanalId) ||
      matchedCanalForDistrict
    );
  }, [selectedCanalId, matchedCanalForDistrict]);

  // Water usage & quota calculation
  const waterCoordinationPlan = useMemo(() => {
    const cropSpec =
      CROP_WATER_DEMAND_M3_PER_RAI_WEEK[selectedCropKey] ||
      CROP_WATER_DEMAND_M3_PER_RAI_WEEK.cassava_drip;
    const methodSpec = IRRIGATION_METHODS[irrigationMethod];

    // Weekly quota per rai depends on canal water level
    const weeklyQuotaPerRaiM3 =
      activeCanal.waterLevelPct >= 70
        ? 42
        : activeCanal.waterLevelPct >= 55
        ? 32
        : 22;

    const totalWeeklyQuotaM3 = weeklyQuotaPerRaiM3 * farmAreaRai;
    const requiredWeeklyVolumeM3 = Math.round(
      cropSpec.baseM3PerRaiWeek * methodSpec.waterUseFactor * farmAreaRai
    );
    const floodBaselineM3 = Math.round(
      cropSpec.baseM3PerRaiWeek *
        IRRIGATION_METHODS.flood.waterUseFactor *
        farmAreaRai
    );
    const waterSavedVsFloodM3 = Math.max(
      0,
      floodBaselineM3 - requiredWeeklyVolumeM3
    );

    const isWithinQuota = requiredWeeklyVolumeM3 <= totalWeeklyQuotaM3;
    const quotaUsagePct = Math.round(
      (requiredWeeklyVolumeM3 / Math.max(1, totalWeeklyQuotaM3)) * 100
    );

    const assignedSlot =
      canalReach === "ต้นคลอง"
        ? "จันทร์ – อังคาร (06:00 – 12:00 น.) · โซน A ต้นคลอง"
        : canalReach === "กลางคลอง"
        ? "พุธ – พฤหัสบดี (06:00 – 14:00 น.) · โซน B กลางคลอง"
        : "ศุกร์ – เสาร์ (05:30 – 15:00 น.) · โซน C ปลายคลอง (เพิ่มแรงดันสถานีสูบเสริม)";

    return {
      cropSpec,
      methodSpec,
      weeklyQuotaPerRaiM3,
      totalWeeklyQuotaM3,
      requiredWeeklyVolumeM3,
      waterSavedVsFloodM3,
      isWithinQuota,
      quotaUsagePct,
      assignedSlot,
    };
  }, [selectedCropKey, irrigationMethod, activeCanal, farmAreaRai, canalReach]);

  const handleRegisterPumpingSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: PumpingQueueBooking = {
      id: `q-${Date.now()}`,
      farmerName: farmerNameInput.trim() || "เกษตรกรผู้ใช้น้ำชลประทาน",
      districtNameTh: selectedDistrict.nameTh,
      canalCode: activeCanal.code,
      canalReach,
      areaRai: farmAreaRai,
      cropLabel: waterCoordinationPlan.cropSpec.labelTh,
      methodLabel: waterCoordinationPlan.methodSpec.labelTh,
      allocatedVolumeM3: waterCoordinationPlan.requiredWeeklyVolumeM3,
      assignedSlot: waterCoordinationPlan.assignedSlot,
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  return (
    <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg">
      {/* Top Module Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0B1324] to-[#080C16] px-6 py-5 border-b border-[#1E293B]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-sky-300">
              <Waves className="w-4 h-4 text-[#2DD4BF]" />
              <span>IRRIGATION ZONE MANAGEMENT &amp; CANAL COORDINATION</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FBBF24]">
                พื้นที่โฟกัส: {selectedDistrict.nameTh} (SPI {selectedDistrict.spi30d})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ระบบบริหารจัดการโซนชลประทาน คลองส่งน้ำ และจัดสรรรอบเวรสูบน้ำในพื้นที่เสี่ยงภัยแล้ง
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
              เชื่อมโยงชั้นข้อมูลคลองส่งน้ำสายใหญ่ ประตูระบายน้ำ สถานีสูบน้ำด้วยไฟฟ้า และบ่อบาดาลโซลาร์เซลล์ลงบนแผนที่ GIS พร้อมระบบคำนวณโควตาใช้น้ำและจัดคิวสูบน้ำหมุนเวียน (ต้นคลอง–กลางคลอง–ปลายคลอง) เพื่อป้องกันปัญหาการแย่งน้ำในช่วงฝนทิ้งช่วง
            </p>
          </div>

          {onJumpToGisMap && (
            <button
              type="button"
              onClick={onJumpToGisMap}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors self-start cursor-pointer shrink-0"
            >
              <Droplets className="w-4 h-4" />
              <span>ดูแนวคลองส่งน้ำบนแผนที่ GIS หลัก</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* SECTION 1: 5 MAJOR IRRIGATION CANAL NETWORKS & WATER SOURCE NODES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Canal Networks Selector & Flow Telemetry */}
          <div className="lg:col-span-7 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <div>
                <div className="text-xs font-mono font-bold text-sky-300">
                  KORAT IRRIGATION CANAL NETWORKS · โครงข่ายคลองส่งน้ำหลัก 5 ลุ่มน้ำ
                </div>
                <h3 className="text-base font-bold text-white">
                  สถานะการส่งน้ำ ระดับน้ำในคลอง และตารางรอบเวรเปิดประตูระบายน้ำ
                </h3>
              </div>
              <span className="text-xs font-mono text-[#2DD4BF]">
                ซิงก์กับแผนที่ GIS แล้ว
              </span>
            </div>

            <div className="space-y-3">
              {KORAT_IRRIGATION_CANALS.map((canal) => {
                const isSelected = canal.id === activeCanal.id;
                const isLowWater =
                  canal.status === "เฝ้าระวังระดับน้ำต่ำ-สูบเสริม";

                return (
                  <button
                    key={canal.id}
                    type="button"
                    onClick={() => {
                      setSelectedCanalId(canal.id);
                      if (onSelectDistrict && canal.districtIds.length > 0) {
                        onSelectDistrict(canal.districtIds[0]);
                      }
                    }}
                    className={`w-full text-left rounded-xl p-4 border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-[#111C33] border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                        : "bg-[#0B101D] border-[#1E293B] hover:border-slate-600"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: canal.colorHex }}
                        />
                        <span className="text-xs font-mono font-bold text-[#FBBF24]">
                          {canal.code}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {canal.nameTh}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold ${
                          isLowWater ? "text-amber-300" : "text-[#2DD4BF]"
                        }`}
                      >
                        {canal.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono bg-[#080C16] border border-[#1E293B] rounded-lg p-2.5">
                      <div>
                        <span className="text-slate-400">อัตราการไหล: </span>
                        <strong className="text-white">
                          {canal.currentFlowM3s}/{canal.maxFlowM3s} ลบ.ม./วิ
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">ระดับน้ำคลอง: </span>
                        <strong
                          className={
                            canal.waterLevelPct < 45
                              ? "text-amber-300"
                              : "text-sky-300"
                          }
                        >
                          {canal.waterLevelPct}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">ความยาวสายหลัก: </span>
                        <strong className="text-slate-200">
                          {canal.lengthKm} กม.
                        </strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>
                        <strong className="text-slate-200">พื้นที่รับน้ำ:</strong>{" "}
                        {canal.districtsCoveredTh}
                      </span>
                      <span className="text-[11px] font-mono text-sky-300">
                        {canal.rotationScheduleTh}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Water Source Nodes (Pumping Stations, Gates & Solar Wells) */}
          <div className="lg:col-span-5 bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div>
              <div className="text-xs font-mono font-bold text-[#FBBF24]">
                WATER SOURCE &amp; PUMPING STATIONS (6 จุดยุทธศาสตร์)
              </div>
              <h3 className="text-base font-bold text-white">
                สถานีสูบน้ำด้วยไฟฟ้า ประตูระบายน้ำ และบ่อบาดาลโซลาร์เซลล์
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {KORAT_WATER_SOURCE_NODES.map((node) => {
                const isSameDistrict = node.districtId === selectedDistrict.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectDistrict?.(node.districtId)}
                    className={`rounded-xl p-3.5 border transition-all cursor-pointer space-y-1.5 ${
                      isSameDistrict
                        ? "bg-[#141E36] border-[#2DD4BF]"
                        : "bg-[#0B101D] border-[#1E293B] hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="font-bold text-sky-300">
                        🚰 {node.code} · {node.districtNameTh}
                      </span>
                      <span className="text-[#FBBF24] font-bold">
                        โควตา {node.dailyQuotaM3PerRai} ลบ.ม./ไร่/วัน
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {node.nameTh}
                    </div>
                    <div className="text-xs text-slate-300">
                      {node.storageOrCapacityText}
                    </div>
                    <div className="text-[11px] font-mono text-[#2DD4BF] pt-1 border-t border-[#1E293B]">
                      รอบเวร: {node.rotationSlotText}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{node.userGroupNameTh}</span>
                      <span>สมาชิก {node.activeFarmersCount} ราย</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: DROUGHT WATER USAGE COORDINATOR & ROTATIONAL PUMPING QUEUE */}
        <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3.5">
            <div>
              <div className="text-xs font-mono font-bold text-[#2DD4BF]">
                WATER QUOTA CALCULATOR &amp; ROTATIONAL PUMPING SCHEDULER
              </div>
              <h3 className="text-lg font-bold text-white">
                คำนวณโควตาการใช้น้ำรายสัปดาห์และจัดสรรคิวสูบน้ำหมุนเวียน (ต้นคลอง–กลางคลอง–ปลายคลอง)
              </h3>
            </div>
            <span className="text-xs font-mono text-[#FBBF24]">
              คลองที่เลือก: {activeCanal.code} (ระดับน้ำ {activeCanal.waterLevelPct}%)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Farmer Water Coordination Form */}
            <form
              onSubmit={handleRegisterPumpingSlot}
              className="lg:col-span-5 bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  1. ชื่อเกษตรกร / กลุ่มผู้ใช้น้ำชลประทาน (WUG)
                </label>
                <input
                  type="text"
                  value={farmerNameInput}
                  onChange={(e) => setFarmerNameInput(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    2. ชนิดพืชและระยะการใช้น้ำ
                  </label>
                  <select
                    value={selectedCropKey}
                    onChange={(e) => setSelectedCropKey(e.target.value)}
                    aria-label="เลือกชนิดพืชและระยะการใช้น้ำ"
                    className="w-full bg-[#080C16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {Object.entries(CROP_WATER_DEMAND_M3_PER_RAI_WEEK).map(
                      ([key, val]) => (
                        <option key={key} value={key}>
                          {val.labelTh}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    3. ขนาดแปลง ({farmAreaRai} ไร่)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={farmAreaRai}
                    onChange={(e) =>
                      setFarmAreaRai(Math.max(1, Number(e.target.value) || 1))
                    }
                    aria-label="ขนาดแปลงเกษตร (ไร่)"
                    className="w-full bg-[#080C16] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  4. ตำแหน่งแปลงตามแนวคลองส่งน้ำ (เพื่อจัดรอบเวรไม่ให้แย่งแรงดันน้ำ)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ต้นคลอง", "กลางคลอง", "ปลายคลอง"] as const).map((reach) => (
                    <button
                      key={reach}
                      type="button"
                      onClick={() => setCanalReach(reach)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        canalReach === reach
                          ? "bg-sky-500 text-slate-950 border-sky-400"
                          : "bg-[#080C16] text-slate-300 border-[#1E293B] hover:border-slate-600"
                      }`}
                    >
                      {reach}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  5. วิธีการให้น้ำในแปลง
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    Object.keys(IRRIGATION_METHODS) as IrrigationMethodKey[]
                  ).map((mKey) => {
                    const m = IRRIGATION_METHODS[mKey];
                    const active = irrigationMethod === mKey;
                    return (
                      <button
                        key={mKey}
                        type="button"
                        onClick={() => setIrrigationMethod(mKey)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          active
                            ? "bg-[#141E36] border-[#2DD4BF] text-white font-bold"
                            : "bg-[#080C16] border-[#1E293B] text-slate-300"
                        }`}
                      >
                        <div>{m.labelTh}</div>
                        <div className="text-[10px] font-mono text-[#2DD4BF] mt-0.5">
                          ประสิทธิภาพ {m.efficiencyPct}% · {m.savingBadge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-colors cursor-pointer"
              >
                + ลงทะเบียนจองรอบเวรสูบน้ำและบันทึกโควตาน้ำเข้ากลุ่มผู้ใช้น้ำ
              </button>
            </form>

            {/* Right 7 Cols: Calculated Water Quota & Active Rotational Queue */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#0B101D] border border-sky-500/50 rounded-xl p-4">
                  <div className="text-[11px] font-mono text-sky-300">
                    ปริมาณน้ำที่ต้องใช้จริง/สัปดาห์
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {waterCoordinationPlan.requiredWeeklyVolumeM3.toLocaleString()}{" "}
                    ลบ.ม.
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    โควตาคลองจัดสรรสูงสุด:{" "}
                    {waterCoordinationPlan.totalWeeklyQuotaM3.toLocaleString()}{" "}
                    ลบ.ม.
                  </div>
                </div>

                <div className="bg-[#0B101D] border border-[#14B8A6]/50 rounded-xl p-4">
                  <div className="text-[11px] font-mono text-[#2DD4BF]">
                    ปริมาณน้ำที่ประหยัดได้
                  </div>
                  <div className="text-lg font-bold text-[#2DD4BF] font-mono mt-1">
                    +{waterCoordinationPlan.waterSavedVsFloodM3.toLocaleString()}{" "}
                    ลบ.ม./สัปดาห์
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    เทียบกับการปล่อยน้ำท่วมแปลง
                  </div>
                </div>

                <div className="bg-[#0B101D] border border-[#F59E0B]/50 rounded-xl p-4">
                  <div className="text-[11px] font-mono text-[#FBBF24]">
                    สถานะโควตาผู้ใช้น้ำ
                  </div>
                  <div
                    className={`text-sm font-bold mt-1 ${
                      waterCoordinationPlan.isWithinQuota
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {waterCoordinationPlan.isWithinQuota
                      ? `อยู่ในเกณฑ์โควตา (${waterCoordinationPlan.quotaUsagePct}%)`
                      : `เกินโควตาคลอง (${waterCoordinationPlan.quotaUsagePct}%)`}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {waterCoordinationPlan.assignedSlot}
                  </div>
                </div>
              </div>

              {/* Active Rotational Queue Table */}
              <div className="bg-[#0B101D] border border-[#1E293B] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-white">
                    ตารางคิวสูบน้ำหมุนเวียนของกลุ่มผู้ใช้น้ำชลประทาน ({bookings.length} คิวล่าสุด)
                  </span>
                  <span className="font-mono text-[#2DD4BF]">
                    ลดความขัดแย้งต้นน้ำ-ปลายน้ำ
                  </span>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white">
                          {b.farmerName} ({b.districtNameTh} · {b.areaRai} ไร่)
                        </div>
                        <div className="text-slate-300">
                          {b.cropLabel} · {b.methodLabel}
                        </div>
                        <div className="text-[11px] font-mono text-sky-300">
                          รอบเวรที่ได้รับ: {b.assignedSlot}
                        </div>
                      </div>
                      <div className="sm:text-right font-mono shrink-0">
                        <div className="text-xs font-bold text-[#FBBF24]">
                          {b.canalCode} ({b.canalReach})
                        </div>
                        <div className="text-sm font-bold text-[#2DD4BF]">
                          {b.allocatedVolumeM3.toLocaleString()} ลบ.ม./สัปดาห์
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
