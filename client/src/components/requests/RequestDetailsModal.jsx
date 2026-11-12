import React, { useState } from 'react';
import { X, Calendar, Clock, User, Image as ImageIcon, Settings } from 'lucide-react';
import Messaging from './Messaging';
import RequestActionDialog from './RequestActionDialog';

export default function RequestDetailsModal({ request, currentUser, onClose, onRequestUpdated }) {
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(request);

  if (!currentRequest) return null;

  const handleUpdated = (updatedReq) => {
    setCurrentRequest(updatedReq);
    if (onRequestUpdated) onRequestUpdated(updatedReq);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                #{currentRequest.request_id}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                currentRequest.status === 'completed' ? 'bg-green-100 text-green-700' :
                currentRequest.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                currentRequest.status === 'rejected' ? 'bg-red-100 text-red-700' :
                currentRequest.status === 'reassigned' ? 'bg-orange-100 text-orange-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {currentRequest.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mt-1">{currentRequest.subject}</h2>
          </div>

          <div className="flex items-center gap-2">
            {currentRequest.status !== 'completed' && (
              <button
                onClick={() => setShowActionDialog(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Manage Action
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>Requested By: <strong>{currentRequest.user?.name || 'End User'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>Assigned ICTU: <strong>{currentRequest.assigned_ictu?.name || 'Unassigned'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Preferred Schedule: <strong>{currentRequest.preferred_date} at {currentRequest.preferred_time}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Official Schedule:{' '}
                <strong>
                  {currentRequest.scheduled_date ? `${currentRequest.scheduled_date} at ${currentRequest.scheduled_time}` : 'Pending ICTU Approval'}
                </strong>
              </span>
            </div>
          </div>

          {/* Duration & Reasons Banner */}
          {currentRequest.estimated_duration && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 font-medium">
              Estimated Duration: {currentRequest.estimated_duration} minutes
            </div>
          )}

          {currentRequest.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              <strong>Rejection Reason:</strong> {currentRequest.rejection_reason}
            </div>
          )}

          {currentRequest.reassignment_reason && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800">
              <strong>Reassignment Reason:</strong> {currentRequest.reassignment_reason}
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
              {currentRequest.description}
            </p>
          </div>

          {/* Photo Attachments Preview */}
          {currentRequest.attachments?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                Attached Photos ({currentRequest.attachments.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentRequest.attachments.map((att) => (
                  <a
                    key={att.attachment_id}
                    href={`http://localhost:8000/storage/${att.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={`http://localhost:8000/storage/${att.file_path}`}
                      alt={att.file_name}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Chat Thread */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Request Chat Thread</h4>
            <Messaging requestId={currentRequest.request_id} currentUser={currentUser} />
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      {showActionDialog && (
        <RequestActionDialog
          request={currentRequest}
          onUpdated={handleUpdated}
          onClose={() => setShowActionDialog(false)}
        />
      )}
    </div>
  );
}