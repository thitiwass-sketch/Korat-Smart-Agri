import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  KoratDistrict,
  BuyingYardQuote,
  CommodityKey,
  KORAT_INPUT_BENCHMARKS,
} from "../data/koratAgriData";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Maximize2,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

export interface EvaluatedYardItem extends BuyingYardQuote {
  distanceKm: number;
  qualityAdjustmentPerUnit: number;
  effectivePricePerUnit: number;
  grossRevenueTotal: number;
  transportCostTotal: number;
  netPayoutTotal: number;
}

interface BuyingYardsRouteMapProps {
  selectedDistrict: KoratDistrict;
  evaluatedYards: EvaluatedYardItem[];
  bestYard: EvaluatedYardItem | null;
  commodityMeta: {
    key: CommodityKey;
    nameTh: string;
    unit: string;
    qualityLabel: string;
    qualityUnit: string;
    tonsMultiplier: number;
  };
  harvestTons: number;
  transportRatePerTonKm: number;
}

export const BuyingYardsRouteMap: React.FC<BuyingYardsRouteMapProps> = ({
  selectedDistrict,
  evaluatedYards,
  bestYard,
  commodityMeta,
  harvestTons,
  transportRatePerTonKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedYardId, setSelectedYardId] = useState<string | null>(
    bestYard?.id || (evaluatedYards[0]?.id ?? null)
  );
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(true);

  // Update selected yard when bestYard changes initially
  useEffect(() => {
    if (bestYard && !selectedYardId) {
      setSelectedYardId(bestYard.id);
    }
  }, [bestYard, selectedYardId]);

  // Selected yard details
  const activeYard = useMemo(() => {
    return evaluatedYards.find((y) => y.id === selectedYardId) || bestYard || evaluatedYards[0] || null;
  }, [evaluatedYards, selectedYardId, bestYard]);

  // Nearest local yard (usually within farmer's district or shortest distance)
  const nearestLocalYard = useMemo(() => {
    const sortedByDist = [...evaluatedYards].sort((a, b) => a.distanceKm - b.distanceKm);
    return sortedByDist[0] || null;
  }, [evaluatedYards]);

  // Diesel fuel benchmark from Korat database (default ~32.94 THB/liter)
  const dieselPricePerLiter = useMemo(() => {
    const dieselObj = KORAT_INPUT_BENCHMARKS.find((b) => b.nameTh.includes("ดีเซล"));
    return dieselObj ? dieselObj.priceBaht : 32.94;
  }, []);

  // Road Trip Economic Comparison: Local Nearest Yard vs Active Selected Yard
  const routeComparison = useMemo(() => {
    if (!activeYard || !nearestLocalYard) return null;

    const isSameAsNearest = activeYard.id === nearestLocalYard.id;

    // Fuel consumption estimate for 6-10 wheel agricultural truck loaded: ~3.8 - 4.2 km/liter
    const truckKmPerLiter = 4.0;
    const roundTripKm = activeYard.distanceKm * 2;
    const estDieselLiters = Math.round((roundTripKm / truckKmPerLiter) * 10) / 10;
    const estDieselCost = Math.round(estDieselLiters * dieselPricePerLiter);

    // Single-trip travel time for heavy agricultural truck (~45-50 km/h average on Korat rural highways)
    const truckAvgSpeedKmh = 48;
    const oneWayHours = activeYard.distanceKm / truckAvgSpeedKmh;
    const hours = Math.floor(oneWayHours);
    const minutes = Math.round((oneWayHours - hours) * 60);

    // Price difference per unit
    const unitPriceDiff = Number((activeYard.effectivePricePerUnit - nearestLocalYard.effectivePricePerUnit).toFixed(2));
    const grossRevenueDiff = activeYard.grossRevenueTotal - nearestLocalYard.grossRevenueTotal;
    const extraTransportCost = activeYard.transportCostTotal - nearestLocalYard.transportCostTotal;
    const netGainVsLocal = activeYard.netPayoutTotal - nearestLocalYard.netPayoutTotal;

    const isWorthTraveling = netGainVsLocal > 0;

    return {
      isSameAsNearest,
      roundTripKm,
      estDieselLiters,
      estDieselCost,
      travelTimeText: hours > 0 ? `${hours} ชม. ${minutes} นาที` : `${minutes} นาที`,
      unitPriceDiff,
      grossRevenueDiff,
      extraTransportCost,
      netGainVsLocal,
      isWorthTraveling,
    };
  }, [activeYard, nearestLocalYard, dieselPricePerLiter]);

  // Initialize or re-create Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [selectedDistrict.lat, selectedDistrict.lon],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Tile Layer based on mapStyle
    const tileUrl =
      mapStyle === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    const polylinesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    polylinesLayerRef.current = polylinesLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapStyle, selectedDistrict.id]);

  // Render markers and polylines when evaluatedYards or selectedYardId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const polylinesLayer = polylinesLayerRef.current;
    if (!map || !markersLayer || !polylinesLayer) return;

    markersLayer.clearLayers();
    polylinesLayer.clearLayers();

    const originLat = selectedDistrict.lat;
    const originLon = selectedDistrict.lon;

    // 1. Farmer's Origin Marker
    const originIcon = L.divIcon({
      className: "custom-farmer-origin-marker",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: rgba(20, 184, 166, 0.25); border: 1.5px solid #14B8A6; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background: #0F766E; border: 2.5px solid #2DD4BF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(45, 212, 191, 0.8);">
            <span style="font-size: 13px;">🚜</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const originMarker = L.marker([originLat, originLon], {
      icon: originIcon,
      zIndexOffset: 1000,
    }).addTo(markersLayer);

    originMarker.bindPopup(`
      <div style="color: #F8FAFC; background: #0B101D; padding: 10px; border-radius: 12px; font-family: sans-serif; font-size: 12px; min-width: 200px; border: 1px solid #14B8A6;">
        <div style="font-size: 10px; color: #2DD4BF; font-weight: bold; text-transform: uppercase;">📍 จุดตั้งแปลงเกษตรของคุณ</div>
        <div style="font-size: 14px; font-weight: bold; margin-top: 2px;">${selectedDistrict.nameTh}</div>
        <div style="font-size: 11px; color: #94A3B8; margin-top: 2px; font-family: monospace;">พิกัด: ${originLat.toFixed(4)}°N, ${originLon.toFixed(4)}°E</div>
        <div style="font-size: 11px; color: #E2E8F0; margin-top: 6px; border-top: 1px solid #1E293B; padding-top: 4px;">
          ผลผลิตที่จะขาย: <strong>${harvestTons} ตัน</strong> (${commodityMeta.nameTh})
        </div>
      </div>
    `);

    // 2. Buying Yards Markers and Route Lines
    evaluatedYards.forEach((yard, index) => {
      const isSelected = yard.id === selectedYardId;
      const isTopNetPayout = yard.id === bestYard?.id;
      const isTopBasePrice = index === 0;

      const markerColor = isTopNetPayout
        ? "#10B981" // Emerald Green for Best Net Payout
        : isTopBasePrice
        ? "#F59E0B" // Amber for Top Base Price
        : "#38BDF8"; // Sky Blue for regular yard

      const yardIcon = L.divIcon({
        className: `custom-yard-marker-${yard.id}`,
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isTopNetPayout
                ? `<div style="position: absolute; top: -18px; white-space: nowrap; background: #064E3B; border: 1px solid #10B981; color: #A7F3D0; font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    ★ เงินสุทธิสูงสุด
                   </div>`
                : ""
            }
            <div style="width: ${isSelected ? "34px" : "28px"}; height: ${isSelected ? "34px" : "28px"}; border-radius: 9999px; background: ${markerColor}; border: 2.5px solid ${isSelected ? "#FFFFFF" : "#0B101D"}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 ${isSelected ? "18px" : "8px"} ${markerColor}; transition: all 0.2s;">
              <span style="font-size: ${isSelected ? "15px" : "12px"};">🏭</span>
            </div>
            <div style="margin-top: 2px; background: rgba(11, 16, 29, 0.9); border: 1px solid rgba(255,255,255,0.15); color: #F8FAFC; font-size: 10px; font-weight: bold; padding: 1px 5px; border-radius: 6px; white-space: nowrap; max-width: 130px; overflow: hidden; text-overflow: ellipsis;">
              ${yard.districtName.replace("อ.", "")} · ฿${yard.effectivePricePerUnit.toFixed(2)}
            </div>
          </div>
        `,
        iconSize: [36, 44],
        iconAnchor: [18, 22],
      });

      const marker = L.marker([yard.lat, yard.lon], {
        icon: yardIcon,
        zIndexOffset: isSelected ? 900 : isTopNetPayout ? 800 : 500,
      }).addTo(markersLayer);

      marker.on("click", () => {
        setSelectedYardId(yard.id);
      });

      marker.bindPopup(`
        <div style="color: #F8FAFC; background: #0B101D; padding: 12px; border-radius: 12px; font-family: sans-serif; font-size: 12px; min-width: 250px; border: 1.5px solid ${markerColor}; box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-size: 10px; color: ${markerColor}; font-weight: bold; text-transform: uppercase;">
              ${yard.yardType}
            </span>
            ${isTopNetPayout ? '<span style="font-size: 10px; background: #064E3B; color: #A7F3D0; padding: 1px 6px; border-radius: 4px; font-weight: bold;">คุ้มค่าอันดับ 1</span>' : ""}
          </div>

          <div style="font-size: 14px; font-weight: bold; margin-top: 4px; color: #FFFFFF;">${yard.yardName}</div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">${yard.addressTh}</div>
          <div style="font-size: 10px; font-family: monospace; color: #64748B; margin-top: 2px;">พิกัด GPS: ${yard.lat.toFixed(4)}°N, ${yard.lon.toFixed(4)}°E</div>

          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #1E293B; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <div style="font-size: 10px; color: #94A3B8;">ราคาตามคุณภาพ</div>
              <div style="font-size: 14px; font-weight: bold; color: #2DD4BF; font-family: monospace;">฿${yard.effectivePricePerUnit.toFixed(2)} <span style="font-size: 10px; font-weight: normal;">${commodityMeta.unit}</span></div>
            </div>
            <div>
              <div style="font-size: 10px; color: #94A3B8;">เงินสุทธิ (${harvestTons} ตัน)</div>
              <div style="font-size: 14px; font-weight: bold; color: #FFFFFF; font-family: monospace;">฿${yard.netPayoutTotal.toLocaleString("th-TH")}</div>
            </div>
          </div>

          <div style="margin-top: 8px; font-size: 11px; color: #CBD5E1; background: #111827; padding: 6px 8px; border-radius: 8px;">
            🛣️ เส้นทาง: <strong>${yard.primaryHighwayRoute}</strong> (${yard.distanceKm} กม.)<br/>
            ⏱️ คิวรอเท: ~${yard.queueWaitHours.toFixed(1)} ชม. | โทร: ${yard.contactPhone || "-"}
          </div>

          <div style="margin-top: 10px; display: flex; gap: 6px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLon}&destination=${yard.lat},${yard.lon}&travelmode=driving" 
              target="_blank" 
              rel="noopener noreferrer"
              style="flex: 1; text-align: center; background: #14B8A6; color: #041E1C; font-weight: bold; font-size: 11px; padding: 6px 10px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
            >
              <span>🧭 เปิด Google Maps นำทาง</span>
            </a>
          </div>
        </div>
      `);

      // 3. Draw Connecting Route Polyline
      if (showAllRoutes || isSelected || isTopNetPayout) {
        const isFocusRoute = isSelected;
        const polyline = L.polyline(
          [
            [originLat, originLon],
            [yard.lat, yard.lon],
          ],
          {
            color: isFocusRoute ? "#2DD4BF" : isTopNetPayout ? "#10B981" : "#475569",
            weight: isFocusRoute ? 4 : isTopNetPayout ? 3 : 1.5,
            opacity: isFocusRoute ? 0.95 : isTopNetPayout ? 0.8 : 0.45,
            dashArray: isFocusRoute ? undefined : "6 6",
          }
        ).addTo(polylinesLayer);

        polyline.on("click", () => {
          setSelectedYardId(yard.id);
        });
      }
    });

    // Fit map bounds to show origin and selected/top yards comfortably
    const allCoords: [number, number][] = [
      [originLat, originLon],
      ...evaluatedYards.map((y) => [y.lat, y.lon] as [number, number]),
    ];
    if (allCoords.length > 1) {
      map.fitBounds(allCoords, { padding: [40, 40], maxZoom: 12 });
    }
  }, [
    selectedDistrict,
    evaluatedYards,
    selectedYardId,
    bestYard,
    commodityMeta,
    harvestTons,
    showAllRoutes,
  ]);

  return (
    <div className="space-y-4">
      {/* Top Map Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#080C16] border border-[#1E293B] rounded-2xl p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-bold font-mono">
            <Compass className="w-3.5 h-3.5" />
            พิกัด GPS &amp; เส้นทางคมนาคมขนส่งผลผลิตโคราช
          </span>
          <span className="text-xs text-slate-300">
            คำนวณระยะทางจาก: <strong className="text-white">{selectedDistrict.nameTh}</strong> ({selectedDistrict.lat.toFixed(4)}°N, {selectedDistrict.lon.toFixed(4)}°E)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAllRoutes((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              showAllRoutes
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {showAllRoutes ? "แสดงเส้นทางทั้งหมด" : "แสดงเฉพาะจุดที่เลือก"}
          </button>

          <button
            type="button"
            onClick={() => setMapStyle((prev) => (prev === "dark" ? "satellite" : "dark"))}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-[#101728] text-slate-200 border border-[#1E293B] hover:text-white transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>{mapStyle === "dark" ? "โหมดดาวเทียม" : "โหมดดาร์ก"}</span>
          </button>
        </div>
      </div>

      {/* Main Map Container & Interactive Road Trip Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Responsive Leaflet Route Map */}
        <div className="lg:col-span-8 bg-[#080C16] border border-[#1E293B] rounded-2xl p-2 sm:p-3 relative overflow-hidden shadow-2xl">
          <div
            ref={mapContainerRef}
            className="w-full h-[480px] sm:h-[530px] rounded-xl z-0"
            style={{ background: "#060911" }}
          />

          {/* Floating Map Legend Overlay */}
          <div className="absolute top-5 left-5 z-[500] bg-[#0B101D]/90 backdrop-blur-md border border-[#1E293B] rounded-xl p-2.5 space-y-1.5 text-[11px] shadow-xl pointer-events-auto">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <span>สัญลักษณ์บนแผนที่:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500 border border-teal-300 animate-pulse"></span>
              <span className="text-slate-300">แปลงของคุณ ({selectedDistrict.nameTh})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300"></span>
              <span className="text-slate-300">ลานอันดับ 1 (เงินสุทธิสูงสุด)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-200"></span>
              <span className="text-slate-300">ราคาหน้าโรงงานสูงสุด</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-400 border border-sky-200"></span>
              <span className="text-slate-300">ลานรับซื้อทั่วไป/สหกรณ์</span>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Economic Road Trip Deep Dive & Google Maps Action */}
        <div className="lg:col-span-4 space-y-3">
          {activeYard ? (
            <div className="bg-[#0B101D] border border-teal-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              {/* Header */}
              <div className="border-b border-[#1E293B] pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 rounded">
                    {activeYard.yardType}
                  </span>
                  {activeYard.id === bestYard?.id && (
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      แนะนำอันดับ 1
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white mt-2 leading-snug">
                  {activeYard.yardName}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeYard.addressTh}
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>
                    พิกัด GPS: {activeYard.lat.toFixed(4)}°N, {activeYard.lon.toFixed(4)}°E
                  </span>
                </div>
              </div>

              {/* Payout & Travel KPI Cards */}
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="bg-[#080C16] border border-teal-500/30 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-400 font-sans">
                    เงินสุทธิหลังหักค่ารถ
                  </div>
                  <div className="text-lg font-bold text-teal-300 mt-0.5">
                    ฿{activeYard.netPayoutTotal.toLocaleString("th-TH")}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    ({harvestTons} ตัน)
                  </div>
                </div>

                <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-400 font-sans">
                    ระยะทาง &amp; เวลาเดินทาง
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {activeYard.distanceKm}{" "}
                    <span className="text-xs font-normal text-slate-400">กม.</span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-sans">
                    ~{routeComparison?.travelTimeText}
                  </div>
                </div>
              </div>

              {/* Road Trip Viability Comparison (Local vs Remote Factory) */}
              {routeComparison && !routeComparison.isSameAsNearest && nearestLocalYard && (
                <div
                  className={`rounded-xl border p-3.5 space-y-2 text-xs ${
                    routeComparison.isWorthTraveling
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-amber-950/30 border-amber-500/40 text-amber-200"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {routeComparison.isWorthTraveling ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>วิเคราะห์: คุ้มค่าการเดินทางวิ่งข้ามอำเภอ!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>วิเคราะห์: ไม่คุ้มค่าเดินทาง แนะนำขายลานใกล้บ้าน</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-1 text-[11px] leading-relaxed text-slate-300">
                    <div>
                      • เปรียบเทียบกับลานใกล้บ้าน{" "}
                      <strong>{nearestLocalYard.yardName}</strong> ({nearestLocalYard.distanceKm} กม.)
                    </div>
                    <div>
                      • รายได้เพิ่มจากราคาส่วนต่าง:{" "}
                      <strong className="text-emerald-300">
                        +฿{routeComparison.grossRevenueDiff.toLocaleString("th-TH")}
                      </strong>
                    </div>
                    <div>
                      • ค่าขนส่งและค่าน้ำมันส่วนเกิน:{" "}
                      <strong className="text-amber-300">
                        -฿{routeComparison.extraTransportCost.toLocaleString("th-TH")}
                      </strong>{" "}
                      (ดีเซล ~{routeComparison.estDieselLiters} ลิตร)
                    </div>
                    <div className="pt-1 border-t border-white/10 font-bold font-mono text-sm">
                      กำไรสุทธิส่วนเพิ่มจริง:{" "}
                      <span
                        className={
                          routeComparison.netGainVsLocal >= 0
                            ? "text-emerald-300"
                            : "text-rose-400"
                        }
                      >
                        {routeComparison.netGainVsLocal >= 0 ? "+" : ""}฿
                        {routeComparison.netGainVsLocal.toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Highway Route & Logistics Info */}
              <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3 space-y-1.5 text-xs">
                <div className="text-slate-400">
                  🛣️ <strong>เส้นทางหลัก:</strong>{" "}
                  <span className="text-slate-200">{activeYard.primaryHighwayRoute}</span>
                </div>
                <div className="text-slate-400">
                  ⏱️ <strong>คิวรอเทเฉลี่ย:</strong>{" "}
                  <span className="text-slate-200">~{activeYard.queueWaitHours.toFixed(1)} ชั่วโมง</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>📞 <strong>เบอร์ติดต่อ:</strong> {activeYard.contactPhone || "-"}</span>
                  <span className="text-[11px] font-mono text-slate-400">{activeYard.operatingHoursTh || "06:00 - 18:00 น."}</span>
                </div>
              </div>

              {/* Open Google Maps Direction CTA */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${selectedDistrict.lat},${selectedDistrict.lon}&destination=${activeYard.lat},${activeYard.lon}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>เปิด Google Maps นำทาง GPS ไปยังโรงงานนี้</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          ) : (
            <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-6 text-center text-xs text-slate-400">
              แตะที่หมุดโรงงานบนแผนที่เพื่อดูข้อมูลพิกัดและเส้นทาง
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
