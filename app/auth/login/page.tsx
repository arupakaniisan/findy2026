"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", flexDirection: "column" }}>
      {/* 装飾的な上部バー */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* ロゴ */}
          <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "16px",
              background: "var(--brown-deep)", display: "inline-flex",
              alignItems: "center", justifyContent: "center", marginBottom: "16px"
            }}>
              <Camera size={32} color="var(--amber-light)" />
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>
              Momento
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>大切な瞬間を、みんなで残す。</p>
          </div>

          {/* フォームカード */}
          <div className="animate-fade-up delay-100 card" style={{ padding: "40px", background: "white" }}>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", marginBottom: "28px", color: "var(--text-primary)" }}>
              ログイン
            </h2>

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px",
                padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#DC2626"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "20px" }}>
                <label className="label">メールアドレス</label>
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label className="label">パスワード</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                {loading ? "ログイン中..." : "ログイン"}
              </button>
            </form>
          </div>

          {/* 新規登録リンク */}
          <div className="animate-fade-up delay-200" style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              アカウントをお持ちでない方は{" "}
              <Link href="/auth/sign-up" style={{ color: "var(--amber-warm)", textDecoration: "none", fontWeight: "500" }}>
                新規登録
              </Link>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>
  <Link href="/auth/forgot-password" style={{ color: "var(--amber-warm)", textDecoration: "none", fontWeight: "500" }}>
    パスワードをお忘れの方
  </Link>
</p>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
