"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload, Video } from "lucide-react";

import { embedVideoUrl, isDirectVideo } from "@/components/agents/profile-section";
import { cn } from "@/lib/utils";

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

interface MediaUploadFieldProps {
  label: string;
  hint: string;
  purpose: "agent_avatar" | "owner_avatar" | "demo_video";
  value: string;
  onChange: (url: string) => void;
  variant?: "image" | "video";
  previewClassName?: string;
  allowUrl?: boolean;
}

function validateFile(file: File, variant: "image" | "video") {
  if (variant === "image") {
    if (!IMAGE_TYPES.has(file.type)) {
      throw new Error("Images must be JPG or PNG.");
    }
    if (file.size > IMAGE_MAX_BYTES) {
      throw new Error("Images must be 2 MB or smaller.");
    }
    return;
  }
  if (!VIDEO_TYPES.has(file.type)) {
    throw new Error("Videos must be MP4 or WebM.");
  }
  if (file.size > VIDEO_MAX_BYTES) {
    throw new Error("Videos must be 5 MB or smaller.");
  }
}

export async function uploadMediaFile(file: File, purpose: MediaUploadFieldProps["purpose"]) {
  const formData = new FormData();
  formData.append("purpose", purpose);
  formData.append("file", file);

  const res = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
    throw new Error(body.detail ?? body.error ?? "Upload failed. Paste a URL instead.");
  }
  const { public_url } = (await res.json()) as { public_url: string };
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
          "flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#3f3f46] bg-[#0c0c0c] text-[#52525b]",
          className,
        )}
      >
        {variant === "image" ? <ImageIcon className="h-7 w-7 opacity-60" /> : <Video className="h-7 w-7 opacity-60" />}
        <span className="text-[11px]">No preview</span>
      </div>
    );
  }

  if (variant === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt="Preview"
        className={cn("rounded-[14px] border border-[#27272a] object-cover shadow-lg", className)}
      />
    );
  }

  const embed = embedVideoUrl(value);
  if (!embed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-[14px] border border-[#27272a] bg-[#0c0c0c] p-4",
          className,
        )}
      >
        <p className="text-[12px] text-[#71717a]">Enter a valid video URL to preview</p>
      </div>
    );
  }

  if (isDirectVideo(value)) {
    return (
      <video controls className={cn("rounded-[14px] border border-[#27272a] bg-black", className)}>
        <source src={value} />
      </video>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-[14px] border border-[#27272a] bg-black", className)}>
      <iframe src={embed} title="Video preview" className="h-full w-full" allowFullScreen />
    </div>
  );
}

export function MediaUploadField({
  label,
  hint,
  purpose,
  value,
  onChange,
  variant = "image",
  previewClassName,
  allowUrl = true,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept =
    variant === "image"
      ? "image/jpeg,image/png,.jpg,.jpeg,.png"
      : "video/mp4,video/webm,.mp4,.webm";

  async function handleFile(file: File) {
    setError(null);
    try {
      validateFile(file, variant);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid file");
      return;
    }

    setUploading(true);
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
    variant === "image"
      ? cn("h-40 w-40", previewClassName)
      : cn("aspect-video w-full", previewClassName);

  const sizeHint = variant === "image" ? "JPG or PNG · max 2 MB" : "MP4 or WebM · max 5 MB";

  return (
    <div className="rounded-[14px] border border-[#27272a] bg-[#0c0c0c] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <MediaPreview value={value} variant={variant} className={previewSize} />

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-[14px] font-medium text-[#fafafa]">{label}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#71717a]">{hint}</p>
            <p className="mt-1 text-[11px] text-[#52525b]">{sizeHint}</p>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "rounded-[12px] border border-dashed p-4 transition",
              dragging ? "border-[#71717a] bg-[#141414]" : "border-[#27272a] bg-[#0a0a0a]",
            )}
          >
            {allowUrl ? (
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={variant === "image" ? "Paste image URL or upload" : "Paste YouTube/Vimeo/MP4 URL or upload"}
                className="w-full rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
              />
            ) : null}

            <div className={cn("flex flex-wrap gap-2", allowUrl && "mt-3")}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#fafafa] px-4 py-2 text-[12px] font-medium text-black hover:bg-[#e4e4e7] disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading…" : "Upload file"}
              </button>
              {value ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#27272a] px-3 py-2 text-[12px] text-[#71717a] hover:text-[#fca5a5]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-[10px] text-[#52525b]">Drag and drop a file here</p>
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

          {error ? <p className="text-[12px] text-[#fca5a5]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
