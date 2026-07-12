import React, { useState, useEffect, useMemo } from 'react';
import { SearchBar, EmptyState, TableSkeleton, Toast, useToast, fmtNumber, fmtCurrency } from './Common';

const FuelExpense = () => {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast, showToast, clearToast } = useToast();

    const [formData, setFormData] = useState({
        vehicle_id: '',
        liters: '',
        total_cost: '',
        date: new Date().toISOString().split('T')[0],
    });

    const fetchData = async () => {
        try {
            const [fuelRes, vehRes] = await Promise.all([
                fetch('http://localhost:8000/fuel/'),
                fetch('http://localhost:8000/vehicles/')
            ]);
            if (!fuelRes.ok || !vehRes.ok) throw new Error('Failed to fetch fuel data');
            setLogs(await fuelRes.json());
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
            const response = await fetch('http://localhost:8000/fuel/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    liters: parseFloat(formData.liters),
                    total_cost: parseFloat(formData.total_cost)
                }),
            });
            if (!response.ok) throw new Error('Failed to record fuel');
            setFormData({ ...formData, vehicle_id: '', liters: '', total_cost: '' });
            showToast('Fuel purchase recorded.');
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const vehicleLabel = (id) => {
        const v = vehicles.find(veh => veh._id === id);
        return v ? v.registration_number : id;
    };

    const filteredLogs = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return logs;
        return logs.filter(log =>
            (log.date || '').toLowerCase().includes(q) ||
            vehicleLabel(log.vehicle_id).toLowerCase().includes(q)
        );
    }, [logs, search, vehicles]);

    const totalSpend = useMemo(() => logs.reduce((sum, l) => sum + (Number(l.total_cost) || 0), 0), [logs]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center font-display">
                    <span className="material-icons text-emerald-600 mr-2">local_gas_station</span>
                    Record Fuel Purchase
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vehicle</label>
                        <select required value={formData.vehicle_id} onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 bg-white">
                            <option value="">-- Choose Vehicle --</option>
                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registration_number}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                        <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Liters</label>
                        <input required type="number" step="0.1" value={formData.liters} onChange={(e) => setFormData({ ...formData, liters: e.target.value })} placeholder="e.g., 40.5" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Cost (₹)</label>
                        <input required type="number" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })} placeholder="e.g., 4200" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500" />
                    </div>
                    <button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium p-2.5 rounded-lg transition-all shadow-md shadow-emerald-200 h-[46px] flex items-center justify-center space-x-2">
                        {submitting && <span className="material-icons text-base animate-spin">autorenew</span>}
                        <span>{submitting ? 'Saving...' : 'Log Fuel'}</span>
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 font-display">Financial Ledger</h2>
                        <p className="text-sm text-slate-400 mt-0.5">Total spend: <span className="font-semibold text-slate-600">{fmtCurrency(totalSpend)}</span></p>
                    </div>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search date or vehicle..." />
                </div>
                {loading ? (
                    <TableSkeleton columns={4} />
                ) : filteredLogs.length === 0 ? (
                    <EmptyState
                        icon={search ? 'search_off' : 'local_gas_station'}
                        title={search ? 'No matches found' : 'No fuel purchases logged yet'}
                        message={search ? 'Try a different date or vehicle.' : 'Record your first fuel purchase using the form above.'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Vehicle</th>
                                    <th className="p-4 font-semibold">Volume</th>
                                    <th className="p-4 font-semibold">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-slate-50">
                                        <td className="p-4 text-slate-600">{log.date}</td>
                                        <td className="p-4 font-plate text-sm text-slate-600">{vehicleLabel(log.vehicle_id)}</td>
                                        <td className="p-4 text-slate-800 font-medium">{fmtNumber(log.liters)} L</td>
                                        <td className="p-4 text-rose-600 font-bold">- {fmtCurrency(log.total_cost)}</td>
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

export default FuelExpense;