import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="text-lg font-medium text-gray-800">
                Operations Center
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-right">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-gray-500">{user?.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {user?.name.charAt(0)}
                </div>
            </div>
        </header>
    );
}