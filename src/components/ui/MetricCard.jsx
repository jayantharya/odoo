export default function MetricCard({ title, value, icon }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center">
            <div className="p-3 rounded-md bg-blue-50 text-blue-600 mr-4 text-xl">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    );
}