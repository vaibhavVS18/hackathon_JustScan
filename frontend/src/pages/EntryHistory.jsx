
import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { Calendar, ChevronLeft, Printer, X, Filter, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from "../context/toast.context";

const EntryHistory = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orgName, setOrgName] = useState("");
    const { addToast } = useToast();

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");

    // Print State
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        // Scroll to top when page loads
        window.scrollTo(0, 0);

        fetchOrgName();
        fetchHistory();
    }, []);

    const fetchOrgName = async () => {
        const orgId = localStorage.getItem("current-org-id");
        const storedName = localStorage.getItem("current-org-name");

        if (storedName) {
            setOrgName(storedName);
        }

        // Also fetch from API to ensure we have the latest name
        if (orgId) {
            try {
                const res = await axios.get(`/api/organizations/${orgId}`);
                setOrgName(res.data.name);
            } catch (err) {
                console.error("Failed to fetch organization name", err);
                if (!storedName) {
                    setOrgName("Organization Report");
                }
            }
        } else if (!storedName) {
            setOrgName("Organization Report");
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = { limit: 100 };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (search) params.search = search;

            const res = await axios.get('/api/entries', { params });
            setEntries(res.data);
            if (res.data.length === 0 && (startDate || endDate || search)) {
                addToast("No records found for current filters", "info");
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch history", "error");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        fetchHistory();
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        setSearch("");
        fetchHistory(); // Reload without reload page
        addToast("Filters cleared", "info");
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="space-y-6">
                {/* Back Link */}
                <Link to="/portal" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                            <Calendar size={28} />
                        </div>
                        Entry History
                    </h1>
                    <button
                        onClick={() => setShowPreview(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                    >
                        <Printer size={18} /> Print Report
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col lg:flex-row gap-6 items-end">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search</label>
                            <input
                                type="text"
                                placeholder="Student Name or Roll No"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto">
                        <button
                            onClick={applyFilters}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-orange-600/20"
                        >
                            <Filter size={18} /> Filter
                        </button>
                        <button
                            onClick={clearFilters}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-3 rounded-xl font-semibold transition border border-white/10"
                        >
                            <RefreshCcw size={18} /> Reset
                        </button>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">S.No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Hostel</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Leaving</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Arrival</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="9" className="text-center py-12 text-gray-500">Loading history...</td></tr>
                                ) : entries.length === 0 ? (
                                    <tr><td colSpan="9" className="text-center py-12 text-gray-500">No records found.</td></tr>
                                ) : entries.map((entry, index) => (
                                    <tr key={entry._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-white font-mono">{entry.student.roll_no}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300 font-medium whitespace-nowrap">{entry.student.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{entry.student.hostel_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{entry.student.Room_no || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{entry.student.mobile_no || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                            <div className="font-medium text-white">{formatDate(entry.leavingTime)}</div>
                                            <div className="text-gray-500 text-xs">{formatTime(entry.leavingTime)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {entry.arrivalTime ? (
                                                <>
                                                    <div className="font-medium text-white">{formatDate(entry.arrivalTime)}</div>
                                                    <div className="text-gray-500 text-xs">{formatTime(entry.arrivalTime)}</div>
                                                </>
                                            ) : <span className="text-gray-600">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${entry.status === 'In'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {entry.status === 'In' ? 'Returned' : 'Out'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Print Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 no-print">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Printer size={20} className="text-indigo-600" /> Print Preview
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm transition"
                                >
                                    <Printer size={16} /> Print Now
                                </button>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition"
                                >
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Content */}
                        <div className="flex-1 overflow-y-auto p-8" id="printable-section">
                            <div className="mb-6 border-b pb-4">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{orgName}</h1>
                                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Entry Log Report</p>
                                <div className="text-sm text-gray-600 mt-2 flex gap-4">
                                    <span><span className="font-semibold">Generated:</span> {new Date().toLocaleString()}</span>
                                    {startDate && <span><span className="font-semibold">From:</span> {new Date(startDate).toLocaleDateString()}</span>}
                                    {endDate && <span><span className="font-semibold">To:</span> {new Date(endDate).toLocaleDateString()}</span>}
                                </div>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-r text-center w-12">#</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-r">Roll No</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-r">Name</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-r">Hostel</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-r">Leaving</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-r">Arrival</th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-xs">
                                    {entries.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-4 text-gray-500">No records found</td></tr>
                                    ) : entries.map((entry, index) => (
                                        <tr key={entry._id} className="hover:bg-gray-50 break-inside-avoid">
                                            <td className="px-3 py-2 border-r text-center text-gray-500">{index + 1}</td>
                                            <td className="px-3 py-2 border-r font-medium text-gray-900">{entry.student.roll_no}</td>
                                            <td className="px-3 py-2 border-r text-gray-700">{entry.student.name}</td>
                                            <td className="px-3 py-2 border-r text-gray-700">{entry.student.hostel_name} <span className="text-gray-400">({entry.student.Room_no})</span></td>
                                            <td className="px-3 py-2 border-r text-gray-700">
                                                {formatDate(entry.leavingTime)} <span className="text-gray-400">|</span> {formatTime(entry.leavingTime)}
                                            </td>
                                            <td className="px-3 py-2 border-r text-gray-700">
                                                {entry.arrivalTime ? (
                                                    <>{formatDate(entry.arrivalTime)} <span className="text-gray-400">|</span> {formatTime(entry.arrivalTime)}</>
                                                ) : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${entry.status === 'In' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                    {entry.status === 'In' ? 'IN' : 'OUT'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-8 pt-8 border-t text-center text-gray-400 text-xs flex justify-between">
                                <span>JustScan Security System</span>
                                <span>Page 1 of 1</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntryHistory;

