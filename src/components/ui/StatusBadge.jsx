export default function StatusBadge({ status }) {
    const getStyles = (statusText) => {
        switch (statusText?.toLowerCase()) {
            // Vehicle & Driver Active Statuses
            case 'available':
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';

            // In Progress Statuses
            case 'on trip':
            case 'dispatched':
                return 'bg-blue-100 text-blue-800 border-blue-200';

            // Warning/Action Needed Statuses
            case 'in shop':
            case 'suspended':
            case 'draft':
                return 'bg-amber-100 text-amber-800 border-amber-200';

            // Inactive/Negative Statuses
            case 'retired':
            case 'cancelled':
            case 'off duty':
                return 'bg-gray-100 text-gray-800 border-gray-200';

            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles(status)}`}>
            {status}
        </span>
    );
}