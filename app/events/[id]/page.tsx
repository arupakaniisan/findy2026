import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Camera, Share2, ArrowLeft, CalendarDays, Users, Images } from "lucide-react";
import { Event, Photo, Profile } from "@/lib/types";
import PhotoGallery from "@/components/PhotoGallery";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // イベント取得
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  // 参加確認
  const { data: member } = await supabase.from("event_members").select("id").eq("event_id", id).eq("user_id", user.id).single();
  if (!member) redirect("/");

  // 写真一覧
  const { data: photos } = await supabase.from("photos").select("*").eq("event_id", id).order("taken_at", { ascending: false, nullsFirst: false }).order("uploaded_at", { ascending: false });

  // 参加者数
  const { count: memberCount } = await supabase.from("event_members").select("*", { count: "exact", head: true }).eq("event_id", id);

  // 写真URLを生成
  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo: Photo) => {
      const { data } = await supabase.storage.from("photos").createSignedUrl(photo.storage_path, 3600);
      return { ...photo, signedUrl: data?.signedUrl ?? "" };
    })
  );

  const e = event as Event;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      {/* ヘッダー */}
      <header style={{ background: "var(--brown-deep)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} />
            ホーム
          </Link>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href={`/events/${id}/share`} style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px",
              padding: "8px 14px", display: "flex", alignItems: "center", gap: "7px",
              color: "rgba(255,255,255,0.9)", fontSize: "13px", textDecoration: "none",
              transition: "background 0.2s"
            }}>
              <Share2 size={15} />
              招待
            </Link>
            <Link href={`/events/${id}/camera`} style={{
              background: "var(--amber-warm)", border: "none", borderRadius: "8px",
              padding: "8px 14px", display: "flex", alignItems: "center", gap: "7px",
              color: "white", fontSize: "13px", fontWeight: "500", textDecoration: "none"
            }}>
              <Camera size={15} />
              撮影
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        {/* イベント情報 */}
        <div className="animate-fade-up" style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", color: "var(--text-primary)", marginBottom: "12px" }}>
            {e.name}
          </h1>
          {e.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.7", marginBottom: "12px" }}>
              {e.description}
            </p>
          )}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {e.event_date && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px" }}>
                <CalendarDays size={14} />
                {new Date(e.event_date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px" }}>
              <Users size={14} />
              {memberCount}人が参加中
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px" }}>
              <Images size={14} />
              {photos?.length ?? 0}枚の写真
            </div>
          </div>
        </div>

        {/* ギャラリー */}
        <div className="animate-fade-up delay-100">
          {photosWithUrls.length === 0 ? (
            <div style={{
              background: "white", border: "2px dashed var(--border)", borderRadius: "16px",
              padding: "64px 40px", textAlign: "center"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📸</div>
              <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", marginBottom: "8px", color: "var(--text-primary)" }}>
                まだ写真がありません
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                カメラボタンから撮影・アップロードしてみましょう
              </p>
              <Link href={`/events/${id}/camera`} className="btn-primary">
                <Camera size={16} />
                写真を撮る
              </Link>
            </div>
          ) : (
            <PhotoGallery photos={photosWithUrls} currentUserId={user.id} eventId={id} />
          )}
        </div>
      </main>
    </div>
  );
}
