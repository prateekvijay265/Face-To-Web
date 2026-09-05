"use client";
import React, { useCallback, useState } from "react";
import { UploadCloud, FileImage, XCircle } from "lucide-react";

export function UploadDropzone({ onUpload, isLoading = false }: { onUpload: (file: File) => void, isLoading?: boolean }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported format. Use JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }
    onUpload(file);
  }, [onUpload]);


  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);
  


  return (
    <div 
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-xl flex flex-col items-center justify-center py-16 px-4 text-center cursor-pointer transition-all duration-200 border-2 border-dashed group
        ${dragActive ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--muted)]'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !isLoading && document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        className="hidden" 
        accept="image/jpeg,image/png,image/webp" 
        onChange={handleChange} 
      />
      
      {error ? (
        <div className="flex flex-col items-center gap-3 text-[var(--danger)]">
          <XCircle size={40} className="opacity-80" />
          <div className="flex flex-col">
            <span className="font-bold tracking-wide uppercase text-sm">Upload Error</span>
            <span className="text-xs font-mono opacity-80 mt-1">{error}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full bg-[var(--surface-2)] text-[var(--accent)] transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
             <UploadCloud size={32} />
          </div>
          <div className="flex flex-col gap-1">
             <h3 className="font-bold text-sm tracking-wide uppercase">Input Face Evidence</h3>
             <p className="text-xs text-[var(--muted)]">Drag & drop or click to upload</p>
          </div>
          <div className="flex gap-4 mt-2 font-mono text-[10px] text-[var(--muted)] uppercase opacity-70">
             <span className="flex items-center gap-1"><FileImage size={12}/> JPG, PNG, WEBP</span>
             <span>Max 10MB</span>
          </div>
        </div>
      )}
    </div>
  );
}
