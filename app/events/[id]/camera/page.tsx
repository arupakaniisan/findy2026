"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Camera, RefreshCw, Upload, CheckCircle, X, ImagePlus } from "lucide-react";

export default function CameraPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");

  const startCamera = useCallback(async (mode: "environment" | "user") => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setCameraError("");
    } catch {
      setCameraError("カメラへのアクセスが許可されていません。\nブラウザの設定からカメラへのアクセスを許可してください。");
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setCapturedBlob(blob);
      setCapturedUrl(URL.createObjectURL(blob));
      stream?.getTracks().forEach((t) => t.stop());
    }, "image/jpeg", 0.92);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    setCapturedUrl(URL.createObjectURL(file));
    stream?.getTracks().forEach((t) => t.stop());
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedUrl("");
    setError("");
    startCamera(facingMode);
  };

  const handleFlip = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    await startCamera(newMode);
  };

  const handleUpload = async () => {
    if (!capturedBlob) return;
    setUploading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const filename = `${user.id}/${eventId}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filename, capturedBlob, { contentType: "image/jpeg" });

    if (uploadError) {
      setError("アップロードに失敗しました。もう一度お試しください。");
      setUploading(false);
      return;
    }

    await supabase.from("photos").insert({
      event_id: eventId,
      user_id: user.id,
      storage_path: filename,
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
      taken_at: new Date().toISOString(),
    });

    setUploaded(true);
    setUploading(false);
    setTimeout(() => {
      router.push(`/events/${eventId}`);
      router.refresh();
    }, 1500);
  };

  return (
    <div style={{ height: "100svh", background: "#0A0604", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* ヘッダー */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)"
      }}>
        <Link href={`/events/${eventId}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", textDecoration: "none", fontSize: "14px" }}>
          <ArrowLeft size={18} />
          戻る
        </Link>
        {!capturedUrl && (
          <button onClick={handleFlip} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "white" }}>
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      {uploaded ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
          <CheckCircle size={64} color="#4ADE80" />
          <p style={{ color: "white", fontSize: "16px", fontFamily: "var(--font-playfair)" }}>アップロード完了！</p>
        </div>
      ) : capturedUrl ? (
        /* プレビュー */
        <>
          <div style={{ flex: 1, position: "relative" }}>
            <img src={capturedUrl} alt="撮影した写真" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ padding: "24px 20px", background: "rgba(0,0,0,0.8)", display: "flex", gap: "12px" }}>
            {error && (
              <div style={{ position: "absolute", bottom: "100px", left: "20px", right: "20px", background: "rgba(220,38,38,0.9)", borderRadius: "8px", padding: "10px 16px", color: "white", fontSize: "13px" }}>
                {error}
              </div>
            )}
            <button onClick={handleRetake} className="btn-secondary" style={{ flex: 1, justifyContent: "center", borderColor: "rgba(255,255,255,0.2)", color: "white" }}>
              <X size={16} />
              撮り直す
            </button>
            <button onClick={handleUpload} className="btn-primary" disabled={uploading} style={{ flex: 2, justifyContent: "center", background: "var(--amber-warm)" }}>
              <Upload size={16} />
              {uploading ? "アップロード中..." : "この写真を使う"}
            </button>
          </div>
        </>
      ) : (
        /* カメラビュー */
        <>
          {cameraError ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", padding: "40px", textAlign: "center" }}>
              <Camera size={48} color="rgba(255,255,255,0.3)" />
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-line" }}>{cameraError}</p>
            </div>
          ) : (
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* ガイドオーバーレイ */}
              <div style={{
                position: "absolute", inset: "15%", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "4px", pointerEvents: "none"
              }} />
            </div>
          )}

          {/* シャッターバー */}
          <div style={{ padding: "24px 20px 40px", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "12px", padding: "14px", cursor: "pointer", color: "white" }}
            >
              <ImagePlus size={24} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />

            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "white", border: "4px solid rgba(255,255,255,0.3)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.1s"
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "var(--brown-deep)" }} />
            </button>

            <div style={{ width: "52px" }} />
          </div>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
