import React, { useEffect, useState, useMemo } from "react";
import { KORAT_DISTRICTS, KoratDistrict, KoratGeoPlotPin, formatDistrictName } from "../data/koratAgriData";
import {
  getDistrictSoilSeriesMeta,
  SOIL_SERIES_METADATA,
} from "../data/koratSoilDatabase";
import { KoratLeafletMap, MapOverlayMode } from "./KoratLeafletMap";
import { DistrictThresholdConfiguratorCard } from "./ThresholdAlertSystem";
import { useThresholdAlertStore } from "../utils/thresholdAlertStore";
import {
  RefreshCw,
  MapPin,
  CloudRain,
  ThermometerSun,
  Wind,
  Cloud,
  Droplets,
  AlertTriangle,
  Layers,
  BellRing,
  Sparkles,
  CheckCircle2,
  Compass,
  Sliders,
  Eye,
  Activity,
  FlaskConical,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface DailyForecastPoint {
  date: string;
  tempMax: number;
  tempMin: number;
  rainProb: number;
  rainMmP10: number;
  rainMmP50: number;
  rainMmP90: number;
  et0Mm: number;
  windMaxKmh: number;
}

interface WeatherApiResponse {
  source: string;
  districtId: string;
  districtNameTh: string;
  coordinates: { lat: number; lon: number };
  spi14d: number;
  spi30d: number;
  projected14dRainMm: number;
  normal30dRainMm: number;
  days: DailyForecastPoint[];
}

interface WeatherForecastModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict: (districtId: string) => void;
  plots: KoratGeoPlotPin[];
  onAddPlotPin: (newPlot: KoratGeoPlotPin) => void;
}

type WeatherIconType =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "light_rain"
  | "heavy_rain"
  | "thunder_rain";

const WeatherSvgIcon: React.FC<{
  type: WeatherIconType;
  className?: string;
}> = ({ type, className = "w-6 h-6" }) => {
  if (type === "sunny") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="7" fill="#FBBF24" />
        <g stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round">
          <line x1="16" y1="3.5" x2="16" y2="6.2" />
          <line x1="16" y1="25.8" x2="16" y2="28.5" />
          <line x1="3.5" y1="16" x2="6.2" y2="16" />
          <line x1="25.8" y1="16" x2="28.5" y2="16" />
          <line x1="7.2" y1="7.2" x2="9.1" y2="9.1" />
          <line x1="22.9" y1="22.9" x2="24.8" y2="24.8" />
          <line x1="24.8" y1="7.2" x2="22.9" y2="9.1" />
          <line x1="9.1" y1="22.9" x2="7.2" y2="24.8" />
        </g>
      </svg>
    );
  }

  if (type === "partly_cloudy") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="19.5" cy="11.5" r="5" fill="#FBBF24" />
        <g stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round">
          <line x1="19.5" y1="3.5" x2="19.5" y2="5.2" />
          <line x1="27.5" y1="11.5" x2="25.8" y2="11.5" />
          <line x1="25.1" y1="5.9" x2="23.8" y2="7.2" />
          <line x1="13.9" y1="5.9" x2="15.2" y2="7.2" />
          <line x1="25.1" y1="17.1" x2="23.8" y2="15.8" />
        </g>
        <path
          d="M10.5 23.5H21.5C24.26 23.5 26.5 21.26 26.5 18.5C26.5 15.96 24.6 13.86 22.14 13.54C21.25 10.64 18.56 8.5 15.35 8.5C11.43 8.5 8.25 11.68 8.25 15.6C8.25 15.78 8.26 15.95 8.28 16.12C6.68 16.72 5.5 18.25 5.5 20.05C5.5 21.96 7.04 23.5 8.95 23.5H10.5Z"
          fill="#F8FAFC"
        />
      </svg>
    );
  }

  if (type === "cloudy") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path
          d="M9.5 23.5H22.2C25.13 23.5 27.5 21.13 27.5 18.2C27.5 15.51 25.49 13.28 22.88 12.94C21.94 9.86 19.08 7.6 15.68 7.6C11.52 7.6 8.15 10.97 8.15 15.13C8.15 15.32 8.16 15.5 8.18 15.68C6.48 16.32 5.25 17.94 5.25 19.85C5.25 21.87 6.88 23.5 8.9 23.5H9.5Z"
          fill="#F1F5F9"
        />
      </svg>
    );
  }

  if (type === "light_rain") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path
          d="M9.5 20.5H22.2C24.85 20.5 27 18.35 27 15.7C27 13.26 25.18 11.24 22.81 10.93C21.96 8.14 19.37 6.1 16.3 6.1C12.53 6.1 9.48 9.15 9.48 12.92C9.48 13.09 9.49 13.25 9.51 13.42C7.97 14 6.85 15.46 6.85 17.2C6.85 19.02 8.33 20.5 10.15 20.5H9.5Z"
          fill="#F8FAFC"
        />
        <g stroke="#38BDF8" strokeWidth="2.1" strokeLinecap="round">
          <line x1="13" y1="23" x2="11.5" y2="27" />
          <line x1="19.5" y1="23" x2="18" y2="27" />
        </g>
      </svg>
    );
  }

  if (type === "thunder_rain") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path
          d="M9.5 20H22.2C24.85 20 27 17.85 27 15.2C27 12.76 25.18 10.74 22.81 10.43C21.96 7.64 19.37 5.6 16.3 5.6C12.53 5.6 9.48 8.65 9.48 12.42C9.48 12.59 9.49 12.75 9.51 12.92C7.97 13.5 6.85 14.96 6.85 16.7C6.85 18.52 8.33 20 10.15 20H9.5Z"
          fill="#E2E8F0"
        />
        <path
          d="M16.5 18.5L13.5 23.5H16.5L15.2 28.5L20.2 22.5H17L16.5 18.5Z"
          fill="#FBBF24"
        />
        <g stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
          <line x1="10.8" y1="22.5" x2="9.5" y2="26.2" />
          <line x1="22.8" y1="22.5" x2="21.5" y2="26.2" />
        </g>
      </svg>
    );
  }

  // heavy_rain default
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <path
        d="M9.5 20.2H22.2C24.85 20.2 27 18.05 27 15.4C27 12.96 25.18 10.94 22.81 10.63C21.96 7.84 19.37 5.8 16.3 5.8C12.53 5.8 9.48 8.85 9.48 12.62C9.48 12.79 9.49 12.95 9.51 13.12C7.97 13.7 6.85 15.16 6.85 16.9C6.85 18.72 8.33 20.2 10.15 20.2H9.5Z"
        fill="#F8FAFC"
      />
      <g stroke="#38BDF8" strokeWidth="2.1" strokeLinecap="round">
        <line x1="11.5" y1="22.8" x2="10" y2="27.2" />
        <line x1="16.5" y1="22.8" x2="15" y2="27.2" />
        <line x1="21.5" y1="22.8" x2="20" y2="27.2" />
      </g>
    </svg>
  );
};

