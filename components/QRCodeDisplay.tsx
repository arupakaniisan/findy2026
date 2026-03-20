"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, CheckCheck, Share } from "lucide-react";

export default function QRCodeDisplay({
  inviteUrl,
  inviteCode,
  eventName,
}: {
  inviteUrl: string;
  inviteCode: string;
  eventName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, inviteUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: "#3D2B1F",
        light: "#FEFCF7",
      },
    });
  }, [inviteUrl]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${eventName} - Momento`,
        text: `「${eventName}」に招待します！`,
        url: inviteUrl,
      });
    } else {
      copyUrl();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* QRコードカード */}
      <div className="animate-fade-up card" style={{ padding: "40px", background: "white", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px", letterSpacing: "0.03em" }}>
          QRコードをスキャンして参加
        </p>
        <div style={{ display: "inline-block", padding: "16px", background: "var(--cream-50)", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <canvas ref={canvasRef} />
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>
          スマートフォンのカメラでスキャン
        </p>
      </div>

      {/* 招待コードカード */}
      <div className="animate-fade-up delay-100 card" style={{ padding: "28px", background: "white" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px" }}>
          招待コード
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            flex: 1, background: "var(--cream-100)", borderRadius: "8px",
            padding: "14px 20px", textAlign: "center",
            fontFamily: "monospace", fontSize: "28px", fontWeight: "700",
            letterSpacing: "0.2em", color: "var(--brown-deep)",
            border: "1.5px solid var(--border)"
          }}>
            {inviteCode}
          </div>
          <button
            onClick={copyCode}
            className="btn-secondary"
            style={{ padding: "14px", flexShrink: 0 }}
            title="コードをコピー"
          >
            {copied ? <CheckCheck size={18} color="#16A34A" /> : <Copy size={18} />}
          </button>
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>
          /events/join でこのコードを入力
        </p>
      </div>

      {/* 共有ボタンカード */}
      <div className="animate-fade-up delay-200 card" style={{ padding: "24px", background: "white" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px" }}>
          リンクで共有
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{
            flex: 1, background: "var(--cream-100)", borderRadius: "8px",
            padding: "10px 14px", fontSize: "12px", color: "var(--text-muted)",
            border: "1px solid var(--border)", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {inviteUrl}
          </div>
          <button onClick={copyUrl} className="btn-secondary" style={{ padding: "10px", flexShrink: 0 }} title="URLをコピー">
            {urlCopied ? <CheckCheck size={16} color="#16A34A" /> : <Copy size={16} />}
          </button>
        </div>
        <button onClick={handleShare} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "12px" }}>
          <Share size={16} />
          招待リンクを送る
        </button>
      </div>
    </div>
  );
}
