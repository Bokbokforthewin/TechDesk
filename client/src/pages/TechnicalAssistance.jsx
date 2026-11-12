import React, { useState, useEffect } from 'react';
import RequestForm from '../components/requests/RequestForm';
import RequestDetailsModal from '../components/requests/RequestDetailsModal';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Wrench } from 'lucide-react';

export default function TechnicalAssistance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRequests = () => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/requests?type=technical', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleEmptyCellClick = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(formattedDate);
    setShowFormModal(true);
  };

  const handleRequestClick = (e, req) => {
    e.stopPropagation(); // Prevents triggering the empty cell create event
    setSelectedRequest(req);
  };

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Technical Assistance Calendar</h1>
          <p className="text-sm text-slate-500">
            Click an existing task to view details and chat, or click an empty day slot to book new technical assistance.
          </p>
        </div>
        <button
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDateStr(today);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center font-semibold text-xs text-slate-400 mb-3 uppercase tracking-wider">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRequests = requests.filter(r => r.preferred_date === dateStr || r.scheduled_date === dateStr);

            return (
              <div
                key={day}
                onClick={() => handleEmptyCellClick(day)}
                className="min-h-[110px] p-2 bg-white border border-slate-200 hover:border-blue-400 rounded-xl flex flex-col justify-between transition-all cursor-pointer group hover:shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">{day}</span>
                  {dayRequests.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayRequests.length}
                    </span>
                  )}
                </div>

                {/* Display Tasks inside Grid Slot */}
                <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[70px]">
                  {dayRequests.map((req) => (
                    <div
                      key={req.request_id}
                      onClick={(e) => handleRequestClick(e, req)}
                      className={`p-1.5 rounded text-[10px] font-semibold flex items-center justify-between border transition-all ${
                        req.status === 'approved' ? 'bg-green-50 text-green-800 border-green-200' :
                        req.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="truncate max-w-[80%]">#{req.request_id} {req.subject}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  + Add request
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Creation Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full">
            <RequestForm
              requestType="technical"
              initialDate={selectedDateStr}
              onSuccess={() => {
                setShowFormModal(false);
                fetchRequests();
              }}
              onCancel={() => setShowFormModal(false)}
            />
          </div>
        </div>
      )}

      {/* Request Details & Chat Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}