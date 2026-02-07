import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import AccessCodeModal from '../components/AccessCodeModal';
import CreateOrganizationModal from '../components/CreateOrganizationModal';
import { UserContext } from '../context/user.context';
import { ModalContext } from '../context/modal.context';
import { Shield, Plus, ArrowRight, Activity, Users, Database } from 'lucide-react';
import Testimonials from '../components/home/Testimonials';
import GenericModal from '../components/GenericModal';

const Home = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [genericModal, setGenericModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
  }, [location, organizations]); // Retrigger when orgs load

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

  return (
    <div className="pb-20 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Hero Section */}
      <div className="lg:flex items-center justify-between mb-20 mt-6 lg:mt-12">
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-emerald-400 font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Next-Gen <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 neon-glow">
              Identity Security
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Seamlessly verify student identities, track campus movement, and maintain secure logs with our intelligent scanning platform.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button onClick={() => document.getElementById('org-section').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] transition-all transform hover:-translate-y-1 flex items-center gap-2">
              Start Scanning <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 border border-white/10 bg-white/5 rounded-full font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-md">
              View Logs
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
          {/* <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl rounded-full" /> */}
          <div className="relative glass-panel p-8 rounded-2xl border border-white/10 transform rotate-[-5deg] hover:rotate-0 transition-all duration-500">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-xs text-gray-400 font-mono">LIVE FEED</div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-24 bg-gray-600 rounded-full" />
                    <div className="h-2 w-16 bg-gray-700 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Scanner Beam Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,1)] animate-scan-y opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">5,000+</div>
            <div className="text-sm text-gray-400">Verified Entries</div>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm text-gray-400">System Uptime</div>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
            <Database size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">Zero</div>
            <div className="text-sm text-gray-400">Data Breaches</div>
          </div>
        </div>
      </div>

      {/* Section Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm"></div>
      </div>

      {/* Features Section */}
      <div id="features" className="flex flex-col pt-0 pb-12 relative scroll-mt-32">
        {/* Background Elements for Features */}
        {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl -z-10" /> */}

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

            <h3 className="text-3xl font-bold text-white mb-4">Lightning<br />Fast OCR</h3>
            <p className="text-gray-400 leading-relaxed text-lg mb-4 flex-grow">
              Powered by an advanced Tesseract engine with custom pre-processing. Scan ID cards with 99% accuracy in under 200ms.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent mt-4 rounded-full" />
          </div>

          <div className="glass-panel p-10 rounded-[2rem] border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-2 duration-300 relative overflow-hidden group flex flex-col min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all"></div>

            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-8 font-bold group-hover:scale-110 transition-transform">
              <Shield size={32} />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">Enterprise<br />Security</h3>
            <p className="text-gray-400 leading-relaxed text-lg mb-4 flex-grow">
              Bank-grade encryption for all logs. Your campus data never leaves the secure environment. Fully compliant and safe.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent mt-4 rounded-full" />
          </div>

          <div className="glass-panel p-10 rounded-[2rem] border border-white/5 hover:border-green-500/30 transition-all hover:-translate-y-2 duration-300 relative overflow-hidden group flex flex-col min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-600/10 rounded-full blur-3xl group-hover:bg-green-600/20 transition-all"></div>

            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 mb-8 font-bold group-hover:scale-110 transition-transform">
              <Database size={32} />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">Real-time<br />Sync</h3>
            <p className="text-gray-400 leading-relaxed text-lg mb-4 flex-grow">
              Instant database updates across all devices. Monitor entry/exit logs as they happen with zero latency.
            </p>
            <div className="w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent mt-4 rounded-full" />
          </div>
        </div>
      </div>

      {/* Section Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm"></div>
      </div>

      {/* Organizations Section */}
      <div id="org-section" className="space-y-8 scroll-mt-48">
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h2 className="text-3xl font-bold">Trusted Organizations</h2>
            <p className="text-gray-400 mt-2">These organizations trust JustScan for their security.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center px-6 py-3 rounded-full cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-sm font-medium"
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

      <Testimonials />



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
