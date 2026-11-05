import React, { useState, useRef, useEffect } from "react";
import { KoratDistrict } from "../data/koratAgriData";
import {
  MessageSquareText,
  Send,
  X,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
  modelUsed?: string;
  sources?: { title: string; uri: string }[];
}

interface AgriChatbotDrawerProps {
  selectedDistrict: KoratDistrict;
}

export const AgriChatbotDrawer: React.FC<AgriChatbotDrawerProps> = ({
  selectedDistrict,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<"flash" | "pro" | "fast">("flash");
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: `สวัสดีครับ ผมคือที่ปรึกษาเกษตรอัจฉริยะจังหวัดนครราชสีมา (Korat Smart Agri Advisor) พร้อมให้คำปรึกษาเรื่องการตั้งค่าเกณฑ์แจ้งเตือนภัยแล้ง SPI, พยากรณ์ฝน, เฝ้าระวังโรคพืช 4 พืชหลัก (SLCMV/หนอนกระทู้), สิทธิประโยชน์พันธมิตร 4P (สินเชื่อ ธ.ก.ส. ดอกเบี้ยต่ำ 2.5%, โบนัสอ้อยสด/แป้งมัน) และสิทธิชดเชย กษ.01 สำหรับพื้นที่ ${selectedDistrict.nameTh} ครับ`,
      modelUsed: "gemini-3-flash-preview",
    },
  ]);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    const cleaned = textToSend.trim();
    if (!cleaned || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: cleaned },
    ];
    setMessages(nextMessages);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
          modelMode,
          districtName: selectedDistrict.nameTh,
          spi30d: selectedDistrict.spi30d,
          useSearchGrounding,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: data.reply || "ได้รับข้อมูลเรียบร้อยแล้ว",
            modelUsed: data.modelUsed,
            sources: data.sources || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `สำหรับพื้นที่ ${selectedDistrict.nameTh} (SPI-30d: ${selectedDistrict.spi30d}) แนะนำตั้งค่าแจ้งเตือนภัยแล้งที่ SPI ≤ -1.20 และติดตามความชื้นดิน GISTDA (${selectedDistrict.gistdaSoilMoisturePct}%) อย่างใกล้ชิด`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `สำหรับพื้นที่ ${selectedDistrict.nameTh} แนะนำตรวจสอบค่า SPI-30d (${selectedDistrict.spi30d}) และเตรียมบันทึกภาพพิกัดแปลงหากเกิดภาวะฝนทิ้งช่วง`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <>
      {/* Floating Launcher Button (StudioCheck Cyber Teal Badge Style) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 px-4 py-2.5 text-left bg-[#08121E]/95 hover:bg-[#0D1B2E] border border-[#14B8A6]/60 rounded-full shadow-[0_8px_30px_rgba(20,184,166,0.22)] transition-all"
      >
        <div className="w-9 h-9 rounded-xl bg-[#14B8A6] text-[#041E1C] flex items-center justify-center shrink-0">
          <MessageSquareText className="w-5 h-5" />
        </div>
        <div className="pr-1">
          <div className="text-[11px] font-medium text-[#2DD4BF] leading-tight">
            ที่ปรึกษาเกษตรอัจฉริยะ · 32 อำเภอ
          </div>
          <div className="text-xs font-bold text-white leading-tight mt-0.5">
            ถาม AI เกษตรโคราช ({selectedDistrict.nameTh})
          </div>
        </div>
      </button>

      {/* Multi-turn Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[360px] sm:w-[430px] max-w-[calc(100vw-3rem)] bg-[#0B101D] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[560px]">
          {/* Header */}
          <div className="bg-[#0F172A] text-white p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-sm font-bold">
                  ที่ปรึกษาเกษตรอัจฉริยะ (Gemini Multi-Turn Chat)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="ปิดหน้าต่างแชท"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Model Tier Switcher */}
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <div className="inline-flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setModelMode("flash")}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    modelMode === "flash"
                      ? "bg-[#38BDF8] text-slate-950 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Flash (ทั่วไป)
                </button>
                <button
                  type="button"
                  onClick={() => setModelMode("pro")}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    modelMode === "pro"
                      ? "bg-[#38BDF8] text-slate-950 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Pro (วิเคราะห์ลึก)
                </button>
                <button
                  type="button"
                  onClick={() => setModelMode("fast")}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    modelMode === "fast"
                      ? "bg-[#38BDF8] text-slate-950 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Lite (ตอบด่วน)
                </button>
              </div>

              {modelMode === "flash" && (
                <label className="inline-flex items-center gap-1 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSearchGrounding}
                    onChange={(e) => setUseSearchGrounding(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  <span>Google Search</span>
                </label>
              )}
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50 max-h-[320px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white border border-slate-200 text-slate-800 shadow-2xs"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.sources.map((s, sIdx) => (
                        <a
                          key={sIdx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded"
                        >
                          <span>{s.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {msg.modelUsed && (
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 px-1">
                    {msg.modelUsed}
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>กำลังวิเคราะห์ข้อมูล...</span>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Quick Question Suggestions */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
            {[
              `เว็บบอร์ดเสวนาเกษตรกรโคราช ถาม-ตอบปัญหาโรคพืชและแลกเปลี่ยนเทคนิค`,
              `เงื่อนไขขอสินเชื่อ ธ.ก.ส. 2.5% และโบนัสโรงงานน้ำตาล/แป้งมัน`,
              `วิธีควบคุมโรคใบด่างมันสำปะหลัง (SLCMV) และหนอนกระทู้ข้าวโพด`,
              `ควรตั้งค่าแจ้งเตือน SPI ของ ${selectedDistrict.nameTh} ที่เท่าไหร่?`,
              `วิเคราะห์ความเสี่ยงฝนทิ้งช่วงต่อมันสำปะหลังและอ้อย`,
              `ขั้นตอนยื่นขอเงินชดเชยภัยแล้ง กษ.01`,
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์คำถามด้านการเกษตรหรือการตั้งค่าเตือนภัย..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-700"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2 text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl transition-colors"
              aria-label="ส่งข้อความ"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
