import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { Scan, Users, History, School, Settings } from 'lucide-react';
import { useToast } from "../context/toast.context";

const Portal = () => {
    const navigate = useNavigate();
    const [orgName, setOrgName] = useState("");
    const [isSetup, setIsSetup] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        window.scrollTo(0, 0);
        const storedName = localStorage.getItem("current-org-name");
        const orgId = localStorage.getItem("current-org-id");

        if (storedName) {
            setOrgName(storedName);
        } else {
            setOrgName("Organization Portal");
        }

        if (orgId) {
            fetchOrgDetails(orgId);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchOrgDetails = async (id) => {
        try {
            const res = await axios.get(`/api/organizations/${id}`);
            setIsSetup(res.data.isSetup);
        } catch (err) {
            console.error(err);
            addToast("Failed to load organization details", "error");
        } finally {
            setLoading(false);
        }
    };



    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="mx-auto h-20 w-20 glass-panel rounded-full flex items-center justify-center neon-glow">
                        <School className="h-10 w-10 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-white">{orgName}</h1>
                        <p className="mt-2 text-lg text-gray-400">Welcome to the administration portal.</p>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

                    <Link to="/portal/students" className="group">
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                            {/* <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" /> */}
                            <div className="p-4 bg-green-500/10 rounded-full mb-4 group-hover:bg-green-500/20 text-green-400 transition">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Manage Students</h3>
                            <p className="mt-2 text-sm text-gray-400">View, add, or edit student details and records.</p>
                        </div>
                    </Link>

                    {isSetup && (
                        <>
                            <Link to="/portal/scan" className="group">
                                <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                                    {/* <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" /> */}
                                    <div className="p-4 bg-indigo-500/10 rounded-full mb-4 group-hover:bg-indigo-500/20 text-indigo-400 transition">
                                        <Scan className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Scan Entry</h3>
                                    <p className="mt-2 text-sm text-gray-400">Scan ID cards for student check-in and check-out.</p>
                                </div>
                            </Link>

                            <Link to="/portal/history" className="group">
                                <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                                    {/* <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" /> */}
                                    <div className="p-4 bg-orange-500/10 rounded-full mb-4 group-hover:bg-orange-500/20 text-orange-400 transition">
                                        <History className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Entry History</h3>
                                    <p className="mt-2 text-sm text-gray-400">View logs of all past student entries and exits.</p>
                                </div>
                            </Link>
                        </>
                    )}

                    <Link to="/portal/members" className="group">
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                            {/* <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" /> */}
                            <div className="p-4 bg-pink-500/10 rounded-full mb-4 group-hover:bg-pink-500/20 text-pink-400 transition">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Manage Team</h3>
                            <p className="mt-2 text-sm text-gray-400">Invite new members and manage organization access.</p>
                        </div>
                    </Link>

                    <Link to="/portal/setup" className="group">
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-gray-500/50 hover:shadow-[0_0_20px_rgba(156,163,175,0.2)] transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                            {/* <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-50" /> */}
                            <div className="p-4 bg-gray-500/10 rounded-full mb-4 group-hover:bg-gray-500/20 text-gray-300 transition">
                                <Settings className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white">{isSetup ? "Update Entry System" : "Setup Entry System"}</h3>
                            <p className="mt-2 text-sm text-gray-400">Configure validation keywords and scanner rules.</p>
                        </div>
                    </Link>

                </div>
            </div >
        </div >
    );
};

export default Portal;
