"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "survey_banner_dismissed_v1";
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfKAwCZut7qXclTY-f1YdOn0LJL-ThZustMHicX-B7XKXtsMA/viewform?usp=dialog";

export default function SurveyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="mx-auto px-4 pt-4"
      style={{ maxWidth: "1400px" }}
      role="region"
      aria-label="アンケートのお願い"
    >
      <div
        className="flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm"
        style={{
          background: "linear-gradient(90deg, #fdf8ec 0%, #f5f2eb 100%)",
          borderColor: "#b8860b",
        }}
      >
        <div className="text-xl leading-none pt-0.5" aria-hidden>
          📝
        </div>
        <div className="flex-1 text-sm leading-relaxed" style={{ color: "#0f2346" }}>
          <div className="font-bold mb-1">
            さくせいくんをより良くするためのアンケートにご協力ください
          </div>
          <div className="text-gray-700">
            ご回答いただいた方には、5月以降の有料プランを特別価格でご案内します（所要5〜10分）。
          </div>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-1.5 rounded text-white font-semibold text-sm transition-colors"
            style={{ background: "#0f2346" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0a1830")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0f2346")}
          >
            アンケートに回答する →
          </a>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="閉じる"
          className="text-gray-500 hover:text-gray-800 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
