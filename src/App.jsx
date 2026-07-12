import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Dummy page components for the boilerplate
const Dashboard = () => <div className="p-6">Dashboard KPI Content</div>;
const Vehicles = () => <div className="p-6">Vehicle Registry CRUD</div>;
const Drivers = () => <div className="p-6">Driver Management CRUD</div>;
const Trips = () => <div className="p-6">Trip Management Pipeline</div>;

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/vehicles" element={<Vehicles />} />
                        <Route path="/drivers" element={<Drivers />} />
                        <Route path="/trips" element={<Trips />} />
                        <Route path="/maintenance" element={<div className="p-6">Maintenance Logs</div>} />
                        <Route path="/expenses" element={<div className="p-6">Fuel & Expenses</div>} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}