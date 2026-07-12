import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge, SearchBar, EmptyState, TableSkeleton, Toast, useToast, fmtCurrency } from './Common';

const Maintenance = () => {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [completingId, setCompletingId] = useState(null);
    const { toast, showToast, clearToast } = useToast();

    const [formData, setFormData] = useState({
        vehicle_id: '',
        description: '',
        cost: '',
    });

    const fetchData = async () => {
        try {
            const [maintRes, vehRes] = await Promise.all([
                fetch('http://localhost:8000/maintenance/'),
                fetch('http://localhost:8000/vehicles/')
            ]);
            setLogs(await maintRes.json());
            setVehicles(await vehRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:8000/maintenance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, cost: parseFloat(formData.cost) }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to create record');
            }
            setFormData({ vehicle_id: '', description: '', cost: '' });
            showToast('Maintenance event logged.');
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async (logId) => {
        setCompletingId(logId);
        try {
            const response = await fetch(`http://localhost:8000/maintenance/${logId}/complete`, { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to complete maintenance');
            showToast('Vehicle returned to service.');
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setCompletingId(null);
        }
    };

    const eligibleVehicles = vehicles.filter(v => v.status !== 'Retired' && v.status !== 'In Shop');

    const serviceLogs = useMemo(() => logs.filter(l => !l.liters), [logs]);

    const filteredLogs = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return serviceLogs;
        return serviceLogs.filter(l =>
            (l.vehicle_id || '').toLowerCase().includes(q) ||
            (l.description || '').toLowerCase().includes(q) ||
            (l.status || '').toLowerCase().includes(q)
        );
    }, [serviceLogs, search]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center font-display">
                    <span className="material-icons text-rose-600 mr-2">build_circle</span>
                    Log Maintenance Event
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vehicle</label>
                        <select required value={formData.vehicle_id} onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500 bg-white">
                            <option value="">-- Choose Vehicle --</option>
                            {eligibleVehicles.map(v => <option key={v._id} value={v._id}>{v.registration_number}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Service Description</label>
                        <input required type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g., Brake pad replacement" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cost (₹)</label>
                        <div className="flex space-x-2">
                            <input required type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} placeholder="0.00" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-rose-500" />
                            <button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-all shadow-md shrink-0">
                                {submitting ? '...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800 font-display">Service History</h2>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search vehicle, description, status..." />
                </div>
                {loading ? (
                    <TableSkeleton columns={5} />
                ) : filteredLogs.length === 0 ? (
                    <EmptyState
                        icon={search ? 'search_off' : 'build'}
                        title={search ? 'No matches found' : 'No service records yet'}
                        message={search ? 'Try a different vehicle, description, or status.' : 'Log your first maintenance event using the form above.'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Vehicle ID</th>
                                    <th className="p-4 font-semibold">Description</th>
                                    <th className="p-4 font-semibold">Cost</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-slate-50">
                                        <td className="p-4 font-plate text-sm text-slate-600">{log.vehicle_id}</td>
                                        <td className="p-4 text-slate-800 font-medium">{log.description}</td>
                                        <td className="p-4 text-slate-800">{fmtCurrency(log.cost)}</td>
                                        <td className="p-4"><StatusBadge status={log.status} /></td>
                                        <td className="p-4">
                                            {log.status === 'Active' && (
                                                <button
                                                    onClick={() => handleComplete(log._id)}
                                                    disabled={completingId === log._id}
                                                    className="text-xs bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg"
                                                >
                                                    {completingId === log._id ? 'Completing...' : 'Mark Complete'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Toast toast={toast} onClose={clearToast} />
        </div>
    );
};

export default Maintenance;