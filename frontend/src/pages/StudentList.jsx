import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { Search, Plus, Edit, Trash, ChevronLeft, Upload, FileSpreadsheet, X, Check, AlertCircle } from 'lucide-react';
import StudentFormModal from "../components/StudentFormModal";
import { Link } from "react-router-dom";
import { useToast } from "../context/toast.context";

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const { addToast } = useToast();

    // Bulk Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null); // { addedCount, skippedCount, failedCount, errors }

    const orgId = localStorage.getItem("current-org-id");

    useEffect(() => {
        if (orgId) {
            fetchStudents();
        }
    }, [orgId]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const [studentsRes, profileRes, orgRes] = await Promise.all([
                axios.get('/api/students'),
                axios.get('/api/users/profile'),
                axios.get(`/api/organizations/${orgId}`)
            ]);

            setStudents(studentsRes.data);
            setFilteredStudents(studentsRes.data);

            const myId = profileRes.data.user._id;

            // Strict Owner Check
            if (orgRes.data.createdBy === myId) {
                setIsOwner(true);
            } else {
                setIsOwner(false);
            }

        } catch (err) {
            console.error(err);
            addToast("Failed to fetch students", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const results = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_no.toString().includes(searchTerm)
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    const handleDownloadTemplate = () => {
        const headers = ["Name", "Roll No", "Email", "Mobile", "Hostel", "Room"];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAdd = () => {
        setStudentToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setStudentToEdit(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (student) => {
        if (window.confirm(`Are you sure you want to delete ${student.name} (${student.roll_no})?`)) {
            try {
                await axios.delete(`/api/students/${student.roll_no}`);
                addToast(`Deleted ${student.name}`, "success");
                fetchStudents();
            } catch (err) {
                console.error(err);
                addToast("Failed to delete student", "error");
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setUploadResult(null);

        try {
            // Need to set correct content-type for multer
            const res = await axios.post("/api/students/bulk-upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setUploadResult(res.data);
            fetchStudents(); // Refresh list to show new students

            // Clear input
            e.target.value = null;
            addToast("Upload Processed", "info");

        } catch (err) {
            console.error(err);
            addToast("Upload failed: " + (err.response?.data?.message || err.message), "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="space-y-6">

                {/* Back Link */}
                <Link to="/portal" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
                </Link>

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Student Directory</h1>
                        <p className="text-gray-400">Manage all registered students in your organization.</p>
                    </div>

                    {isOwner && (
                        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-xl border border-white/10 transition"
                                title="Download Excel Template"
                            >
                                <FileSpreadsheet size={18} /> <span className="text-sm font-medium">Template</span>
                            </button>

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                id="excel-upload"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <label
                                htmlFor="excel-upload"
                                className={`flex-1 xl:flex-none flex items-center justify-center gap-2 bg-emerald-600/80 text-white px-5 py-3 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <span className="text-sm font-medium">Uploading...</span>
                                ) : (
                                    <>
                                        <Upload size={18} /> <span className="text-sm font-medium">Bulk Upload</span>
                                    </>
                                )}
                            </label>

                            <button
                                onClick={handleAdd}
                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
                            >
                                <Plus size={18} /> <span className="text-sm font-medium">Add Student</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students via name or roll no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:bg-white/10"
                    />
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Roll No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Hostel</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</th>
                                    {isOwner && (
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={isOwner ? "8" : "7"} className="text-center py-12 text-gray-500">Loading directory...</td></tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan={isOwner ? "8" : "7"} className="text-center py-12 text-gray-500">No students found.</td></tr>
                                ) : filteredStudents.map((student, index) => (
                                    <tr key={student._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-white font-mono">{student.roll_no}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300 font-medium whitespace-nowrap">{student.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{student.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{student.hostel_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{student.Room_no}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{student.mobile_no}</td>
                                        {isOwner && (
                                            <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(student)} className="text-indigo-400 hover:text-indigo-300 transition p-2 hover:bg-indigo-500/10 rounded-lg">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(student)} className="text-red-400 hover:text-red-300 transition p-2 hover:bg-red-500/10 rounded-lg">
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <StudentFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    studentToEdit={studentToEdit}
                    onSuccess={() => {
                        fetchStudents();
                        addToast(studentToEdit ? "Student updated" : "Student added", "success");
                    }}
                />

                {/* Upload Result Modal - Keeping Custom Modal for Detailed Report */}
                {uploadResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setUploadResult(null)}>
                        <div className="glass-panel border border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative bg-[#0a0a0a]" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setUploadResult(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Upload size={24} className="text-indigo-500" /> Upload Summary
                            </h2>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-emerald-400">{uploadResult.addedCount}</div>
                                    <div className="text-xs text-emerald-400/70 uppercase font-bold tracking-wider mt-1">Added</div>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-blue-400">{uploadResult.skippedCount}</div>
                                    <div className="text-xs text-blue-400/70 uppercase font-bold tracking-wider mt-1">Skipped</div>
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-red-400">{uploadResult.failedCount}</div>
                                    <div className="text-xs text-red-400/70 uppercase font-bold tracking-wider mt-1">Failed</div>
                                </div>
                            </div>

                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Error Details</h3>
                                    <div className="bg-black/40 rounded-xl overflow-hidden max-h-60 overflow-y-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                        <table className="w-full text-sm">
                                            <thead className="bg-white/5 sticky top-0 backdrop-blur-sm">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-gray-400 font-medium">Row</th>
                                                    <th className="px-4 py-2 text-left text-gray-400 font-medium">Name</th>
                                                    <th className="px-4 py-2 text-left text-red-400 font-medium">Error</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {uploadResult.errors.map((err, i) => (
                                                    <tr key={i} className="hover:bg-white/5">
                                                        <td className="px-4 py-2 text-gray-500 font-mono">#{err.row || '-'}</td>
                                                        <td className="px-4 py-2 text-gray-300">{err.name || '-'}</td>
                                                        <td className="px-4 py-2 text-red-400">{err.error}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setUploadResult(null)}
                                    className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
                                >
                                    Close Summary
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentList;
