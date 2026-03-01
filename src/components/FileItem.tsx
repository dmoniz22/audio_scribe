import React, { useState } from 'react';
import { FileAudio, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { AudioAnalysisResult } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export type FileStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface AudioFile {
  id: string;
  file: File;
  status: FileStatus;
  result?: AudioAnalysisResult;
  error?: string;
}

interface FileItemProps {
  file: AudioFile;
}

export const FileItem: React.FC<FileItemProps> = ({ file }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.result?.transcription) {
      navigator.clipboard.writeText(JSON.stringify(file.result.transcription, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div 
        className={`p-4 flex items-center justify-between ${file.status === 'completed' ? 'cursor-pointer hover:bg-zinc-50' : ''}`}
        onClick={() => file.status === 'completed' && setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <FileAudio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-zinc-900 truncate max-w-[200px] sm:max-w-xs">{file.file.name}</h3>
            <p className="text-sm text-zinc-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {file.status === 'pending' && <span className="text-sm text-zinc-500">Waiting...</span>}
          {file.status === 'processing' && (
            <div className="flex items-center text-indigo-600 space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Processing</span>
            </div>
          )}
          {file.status === 'completed' && (
            <div className="flex items-center text-emerald-600 space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Completed</span>
              {expanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
            </div>
          )}
          {file.status === 'error' && (
            <div className="flex items-center text-red-600 space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Failed</span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && file.result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-100 bg-zinc-50/50"
          >
            <div className="p-6 space-y-8">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Summary</h4>
                <div className="prose prose-zinc prose-sm max-w-none bg-white p-6 rounded-xl border border-zinc-200">
                  <ReactMarkdown>{file.result.summary}</ReactMarkdown>
                </div>
              </div>
              
              {file.result.actionItems && file.result.actionItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">Action Items</h4>
                  <ul className="space-y-2 bg-white p-6 rounded-xl border border-zinc-200">
                    {file.result.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span className="text-zinc-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Transcription (JSON)</h4>
                  <button 
                    onClick={handleCopyJson}
                    className="flex items-center space-x-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors bg-white px-2.5 py-1.5 rounded-md border border-zinc-200 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 h-80 overflow-y-auto">
                  <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {JSON.stringify(file.result.transcription, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
