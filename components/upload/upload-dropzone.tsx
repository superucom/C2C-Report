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
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/40",
        meta && "border-success/50 bg-success/5"
      )}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      ) : meta ? (
        <CheckCircle2 className="h-8 w-8 text-success" />
      ) : (
        <UploadCloud
          className={cn(
            "h-8 w-8 transition-transform group-hover:-translate-y-0.5",
            accentColor === "primary" ? "text-primary" : "text-accent"
          )}
        />
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
