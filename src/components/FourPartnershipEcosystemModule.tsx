import React, { useState, useMemo, useEffect } from "react";
import { KoratDistrict, KORAT_DISTRICTS } from "../data/koratAgriData";
import {
  PartnerEntity,
  BenefitOfferItem,
  PartnerCategory,
  KORAT_4P_PARTNERS,
  KORAT_4P_BENEFIT_OFFERS,
  COMPLIANCE_CRITERIA_LIST,
} from "../data/koratPartnershipData";
import {
  Handshake,
  Landmark,
  Factory,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Printer,
  Download,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Sprout,
  Flame,
  Award,
  Search,
  Filter,
  X,
  Send,
  Sliders,
  DollarSign,
  QrCode,
  Calendar,
} from "lucide-react";

interface FourPartnershipEcosystemModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  onNavigateModule?: (moduleKey: string, sectionId?: string) => void;
}

interface FarmerApplicationRecord {
  id: string;
  applicantName: string;
  phone: string;
  districtId: string;
  districtNameTh: string;
  plotSizeRai: number;
  primaryCrop: string;
  benefitOfferId: string;
  benefitTitleTh: string;
  partnerNameTh: string;
  complianceScore: number;
  complianceGrade: string;
  requestedLoanAmount?: number;
  submittedAt: string;
  status: "approved_pending_contract" | "reviewing" | "verified";
}

const STORAGE_KEY_4P_APPLICATIONS = "korat_4p_applications_v1";
const STORAGE_KEY_4P_CHECKED_CRITERIA = "korat_4p_checked_criteria_v1";

