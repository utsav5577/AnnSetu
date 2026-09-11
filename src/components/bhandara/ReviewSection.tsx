import React, { useState } from 'react';
import { Review } from '../../types/index.js';
import { api } from '../../services/api.js';
import { Star, MessageSquare, CheckCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface ReviewSectionProps {
  bhandaraId: string;
  reviews: Review[];
  onReviewAdded: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  bhandaraId,
  reviews,
  onReviewAdded
}) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [infoAccuracyRating, setInfoAccuracyRating] = useState<number>(5);
  const [locationAccuracyRating, setLocationAccuracyRating] = useState<number>(5);
  const [timingAccuracyRating, setTimingAccuracyRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [attended, setAttended] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.submitReview(bhandaraId, {
        overallRating,
        infoAccuracyRating,
        locationAccuracyRating,
        timingAccuracyRating,
        comments,
        attended
      });

      if (res.success) {
        setSuccessMessage('Thank you! Your verified review has been published.');
        setShowForm(false);
        setComments('');
        onReviewAdded();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect && onSelect(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'fill-amber-400 text-amber-500' 
                  : 'text-stone-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">Devotee Reviews & Accuracy Ratings</h4>
            <p className="text-[11px] text-stone-500">Real feedback from community members who visited</p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            + Write a Review
          </button>
        )}
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-4 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-800 text-sm">Did you visit this Bhandara?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAttended(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  attended ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                Yes, I visited
              </button>
              <button
                type="button"
                onClick={() => setAttended(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  !attended ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="font-medium text-stone-700">Overall Experience:</span>
              {renderStars(overallRating, true, setOverallRating)}
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="font-medium text-stone-700">Information Accuracy:</span>
              {renderStars(infoAccuracyRating, true, setInfoAccuracyRating)}
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="font-medium text-stone-700">Location Accuracy:</span>
              {renderStars(locationAccuracyRating, true, setLocationAccuracyRating)}
            </div>
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="font-medium text-stone-700">Timing Accuracy:</span>
              {renderStars(timingAccuracyRating, true, setTimingAccuracyRating)}
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Your Feedback & Experience:</label>
            <textarea
              rows={3}
              placeholder="Was the food fresh? How was the queue management? Any special facilities for elders?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-6 text-stone-500 text-xs">
            <p>No reviews posted yet for this event.</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Be the first to share your experience with fellow devotees!</p>
          </div>
        ) : (
          reviews.map(rev => (
            <div key={rev.id} className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-stone-900">{rev.userName}</span>
                      {rev.attended && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          <UserCheck className="w-3 h-3" />
                          Visited
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {renderStars(rev.overallRating)}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">{rev.comments}</p>

              {/* Accuracy tags */}
              <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-stone-500">
                <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  Info: <strong className="text-stone-700">{rev.infoAccuracyRating}/5</strong>
                </span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  Location: <strong className="text-stone-700">{rev.locationAccuracyRating}/5</strong>
                </span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  Timing: <strong className="text-stone-700">{rev.timingAccuracyRating}/5</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