export const WeatherForecastModule: React.FC<WeatherForecastModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  plots,
  onAddPlotPin,
}) => {
  const { isDark } = useTheme();
  const [mapLayer, setMapLayer] = useState<MapOverlayMode>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem("korat_weather_map_layer");
        if (
          saved &&
          [
            "rainfall_intensity",
            "humidity_heatmap",
            "soil_moisture",
            "drought_spi",
            "soil_ph_npk",
            "rain_prob",
          ].includes(saved)
        ) {
          return saved as MapOverlayMode;
        }
      } catch (e) {
        console.warn("Could not read weather map layer from localStorage", e);
      }
    }
    return "rainfall_intensity";
  });

  const handleUpdateMapLayer = (mode: MapOverlayMode) => {
    setMapLayer(mode);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("korat_weather_map_layer", mode);
      } catch (e) {
        console.warn("Could not write weather map layer to localStorage", e);
      }
    }
  };
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  // Hourly strip metric mode (matches IMG_1864 top-right 3-icon switcher)
  const [hourlyStripMetric, setHourlyStripMetric] = useState<"temp" | "rain" | "wind">("temp");

  // Temperature curve mode (matches IMG_1865 segmented control: ที่แท้จริง vs รู้สึกเหมือน)
  const [tempMode, setTempMode] = useState<"actual" | "feels_like">("actual");
  const [showThresholdPanel, setShowThresholdPanel] = useState<boolean>(true);
  const { currentBreaches } = useThresholdAlertStore(selectedDistrict);

  const fetchSpatialWeather = async (districtId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather/korat?districtId=${encodeURIComponent(districtId)}`);
      if (res.ok) {
        const json: WeatherApiResponse = await res.json();
        setWeatherData(json);
        setSelectedDayIdx(0);
      }
    } catch {
      // Fallback handled by initial district state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpatialWeather(selectedDistrict.id);
  }, [selectedDistrict.id]);

  const getWeatherIconForProb = (prob: number, hour?: number): WeatherIconType => {
    if (prob >= 75) return "thunder_rain";
    if (prob >= 55) return "heavy_rain";
    if (prob >= 35) return "light_rain";
    if (prob >= 22) return "cloudy";
    if (hour !== undefined && (hour >= 19 || hour <= 5)) return "cloudy";
    if (prob >= 12) return "partly_cloudy";
    return "sunny";
  };

  const getSkyConditionText = (prob: number): string => {
    if (prob >= 75) return "ฝนฟ้าคะนองกระจาย";
    if (prob >= 55) return "มีฝนตกปานกลางถึงหนักบางแห่ง";
    if (prob >= 35) return "มีโอกาสเกิดฝนฟ้าคะนองบางส่วน";
    if (prob >= 20) return "เมฆเป็นบางส่วน";
    return "ท้องฟ้าโปร่ง แดดจัด";
  };

  const formatDayRowLabel = (isoDate: string, idx: number): { dayName: string; shortDate: string } => {
    try {
      const d = new Date(isoDate);
      const shortDate = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      if (idx === 0) return { dayName: "วันนี้", shortDate };
      const weekdayMap = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
      return {
        dayName: weekdayMap[d.getDay()] || isoDate,
        shortDate,
      };
    } catch {
      return { dayName: idx === 0 ? "วันนี้" : `วันที่ +${idx}`, shortDate: "" };
    }
  };

  const formatCalendarInitial = (isoDate: string): { initial: string; dayNum: string; fullThaiDate: string } => {
    try {
      const d = new Date(isoDate);
      const initials = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
      const fullDayNames = [
        "วันอาทิตย์",
        "วันจันทร์",
        "วันอังคาร",
        "วันพุธ",
        "วันพฤหัสบดี",
        "วันศุกร์",
        "วันเสาร์",
      ];
      const fullMonthNames = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];
      const buddhistYear = d.getFullYear() + 543;
      return {
        initial: initials[d.getDay()],
        dayNum: String(d.getDate()),
        fullThaiDate: `${fullDayNames[d.getDay()]}ที่ ${d.getDate()} ${fullMonthNames[d.getMonth()]} ${buddhistYear}`,
      };
    } catch {
      return { initial: "จ", dayNum: "1", fullThaiDate: isoDate };
    }
  };

  const getSpiCategoryText = (spi: number) => {
    if (spi <= -1.5)
      return {
        label: "แล้งรุนแรง (Severe Drought)",
        tone: "text-red-400",
        badgeBg: "bg-red-500/15 text-red-400 border-red-500/40",
      };
    if (spi <= -1.0)
      return {
        label: "ฝนทิ้งช่วง/แล้งปานกลาง (Moderate Drought)",
        tone: "text-[#FBBF24]",
        badgeBg: "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/40",
      };
    if (spi < 0.5)
      return {
        label: "ใกล้เคียงค่าปกติ (Near Normal)",
        tone: "text-[#2DD4BF]",
        badgeBg: "bg-[#14B8A6]/15 text-[#2DD4BF] border-[#14B8A6]/40",
      };
    return {
      label: "ชุ่มชื้นกว่าปกติ (Moderately Wet)",
      tone: "text-[#38BDF8]",
      badgeBg: "bg-sky-500/15 text-[#38BDF8] border-sky-500/40",
    };
  };

  const activeSpi30 = weatherData?.spi30d ?? selectedDistrict.spi30d;
  const activeSpi14 = weatherData?.spi14d ?? selectedDistrict.spi14d;
  const spiStatus = getSpiCategoryText(activeSpi30);

  const activeDays: DailyForecastPoint[] = useMemo(() => {
    if (weatherData?.days && weatherData.days.length > 0) {
      return weatherData.days;
    }
    return Array.from({ length: 14 }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      const prob =
        idx === 0
          ? selectedDistrict.rainProbToday
          : Math.max(
              15,
              Math.min(90, selectedDistrict.rainProbToday + ((idx * 17) % 45) - 22)
            );
      const p50 = Number((prob >= 45 ? (prob - 25) * 0.36 : prob >= 25 ? 2.4 : 0.0).toFixed(1));
      return {
        date: d.toISOString().split("T")[0],
        tempMax: Math.round(selectedDistrict.maxTempC - (idx % 3) * 0.8 + (idx % 2) * 0.5),
        tempMin: Math.round(selectedDistrict.minTempC - (idx % 2) * 0.7),
        rainProb: Math.round(prob / 5) * 5,
        rainMmP10: Number((p50 * 0.35).toFixed(1)),
        rainMmP50: p50,
        rainMmP90: Number((p50 * 1.85 + (prob >= 40 ? 4.2 : 0.8)).toFixed(1)),
        et0Mm: Number((4.6 - prob * 0.012).toFixed(1)),
        windMaxKmh: Number((16 + (idx % 5) * 2.5).toFixed(1)),
      };
    });
  }, [weatherData, selectedDistrict]);

  const focusedDay = activeDays[selectedDayIdx] || activeDays[0];

  // Global 14-day min & max temperature for accurate horizontal range bars (like IMG_1864)
  const globalTempBounds = useMemo(() => {
    const mins = activeDays.map((d) => d.tempMin);
    const maxs = activeDays.map((d) => d.tempMax);
    return {
      min: Math.min(...mins) - 1,
      max: Math.max(...maxs) + 1,
    };
  }, [activeDays]);

  // Synthesize realistic 24-hour curve for the selected day (00:00 to 23:00)
  const hourlySeries24 = useMemo(() => {
    const minT = focusedDay.tempMin + (tempMode === "feels_like" ? 1.8 : 0);
    const maxT = focusedDay.tempMax + (tempMode === "feels_like" ? 2.6 : 0);
    const span = Math.max(3, maxT - minT);

    // Diurnal temperature weights from 00:00 to 23:00 (trough at 05:00-06:00, peak at 13:00-15:00)
    const diurnalFactors = [
      0.22, 0.16, 0.11, 0.07, 0.03, 0.0, 0.05, 0.22, 0.45, 0.66, 0.82, 0.93,
      0.98, 1.0, 0.99, 0.94, 0.82, 0.65, 0.5, 0.42, 0.36, 0.32, 0.28, 0.24,
    ];

    // Tropical Korat afternoon/evening convective rainfall distribution
    const rainWeights = [
      0.25, 0.2, 0.15, 0.15, 0.15, 0.2, 0.3, 0.32, 0.25, 0.2, 0.22, 0.28,
      0.35, 0.65, 0.85, 0.95, 1.0, 0.95, 0.88, 0.72, 0.45, 0.3, 0.25, 0.2,
    ];

    return Array.from({ length: 24 }, (_, hour) => {
      const temp = Number((minT + span * diurnalFactors[hour]).toFixed(1));
      const rawRainProb = Math.min(
        100,
        Math.max(
          0,
          Math.round((focusedDay.rainProb * rainWeights[hour] * 1.15) / 5) * 5
        )
      );
      const rainMm =
        rawRainProb >= 30
          ? Number(((focusedDay.rainMmP50 / 8) * rainWeights[hour]).toFixed(1))
          : 0;
      const windKmh = Number(
        (focusedDay.windMaxKmh * (0.55 + 0.45 * diurnalFactors[hour])).toFixed(0)
      );

      return {
        hour,
        label: hour === 7 && selectedDayIdx === 0 ? "ตอนนี้" : `${hour}`,
        timeStr: `${String(hour).padStart(2, "0")}:00`,
        temp: Math.round(temp),
        tempExact: temp,
        rainProb: rawRainProb,
        rainMm,
        windKmh,
        icon: getWeatherIconForProb(rawRainProb, hour),
      };
    });
  }, [focusedDay, selectedDayIdx, tempMode]);

  // Slice for the top hourly strip (starts at 07:00 "ตอนนี้" through 20:00 like IMG_1864)
  const hourlyStripItems = useMemo(() => {
    const startHr = 7;
    return hourlySeries24.slice(startHr, startHr + 13).map((item, idx) => ({
      ...item,
      displayLabel: idx === 0 && selectedDayIdx === 0 ? "ตอนนี้" : `${item.hour}`,
    }));
  }, [hourlySeries24, selectedDayIdx]);

  // Current display temperature (at 07:00-08:00 morning or mean)
  const currentHeadlineTemp = hourlySeries24[7]?.temp ?? Math.round((focusedDay.tempMax + focusedDay.tempMin) / 2);

  // Normalize SPI (-2.5 to +2.5) to percentage (0% to 100%) for scale bar
  const spiMarkerLeftPct = Math.min(96, Math.max(4, ((activeSpi30 + 2.5) / 5) * 100));

  // SVG Geometry for Chart 1 (24-Hour Temperature Curve — IMG_1865)
  const tempSvgW = 560;
  const tempSvgH = 195;
  const chartPadLeft = 14;
  const chartPadRight = 44;
  const chartPadTop = 36;
  const chartPadBottom = 26;
  const plotW = tempSvgW - chartPadLeft - chartPadRight;
  const plotH = tempSvgH - chartPadTop - chartPadBottom;

  const tempAxisMin = 18;
  const tempAxisMax = 38;
  const getTempX = (hourIdx: number) => chartPadLeft + (hourIdx / 23) * plotW;
  const getTempY = (val: number) =>
    chartPadTop +
    plotH -
    ((Math.min(tempAxisMax, Math.max(tempAxisMin, val)) - tempAxisMin) /
      (tempAxisMax - tempAxisMin)) *
      plotH;

  // Find peak & trough indices for "สูงสุด" and "ต่ำสุด" markers on the curve
  const maxHourItem = useMemo(
    () =>
      hourlySeries24.reduce(
        (best, cur) => (cur.tempExact > best.tempExact ? cur : best),
        hourlySeries24[0]
      ),
    [hourlySeries24]
  );
  const minHourItem = useMemo(
    () =>
      hourlySeries24.reduce(
        (best, cur) => (cur.tempExact < best.tempExact ? cur : best),
        hourlySeries24[0]
      ),
    [hourlySeries24]
  );

  const tempPointsAll = hourlySeries24
    .map((pt) => `${getTempX(pt.hour)},${getTempY(pt.tempExact)}`)
    .join(" ");
  const tempPointsFuture = hourlySeries24
    .slice(6)
    .map((pt) => `${getTempX(pt.hour)},${getTempY(pt.tempExact)}`)
    .join(" ");
  const tempAreaPolygon = `${getTempX(0)},${chartPadTop + plotH} ${tempPointsAll} ${getTempX(23)},${chartPadTop + plotH}`;

  // SVG Geometry for Chart 2 (24-Hour Rain Probability Curve — IMG_1865)
  const rainSvgW = 560;
  const rainSvgH = 175;
  const rainPadTop = 18;
  const rainPadBottom = 26;
  const rainPlotH = rainSvgH - rainPadTop - rainPadBottom;
  const getRainX = (hourIdx: number) => chartPadLeft + (hourIdx / 23) * plotW;
  const getRainY = (probPct: number) =>
    rainPadTop + rainPlotH - (Math.min(100, Math.max(0, probPct)) / 100) * rainPlotH;

  const rainPointsActive = hourlySeries24
    .slice(selectedDayIdx === 0 ? 6 : 0)
    .map((pt) => `${getRainX(pt.hour)},${getRainY(pt.rainProb)}`)
    .join(" ");
  const rainStartHour = selectedDayIdx === 0 ? 6 : 0;
  const rainAreaPolygon = `${getRainX(rainStartHour)},${rainPadTop + rainPlotH} ${rainPointsActive} ${getRainX(23)},${rainPadTop + rainPlotH}`;

  const selectedCalendarMeta = formatCalendarInitial(focusedDay.date);

  // Computed spatial weather metrics for the selected district
  const districtRh = Math.min(
    94,
    Math.max(46, Math.round(selectedDistrict.gistdaSoilMoisturePct * 0.85 + focusedDay.rainProb * 0.38))
  );
  const districtRain24h = focusedDay.rainMmP50;
  const districtSoilMoisture = selectedDistrict.gistdaSoilMoisturePct;

  const currentLayerInfo = useMemo(() => {
    const isRain = mapLayer === "rainfall_intensity" || mapLayer === "rain_prob";
    const isHumidity = mapLayer === "humidity_heatmap";
    const isSoil = mapLayer === "soil_moisture";
    const isSoilSeries = mapLayer === "soil_series";
    const isNpk = mapLayer === "soil_ph_npk";

    if (isRain) {
      const isExtreme = districtRain24h >= 25 || focusedDay.rainProb >= 70;
      const isModerate = focusedDay.rainProb >= 40 || districtRain24h >= 8;
      return {
        key: "rainfall_intensity" as const,
        labelTh: "Rainfall Intensity (ความเข้มข้นของฝน)",
        labelEn: "Precipitation & 24h Radar Intensity",
        icon: CloudRain,
        districtValue: `${districtRain24h} มม. (โอกาส ${focusedDay.rainProb}%)`,
        districtStatusTh: isExtreme
          ? "ฝนตกหนักมาก พายุฟ้าคะนอง"
          : isModerate
          ? "ฝนตกปานกลาง ตกกระจายตัว"
          : "ฝนน้อย สภาพอากาศแห้งโปร่ง",
        statusTone: isExtreme
          ? "text-purple-400 bg-purple-950/60 border-purple-800"
          : isModerate
          ? "text-cyan-400 bg-cyan-950/60 border-cyan-800"
          : "text-amber-400 bg-amber-950/60 border-amber-800",
        advisoryTh:
          "คำแนะนำการเพาะปลูก: ตรวจสอบคันนาและร่องระบายน้ำแปลงมันสำปะหลัง/ข้าวโพด หากมีโอกาสฝนเกิน 50% ให้ชะลอการใส่ปุ๋ยเม็ดบนผิวดินและการฉีดพ่นสารเคมี เพื่อป้องกันการสูญเสียจากการชะล้าง",
        gradientBar:
          "linear-gradient(90deg, #F59E0B 0%, #10B981 25%, #38BDF8 55%, #6366F1 80%, #EC4899 100%)",
        minLabel: "ฝนเบาบาง (<2 มม.)",
        maxLabel: "ฝนตกหนักมาก (>40 มม./พายุ)",
        dotColor: isExtreme ? "#8B5CF6" : isModerate ? "#38BDF8" : "#F59E0B",
      };
    }

    if (isHumidity) {
      const isHigh = districtRh >= 78;
      const isModerate = districtRh >= 62;
      return {
        key: "humidity_heatmap" as const,
        labelTh: "Humidity Heatmap (แผนที่ความชื้นสัมพัทธ์ในอากาศ)",
        labelEn: "Surface Air Relative Humidity (RH%)",
        icon: Wind,
        districtValue: `${districtRh}% RH`,
        districtStatusTh: isHigh
          ? "ความชื้นสูงมาก อากาศอิ่มตัวไอน้ำ"
          : isModerate
          ? "ความชื้นปานกลาง สมดุลชีวเคมีพืชดี"
          : "ความชื้นต่ำ อากาศแห้งสบาย",
        statusTone: isHigh
          ? "text-indigo-400 bg-indigo-950/60 border-indigo-800"
          : isModerate
          ? "text-teal-400 bg-teal-950/60 border-teal-800"
          : "text-amber-400 bg-amber-950/60 border-amber-800",
        advisoryTh:
          "คำแนะนำการเพาะปลูก: ความชื้นสัมพัทธ์ในอากาศ (RH) สูงกว่า 75% ร่วมกับอุณหภูมิอบอ้าว เป็นปัจจัยเร่งการระบาดของโรคราสนิม ราน้ำค้างในข้าวโพด และใบไหม้ในมันสำปะหลัง ควรตัดแต่งทรงพุ่มให้อากาศถ่ายเทสะดวก",
        gradientBar:
          "linear-gradient(90deg, #F59E0B 0%, #14B8A6 45%, #0EA5E9 75%, #6366F1 100%)",
        minLabel: "แห้งโปร่ง (<50% RH)",
        maxLabel: "ชื้นจัด (>85% RH ฝนชุก)",
        dotColor: isHigh ? "#6366F1" : isModerate ? "#06B6D4" : "#F59E0B",
      };
    }

    if (isSoil) {
      const isDry = districtSoilMoisture < 28;
      const isWatch = districtSoilMoisture < 40;
      const isWet = districtSoilMoisture > 52;
      return {
        key: "soil_moisture" as const,
        labelTh: "Soil Moisture Map (แผนที่ความชื้นในดิน)",
        labelEn: "GISTDA Root-Zone Soil Moisture (%)",
        icon: Droplets,
        districtValue: `${districtSoilMoisture}%`,
        districtStatusTh: isDry
          ? "วิกฤตดินแห้งแล้งจัด ขาดน้ำรุนแรง"
          : isWatch
          ? "เฝ้าระวังดินแห้ง ชื้นต่ำกว่าเกณฑ์"
          : isWet
          ? "ดินชุ่มน้ำ/อิ่มตัวสูง งดการให้น้ำ"
          : "ความชื้นเหมาะสมสำหรับพืชไร่/พืชสวน",
        statusTone: isDry
          ? "text-red-400 bg-red-950/60 border-red-800"
          : isWatch
          ? "text-amber-400 bg-amber-950/60 border-amber-800"
          : isWet
          ? "text-sky-400 bg-sky-950/60 border-sky-800"
          : "text-emerald-400 bg-emerald-950/60 border-emerald-800",
        advisoryTh:
          "คำแนะนำการเพาะปลูก: ความชื้นในดินจากดาวเทียม GISTDA ระดับรากพืช 0-20 ซม. สามารถใช้วางแผนระบบน้ำหยด/มินิสปริงเกลอร์ หากเกิน 45% ให้ปิดระบบน้ำเพื่อลดต้นทุนค่าไฟและน้ำมันสูบน้ำ",
        gradientBar:
          "linear-gradient(90deg, #DC2626 0%, #F59E0B 35%, #14B8A6 70%, #38BDF8 100%)",
        minLabel: "แห้งจัด (<25%)",
        maxLabel: "ชื้นอิ่มตัว (>55%)",
        dotColor: isDry ? "#DC2626" : isWatch ? "#F59E0B" : isWet ? "#38BDF8" : "#10B981",
      };
    }

    if (isSoilSeries) {
      const sMeta = getDistrictSoilSeriesMeta(selectedDistrict.id);
      return {
        key: "soil_series" as const,
        labelTh: "Soil Series Classifications (แผนที่จำแนกกลุ่มชุดดินโคราช & ร้อยเอ็ด)",
        labelEn: "Soil Series Taxonomy & Suitability Map",
        icon: Layers,
        districtValue: `${sMeta.nameTh} (${sMeta.code})`,
        districtStatusTh: sMeta.primaryTextureTh,
        statusTone: "text-amber-300 bg-amber-950/60 border-amber-700",
        advisoryTh: `ชุดดินประจำพื้นที่ ${formatDistrictName(selectedDistrict.nameTh)}: ${sMeta.descriptionTh} พืชที่เหมาะสมสูง: ${sMeta.suitableCropsTh.join(", ")}`,
        gradientBar:
          "linear-gradient(90deg, #F59E0B 0%, #06B6D4 20%, #3B82F6 40%, #E11D48 60%, #EA580C 80%, #84CC16 100%)",
        minLabel: "ชุดดินโคราช (Kt) / ร้อยเอ็ด (Re)",
        maxLabel: "ชุดดินบะซอลต์ / วาริน-ปากช่อง",
        dotColor: sMeta.colorHex,
      };
    }

    if (isNpk) {
      const ph = selectedDistrict.defaultSoilTest.soilPh;
      const om = selectedDistrict.defaultSoilTest.omPercent;
      const p = selectedDistrict.defaultSoilTest.availPPpm;
      const k = selectedDistrict.defaultSoilTest.exchKPpm;
      const phStatus =
        ph < 5.2
          ? "ดินกรดจัดมาก"
          : ph < 5.8
          ? "ดินกรดปานกลาง"
          : ph <= 6.8
          ? "กรดอ่อน-เป็นกลาง (เหมาะสม)"
          : "ดินด่างอ่อน";
      return {
        key: "soil_ph_npk" as const,
        labelTh: "pH ดิน & N-P-K (ธาตุอาหารพืชและกรด-ด่างดิน)",
        labelEn: "Soil Chemical Profile & Tailored Fertilizer Database",
        icon: FlaskConical,
        districtValue: `pH ${ph.toFixed(1)} (${phStatus})`,
        districtStatusTh: `OM: ${om}% · P: ${p} ppm · K: ${k} ppm`,
        statusTone: "text-purple-400 bg-purple-950/60 border-purple-800",
        advisoryTh:
          `คำแนะนำการเพาะปลูก: ค่าความเป็นกรด-ด่าง (pH ${ph.toFixed(1)}) ใน ${formatDistrictName(selectedDistrict.nameTh)} บน${selectedDistrict.soilSeriesName} หากต่ำกว่า 5.5 ควรปรับปรุงด้วยปูนโดโลไมท์ 100-150 กก./ไร่ และใช้สูตรปุ๋ยสั่งตัดแม่นยำตามระดับ N-P-K เพื่อลดต้นทุนปุ๋ยเคมี 25-35%`,
        gradientBar:
          "linear-gradient(90deg, #E11D48 0%, #F59E0B 40%, #10B981 70%, #6366F1 100%)",
        minLabel: "กรดจัด (pH <5.0)",
        maxLabel: "ด่างอ่อน (pH >7.0)",
        dotColor: "#A855F7",
      };
    }

    // Drought SPI default
    return {
      key: "drought_spi" as const,
      labelTh: "Drought Index SPI (ดรรชนีภัยแล้งมาตรฐาน)",
      labelEn: "Standardized Precipitation Index (SPI-30d)",
      icon: ThermometerSun,
      districtValue: `SPI ${activeSpi30 > 0 ? `+${activeSpi30}` : activeSpi30}`,
      districtStatusTh: spiStatus.label,
      statusTone: `${spiStatus.tone} ${spiStatus.badgeBg}`,
      advisoryTh:
        "คำแนะนำการเพาะปลูก: ดรรชนี SPI ประเมินความผิดปกติของปริมาณฝนสะสม 30 วัน หากค่าต่ำกว่า -1.0 ควรผันน้ำเข้าสระกักเก็บน้ำประจำแปลงเพื่อเตรียมพร้อมก่อนเข้าสู่ภาวะแล้งจัด",
      gradientBar:
        "linear-gradient(90deg, #DC2626 0%, #F59E0B 45%, #14B8A6 100%)",
      minLabel: "แล้งจัด (-1.8)",
      maxLabel: "ชุ่มชื้น (+0.5)",
      dotColor: activeSpi30 <= -1.0 ? "#DC2626" : "#10B981",
    };
  }, [mapLayer, districtRain24h, focusedDay.rainProb, districtRh, districtSoilMoisture, activeSpi30, spiStatus]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b pb-5 transition-colors ${
        isDark ? "border-[#1E293B]" : "border-slate-200"
      }`}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`font-medium px-2.5 py-1 rounded-md text-xs border ${
                isDark
                  ? "bg-[#14B8A6]/15 text-[#2DD4BF] border-[#14B8A6]/40"
                  : "bg-teal-50 text-teal-800 border-teal-300"
              }`}
            >
              TMD Spatial API &amp; NASA POWER
            </span>
            <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-slate-400"}>
              ·
            </span>
            <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              ระบบพยากรณ์อากาศและปริมาณฝนรายชั่วโมง-รายวัน
            </span>
            <span aria-hidden="true" className={isDark ? "text-slate-500" : "text-slate-400"}>
              ·
            </span>
            <span
              className={`font-mono tabular-nums font-semibold ${
                isDark ? "text-[#FBBF24]" : "text-amber-700"
              }`}
            >
              พิกัด {selectedDistrict.lat.toFixed(4)}°N, {selectedDistrict.lon.toFixed(4)}°E
            </span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            พยากรณ์ปริมาณฝน อุณหภูมิรายชั่วโมง และแผนที่พื้นที่เสี่ยงภัยแล้งเรียลไทม์
          </h2>
        </div>

        <div className="btn-group-mobile w-full lg:w-auto shrink-0">
          <div
            className={`border rounded-xl px-3.5 py-2 flex items-center justify-center gap-2 transition-colors w-full sm:w-auto min-h-[44px] ${
              isDark
                ? "bg-[#12192B] border-[#26354D]"
                : "bg-white border-slate-300 shadow-2xs"
            }`}
          >
            <MapPin
              className={`w-3.5 h-3.5 shrink-0 ${
                isDark ? "text-[#2DD4BF]" : "text-teal-700"
              }`}
            />
            <select
              value={selectedDistrict.id}
              onChange={(e) => onSelectDistrict(e.target.value)}
              aria-label="เลือกอำเภอที่ต้องการดูพยากรณ์อากาศ"
              className={`text-xs font-semibold bg-transparent focus:outline-none cursor-pointer w-full text-center sm:text-left ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              {KORAT_DISTRICTS.map((dist) => (
                <option
                  key={dist.id}
                  value={dist.id}
                  className={
                    isDark
                      ? "bg-[#12192B] text-slate-100"
                      : "bg-white text-slate-900"
                  }
                >
                  {formatDistrictName(dist.nameTh)} — โอกาสฝน {dist.rainProbToday}%
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowThresholdPanel((prev) => !prev)}
            className={`btn-mobile-full text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              showThresholdPanel
                ? "bg-[#F59E0B] text-slate-950 border-[#FBBF24]"
                : isDark
                ? "bg-[#12192B] text-[#FBBF24] border-[#F59E0B]/60 hover:bg-[#F59E0B]/20"
                : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
            }`}
          >
            <BellRing className="w-3.5 h-3.5 shrink-0 mr-1.5" />
            <span className="truncate">
              {showThresholdPanel
                ? "ซ่อนแผงตั้งเกณฑ์แจ้งเตือน"
                : "ตั้งเกณฑ์แจ้งเตือนฝน·ความชื้นดิน"}
            </span>
            {currentBreaches.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono shrink-0 ml-1.5">
                {currentBreaches.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => fetchSpatialWeather(selectedDistrict.id)}
            className={`btn-mobile-full text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? "text-[#2DD4BF] bg-[#14B8A6]/12 border-[#14B8A6]/60 hover:bg-[#14B8A6]/25"
                : "text-teal-900 bg-teal-50 border-teal-300 hover:bg-teal-100"
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 shrink-0 mr-1.5 ${
                loading
                  ? `animate-spin ${isDark ? "text-[#2DD4BF]" : "text-teal-700"}`
                  : ""
              }`}
            />
            <span className="truncate">อัปเดตเรดาร์ฝนล่าสุด</span>
          </button>
        </div>
      </div>

      {/* Custom District Rainfall & Soil Moisture Threshold Alert Configurator */}
      {showThresholdPanel && (
        <div id="threshold-alert-configurator" className="scroll-mt-24">
          <DistrictThresholdConfiguratorCard
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
            liveSoilMoisturePct={selectedDistrict.gistdaSoilMoisturePct}
            liveRainProbPct={focusedDay.rainProb}
            liveRain14dMm={
              weatherData?.projected14dRainMm ?? selectedDistrict.forecastRain14dMm
            }
          />
        </div>
      )}

      {/* STUDIOCHECK DARK TELEMETRY METEOROLOGICAL & RAINFALL FORECAST WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 6 COLS: StudioCheck Obsidian Hourly Strip & 10-Day Temperature/Rainfall Bar Table */}
        <div className="xl:col-span-6 rounded-2xl overflow-hidden shadow-lg border border-[#1E293B] bg-[#0B101D] text-white p-5 sm:p-6 flex flex-col justify-between space-y-5">
          {/* Top District Telemetry Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#2DD4BF]">
                <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>พื้นที่ติดตามสภาพอากาศเกษตรกรรม · {selectedDistrict.zone}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {selectedDistrict.nameTh}
              </h3>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                สูงสุด: <strong className="text-[#FBBF24]">{focusedDay.tempMax}°</strong> &nbsp;·&nbsp; ต่ำสุด:{" "}
                <strong className="text-slate-200">{focusedDay.tempMin}°</strong> &nbsp;·&nbsp; โอกาสเกิดฝน{" "}
                <strong className="text-[#2DD4BF]">{focusedDay.rainProb}%</strong> ({focusedDay.rainMmP50} มม.)
              </div>
            </div>

            <div className="bg-[#080C16] border border-[#1E293B] rounded-2xl px-4 py-3 flex items-center gap-3 self-start sm:self-center">
              <WeatherSvgIcon
                type={getWeatherIconForProb(focusedDay.rainProb, 13)}
                className="w-9 h-9 shrink-0"
              />
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#FBBF24] leading-none">
                  {currentHeadlineTemp}°C
                </div>
                <div className="text-xs text-[#2DD4BF] font-semibold mt-1">
                  {getSkyConditionText(focusedDay.rainProb)}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Card 1: Hourly Weather & Rainfall Strip (สภาพอากาศรายชั่วโมง) */}
          <div className="rounded-2xl bg-[#080C16] border border-[#1E293B] p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ThermometerSun className="w-4 h-4 text-[#FBBF24]" />
                  <span>สภาพอากาศรายชั่วโมง</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {hourlyStripMetric === "temp"
                    ? "อุณหภูมิรายชั่วโมง (°C) และโอกาสเกิดฝน"
                    : hourlyStripMetric === "rain"
                    ? "โอกาสเกิดฝน (%) และปริมาณฝนคาดการณ์ (มม.)"
                    : "ความเร็วลมระดับแปลงเพาะปลูก (กม./ชม.)"}
                </div>
              </div>

              {/* 3-Icon Mode Switcher in StudioCheck Cyber Teal style */}
              <div className="inline-flex items-center bg-[#0E1525] p-1 rounded-full border border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setHourlyStripMetric("temp")}
                  title="อุณหภูมิ (°C)"
                  className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 text-xs ${
                    hourlyStripMetric === "temp"
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setHourlyStripMetric("rain")}
                  title="โอกาสและปริมาณฝน"
                  className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 text-xs ${
                    hourlyStripMetric === "rain"
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setHourlyStripMetric("wind")}
                  title="ความเร็วลม"
                  className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 text-xs ${
                    hourlyStripMetric === "wind"
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Hourly Strip */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 pt-1">
              {hourlyStripItems.map((hr, idx) => {
                const isNowSlot = idx === 0 && selectedDayIdx === 0;
                return (
                  <div
                    key={hr.hour}
                    className={`flex flex-col items-center justify-between min-w-[50px] py-2 px-1.5 rounded-xl border transition-colors shrink-0 ${
                      isNowSlot
                        ? "bg-[#141E36] border-[#2DD4BF]/70 shadow-[0_0_12px_rgba(45,212,191,0.12)]"
                        : "bg-[#0E1525]/80 border-[#1E293B] hover:border-[#2DD4BF]/40 hover:bg-[#141D30]"
                    }`}
                  >
                    <span
                      className={`text-xs font-mono font-semibold whitespace-nowrap ${
                        isNowSlot ? "text-[#2DD4BF]" : "text-slate-300"
                      }`}
                    >
                      {hr.displayLabel}
                    </span>

                    <div className="my-2 flex flex-col items-center">
                      <WeatherSvgIcon type={hr.icon} className="w-6 h-6" />
                      {hr.rainProb >= 30 && hourlyStripMetric !== "rain" && (
                        <span className="text-[10px] font-mono tabular-nums font-bold text-[#2DD4BF] mt-0.5">
                          {hr.rainProb}%
                        </span>
                      )}
                    </div>

                    {hourlyStripMetric === "temp" && (
                      <span className="text-sm font-bold font-mono tabular-nums text-white">
                        {hr.temp}°
                      </span>
                    )}
                    {hourlyStripMetric === "rain" && (
                      <div className="text-center font-mono tabular-nums">
                        <div className="text-xs font-bold text-[#2DD4BF]">{hr.rainProb}%</div>
                        <div className="text-[10px] text-slate-400">{hr.rainMm}มม.</div>
                      </div>
                    )}
                    {hourlyStripMetric === "wind" && (
                      <div className="text-center font-mono tabular-nums">
                        <div className="text-xs font-bold text-[#FBBF24]">{hr.windKmh}</div>
                        <div className="text-[10px] text-slate-400">กม./ชม.</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Card 2: 10-Day Rainfall & Temperature Range Bar Table in Obsidian Theme */}
          <div className="rounded-2xl bg-[#080C16] border border-[#1E293B] p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] text-xs">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#2DD4BF]">
                <CloudRain className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>ตารางพยากรณ์ปริมาณฝนและอุณหภูมิล่วงหน้า (คลิกเลือกวัน)</span>
              </span>
              <span className="font-mono tabular-nums text-slate-400">
                โอกาสฝน (%) · ปริมาณฝน · ช่วงอุณหภูมิ
              </span>
            </div>

            <div className="divide-y divide-[#1E293B]/70 mt-1">
              {activeDays.slice(0, 10).map((day, idx) => {
                const { dayName, shortDate } = formatDayRowLabel(day.date, idx);
                const isSelected = idx === selectedDayIdx;
                const iconType = getWeatherIconForProb(day.rainProb, 14);

                // Compute horizontal bar start % and width %
                const totalSpan = Math.max(1, globalTempBounds.max - globalTempBounds.min);
                const leftPct = Math.max(
                  0,
                  Math.min(85, ((day.tempMin - globalTempBounds.min) / totalSpan) * 100)
                );
                const widthPct = Math.max(
                  14,
                  Math.min(100 - leftPct, ((day.tempMax - day.tempMin) / totalSpan) * 100)
                );

                // Current temp dot position for "วันนี้"
                const currentDotPct = Math.max(
                  leftPct + 4,
                  Math.min(
                    leftPct + widthPct - 4,
                    ((currentHeadlineTemp - globalTempBounds.min) / totalSpan) * 100
                  )
                );

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`w-full py-2.5 px-2.5 grid grid-cols-12 items-center gap-2 text-left transition-all rounded-xl ${
                      isSelected
                        ? "bg-[#141E36] ring-1 ring-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.12)]"
                        : "hover:bg-[#111827]"
                    }`}
                  >
                    {/* Col 1-3: Day Name & Short Date */}
                    <div className="col-span-3 flex items-baseline gap-1.5">
                      <span
                        className={`text-sm font-bold truncate ${
                          isSelected ? "text-[#2DD4BF]" : "text-white"
                        }`}
                      >
                        {dayName}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        {shortDate}
                      </span>
                    </div>

                    {/* Col 4-5: Weather Icon + Cyber Teal Rain Probability % */}
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      <WeatherSvgIcon type={iconType} className="w-6 h-6" />
                      {day.rainProb >= 20 ? (
                        <span className="text-[11px] font-mono tabular-nums font-bold text-[#2DD4BF] leading-tight">
                          {day.rainProb}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono tabular-nums text-slate-500 leading-tight">
                          ท้องฟ้าโปร่ง
                        </span>
                      )}
                    </div>

                    {/* Col 6-7: Expected Rainfall (mm) */}
                    <div className="col-span-2 text-right pr-2 font-mono tabular-nums">
                      <div className="text-xs font-semibold text-slate-100">
                        {day.rainMmP50}{" "}
                        <span className="text-[10px] font-normal text-slate-400">มม.</span>
                      </div>
                      <div className="text-[10px] text-slate-500 hidden sm:block">
                        P90: {day.rainMmP90}
                      </div>
                    </div>

                    {/* Col 8-12: Min Temp + Horizontal Range Bar + Max Temp */}
                    <div className="col-span-5 flex items-center gap-2.5">
                      <span className="text-sm font-semibold font-mono tabular-nums text-slate-400 w-8 text-right">
                        {day.tempMin}°
                      </span>

                      <div className="flex-1 h-1.5 rounded-full bg-[#162033] relative overflow-hidden">
                        <div
                          className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#14B8A6] via-[#FBBF24] to-[#F59E0B]"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }}
                        />
                        {idx === 0 && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-[#080C16]"
                            style={{ left: `${currentDotPct}%` }}
                          />
                        )}
                      </div>

                      <span className="text-sm font-bold font-mono tabular-nums text-[#FBBF24] w-8">
                        {day.tempMax}°
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: StudioCheck Dark Obsidian 24-Hour Telemetry Curve Inspector */}
        <div className="xl:col-span-6 rounded-2xl overflow-hidden shadow-lg border border-[#1E293B] bg-[#0B101D] text-white p-5 sm:p-6 flex flex-col justify-between space-y-5">
          {/* Top Calendar Day Selector Strip */}
          <div className="space-y-3 border-b border-[#1E293B] pb-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <Cloud className="w-4 h-4 text-[#2DD4BF]" />
                <span>กราฟสภาพอากาศและโอกาสเกิดฝนรายชั่วโมง</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-[#FBBF24] font-semibold">
                {selectedDistrict.nameTh}
              </span>
            </div>

            {/* 8-Day Calendar Selector Circles */}
            <div className="grid grid-cols-8 gap-1.5 pt-1 text-center">
              {activeDays.slice(0, 8).map((d, idx) => {
                const cal = formatCalendarInitial(d.date);
                const isSelected = idx === selectedDayIdx;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`flex flex-col items-center gap-1.5 py-1.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-[#141E36] border-[#2DD4BF]"
                        : "bg-[#080C16] border-[#1E293B] hover:border-[#6366F1]/60"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        isSelected ? "text-[#2DD4BF]" : "text-slate-400"
                      }`}
                    >
                      {cal.initial}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono tabular-nums transition-colors ${
                        isSelected
                          ? "bg-[#14B8A6] text-[#041E1C] font-bold shadow-xs"
                          : "text-slate-200"
                      }`}
                    >
                      {cal.dayNum}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-center text-xs font-mono font-semibold text-[#2DD4BF] pt-0.5">
              {selectedCalendarMeta.fullThaiDate}
            </div>
          </div>

          {/* Selected Day Summary & 24-Hour Temperature Curve */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold font-mono tabular-nums text-white tracking-tight">
                  {selectedDayIdx === 0 ? currentHeadlineTemp : focusedDay.tempMax}°
                </span>
                <WeatherSvgIcon
                  type={getWeatherIconForProb(focusedDay.rainProb, 13)}
                  className="w-10 h-10"
                />
                <div className="text-xs font-mono tabular-nums text-slate-300 space-y-0.5">
                  <div>
                    ↑: <strong className="text-[#FBBF24]">{focusedDay.tempMax}°</strong> &nbsp;↓:{" "}
                    <strong className="text-[#2DD4BF]">{focusedDay.tempMin}°</strong>
                  </div>
                  <div className="text-slate-400 font-sans">
                    การคายระเหยน้ำของพืช (ET₀): {focusedDay.et0Mm} มม./วัน
                  </div>
                </div>
              </div>

              {/* Segmented Toggle: ที่แท้จริง vs รู้สึกเหมือน */}
              <div className="inline-flex items-center bg-[#080C16] p-1 rounded-xl border border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setTempMode("actual")}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors ${
                    tempMode === "actual"
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                      : "text-slate-400 hover:text-white font-medium"
                  }`}
                >
                  ที่แท้จริง
                </button>
                <button
                  type="button"
                  onClick={() => setTempMode("feels_like")}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors ${
                    tempMode === "feels_like"
                      ? "bg-[#14B8A6] text-[#041E1C] font-bold"
                      : "text-slate-400 hover:text-white font-medium"
                  }`}
                >
                  รู้สึกเหมือน
                </button>
              </div>
            </div>

            {/* Hourly Icons Ribbon + 24-Hour Warm Amber Temperature Curve SVG */}
            <div className="rounded-2xl bg-[#080C16] border border-[#1E293B] p-3">
              {/* 12 two-hourly weather icons row */}
              <div className="grid grid-cols-12 gap-1 pb-2 border-b border-[#1E293B] pr-8">
                {hourlySeries24
                  .filter((_, i) => i % 2 === 0)
                  .map((slot) => (
                    <div key={slot.hour} className="flex flex-col items-center">
                      <WeatherSvgIcon type={slot.icon} className="w-4 h-4" />
                    </div>
                  ))}
              </div>

              <svg
                viewBox={`0 0 ${tempSvgW} ${tempSvgH}`}
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="กราฟอุณหภูมิรายชั่วโมง 24 ชั่วโมง"
              >
                <defs>
                  <linearGradient id="koratTempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#D97706" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#080C16" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal Degree Gridlines (18° to 36°) */}
                {[36, 33, 30, 27, 24, 21, 18].map((deg) => {
                  const y = getTempY(deg);
                  return (
                    <g key={deg}>
                      <line
                        x1={chartPadLeft}
                        y1={y}
                        x2={tempSvgW - chartPadRight}
                        y2={y}
                        stroke="#1E293B"
                        strokeWidth="1"
                      />
                      <text
                        x={tempSvgW - chartPadRight + 8}
                        y={y + 4}
                        className="text-[11px] font-mono fill-slate-400"
                      >
                        {deg}°
                      </text>
                    </g>
                  );
                })}

                {/* Vertical 6-hour Dividers (0, 6, 12, 18) */}
                {[0, 6, 12, 18].map((hr) => {
                  const x = getTempX(hr);
                  return (
                    <g key={hr}>
                      <line
                        x1={x}
                        y1={chartPadTop - 10}
                        x2={x}
                        y2={chartPadTop + plotH}
                        stroke="#1E293B"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={x + 4}
                        y={tempSvgH - 6}
                        className="text-[11px] font-mono fill-slate-400"
                      >
                        {hr}:00
                      </text>
                    </g>
                  );
                })}

                {/* Warm Amber Area Fill under Temperature Curve */}
                <polygon points={tempAreaPolygon} fill="url(#koratTempAreaGrad)" />

                {/* Past hours dashed line + Future solid Warm Amber line */}
                <polyline
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  points={tempPointsAll}
                />
                <polyline
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={tempPointsFuture}
                />

                {/* Peak ("สูงสุด") Marker */}
                <g>
                  <text
                    x={getTempX(maxHourItem.hour)}
                    y={getTempY(maxHourItem.tempExact) - 11}
                    textAnchor="middle"
                    className="text-[11px] fill-[#FBBF24] font-semibold"
                  >
                    สูงสุด {maxHourItem.temp}°
                  </text>
                  <circle
                    cx={getTempX(maxHourItem.hour)}
                    cy={getTempY(maxHourItem.tempExact)}
                    r="4.5"
                    fill="#080C16"
                    stroke="#FBBF24"
                    strokeWidth="2.5"
                  />
                </g>

                {/* Trough ("ต่ำสุด") Marker */}
                <g>
                  <text
                    x={getTempX(minHourItem.hour)}
                    y={getTempY(minHourItem.tempExact) - 11}
                    textAnchor="middle"
                    className="text-[11px] fill-[#2DD4BF] font-medium"
                  >
                    ต่ำสุด {minHourItem.temp}°
                  </text>
                  <circle
                    cx={getTempX(minHourItem.hour)}
                    cy={getTempY(minHourItem.tempExact)}
                    r="4.5"
                    fill="#080C16"
                    stroke="#2DD4BF"
                    strokeWidth="2.5"
                  />
                </g>

                {/* Current Hour Dot on Today */}
                {selectedDayIdx === 0 && (
                  <circle
                    cx={getTempX(6)}
                    cy={getTempY(hourlySeries24[6].tempExact)}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#080C16"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* 24-Hour Rain Probability & Ensemble Precipitation Curve */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-white">โอกาสเกิดฝนตกและปริมาณน้ำฝน</h4>
                <p className="text-xs text-slate-300">
                  โอกาสเกิดฝนในวันนี้:{" "}
                  <strong className="text-[#2DD4BF] font-mono tabular-nums">
                    {focusedDay.rainProb}%
                  </strong>{" "}
                  · ปริมาณฝนคาดการณ์{" "}
                  <strong className="text-white font-mono tabular-nums">
                    {focusedDay.rainMmP50} มม.
                  </strong>{" "}
                  <span className="text-slate-400 font-mono tabular-nums">
                    (P10–P90: {focusedDay.rainMmP10}–{focusedDay.rainMmP90} มม.)
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#080C16] border border-[#1E293B] p-3">
              <svg
                viewBox={`0 0 ${rainSvgW} ${rainSvgH}`}
                className="w-full h-auto overflow-visible"
                role="img"
                aria-label="กราฟโอกาสเกิดฝนตกรายชั่วโมง"
              >
                <defs>
                  <linearGradient id="koratRainAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#080C16" stopOpacity="0.05" />
                  </linearGradient>
                  <pattern
                    id="pastHoursHatch"
                    width="8"
                    height="8"
                    patternTransform="rotate(45 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="8"
                      stroke="rgba(45,212,191,0.08)"
                      strokeWidth="3"
                    />
                  </pattern>
                </defs>

                {/* Past hours diagonal hatch shading on Today (00:00 to 06:00) */}
                {selectedDayIdx === 0 && (
                  <rect
                    x={chartPadLeft}
                    y={rainPadTop}
                    width={getRainX(6) - chartPadLeft}
                    height={rainPlotH}
                    fill="url(#pastHoursHatch)"
                  />
                )}

                {/* Horizontal Percentage Gridlines (100% down to 0%) */}
                {[100, 80, 60, 40, 20, 0].map((pct) => {
                  const y = getRainY(pct);
                  return (
                    <g key={pct}>
                      <line
                        x1={chartPadLeft}
                        y1={y}
                        x2={rainSvgW - chartPadRight}
                        y2={y}
                        stroke="#1E293B"
                        strokeWidth="1"
                      />
                      <text
                        x={rainSvgW - chartPadRight + 8}
                        y={y + 4}
                        className="text-[11px] font-mono fill-slate-400"
                      >
                        {pct}%
                      </text>
                    </g>
                  );
                })}

                {/* Vertical 6-hour Dividers */}
                {[0, 6, 12, 18].map((hr) => {
                  const x = getRainX(hr);
                  return (
                    <g key={hr}>
                      <line
                        x1={x}
                        y1={rainPadTop}
                        x2={x}
                        y2={rainPadTop + rainPlotH}
                        stroke="#1E293B"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={x + 4}
                        y={rainSvgH - 6}
                        className="text-[11px] font-mono fill-slate-400"
                      >
                        {hr}:00
                      </text>
                    </g>
                  );
                })}

                {/* Cyber Teal Area Fill & Line for Rain Probability */}
                <polygon points={rainAreaPolygon} fill="url(#koratRainAreaGrad)" />
                <polyline
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={rainPointsActive}
                />

                {/* Start dot at 06:00 on Today */}
                <circle
                  cx={getRainX(rainStartHour)}
                  cy={getRainY(hourlySeries24[rainStartHour].rainProb)}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#080C16"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Map Layer Selector & District Telemetry Dashboard */}
      {/* Weather Map Layer Selector & District Telemetry Dashboard */}
      <div
        className={`${
          isDark
            ? "bg-[#0B101D] border-[#1E293B]"
            : "bg-white border-slate-200 shadow-sm"
        } border rounded-2xl p-5 sm:p-6 space-y-5 transition-colors`}
      >
        {/* Header & District Focus Pill */}
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b ${
            isDark ? "border-[#1E293B]" : "border-slate-200"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
              <Layers className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>Weather GIS Map Layer Control · สลับชั้นข้อมูลแผนที่สภาพอากาศ</span>
            </div>
            <h3
              className={`text-lg sm:text-xl font-bold tracking-tight leading-snug flex items-center gap-2 flex-wrap ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              <span>ชั้นข้อมูลแผนที่สภาพอากาศเชิงพื้นที่</span>
              <span
                className={`font-normal text-sm sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                (โฟกัส: {formatDistrictName(selectedDistrict.nameTh)} &amp; 32 อำเภอนครราชสีมา)
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isDark
                  ? "bg-[#141E36] border-[#2DD4BF]/40 text-[#2DD4BF]"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>อำเภอที่เลือก: {selectedDistrict.nameTh}</span>
            </span>
            <span
              className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                isDark
                  ? "text-slate-400 bg-[#080C16] border-[#1E293B]"
                  : "text-slate-700 bg-slate-100 border-slate-200"
              }`}
            >
              {selectedDistrict.zone}
            </span>
          </div>
        </div>

        {/* The Toggle Buttons for Weather Map Layers (6 Modes Responsive Grid) */}
        <div>
          <div className="text-xs font-medium mb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span
                className={`font-semibold ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                สลับโหมดชั้นข้อมูลแผนที่ (Select Weather Map Layer):
              </span>
            </div>
            <span className="text-[11px] text-[#2DD4BF] flex items-center gap-1 font-mono">
              <Eye className="w-3 h-3" />
              <span>คลิกเพื่อเปลี่ยนมุมมองเรดาร์และแผนที่ความร้อนดาวเทียมด้านล่าง</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Toggle 1: Rainfall Intensity */}
            <button
              type="button"
              onClick={() => handleUpdateMapLayer("rainfall_intensity")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer group ${
                mapLayer === "rainfall_intensity" || mapLayer === "rain_prob"
                  ? isDark
                    ? "bg-[#14233D] border-[#38BDF8] shadow-md shadow-sky-950/60 ring-2 ring-[#38BDF8]/40"
                    : "bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300"
                  : isDark
                  ? "bg-[#080C16] border-[#1E293B] hover:border-slate-700 hover:bg-[#0D1527]"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      mapLayer === "rainfall_intensity" || mapLayer === "rain_prob"
                        ? "bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40"
                        : isDark
                        ? "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                        : "bg-slate-200 text-slate-600 border border-slate-300"
                    }`}
                  >
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <span className="truncate">Rainfall</span>
                      {(mapLayer === "rainfall_intensity" || mapLayer === "rain_prob") && (
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]" />
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10.5px] truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      ความเข้มฝน/เรดาร์
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  isDark ? "border-[#1E293B]/80" : "border-slate-200"
                }`}
              >
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  {districtRain24h} มม.
                </span>
                <span className="font-bold text-[#38BDF8]">{focusedDay.rainProb}%</span>
              </div>
            </button>

            {/* Toggle 2: Humidity Heatmap */}
            <button
              type="button"
              onClick={() => handleUpdateMapLayer("humidity_heatmap")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer group ${
                mapLayer === "humidity_heatmap"
                  ? isDark
                    ? "bg-[#0B252E] border-[#2DD4BF] shadow-md shadow-teal-950/60 ring-2 ring-[#2DD4BF]/40"
                    : "bg-teal-50 border-teal-400 shadow-md ring-2 ring-teal-300"
                  : isDark
                  ? "bg-[#080C16] border-[#1E293B] hover:border-slate-700 hover:bg-[#0D1527]"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      mapLayer === "humidity_heatmap"
                        ? "bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40"
                        : isDark
                        ? "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                        : "bg-slate-200 text-slate-600 border border-slate-300"
                    }`}
                  >
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <span className="truncate">Humidity</span>
                      {mapLayer === "humidity_heatmap" && (
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10.5px] truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      ความชื้นอากาศ RH
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  isDark ? "border-[#1E293B]/80" : "border-slate-200"
                }`}
              >
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>อากาศ:</span>
                <span className="font-bold text-[#2DD4BF]">RH {districtRh}%</span>
              </div>
            </button>

            {/* Toggle 3: Soil Moisture Map */}
            <button
              type="button"
              onClick={() => handleUpdateMapLayer("soil_moisture")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer group ${
                mapLayer === "soil_moisture"
                  ? isDark
                    ? "bg-[#0A261E] border-[#10B981] shadow-md shadow-emerald-950/60 ring-2 ring-[#10B981]/40"
                    : "bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300"
                  : isDark
                  ? "bg-[#080C16] border-[#1E293B] hover:border-slate-700 hover:bg-[#0D1527]"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      mapLayer === "soil_moisture"
                        ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                        : isDark
                        ? "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                        : "bg-slate-200 text-slate-600 border border-slate-300"
                    }`}
                  >
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <span className="truncate">Soil Moisture</span>
                      {mapLayer === "soil_moisture" && (
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10.5px] truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      ความชื้นดิน %
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  isDark ? "border-[#1E293B]/80" : "border-slate-200"
                }`}
              >
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>GISTDA:</span>
                <span className="font-bold text-[#10B981]">{districtSoilMoisture}%</span>
              </div>
            </button>

            {/* Toggle 4: Soil Series Map */}
            <button
              type="button"
              onClick={() => handleUpdateMapLayer("soil_series")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer group ${
                mapLayer === "soil_series"
                  ? isDark
                    ? "bg-[#281E0C] border-[#F59E0B] shadow-md shadow-amber-950/60 ring-2 ring-[#F59E0B]/40"
                    : "bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-300"
                  : isDark
                  ? "bg-[#080C16] border-[#1E293B] hover:border-slate-700 hover:bg-[#0D1527]"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      mapLayer === "soil_series"
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40"
                        : isDark
                        ? "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                        : "bg-slate-200 text-slate-600 border border-slate-300"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <span className="truncate">Soil Series</span>
                      {mapLayer === "soil_series" && (
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]" />
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10.5px] truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      จำแนกกลุ่มชุดดิน
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  isDark ? "border-[#1E293B]/80" : "border-slate-200"
                }`}
              >
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  {getDistrictSoilSeriesMeta(selectedDistrict.id).code}
                </span>
                <span className="font-bold text-[#F59E0B] truncate">
                  {getDistrictSoilSeriesMeta(selectedDistrict.id)
                    .nameTh.replace(/ชุดดิน/, "")
                    .split(" ")[0]
                    .trim()}
                </span>
              </div>
            </button>

            {/* Toggle 5: Drought Index SPI */}
            <button
              type="button"
              onClick={() => handleUpdateMapLayer("drought_spi")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer group ${
                mapLayer === "drought_spi"
                  ? isDark
                    ? "bg-[#291F0A] border-[#F59E0B] shadow-md shadow-amber-950/60 ring-2 ring-[#F59E0B]/40"
                    : "bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-300"
                  : isDark
                  ? "bg-[#080C16] border-[#1E293B] hover:border-slate-700 hover:bg-[#0D1527]"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      mapLayer === "drought_spi"
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40"
                        : isDark
                        ? "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                        : "bg-slate-200 text-slate-600 border border-slate-300"
                    }`}
                  >
                    <ThermometerSun className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <span className="truncate">ดัชนีแล้ง SPI</span>
                      {mapLayer === "drought_spi" && (
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]" />
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10.5px] truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      เฝ้าระวังแล้ง 30d
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  isDark ? "border-[#1E293B]/80" : "border-slate-200"
                }`}
              >
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>30 วัน:</span>
                <span
                  className={`font-bold ${
                    activeSpi30 <= -1.0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  SPI {activeSpi30 > 0 ? `+${activeSpi30}` : activeSpi30}
                </span>
              </div>
            </button>

            {/* Toggle 6: Soil pH & N-P-K (ธาตุอาหารพืชและกรด-ด่างดิน) */}
            <button
              type="button"
              onClick={() => handleUpdateMapLayer("soil_ph_npk")}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer group ${
                mapLayer === "soil_ph_npk"
                  ? isDark
                    ? "bg-[#25153A] border-[#A855F7] shadow-md shadow-purple-950/60 ring-2 ring-[#A855F7]/40"
                    : "bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-300"
                  : isDark
                  ? "bg-[#080C16] border-[#1E293B] hover:border-slate-700 hover:bg-[#0D1527]"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      mapLayer === "soil_ph_npk"
                        ? "bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40"
                        : isDark
                        ? "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                        : "bg-slate-200 text-slate-600 border border-slate-300"
                    }`}
                  >
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <span className="truncate">pH ดิน &amp; NPK</span>
                      {mapLayer === "soil_ph_npk" && (
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A855F7]" />
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10.5px] truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      ธาตุอาหาร &amp; กรด-ด่าง
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  isDark ? "border-[#1E293B]/80" : "border-slate-200"
                }`}
              >
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>pH:</span>
                <span className="font-bold text-[#A855F7]">
                  {selectedDistrict.defaultSoilTest.soilPh.toFixed(1)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Selected District Telemetry Insight Banner for Active Layer */}
        <div
          className={`${
            isDark ? "bg-[#080C16] border-[#1E293B]" : "bg-slate-50 border-slate-200"
          } border rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 transition-colors`}
        >
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                สถานะชั้นข้อมูลปัจจุบัน:
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  isDark ? "text-white bg-[#1E293B]" : "text-slate-900 bg-slate-200"
                }`}
              >
                {currentLayerInfo.labelTh}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${currentLayerInfo.statusTone}`}
              >
                {currentLayerInfo.districtStatusTh}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight leading-snug ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {currentLayerInfo.districtValue}
              </div>
              <div
                className={`text-xs font-sans ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                ณ อำเภอ{selectedDistrict.nameTh} ({selectedDistrict.nameEn})
              </div>
            </div>

            <p
              className={`text-xs leading-relaxed max-w-3xl ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {currentLayerInfo.advisoryTh}
            </p>
          </div>

          {/* Color Scale Legend Preview for the active layer */}
          <div
            className={`lg:w-80 shrink-0 rounded-xl p-3.5 space-y-2 border ${
              isDark ? "bg-[#0E1525] border-[#1E293B]" : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`flex items-center justify-between text-[11px] ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <span className="font-semibold">แถบเกณฑ์สี (Color Ramp)</span>
              <span className="font-mono text-[#2DD4BF] font-semibold">
                {formatDistrictName(selectedDistrict.nameTh)}
              </span>
            </div>
            <div
              className={`h-3 w-full rounded-full border relative ${
                isDark ? "border-[#1E293B]" : "border-slate-300"
              }`}
              style={{ background: currentLayerInfo.gradientBar }}
            >
              <div
                className="absolute -top-1 w-5 h-5 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 transition-all duration-300"
                style={{
                  left:
                    mapLayer === "rainfall_intensity" || mapLayer === "rain_prob"
                      ? `${Math.min(92, Math.max(8, (districtRain24h / 50) * 100))}%`
                      : mapLayer === "humidity_heatmap"
                      ? `${Math.min(92, Math.max(8, ((districtRh - 40) / 55) * 100))}%`
                      : mapLayer === "soil_moisture"
                      ? `${Math.min(92, Math.max(8, ((districtSoilMoisture - 18) / 45) * 100))}%`
                      : mapLayer === "soil_series"
                      ? "50%"
                      : mapLayer === "soil_ph_npk"
                      ? `${Math.min(
                          92,
                          Math.max(
                            8,
                            ((selectedDistrict.defaultSoilTest.soilPh - 4.5) / 2.8) * 100
                          )
                        )}%`
                      : `${Math.min(92, Math.max(8, ((activeSpi30 + 2) / 3) * 100))}%`,
                  backgroundColor: currentLayerInfo.dotColor,
                }}
                title={`ตำแหน่งค่าของ ${formatDistrictName(selectedDistrict.nameTh)}`}
              />
            </div>
            <div
              className={`flex items-center justify-between text-[10px] font-mono ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <span>{currentLayerInfo.minLabel}</span>
              <span>{currentLayerInfo.maxLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Interactive Leaflet GIS Map: 32 Weather Stations & Moisture-Level Heatmaps */}
      <KoratLeafletMap
        selectedDistrict={selectedDistrict}
        onSelectDistrict={onSelectDistrict}
        plots={plots}
        onAddPlotPin={onAddPlotPin}
        activeOverlayMode={mapLayer}
        onChangeOverlayMode={handleUpdateMapLayer}
        liveStationOverride={{
          districtId: selectedDistrict.id,
          tempCurrentC: currentHeadlineTemp,
          tempMaxC: focusedDay.tempMax,
          tempMinC: focusedDay.tempMin,
          rainProbPct: focusedDay.rainProb,
          rain24hMm: focusedDay.rainMmP50,
          windSpeedKmh: focusedDay.windMaxKmh,
          et0Mm: focusedDay.et0Mm,
          spi30d: activeSpi30,
          relativeHumidityPct: districtRh,
          soilMoisturePct: districtSoilMoisture,
        }}
      />

      {/* AGRONOMIC DROUGHT INDEX (SPI) & EXTREME WEATHER CROP-STAGE ADVISORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: SPI 14-30 Day Gauge */}
        <div className="lg:col-span-7 bg-[#0B101D] border border-[#1E293B] rounded-2xl shadow-lg p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
                Standardized Precipitation Index (SPI)
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                ดรรชนีความแห้งแล้งมาตรฐานล่วงหน้า 14–30 วัน ({selectedDistrict.nameTh})
              </h3>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${spiStatus.badgeBg}`}>
              {spiStatus.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-1">
            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3.5">
              <div className="text-xs text-slate-400">ค่าดรรชนี SPI-30 วัน</div>
              <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${spiStatus.tone}`}>
                {activeSpi30 > 0 ? `+${activeSpi30}` : activeSpi30}
              </div>
              <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                SPI-14 วัน: {activeSpi14 > 0 ? `+${activeSpi14}` : activeSpi14}
              </div>
            </div>

            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3.5">
              <div className="text-xs text-slate-400">ฝนสะสมคาดการณ์ 14 วัน</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                {weatherData?.projected14dRainMm ?? selectedDistrict.forecastRain14dMm}{" "}
                <span className="text-xs font-normal text-slate-400">มม.</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                ค่าเฉลี่ยปกติ 30 วัน: {selectedDistrict.normalRain30dMm} มม.
              </div>
            </div>

            <div className="bg-[#080C16] border border-[#1E293B] rounded-xl p-3.5">
              <div className="text-xs text-slate-400">ความชื้นดินดาวเทียม GISTDA</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#2DD4BF] mt-1">
                {selectedDistrict.gistdaSoilMoisturePct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {selectedDistrict.soilSeriesName}
              </div>
            </div>
          </div>

          <div className="pt-1">
            <div className="relative h-3 rounded-full bg-gradient-to-r from-red-500 via-[#F59E0B] to-[#14B8A6]">
              <div
                className="absolute -top-1.5 w-3.5 h-6 bg-[#080C16] border-2 border-white rounded-sm shadow-sm -translate-x-1/2"
                style={{ left: `${spiMarkerLeftPct}%` }}
                title={`SPI = ${activeSpi30}`}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400 mt-2">
              <span>-2.0 (แล้งรุนแรง)</span>
              <span>-1.0 (ฝนทิ้งช่วง)</span>
              <span>0.0 (สมดุลปกติ)</span>
              <span>+1.0 (ชุ่มชื้น)</span>
              <span>+2.0 (ฝนชุก)</span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Extreme Weather Alert for Crop Stages */}
        <div className="lg:col-span-5 bg-[#0B101D] border border-[#1E293B] rounded-2xl shadow-lg p-6 flex flex-col justify-between space-y-4">
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FBBF24]">
              <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0" />
              <span>การแจ้งเตือนภัยสภาวะอากาศสุดขั้วต่อระยะเจริญเติบโตของพืช</span>
            </div>
            <div className="text-sm font-bold text-white">
              {selectedDistrict.extremeAlertTitle}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedDistrict.extremeAlertDetail}
            </p>
            <div className="text-xs text-[#FBBF24] pt-2 border-t border-[#F59E0B]/30 leading-relaxed">
              <strong>ผลกระทบต่อพืชหลักใน {selectedDistrict.nameTh}:</strong>{" "}
              <span className="text-slate-200">{selectedDistrict.affectedCropStage}</span>
            </div>
          </div>

          <div className="border border-[#1E293B] rounded-xl p-4 text-xs space-y-1.5 bg-[#080C16]">
            <div className="font-semibold text-[#2DD4BF] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>ข้อมูลชุดดินประจำอำเภอและคำแนะนำการจัดการน้ำ</span>
            </div>
            <div className="text-slate-300">
              ชุดดินหลัก: <strong className="text-white">{selectedDistrict.soilSeriesName}</strong>
            </div>
            <div className="text-slate-400 font-mono tabular-nums">
              ค่าวิเคราะห์ดินพื้นฐาน: OM {selectedDistrict.defaultSoilTest.omPercent}% · P{" "}
              {selectedDistrict.defaultSoilTest.availPPpm} ppm · K{" "}
              {selectedDistrict.defaultSoilTest.exchKPpm} ppm · pH{" "}
              {selectedDistrict.defaultSoilTest.soilPh}
            </div>
          </div>
        </div>
      </div>

      {/* ALL 32 DISTRICTS COMPARATIVE RAINFALL & SPI TABLE */}
      <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#2DD4BF]">
              Nakhon Ratchasima 32 Districts Spatial Matrix
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              ตารางเปรียบเทียบพยากรณ์ปริมาณฝน ดรรชนีความแห้งแล้ง (SPI) และความชื้นดินครบทั้ง {KORAT_DISTRICTS.length} อำเภอ
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            คลิกที่รายชื่ออำเภอในตารางเพื่อดูกราฟพยากรณ์รายชั่วโมงและซูมแผนที่ไปยังอำเภอนั้น
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-[#1E293B] rounded-xl bg-[#080C16] shadow-inner">
          <table className="w-full min-w-[940px] text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-[#0E1525] text-slate-200 border-b border-[#1E293B]">
              <tr>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-12">#</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-[100px]">อำเภอ</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-[120px]">โซนพื้นที่</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-right">โอกาสฝนวันนี้</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-right">ฝนคาดการณ์ 14 วัน</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-right">SPI-30 วัน</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-right">ความชื้นดิน GISTDA</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap text-right">อุณหภูมิต่ำสุด–สูงสุด</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-[130px]">ระดับความเสี่ยงภัยแล้ง</th>
                <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-[140px]">พืชเศรษฐกิจหลัก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {KORAT_DISTRICTS.map((dist, index) => {
                const isSelected = dist.id === selectedDistrict.id;
                return (
                  <tr
                    key={dist.id}
                    onClick={() => onSelectDistrict(dist.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#141E36] font-semibold"
                        : "hover:bg-[#111827]"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-bold whitespace-nowrap ${
                        isSelected ? "text-[#2DD4BF]" : "text-white"
                      }`}
                    >
                      {dist.nameTh}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {dist.zone}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#38BDF8]">
                      {dist.rainProbToday}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                      {dist.forecastRain14dMm.toFixed(1)} มม.
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                        dist.spi30d <= -1.5
                          ? "text-red-400"
                          : dist.spi30d <= -1.0
                          ? "text-[#FBBF24]"
                          : "text-[#2DD4BF]"
                      }`}
                    >
                      {dist.spi30d > 0 ? `+${dist.spi30d.toFixed(2)}` : dist.spi30d.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                      {dist.gistdaSoilMoisturePct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                      {dist.minTempC}° – {dist.maxTempC}°C
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          dist.droughtRiskLevel === "วิกฤตแล้งรุนแรง"
                            ? "bg-red-500/15 text-red-400 border-red-500/40"
                            : dist.droughtRiskLevel === "เฝ้าระวังฝนทิ้งช่วง"
                            ? "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/40"
                            : "bg-[#14B8A6]/15 text-[#2DD4BF] border-[#14B8A6]/40"
                        }`}
                      >
                        {dist.droughtRiskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {dist.primaryCrops.join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
