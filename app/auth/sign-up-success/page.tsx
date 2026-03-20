import Link from "next/link";
import { Mail } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <div className="animate-fade-up card" style={{ padding: "48px 40px", background: "white" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "var(--cream-100)", border: "2px solid var(--border)",
              display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "24px"
            }}>
              <Mail size={32} color="var(--amber-warm)" />
            </div>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "24px", marginBottom: "12px", color: "var(--text-primary)" }}>
              メールをご確認ください
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7", marginBottom: "32px" }}>
              ご登録のメールアドレスに確認メールをお送りしました。
              メール内のリンクをクリックして登録を完了してください。
            </p>
            <Link href="/auth/login" className="btn-secondary" style={{ display: "inline-flex" }}>
              ログインページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
