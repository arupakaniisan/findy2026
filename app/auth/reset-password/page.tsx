"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // リセット可能な状態
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("パスワードの更新に失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/auth/login"), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div className="animate-fade-up card" style={{ padding: "40px", background: "white" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle size={48} color="#16A34A" style={{ marginBottom: "16px" }} />
                <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", marginBottom: "8px" }}>
                  パスワードを更新しました
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  ログインページに移動します...
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", marginBottom: "24px", color: "var(--text-primary)" }}>
                  新しいパスワードを設定
                </h2>

                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "14px", color: "#DC2626" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleReset}>
                  <div style={{ marginBottom: "20px" }}>
                    <label className="label">新しいパスワード</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "28px" }}>
                    <label className="label">パスワード（確認）</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {loading ? "更新中..." : "パスワードを更新"}
                  </button>
                </form>
              </>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Link href="/auth/login" style={{ color: "var(--amber-warm)", fontSize: "14px", textDecoration: "none" }}>
              ログインページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}