export const FourPartnershipEcosystemModule: React.FC<FourPartnershipEcosystemModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onNavigateModule,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "scorecard" | "calculator" | "directory" | "certificate"
  >("overview");

  // Compliance Criteria Checkbox State
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_4P_CHECKED_CRITERIA);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Could not read checked criteria", e);
      }
    }
    return {
      fert_soil_tailored: true,
      zero_burn_cane: true,
      clean_seed_slcmv_free: true,
      spi_water_management: false,
    };
  });

  // Calculate live compliance score
  const complianceScore = useMemo(() => {
    return COMPLIANCE_CRITERIA_LIST.reduce((acc, item) => {
      return acc + (checkedCriteria[item.id] ? item.weightScore : 0);
    }, 0);
  }, [checkedCriteria]);

  const complianceGrade = useMemo(() => {
    if (complianceScore >= 85) return { grade: "A+", label: "ยอดเยี่ยมระดับพรีเมียม (Premium AAA)" };
    if (complianceScore >= 75) return { grade: "A", label: "ดีเยี่ยม (Smart Certified)" };
    if (complianceScore >= 60) return { grade: "B+", label: "ผ่านเกณฑ์มาตรฐาน (Standard Pass)" };
    return { grade: "B", label: "ต้องปรับปรุงแนวทางปฏิบัติ (Developing)" };
  }, [complianceScore]);

  // Save criteria changes
  const handleToggleCriterion = (criterionId: string) => {
    setCheckedCriteria((prev) => {
      const updated = { ...prev, [criterionId]: !prev[criterionId] };
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY_4P_CHECKED_CRITERIA, JSON.stringify(updated));
        } catch (e) {
          console.warn("Could not save checked criteria", e);
        }
      }
      return updated;
    });
  };

  // Calculator State
  const [calcLoanAmount, setCalcLoanAmount] = useState<number>(300000);
  const [calcPlotAreaRai, setCalcPlotAreaRai] = useState<number>(25);
  const [calcCropType, setCalcCropType] = useState<"cassava" | "sugarcane" | "both">("cassava");

  // Calculated Financial Benefits
  const financialSummary = useMemo(() => {
    // BAAC Interest Savings: Normal MRR 6.875% vs SmartAgri 2.50% (Difference = 4.375%)
    const normalInterestAnnual = calcLoanAmount * 0.06875;
    const smartAgriInterestAnnual = calcLoanAmount * 0.025;
    const interestSavedAnnual = normalInterestAnnual - smartAgriInterestAnnual;

    // Cassava: Yield ~ 4.2 tons/rai, Starch bonus +300 THB/ton (at >=30% starch or +150 at 28%)
    const cassavaTotalTons = calcPlotAreaRai * 4.2;
    const cassavaStarchBonusAnnual =
      calcCropType === "cassava" || calcCropType === "both" ? cassavaTotalTons * 250 : 0;

    // Sugarcane: Yield ~ 12.5 tons/rai, Fresh cane bonus +120 THB/ton
    const sugarTotalTons = calcPlotAreaRai * 12.5;
    const sugarFreshBonusAnnual =
      calcCropType === "sugarcane" || calcCropType === "both" ? sugarTotalTons * 120 : 0;

    // Chemical fertilizer savings from tailored NPK: ~350 THB/rai
    const fertilizerSavedAnnual = calcPlotAreaRai * 350;

    const totalAnnualBenefit =
      interestSavedAnnual + cassavaStarchBonusAnnual + sugarFreshBonusAnnual + fertilizerSavedAnnual;

    return {
      normalInterestAnnual,
      smartAgriInterestAnnual,
      interestSavedAnnual,
      cassavaStarchBonusAnnual,
      sugarFreshBonusAnnual,
      fertilizerSavedAnnual,
      totalAnnualBenefit,
    };
  }, [calcLoanAmount, calcPlotAreaRai, calcCropType]);

  // Partner Directory Filters
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState<PartnerCategory | "all">("all");
  const [partnerSearchQuery, setPartnerSearchQuery] = useState<string>("");

  const filteredPartners = useMemo(() => {
    const q = partnerSearchQuery.trim().toLowerCase();
    return KORAT_4P_PARTNERS.filter((partner) => {
      if (partnerCategoryFilter !== "all" && partner.category !== partnerCategoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        partner.nameTh.toLowerCase().includes(q) ||
        partner.nameEn.toLowerCase().includes(q) ||
        partner.districtNameTh.toLowerCase().includes(q) ||
        partner.keyBenefitsOffered.some((b) => b.toLowerCase().includes(q)) ||
        partner.supportedCrops.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [partnerCategoryFilter, partnerSearchQuery]);

  // Farmer Application List State
  const [applicationList, setApplicationList] = useState<FarmerApplicationRecord[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_4P_APPLICATIONS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Could not read applications", e);
      }
    }
    return [
      {
        id: "APP-4P-2026-8812",
        applicantName: "นายประเสริฐ ด่านขุนทด (วิสาหกิจชุมชนมันสำปะหลังห้วยบง)",
        phone: "081-456-XXXX",
        districtId: "dan-khun-thot",
        districtNameTh: "อ.ด่านขุนทด",
        plotSizeRai: 35,
        primaryCrop: "มันสำปะหลัง (พันธุ์ กวก.50)",
        benefitOfferId: "offer_baac_green_credit",
        benefitTitleTh: "สินเชื่อเกษตรอัจฉริยะสีเขียว ดอกเบี้ย 2.50% ต่อปี",
        partnerNameTh: "ธ.ก.ส. สาขาด่านขุนทด",
        complianceScore: 100,
        complianceGrade: "A+",
        requestedLoanAmount: 400000,
        submittedAt: "12 ต.ค. 2569",
        status: "verified",
      },
      {
        id: "APP-4P-2026-8945",
        applicantName: "นางวรรณา ครบุรีเจริญ (กลุ่มเกษตรกรอ้อยสดครบุรี)",
        phone: "089-887-XXXX",
        districtId: "khon-buri",
        districtNameTh: "อ.ครบุรี",
        plotSizeRai: 50,
        primaryCrop: "อ้อยโรงงาน (พันธุ์ขอนแก่น 3 ปลอดโรคใบขาว)",
        benefitOfferId: "offer_sugar_green_cane",
        benefitTitleTh: "โบนัสอ้อยสดไม่เผา +120 บาท/ตัน + ท่อนพันธุ์ปลอดโรค",
        partnerNameTh: "บมจ.น้ำตาลครบุรี (KBS)",
        complianceScore: 75,
        complianceGrade: "A",
        requestedLoanAmount: 0,
        submittedAt: "14 ต.ค. 2569",
        status: "approved_pending_contract",
      },
    ];
  });

  // Modal / Form for submitting a new application
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [selectedOfferForApply, setSelectedOfferForApply] = useState<BenefitOfferItem>(
    KORAT_4P_BENEFIT_OFFERS[0]
  );
  const [applyForm, setApplyForm] = useState({
    applicantName: "",
    phone: "",
    districtId: selectedDistrict.id,
    plotSizeRai: 25,
    primaryCrop: "มันสำปะหลัง",
    requestedLoanAmount: 300000,
  });
  const [applySuccessToast, setApplySuccessToast] = useState<string>("");

  const handleOpenApplyModal = (offer: BenefitOfferItem) => {
    setSelectedOfferForApply(offer);
    setApplyForm((prev) => ({
      ...prev,
      districtId: selectedDistrict.id,
      primaryCrop: offer.targetCropTh.includes("อ้อย")
        ? "อ้อยโรงงาน"
        : offer.targetCropTh.includes("มัน")
        ? "มันสำปะหลัง"
        : "ข้าวหอมมะลิ 105",
    }));
    setShowApplyModal(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.applicantName.trim() || !applyForm.phone.trim()) {
      alert("กรุณาระบุชื่อ-สกุล และเบอร์โทรศัพท์ที่ติดต่อได้");
      return;
    }

    const distObj = KORAT_DISTRICTS.find((d) => d.id === applyForm.districtId) || selectedDistrict;

    const newRecord: FarmerApplicationRecord = {
      id: `APP-4P-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      applicantName: applyForm.applicantName.trim(),
      phone: applyForm.phone.trim(),
      districtId: applyForm.districtId,
      districtNameTh: distObj.nameTh,
      plotSizeRai: Number(applyForm.plotSizeRai) || 1,
      primaryCrop: applyForm.primaryCrop,
      benefitOfferId: selectedOfferForApply.id,
      benefitTitleTh: selectedOfferForApply.titleTh,
      partnerNameTh: selectedOfferForApply.providerNameTh,
      complianceScore,
      complianceGrade: complianceGrade.grade,
      requestedLoanAmount:
        selectedOfferForApply.benefitType === "low_interest_loan"
          ? Number(applyForm.requestedLoanAmount)
          : 0,
      submittedAt: new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: complianceScore >= 75 ? "verified" : "reviewing",
    };

    const updated = [newRecord, ...applicationList];
    setApplicationList(updated);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY_4P_APPLICATIONS, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save application", err);
      }
    }

    setShowApplyModal(false);
    setApplySuccessToast(
      `ยื่นขอรับสิทธิ์สำเร็จ! รหัสคำขอ: ${newRecord.id} เจ้าหน้าที่จะประสานงานเพื่อตรวจเอกสารแปลงใน ${distObj.nameTh}`
    );
    setTimeout(() => {
      setApplySuccessToast("");
    }, 7000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Confirmation */}
      {applySuccessToast && (
        <div
          role="alert"
          className="bg-emerald-950/90 border border-emerald-500/70 text-emerald-100 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{applySuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setApplySuccessToast("")}
            className="text-emerald-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner: 4P Public-Private-People Partnership */}
      <div className="bg-gradient-to-br from-[#0B1224] via-[#09101D] to-[#060911] border border-[#14B8A6]/45 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-bold font-mono">
                <Handshake className="w-4 h-4 text-emerald-400" />
                <span>พันธมิตรร่วมภาครัฐ-เอกชน-เกษตรกร (4P Partnership)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111827] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>พื้นที่เชื่อมโยง: {selectedDistrict.nameTh} ({selectedDistrict.zone})</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>ระบบสิทธิประโยชน์ร่วมและสินเชื่อดอกเบี้ยต่ำ</span>
              <span className="text-[#2DD4BF] text-sm sm:text-base font-normal font-mono hidden sm:inline">
                (Public-Private-People Partnership 4P)
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              ผสานความร่วมมือระหว่าง <strong className="text-white">ธ.ก.ส.</strong>,{" "}
              <strong className="text-white">กลุ่มโรงงานน้ำตาล</strong> (KBS, พิมาย, ด่านขุนทด), และ{" "}
              <strong className="text-white">กลุ่มโรงงานแป้งมันสำปะหลังโคราช</strong> (สงวนวงษ์, เอี่ยมบูรพา, โชคชัย) 
              มอบสิทธิประโยชน์สินเชื่อดอกเบี้ยต่ำพิเศษ 2.50% ต่อปี โบนัสอ้อยสดไม่เผา +120 บาท/ตัน และโบนัสแป้งมันสำปะหลังสูง +300 บาท/ตัน 
              ให้แก่เกษตรกรที่ปฏิบัติตามเกณฑ์เกษตรอัจฉริยะ SmartAgri
            </p>
          </div>

          {/* Quick Score Preview Box */}
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">Compliance Score</div>
              <div className="text-2xl font-bold font-mono text-[#FBBF24]">
                {complianceScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-400">
                เกรด {complianceGrade.grade}
              </div>
            </div>

            <div className="w-12 h-12 rounded-xl bg-[#14B8A6]/20 border border-[#14B8A6]/50 flex items-center justify-center text-[#2DD4BF] shrink-0">
              <Award className="w-6 h-6 text-[#FBBF24]" />
            </div>
          </div>
        </div>

        {/* 3 Major Pillars of the 4P Partnership */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* Pillar 1: BAAC */}
          <div className="bg-[#080C16] border border-emerald-500/35 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>1. สถาบันการเงิน (ธ.ก.ส.)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px]">
                ดอกเบี้ย 2.50%
              </span>
            </div>
            <div className="text-sm font-bold text-white">สินเชื่อเกษตรแม่นยำเพื่อความยั่งยืน</div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              อัตราดอกเบี้ย 2.50% (ลดลง 4.375% จาก MRR) วงเงินสูงสุด 500,000 – 1,000,000 บาท พร้อมอนุมัติ Fast-Track ใน 7 วัน
            </p>
          </div>

          {/* Pillar 2: Sugar Mills */}
          <div className="bg-[#080C16] border border-teal-500/35 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF] font-mono">
              <span className="flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-[#2DD4BF]" />
                <span>2. กลุ่มโรงงานน้ำตาล</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-[#2DD4BF] text-[10px]">
                โบนัส +120 บ./ตัน
              </span>
            </div>
            <div className="text-sm font-bold text-white">โควตาอ้อยสด &amp; พันธุ์ปลอดโรคใบขาว</div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              เพิ่มราคาอ้อยสด +120 บาท/ตัน, สนับสนุนท่อนพันธุ์บำบัดน้ำร้อนลด 50%, และสิทธิยืมเงินเกี๊ยวล่วงหน้าดอกเบี้ย 0%
            </p>
          </div>

          {/* Pillar 3: Cassava Mills */}
          <div className="bg-[#080C16] border border-amber-500/35 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300 font-mono">
              <span className="flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-amber-400" />
                <span>3. กลุ่มโรงงานแป้งมันโคราช</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px]">
                โบนัส +300 บ./ตัน
              </span>
            </div>
            <div className="text-sm font-bold text-white">โบนัสแป้งสูง &amp; ท่อนพันธุ์ต้านทาน SLCMV</div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              เพิ่มเงินตามเปอร์เซ็นต์แป้ง 28–30% สูงสุด +300 บาท/ตัน พร้อมกระจายท่อนพันธุ์ต้านทานโรคใบด่าง (กวก.50 / อิทธิ 1)
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-2 flex flex-wrap items-center gap-2">
        {(
          [
            {
              id: "overview",
              label: "🎁 แพ็กเกจสิทธิประโยชน์ร่วม (Privilege Offers)",
              badge: `${KORAT_4P_BENEFIT_OFFERS.length} รายการ`,
            },
            {
              id: "scorecard",
              label: "📝 ประเมินคะแนนรับสิทธิ์ (Compliance Scorecard)",
              badge: `${complianceScore}/100 คะแนน`,
            },
            {
              id: "calculator",
              label: "🧮 คำนวณดอกเบี้ย & โบนัสที่ประหยัดได้ (ROI Calculator)",
              badge: "คำนวณเงินสุทธิ",
            },
            {
              id: "directory",
              label: "🏭 ทำเนียบโรงงานคู่สัญญา & สาขา ธ.ก.ส. (Partner Directory)",
              badge: `${filteredPartners.length} แห่ง`,
            },
            {
              id: "certificate",
              label: "🪪 บัตรรับรองดิจิทัล SmartAgri (4P Digital Passport)",
              badge: "พิมพ์ใบรับรอง",
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

      {/* ================= TAB 1: OVERVIEW & BENEFIT PACKAGES ================= */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {KORAT_4P_BENEFIT_OFFERS.map((offer) => {
              const isEligible = complianceScore >= offer.requiredComplianceScore;

              return (
                <div
                  key={offer.id}
                  className={`bg-[#080C16] border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all ${
                    isEligible
                      ? "border-[#14B8A6]/60 shadow-[0_0_20px_rgba(20,184,166,0.12)]"
                      : "border-[#1E293B] opacity-90"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-mono font-bold bg-[#111827] text-[#2DD4BF] border border-[#1E293B]">
                        {offer.providerNameTh}
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isEligible
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {isEligible ? "✔ คุณมีคุณสมบัติครบ" : `ต้องมี ${offer.requiredComplianceScore} คะแนน`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {offer.titleTh}
                      </h3>
                      <div className="text-xs text-slate-400 mt-1">{offer.subtitleTh}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B101D] border border-slate-800 space-y-1.5 text-xs">
                      <div className="text-slate-400 flex items-center justify-between text-[11px]">
                        <span>อัตราปกติ:</span>
                        <span className="line-through text-slate-500 font-mono">{offer.standardRateTh}</span>
                      </div>
                      <div className="text-white flex items-center justify-between font-bold">
                        <span>สิทธิ์ SmartAgri:</span>
                        <span className="text-[#FBBF24] font-mono text-sm">{offer.smartAgriPrivilegeTh}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono pt-1 border-t border-slate-800">
                        {offer.netSavingsOrBonusEstimateTh}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-slate-400 text-[11px] font-mono">เงื่อนไขการรับสิทธิ์:</div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {offer.eligibilityCriteriaTh.map((crit, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5">
                            <span className="text-[#14B8A6] shrink-0">✔</span>
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenApplyModal(offer)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        isEligible
                          ? "bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] shadow-md"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      <Handshake className="w-4 h-4" />
                      <span>{offer.callToActionLabelTh}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Application Tracking Feed */}
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#2DD4BF]" />
                <span>คำขอยื่นรับสิทธิประโยชน์และสินเชื่อของเกษตรกร ({applicationList.length} รายการ)</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">บันทึกผ่านระบบดิจิทัล</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B101D] text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">รหัสคำขอ / เกษตรกร</th>
                    <th className="py-2.5 px-3">อำเภอ / พื้นที่แปลง</th>
                    <th className="py-2.5 px-3">สิทธิประโยชน์ที่ยื่นขอ</th>
                    <th className="py-2.5 px-3">คะแนน SmartAgri</th>
                    <th className="py-2.5 px-3">วงเงินสินเชื่อ/โควตา</th>
                    <th className="py-2.5 px-3">สถานะคำขอ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#060912]">
                  {applicationList.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-[#2DD4BF] font-semibold">{app.id}</div>
                        <div className="text-white font-medium">{app.applicantName}</div>
                        <div className="text-[10px] text-slate-400">โทร {app.phone}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>{app.districtNameTh}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {app.plotSizeRai} ไร่ ({app.primaryCrop})
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{app.benefitTitleTh}</div>
                        <div className="text-[10px] text-slate-400">{app.partnerNameTh}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-amber-300 font-bold">{app.complianceScore}</span>/100
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                          {app.complianceGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        {app.requestedLoanAmount && app.requestedLoanAmount > 0 ? (
                          <span className="text-white font-bold">
                            ฿{app.requestedLoanAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">โควตาผลผลิต</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            app.status === "verified"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {app.status === "verified" ? "✔ ตรวจสอบผ่านแล้ว" : "⏳ กำลังดำเนินการตรวจแปลง"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: COMPLIANCE SCORECARD EVALUATION ================= */}
      {activeTab === "scorecard" && (
        <div className="space-y-5">
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
                  <span>แบบประเมินตนเองตามเกณฑ์ SmartAgri Compliance Score</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ทำเครื่องหมายในข้อที่ท่านได้ปฏิบัติตามคำแนะนำของระบบ เพื่อสะสมคะแนนในการขอรับสิทธิประโยชน์
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#0B101D] p-3 rounded-xl border border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">คะแนนสะสมปัจจุบัน</div>
                  <div className="text-xl font-bold font-mono text-[#FBBF24]">
                    {complianceScore} / 100
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                  เกรด {complianceGrade.grade}
                </div>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="space-y-3.5">
              {COMPLIANCE_CRITERIA_LIST.map((crit, idx) => {
                const isChecked = Boolean(checkedCriteria[crit.id]);

                return (
                  <div
                    key={crit.id}
                    onClick={() => handleToggleCriterion(crit.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isChecked
                        ? "bg-[#0A1624] border-[#14B8A6] shadow-sm"
                        : "bg-[#090D18] border-[#1E293B] hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-5 h-5 mt-1 rounded bg-[#0F172A] border-slate-700 text-[#14B8A6] focus:ring-0 cursor-pointer accent-[#14B8A6]"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-[#2DD4BF]">
                          หมวดที่ {idx + 1}: {crit.pillar}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          +{crit.weightScore} คะแนน
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white">{crit.titleTh}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{crit.descriptionTh}</p>

                      <div className="text-[11px] text-slate-400 font-mono pt-1">
                        หลักฐานตรวจสอบ: <span className="text-slate-200">{crit.verificationEvidenceTh}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unlock Status Alert */}
            <div className="p-4 rounded-xl bg-[#0B101D] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-white">
                  ผลการประเมิน: {complianceGrade.label} ({complianceScore}/100)
                </div>
                <div className="text-slate-300 text-[11.5px]">
                  {complianceScore >= 75
                    ? "🎉 ยอดเยี่ยม! ท่านมีคุณสมบัติพร้อมในการยื่นขอกู้สินเชื่อดอกเบี้ยต่ำ ธ.ก.ส. 2.50% และรับโบนัสโรงงานน้ำตาล/แป้งมันสำปะหลังเต็มจำนวน"
                    : "⚠️ ท่านยังมีคะแนนไม่ถึง 75 คะแนน แนะนำให้ปฏิบัติตามคำแนะนำปุ๋ยสั่งตัดหรือนโยบายไม่เผาแปลงเพื่อยกระดับคะแนน"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("certificate")}
                className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                ดูบัตรรับรองดิจิทัล 🪪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ROI & BENEFIT CALCULATOR ================= */}
      {activeTab === "calculator" && (
        <div className="space-y-5">
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2DD4BF]" />
                <span>เครื่องมือคำนวณผลประโยชน์สุทธิที่เกษตรกรจะได้รับต่อปี (SmartAgri ROI Calculator)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                จำลองการประหยัดดอกเบี้ย ธ.ก.ส. ค่าปุ๋ยสั่งตัด และเงินโบนัสผลผลิตจากโรงงานน้ำตาล/แป้งมันสำปะหลัง
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 6 Cols: Interactive Sliders */}
              <div className="lg:col-span-6 space-y-5 bg-[#0B101D] p-5 rounded-2xl border border-slate-800">
                {/* 1. Loan Amount Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <span>วงเงินกู้สินเชื่อเกษตรแม่นยำ ธ.ก.ส.:</span>
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ฿{calcLoanAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={25000}
                    value={calcLoanAmount}
                    onChange={(e) => setCalcLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>50,000 บาท</span>
                    <span>500,000 บาท</span>
                    <span>1,000,000 บาท</span>
                  </div>
                </div>

                {/* 2. Plot Area Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-[#2DD4BF]" />
                      <span>พื้นที่แปลงเพาะปลูกในโคราช:</span>
                    </span>
                    <span className="text-base font-bold font-mono text-[#2DD4BF]">
                      {calcPlotAreaRai} ไร่
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={calcPlotAreaRai}
                    onChange={(e) => setCalcPlotAreaRai(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2DD4BF]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5 ไร่</span>
                    <span>50 ไร่</span>
                    <span>100 ไร่</span>
                  </div>
                </div>

                {/* 3. Crop Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-semibold block">
                    พืชเศรษฐกิจที่ส่งเข้าโรงงานคู่สัญญา:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "cassava", label: "🍠 มันสำปะหลัง (โรงแป้ง)" },
                      { id: "sugarcane", label: "🎋 อ้อยโรงงาน (น้ำตาล)" },
                      { id: "both", label: "🌱 ปลูกทั้งสองชนิด" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCalcCropType(c.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          calcCropType === c.id
                            ? "bg-[#14B8A6] text-[#041E1C] font-bold border-[#14B8A6]"
                            : "bg-[#080C16] text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: Result Breakdown Card */}
              <div className="lg:col-span-6 bg-gradient-to-br from-[#0F1E33] to-[#0A1324] border border-[#2DD4BF]/50 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="text-xs font-mono uppercase text-[#2DD4BF] flex items-center justify-between">
                  <span>ประมาณการผลประโยชน์สุทธิรายปี (Annual Net Benefit)</span>
                  <span className="text-[10px] text-slate-400">คำนวณตามเกณฑ์ SmartAgri</span>
                </div>

                {/* Big Total Benefit */}
                <div className="bg-[#080C16]/80 border border-emerald-500/40 rounded-xl p-4 text-center space-y-1">
                  <div className="text-xs text-slate-300">ผลประโยชน์รวมสุทธิที่ประหยัดและได้เพิ่มขึ้นต่อปี:</div>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400">
                    +฿{Math.round(financialSummary.totalAnnualBenefit).toLocaleString()}
                    <span className="text-base font-normal text-slate-300"> / ปี</span>
                  </div>
                  <div className="text-[11px] text-[#2DD4BF] font-mono">
                    (เฉลี่ยได้ผลประโยชน์เพิ่มขึ้น +฿{Math.round(financialSummary.totalAnnualBenefit / calcPlotAreaRai).toLocaleString()} ต่อไร่)
                  </div>
                </div>

                {/* Itemized Breakdown */}
                <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-300">
                      1. ดอกเบี้ย ธ.ก.ส. ที่ประหยัดได้ (อัตรา 2.50% vs MRR 6.875%):
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">
                      +฿{Math.round(financialSummary.interestSavedAnnual).toLocaleString()}
                    </span>
                  </div>

                  {(calcCropType === "cassava" || calcCropType === "both") && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-300">
                        2. เงินโบนัสแป้งมันสำปะหลังสูง (+250 บ./ตัน ที่ 4.2 ตัน/ไร่):
                      </span>
                      <span className="font-mono text-amber-300 font-bold">
                        +฿{Math.round(financialSummary.cassavaStarchBonusAnnual).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {(calcCropType === "sugarcane" || calcCropType === "both") && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-slate-300">
                        3. เงินโบนัสอ้อยสดไม่เผา (+120 บ./ตัน ที่ 12.5 ตัน/ไร่):
                      </span>
                      <span className="font-mono text-teal-300 font-bold">
                        +฿{Math.round(financialSummary.sugarFreshBonusAnnual).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-300">
                      4. ประหยัดต้นทุนปุ๋ยเคมีจากสูตรปุ๋ยสั่งตัด (~350 บ./ไร่):
                    </span>
                    <span className="font-mono text-sky-300 font-bold">
                      +฿{Math.round(financialSummary.fertilizerSavedAnnual).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="w-full py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>ยื่นขอรับสิทธิประโยชน์จาก ธ.ก.ส. และโรงงานทันที →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PARTNER DIRECTORY (MILLS & BAAC) ================= */}
      {activeTab === "directory" && (
        <div className="space-y-5">
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={partnerSearchQuery}
                onChange={(e) => setPartnerSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อโรงงานน้ำตาล, โรงแป้งมัน, สาขา ธ.ก.ส., หรืออำเภอ..."
                className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
              />
              {partnerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPartnerSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Filter className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>ประเภทพันธมิตร:</span>
              </div>
              <select
                value={partnerCategoryFilter}
                onChange={(e) => setPartnerCategoryFilter(e.target.value as any)}
                className="bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF] cursor-pointer"
              >
                <option value="all">ทั้งหมด (All Partners)</option>
                <option value="financial_baac">ธ.ก.ส. (Financial)</option>
                <option value="sugar_mill">โรงงานน้ำตาล (Sugar Mills)</option>
                <option value="cassava_mill">โรงงานแป้งมันสำปะหลัง (Cassava Mills)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 space-y-3 hover:border-[#14B8A6]/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/15 border border-[#14B8A6]/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
                        {partner.category === "financial_baac" ? (
                          <Landmark className="w-5 h-5" />
                        ) : (
                          <Factory className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#2DD4BF] uppercase">
                          {partner.categoryLabelTh}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {partner.nameTh}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono shrink-0">
                      {partner.districtNameTh}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0B101D] border border-slate-800 space-y-1 text-xs">
                    <div className="font-bold text-amber-300">{partner.specialProgramTitle}</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {partner.specialProgramDetail}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] font-mono text-slate-400">สิทธิประโยชน์ที่มอบให้:</div>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {partner.keyBenefitsOffered.map((ben, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">✔</span>
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[#2DD4BF] font-mono flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{partner.phone}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const matchingOffer = KORAT_4P_BENEFIT_OFFERS.find(
                        (o) => o.category === partner.category
                      );
                      if (matchingOffer) {
                        handleOpenApplyModal(matchingOffer);
                      } else {
                        setActiveTab("overview");
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    ยื่นเชื่อมโยงสิทธิ์ →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: DIGITAL PASSPORT & CERTIFICATE ================= */}
      {activeTab === "certificate" && (
        <div className="space-y-5">
          <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FBBF24]" />
                  <span>บัตรรับรองดิจิทัล SmartAgri Partner Passport &amp; Compliance Certificate</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ใช้แสดงต่อเจ้าหน้าที่สินเชื่อ ธ.ก.ส. หรือฝ่ายส่งเสริมโรงงานน้ำตาล/โรงแป้งมันเพื่อขอรับสิทธิประโยชน์
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#1E293B] border border-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์บัตรรับรอง</span>
                </button>
              </div>
            </div>

            {/* Official Digital Certificate Card Layout */}
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#0B1424] via-[#09101D] to-[#040812] border-2 border-[#14B8A6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              {/* Background Watermark Stamp */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <Handshake className="w-64 h-64 text-white" />
              </div>

              {/* Certificate Header */}
              <div className="flex items-start justify-between border-b border-[#14B8A6]/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#14B8A6]/20 border border-[#14B8A6] flex items-center justify-center text-[#2DD4BF]">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-[#2DD4BF] uppercase tracking-wider font-bold">
                      Korat SmartAgri · 4P Agri-Ecosystem
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white">
                      บัตรรับรองสิทธิประโยชน์เกษตรกรอัจฉริยะ
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Certificate ID: NMA-4P-2026-{(selectedDistrict.id.length * 137).toString().padStart(6, "0")}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">COMPLIANCE GRADE</div>
                  <div className="text-3xl font-bold font-mono text-[#FBBF24]">
                    {complianceGrade.grade}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400">
                    {complianceScore} / 100 PTS
                  </div>
                </div>
              </div>

              {/* Farmer and Plot Credentials */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#060A14]/70 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">พื้นที่และพิกัดแปลง:</div>
                  <div className="font-bold text-white">{selectedDistrict.nameTh} ({selectedDistrict.zone})</div>
                  <div className="text-[10px] text-slate-400">จังหวัดนครราชสีมา</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">เกณฑ์การปฏิบัติที่ผ่านการรับรอง:</div>
                  <div className="font-semibold text-emerald-300">
                    {checkedCriteria.fert_soil_tailored && "• ปุ๋ยสั่งตัด "}
                    {checkedCriteria.zero_burn_cane && "• ไม่เผาแปลง "}
                    {checkedCriteria.clean_seed_slcmv_free && "• พันธุ์สะอาด"}
                  </div>
                </div>
              </div>

              {/* Entitled 4P Privileges */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#2DD4BF] uppercase font-bold">
                  สิทธิประโยชน์ที่ได้รับการอนุมัติ (Approved Privileges):
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <span>สินเชื่อ SmartAgri Green Credit (ธ.ก.ส.)</span>
                    </div>
                    <span className="font-bold font-mono text-emerald-300">ดอกเบี้ย 2.50% ต่อปี</span>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-[#2DD4BF]" />
                      <span>โควตาส่งอ้อยสดโรงงานน้ำตาล (KBS / พิมาย / ด่านขุนทด)</span>
                    </div>
                    <span className="font-bold font-mono text-[#2DD4BF]">โบนัส +120 บาท/ตัน</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Factory className="w-4 h-4 text-amber-400" />
                      <span>โบนัสแป้งมันสำปะหลังสูง (สงวนวงษ์ / เอี่ยมบูรพา)</span>
                    </div>
                    <span className="font-bold font-mono text-amber-300">โบนัสสูงสุด +300 บาท/ตัน</span>
                  </div>
                </div>
              </div>

              {/* Signature & Authentication Stamp */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-[#2DD4BF]" />
                  <div>
                    <div>สแกนตรวจสอบสิทธิ์ดิจิทัล</div>
                    <div className="text-slate-500">ระบบ SmartAgri โคราช</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-slate-300 font-bold">ภาคีพันธมิตร 4P จังหวัดนครราชสีมา</div>
                  <div>ธ.ก.ส. · สมาคมชาวไร่อ้อย · สมาคมแป้งมันสำปะหลัง</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BENEFIT APPLICATION FORM ================= */}
      {showApplyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="bg-[#0B1224] border border-[#14B8A6]/60 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-[#111827] border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#2DD4BF] uppercase font-bold">
                Application Form · {selectedOfferForApply.providerNameTh}
              </span>
              <h3 className="text-base font-bold text-white">{selectedOfferForApply.titleTh}</h3>
              <p className="text-xs text-slate-300">{selectedOfferForApply.subtitleTh}</p>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อ-สกุล เกษตรกรผู้ยื่นคำขอ:</label>
                <input
                  type="text"
                  value={applyForm.applicantName}
                  onChange={(e) => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                  placeholder="เช่น นายบุญส่ง เพาะปลูก..."
                  className="w-full bg-[#080C16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
                  <input
                    type="tel"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    placeholder="เช่น 081-234-5678"
                    className="w-full bg-[#080C16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">อำเภอที่ตั้งแปลง:</label>
                  <select
                    value={applyForm.districtId}
                    onChange={(e) => setApplyForm({ ...applyForm, districtId: e.target.value })}
                    className="w-full bg-[#080C16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                  >
                    {KORAT_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ขนาดพื้นที่เพาะปลูก (ไร่):</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={applyForm.plotSizeRai}
                    onChange={(e) =>
                      setApplyForm({ ...applyForm, plotSizeRai: Number(e.target.value) })
                    }
                    className="w-full bg-[#080C16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">พืชเศรษฐกิจหลักในแปลง:</label>
                  <input
                    type="text"
                    value={applyForm.primaryCrop}
                    onChange={(e) => setApplyForm({ ...applyForm, primaryCrop: e.target.value })}
                    className="w-full bg-[#080C16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    required
                  />
                </div>
              </div>

              {selectedOfferForApply.benefitType === "low_interest_loan" && (
                <div>
                  <label className="block text-slate-400 mb-1">
                    วงเงินกู้ที่ประสงค์ขอกู้ ธ.ก.ส. (บาท):
                  </label>
                  <input
                    type="number"
                    min={50000}
                    max={1000000}
                    step={25000}
                    value={applyForm.requestedLoanAmount}
                    onChange={(e) =>
                      setApplyForm({
                        ...applyForm,
                        requestedLoanAmount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#080C16] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2DD4BF]"
                    required
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#080C16] border border-slate-800 space-y-1 text-[11px] text-slate-300">
                <div className="text-emerald-400 font-bold">
                  คะแนน SmartAgri Compliance ปัจจุบันของท่าน: {complianceScore}/100 (เกรด {complianceGrade.grade})
                </div>
                <div>
                  เกณฑ์ขั้นต่ำของโครงการนี้: {selectedOfferForApply.requiredComplianceScore} คะแนน (ท่านมีคุณสมบัติผ่าน)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ยืนยันการยื่นขอรับสิทธิ์</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
