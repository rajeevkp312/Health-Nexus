import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Trash2, Edit, Eye, Save, X } from 'lucide-react';

export default function ModernReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    appointmentId: '',
    pid: '',
    did: '',
    patientName: '',
    doctorName: '',
    doctorSpecialty: '',
    chiefComplaint: '',
    assessment: '',
    plan: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/reports');
      setReports(res.data?.value || []);
    } catch (e) {
      console.error('Load reports error', e);
      toast({ title: 'Failed to load reports', variant: 'destructive', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ appointmentId: '', pid: '', did: '', patientName: '', doctorName: '', doctorSpecialty: '', chiefComplaint: '', assessment: '', plan: '' });

  const createReport = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/reports', form);
      if (res.data?.msg === 'Success') {
        toast({ title: 'Report created', duration: 2000 });
        setCreating(false);
        resetForm();
        load();
      } else {
        toast({ title: 'Create failed', description: res.data?.msg || 'Try again', variant: 'destructive', duration: 2000 });
      }
    } catch (e) {
      console.error('Create report error', e);
      toast({ title: 'Network error', variant: 'destructive', duration: 2000 });
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      appointmentId: r.appointmentId,
      pid: r.pid,
      did: r.did,
      patientName: r.patientName || '',
      doctorName: r.doctorName || '',
      doctorSpecialty: r.doctorSpecialty || '',
      chiefComplaint: r.chiefComplaint || '',
      assessment: r.assessment || '',
      plan: r.plan || '',
    });
  };

  const saveEdit = async () => {
    try {
      const res = await axios.put(`http://localhost:8000/api/reports/${editingId}`, form);
      if (res.data?.msg === 'Success') {
        toast({ title: 'Report updated', duration: 2000 });
        setEditingId(null);
        resetForm();
        load();
      } else {
        toast({ title: 'Update failed', description: res.data?.msg || 'Try again', variant: 'destructive', duration: 2000 });
      }
    } catch (e) {
      console.error('Update report error', e);
      toast({ title: 'Network error', variant: 'destructive', duration: 2000 });
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    try {
      const res = await axios.delete(`http://localhost:8000/api/reports/${id}`);
      if (res.data?.msg === 'Success') {
        toast({ title: 'Report deleted', duration: 2000 });
        setReports(prev => prev.filter(r => r._id !== id));
      } else {
        toast({ title: 'Delete failed', variant: 'destructive', duration: 2000 });
      }
    } catch (e) {
      console.error('Delete report error', e);
      toast({ title: 'Network error', variant: 'destructive', duration: 2000 });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4">
      {/* Header */}
      <div className="bg-white border rounded-lg p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-2 rounded-full"><FileText className="h-5 w-5 text-indigo-600" /></div>
          <div>
            <h2 className="text-lg font-semibold">Medical Reports</h2>
            <p className="text-sm text-gray-600">Manage all generated reports</p>
          </div>
        </div>
        <Button size="sm" onClick={() => { setCreating(p => !p); setEditingId(null); resetForm(); }}>
          <Plus className="h-4 w-4 mr-1" /> New Report
        </Button>
      </div>

      {/* Create/Edit Panel */}
      {(creating || editingId) && (
        <div className="bg-white border rounded-lg p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className="border rounded p-2" placeholder="Appointment ID" value={form.appointmentId} onChange={e => setForm({ ...form, appointmentId: e.target.value })} />
            <input className="border rounded p-2" placeholder="Patient ID (pid)" value={form.pid} onChange={e => setForm({ ...form, pid: e.target.value })} />
            <input className="border rounded p-2" placeholder="Doctor ID (did)" value={form.did} onChange={e => setForm({ ...form, did: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className="border rounded p-2" placeholder="Patient Name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
            <input className="border rounded p-2" placeholder="Doctor Name" value={form.doctorName} onChange={e => setForm({ ...form, doctorName: e.target.value })} />
            <input className="border rounded p-2" placeholder="Specialty" value={form.doctorSpecialty} onChange={e => setForm({ ...form, doctorSpecialty: e.target.value })} />
          </div>
          <textarea className="border rounded p-2 w-full h-20" placeholder="Chief Complaint" value={form.chiefComplaint} onChange={e => setForm({ ...form, chiefComplaint: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <textarea className="border rounded p-2 w-full h-24" placeholder="Assessment" value={form.assessment} onChange={e => setForm({ ...form, assessment: e.target.value })} />
            <textarea className="border rounded p-2 w-full h-24" placeholder="Plan" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setCreating(false); setEditingId(null); }}><X className="h-4 w-4 mr-1" />Cancel</Button>
            {editingId ? (
              <Button size="sm" onClick={saveEdit}><Save className="h-4 w-4 mr-1" />Save</Button>
            ) : (
              <Button size="sm" onClick={createReport}><Save className="h-4 w-4 mr-1" />Create</Button>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 p-3 border-b">
          <div className="col-span-3">Report / Appointment</div>
          <div className="col-span-3">Patient</div>
          <div className="col-span-3">Doctor</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {reports.map(r => (
            <div key={r._id} className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-3">
                  <div className="text-sm font-medium text-gray-900">{r._id}</div>
                  <div className="text-xs text-gray-600">Appt: {r.appointmentId}</div>
                </div>
                <div className="sm:col-span-3">
                  <div className="text-sm text-gray-900">{r.patientName || '—'}</div>
                  <div className="text-xs text-gray-600">PID: {r.pid}</div>
                </div>
                <div className="sm:col-span-3">
                  <div className="text-sm text-gray-900">{r.doctorName || '—'}</div>
                  <div className="text-xs text-gray-600">{r.doctorSpecialty || '—'}</div>
                </div>
                <div className="sm:col-span-2 text-sm text-gray-800">{new Date(r.createdAt).toLocaleDateString('en-GB')}</div>
                <div className="sm:col-span-1 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(r)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50" onClick={() => del(r._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {/* Mobile detail */}
              <div className="sm:hidden mt-2 text-xs text-gray-700">
                <div><span className="font-medium">Chief Complaint:</span> {r.chiefComplaint || '—'}</div>
                <div><span className="font-medium">Assessment:</span> {r.assessment || '—'}</div>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="p-6 text-center text-gray-600 text-sm">No reports yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
