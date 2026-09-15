"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { ParsedFileMeta } from "@/types";

interface UploadDropzoneProps {
  title: string;
  description: string;
  accentColor: "primary" | "accent";
  isLoading: boolean;
  meta: ParsedFileMeta | null;
  onFile: (file: File) => void;
}

export function UploadDropzone({ title, description, accentColor, isLoading, meta, onFile }: UploadDropzoneProps) {
  const onDrop = React.useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  return (
    <div
      {...getRootProps()}
      aria-label={`${title} คลิกเพื่อเลือกไฟล์ Excel หรือวางไฟล์ที่นี่`}
      aria-busy={isLoading}
      className={cn(
        "group relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        isDragActive ? "border-primary bg-primary/8 shadow-[0_12px_30px_color-mix(in_oklch,var(--primary)_12%,transparent)]" : "border-border hover:border-primary/50 hover:bg-secondary/40",
        meta && "border-success/50 bg-success/5"
      )}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : meta ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success"><CheckCircle2 className="h-6 w-6" /></div>
      ) : (
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:-translate-y-1", accentColor === "primary" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground")}>
          <UploadCloud
            className={cn(
            "h-6 w-6",
            accentColor === "primary" ? "text-primary" : "text-accent"
            )}
          />
        </div>
      )}

      <p className="text-sm font-semibold">{title}</p>

      {meta ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span className="max-w-[220px] truncate">{meta.fileName}</span>
          <span>· {formatNumber(meta.rowCount)} แถว</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <p className="text-[11px] text-muted-foreground/70">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์ · รองรับ .xlsx, .xls</p>
    </div>
  );
}
