import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files) as File[];
      const audioFiles = files.filter(file => file.type.startsWith('audio/'));
      if (audioFiles.length > 0) {
        onFilesSelected(audioFiles);
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const audioFiles = files.filter(file => file.type.startsWith('audio/'));
      if (audioFiles.length > 0) {
        onFilesSelected(audioFiles);
      }
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-zinc-300 rounded-2xl p-12 flex flex-col items-center justify-center text-zinc-500 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer"
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <UploadCloud className="w-12 h-12 mb-4 text-zinc-400" />
      <p className="text-lg font-medium text-zinc-700">Click or drag audio files here</p>
      <p className="text-sm mt-2">Supports MP3, WAV, M4A, etc.</p>
      <input
        id="file-upload"
        type="file"
        multiple
        accept="audio/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
