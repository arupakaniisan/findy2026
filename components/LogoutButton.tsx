"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "rgba(255,255,255,0.1)",
        border: "none",
        borderRadius: "8px",
        padding: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      title="ログアウト"
    >
      <LogOut size={18} color="rgba(255,255,255,0.7)" />
    </button>
  );
}
