"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";

interface MediaUploadFieldProps {
  label: string;
  hint: string;
  purpose: "agent_avatar" | "owner_avatar" | "demo_video";
  accept: string;
  value: string;
  onChange: (url: string) => void;
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

export function MediaUploadField({ label, hint, purpose, accept, value, onChange }: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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

  return (
    <label className="block space-y-1.5">
      <span className="text-[12px] text-[#a1a1aa]">{label}</span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload"
          className="min-w-0 flex-1 rounded-[8px] border border-[#27272a] bg-[#141414] px-3 py-2 text-[13px] text-[#fafafa] outline-none focus:border-[#52525b]"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-[8px] border border-[#27272a] px-3 py-2 text-[12px] text-[#a1a1aa] hover:bg-[#141414] disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload
        </button>
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
      </div>
      <p className="text-[11px] text-[#52525b]">{hint}</p>
      {error ? <p className="text-[11px] text-[#fca5a5]">{error}</p> : null}
    </label>
  );
}
