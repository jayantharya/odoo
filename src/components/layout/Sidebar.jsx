import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Vehicles', path: '/vehicles', icon: '🚚' },
    { name: 'Drivers', path: '/drivers', icon: '🧑‍✈️' },
    { name: 'Trips', path: '/trips', icon: '🗺️' },
    { name: 'Maintenance', path: '/maintenance', icon: '🔧' },
    { name: 'Expenses', path: '/expenses', icon: '💳' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <span className="text-xl font-bold text-blue-600">TransitOps</span>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}