"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Hash, CheckCircle } from "lucide-react";

function JoinEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
    }
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    // イベントを招待コードで検索
    const { data: event, error: findError } = await supabase
      .from("events")
      .select("*")
      .eq("invite_code", code.trim())
      .single();

    if (findError || !event) {
      setError("招待コードが正しくありません。もう一度確認してください。");
      setLoading(false);
      return;
    }

    // 期限チェック
    if (event.invite_code_expires_at && new Date(event.invite_code_expires_at) < new Date()) {
      setError("この招待コードは期限切れです。主催者に新しいコードを発行してもらってください。");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      router.push(`/events/${event.id}`);
      return;
    }

    // 参加者として追加
    const { error: joinError } = await supabase
      .from("event_members")
      .insert({ event_id: event.id, user_id: user.id });

    if (joinError) {
      setError("参加に失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    setSuccess(event.name);
    setTimeout(() => router.push(`/events/${event.id}`), 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="animate-fade-up" style={{ marginBottom: "32px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={16} />
            戻る
          </Link>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "30px", color: "var(--text-primary)" }}>
            イベントに参加
          </h1>
        </div>

        <div className="animate-fade-up delay-100 card" style={{ padding: "40px", background: "white" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle size={48} color="#16A34A" style={{ marginBottom: "16px" }} />
              <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", marginBottom: "8px" }}>参加しました！</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>「{success}」に参加しました。移動中...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "14px", color: "#DC2626" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleJoin}>
                <div style={{ marginBottom: "28px" }}>
                  <label className="label">
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Hash size={13} />
                      招待コード（10文字）
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="例: AB3X9KPQ2R"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={10}
                    style={{ letterSpacing: "0.15em", fontSize: "20px", textAlign: "center", fontWeight: "600" }}
                    required
                  />
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                    主催者から受け取った10桁のコードを入力してください
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <Link href="/" className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                    キャンセル
                  </Link>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || code.length < 10}
                    style={{ flex: 2, justifyContent: "center" }}
                  >
                    {loading ? "参加中..." : "参加する"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinEventPage() {
  return (
    <Suspense>
      <JoinEventContent />
    </Suspense>
  );
}
