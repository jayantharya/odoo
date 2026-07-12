import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge, SearchBar, EmptyState, TableSkeleton, Toast, useToast, fmtNumber } from './Common';

const VehicleRegistry = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast, showToast, clearToast } = useToast();

    const [formData, setFormData] = useState({
        registration_number: '',
        vehicle_type: 'Van',
        max_load_capacity: '',
        odometer: 0,
    });

    const fetchVehicles = async () => {
        try {
            const response = await fetch('http://localhost:8000/vehicles/');
            if (!response.ok) throw new Error('Failed to fetch vehicles');
            const data = await response.json();
            setVehicles(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:8000/vehicles/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    max_load_capacity: parseFloat(formData.max_load_capacity),
                    odometer: parseInt(formData.odometer, 10)
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to add vehicle');
            }

            setFormData({ registration_number: '', vehicle_type: 'Van', max_load_capacity: '', odometer: 0 });
            showToast('Vehicle registered successfully.');
            fetchVehicles();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const filteredVehicles = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return vehicles;
        return vehicles.filter(v =>
            (v.registration_number || '').toLowerCase().includes(q) ||
            (v.vehicle_type || '').toLowerCase().includes(q) ||
            (v.status || '').toLowerCase().includes(q)
        );
    }, [vehicles, search]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center font-display">
                    <span className="material-icons text-indigo-600 mr-2">add_circle</span>
                    Register New Vehicle
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration No.</label>
                        <input required type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} placeholder="e.g., KA-01-AB-1234" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-plate" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                        <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-all bg-white">
                            <option value="Van">Van</option>
                            <option value="Truck">Truck</option>
                            <option value="Sedan">Sedan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Load (KG)</label>
                        <input required type="number" name="max_load_capacity" value={formData.max_load_capacity} onChange={handleInputChange} placeholder="e.g., 500" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Odometer (KM)</label>
                        <input required type="number" name="odometer" value={formData.odometer} onChange={handleInputChange} placeholder="0" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium p-2.5 rounded-lg transition-all shadow-md shadow-indigo-200 h-[46px] flex items-center justify-center space-x-2">
                        {submitting && <span className="material-icons text-base animate-spin">autorenew</span>}
                        <span>{submitting ? 'Saving...' : 'Save Vehicle'}</span>
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800 font-display">Active Fleet Directory</h2>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search registration, type, status..." />
                </div>

                {loading ? (
                    <TableSkeleton columns={5} />
                ) : error ? (
                    <div className="p-8 text-center text-rose-500">Error: {error}</div>
                ) : filteredVehicles.length === 0 ? (
                    <EmptyState
                        icon={search ? 'search_off' : 'local_shipping'}
                        title={search ? 'No matches found' : 'No vehicles registered yet'}
                        message={search ? 'Try a different registration number, type, or status.' : 'Register your first vehicle using the form above.'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Registration</th>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold">Capacity</th>
                                    <th className="p-4 font-semibold">Odometer</th>
                                    <th className="p-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredVehicles.map((v) => (
                                    <tr key={v._id || v.registration_number} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-800 font-plate">{v.registration_number}</td>
                                        <td className="p-4 text-slate-600">{v.vehicle_type}</td>
                                        <td className="p-4 text-slate-600">{fmtNumber(v.max_load_capacity)} kg</td>
                                        <td className="p-4 text-slate-600">{fmtNumber(v.odometer)} km</td>
                                        <td className="p-4"><StatusBadge status={v.status} /></td>
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

export default VehicleRegistry;