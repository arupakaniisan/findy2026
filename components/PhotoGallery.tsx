"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Trash2, MapPin, Clock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type PhotoWithUrl = {
  id: string;
  storage_path: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  taken_at: string | null;
  uploaded_at: string;
  signedUrl: string;
};

export default function PhotoGallery({
  photos,
  currentUserId,
  eventId,
}: {
  photos: PhotoWithUrl[];
  currentUserId: string;
  eventId: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<PhotoWithUrl | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (photo: PhotoWithUrl) => {
    if (!confirm("この写真を削除しますか？")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.storage.from("photos").remove([photo.storage_path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    setSelected(null);
    setDeleting(false);
    router.refresh();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString("ja-JP", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <>
      {/* マソングリッド風レイアウト */}
      <div style={{
        columns: "3 200px",
        gap: "10px",
      }}>
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className={`animate-fade-up delay-${Math.min((i % 5 + 1) * 100, 500)}`}
            onClick={() => setSelected(photo)}
            style={{
              breakInside: "avoid",
              marginBottom: "10px",
              borderRadius: "10px",
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
              background: "var(--cream-100)",
              aspectRatio: i % 3 === 0 ? "4/5" : i % 3 === 1 ? "1/1" : "4/3",
            }}
          >
            <Image
              src={photo.signedUrl}
              alt={`写真 ${i + 1}`}
              fill
              style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              sizes="(max-width: 640px) 33vw, 250px"
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)",
              opacity: 0, transition: "opacity 0.2s"
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
            />
          </div>
        ))}
      </div>

      {/* ライトボックス */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(20,12,6,0.95)",
            zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
          className="animate-fade-in"
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px", width: "100%", display: "flex", gap: "24px", alignItems: "flex-start" }}>
            {/* 画像 */}
            <div style={{ flex: 1, position: "relative", borderRadius: "12px", overflow: "hidden", maxHeight: "80vh" }}>
              <img
                src={selected.signedUrl}
                alt="選択した写真"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxHeight: "80vh" }}
              />
            </div>

            {/* サイドパネル */}
            <div style={{ width: "220px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
              >
                <X size={20} />
              </button>

              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "10px", padding: "16px" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginBottom: "12px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  情報
                </p>
                {selected.taken_at && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <Clock size={14} color="var(--amber-light)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{formatDate(selected.taken_at)}</span>
                  </div>
                )}
                {selected.latitude && selected.longitude && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <MapPin size={14} color="var(--amber-light)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                      {selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <User size={14} color="var(--amber-light)" />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                    {selected.user_id === currentUserId ? "あなた" : "参加者"}
                  </span>
                </div>
              </div>

              {selected.user_id === currentUserId && (
                <button
                  onClick={() => handleDelete(selected)}
                  disabled={deleting}
                  style={{
                    background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.4)",
                    borderRadius: "8px", padding: "10px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px", justifyContent: "center",
                    color: "#FCA5A5", fontSize: "13px", transition: "background 0.2s"
                  }}
                >
                  <Trash2 size={15} />
                  {deleting ? "削除中..." : "削除"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
