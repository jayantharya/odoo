import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge, SearchBar, EmptyState, TableSkeleton, Toast, useToast } from './Common';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast, showToast, clearToast } = useToast();

    const [formData, setFormData] = useState({
        full_name: '',
        license_number: '',
    });

    const fetchDrivers = async () => {
        try {
            const response = await fetch('http://localhost:8000/drivers/');
            if (!response.ok) throw new Error('Failed to fetch drivers');
            const data = await response.json();
            setDrivers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:8000/drivers/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to add driver');
            }

            setFormData({ full_name: '', license_number: '' });
            showToast('Driver onboarded successfully.');
            fetchDrivers();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const filteredDrivers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return drivers;
        return drivers.filter(d =>
            (d.full_name || '').toLowerCase().includes(q) ||
            (d.license_number || '').toLowerCase().includes(q) ||
            (d.status || '').toLowerCase().includes(q)
        );
    }, [drivers, search]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center font-display">
                    <span className="material-icons text-indigo-600 mr-2">person_add</span>
                    Onboard New Driver
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                        <input required type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="e.g., Rajesh Kumar" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Driving License No.</label>
                        <input required type="text" name="license_number" value={formData.license_number} onChange={handleInputChange} placeholder="e.g., KA-01-2023-1234567" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-all font-plate" />
                    </div>
                    <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium p-2.5 rounded-lg transition-all shadow-md shadow-indigo-200 h-[46px] flex items-center justify-center space-x-2">
                        {submitting && <span className="material-icons text-base animate-spin">autorenew</span>}
                        <span>{submitting ? 'Saving...' : 'Add Driver'}</span>
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800 font-display">Driver Roster</h2>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search name, license, status..." />
                </div>

                {loading ? (
                    <TableSkeleton columns={3} />
                ) : error ? (
                    <div className="p-8 text-center text-rose-500">Error: {error}</div>
                ) : filteredDrivers.length === 0 ? (
                    <EmptyState
                        icon={search ? 'search_off' : 'people'}
                        title={search ? 'No matches found' : 'No drivers registered yet'}
                        message={search ? 'Try a different name, license number, or status.' : 'Onboard your first driver using the form above.'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">License Number</th>
                                    <th className="p-4 font-semibold">Current Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredDrivers.map((d) => (
                                    <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800">{d.full_name}</td>
                                        <td className="p-4 text-slate-600 font-plate text-sm">{d.license_number}</td>
                                        <td className="p-4"><StatusBadge status={d.status} /></td>
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

export default DriverManagement;