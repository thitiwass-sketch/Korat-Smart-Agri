import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  KORAT_DISTRICTS,
  KORAT_COMMODITIES,
  CommodityKey,
  KoratDistrict,
} from "../data/koratAgriData";
import {
  CloudRain,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";

interface ExecutiveSummaryChartsProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
}

const THAI_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

// TMD 30-year baseline monthly rainfall distribution for Nakhon Ratchasima (mm)
const KORAT_30YR_MONTHLY_NORMAL_MM = [
  8, 16, 42, 78, 154, 118, 126, 148, 228, 152, 34, 6,
];

// Seasonal price index curve across 12 months for each Korat commodity
const COMMODITY_SEASONAL_FACTORS: Record<CommodityKey, number[]> = {
  cassava_fresh: [
    0.94, 0.91, 0.93, 0.96, 0.92, 0.91, 0.93, 0.95, 0.97, 1.0, 1.03, 1.06,
  ],
  cassava_chip: [
    0.95, 0.93, 0.94, 0.96, 0.95, 0.95, 0.96, 0.97, 0.98, 1.0, 1.03, 1.05,
  ],
  sugarcane_fresh: [
    1.02, 1.04, 1.01, 0.97, 0.96, 0.96, 0.97, 0.98, 0.99, 1.0, 1.02, 1.04,
  ],
  maize_feed: [
    1.04, 1.05, 1.06, 1.05, 1.04, 1.05, 1.03, 1.01, 0.99, 1.0, 1.02, 1.05,
  ],
  jasmine_rice: [
    1.03, 1.04, 1.02, 1.01, 0.96, 0.97, 0.98, 0.98, 0.99, 1.0, 0.96, 1.02,
  ],
};

