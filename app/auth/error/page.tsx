import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ textAlign: "center", maxWidth: "360px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "#FEF2F2", display: "inline-flex",
          alignItems: "center", justifyContent: "center", marginBottom: "20px"
        }}>
          <AlertCircle size={32} color="#DC2626" />
        </div>
        <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", marginBottom: "12px" }}>認証エラー</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
          認証に失敗しました。リンクが無効か期限切れの可能性があります。
        </p>
        <Link href="/auth/login" className="btn-primary">ログインページへ</Link>
      </div>
    </div>
  );
}
