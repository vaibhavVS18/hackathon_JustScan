import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserPlus, ArrowLeft, Shield, Check, X, User, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from "../context/toast.context";

const Members = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState("");
    const { addToast } = useToast();

    const orgId = localStorage.getItem("current-org-id");

    useEffect(() => {
        // Scroll to top when page loads
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!orgId) {
            navigate("/portal");
            return;
        }
        fetchMembers();
    }, [orgId, navigate]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const [membersRes, profileRes, orgRes] = await Promise.all([
                axios.get(`/api/organizations/${orgId}/members`),
                axios.get('/api/users/profile'),
                axios.get(`/api/organizations/${orgId}`)
            ]);

            setMembers(membersRes.data);

            // ProfileController returns { user: {...} }
            const myEmail = profileRes.data.user.email;
            const myId = profileRes.data.user._id;
            setCurrentUserEmail(myEmail);

            // Check ownership against the organization's createdBy field (Source of Truth)
            if (orgRes.data.createdBy === myId) {
                setIsOwner(true);
            } else {
                // Fallback: check role in members list (in case createdBy check fails or is different logic)
                const me = membersRes.data.find(m => m.email === myEmail);
                if (me && me.role === 'owner') {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }
            }

        } catch (err) {
            console.error("Failed to fetch data", err);
            addToast("Failed to load members", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail) return;

        try {
            setInviteLoading(true);

            await axios.post(`/api/organizations/${orgId}/members`, { email: inviteEmail });

            addToast("Member added successfully!", "success");
            setInviteEmail("");
            fetchMembers(); // Refresh list
            setShowModal(false);

        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || "Failed to add member", "error");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemove = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) return;

        try {
            await axios.delete(`/api/organizations/${orgId}/members/${memberId}`);
            addToast(`Removed ${memberName} from organization`, "success");
            fetchMembers(); // Refresh list
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || "Failed to remove member", "error");
        }
    };

    return (
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/portal" className="p-3 rounded-xl glass-panel hover:bg-white/10 transition border border-white/5 group">
                        <ArrowLeft className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Team Members</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage access to this organization.</p>
                    </div>
                </div>

                {isOwner && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95"
                    >
                        <UserPlus className="h-5 w-5" />
                        <span>Add Member</span>
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-gray-400 text-center py-20 animate-pulse">Loading members...</div>
            ) : (
                <div className="grid gap-6">
                    {members.map((member) => (
                        <div key={member._id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:bg-white/5 group">
                            <div className="flex items-center space-x-4 w-full sm:w-auto">
                                <div className="relative">
                                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                                        <img
                                            src={member.profileImage}
                                            alt={member.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => { e.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf1fiSQO7JfDw0uv1Ae_Ye-Bo9nhGNg27dwg&s" }}
                                        />
                                    </div>
                                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm whitespace-nowrap ${member.role === 'owner' ? 'bg-amber-500 text-black border-amber-400' :
                                        member.role === 'admin' ? 'bg-indigo-500 text-white border-indigo-400' :
                                            'bg-green-500 text-black border-green-400'
                                        }`}>
                                        {member.role}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                                        {member.name}
                                        {member.email === currentUserEmail && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-widest font-semibold">You</span>}
                                    </h3>
                                    <p className="text-gray-400">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                {isOwner && member.role !== 'owner' && (
                                    <button
                                        onClick={() => handleRemove(member._id, member.name)}
                                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition bg-white/5 border border-white/5"
                                        title="Remove Member"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {members.length === 0 && (
                        <div className="text-center py-20 text-gray-500 glass-panel rounded-2xl border border-white/5 border-dashed">
                            <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>No members found in this organization.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Member Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div
                        className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-2">Add New Member</h2>
                        <p className="text-gray-400 text-sm mb-6">Invite a user to join your organization workspace.</p>

                        <form onSubmit={handleInvite} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Member Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Enter email address"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all font-medium"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-indigo-400/80">
                                    * The user must already be registered on JustScan.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={inviteLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform active:scale-95"
                            >
                                {inviteLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Sending Invite...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2"><UserPlus size={18} /> Send Invitation</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