export const ExecutiveSummaryCharts: React.FC<ExecutiveSummaryChartsProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [compareDistrictId, setCompareDistrictId] = useState<string>(
    selectedDistrict.id === "pak-chong" ? "phimai" : "pak-chong"
  );
  const [selectedCommodityKey, setSelectedCommodityKey] =
    useState<CommodityKey>("cassava_fresh");

  const compareDistrict = useMemo(() => {
    const found = KORAT_DISTRICTS.find((d) => d.id === compareDistrictId);
    if (found && found.id !== selectedDistrict.id) return found;
    return (
      KORAT_DISTRICTS.find((d) => d.id !== selectedDistrict.id) ||
      KORAT_DISTRICTS[0]
    );
  }, [compareDistrictId, selectedDistrict.id]);

  const commodityMeta = useMemo(
    () =>
      KORAT_COMMODITIES.find((c) => c.key === selectedCommodityKey) ||
      KORAT_COMMODITIES[0],
    [selectedCommodityKey]
  );

  // Build 12-month rainfall & agro-climatic series for Selected District vs Compare District
  const monthlyRainfallSeries = useMemo(() => {
    const scaleSelected =
      (selectedDistrict.normalRain30dMm / 150) *
      (1 + selectedDistrict.spi30d * 0.14);
    const scaleCompare =
      (compareDistrict.normalRain30dMm / 150) *
      (1 + compareDistrict.spi30d * 0.14);

    return THAI_MONTHS.map((month, idx) => {
      const normalMm = KORAT_30YR_MONTHLY_NORMAL_MM[idx];
      // Add subtle district-specific seasonal phase shift (western highlands vs northern plains)
      const westBoost = selectedDistrict.lon < 101.85 && idx >= 4 && idx <= 9 ? 1.08 : 1.0;
      const compareWestBoost =
        compareDistrict.lon < 101.85 && idx >= 4 && idx <= 9 ? 1.08 : 1.0;

      const selectedRainMm = Math.max(
        2,
        Math.round(normalMm * scaleSelected * westBoost)
      );
      const compareRainMm = Math.max(
        2,
        Math.round(normalMm * scaleCompare * compareWestBoost)
      );

      return {
        month,
        selectedRainMm,
        compareRainMm,
        normal30YrMm: normalMm,
      };
    });
  }, [selectedDistrict, compareDistrict]);

  // Compute annual rainfall summary stats
  const rainfallStats = useMemo(() => {
    const totalSelected = monthlyRainfallSeries.reduce(
      (sum, item) => sum + item.selectedRainMm,
      0
    );
    const totalNormal = monthlyRainfallSeries.reduce(
      (sum, item) => sum + item.normal30YrMm,
      0
    );
    const diffPct = Number(
      (((totalSelected - totalNormal) / totalNormal) * 100).toFixed(1)
    );
    const peakMonthItem = monthlyRainfallSeries.reduce(
      (best, cur) => (cur.selectedRainMm > best.selectedRainMm ? cur : best),
      monthlyRainfallSeries[0]
    );
    return {
      totalSelected,
      totalNormal,
      diffPct,
      peakMonth: peakMonthItem.month,
      peakRainMm: peakMonthItem.selectedRainMm,
    };
  }, [monthlyRainfallSeries]);

  // Build 12-month price trend series for Selected District vs Compare District vs Provincial Mean
  const monthlyPriceSeries = useMemo(() => {
    const basePrice = commodityMeta.provincialAvgPrice;
    const factors = COMMODITY_SEASONAL_FACTORS[selectedCommodityKey];

    // Local district basis modifier based on proximity to processing hubs & primary crop specialization
    const getDistrictPriceFactor = (dist: KoratDistrict, key: CommodityKey) => {
      let factor = 1.0;
      if (key === "cassava_fresh" || key === "cassava_chip") {
        if (
          ["soeng-sang", "khon-buri", "dan-khun-thot", "sikhio", "nong-bun-mak"].includes(
            dist.id
          )
        ) {
          factor += 0.028;
        } else if (dist.gistdaSoilMoisturePct >= 45) {
          factor += 0.012;
        } else {
          factor -= 0.015;
        }
      } else if (key === "sugarcane_fresh") {
        if (["phimai", "khon-buri", "chum-phuang", "bua-yai", "prathai"].includes(dist.id)) {
          factor += 0.022;
        } else {
          factor -= 0.014;
        }
      } else if (key === "maize_feed") {
        if (["pak-chong", "sikhio", "dan-khun-thot", "wang-nam-khiao", "thepharak"].includes(dist.id)) {
          factor += 0.025;
        } else {
          factor -= 0.012;
        }
      } else if (key === "jasmine_rice") {
        if (
          ["phimai", "chum-phuang", "non-sung", "prathai", "bua-yai", "khong"].includes(
            dist.id
          )
        ) {
          factor += 0.026;
        } else {
          factor -= 0.01;
        }
      }
      return factor;
    };

    const selFactor = getDistrictPriceFactor(selectedDistrict, selectedCommodityKey);
    const cmpFactor = getDistrictPriceFactor(compareDistrict, selectedCommodityKey);
    const decimals =
      selectedCommodityKey === "sugarcane_fresh" ||
      selectedCommodityKey === "jasmine_rice"
        ? 0
        : 2;

    return THAI_MONTHS.map((month, idx) => {
      const seasonal = factors[idx];
      // Add slight district-specific harvest timing variance
      const selWave = 1 + Math.sin((idx + (selectedDistrict.lat % 1) * 5) * 0.6) * 0.008;
      const cmpWave = 1 + Math.cos((idx + (compareDistrict.lon % 1) * 5) * 0.6) * 0.008;

      const selectedPrice = Number(
        (basePrice * seasonal * selFactor * selWave).toFixed(decimals)
      );
      const comparePrice = Number(
        (basePrice * seasonal * cmpFactor * cmpWave).toFixed(decimals)
      );
      const provincialMean = Number((basePrice * seasonal).toFixed(decimals));

      return {
        month,
        selectedPrice,
        comparePrice,
        provincialMean,
      };
    });
  }, [commodityMeta, selectedCommodityKey, selectedDistrict, compareDistrict]);

  const priceStats = useMemo(() => {
    const octItem = monthlyPriceSeries[9]; // ต.ค. (ปัจจุบัน)
    const decItem = monthlyPriceSeries[11]; // ธ.ค.
    const maxItem = monthlyPriceSeries.reduce(
      (best, cur) => (cur.selectedPrice > best.selectedPrice ? cur : best),
      monthlyPriceSeries[0]
    );
    const spreadVsProvincialPct = Number(
      (
        ((octItem.selectedPrice - octItem.provincialMean) /
          octItem.provincialMean) *
        100
      ).toFixed(1)
    );
    return {
      currentDistrictPrice: octItem.selectedPrice,
      yearEndProjectedPrice: decItem.selectedPrice,
      peakMonth: maxItem.month,
      peakPrice: maxItem.selectedPrice,
      spreadVsProvincialPct,
    };
  }, [monthlyPriceSeries]);

  const formatPriceValue = (val: number) => {
    if (
      selectedCommodityKey === "sugarcane_fresh" ||
      selectedCommodityKey === "jasmine_rice"
    ) {
      return val.toLocaleString("th-TH");
    }
    return val.toFixed(2);
  };

  return (
    <section
      aria-label="สรุปข้อมูลทัศนภาพปริมาณฝนเฉลี่ยรายเดือนและแนวโน้มราคาพืชเศรษฐกิจ"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5 sm:p-7 space-y-6"
    >
      {/* Top Bar: Section Title & Interactive District / Commodity Comparison Selectors */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-800">
              Executive Agro-Climatic &amp; Market Price Analytics
            </span>
            <span aria-hidden="true">·</span>
            <span>ข้อมูลสถิติปริมาณฝนเฉลี่ยรายเดือนและแนวโน้มราคาพืชเศรษฐกิจรายอำเภอ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            สรุปสถิติปริมาณฝนเฉลี่ยรายเดือน (12 เดือน) และแนวโน้มราคาผลผลิตเปรียบเทียบรายอำเภอ
          </h2>
        </div>

        {/* Interactive Selectors: Primary District, Comparison District, and Crop Commodity */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="text-xs text-slate-500 whitespace-nowrap">อำเภอหลัก:</span>
            <select
              value={selectedDistrict.id}
              onChange={(e) => onSelectDistrict(e.target.value)}
              aria-label="เลือกอำเภอหลักสำหรับกราฟสรุป"
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
            >
              {KORAT_DISTRICTS.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.nameTh}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="text-xs text-slate-500 whitespace-nowrap">เปรียบเทียบกับ:</span>
            <select
              value={compareDistrict.id}
              onChange={(e) => setCompareDistrictId(e.target.value)}
              aria-label="เลือกอำเภอเปรียบเทียบ"
              className="text-xs font-bold text-sky-800 bg-transparent focus:outline-none"
            >
              {KORAT_DISTRICTS.filter((d) => d.id !== selectedDistrict.id).map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.nameTh}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 text-white rounded-xl px-3 py-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 whitespace-nowrap">พืชเศรษฐกิจ:</span>
            <select
              value={selectedCommodityKey}
              onChange={(e) => setSelectedCommodityKey(e.target.value as CommodityKey)}
              aria-label="เลือกพืชเศรษฐกิจสำหรับดูแนวโน้มราคา"
              className="text-xs font-semibold text-white bg-slate-900 focus:outline-none"
            >
              {KORAT_COMMODITIES.map((com) => (
                <option key={com.key} value={com.key}>
                  {com.nameTh} ({com.unit})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Two-Column Recharts Executive Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 6 COLS: Monthly Average Rainfall & 30-Year Normal Baseline (Recharts ComposedChart) */}
        <div className="lg:col-span-6 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span>ปริมาณน้ำฝนเฉลี่ยรายเดือน (ม.ค. – ธ.ค.) เทียบค่าปกติ 30 ปี</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedDistrict.nameTh} vs. {compareDistrict.nameTh}
              </h3>
            </div>

            <div className="text-right font-mono tabular-nums">
              <div className="text-xs text-slate-500 font-sans">ฝนสะสมรายปี ({selectedDistrict.nameTh})</div>
              <div className="text-lg font-bold text-slate-900 flex items-center justify-end gap-1.5">
                <span>{rainfallStats.totalSelected.toLocaleString("th-TH")} มม./ปี</span>
                <span
                  className={`text-xs font-semibold inline-flex items-center ${
                    rainfallStats.diffPct >= 0 ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {rainfallStats.diffPct >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {rainfallStats.diffPct > 0 ? `+${rainfallStats.diffPct}%` : `${rainfallStats.diffPct}%`}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Summary KPI Micro-Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-white border border-slate-200/80 rounded-xl p-3 text-xs font-mono tabular-nums">
            <div>
              <div className="text-[11px] text-slate-500 font-sans">เดือนที่ฝนตกชุกที่สุด</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {rainfallStats.peakMonth} ({rainfallStats.peakRainMm} มม.)
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-sans">ค่าเฉลี่ยปกติ 30 ปี</div>
              <div className="font-bold text-slate-700 mt-0.5">
                {rainfallStats.totalNormal.toLocaleString("th-TH")} มม./ปี
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-sans">ดรรชนี SPI-30d ล่าสุด</div>
              <div
                className={`font-bold mt-0.5 ${
                  selectedDistrict.spi30d <= -1.5
                    ? "text-red-700"
                    : selectedDistrict.spi30d <= -1.0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {selectedDistrict.spi30d > 0
                  ? `+${selectedDistrict.spi30d}`
                  : selectedDistrict.spi30d}{" "}
                ({selectedDistrict.droughtRiskLevel})
              </div>
            </div>
          </div>

          {/* Recharts Monthly Rainfall ComposedChart */}
          <div className="h-[270px] w-full bg-[#080C16] border border-[#1E293B] rounded-xl p-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyRainfallSeries}
                margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={{ stroke: "#1E293B" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  unit=" มม."
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B101D",
                    borderColor: "#14B8A6",
                    borderRadius: "10px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#E2E8F0" }}
                  formatter={(value: unknown, name: unknown) => [
                    `${Number(value)} มม.`,
                    String(name),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "6px", color: "#CBD5E1" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="selectedRainMm"
                  name={`ฝนเฉลี่ย ${selectedDistrict.nameTh}`}
                  fill="#14B8A6"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="compareRainMm"
                  name={`ฝนเฉลี่ย ${compareDistrict.nameTh}`}
                  fill="#6366F1"
                  fillOpacity={0.75}
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Line
                  type="monotone"
                  dataKey="normal30YrMm"
                  name="ค่าปกติ 30 ปี จ.นครราชสีมา"
                  stroke="#F59E0B"
                  strokeWidth={2.2}
                  strokeDasharray="4 3"
                  dot={{ r: 3, fill: "#F59E0B" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT 6 COLS: 12-Month Agricultural Commodity Price Trends (Recharts ComposedChart) */}
        <div className="lg:col-span-6 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>แนวโน้มราคารับซื้อรายเดือนและส่วนต่างราคาท้องถิ่น (12 เดือน)</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {commodityMeta.nameTh} ({commodityMeta.unit})
              </h3>
            </div>

            <div className="text-right font-mono tabular-nums">
              <div className="text-xs text-slate-500 font-sans">
                ราคาเฉลี่ยใน {selectedDistrict.nameTh}
              </div>
              <div className="text-lg font-bold text-emerald-800 flex items-center justify-end gap-1.5">
                <span>
                  {formatPriceValue(priceStats.currentDistrictPrice)} {commodityMeta.unit}
                </span>
                <span
                  className={`text-xs font-semibold inline-flex items-center ${
                    priceStats.spreadVsProvincialPct >= 0
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {priceStats.spreadVsProvincialPct >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {priceStats.spreadVsProvincialPct > 0
                    ? `+${priceStats.spreadVsProvincialPct}%`
                    : `${priceStats.spreadVsProvincialPct}%`}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Summary KPI Micro-Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-white border border-slate-200/80 rounded-xl p-3 text-xs font-mono tabular-nums">
            <div>
              <div className="text-[11px] text-slate-500 font-sans">ราคาเฉลี่ยทั้งจังหวัด</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {formatPriceValue(commodityMeta.provincialAvgPrice)} {commodityMeta.unit}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-sans">เดือนที่ราคาสูงสุด</div>
              <div className="font-bold text-emerald-800 mt-0.5">
                {priceStats.peakMonth} ({formatPriceValue(priceStats.peakPrice)})
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-sans">คาดการณ์ปลายปี (ธ.ค.)</div>
              <div className="font-bold text-sky-800 mt-0.5">
                {formatPriceValue(priceStats.yearEndProjectedPrice)} {commodityMeta.unit}
              </div>
            </div>
          </div>

          {/* Recharts Monthly Commodity Price Trend ComposedChart */}
          <div className="h-[270px] w-full bg-[#080C16] border border-[#1E293B] rounded-xl p-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyPriceSeries}
                margin={{ top: 10, right: 12, left: -4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="selectedPriceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={{ stroke: "#1E293B" }}
                  tickLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B101D",
                    borderColor: "#14B8A6",
                    borderRadius: "10px",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#E2E8F0" }}
                  formatter={(value: unknown, name: unknown) => [
                    `${formatPriceValue(Number(value))} ${commodityMeta.unit}`,
                    String(name),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "6px", color: "#CBD5E1" }}
                  iconType="circle"
                />
                <ReferenceLine
                  y={commodityMeta.provincialAvgPrice}
                  stroke="#64748B"
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  dataKey="selectedPrice"
                  name={`ราคาใน ${selectedDistrict.nameTh}`}
                  stroke="#2DD4BF"
                  strokeWidth={2.6}
                  fill="url(#selectedPriceFill)"
                  dot={{ r: 3.5, fill: "#2DD4BF" }}
                />
                <Line
                  type="monotone"
                  dataKey="comparePrice"
                  name={`ราคาใน ${compareDistrict.nameTh}`}
                  stroke="#FBBF24"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: "#FBBF24" }}
                />
                <Line
                  type="monotone"
                  dataKey="provincialMean"
                  name="ค่าเฉลี่ยจังหวัดนครราชสีมา"
                  stroke="#818CF8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
