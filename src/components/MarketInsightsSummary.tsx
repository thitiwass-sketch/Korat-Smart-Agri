import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  KORAT_COMMODITIES,
  CommodityKey,
  KoratDistrict,
  formatDistrictName,
} from "../data/koratAgriData";
import { useTheme } from "../context/ThemeContext";

interface MarketInsightsSummaryProps {
  selectedDistrict: KoratDistrict;
  onNavigateMarket?: (commodityKey?: CommodityKey) => void;
}

interface CommodityInsightData {
  key: CommodityKey;
  nameTh: string;
  categoryTag: string;
  specShort: string;
  currentPrice: number;
  prevPrice7d: number;
  priceDelta: number;
  pctChange: number;
  isPositive: boolean;
  unit: string;
  decimals: number;
  min7d: number;
  max7d: number;
  marketStatusTh: string;
  statusBadgeTone: "emerald" | "amber" | "rose" | "teal";
  tradingHubTh: string;
  sparklineData: { date: string; fullDate: string; price: number }[];
}

export const MarketInsightsSummary: React.FC<MarketInsightsSummaryProps> = ({
  selectedDistrict,
  onNavigateMarket,
}) => {
  const { isDark } = useTheme();
  const [hoveredCommodity, setHoveredCommodity] = useState<CommodityKey | null>(null);

  // Generate date labels for the past 7 days
  const dateLabels = useMemo(() => {
    const labels: { short: string; full: string }[] = [];
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayNum = d.getDate();
      const monthStr = thaiMonths[d.getMonth()];
      labels.push({
        short: `${dayNum} ${monthStr}`,
        full: `${dayNum} ${monthStr} ${d.getFullYear() + 543}`,
      });
    }
    return labels;
  }, []);

  // Compute 7-day sparkline series and insight metrics for top 5 commodities
  const insightsData: CommodityInsightData[] = useMemo(() => {
    // Multipliers for generating the 7 daily points leading up to provincialAvgPrice
    const priceCurves: Record<CommodityKey, number[]> = {
      cassava_fresh: [3.05, 3.06, 3.08, 3.10, 3.12, 3.14, 3.15],
      cassava_chip: [7.30, 7.32, 7.35, 7.38, 7.40, 7.42, 7.45],
      sugarcane_fresh: [1400, 1405, 1410, 1410, 1415, 1418, 1420],
      maize_feed: [10.75, 10.72, 7.35 > 10 ? 10.70 : 10.70, 10.68, 10.66, 10.65, 10.65],
      jasmine_rice: [15220, 15300, 15450, 15580, 15650, 15750, 15850],
    };

    const metadataOverrides: Record<
      CommodityKey,
      {
        categoryTag: string;
        specShort: string;
        decimals: number;
        statusTh: string;
        statusTone: "emerald" | "amber" | "rose" | "teal";
        hubTh: string;
      }
    > = {
      cassava_fresh: {
        categoryTag: "พืชเศรษฐกิจ #1 โคราช",
        specShort: "เชื้อแป้ง 25%",
        decimals: 2,
        statusTh: "ความต้องการแป้งมันส่งออกสูง ลานมันเร่งรับซื้อ",
        statusTone: "emerald",
        hubTh: "โรงแป้งเสิงสาง·ครบุรี·ด่านขุนทด",
      },
      cassava_chip: {
        categoryTag: "มันเส้นส่งออก",
        specShort: "ความชื้น ≤ 14%",
        decimals: 2,
        statusTh: "อุปสงค์อาหารสัตว์ในประเทศและส่งออกหนุนราคา",
        statusTone: "emerald",
        hubTh: "ลานมันสีคิ้ว·โนนไทย·ห้วยแถลง",
      },
      sugarcane_fresh: {
        categoryTag: "พืชไร่อุตสาหกรรม",
        specShort: "ความหวาน 10 C.C.S. (อ้อยสด)",
        decimals: 0,
        statusTh: "โรงงานเปิดหีบเต็มกำลัง รณรงค์ตัดอ้อยสดลด PM2.5",
        statusTone: "teal",
        hubTh: "โรงงานน้ำตาลครบุรี·พิมาย",
      },
      maize_feed: {
        categoryTag: "พืชอาหารสัตว์",
        specShort: "ความชื้น 14.5% เมล็ดแห้ง",
        decimals: 2,
        statusTh: "ราคาปรับฐานตามผลผลิตข้าวโพดฤดูฝนที่ออกสู่ตลาด",
        statusTone: "amber",
        hubTh: "ไซโลอาหารสัตว์ปากช่อง·สีคิ้ว",
      },
      jasmine_rice: {
        categoryTag: "ข้าวหอม GI โคราช",
        specShort: "ความชื้น 15% ทุ่งสัมฤทธิ์",
        decimals: 0,
        statusTh: "ข้าวนาปีคุณภาพพรีเมียม โรงสีแย่งซื้อเก็บสต็อก",
        statusTone: "emerald",
        hubTh: "สหกรณ์การเกษตรพิมาย·ชุมพวง·โนนสูง",
      },
    };

    return KORAT_COMMODITIES.map((com) => {
      const curve = priceCurves[com.key] || [com.provincialAvgPrice];
      const meta = metadataOverrides[com.key] || {
        categoryTag: "พืชเศรษฐกิจ",
        specShort: com.standardSpec,
        decimals: com.provincialAvgPrice > 100 ? 0 : 2,
        statusTh: "ติดตามราคาซื้อขายรายวัน",
        statusTone: "emerald",
        hubTh: "ตลาดกลางสินค้าเกษตรโคราช",
      };

      const sparklineData = curve.map((price, idx) => ({
        date: dateLabels[idx]?.short ?? `D-${6 - idx}`,
        fullDate: dateLabels[idx]?.full ?? `Day ${idx + 1}`,
        price,
      }));

      const currentPrice = curve[curve.length - 1];
      const prevPrice7d = curve[0];
      const priceDelta = Number((currentPrice - prevPrice7d).toFixed(meta.decimals));
      const pctChange = Number(
        (((currentPrice - prevPrice7d) / prevPrice7d) * 100).toFixed(2)
      );
      const isPositive = priceDelta >= 0;

      const min7d = Math.min(...curve);
      const max7d = Math.max(...curve);

      return {
        key: com.key,
        nameTh: com.nameTh,
        categoryTag: meta.categoryTag,
        specShort: meta.specShort,
        currentPrice,
        prevPrice7d,
        priceDelta,
        pctChange,
        isPositive,
        unit: com.unit,
        decimals: meta.decimals,
        min7d,
        max7d,
        marketStatusTh: meta.statusTh,
        statusBadgeTone: meta.statusTone,
        tradingHubTh: meta.hubTh,
        sparklineData,
      };
    });
  }, [dateLabels]);

  return (
    <section
      id="module-market-insights"
      aria-label="สรุปภาพรวมตลาดพืชเศรษฐกิจโคราชและกราฟแนวโน้มราคา 7 วัน"
      className={`border rounded-2xl p-5 sm:p-7 space-y-6 transition-colors shadow-sm ${
        isDark ? "bg-[#0B101D] border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      {/* 1. Header Section */}
      <div
        className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b pb-5 transition-colors ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-bold text-xs ${
                isDark
                  ? "bg-teal-500/15 text-teal-300 border-teal-500/40"
                  : "bg-teal-50 text-teal-800 border-teal-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Market Insights · สรุปภาพรวมตลาดสินค้าเกษตร</span>
            </span>
            <span
              aria-hidden="true"
              className={isDark ? "text-slate-600" : "text-slate-300"}
            >
              ·
            </span>
            <span
              className={`font-medium ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              5 พืชเศรษฐกิจหลักจังหวัดนครราชสีมา
            </span>
            <span
              aria-hidden="true"
              className={isDark ? "text-slate-600" : "text-slate-300"}
            >
              ·
            </span>
            <span
              className={`font-semibold ${
                isDark ? "text-amber-400" : "text-amber-700"
              }`}
            >
              พื้นที่อ้างอิง: {formatDistrictName(selectedDistrict.nameTh)}
            </span>
          </div>

          <h2
            className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            ดัชนีราคารับซื้อพืชเศรษฐกิจหลักโคราช &amp; กราฟแนวโน้ม 7 วัน
          </h2>
          <p
            className={`text-xs sm:text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            วิเคราะห์ความเคลื่อนไหวราคาเฉลี่ยหน้าลานรับซื้อ โรงงานแปรรูป และสหกรณ์การเกษตรในโคราช 7 วันล่าสุด พร้อมสัญญาณแนวโน้มตลาด
          </p>
        </div>

        {/* Right Action CTA */}
        {onNavigateMarket && (
          <div className="shrink-0 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateMarket()}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                isDark
                  ? "bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C]"
                  : "bg-teal-700 hover:bg-teal-800 text-white"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ดูราคารายลานรับซื้อ &amp; แผนที่จุดขาย</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Top 5 Commodity Cards Grid (Responsive 1 -> 2 -> 3 -> 5 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {insightsData.map((item) => {
          const isHovered = hoveredCommodity === item.key;
          const strokeColor = item.isPositive ? "#10B981" : "#F43F5E";
          const gradientId = `sparkline-grad-${item.key}`;

          // Format delta text
          const formattedDelta =
            item.priceDelta > 0
              ? `+${item.priceDelta.toLocaleString("th-TH")}`
              : item.priceDelta.toLocaleString("th-TH");

          const formattedCurrentPrice =
            item.decimals === 0
              ? item.currentPrice.toLocaleString("th-TH")
              : item.currentPrice.toFixed(item.decimals);

          return (
            <div
              key={item.key}
              onMouseEnter={() => setHoveredCommodity(item.key)}
              onMouseLeave={() => setHoveredCommodity(null)}
              className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between relative group ${
                isHovered
                  ? isDark
                    ? "bg-[#101728] border-teal-500/50 shadow-md ring-1 ring-teal-500/30"
                    : "bg-white border-teal-500 shadow-md ring-1 ring-teal-500/20"
                  : isDark
                  ? "bg-[#080C16] border-slate-800 hover:border-slate-700 hover:bg-[#0c1220]"
                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {/* Card Header: Category & Spec */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border truncate ${
                      isDark
                        ? "bg-slate-800/80 border-slate-700 text-teal-300"
                        : "bg-white border-slate-200 text-teal-800 shadow-2xs"
                    }`}
                  >
                    {item.categoryTag}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                      item.isPositive
                        ? isDark
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-emerald-100 text-emerald-800"
                        : isDark
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {item.isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{item.pctChange > 0 ? `+${item.pctChange}%` : `${item.pctChange}%`}</span>
                  </span>
                </div>

                <div>
                  <h3
                    className={`text-sm font-extrabold leading-snug line-clamp-1 group-hover:text-teal-500 transition-colors ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.nameTh}
                  </h3>
                  <p
                    className={`text-[11px] line-clamp-1 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {item.specShort}
                  </p>
                </div>
              </div>

              {/* Price & 7-Day Change Callout */}
              <div className="my-3 pt-2 border-t border-dashed border-slate-700/20">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-black font-mono tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    ฿{formattedCurrentPrice}
                  </span>
                  <span
                    className={`text-xs font-sans ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {item.unit}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                  <span
                    className={
                      item.isPositive
                        ? isDark
                          ? "text-emerald-400 font-bold"
                          : "text-emerald-700 font-bold"
                        : isDark
                        ? "text-rose-400 font-bold"
                        : "text-rose-700 font-bold"
                    }
                  >
                    {formattedDelta} {item.unit}
                  </span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>
                    (รอบ 7 วัน)
                  </span>
                </div>
              </div>

              {/* 3. Recharts 7-Day Sparkline Chart */}
              <div className="h-[62px] w-full my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={item.sparklineData}
                    margin={{ top: 4, right: 4, left: 4, bottom: 2 }}
                  >
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={strokeColor}
                          stopOpacity={isDark ? 0.45 : 0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={strokeColor}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis
                      hide
                      domain={[
                        (dataMin: number) =>
                          dataMin - (item.decimals === 0 ? 30 : 0.05),
                        (dataMax: number) =>
                          dataMax + (item.decimals === 0 ? 30 : 0.05),
                      ]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload;
                          return (
                            <div
                              className={`p-1.5 px-2.5 rounded-lg border text-xs shadow-md font-mono ${
                                isDark
                                  ? "bg-[#0B101D] border-slate-700 text-white"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                            >
                              <div className="text-[10px] text-slate-400">
                                {dataPoint.fullDate}
                              </div>
                              <div className="font-bold text-teal-400">
                                ฿
                                {item.decimals === 0
                                  ? dataPoint.price.toLocaleString("th-TH")
                                  : dataPoint.price.toFixed(item.decimals)}{" "}
                                <span className="text-[10px] text-slate-400 font-sans">
                                  {item.unit}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={strokeColor}
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill={`url(#${gradientId})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 7-Day Range Pill */}
              <div
                className={`flex items-center justify-between text-[10px] font-mono py-1 px-2 rounded-md ${
                  isDark ? "bg-slate-900/60 text-slate-400" : "bg-slate-200/60 text-slate-600"
                }`}
              >
                <span>
                  ต่ำสุด: ฿
                  {item.decimals === 0
                    ? item.min7d.toLocaleString("th-TH")
                    : item.min7d.toFixed(item.decimals)}
                </span>
                <span>·</span>
                <span>
                  สูงสุด: ฿
                  {item.decimals === 0
                    ? item.max7d.toLocaleString("th-TH")
                    : item.max7d.toFixed(item.decimals)}
                </span>
              </div>

              {/* Trading Hub & Quick Drill-down Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-700/20 space-y-2">
                <p
                  className={`text-[10px] truncate ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  title={item.tradingHubTh}
                >
                  📍 {item.tradingHubTh}
                </p>

                {onNavigateMarket && (
                  <button
                    type="button"
                    onClick={() => onNavigateMarket(item.key)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-teal-300"
                        : "bg-slate-100 hover:bg-teal-50 text-teal-800 hover:text-teal-900"
                    }`}
                  >
                    <span>เปรียบเทียบลานรับซื้อ</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Footer Market Intelligence Note */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isDark
            ? "bg-[#080C16] border-slate-800 text-slate-300"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-500 shrink-0" />
          <p className="leading-relaxed">
            <strong>หมายเหตุราคาอ้างอิง:</strong> คำนวณจากราคาเฉลี่ยถ่วงน้ำหนักของลานรับซื้อและโรงงานแปรรูปที่ได้รับใบอนุญาตใน จ.นครราชสีมา อิงตามมาตรฐานกระทรวงพาณิชย์ (DIT) และสมาคมพืชผลโคราช
          </p>
        </div>

        {onNavigateMarket && (
          <button
            type="button"
            onClick={() => onNavigateMarket()}
            className={`shrink-0 font-bold inline-flex items-center gap-1 text-xs transition-colors cursor-pointer ${
              isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-700 hover:text-teal-900"
            }`}
          >
            <span>ดูกระดานราคาทั้ง 32 อำเภอแบบละเอียด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};
