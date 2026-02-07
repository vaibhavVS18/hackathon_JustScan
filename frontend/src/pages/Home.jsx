import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import AccessCodeModal from '../components/AccessCodeModal';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import { UserContext } from '../context/user.context';
import { ModalContext } from '../context/modal.context';
import { Shield, Plus, ArrowRight, Activity, Users, Database, Send } from 'lucide-react';
import Testimonials from '../components/home/Testimonials';
import GenericModal from '../components/GenericModal';

const Home = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [genericModal, setGenericModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const location = useLocation();

  const { user } = useContext(UserContext);
  const { setIsLoginOpen } = useContext(ModalContext);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handle Hash Scrolling
  useEffect(() => {
    if (location.hash) {
      const elem = document.getElementById(location.hash.substring(1));
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, organizations]);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get('/api/organizations');
      setOrganizations(res.data);
    } catch (err) {
      console.error("Failed to fetch organizations", err);
    }
  };

  const handleOrgClick = async (org) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    const storedOrgId = localStorage.getItem("current-org-id");
    const storedSession = localStorage.getItem("portal-session-id");

    if (storedSession && storedOrgId === org._id) {
      window.location.href = "/portal";
      return;
    }

    try {
      const res = await axios.get(`/api/organizations/${org._id}/membership`);
      if (res.data.isMember) {
        setSelectedOrg(org);
        setIsAccessModalOpen(true);
      } else {
        setGenericModal({
          isOpen: true,
          type: 'error',
          title: 'Access Denied',
          message: 'You are not a registered member of this organization. Please contact the administrator for an invitation.'
        });
      }
    } catch (err) {
      console.error("Membership check failed", err);
      setGenericModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to verify membership status. Please try again later.'
      });
    }
  };

  const handleCreateClick = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    if (!feedbackMessage.trim()) {
      setGenericModal({
        isOpen: true,
        type: 'error',
        title: 'Empty Message',
        message: 'Please enter your feedback before sending.'
      });
      return;
    }

    setSendingFeedback(true);
    try {
      await axios.post('/api/feedback', { message: feedbackMessage });
      setGenericModal({
        isOpen: true,
        type: 'success',
        title: 'Thank You!',
        message: 'Your feedback has been sent successfully. We appreciate your input!'
      });
      setFeedbackMessage('');
    } catch (err) {
      setGenericModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to send feedback. Please try again later.'
      });
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="pb-20 pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Hero Section */}
      <div className="lg:flex items-center justify-between mb-20 mt-6 lg:mt-6 overflow-hidden">
        <div className="lg:w-1/2 space-y-8 flex flex-col items-center text-center lg:block lg:text-left">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-emerald-400 font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-bold leading-tight font-display tracking-tight mb-6">
            <span className="text-[#00f3ff]">
              JustScan
            </span>
          </h1>

          <p className="text-gray-300 text-xl lg:text-3xl font-light italic mb-6">
            "The Future of Secure Entry."
          </p>

          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Seamlessly verify student identities, track campus movement, and maintain secure logs with our intelligent scanning platform.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              Explore <ArrowRight size={20} />
            </button>
            <button
              onClick={() => document.getElementById('org-section').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-white/10 bg-white/5 rounded-full font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-md"
            >
              Entry System
            </button>
          </div>
        </div>

        {/* Scanner Mockup - NEW ADDITION */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative lg:h-[600px] flex items-center justify-center perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-transparent to-fuchsia-600/30 blur-[80px] rounded-full transform scale-75 animate-pulse"></div>

          <div className="relative w-[340px] sm:w-[380px] h-[480px] preserve-3d animate-float">
            {/* Background Card Layer */}
            <div className="absolute inset-0 bg-[#0a0514]/80 border border-blue-500/20 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col overflow-hidden" style={{ transform: 'translateZ(-40px) translateX(24px) translateY(24px)' }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            {/* Main Card */}
            <div className="absolute inset-0 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(37,99,235,0.15)] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                  <span className="text-xs font-mono text-blue-200 tracking-wider">LIVE SCAN</span>
                </div>
                <span className="material-icons-round text-white/40 text-sm">wifi</span>
              </div>

              {/* Card Content */}
              <div className="flex-1 relative flex flex-col items-center justify-center p-8">
                {/* ID Card Preview */}
                <div className="relative w-full aspect-[1.58/1] bg-gradient-to-br from-slate-800 to-black rounded-xl border border-blue-500/30 p-4 shadow-2xl overflow-hidden group">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-white/5 to-transparent rotate-45 pointer-events-none"></div>

                  <div className="flex gap-4 h-full relative z-10">
                    {/* Photo */}
                    <div className="w-1/3 h-full rounded bg-slate-700 overflow-hidden relative border border-white/10">
                      <img
                        alt="User Avatar"
                        className="w-full h-full object-cover opacity-80"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOyRzpZ5w5sqOfC2vuBC_rs4BcMLnsaR-Av-yBSBzf_HXroMxkje5FSdQy-YidNuo8jpNRfvhO-aLKTzQBMT9VxnxADCKIpvHO2Ht0YcKP8b72A99BJNOVXW4_KoFRHsEpeMc-_Ea7RlVcTPrHJAxjjKTuYXEbuFbf_x8ZaHl_oDLpK3yMShDGXalSAJn3o6HLGcAIfKdffaL2bpaAwd0RItpUHD_Arj2JxoWCr0xCKSJ9CJOWIOv5zEEr8RMkcjk0P4WvxKWh8Q"
                      />
                      <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <p className="text-[9px] text-blue-400 uppercase tracking-widest mb-0.5">Name</p>
                        <h4 className="text-white font-display font-bold text-lg leading-tight">VERIFIED USER</h4>
                      </div>
                      <div>
                        <p className="text-[9px] text-blue-400 uppercase tracking-widest mb-0.5">ID Number</p>
                        <p className="text-blue-100 font-mono text-sm tracking-wide">STU-00124</p>
                      </div>
                      <div className="mt-1">
                        <div className="inline-block px-2 py-0.5 rounded-sm bg-blue-500/20 border border-blue-500/30 text-[9px] text-blue-300 font-bold uppercase">
                          Access Granted
                        </div>
                      </div>

                      {/* Barcode visualization */}
                      <div className="flex items-end gap-[2px] h-4 mt-1 opacity-50">
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-1 h-3 bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-2 h-2 bg-white"></div>
                        <div className="w-1 h-full bg-white"></div>
                        <div className="w-0.5 h-3 bg-white"></div>
                        <div className="w-3 h-full bg-white"></div>
                        <div className="w-0.5 h-2 bg-white"></div>
                        <div className="w-1 h-full bg-white"></div>
                      </div>
                    </div>

                    {/* Fingerprint Icon */}
                    <div className="absolute top-3 right-3 opacity-30">
                      <span className="material-icons-round text-3xl text-white">fingerprint</span>
                    </div>
                  </div>
                </div>

                {/* Scan Beam Animation */}
                <div className="absolute inset-x-0 h-1 bg-fuchsia-500 shadow-[0_0_15px_#d946ef] animate-scan-beam z-20 opacity-90 pointer-events-none"></div>
                <div className="absolute inset-x-0 h-12 bg-gradient-to-b from-fuchsia-500/20 to-transparent animate-scan-beam z-10 pointer-events-none" style={{ transform: 'translateY(-100%)' }}></div>
              </div>

              {/* Footer Text */}
              <div className="p-6 pt-0 text-center">
                <p className="text-xs font-mono text-blue-400/60">Align ID card within the frame</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm"></div>
      </div>

      {/* Organizations Section */}
      <div id="org-section" className="space-y-8 scroll-mt-48">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-3xl font-bold">Trusted Organizations</h2>
            <p className="text-gray-400 mt-2">These organizations trust JustScan for their security.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center sm:justify-start px-6 py-3 rounded-full cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm font-medium w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Organization
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Create Organization Card */}
          <div
            onClick={handleCreateClick}
            className="group glass-panel rounded-2xl p-1 border border-white/5 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] border-dashed"
          >
            <div className="bg-white/5 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center space-y-4 group-hover:bg-white/10 transition-all min-h-[280px]">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Create New</h3>
                <p className="text-sm text-gray-400">Launch a new secure organization workspace</p>
              </div>
            </div>
          </div>

          {organizations.map((org) => (
            <div
              key={org._id}
              onClick={() => handleOrgClick(org)}
              className="group glass-panel rounded-2xl p-1 border border-white/5 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
            >
              <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-xl p-6 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all" />

                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:text-white group-hover:bg-indigo-500 transition-all">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    <Activity size={12} /> ACTIVE
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{org.name}</h3>
                <p className="text-sm text-gray-400 mb-6"> Secure access point for {org.name} personnel.</p>

                <div className="flex items-center text-sm text-purple-400 font-medium group-hover:translate-x-2 transition-transform">
                  Enter Portal <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm"></div>
      </div>

      {/* Features Section */}
      <div id="features" className="flex flex-col pt-0 pb-12 relative scroll-mt-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-display">Why JustScan?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Built for speed, security, and simplicity. Experience the next evolution of campus management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="glass-panel p-10 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2 duration-300 relative overflow-hidden group flex flex-col min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>

            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-8 font-bold group-hover:scale-110 transition-transform">
              <Activity size={32} />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">Super Fast<br />Entry</h3>
            <p className="text-gray-400 leading-relaxed text-lg mb-4 flex-grow">
              Manage peak rush hours effortlessly. Scan IDs in under a second to keep student movement flowing without delays.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent mt-4 rounded-full" />
          </div>

          <div className="glass-panel p-10 rounded-[2rem] border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-2 duration-300 relative overflow-hidden group flex flex-col min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all"></div>

            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-8 font-bold group-hover:scale-110 transition-transform">
              <Shield size={32} />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">Always<br />Accurate</h3>
            <p className="text-gray-400 leading-relaxed text-lg mb-4 flex-grow">
              Stop false entries and wrong data. Our system ensures only authenticated, accurate student records are logged.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent mt-4 rounded-full" />
          </div>

          <div className="glass-panel p-10 rounded-[2rem] border border-white/5 hover:border-green-500/30 transition-all hover:-translate-y-2 duration-300 relative overflow-hidden group flex flex-col min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-600/10 rounded-full blur-3xl group-hover:bg-green-600/20 transition-all"></div>

            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 mb-8 font-bold group-hover:scale-110 transition-transform">
              <Database size={32} />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">No More<br />Writing</h3>
            <p className="text-gray-400 leading-relaxed text-lg mb-4 flex-grow">
              Replace error-prone handwritten logs. Eliminate mistakes caused by manual entry for a trouble-free database.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent mt-4 rounded-full" />
          </div>
        </div>
      </div>

      {/* Section Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm"></div>
      </div>

      <Testimonials />

      {/* Section Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm"></div>
      </div>

      {/* Feedback Section */}
      <div className="glass-panel rounded-2xl border border-white/5 p-8 md:p-12 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">Give Your Feedback</h2>
          <p className="text-gray-400 text-lg">We'd love to hear from you! Share your thoughts and help us improve.</p>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Type your feedback here..."
              disabled={sendingFeedback}
              rows={6}
              maxLength={2000}
              className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-500 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {feedbackMessage.length}/2000
            </div>
          </div>

          <button
            type="submit"
            disabled={!user || sendingFeedback || !feedbackMessage.trim()}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mx-auto"
          >
            {sendingFeedback ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : !user ? (
              <>
                <Send size={20} />
                Login Required
              </>
            ) : (
              <>
                <Send size={20} />
                Send Feedback
              </>
            )}
          </button>
        </form>
      </div>

      <AccessCodeModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        organization={selectedOrg}
      />

      <GenericModal
        isOpen={genericModal.isOpen}
        onClose={() => setGenericModal({ ...genericModal, isOpen: false })}
        type={genericModal.type}
        title={genericModal.title}
        message={genericModal.message}
      />

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchOrganizations();
        }}
      />
    </div>
  );
};

export default Home;
