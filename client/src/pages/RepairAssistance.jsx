import React, { useState, useEffect } from 'react';
import RequestForm from '../components/requests/RequestForm';
import Messaging from '../components/requests/Messaging';
import { Hammer, Image, MessageSquare, Plus } from 'lucide-react';

export default function RepairAssistance() {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRequests = () => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/requests?type=repair', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRequests(data));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Repair Assistance</h1>
          <p className="text-sm text-slate-500">Submit requests for hardware and equipment repairs with photo attachments.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Close Form' : 'New Repair Request'}
        </button>
      </div>

      {showForm && (
        <RequestForm
          requestType="repair"
          onSuccess={() => {
            setShowForm(false);
            fetchRequests();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Repair Requests List and Active Conversation View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 font-semibold text-sm text-slate-800">
            Repair Assistance Requests
          </div>
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div
                key={req.request_id}
                onClick={() => setActiveRequest(req)}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                  activeRequest?.request_id === req.request_id ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">#{req.request_id}</span>
                    <h4 className="text-sm font-semibold text-slate-800">{req.subject}</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-medium capitalize">
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{req.description}</p>
                
                {req.attachments?.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                    <Image className="w-3.5 h-3.5" />
                    <span>{req.attachments.length} photo attachment(s)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messaging Box for Selected Request */}
        <div>
          {activeRequest ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Request #{activeRequest.request_id}: {activeRequest.subject}</h3>
                <p className="text-xs text-slate-500 mt-1">{activeRequest.description}</p>
              </div>
              <Messaging requestId={activeRequest.request_id} currentUser={currentUser} />
            </div>
          ) : (
            <div className="h-full min-h-[200px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
              Select a request from the list to view messaging thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}