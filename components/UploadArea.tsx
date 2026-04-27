"use client";

import { useState, useRef } from "react";

interface UploadAreaProps {
  onUploadSuccess?: (
    fileName: string,
    size: number,
    chunksProcessed: number
  ) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

interface UploadMessage {
  type: "success" | "error";
  message: string;
}

export default function UploadArea({
  onUploadSuccess,
  onUploadStart,
  onUploadEnd,
}: UploadAreaProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMessage, setUploadMessage] = useState<UploadMessage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadMessage({
        type: "error",
        message: "Apenas DOCX e PDF são aceitos",
      });
      return false;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setUploadMessage({
        type: "error",
        message: "Arquivo muito grande (máximo 50MB)",
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) {
      setUploadState("error");
      setTimeout(() => {
        setUploadState("idle");
        setUploadMessage(null);
      }, 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadState("uploading");
    onUploadStart?.();
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadState("success");
          setUploadMessage({
            type: "success",
            message: "Arquivo processado com sucesso!",
          });

          onUploadSuccess?.(
            response.fileName,
            file.size,
            response.chunksProcessed
          );

          // Limpar mensagem após 3 segundos
          setTimeout(() => {
            setUploadState("idle");
            setUploadMessage(null);
            setUploadProgress(0);
          }, 3000);
        } else {
          const error = JSON.parse(xhr.responseText);
          setUploadState("error");
          setUploadMessage({
            type: "error",
            message: error.error || "Erro ao fazer upload",
          });
          setTimeout(() => {
            setUploadState("idle");
            setUploadMessage(null);
          }, 3000);
        }
        onUploadEnd?.();
      });

      xhr.addEventListener("error", () => {
        setUploadState("error");
        setUploadMessage({
          type: "error",
          message: "Erro de conexão. Tente novamente.",
        });
        setTimeout(() => {
          setUploadState("idle");
          setUploadMessage(null);
        }, 3000);
        onUploadEnd?.();
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error) {
      setUploadState("error");
      setUploadMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
      setTimeout(() => {
        setUploadState("idle");
        setUploadMessage(null);
      }, 3000);
      onUploadEnd?.();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-slate-300 dark:border-slate-700 hover:border-primary/50"
        } ${uploadState === "uploading" ? "opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          disabled={uploadState === "uploading"}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 py-2">
          <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-600">
            {uploadState === "uploading" ? "hourglass_empty" : "upload_file"}
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {uploadState === "uploading"
                ? `Enviando... ${uploadProgress}%`
                : "Arraste ou selecione"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {uploadState === "uploading"
                ? "Processando documento..."
                : "PDF ou DOCX"}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {uploadState === "uploading" && (
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Hidden button for mobile */}
      <button
        onClick={handleButtonClick}
        disabled={uploadState === "uploading"}
        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-lg font-medium text-sm transition-colors"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        Selecionar arquivo
      </button>

      {/* Message */}
      {uploadMessage && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm font-medium transition-all ${
            uploadMessage.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              {uploadMessage.type === "success" ? "check_circle" : "error"}
            </span>
            {uploadMessage.message}
          </div>
        </div>
      )}
    </div>
  );
}
