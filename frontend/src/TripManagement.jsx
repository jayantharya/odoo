import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge, SearchBar, EmptyState, TableSkeleton, Toast, useToast } from './Common';

const TripManagement = () => {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dispatching, setDispatching] = useState(false);
    const [completingId, setCompletingId] = useState(null);
    const { toast, showToast, clearToast } = useToast();

    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        cargo_weight_kg: '',
    });

    const fetchData = async () => {
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                fetch('http://localhost:8000/trips/'),
                fetch('http://localhost:8000/vehicles/'),
                fetch('http://localhost:8000/drivers/')
            ]);

            setTrips(await tripsRes.json());
            setVehicles(await vehiclesRes.json());
            setDrivers(await driversRes.json());
        } catch (err) {
            console.error("Data fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDispatch = async (e) => {
        e.preventDefault();
        setDispatching(true);
        try {
            const response = await fetch('http://localhost:8000/trips/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    cargo_weight_kg: parseFloat(formData.cargo_weight_kg)
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Dispatch failed');
            }

            setFormData({ vehicle_id: '', driver_id: '', cargo_weight_kg: '' });
            showToast('Trip dispatched successfully.');
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDispatching(false);
        }
    };

    const handleCompleteTrip = async (tripId) => {
        setCompletingId(tripId);
        try {
            const response = await fetch(`http://localhost:8000/trips/${tripId}/complete`, {
                method: 'PUT',
            });
            if (!response.ok) throw new Error('Failed to complete trip');
            showToast('Trip marked complete.');
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setCompletingId(null);
        }
    };

    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const availableDrivers = drivers.filter(d => d.status === 'Available');

    const filteredTrips = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return trips;
        return trips.filter(t =>
            (t.vehicle_id || '').toLowerCase().includes(q) ||
            (t.driver_id || '').toLowerCase().includes(q) ||
            (t.status || '').toLowerCase().includes(q)
        );
    }, [trips, search]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center font-display">
                    <span className="material-icons text-violet-600 mr-2">send</span>
                    Dispatch New Trip
                </h2>
                <form onSubmit={handleDispatch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Vehicle</label>
                        <select required value={formData.vehicle_id} onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-violet-500 bg-white">
                            <option value="">-- Choose Vehicle --</option>
                            {availableVehicles.map(v => (
                                <option key={v._id} value={v._id}>{v.registration_number} ({v.max_load_capacity}kg max)</option>
                            ))}
                        </select>
                        {availableVehicles.length === 0 && <p className="text-xs text-amber-600 mt-1">No vehicles currently available.</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Driver</label>
                        <select required value={formData.driver_id} onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-violet-500 bg-white">
                            <option value="">-- Choose Driver --</option>
                            {availableDrivers.map(d => (
                                <option key={d._id} value={d._id}>{d.full_name}</option>
                            ))}
                        </select>
                        {availableDrivers.length === 0 && <p className="text-xs text-amber-600 mt-1">No drivers currently available.</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cargo Weight (KG)</label>
                        <input required type="number" value={formData.cargo_weight_kg} onChange={(e) => setFormData({ ...formData, cargo_weight_kg: e.target.value })} placeholder="e.g., 400" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-violet-500" />
                    </div>
                    <button type="submit" disabled={dispatching} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium p-2.5 rounded-lg transition-all shadow-md shadow-violet-200 h-[46px] flex items-center justify-center space-x-2">
                        {dispatching && <span className="material-icons text-base animate-spin">autorenew</span>}
                        <span>{dispatching ? 'Dispatching...' : 'Dispatch Trip'}</span>
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800 font-display">Trip Ledger</h2>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search vehicle, driver, status..." />
                </div>
                {loading ? (
                    <TableSkeleton columns={5} />
                ) : filteredTrips.length === 0 ? (
                    <EmptyState
                        icon={search ? 'search_off' : 'route'}
                        title={search ? 'No matches found' : 'No trips dispatched yet'}
                        message={search ? 'Try a different vehicle, driver, or status.' : 'Dispatch your first trip using the form above.'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Vehicle ID</th>
                                    <th className="p-4 font-semibold">Driver ID</th>
                                    <th className="p-4 font-semibold">Cargo Load</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTrips.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50">
                                        <td className="p-4 text-slate-600 text-sm font-plate">{t.vehicle_id}</td>
                                        <td className="p-4 text-slate-600 text-sm font-plate">{t.driver_id}</td>
                                        <td className="p-4 text-slate-800 font-bold">{t.cargo_weight_kg} kg</td>
                                        <td className="p-4"><StatusBadge status={t.status} /></td>
                                        <td className="p-4">
                                            {t.status === 'Dispatched' && (
                                                <button
                                                    onClick={() => handleCompleteTrip(t._id)}
                                                    disabled={completingId === t._id}
                                                    className="text-xs bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                >
                                                    {completingId === t._id ? 'Completing...' : 'Mark Complete'}
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

export default TripManagement;