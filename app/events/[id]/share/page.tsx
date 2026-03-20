import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/events/join?code=${event.invite_code}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream-50)" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--amber-dark), var(--amber-warm), var(--amber-light))" }} />

      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="animate-fade-up" style={{ marginBottom: "32px" }}>
          <Link href={`/events/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", textDecoration: "none", marginBottom: "24px" }}>
            <ArrowLeft size={16} />
            イベントに戻る
          </Link>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "28px", color: "var(--text-primary)" }}>
            招待する
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px" }}>
            「{event.name}」の参加者を招待
          </p>
        </div>

        <QRCodeDisplay inviteUrl={inviteUrl} inviteCode={event.invite_code} eventName={event.name} />
      </div>
    </div>
  );
}
