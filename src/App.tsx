/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { FileItem, AudioFile } from './components/FileItem';
import { analyzeAudio } from './services/gemini';
import { Mic2, LayoutList } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<AudioFile[]>([]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const newAudioFiles: AudioFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newAudioFiles]);
    
    // Process files
    newAudioFiles.forEach(audioFile => {
      processFile(audioFile);
    });
  }, []);

  const processFile = async (audioFile: AudioFile) => {
    setFiles(prev => prev.map(f => f.id === audioFile.id ? { ...f, status: 'processing' } : f));
    
    try {
      const result = await analyzeAudio(audioFile.file);
      setFiles(prev => prev.map(f => f.id === audioFile.id ? { ...f, status: 'completed', result } : f));
    } catch (error) {
      console.error("Error processing file:", error);
      setFiles(prev => prev.map(f => f.id === audioFile.id ? { ...f, status: 'error', error: String(error) } : f));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Mic2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">AudioScribe</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-4">
            Transform Audio into Action
          </h2>
          <p className="text-lg text-zinc-600">
            Upload your meetings, interviews, or voice notes. We'll transcribe them, generate a detailed summary, and extract key action items automatically.
          </p>
        </div>

        <div className="mb-12">
          <FileUpload onFilesSelected={handleFilesSelected} />
        </div>

        {files.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-zinc-200">
              <LayoutList className="w-5 h-5 text-zinc-400" />
              <h3 className="text-lg font-medium">Processed Files</h3>
              <span className="bg-zinc-100 text-zinc-600 py-0.5 px-2.5 rounded-full text-sm font-medium">
                {files.length}
              </span>
            </div>
            
            <div className="space-y-4">
              {files.map(file => (
                <FileItem key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
