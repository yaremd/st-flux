"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Plus, Compass, ChartLineUp, Microphone, ArrowUp, Article, Sun, Moon } from "@phosphor-icons/react";

const AVATAR = "/user-avatar.png";

type Mode = "stellaredge" | "forecasting";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Drop (AI avatar) ──────────────────────────────────────────────────────────
function AiAvatar() {
  return (
    <div className="relative h-[48px] w-[48px] shrink-0 rounded-full overflow-hidden">
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <img
          alt=""
          src="/drop-bg.png"
          className="absolute max-w-none"
          style={{ width: "189.63%", height: "118.08%", left: "-43.89%", top: "-9.04%" }}
        />
      </div>
      <img
        alt=""
        src="/drop-avatar.png"
        className="absolute inset-0 size-full object-cover rounded-full"
      />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function ChatHeader({
  inChat,
  title,
  onNew,
}: {
  inChat: boolean;
  title: string;
  onNew: () => void;
}) {
  const [dark, setDark] = useState(true);
  return (
    <header className="relative z-20 flex h-[72px] shrink-0 items-center justify-between px-6">
      {/* Left */}
      <div className="flex flex-1 items-center gap-6">
        <Link href="/" className="shrink-0">
          <img src="/logo-default.svg" alt="Stellar" className="h-12 w-12" />
        </Link>
        <span className="font-display text-[24px] leading-none tracking-[0.48px] text-[#f7f7f7] whitespace-nowrap">
          StellarEdge
        </span>
        <button aria-label="Notes" className="text-white/40 hover:text-white/80 transition-colors">
          <Article size={24} />
        </button>
        {inChat && (
          <button
            aria-label="New chat"
            onClick={onNew}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-transparent hover:bg-white/[0.06] transition-colors"
          >
            <Plus size={20} className="text-white/80" />
          </button>
        )}
      </div>

      {/* Center — query preview */}
      {inChat && (
        <p className="flex-1 min-w-0 text-[18px] font-medium leading-7 text-[#f7f7f7] text-center truncate px-4">
          {title}
        </p>
      )}

      {/* Right */}
      <div className="flex flex-1 items-center justify-end gap-10">
        <button
          aria-label="Toggle theme"
          className="text-white/40 hover:text-white/80 transition-colors"
          onClick={() => setDark(d => !d)}
        >
          {dark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/[0.12]">
          <img src={AVATAR} alt="avatar" className="size-full object-cover" />
        </div>
      </div>
    </header>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function ChatInput({
  value,
  onChange,
  onSend,
  mode,
  onModeChange,
  inChat,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  inChat: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const hasText = value.trim().length > 0;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && hasText) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className={`w-[800px] h-[180px] bg-[rgba(255,255,255,0.08)] rounded-[48px] p-6 flex flex-col justify-between backdrop-blur-sm transition-all duration-200 ${
        focused ? "ring-2 ring-white/30" : "ring-1 ring-white/[0.08]"
      }`}
    >
      <textarea
        className="w-full bg-transparent text-[16px] leading-6 text-[#f7f7f7] placeholder:text-[#d5d7da]/50 resize-none outline-none"
        placeholder="Ask anything"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={2}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            aria-label="Attach"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 hover:border-white/90 transition-colors"
          >
            <Plus size={20} className="text-white/70" />
          </button>
          <div className="flex items-center">
            {/* StellarEdge pill — hidden once in chat to match Figma */}
            {!inChat && (
              <button
                onClick={() => onModeChange("stellaredge")}
                className={`flex items-center gap-[6px] px-[14px] py-[10px] rounded-full text-[14px] font-semibold leading-5 transition-colors ${
                  mode === "stellaredge" ? "text-[#53b1fd]" : "text-[#cecfd2]"
                }`}
              >
                <Compass size={20} />
                StellarEdge
              </button>
            )}
            <button
              onClick={() => onModeChange("forecasting")}
              className={`flex items-center gap-[6px] px-[14px] py-[10px] rounded-full text-[14px] font-semibold leading-5 transition-colors ${
                mode === "forecasting" ? "text-[#53b1fd]" : "text-[#cecfd2]"
              }`}
            >
              <ChartLineUp size={20} />
              Forecasting
            </button>
          </div>
        </div>
        {hasText ? (
          <button
            aria-label="Send"
            onClick={onSend}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-white/90 transition-colors shadow-sm"
          >
            <ArrowUp size={20} className="text-[#07091A]" weight="bold" />
          </button>
        ) : (
          <button
            aria-label="Voice input"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Microphone size={20} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("stellaredge");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inChat = messages.length > 0 || thinking;
  const headerTitle = messages[0]?.content
    ? messages[0].content.length > 30
      ? messages[0].content.slice(0, 30) + "..."
      : messages[0].content
    : "";

  const handleSend = () => {
    const text = query.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setQuery("");
    setThinking(true);
    // Simulate AI response after 2.5s
    setTimeout(() => {
      setThinking(false);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I'm analyzing the data for " + text + "..." },
      ]);
    }, 2500);
  };

  const handleNew = () => {
    setMessages([]);
    setThinking(false);
    setQuery("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div
      className="relative flex flex-col min-h-screen w-full overflow-hidden"
      style={{ background: "linear-gradient(157deg, #151225 15%, #05051E 82%)" }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 62%, rgba(28,52,210,0.32) 0%, rgba(18,30,140,0.12) 50%, transparent 72%)",
        }}
      />

      <ChatHeader inChat={inChat} title={headerTitle} onNew={handleNew} />

      {!inChat ? (
        /* ── Idle: centered heading + input ── */
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 pb-16">
          <h1 className="font-display text-[36px] leading-[44px] tracking-[-0.72px] text-[#f7f7f7] text-center">
            What do you seek today?
          </h1>
          <ChatInput
            value={query}
            onChange={setQuery}
            onSend={handleSend}
            mode={mode}
            onModeChange={setMode}
            inChat={false}
          />
        </main>
      ) : (
        /* ── Chat: messages thread + fixed input ── */
        <>
          <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-6 pb-[220px]">
            <div className="mx-auto flex w-[752px] flex-col gap-6">
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="backdrop-blur-[30px] bg-[rgba(255,255,255,0.18)] px-4 py-4 rounded-[40px] max-w-[640px]">
                      <p className="text-[16px] leading-6 text-[#f7f7f7]">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex items-start gap-4">
                    <AiAvatar />
                    <p className="text-[16px] leading-6 text-[#f7f7f7]/80 pt-3">{msg.content}</p>
                  </div>
                )
              )}
              {thinking && (
                <div className="flex items-center gap-4">
                  <AiAvatar />
                  <div style={{ animation: "thinking-glow 1.8s ease-in-out infinite" }}>
                    <p
                      className="font-display text-[16px] leading-8 bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(103deg, rgba(255,255,255,1) 13%, rgba(255,255,255,0.4) 54%)",
                      }}
                    >
                      Thinking...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed bottom input */}
          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
            <ChatInput
              value={query}
              onChange={setQuery}
              onSend={handleSend}
              mode={mode}
              onModeChange={setMode}
              inChat={true}
            />
          </div>
        </>
      )}
    </div>
  );
}
