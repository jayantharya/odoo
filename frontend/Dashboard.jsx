import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    // Initialize state with zeros while waiting for backend data
    const [kpiData, setKpiData] = useState({
        activeVehicles: 0,
        availableVehicles: 0,
        inMaintenance: 0,
        activeTrips: 0,
        pendingTrips: 0,
        driversOnDuty: 0,
        utilization: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch real data from your FastAPI backend
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/dashboard-stats');
                if (!response.ok) throw new Error('Failed to connect to backend.');

                const data = await response.json();
                setKpiData(data);
                setError(null);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Fetch immediately, then poll every 5 seconds to keep the dashboard live
        fetchDashboardStats();
        const intervalId = setInterval(fetchDashboardStats, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR */}
            <div className="w-64 bg-[#1e40af] text-white flex flex-col">
                <div className="p-4 flex items-center space-x-2 text-xl font-bold border-b border-blue-800">
                    <span className="material-icons">directions_bus</span>
                    <span>TransitOps</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <a href="#" className="flex items-center space-x-3 p-3 bg-blue-800 rounded-lg">
                        <span className="material-icons">dashboard</span><span>Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded-lg transition-colors">
                        <span className="material-icons">local_shipping</span><span>Vehicle Registry</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded-lg transition-colors">
                        <span className="material-icons">people</span><span>Driver Management</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded-lg transition-colors">
                        <span className="material-icons">route</span><span>Trip Management</span>
                    </a>
                </nav>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
                    <h1 className="text-xl font-semibold text-gray-800">Fleet Overview Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">John Doe</div>
                            <div className="text-xs text-gray-500">Fleet Manager</div>
                        </div>
                        <button className="border border-gray-300 px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            Logout
                        </button>
                    </div>
                </header>

                {/* DASHBOARD CONTENT */}
                <main className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <span className="material-icons animate-spin text-4xl mb-2 text-blue-600">autorenew</span>
                            <p>Connecting to API...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                            <strong>Error:</strong> {error} <br />
                            Ensure your FastAPI backend is running on port 8000.
                        </div>
                    ) : (
                        <>
                            {/* KPI GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                                <KpiCard title="Active Vehicles" value={kpiData.activeVehicles} icon="directions_car" color="text-blue-600" />
                                <KpiCard title="Available Vehicles" value={kpiData.availableVehicles} icon="local_shipping" color="text-green-600" />
                                <KpiCard title="Vehicles in Maintenance" value={kpiData.inMaintenance} icon="build" color="text-orange-600" />
                                <KpiCard title="Active Trips" value={kpiData.activeTrips} icon="flight_takeoff" color="text-blue-600" />

                                <KpiCard title="Pending Trips" value={kpiData.pendingTrips} icon="schedule" color="text-gray-600" />
                                <KpiCard title="Drivers On Duty" value={kpiData.driversOnDuty} icon="person_pin" color="text-indigo-600" />
                                <KpiCard title="Fleet Utilization" value={`${kpiData.utilization}%`} icon="pie_chart" color="text-purple-600" />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

// Reusable UI component for the metric cards
const KpiCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center space-x-4 border border-gray-100 transition-transform hover:-translate-y-1">
        <div className={`p-4 bg-blue-50 rounded-lg ${color}`}>
            <span className="material-icons text-3xl">{icon}</span>
        </div>
        <div>
            <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
        </div>
    </div>
);

export default Dashboard;