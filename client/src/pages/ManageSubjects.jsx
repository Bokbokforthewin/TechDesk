import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState('');
  const [requestType, setRequestType] = useState('both');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSubjects = () => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/subjects', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:8000/api/subjects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, request_type: requestType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add subject.');

      setTitle('');
      setMessage('New subject category created successfully!');
      fetchSubjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject option?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:8000/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Request Subjects</h1>
        <p className="text-sm text-slate-500">Add or manage hardcoded subject options for user assistance requests.</p>
      </div>

      {/* Add New Subject Form */}
      <form onSubmit={handleAddSubject} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600" />
          Add Predefined Subject
        </h3>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Title / Context</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi Connectivity Issue"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Applies To</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="both">Both (Technical & Repair)</option>
              <option value="technical">Technical Assistance Only</option>
              <option value="repair">Repair Assistance Only</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Saving...' : 'Add Subject'}
        </button>
      </form>

      {/* Subjects List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 font-semibold text-sm text-slate-800">
          Existing Predefined Subjects ({subjects.length})
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 font-semibold">Subject Title</th>
              <th className="px-6 py-3 font-semibold">Category Type</th>
              <th className="px-6 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((sub) => (
              <tr key={sub.subject_id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-800">{sub.title}</td>
                <td className="px-6 py-3 capitalize text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">
                    {sub.request_type}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => handleDelete(sub.subject_id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}