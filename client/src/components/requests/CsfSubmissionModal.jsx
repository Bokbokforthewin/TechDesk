import React, { useState } from 'react';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';

export default function CsfSubmissionModal({ request, onSuccess, onClose }) {
  const [ratings, setRatings] = useState({
    timeliness: 5,
    quality: 5,
    courtesy: 5,
  });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:8000/api/requests/${request.request_id}/csf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ratings, comments }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit CSF.');

      onSuccess(data.request);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold">Customer Satisfaction Form (CSF)</h3>
            <p className="text-xs text-blue-100">Service Request #{request.request_id}: {request.subject}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600">
            Please rate the assistance provided by <strong>{request.assigned_ictu?.name || 'ICT Staff'}</strong>:
          </p>

          {['timeliness', 'quality', 'courtesy'].map((category) => (
            <div key={category} className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-700 capitalize">{category}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatings({ ...ratings, [category]: star })}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= ratings[category] ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback / Suggestions</label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Your comments help us improve our technical assistance..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Submit Evaluation & Complete Request'}
          </button>
        </form>
      </div>
    </div>
  );
}