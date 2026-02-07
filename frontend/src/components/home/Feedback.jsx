import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

const Feedback = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
            setEmail('');
            setMessage('');
            setTimeout(() => setIsSubmitted(false), 3000);
        }, 1000);
    };

    return (
        <section className="py-20 relative bg-[#050511]">
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                                <MessageSquare size={24} />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                                    We Value Your Feedback
                                </span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Help us improve JustScan. Whether it's a feature request, bug report, or general thought, we want to hear from you.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Response time: ~24 hours
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                    placeholder="name@organization.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Message</label>
                                <textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all resize-none"
                                    placeholder="Tell us what you think..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                            >
                                {isSubmitted ? (
                                    "Thank You!"
                                ) : (
                                    <>
                                        Send Feedback <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Feedback;
