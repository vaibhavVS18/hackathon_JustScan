import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { X, User, Phone, Mail, Home, Hash, Save, Loader2 } from 'lucide-react';

const StudentFormModal = ({ isOpen, onClose, studentToEdit = null, onSuccess }) => {
    const [formData, setFormData] = useState({
        roll_no: '',
        name: '',
        mobile_no: '',
        hostel_name: 'Bhutagni',
        Room_no: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (studentToEdit) {
            setFormData({
                roll_no: studentToEdit.roll_no,
                name: studentToEdit.name,
                mobile_no: studentToEdit.mobile_no,
                hostel_name: studentToEdit.hostel_name,
                Room_no: studentToEdit.Room_no,
                email: studentToEdit.email || ''
            });
        } else {
            setFormData({
                roll_no: '',
                name: '',
                mobile_no: '',
                hostel_name: 'Bhutagni',
                Room_no: '',
                email: ''
            });
        }
    }, [studentToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (studentToEdit) {
                await axios.put(`/api/students/${studentToEdit.roll_no}`, formData);
            } else {
                await axios.post('/api/students', formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="glass-panel w-full max-w-2xl rounded-2xl relative flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {studentToEdit ? 'Edit Student' : 'Add New Student'}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {studentToEdit ? 'Update student details below' : 'Enter the details for the new student'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Personal Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Hash size={16} className="text-indigo-400" /> Roll Number
                                    </label>
                                    <input
                                        name="roll_no"
                                        type="number"
                                        value={formData.roll_no}
                                        onChange={handleChange}
                                        disabled={!!studentToEdit}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="e.g. 21001"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <User size={16} className="text-indigo-400" /> Full Name
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3 pt-2">Contact Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Phone size={16} className="text-indigo-400" /> Mobile Number
                                    </label>
                                    <input
                                        name="mobile_no"
                                        type="number"
                                        value={formData.mobile_no}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="1234567890"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Mail size={16} className="text-indigo-400" /> Email Address
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Residence Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3 pt-2">Residence</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Home size={16} className="text-indigo-400" /> Hostel
                                    </label>
                                    <input
                                        name="hostel_name"
                                        type="text"
                                        value={formData.hostel_name}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="e.g. Bhutagni"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Hash size={16} className="text-indigo-400" /> Room Number
                                    </label>
                                    <input
                                        name="Room_no"
                                        type="number"
                                        value={formData.Room_no}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        placeholder="101"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium border border-transparent"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold px-8 py-2.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>{studentToEdit ? 'Update Student' : 'Save Student'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentFormModal;
