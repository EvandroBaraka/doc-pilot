"use client";

import { useState } from "react";
import UploadArea from "../components/UploadArea";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  chunksProcessed: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({
  isOpen = true,
  onClose,
  isMobile = false,
}: SidebarProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUploadSuccess = (
    fileName: string,
    size: number,
    chunksProcessed: number
  ) => {
    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      size,
      uploadedAt: new Date().toLocaleString("pt-BR"),
      chunksProcessed,
    };

    setUploadedFiles((prev) => [newFile, ...prev]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined">cloud_upload</span>
          Documentos
        </h2>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <UploadArea
          onUploadSuccess={handleUploadSuccess}
          onUploadStart={() => {}}
          onUploadEnd={() => {}}
        />
      </div>

      {/* Uploaded Files List */}
      <div className="flex-1 overflow-y-auto">
        {uploadedFiles.length === 0 ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
            <p className="material-symbols-outlined text-3xl text-center mb-2">
              folder_open
            </p>
            Nenhum documento enviado ainda
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-primary shrink-0">
                      {file.name.endsWith(".pdf") ? "picture_as_pdf" : "description"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm text-slate-400 hover:text-red-500">
                      delete
                    </span>
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span>Chunks processados</span>
                    <span className="font-semibold">{file.chunksProcessed}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span>Data</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Máximo 50MB por arquivo<br />
          Formatos: PDF, DOCX
        </p>
      </div>
    </div>
  );

  // Desktop - Sidebar fixa
  if (!isMobile) {
    return (
      <aside className="hidden lg:flex lg:w-72 flex-col bg-slate-50 dark:bg-slate-950">
        {sidebarContent}
      </aside>
    );
  }

  // Mobile - Drawer overlay
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
