"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError("メールの送信に失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div className="animate-fade-up" style={{ marginBottom: "32px" }}>
            <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", textDecoration: "none", marginBottom: "24px" }}>
              <ArrowLeft size={16} />
              ログインに戻る
            </Link>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "30px", color: "var(--text-primary)" }}>
              パスワードをお忘れの方
            </h1>
          </div>

          <div className="animate-fade-up delay-100 card" style={{ padding: "40px", background: "white" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle size={48} color="#16A34A" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", marginBottom: "8px" }}>
                  メールを送信しました
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7" }}>
                  {email} にパスワードリセット用のリンクを送りました。メールをご確認ください。
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "14px", color: "#DC2626" }}>
                    {error}
                  </div>
                )}
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7", marginBottom: "24px" }}>
                  登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "24px" }}>
                    <label className="label">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={13} />
                        メールアドレス
                      </span>
                    </label>
                    <input
                      type="email"
                      className="input"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {loading ? "送信中..." : "リセットメールを送る"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}