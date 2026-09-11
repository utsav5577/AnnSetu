import React, { useState } from 'react';
import { ReportReason } from '../../types/index.js';
import { api } from '../../services/api.js';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ReportModalProps {
  bhandaraId: string;
  bhandaraName: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_OPTIONS: { reason: ReportReason; label: string; desc: string }[] = [
  { reason: 'FAKE_EVENT', label: 'Fake / Non-existent Event', desc: 'No Bhandara is taking place at this venue' },
  { reason: 'WRONG_LOCATION', label: 'Wrong Location or Address', desc: 'The venue address or pin is inaccurate' },
  { reason: 'WRONG_DATE', label: 'Wrong Date', desc: 'Scheduled on another date or already over' },
  { reason: 'WRONG_TIME', label: 'Wrong Timings', desc: 'Start or end hours are incorrect' },
  { reason: 'EVENT_CANCELLED', label: 'Event Cancelled', desc: 'Organizers called off the Bhandara' },
  { reason: 'DUPLICATE', label: 'Duplicate Entry', desc: 'This Bhandara is already listed on AnnSetu' },
  { reason: 'MISLEADING_INFO', label: 'Misleading Information', desc: 'Incorrect food specialty, claims, or organizer' },
  { reason: 'INAPPROPRIATE_IMAGE', label: 'Inappropriate Media', desc: 'Poster or photo contains spam or bad content' },
  { reason: 'OTHER', label: 'Other Issue', desc: 'Any other discrepancy' }
];

export const ReportModal: React.FC<ReportModalProps> = ({ 
  bhandaraId, 
  bhandaraName, 
  isOpen, 
  onClose 
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('WRONG_LOCATION');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.reportBhandara(bhandaraId, selectedReason, details);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1800);
      } else {
        setErrorMessage(res.message || 'Failed to submit report.');
      }
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFFDF9] border border-stone-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Report Bhandara</h3>
              <p className="text-[11px] text-stone-500 truncate max-w-[240px]">{bhandaraName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Report Received</h4>
            <p className="text-xs text-stone-600">
              Our moderation team will review this entry immediately. Thank you for keeping AnnSetu accurate and reliable.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs">
            
            <div>
              <label className="font-bold text-stone-700 block mb-2">Reason for Report:</label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {REPORT_OPTIONS.map(opt => (
                  <label
                    key={opt.reason}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition-colors ${
                      selectedReason === opt.reason
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={opt.reason}
                      checked={selectedReason === opt.reason}
                      onChange={() => setSelectedReason(opt.reason)}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <p className="font-bold">{opt.label}</p>
                      <p className="text-[10px] text-stone-500 font-normal">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Additional Details (Optional):</label>
              <textarea
                rows={3}
                placeholder="Explain what is inaccurate or provide a reference..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-rose-500 focus:bg-white text-xs"
              />
            </div>

            {errorMessage && (
              <p className="text-rose-600 font-medium">{errorMessage}</p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
