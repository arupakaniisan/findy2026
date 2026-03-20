"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, CalendarDays, Sparkles } from "lucide-react";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function NewEventPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const inviteCode = generateInviteCode();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        name,
        description: description || null,
        event_date: eventDate || null,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (eventError) {
      setError("イベントの作成に失敗しました");
      setLoading(false);
      return;
    }

    // 作成者を参加者として追加
    await supabase.from("event_members").insert({ event_id: event.id, user_id: user.id });

    router.push(`/events/${event.id}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="animate-fade-up" style={{ marginBottom: "32px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={16} />
            戻る
          </Link>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "30px", color: "var(--text-primary)" }}>
            新しいイベントを作成
          </h1>
        </div>

        <div className="animate-fade-up delay-100 card" style={{ padding: "40px", background: "white" }}>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "14px", color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: "24px" }}>
              <label className="label">イベント名 *</label>
              <input
                type="text"
                className="input"
                placeholder="山田家結婚式・沖縄旅行2024..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label className="label">説明（任意）</label>
              <textarea
                className="input"
                placeholder="イベントの説明や思い出のメモ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ marginBottom: "36px" }}>
              <label className="label">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CalendarDays size={13} />
                  イベント日付（任意）
                </span>
              </label>
              <input
                type="date"
                className="input"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            {/* ヒントボックス */}
            <div style={{
              background: "var(--cream-100)", border: "1px solid var(--border)",
              borderRadius: "10px", padding: "16px", marginBottom: "28px",
              display: "flex", gap: "12px", alignItems: "flex-start"
            }}>
              <Sparkles size={18} color="var(--amber-warm)" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                作成後、QRコードや招待リンクで友達や家族を招待できます。
                参加者は写真を撮影・共有できるようになります。
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link href="/" className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                キャンセル
              </Link>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: "center" }}>
                {loading ? "作成中..." : "イベントを作成"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
