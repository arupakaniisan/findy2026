import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LogIn, Camera, CalendarDays, Users } from "lucide-react";
import { Event } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";

async function getEvents(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_members")
    .select("event_id, events(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) return [];
  return data?.map((d) => d.events as unknown as Event) ?? [];
}

async function getPhotoCounts(eventIds: string[]) {
  if (!eventIds.length) return {};
  const supabase = await createClient();
  const counts: Record<string, number> = {};
  for (const id of eventIds) {
    const { count } = await supabase.from("photos").select("*", { count: "exact", head: true }).eq("event_id", id);
    counts[id] = count ?? 0;
  }
  return counts;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
  const events = await getEvents(user.id);
  const photoCounts = await getPhotoCounts(events.map((e) => e.id));

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)" }}>
      {/* ヘッダー */}
      <header style={{
        background: "var(--brown-deep)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={20} color="var(--amber-light)" />
            </div>
            <span style={{ fontFamily: "var(--font-playfair)", fontSize: "20px", color: "var(--cream-50)", letterSpacing: "0.02em" }}>
              Momento
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
              {profile?.display_name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
        {/* ページヘッダー */}
        <div className="animate-fade-up" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              マイアルバム
            </p>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "34px", color: "var(--text-primary)", lineHeight: 1.2 }}>
              参加中のイベント
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/events/join" className="btn-secondary" style={{ fontSize: "14px", padding: "10px 18px" }}>
              <LogIn size={16} />
              参加する
            </Link>
            <Link href="/events/new" className="btn-primary" style={{ fontSize: "14px", padding: "10px 18px" }}>
              <Plus size={16} />
              新規作成
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          /* 空状態 */
          <div className="animate-fade-up delay-100" style={{
            background: "white", border: "2px dashed var(--border)", borderRadius: "16px",
            padding: "64px 40px", textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
            <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "22px", marginBottom: "8px", color: "var(--text-primary)" }}>
              まだイベントがありません
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px", lineHeight: "1.7" }}>
              新しいイベントを作成するか、<br />招待コードでイベントに参加しましょう
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/events/new" className="btn-primary">
                <Plus size={16} />
                イベントを作成
              </Link>
              <Link href="/events/join" className="btn-secondary">
                <LogIn size={16} />
                招待コードで参加
              </Link>
            </div>
          </div>
        ) : (
          /* イベントグリッド */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {events.map((event, i) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                style={{ textDecoration: "none" }}
                className={`animate-fade-up delay-${Math.min((i + 1) * 100, 500)}`}
              >
                <div className="card" style={{ padding: "24px", background: "white", position: "relative", overflow: "hidden" }}>
                  {/* 装飾ライン */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-light))" }} />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "10px",
                      background: "var(--cream-100)", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <span style={{ fontSize: "20px" }}>🎉</span>
                    </div>
                    <span style={{
                      background: "var(--cream-100)", color: "var(--text-muted)",
                      fontSize: "12px", padding: "4px 10px", borderRadius: "20px",
                      border: "1px solid var(--border)"
                    }}>
                      {photoCounts[event.id] ?? 0}枚
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px", lineHeight: 1.3 }}>
                    {event.name}
                  </h3>

                  {event.description && (
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6",
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                    {event.event_date && (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "12px" }}>
                        <CalendarDays size={13} />
                        {new Date(event.event_date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)", fontSize: "12px" }}>
                      <Users size={13} />
                      参加中
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
