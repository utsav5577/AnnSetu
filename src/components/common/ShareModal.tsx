import React, { useState } from 'react';
import { Bhandara } from '../../types/index.js';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { api } from '../../services/api.js';

interface ShareModalProps {
  bhandara: Bhandara | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ bhandara, isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !bhandara) return null;

  const shareUrl = `${window.location.origin}/bhandara/${bhandara.slug || bhandara.id}`;
  const shareText = `🙏 Sacred Bhandara / Mahaprasad\n\n📌 *${bhandara.name}*\n📍 Venue: ${bhandara.venue}, ${bhandara.locality}, ${bhandara.city}\n🗓️ Date: ${bhandara.eventDate}\n⏰ Time: ${bhandara.startTime} - ${bhandara.endTime} IST\n🍽️ Prasad: ${bhandara.foodType}\n\nView live status and get Google Maps directions on AnnSetu:\n${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    api.trackEvent(bhandara.id, 'share');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    api.trackEvent(bhandara.id, 'share');
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFDF9] border border-stone-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-stone-900">Share Bhandara with Devotees</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <h4 className="font-bold text-stone-900">{bhandara.name}</h4>
            <p className="text-stone-500 text-[11px]">{bhandara.venue}, {bhandara.locality}</p>
            <p className="text-orange-700 font-semibold">{bhandara.eventDate} • {bhandara.startTime} - {bhandara.endTime} IST</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleWhatsApp}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Event Details & Link'}</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400 text-center">
            Sharing helps fellow devotees and pilgrims receive sacred Mahaprasad without confusion.
          </p>

        </div>

      </div>
    </div>
  );
};
