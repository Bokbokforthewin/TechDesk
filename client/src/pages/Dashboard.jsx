import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  User, 
  Activity,
  ArrowRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import RequestDetailsModal from '../components/requests/RequestDetailsModal';

export default function Dashboard() {
  const [data, setData] = useState({
    kpis: { pending: 0, in_progress: 0, completed: 0 },
    in_progress_tasks: [],
    pending_requests: [],
    completed_requests: [],
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'technical' | 'repair'

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDashboardData = (isManual = false) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (isManual) setIsRefreshing(true);

    fetch('http://localhost:8000/api/dashboard/live', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard data');
        return res.json();
      })
      .then((resData) => {
        setData({
          kpis: resData.kpis || { pending: 0, in_progress: 0, completed: 0 },
          in_progress_tasks: Array.isArray(resData.in_progress_tasks) ? resData.in_progress_tasks : [],
          pending_requests: Array.isArray(resData.pending_requests) ? resData.pending_requests : [],
          completed_requests: Array.isArray(resData.completed_requests) ? resData.completed_requests : [],
        });
        setLoading(false);
      })
      .catch((err) => console.error('Dashboard error:', err))
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    fetchDashboardData();

    // Real-time automatic background polling every 3 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Filter helper
  const filterList = (list) => {
    if (filterType === 'all') return list;
    return list.filter((item) => item.request_type === filterType);
  };

  const pendingList = filterList(data.pending_requests);
  const completedList = filterList(data.completed_requests);

  return (
    <div className="space-y-6">
      {/* Header, Type Filter & Live Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Operational Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time monitoring of technical and repair assistance tasks.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Filter Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-semibold text-slate-600 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('technical')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'technical' ? 'bg-blue-600 text-white' : 'hover:text-slate-900'
              }`}
            >
              Technical
            </button>
            <button
              onClick={() => setFilterType('repair')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'repair' ? 'bg-orange-600 text-white' : 'hover:text-slate-900'
              }`}
            >
              Repair
            </button>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Manual Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Polling</span>
          </div>
        </div>
      </div>

      {/* THREE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Pending Requests */}
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Requests</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-slate-900">{data.kpis.pending}</h2>
            <p className="text-xs text-slate-500 mt-1">Awaiting ICTU approval / scheduling</p>
          </div>
        </div>

        {/* KPI 2: IN PROGRESS (THE FEATURED & LARGEST KPI CARD) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-300 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Active In-Progress Tasks
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
              Primary Metric
            </span>
          </div>

          <div className="my-4 z-10 flex items-baseline gap-4">
            <h2 className="text-5xl font-black tracking-tight">{data.kpis.in_progress}</h2>
            <span className="text-sm text-blue-200 font-medium">Ongoing & Scheduled Operations</span>
          </div>

          {/* Active In-Progress Quick Sub-List */}
          <div className="z-10 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-2">
            <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
              Current Active Personnel Assignments
            </p>
            {data.in_progress_tasks.length === 0 ? (
              <p className="text-xs text-blue-100 italic">No tasks currently in progress.</p>
            ) : (
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {data.in_progress_tasks.map((task) => (
                  <div
                    key={task.request_id}
                    onClick={() => setSelectedRequest(task)}
                    className="flex justify-between items-center text-xs bg-white/10 hover:bg-white/20 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <span className="font-semibold truncate max-w-[60%]">
                      #{task.request_id} {task.subject}
                    </span>
                    <span className="text-[10px] text-blue-200">
                      Assigned: {task.assigned_ictu?.name?.split(' ')[0] || 'ICT Staff'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Completed Requests */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed Requests</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-4xl font-extrabold text-slate-900">{data.kpis.completed}</h2>
            <p className="text-xs text-slate-500 mt-1">Successfully resolved & CSF evaluated</p>
          </div>
        </div>

      </div>

      {/* TWO SIDE-BY-SIDE LIST CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT CARD: PENDING REQUESTS LIST */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-800">Pending Requests</h3>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {pendingList.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[420px]">
            {loading ? (
              <p className="text-center text-xs text-slate-400 py-8">Loading pending items...</p>
            ) : pendingList.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No pending requests found.</p>
            ) : (
              pendingList.map((req) => (
                <div
                  key={req.request_id}
                  onClick={() => setSelectedRequest(req)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        #{req.request_id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        req.request_type === 'technical' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {req.request_type}
                      </span>
                      {req.status === 'reassigned' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Reassigned
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {req.subject}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {req.user?.name || 'End User'}
                    </span>
                    <span className="text-blue-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Review & Approve <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT CARD: COMPLETED REQUESTS LIST */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Completed Requests</h3>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {completedList.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[420px]">
            {loading ? (
              <p className="text-center text-xs text-slate-400 py-8">Loading completed items...</p>
            ) : completedList.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No completed requests recorded yet.</p>
            ) : (
              completedList.map((req) => (
                <div
                  key={req.request_id}
                  onClick={() => setSelectedRequest(req)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        #{req.request_id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {req.updated_at ? new Date(req.updated_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {req.subject}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {req.user?.name || 'End User'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      By: {req.assigned_ictu?.name || 'ICT Staff'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Interactive Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
          onRequestUpdated={() => fetchDashboardData()}
        />
      )}
    </div>
  );
}