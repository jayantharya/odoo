import React, { useState, useEffect } from 'react';

import VehicleRegistry from './VehicleRegistry';
import DriverManagement from './DriverManagement';
import TripManagement from './TripManagement';
import Maintenance from './Maintenance';
import FuelExpense from './FuelExpense';

const VIEW_TITLES = {
  dashboard: 'Fleet Overview Dashboard',
  vehicles: 'Vehicle Registry (India Hub)',
  drivers: 'Driver Management',
  trips: 'Active Dispatch & Trips',
  maintenance: 'Service & Maintenance',
  finances: 'Financial Overview (INR)',
};

const RouteLine = () => (
  <svg viewBox="0 0 240 4" className="w-full h-1 mt-3" preserveAspectRatio="none">
    <line x1="0" y1="2" x2="240" y2="2" stroke="#C7D2FE" strokeWidth="2" />
    <line x1="0" y1="2" x2="240" y2="2" stroke="#6366F1" strokeWidth="2" strokeDasharray="10 6" className="route-line" />
  </svg>
);

const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [kpiData, setKpiData] = useState({
    activeVehicles: 0, availableVehicles: 0, inMaintenance: 0,
    activeTrips: 0, pendingTrips: 0, driversOnDuty: 0, utilization: 0,
  });

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

    fetchDashboardStats();
    const intervalId = setInterval(fetchDashboardStats, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const NavItem = ({ id, icon, label }) => {
    const isActive = activeView === id;
    return (
      <button
        onClick={() => { setActiveView(id); setSidebarOpen(false); }}
        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' : 'text-indigo-100 hover:bg-white/10 hover:text-white'
          }`}
      >
        <span className="material-icons">{icon}</span>
        <span className="font-medium tracking-wide">{label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center space-x-3 border-b border-white/10">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><span className="material-icons text-2xl">directions_bus</span></div>
        <span className="text-xl font-bold tracking-wider font-display">TransitOps</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-4 mt-2 px-3">Operations</div>
        <NavItem id="dashboard" icon="dashboard" label="Dashboard" />
        <NavItem id="vehicles" icon="local_shipping" label="Vehicle Registry" />
        <NavItem id="drivers" icon="people" label="Driver Management" />
        <NavItem id="trips" icon="route" label="Trip Management" />

        <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-4 mt-8 px-3">Administration</div>
        <NavItem id="maintenance" icon="build" label="Maintenance" />
        <NavItem id="finances" icon="currency_rupee" label="Fuel & Expense" />
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-200 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-indigo-700 via-indigo-800 to-violet-900 text-white flex flex-col shadow-2xl transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <header className="bg-white/80 backdrop-blur-md shadow-sm min-h-20 flex items-center justify-between px-4 sm:px-8 py-3 z-10 border-b border-slate-200">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 shrink-0"
            >
              <span className="material-icons">menu</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight font-display truncate">
                {VIEW_TITLES[activeView]}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1 hidden sm:block">Real-time logistics monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-800">System Admin</div>
              <div className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">Fleet Manager</div>
            </div>
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200 text-indigo-700 font-bold shrink-0">SA</div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-400">
              <span className="material-icons animate-spin text-5xl mb-4 text-indigo-600">autorenew</span>
              <p className="font-medium text-lg">Syncing with database...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-100 shadow-sm flex items-start space-x-4">
              <span className="material-icons text-3xl">error_outline</span>
              <div>
                <h3 className="font-bold text-lg mb-1">Connection Error</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : activeView === 'dashboard' ? (
            <div>
              <RouteLine />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mt-8 mb-8">
                <KpiCard title="Active Vehicles" value={kpiData.activeVehicles} icon="directions_car" color="bg-blue-500" lightColor="bg-blue-50 text-blue-600" />
                <KpiCard title="Available Vehicles" value={kpiData.availableVehicles} icon="local_shipping" color="bg-emerald-500" lightColor="bg-emerald-50 text-emerald-600" />
                <KpiCard title="Vehicles in Maintenance" value={kpiData.inMaintenance} icon="build" color="bg-rose-500" lightColor="bg-rose-50 text-rose-600" />
                <KpiCard title="Active Trips" value={kpiData.activeTrips} icon="flight_takeoff" color="bg-violet-500" lightColor="bg-violet-50 text-violet-600" />
                <KpiCard title="Pending Trips" value={kpiData.pendingTrips} icon="schedule" color="bg-amber-500" lightColor="bg-amber-50 text-amber-600" />
                <KpiCard title="Drivers On Duty" value={kpiData.driversOnDuty} icon="person_pin" color="bg-cyan-500" lightColor="bg-cyan-50 text-cyan-600" />
                <KpiCard title="Fleet Utilization" value={`${kpiData.utilization}%`} icon="pie_chart" color="bg-fuchsia-500" lightColor="bg-fuchsia-50 text-fuchsia-600" />
              </div>
            </div>
          ) : activeView === 'vehicles' ? (
            <VehicleRegistry />
          ) : activeView === 'drivers' ? (
            <DriverManagement />
          ) : activeView === 'trips' ? (
            <TripManagement />
          ) : activeView === 'maintenance' ? (
            <Maintenance />
          ) : activeView === 'finances' ? (
            <FuelExpense />
          ) : null}
        </main>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color, lightColor }) => (
  <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 border border-slate-100 group flex flex-col justify-between">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 sm:p-4 rounded-2xl ${lightColor} group-hover:scale-110 transition-transform duration-300`}><span className="material-icons text-2xl sm:text-3xl">{icon}</span></div>
      <div className="text-right">
        <div className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">{title}</div>
        <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight font-display">{value}</div>
      </div>
    </div>
    <div className={`h-1.5 w-full rounded-full bg-slate-100 overflow-hidden`}>
      <div className={`h-full ${color} rounded-full`} style={{ width: '40%' }}></div>
    </div>
  </div>
);

export default Dashboard;