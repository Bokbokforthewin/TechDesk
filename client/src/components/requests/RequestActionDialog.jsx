import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, UserCheck, CheckSquare, AlertTriangle } from 'lucide-react';

export default function RequestActionDialog({ request, onUpdated, onClose }) {
  const isPendingOrReassigned = ['pending', 'reassigned'].includes(request.status);
  const isInProgress = request.status === 'in_progress';

  const [activeTab, setActiveTab] = useState(isPendingOrReassigned ? 'approve' : 'finish');

  // Form State
  const [scheduledDate, setScheduledDate] = useState(request.preferred_date || '');
  const [scheduledTime, setScheduledTime] = useState(request.preferred_time || '09:00');
  const [estimatedDuration, setEstimatedDuration] = useState(request.estimated_duration || 60);
  const [ictuRemarks, setIctuRemarks] = useState(request.ictu_remarks || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newAssignedIctuId, setNewAssignedIctuId] = useState('');
  const [reassignmentReason, setReassignmentReason] = useState('');

  const [personnelList, setPersonnelList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/ictu-personnel', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPersonnelList(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const token = localStorage.getItem('access_token');

  // Step 1 -> Step 2: Approve Pending or Reassigned Request
  const handleApprove = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/requests/${request.request_id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          estimated_duration: parseInt(estimatedDuration),
          ictu_remarks: ictuRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve request.');

      onUpdated(data.request);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: ICTU marks task finished (Sets to awaiting_csf)
  const handleMarkFinished = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/requests/${request.request_id}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'awaiting_csf',
          ictu_remarks: ictuRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status.');

      onUpdated(data.request);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reassign Task
  const handleReassign = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/requests/${request.request_id}/reassign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_assigned_ictu_id: newAssignedIctuId,
          reassignment_reason: reassignmentReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reassign request.');

      onUpdated(data.request);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reject Request
  const handleReject = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/requests/${request.request_id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject request.');

      onUpdated(data.request);
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
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Manage Request #{request.request_id}
            </h3>
            <p className="text-xs text-slate-500">
              Current Status: <strong className="capitalize">{request.status.replace('_', ' ')}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Dynamic Action Tabs Based On Workflow Stage */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 p-1 text-xs font-semibold text-slate-600">
          {isPendingOrReassigned && (
            <button
              onClick={() => setActiveTab('approve')}
              className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'approve' ? 'bg-white text-green-700 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve & Schedule
            </button>
          )}

          {isInProgress && (
            <button
              onClick={() => setActiveTab('finish')}
              className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'finish' ? 'bg-white text-purple-700 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Task Finished
            </button>
          )}

          <button
            onClick={() => setActiveTab('reassign')}
            className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'reassign' ? 'bg-white text-blue-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Reassign
          </button>

          {isPendingOrReassigned && (
            <button
              onClick={() => setActiveTab('reject')}
              className={`flex-1 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'reject' ? 'bg-white text-red-700 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          )}
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6">
          {/* TAB 1: APPROVE & SET TO IN_PROGRESS */}
          {activeTab === 'approve' && (
            <form onSubmit={handleApprove} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Time</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Duration
                </label>
                <select
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                  <option value={240}>Half Day (4 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ICTU Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={ictuRemarks}
                  onChange={(e) => setIctuRemarks(e.target.value)}
                  placeholder="Notes for the end user..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {loading ? 'Approving...' : 'Approve & Set to In Progress'}
              </button>
            </form>
          )}

          {/* TAB 2: TASK FINISHED (MOVE TO AWAITING_CSF) */}
          {activeTab === 'finish' && (
            <form onSubmit={handleMarkFinished} className="space-y-4">
              <p className="text-xs text-slate-600 bg-purple-50 p-3 rounded-lg border border-purple-100">
                Marking this task as finished will change the status to <strong>Awaiting CSF</strong>. The end user will be prompted to complete the Customer Satisfaction Form before this request is marked as completed.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Final ICTU Remarks</label>
                <textarea
                  rows={3}
                  value={ictuRemarks}
                  onChange={(e) => setIctuRemarks(e.target.value)}
                  placeholder="Summary of service performed..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {loading ? 'Updating...' : 'Finish Task & Request CSF'}
              </button>
            </form>
          )}

          {/* TAB 3: REASSIGN */}
          {activeTab === 'reassign' && (
            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select New ICTU Personnel</label>
                <select
                  required
                  value={newAssignedIctuId}
                  onChange={(e) => setNewAssignedIctuId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Select Member...</option>
                  {personnelList
                    .filter((p) => p.user_id !== request.assigned_ictu_id)
                    .map((p) => (
                      <option key={p.user_id} value={p.user_id}>
                        {p.name} ({p.designation || 'ICT Staff'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Reassignment</label>
                <textarea
                  required
                  rows={3}
                  value={reassignmentReason}
                  onChange={(e) => setReassignmentReason(e.target.value)}
                  placeholder="Explain why this request is being reassigned..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {loading ? 'Transferring...' : 'Reassign Task'}
              </button>
            </form>
          )}

          {/* TAB 4: REJECT */}
          {activeTab === 'reject' && (
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {loading ? 'Rejecting...' : 'Reject & Remove from Schedule'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}