import { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StatusBadge from '../components/ui/StatusBadge';

// Initial mock data
const initialVehicles = [
    { id: '1', regNum: 'VAN-05', model: 'Ford Transit', type: 'Van', capacity: 500, odometer: 12500, cost: 35000, status: 'Available' },
    { id: '2', regNum: 'TRK-12', model: 'Volvo FH16', type: 'Heavy Truck', capacity: 15000, odometer: 84000, cost: 120000, status: 'On Trip' },
];

export default function Vehicles() {
    const [vehicles, setVehicles] = useState(initialVehicles);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        regNum: '', model: '', type: '', capacity: '', odometer: '', cost: '', status: 'Available'
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add new vehicle to the top of the list instantly
        const newVehicle = {
            ...formData,
            id: Date.now().toString(),
            capacity: Number(formData.capacity),
            odometer: Number(formData.odometer),
            cost: Number(formData.cost)
        };

        setVehicles([newVehicle, ...vehicles]);
        setIsFormOpen(false); // Close form
        setFormData({ regNum: '', model: '', type: '', capacity: '', odometer: '', cost: '', status: 'Available' }); // Reset
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehicle Registry</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your fleet assets, capacities, and statuses.</p>
                </div>
                <Button onClick={() => setIsFormOpen(!isFormOpen)}>
                    {isFormOpen ? 'Cancel' : '+ Add New Vehicle'}
                </Button>
            </div>

            {/* Modern Data Entry Form */}
            {isFormOpen && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 transition-all">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Vehicle</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Registration Number" name="regNum" value={formData.regNum} onChange={handleInputChange} placeholder="e.g. TRK-99" required />
                            <Input label="Vehicle Model" name="model" value={formData.model} onChange={handleInputChange} placeholder="e.g. Mercedes Sprinter" required />
                            <Select label="Vehicle Type" name="type" value={formData.type} onChange={handleInputChange} options={['Van', 'Light Truck', 'Heavy Truck', 'Reefer']} required />

                            <Input label="Max Capacity (kg)" name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} placeholder="e.g. 5000" required />
                            <Input label="Current Odometer" name="odometer" type="number" value={formData.odometer} onChange={handleInputChange} placeholder="e.g. 15000" required />
                            <Input label="Acquisition Cost ($)" name="cost" type="number" value={formData.cost} onChange={handleInputChange} placeholder="e.g. 45000" required />

                            <Select label="Initial Status" name="status" value={formData.status} onChange={handleInputChange} options={['Available', 'In Shop', 'Retired']} required />
                        </div>
                        <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
                            <Button type="submit" variant="primary">Save Vehicle</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modern Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                                <th className="px-6 py-4 font-medium">Reg Number</th>
                                <th className="px-6 py-4 font-medium">Model & Type</th>
                                <th className="px-6 py-4 font-medium">Capacity (kg)</th>
                                <th className="px-6 py-4 font-medium">Odometer</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{vehicle.regNum}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{vehicle.model}</div>
                                        <div className="text-xs text-gray-500">{vehicle.type}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.capacity.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-600">{vehicle.odometer.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={vehicle.status} />
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No vehicles found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}