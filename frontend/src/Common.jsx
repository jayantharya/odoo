import React, { useState, useCallback, useEffect } from 'react';

const STATUS_STYLES = {
    Available: 'bg-emerald-100 text-emerald-700',
    'On Trip': 'bg-blue-100 text-blue-700',
    'In Shop': 'bg-rose-100 text-rose-700',
    Retired: 'bg-slate-200 text-slate-600',
    Suspended: 'bg-rose-100 text-rose-700',
    Draft: 'bg-slate-100 text-slate-700',
    Dispatched: 'bg-amber-100 text-amber-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-slate-200 text-slate-600',
    Active: 'bg-rose-100 text-rose-700',
};

export const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-700'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
        {status}
    </span>
);

export const SearchBar = ({ value, onChange, placeholder }) => (
    <div className="relative w-full sm:w-72">
        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Search...'}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50 focus:bg-white"
        />
    </div>
);

export const EmptyState = ({ icon, title, message }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <span className="material-icons text-3xl text-slate-300">{icon}</span>
        </div>
        <h3 className="font-bold text-slate-700 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 max-w-xs">{message}</p>
    </div>
);

export const TableSkeleton = ({ columns = 4, rows = 4 }) => (
    <div className="p-6 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex space-x-4">
                {Array.from({ length: columns }).map((__, c) => (
                    <div key={c} className="h-4 bg-slate-100 rounded-full animate-pulse flex-1" style={{ animationDelay: `${(r * columns + c) * 60}ms` }}></div>
                ))}
            </div>
        ))}
    </div>
);

export const useToast = () => {
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, key: Date.now() });
    }, []);
    return { toast, showToast, clearToast: () => setToast(null) };
};

export const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    const isError = toast.type === 'error';

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
            <div className={`flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border text-white max-w-sm ${isError ? 'bg-rose-600 border-rose-500' : 'bg-slate-800 border-slate-700'}`}>
                <span className="material-icons text-xl">{isError ? 'error_outline' : 'check_circle'}</span>
                <p className="font-medium text-sm flex-1">{toast.message}</p>
                <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
                    <span className="material-icons text-base">close</span>
                </button>
            </div>
        </div>
    );
};

export const fmtNumber = (value, opts) => (typeof value === 'number' ? value : Number(value) || 0).toLocaleString('en-IN', opts);

export const fmtCurrency = (value) => `₹${fmtNumber(value)}`;