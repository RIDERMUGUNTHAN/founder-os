'use client';

import { useState, useRef } from 'react';
import { Mic, Camera, Send, X, Check, Loader2 } from 'lucide-react';

interface MobileCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileCaptureModal({ isOpen, onClose }: MobileCaptureModalProps) {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleVoiceToggle = () => {
    const SpeechRec = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
                      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Speech recognition is not supported on this browser. You can type directly.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleCameraSnap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !capturedPhoto) return;
    setIsSubmitting(true);

    try {
      // Post to Conductor or Memory endpoint
      const payload = {
        message: `[Mobile Instant Capture]: ${content.trim()}${
          capturedPhoto ? ' (Photo Document Attached)' : ''
        }`,
      };

      const res = await fetch('/api/conductor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback: save to localStorage if offline
        const queue = JSON.parse(localStorage.getItem('founderos_mobile_queue') || '[]');
        queue.unshift({
          id: Date.now().toString(),
          type: capturedPhoto ? 'photo' : 'note',
          content: content.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        localStorage.setItem('founderos_mobile_queue', JSON.stringify(queue));
      }

      setSuccess(true);
      setTimeout(() => {
        setContent('');
        setCapturedPhoto(null);
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 900);
    } catch {
      // Offline fallback
      const queue = JSON.parse(localStorage.getItem('founderos_mobile_queue') || '[]');
      queue.unshift({
        id: Date.now().toString(),
        type: capturedPhoto ? 'photo' : 'note',
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      localStorage.setItem('founderos_mobile_queue', JSON.stringify(queue));

      setSuccess(true);
      setTimeout(() => {
        setContent('');
        setCapturedPhoto(null);
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-os-border bg-[#0d0d11] p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-os-border pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-mono text-sm font-semibold tracking-wider text-os-text uppercase">
              Instant Mobile Capture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-os-muted hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dump a raw thought, meeting take, client lead, or todo..."
            rows={4}
            className="w-full resize-none rounded-xl border border-os-border bg-black/60 p-3 font-mono text-sm text-os-text placeholder-os-dim focus:border-emerald-500/50 focus:outline-none"
          />

          {capturedPhoto && (
            <div className="relative overflow-hidden rounded-xl border border-os-border">
              <img
                src={capturedPhoto}
                alt="Captured Document"
                className="max-h-40 w-full object-cover"
              />
              <button
                onClick={() => setCapturedPhoto(null)}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors ${
                  isRecording
                    ? 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse'
                    : 'border-os-border bg-os-surface text-os-muted hover:text-os-text'
                }`}
              >
                <Mic className="h-4 w-4" />
                {isRecording ? 'Listening...' : 'Voice'}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 items-center gap-2 rounded-lg border border-os-border bg-os-surface px-3 text-xs font-medium text-os-muted hover:text-os-text transition-colors"
              >
                <Camera className="h-4 w-4" />
                Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraSnap}
              />
            </div>

            <button
              type="button"
              disabled={isSubmitting || (!content.trim() && !capturedPhoto)}
              onClick={handleSubmit}
              className="flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 font-mono text-xs font-semibold text-black transition-all hover:bg-emerald-400 disabled:opacity-40"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <>
                  <Check className="h-4 w-4" /> Captured
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
