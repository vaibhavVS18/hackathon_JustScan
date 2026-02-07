import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, User, Mail, Calendar, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import AccessCodeModal from '../components/AccessCodeModal';
import { useToast } from "../context/toast.context";

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        if (!user) return; // Wait for user to load
        fetchUserOrgs();
    }, [user]);

    const fetchUserOrgs = async () => {
        try {
            const res = await axios.get('/api/organizations/my-organizations');
            setOrganizations(res.data);
        } catch (err) {
            console.error("Failed to fetch user organizations", err);
            addToast("Failed to load organizations", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOrgClick = async (org) => {
        const storedOrgId = localStorage.getItem("current-org-id");
        const storedSession = localStorage.getItem("portal-session-id");

        if (storedSession && storedOrgId === org._id) {
            window.location.href = "/portal";
            return;
        }

        try {
            setSelectedOrg(org);
            setIsAccessModalOpen(true);
        } catch (err) {
            console.error("Error opening org", err);
            addToast("Failed to open organization", "error");
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("/api/users/logout");
            localStorage.removeItem("token");
            localStorage.removeItem("portal-session-id");
            localStorage.removeItem("current-org-id");
            setUser(null);
            addToast("Logged out successfully", "success");
            navigate("/");
        } catch (err) {
            console.error(err);
            addToast("Logout failed", "error");
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-gray-400">Manage your account and organizations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: User Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>

                        <div className="flex flex-col items-center text-center mb-8 relative z-10">
                            <div className="relative mb-4">
                                <img
                                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white/10 shadow-2xl"
                                />
                                <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full border-4 border-[#0a0a16]"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300">
                                {user.role || 'User'}
                            </span>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                                    <Mail size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-white font-medium truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                                    <Calendar size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Joined</p>
                                    <p className="text-white font-medium">
                                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-all border border-white/5 group"
                            >
                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Organizations */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Building2 className="text-blue-500" /> My Organizations
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10">
                            {organizations.length} Active
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse"></div>
                            ))}
                        </div>
                    ) : organizations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {organizations.map((org) => (
                                <div
                                    key={org._id}
                                    className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all ${org.role === 'owner' ? 'bg-indigo-600/10 group-hover:bg-indigo-600/20' : 'bg-blue-600/10 group-hover:bg-blue-600/20'}`} />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className={`p-3 rounded-xl ${org.role === 'owner' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {org.role === 'owner' ? <ShieldCheck size={24} /> : <Shield size={24} />}
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${org.role === 'owner'
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                            }`}>
                                            {org.role === 'owner' ? 'Creator' : 'Member'}
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-bold text-white mb-2 relative z-10 truncate">{org.name}</h4>

                                    <div className="space-y-2 mb-6 relative z-10">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Status: Active
                                        </div>
                                        {org.role === 'owner' && org.accessCode && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono bg-black/20 px-2 py-1 rounded w-fit">
                                                Code: ••••••
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleOrgClick(org)}
                                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5 flex items-center justify-center gap-2 group-hover:border-white/20"
                                    >
                                        Access Workspace <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 glass-panel rounded-3xl border border-white/5 border-dashed">
                            <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center text-gray-600 mb-4">
                                <Building2 size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No Organizations Yet</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">You haven't joined or created any organizations.</p>
                            <button
                                onClick={() => navigate('/#org-section')}
                                className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                            >
                                Browse Organizations
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AccessCodeModal
                isOpen={isAccessModalOpen}
                onClose={() => setIsAccessModalOpen(false)}
                organization={selectedOrg}
            />
        </div>
    );
};

export default Profile;
