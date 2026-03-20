"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Camera } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "このメールアドレスはすでに登録されています"
        : "登録に失敗しました。しばらくしてから再度お試しください");
      setLoading(false);
    } else {
      router.push("/auth/sign-up-success");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
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

          <div className="animate-fade-up delay-100 card" style={{ padding: "40px", background: "white" }}>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", marginBottom: "28px", color: "var(--text-primary)" }}>
              新規登録
            </h2>

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px",
                padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#DC2626"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: "20px" }}>
                <label className="label">表示名</label>
                <input
                  type="text"
                  className="input"
                  placeholder="山田 太郎"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

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
                <label className="label">パスワード（6文字以上）</label>
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
                {loading ? "登録中..." : "アカウントを作成"}
              </button>
            </form>
          </div>

          <div className="animate-fade-up delay-200" style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              すでにアカウントをお持ちの方は{" "}
              <Link href="/auth/login" style={{ color: "var(--amber-warm)", textDecoration: "none", fontWeight: "500" }}>
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
