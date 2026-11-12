import React, { useState, useEffect } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';

export default function RequestForm({ 
  requestType, 
  initialDate = '', 
  initialTime = '', 
  onSuccess, 
  onCancel 
}) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState(initialDate);
  const [preferredTime, setPreferredTime] = useState(initialTime || '09:00');
  const [assignedIctuId, setAssignedIctuId] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [personnelList, setPersonnelList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep internal date/time aligned when props change
    if (initialDate) setPreferredDate(initialDate);
    if (initialTime) setPreferredTime(initialTime);
  }, [initialDate, initialTime]);

  // Fetch subject choices filtered by requestType
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`http://localhost:8000/api/subjects?type=${requestType}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubjectsList(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching subjects:', err));
  }, [requestType]);

  // Fetch ICTU Personnel list for dropdown selection
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/ictu-personnel', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPersonnelList(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching personnel:', err));
  }, []);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('request_type', requestType);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('preferred_date', preferredDate);
    formData.append('preferred_time', preferredTime);
    formData.append('assigned_ictu_id', assignedIctuId);

    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:8000/api/requests', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request.');
      }

      if (onSuccess) onSuccess(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="border-b border-slate-100 pb-3 mb-4">
        <h3 className="text-base font-bold text-slate-800 capitalize">
          New {requestType} Assistance Request
        </h3>
        <p className="text-xs text-slate-500">Fill in the details below to submit your request.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Nature of Problem</label>
        <select
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        >
          <option value="">Select Problem Context...</option>
          {subjectsList.map((sub) => (
            <option key={sub.subject_id} value={sub.title}>
              {sub.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Description</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
          <input
            type="date"
            required
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time</label>
          <input
            type="time"
            required
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Select ICTU Personnel</label>
        <select
          required
          value={assignedIctuId}
          onChange={(e) => setAssignedIctuId(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        >
          <option value="">Select Personnel...</option>
          {personnelList.map((person) => (
            <option key={person.user_id} value={person.user_id}>
              {person.name} ({person.designation || 'ICT Staff'})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Photo Attachments (Optional)
        </label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50 text-xs font-medium text-slate-700">
            <Upload className="w-4 h-4 text-slate-500" />
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-slate-400">JPG, PNG supported</span>
        </div>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {previews.map((src, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200">
                <img src={src} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-0.5 right-0.5 p-0.5 bg-slate-900/70 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}