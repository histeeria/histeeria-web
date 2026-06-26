"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload, Video } from "lucide-react";

import { embedVideoUrl, isDirectVideo } from "@/components/agents/profile-section";
import { cn } from "@/lib/utils";

interface MediaUploadFieldProps {
  label: string;
  hint: string;
  purpose: "agent_avatar" | "owner_avatar" | "demo_video";
  accept: string;
  value: string;
  onChange: (url: string) => void;
  variant?: "image" | "video";
  previewClassName?: string;
}

export async function uploadMediaFile(file: File, purpose: MediaUploadFieldProps["purpose"]) {
  const presignRes = await fetch("/api/media/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purpose,
      content_type: file.type,
      filename: file.name,
    }),
  });
  if (!presignRes.ok) {
    const body = (await presignRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Upload not available. Paste a URL instead.");
  }
  const { upload_url, public_url } = (await presignRes.json()) as {
    upload_url: string;
    public_url: string;
  };
  const putRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload to storage failed.");
  return public_url;
}

function MediaPreview({
  value,
  variant,
  className,
}: {
  value: string;
  variant: "image" | "video";
  className?: string;
}) {
  if (!value) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#27272a] bg-[#0f0f0f] text-[#52525b]",
          className,
        )}
      >
        {variant === "image" ? <ImageIcon className="h-8 w-8" /> : <Video className="h-8 w-8" />}
        <span className="text-[11px]">No preview yet</span>
      </div>
    );
  }

  if (variant === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt="Preview"
        className={cn("rounded-[12px] border border-[#27272a] object-cover", className)}
      />
    );
  }

  const embed = embedVideoUrl(value);
  if (!embed) {
    return (
      <div className={cn("flex items-center justify-center rounded-[12px] border border-[#27272a] bg-[#0f0f0f] p-4", className)}>
        <p className="text-[12px] text-[#71717a]">Enter a valid video URL to preview</p>
      </div>
    );
  }

  if (isDirectVideo(value)) {
    return (
      <video controls className={cn("rounded-[12px] border border-[#27272a] bg-black", className)}>
        <source src={value} />
      </video>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-[12px] border border-[#27272a] bg-black", className)}>
      <iframe src={embed} title="Video preview" className="h-full w-full" allowFullScreen />
    </div>
  );
}

export function MediaUploadField({
  label,
  hint,
  purpose,
  accept,
  value,
  onChange,
  variant = "image",
  previewClassName,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadMediaFile(file, purpose);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const previewSize =
    variant === "image" ? cn("h-36 w-36", previewClassName) : cn("aspect-video w-full max-w-md", previewClassName);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <MediaPreview value={value} variant={variant} className={previewSize} />

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[13px] font-medium text-[#fafafa]">{label}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#52525b]">{hint}</p>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "rounded-[10px] border border-dashed p-4 transition",
              dragging ? "border-[#52525b] bg-[#141414]" : "border-[#27272a] bg-[#0f0f0f]",
            )}
          >
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://… or upload a file"
              className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] bg-[#141414] px-3 py-1.5 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading…" : "Upload to Cloudflare R2"}
              </button>
              {value ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-3 py-1.5 text-[12px] text-[#71717a] hover:text-[#fca5a5]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-[10px] text-[#52525b]">
              Drag and drop a file here. R2 public URLs (e.g. pub-*.r2.dev) work without a custom domain.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          {error ? <p className="text-[11px] text-[#fca5a5]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
