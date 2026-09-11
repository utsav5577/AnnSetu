import React, { useState } from 'react';
import { Bhandara } from '../../types/index.js';
import { api } from '../../services/api.js';
import { Check, X, ThumbsUp, ThumbsDown, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface CommunityConfirmationWidgetProps {
  bhandara: Bhandara;
  onConfirmationSuccess: (updated: Bhandara) => void;
}

export const CommunityConfirmationWidget: React.FC<CommunityConfirmationWidgetProps> = ({ 
  bhandara, 
  onConfirmationSuccess 
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  const handleVote = async (isHappening: boolean) => {
    setIsSubmitting(true);
    try {
      const res = await api.confirmHappening(bhandara.id, isHappening, note);
      if (res.success && res.data) {
        setHasConfirmed(true);
        setFeedbackMessage(res.message || 'Thank you for confirming event status!');
        onConfirmationSuccess(res.data);
      } else {
        setFeedbackMessage(res.message || 'Could not record confirmation.');
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      setFeedbackMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-orange-200/80 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-1.5 text-orange-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Community Verification</span>
          </div>
          <h4 className="text-base font-bold text-stone-900 mt-0.5">
            Are you at this venue? Is it happening right now?
          </h4>
          <p className="text-xs text-stone-600 mt-1">
            Help other devotees know whether food is currently being served.
          </p>
        </div>

        {/* Tally */}
        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{bhandara.positiveConfirmationsCount} Yes</span>
          </div>
          <div className="flex items-center gap-1 font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{bhandara.negativeConfirmationsCount} No</span>
          </div>
        </div>

      </div>

      {/* Action or Success */}
      {hasConfirmed ? (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          
          {/* Note toggle */}
          {showNoteInput && (
            <div>
              <input
                type="text"
                placeholder="Optional ground note: e.g., 'Long queue', 'Serving hot kheer', 'Prasad packing allowed'..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
                className="w-full text-xs p-2.5 bg-white border border-orange-200 rounded-xl focus:outline-hidden focus:border-orange-500"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleVote(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              YES, Happening Now
            </button>

            <button
              onClick={() => handleVote(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              NO, It's Not Active
            </button>

            {!showNoteInput && (
              <button
                onClick={() => setShowNoteInput(true)}
                className="text-xs text-stone-500 hover:text-orange-700 flex items-center gap-1 ml-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Add ground note
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
