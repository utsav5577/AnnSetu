import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface PosterViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterUrl: string;
  eventName: string;
}

export const PosterViewerModal: React.FC<PosterViewerModalProps> = ({
  isOpen,
  onClose,
  posterUrl,
  eventName
}) => {
  if (!isOpen || !posterUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <span className="text-sm font-bold truncate max-w-md">{eventName} — Invitation Poster</span>
          <div className="flex items-center gap-2">
            <a
              href={posterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Open full size"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Poster Image */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-stone-900 max-h-[80vh] flex items-center justify-center">
          <img
            src={posterUrl}
            alt={eventName}
            className="max-h-[80vh] max-w-full object-contain rounded-2xl"
            referrerPolicy="no-referrer"
          />
        </div>

      </div>
    </div>
  );
};
